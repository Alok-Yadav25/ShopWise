'use client';

import { useShoppingStore } from '@/store/shoppingStore';
import { parseIntent, generateResponse } from '@/lib/ai/intentParser';
import { findProductByName } from '@/data/products';
import { normalizeProductName } from '@/lib/domain/productNormalization';
import { getCategoryForProduct } from '@/lib/constants/categories';
import { parseQuantityAndUnit } from '@/lib/domain/numbers';
import type { IntentType } from '@/types/voice';

export interface CommandResult {
  success: boolean;
  message: string;
  intent: IntentType;
  data?: unknown;
  shouldSpeak: boolean;
}

/**
 * Parse an item text string into structured fields using centralized modules.
 */
function parseItemText(text: string): { name: string; quantity: number; unit: string; category: string } {
  let cleaned = text.trim();

  // Remove common noise words
  cleaned = cleaned
    .replace(/^(?:some|a |an |the |about |of |for |with )/i, '')
    .replace(/^(?:and |bhi |aur )/i, '')
    .trim();

  const { quantity, unit } = parseQuantityAndUnit(cleaned);
  const name = normalizeProductName(cleaned);
  const category = getCategoryForProduct(name);

  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    quantity,
    unit,
    category,
  };
}

/**
 * Get an estimated price for a product by name.
 */
function getEstimatedPrice(name: string): number {
  const product = findProductByName(name);
  return product?.price || 50;
}

/**
 * Execute a voice/text command and return a structured result.
 */
export function handleVoiceCommand(transcript: string): CommandResult {
  const intent = parseIntent(transcript);

  switch (intent.intent) {
    case 'ADD_ITEM':
      return handleAddItem(intent);
    case 'REMOVE_ITEM':
      return handleRemoveItem(intent);
    case 'UPDATE_ITEM':
      return handleUpdateItem(intent);
    case 'COMPLETE_ITEM':
      return handleCompleteItem(intent);
    case 'SEARCH_PRODUCT':
      return { success: true, message: generateResponse(intent), intent: intent.intent, shouldSpeak: false };
    case 'GET_RECOMMENDATIONS':
      return { success: true, message: generateResponse(intent), intent: intent.intent, shouldSpeak: true };
    case 'GET_SUBSTITUTES':
      return { success: true, message: generateResponse(intent), intent: intent.intent, shouldSpeak: false };
    case 'GET_SEASONAL_ITEMS':
      return { success: true, message: generateResponse(intent), intent: intent.intent, shouldSpeak: false };
    case 'SHOW_PANTRY':
      return { success: true, message: 'Opening your pantry.', intent: intent.intent, shouldSpeak: false };
    case 'UPDATE_PANTRY':
      return handleUpdatePantry(intent);
    case 'ADD_PANTRY':
      return handleAddPantry(intent);
    case 'GET_HISTORY':
      return { success: true, message: "Here's your purchase history.", intent: intent.intent, shouldSpeak: false };
    case 'UNDO_LAST': {
      const undone = useShoppingStore.getState().undoLast();
      return {
        success: undone,
        message: undone ? 'Done. I undid the last action.' : 'Nothing to undo.',
        intent: intent.intent,
        shouldSpeak: true,
      };
    }
    case 'CLEAR_LIST': {
      useShoppingStore.getState().clearList();
      return { success: true, message: 'Your list has been cleared.', intent: intent.intent, shouldSpeak: true };
    }
    case 'SHOW_LIST':
      return { success: true, message: 'Opening your shopping list.', intent: intent.intent, shouldSpeak: false };
    default:
      return {
        success: false,
        message: "I didn't quite understand that. Try adding an item, or ask for suggestions.",
        intent: 'UNKNOWN_INTENT',
        shouldSpeak: true,
      };
  }
}

function handleAddItem(intent: ReturnType<typeof parseIntent>): CommandResult {
  const { entities } = intent;
  const shoppingStore = useShoppingStore.getState();

  if (entities.products && entities.products.length > 1) {
    const items = entities.products.map(itemText => {
      const parsed = parseItemText(itemText);
      return {
        name: parsed.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        category: parsed.category,
        brand: entities.brand,
        estimatedPrice: getEstimatedPrice(parsed.name),
        priority: 'normal' as const,
      };
    });

    const added = shoppingStore.addMultipleItems(items);
    const names = added.map(i => i.name).join(' and ');
    return {
      success: true,
      message: `Added ${added.length} items: ${names}.`,
      intent: intent.intent,
      data: added,
      shouldSpeak: true,
    };
  }

  if (entities.product) {
    const product = findProductByName(entities.product);
    const name = entities.product.charAt(0).toUpperCase() + entities.product.slice(1);
    const estimatedPrice = product?.price || getEstimatedPrice(entities.product);

    const addedItem = shoppingStore.addItem({
      name,
      quantity: entities.quantity || 1,
      unit: entities.unit || 'pcs',
      category: entities.category || product?.category || getCategoryForProduct(entities.product),
      brand: entities.brand || product?.brand,
      estimatedPrice,
    });

    // Check if this was a merge (quantity > original request)
    if (addedItem.quantity > (entities.quantity || 1)) {
      return {
        success: true,
        message: `Updated ${name} — now ${addedItem.quantity} ${addedItem.unit}.`,
        intent: intent.intent,
        data: addedItem,
        shouldSpeak: true,
      };
    }

    const response = generateResponse(intent);
    return {
      success: true,
      message: response,
      intent: intent.intent,
      data: addedItem,
      shouldSpeak: true,
    };
  }

  return {
    success: false,
    message: "I didn't catch the product name. Try saying something like 'add milk'.",
    intent: intent.intent,
    shouldSpeak: true,
  };
}

function handleRemoveItem(intent: ReturnType<typeof parseIntent>): CommandResult {
  const product = normalizeProductName(intent.entities.product || '');
  const removed = useShoppingStore.getState().removeItem(product);
  return {
    success: removed,
    message: removed
      ? `Removed ${product} from your list.`
      : `I couldn't find "${intent.entities.product}" in your list.`,
    intent: intent.intent,
    shouldSpeak: true,
  };
}

function handleUpdateItem(intent: ReturnType<typeof parseIntent>): CommandResult {
  const product = normalizeProductName(intent.entities.product || '');
  const updates: Record<string, unknown> = {};
  if (intent.entities.quantity !== undefined) updates.quantity = intent.entities.quantity;
  if (intent.entities.unit !== undefined) updates.unit = intent.entities.unit;

  if (Object.keys(updates).length === 0) {
    return {
      success: false,
      message: `What would you like to change about ${product}?`,
      intent: intent.intent,
      shouldSpeak: true,
    };
  }

  const updated = useShoppingStore.getState().updateItem(product, updates);
  return {
    success: updated,
    message: updated
      ? `Updated ${product} to ${intent.entities.quantity || ''} ${intent.entities.unit || ''}.`.trim()
      : `I couldn't find "${intent.entities.product}" to update.`,
    intent: intent.intent,
    shouldSpeak: true,
  };
}

function handleCompleteItem(intent: ReturnType<typeof parseIntent>): CommandResult {
  const product = normalizeProductName(intent.entities.product || '');
  const completed = useShoppingStore.getState().completeItem(product);
  return {
    success: completed,
    message: completed
      ? `Marked ${product} as purchased.`
      : `I couldn't find "${intent.entities.product}" in your list.`,
    intent: intent.intent,
    shouldSpeak: true,
  };
}

function handleUpdatePantry(intent: ReturnType<typeof parseIntent>): CommandResult {
  const { entities } = intent;
  const store = useShoppingStore.getState();
  const product = normalizeProductName(entities.product || '');

  if (!product) {
    return {
      success: false,
      message: "Which product's pantry stock should I update?",
      intent: intent.intent,
      shouldSpeak: true,
    };
  }

  const quantity = entities.quantity || 1;
  const unit = entities.unit || 'pcs';
  const category = entities.category || getCategoryForProduct(product);

  // Find existing pantry item
  const existing = store.pantryItems.find(
    i => i.productName.toLowerCase() === product.toLowerCase()
  );

  if (existing) {
    store.updatePantryQuantity(existing.id, quantity);
    return {
      success: true,
      message: `Updated ${product} pantry stock to ${quantity} ${unit}.`,
      intent: intent.intent,
      shouldSpeak: true,
    };
  }

  // Add new pantry item
  store.addPantryItem({
    productId: '',
    productName: product,
    category,
    quantity,
    unit,
    estimatedRemaining: quantity,
    lastPurchasedAt: new Date().toISOString(),
    purchaseFrequencyDays: 7,
    lowStockThreshold: 1,
  });

  return {
    success: true,
    message: `Added ${product} to your pantry with ${quantity} ${unit}.`,
    intent: intent.intent,
    shouldSpeak: true,
  };
}

function handleAddPantry(intent: ReturnType<typeof parseIntent>): CommandResult {
  const { entities } = intent;
  const store = useShoppingStore.getState();
  const product = normalizeProductName(entities.product || '');

  if (!product) {
    return {
      success: false,
      message: "Which product should I add to your pantry?",
      intent: intent.intent,
      shouldSpeak: true,
    };
  }

  const quantity = entities.quantity || 1;
  const unit = entities.unit || 'pcs';
  const category = entities.category || getCategoryForProduct(product);

  store.addPantryItem({
    productId: '',
    productName: product,
    category,
    quantity,
    unit,
    estimatedRemaining: quantity,
    lastPurchasedAt: new Date().toISOString(),
    purchaseFrequencyDays: 7,
    lowStockThreshold: 1,
  });

  return {
    success: true,
    message: `Added ${product} to your pantry.`,
    intent: intent.intent,
    shouldSpeak: true,
  };
}
