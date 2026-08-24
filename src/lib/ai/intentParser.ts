import {
  ParsedIntent,
  IntentType,
  ExtractedEntities,
  SupportedLanguage,
} from '@/types/voice';
import {
  parseNumber,
  parseQuantityAndUnit,
  extractPriceConstraints,
  extractMultipleItems,
} from '@/lib/domain/numbers';
import {
  normalizeProductName,
} from '@/lib/domain/productNormalization';
import {
  normalizeUnit,
} from '@/lib/domain/numbers';
import { getCategoryForProduct } from '@/lib/constants/categories';

// Intent pattern definitions with priority ordering.
// Checked in order — first match wins.
// ORDER MATTERS: more specific intents first.
const intentPatterns: { intent: IntentType; patterns: RegExp[] }[] = [
  // Commands that start with action verbs (high specificity)
  {
    intent: 'CLEAR_LIST',
    patterns: [
      /(?:clear|empty|reset|wipe)\s+(?:the\s+)?(?:entire\s+)?(?:my\s+)?(?:list|cart)/i,
    ],
  },
  {
    intent: 'UNDO_LAST',
    patterns: [
      /(?:undo|go back|reverse|take that back|never mind|cancel)/i,
    ],
  },
  {
    intent: 'REMOVE_ITEM',
    patterns: [
      /(?:^|\b)(?:remove|delete|drop|cut|skip|lose|don't need)\s+(.+)/i,
      /take\s+(.+?)\s+(?:off|out|away)/i,
      /(?:^|\b)(?:don't(?: want| need)|no more)\s+(.+)/i,
      /(.+?)\s+hatao$/i,
    ],
  },
  {
    intent: 'UPDATE_ITEM',
    patterns: [
      /(?:^|\b)(?:change|update|modify|set|make it)\s+(.+?)\s+(?:to|as)\s+(.+)/i,
      /(?:bhai|yaar),?\s*(.+?)\s+ko\s+(.+?)\s+(?:kar|daal|badal)/i,
    ],
  },
  {
    intent: 'COMPLETE_ITEM',
    patterns: [
      /(?:^|\b)(?:mark|complete|done|bought|purchased|got)\s+(.+)/i,
      /(?:already (?:bought|got|have|purchased))\s+(.+)/i,
      /(.+?)\s+(?:khareed liya|le aaya|ban gaya)/i,
    ],
  },
  {
    intent: 'SHOW_LIST',
    patterns: [
      /(?:^|\b)(?:show|display|open|view|go to|take me to)\s+(?:my\s+)?(?:list|shopping list)/i,
      /list\s+dikhao|mera list/i,
    ],
  },
  // Navigation / query intents
  {
    intent: 'GET_HISTORY',
    patterns: [
      /(?:show|what's my|view|see)\s+(?:my\s+)?(?:history|past purchases|bought before|what did i buy)/i,
      /(?:what did i (?:buy|purchase)|bought before)/i,
      /(?:purana|history|kya kharida)/i,
    ],
  },
  {
    intent: 'GET_SEASONAL_ITEMS',
    patterns: [
      /(?:seasonal|in season|what's fresh|fresh items|seasonal items|what's in season)/i,
      /(?:mausam ka|taaza)\s+(?:kya hai|kuch)/i,
    ],
  },
  {
    intent: 'GET_SUBSTITUTES',
    patterns: [
      /(?:alternative|substitute|replace|different)\s+(?:for\s+)?(.+)/i,
      /(?:dairy.?free|vegan|organic)\s+(?:alternative|option|substitute)\s+(?:for\s+)?(.+)/i,
      /(.+?)\s+(?:ki jagah|badlo|alternative)/i,
      /(?:cheaper)\s+(?:alternative|option|substitute)\s+(?:for\s+)?(.+)/i,
    ],
  },
  {
    intent: 'GET_RECOMMENDATIONS',
    patterns: [
      /(?:what should (?:i|we) (?:buy|get)|what do (?:i|we) (?:normally|usually) (?:buy|get|need))/i,
      /(?:suggest|recommend|what am i missing|what do you suggest)/i,
      /(?:kya kharidna chahiye|sujhao|recommend)/i,
      /(?:what should i buy today|what do i normally buy this week)/i,
    ],
  },
  // Search / filter (checked before ADD to prevent "find X" being parsed as "add find X")
  // FILTER is checked FIRST — it's more specific than SEARCH
  {
    intent: 'FILTER_PRODUCTS',
    patterns: [
      /(?:find|show)\s+(?:the\s+)?(?:cheapest|largest|best|premium)\s+(.+)/i,
      /(?:only|filter|show only|just)\s+(?:show\s+)?(.+)/i,
    ],
  },
  {
    intent: 'SEARCH_PRODUCT',
    patterns: [
      /(?:find|search|look for|show me|show|where|what about)\s+(.+)/i,
      /(?:dhoondo|khojo|dikhao)\s+(.+)/i,
    ],
  },
  // Pantry intents — checked before ADD_ITEM to avoid "add X to pantry" being parsed as ADD_ITEM
  {
    intent: 'UPDATE_PANTRY',
    patterns: [
      /(?:we have|i have|there(?:'s| is)|mere paas)\s+(.+)\s+(?:left|remaining|bacha)/i,
      /(?:set|update)\s+(.+)\s+(?:pantry|stock|inventory)\s+(?:to|at)\s+(.+)/i,
    ],
  },
  {
    intent: 'ADD_PANTRY',
    patterns: [
      /(?:add|put|stock)\s+(.+)\s+(?:to\s+)?(?:pantry|fridge|stock|inventory)/i,
      /(?:pantry|fridge|stock)\s+(?:me(?:in|)?)\s+(?:.+\s+)?(?:add|daal|daalo)/i,
      /(?:pantry|fridge|stock)\s+me(?:in|)?\s+(.+)/i,
    ],
  },
  // ADD_ITEM is checked last — it's the catchiest intent
  {
    intent: 'ADD_ITEM',
    patterns: [
      /^\s*(?:add|put|include|get|buy|need|want|bring|pick up|grab|throw in|top up)\s+(.+)/i,
      /^\s*(?:i need|i want|i should get|can (?:i|you) (?:get|add|buy)|let me get|give me|fetch)\s+(.+)/i,
      /(?:mujhe|humko|lah(?:e|ye)|chahiye)\s+(.+)\s+(?:add|daal|daalo|karo|chahiye)\b/i,
      /(?:mujhe|humko|lah(?:e|ye)|chahiye)\s+(.+)/i,
      /(.+?)\s+(?:add|daal|daalo|karo|daal do|daal de)\s*(?:karna hai|kardo)?/i,
    ],
  },
];

// Detect language from text
function detectLanguage(text: string): SupportedLanguage {
  const hindiDevanagari = /[\u0900-\u097F]/;
  if (hindiDevanagari.test(text)) return 'hi';

  const hindiWords = [
    'mujhe', 'chahiye', 'karo', 'daal', 'daalo', 'karna', 'hai', 'aur',
    'bhai', 'yaar', 'doodh', 'kela', 'seb', 'tamatar', 'pyaz', 'aloo', 'aam', 'dahi',
    'bhi', 'bas', 'lekin', 'nahi', 'haan', 'sab', 'ye', 'woh', 'idhar', 'udhar',
  ];
  const words = text.toLowerCase().split(/\s+/);
  const hindiCount = words.filter((w) => hindiWords.includes(w)).length;
  if (hindiCount >= words.length * 0.4) return 'hi-en';

  return 'en';
}

/**
 * Parse a single item string into structured entities.
 */
function parseItemString(text: string): {
  name: string;
  quantity: number;
  unit: string;
  category: string;
} {
  const { quantity, unit } = parseQuantityAndUnit(text);
  // Strip quantity words and unit words from text before product normalization
  const cleaned = text
    .replace(/\b\d+\b/g, '')
    .replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|hundred)\b/gi, '')
    .replace(/\b(ek|do|teen|char|chaar|paanch|pach|chhe|che|saat|aath|nau|das|gyarah|barah|pandrah|bees|teees|chalees|pachas|sau)\b/gi, '')
    .replace(/\b(litre|liter|litres|liters|ml|kilogram|kilo|kg|kgs|kilos|gram|gms|gm|grams|dozen|piece|pieces|pcs|bottle|bottles|pack|packs|packet|packets|bag|bags|box|boxes|bar|bars|tube|tubes|jar|jars|roll|rolls|bunch|bunches)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const name = normalizeProductName(cleaned || text);
  const category = getCategoryForProduct(name);
  return { name, quantity, unit, category };
}

/**
 * Main intent parser — the NLP brain of the system.
 * Converts natural language text into a structured ParsedIntent.
 */
export function parseIntent(transcript: string): ParsedIntent {
  const language = detectLanguage(transcript);
  const text = transcript.trim();

  // Check intent patterns in priority order
  for (const { intent, patterns } of intentPatterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const entities = extractEntities(text, intent, match);
        return {
          intent,
          entities,
          rawTranscript: text,
          language,
          confidence: 0.85,
        };
      }
    }
  }

  // Default: if it looks like a short product name, treat as ADD
  const words = text.split(/\s+/);
  if (
    words.length <= 8 &&
    !text.match(
      /^(?:show|list|history|clear|undo|what|find|search|display)/i,
    )
  ) {
    const entities = extractEntities(text, 'ADD_ITEM', [text, text]);
    return {
      intent: 'ADD_ITEM',
      entities,
      rawTranscript: text,
      language,
      confidence: 0.6,
    };
  }

  return {
    intent: 'UNKNOWN_INTENT',
    entities: {},
    rawTranscript: text,
    language,
    confidence: 0.3,
  };
}

function extractEntities(
  text: string,
  intent: IntentType,
  match: RegExpMatchArray,
): ExtractedEntities {
  const entities: ExtractedEntities = {};
  const priceConstraints = extractPriceConstraints(text);

  switch (intent) {
    case 'ADD_ITEM': {
      const itemText = match[1] || text;
      const items = extractMultipleItems(itemText);

      if (items.length > 1) {
        entities.products = items.map((item) => {
          const parsed = parseItemString(item);
          return parsed.name;
        });
        const first = parseItemString(items[0]);
        entities.product = first.name;
        entities.quantity = first.quantity;
        entities.unit = first.unit;
        entities.category = first.category;
      } else {
        const parsed = parseItemString(items[0]);
        entities.product = parsed.name;
        entities.quantity = parsed.quantity;
        entities.unit = parsed.unit;
        entities.category = parsed.category;
      }

      // Extract brand
      const brandMatch = text.match(
        /(?:from|brand)\s+(\w+)/i,
      );
      if (brandMatch) entities.brand = brandMatch[1];

      // Dietary / attribute extraction
      if (text.match(/organic/i)) {
        entities.attributes = [...(entities.attributes || []), 'organic'];
      }
      if (text.match(/dairy.?free|vegan/i)) {
        entities.attributes = [...(entities.attributes || []), 'dairy-free'];
        entities.dietaryPreference = 'vegan';
      }

      Object.assign(entities, priceConstraints);
      break;
    }

    case 'REMOVE_ITEM': {
      const product = match[1] || text;
      entities.product = normalizeProductName(product);
      break;
    }

    case 'UPDATE_ITEM': {
      entities.product = normalizeProductName(match[1] || '');
      const valuePart = match[2] || '';
      const num = parseNumber(valuePart);
      if (num !== undefined) {
        entities.quantity = num;
        const { unit } = parseQuantityAndUnit(valuePart);
        if (unit !== 'pcs') entities.unit = normalizeUnit(unit);
      }
      break;
    }

    case 'COMPLETE_ITEM': {
      entities.product = normalizeProductName(match[1] || '');
      break;
    }

    case 'SEARCH_PRODUCT': {
      const search = match[1] || text;
      const parsed = parseItemString(search);
      entities.product = parsed.name;
      Object.assign(entities, priceConstraints);

      if (search.match(/organic/i)) {
        entities.attributes = ['organic'];
      }
      break;
    }

    case 'FILTER_PRODUCTS': {
      Object.assign(entities, priceConstraints);
      if (text.match(/organic/i)) entities.attributes = ['organic'];
      if (text.match(/cheapest|cheap|budget/i)) {
        entities.attributes = [...(entities.attributes || []), 'budget'];
      }
      if (text.match(/premium|best|top/i)) {
        entities.attributes = [...(entities.attributes || []), 'premium'];
      }

      // Brand filter
      const brands = [
        'tata', 'amul', 'haldiram', 'nestle', 'britannia', 'itc',
        'mccain', 'colgate', 'dettol', 'himalaya',
      ];
      for (const brand of brands) {
        if (text.toLowerCase().includes(brand)) {
          entities.brand =
            brand.charAt(0).toUpperCase() + brand.slice(1);
          break;
        }
      }
      break;
    }

    case 'GET_SUBSTITUTES': {
      entities.product = normalizeProductName(match[1] || '');
      if (text.match(/cheaper/i)) entities.priceMax = 100;
      if (text.match(/dairy.?free|vegan/i))
        entities.dietaryPreference = 'vegan';
      if (text.match(/organic/i)) {
        entities.attributes = ['organic'];
      }
      break;
    }

    case 'UPDATE_PANTRY': {
      // "We have one litre milk left" → match[1] = "one litre milk"
      const itemText = match[1] || text;
      const parsed = parseItemString(itemText);
      entities.product = parsed.name;
      entities.quantity = parsed.quantity;
      entities.unit = parsed.unit;
      entities.category = parsed.category;
      break;
    }

    case 'ADD_PANTRY': {
      // "Add milk to pantry" → match[1] = "milk"
      const itemText = match[1] || text;
      const parsed = parseItemString(itemText);
      entities.product = parsed.name;
      entities.quantity = parsed.quantity;
      entities.unit = parsed.unit;
      entities.category = parsed.category;
      break;
    }
  }

  return entities;
}

/**
 * Generate a natural language response for a parsed intent.
 */
export function generateResponse(intent: ParsedIntent): string {
  switch (intent.intent) {
    case 'ADD_ITEM': {
      if (
        intent.entities.products &&
        intent.entities.products.length > 1
      ) {
        const items = intent.entities.products.map((p) => {
          const parsed = parseItemString(p);
          const unitStr =
            parsed.unit === 'pcs' ? '' : `${parsed.unit} `;
          return `${parsed.quantity} ${unitStr}${parsed.name}`;
        });
        return `Added ${items.join(' and ')} to your list.`;
      }
      const q = intent.entities.quantity || 1;
      const u =
        intent.entities.unit === 'pcs'
          ? ''
          : `${intent.entities.unit} `;
      return `Added ${q} ${u}${intent.entities.product} to your list.`;
    }
    case 'REMOVE_ITEM':
      return `Removed ${intent.entities.product} from your list.`;
    case 'UPDATE_ITEM':
      return `Updated ${intent.entities.product} to ${intent.entities.quantity || ''} ${intent.entities.unit || ''}.`.trim();
    case 'COMPLETE_ITEM':
      return `Marked ${intent.entities.product} as purchased.`;
    case 'SEARCH_PRODUCT':
      return `Searching for ${intent.entities.product}...`;
    case 'GET_RECOMMENDATIONS':
      return 'Here are some suggestions based on your shopping habits.';
    case 'GET_SUBSTITUTES':
      return `Finding alternatives for ${intent.entities.product}...`;
    case 'GET_SEASONAL_ITEMS':
      return "Here's what's in season right now.";
    case 'UPDATE_PANTRY':
      return `Updated pantry for ${intent.entities.product || 'item'}.`;
    case 'ADD_PANTRY':
      return `Added ${intent.entities.product || 'item'} to your pantry.`;
    case 'UNDO_LAST':
      return 'Undone. What would you like to do?';
    case 'CLEAR_LIST':
      return 'Your list has been cleared.';
    case 'UNKNOWN_INTENT':
      return "I didn't quite understand that. Try adding an item or asking for suggestions.";
    default:
      return 'Done!';
  }
}
