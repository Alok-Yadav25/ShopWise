export type ItemStatus = 'pending' | 'in_cart' | 'completed' | 'removed';
export type Priority = 'need_soon' | 'normal' | 'optional';

export interface ShoppingItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  brand?: string;
  status: ItemStatus;
  priority: Priority;
  estimatedPrice?: number;
  notes?: string;
  isFavorite?: boolean;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface ShoppingSession {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseHistory {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  purchasedAt: string;
}

export interface CommandHistoryEntry {
  id: string;
  command: string;
  intent: string;
  result: string;
  timestamp: string;
  undone?: boolean;
}
