import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShoppingItem, CommandHistoryEntry, ItemStatus, Priority } from '@/types/shopping';
import { PantryItem } from '@/types/product';
import { generateId } from '@/lib/domain/ids';
import { areSameProduct, mergeQuantities } from '@/lib/domain/productNormalization';

// Undo action types
interface UndoAction {
  type: 'add' | 'remove' | 'update' | 'complete' | 'clear';
  items: ShoppingItem[];
  timestamp: string;
}

interface ShoppingState {
  items: ShoppingItem[];
  commandHistory: CommandHistoryEntry[];
  undoStack: UndoAction[];
  lastRemovedItem: ShoppingItem | null;
  pantryItems: PantryItem[];
  activeListId: string | null;

  // Local-only optimistic actions (API calls happen in components)
  addItem: (item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'priority'>) => ShoppingItem;
  addMultipleItems: (items: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'priority'>[]) => ShoppingItem[];
  removeItem: (name: string) => boolean;
  removeItemById: (id: string) => boolean;
  updateItem: (name: string, updates: Partial<ShoppingItem>) => boolean;
  completeItem: (name: string) => boolean;
  clearList: () => void;
  undoLast: () => boolean;
  setItemPriority: (id: string, priority: Priority) => void;
  getPendingItems: () => ShoppingItem[];
  getCompletedItems: () => ShoppingItem[];
  getItemsByCategory: () => Record<string, ShoppingItem[]>;
  getEstimatedTotal: () => { total: number; itemsWithPrice: number; itemsWithoutPrice: number };
  addCommandHistory: (entry: Omit<CommandHistoryEntry, 'id' | 'timestamp'>) => void;

  // Pantry actions
  addPantryItem: (item: Omit<PantryItem, 'id' | 'addedAt' | 'updatedAt'>) => void;
  updatePantryQuantity: (id: string, quantity: number) => void;
  removePantryItem: (id: string) => void;
  getRunningLowPantryItems: () => PantryItem[];

  // Bulk set from API
  setItems: (items: ShoppingItem[]) => void;
  setPantryItems: (items: PantryItem[]) => void;
  setActiveListId: (id: string | null) => void;

  // Reset
  resetAll: () => void;
}

const MAX_UNDO_STACK = 20;

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      items: [],
      commandHistory: [],
      undoStack: [],
      lastRemovedItem: null,
      pantryItems: [],
      activeListId: null,

      addItem: (itemData) => {
        const state = get();
        const now = new Date().toISOString();
        const p = (itemData as Record<string, unknown>).priority as Priority | undefined;

        // Duplicate detection
        const existingIndex = state.items.findIndex(
          i => i.status === 'pending' && areSameProduct(i.name, itemData.name)
        );

        if (existingIndex !== -1) {
          const existing = state.items[existingIndex];
          const brandsCompatible = !existing.brand || !itemData.brand || existing.brand === itemData.brand;

          if (brandsCompatible) {
            const merged = mergeQuantities(
              existing.quantity, existing.unit,
              itemData.quantity || 1, itemData.unit || 'pcs'
            );

            if (merged) {
              const updatedItems = [...state.items];
              updatedItems[existingIndex] = {
                ...existing,
                quantity: merged.quantity,
                unit: merged.unit,
                estimatedPrice: itemData.estimatedPrice || existing.estimatedPrice,
                updatedAt: now,
              };

              const undoStack = [{ type: 'update' as const, items: [existing], timestamp: now }, ...state.undoStack].slice(0, MAX_UNDO_STACK);
              set({ items: updatedItems, undoStack });
              return updatedItems[existingIndex];
            }
          }
        }

        const item: ShoppingItem = {
          ...itemData,
          id: generateId(),
          status: 'pending',
          priority: p || 'normal',
          createdAt: now,
          updatedAt: now,
        };

        const undoStack = [{ type: 'add' as const, items: [item], timestamp: now }, ...state.undoStack].slice(0, MAX_UNDO_STACK);
        set({ items: [...state.items, item], undoStack });
        return item;
      },

      addMultipleItems: (itemsData) => {
        const state = get();
        const now = new Date().toISOString();
        const addedItems: ShoppingItem[] = [];
        let currentItems = [...state.items];

        for (const data of itemsData) {
          const p = (data as Record<string, unknown>).priority as Priority | undefined;

          const existingIndex = currentItems.findIndex(
            i => i.status === 'pending' && areSameProduct(i.name, data.name)
          );

          if (existingIndex !== -1) {
            const existing = currentItems[existingIndex];
            const brandsCompatible = !existing.brand || !data.brand || existing.brand === data.brand;
            if (brandsCompatible) {
              const merged = mergeQuantities(
                existing.quantity, existing.unit,
                data.quantity || 1, data.unit || 'pcs'
              );
              if (merged) {
                currentItems = [...currentItems];
                currentItems[existingIndex] = {
                  ...existing,
                  quantity: merged.quantity,
                  unit: merged.unit,
                  estimatedPrice: data.estimatedPrice || existing.estimatedPrice,
                  updatedAt: now,
                };
                addedItems.push(currentItems[existingIndex]);
                continue;
              }
            }
          }

          const item: ShoppingItem = {
            ...data,
            id: generateId(),
            status: 'pending',
            priority: p || 'normal',
            createdAt: now,
            updatedAt: now,
          };
          currentItems = [...currentItems, item];
          addedItems.push(item);
        }

        set({ items: currentItems });
        return addedItems;
      },

      removeItem: (name) => {
        const state = get();
        const item = state.items.find(i => i.name.toLowerCase() === name.toLowerCase());
        if (!item) return false;

        const now = new Date().toISOString();
        const newItems = state.items.filter(i => i.id !== item.id);
        const undoStack = [{ type: 'remove' as const, items: [item], timestamp: now }, ...state.undoStack].slice(0, MAX_UNDO_STACK);
        set({ items: newItems, lastRemovedItem: item, undoStack });
        return true;
      },

      removeItemById: (id) => {
        const state = get();
        const item = state.items.find(i => i.id === id);
        if (!item) return false;

        const now = new Date().toISOString();
        const newItems = state.items.filter(i => i.id !== id);
        const undoStack = [{ type: 'remove' as const, items: [item], timestamp: now }, ...state.undoStack].slice(0, MAX_UNDO_STACK);
        set({ items: newItems, lastRemovedItem: item, undoStack });
        return true;
      },

      updateItem: (name, updates) => {
        const state = get();
        const itemIndex = state.items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
        if (itemIndex === -1) return false;

        const now = new Date().toISOString();
        const oldItem = state.items[itemIndex];
        const updatedItems = [...state.items];
        updatedItems[itemIndex] = { ...oldItem, ...updates, updatedAt: now };

        const undoStack = [{ type: 'update' as const, items: [oldItem], timestamp: now }, ...state.undoStack].slice(0, MAX_UNDO_STACK);
        set({ items: updatedItems, undoStack });
        return true;
      },

      completeItem: (name) => {
        const state = get();
        const itemIndex = state.items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
        if (itemIndex === -1) return false;

        const now = new Date().toISOString();
        const oldItem = state.items[itemIndex];
        const updatedItems = [...state.items];
        updatedItems[itemIndex] = { ...oldItem, status: 'completed', completedAt: now, updatedAt: now };

        const undoStack = [{ type: 'complete' as const, items: [oldItem], timestamp: now }, ...state.undoStack].slice(0, MAX_UNDO_STACK);
        set({ items: updatedItems, undoStack });
        return true;
      },

      clearList: () => {
        const state = get();
        const now = new Date().toISOString();
        const pendingItems = state.items.filter(i => i.status === 'pending');
        const undoStack = [{ type: 'clear' as const, items: pendingItems, timestamp: now }, ...state.undoStack].slice(0, MAX_UNDO_STACK);
        set({ items: state.items.filter(i => i.status === 'completed'), undoStack });
      },

      undoLast: () => {
        const state = get();
        if (state.undoStack.length === 0) return false;

        const [action, ...restStack] = state.undoStack;

        switch (action.type) {
          case 'add': {
            const idsToRemove = new Set(action.items.map(i => i.id));
            set({ items: state.items.filter(i => !idsToRemove.has(i.id)), undoStack: restStack });
            break;
          }
          case 'remove': {
            set({ items: [...state.items, ...action.items], undoStack: restStack });
            break;
          }
          case 'update': {
            const restoreMap = new Map(action.items.map(i => [i.id, i]));
            set({ items: state.items.map(i => restoreMap.get(i.id) || i), undoStack: restStack });
            break;
          }
          case 'complete': {
            const restoreMap = new Map(action.items.map(i => [i.id, { ...i, status: 'pending' as ItemStatus, completedAt: undefined }]));
            set({ items: state.items.map(i => restoreMap.get(i.id) || i), undoStack: restStack });
            break;
          }
          case 'clear': {
            set({ items: [...state.items, ...action.items], undoStack: restStack });
            break;
          }
          default:
            return false;
        }

        set({ lastRemovedItem: null });
        return true;
      },

      setItemPriority: (id, priority) => {
        const state = get();
        set({
          items: state.items.map(item =>
            item.id === id ? { ...item, priority, updatedAt: new Date().toISOString() } : item
          ),
        });
      },

      getPendingItems: () => get().items.filter(i => i.status === 'pending'),
      getCompletedItems: () => get().items.filter(i => i.status === 'completed'),

      getItemsByCategory: () => {
        const items = get().items.filter(i => i.status !== 'removed');
        const grouped: Record<string, ShoppingItem[]> = {};
        for (const item of items) {
          if (!grouped[item.category]) grouped[item.category] = [];
          grouped[item.category].push(item);
        }
        return grouped;
      },

      getEstimatedTotal: () => {
        const pending = get().items.filter(i => i.status === 'pending');
        let total = 0;
        let itemsWithPrice = 0;
        let itemsWithoutPrice = 0;
        for (const item of pending) {
          if (item.estimatedPrice) {
            total += item.estimatedPrice * item.quantity;
            itemsWithPrice++;
          } else {
            itemsWithoutPrice++;
          }
        }
        return { total, itemsWithPrice, itemsWithoutPrice };
      },

      addCommandHistory: (entry) => {
        set(state => ({
          commandHistory: [
            { ...entry, id: generateId(), timestamp: new Date().toISOString() },
            ...state.commandHistory,
          ].slice(0, 50),
        }));
      },

      addPantryItem: (itemData) => {
        const now = new Date().toISOString();
        const item: PantryItem = {
          ...itemData,
          id: generateId(),
          addedAt: now,
          updatedAt: now,
        };
        set(state => ({ pantryItems: [...state.pantryItems, item] }));
      },

      updatePantryQuantity: (id, quantity) => {
        set(state => ({
          pantryItems: state.pantryItems.map(item =>
            item.id === id
              ? { ...item, quantity, estimatedRemaining: quantity, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      removePantryItem: (id) => {
        set(state => ({
          pantryItems: state.pantryItems.filter(item => item.id !== id),
        }));
      },

      getRunningLowPantryItems: () => {
        return get().pantryItems.filter(item => {
          const threshold = item.lowStockThreshold || 1;
          return item.estimatedRemaining <= threshold;
        });
      },

      setItems: (items) => set({ items }),
      setPantryItems: (items) => set({ pantryItems: items }),
      setActiveListId: (id) => set({ activeListId: id }),

      resetAll: () => {
        set({
          items: [],
          commandHistory: [],
          undoStack: [],
          lastRemovedItem: null,
          pantryItems: [],
          activeListId: null,
        });
      },
    }),
    {
      name: 'shopwise-shopping',
      version: 1,
      partialize: (state) => ({
        items: state.items.slice(0, 100),
        commandHistory: state.commandHistory.slice(0, 50),
        pantryItems: state.pantryItems,
        activeListId: state.activeListId,
      }),
    }
  )
);
