export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  unit: string;
  size?: string;
  attributes: ProductAttribute[];
  season?: string[];
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  organic?: boolean;
  dietaryTags?: string[];
  description?: string;
}

export type ProductAttribute =
  | 'organic'
  | 'dairy-free'
  | 'gluten-free'
  | 'vegan'
  | 'whole-grain'
  | 'low-fat'
  | 'sugar-free'
  | 'fresh'
  | 'frozen'
  | 'canned'
  | 'premium'
  | 'budget';

export interface ProductSearchFilters {
  query?: string;
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  attributes?: ProductAttribute[];
  organic?: boolean;
  sortBy?: 'price' | 'rating' | 'name' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductSubstitution {
  originalProductId: string;
  substituteProductId: string;
  reason: string;
  score: number;
}

export interface PantryItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedRemaining: number;
  lowStockThreshold?: number;
  expiryDate?: string;
  lastPurchasedAt: string;
  purchaseFrequencyDays: number;
  addedAt: string;
  updatedAt: string;
}
