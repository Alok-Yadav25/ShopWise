export type ShoppingInsightType = 'frequency' | 'spending' | 'category' | 'seasonal';

export interface Recommendation {
  id: string;
  productName: string;
  category: string;
  reason: string;
  score: number;
  type: 'frequency' | 'seasonal' | 'pantry' | 'substitute' | 'habit' | 'trending';
  estimatedPrice?: number;
  urgency: 'high' | 'medium' | 'low';
  purchaseFrequencyDays?: number;
  lastPurchasedDaysAgo?: number;
}

export interface SeasonalPick {
  productName: string;
  category: string;
  season: string;
  month: number[];
  region?: string;
  description: string;
}

export interface ShoppingInsight {
  label: string;
  value: string;
  description: string;
  type?: ShoppingInsightType;
}

export interface SubstitutionSuggestion {
  originalProduct: string;
  substituteProduct: string;
  substituteBrand?: string;
  price: number;
  reason: string;
  attributes?: string[];
  score: number;
}
