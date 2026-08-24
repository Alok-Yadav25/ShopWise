export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'success' | 'error';

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  language: string;
  isFinal: boolean;
}

export type IntentType =
  | 'ADD_ITEM'
  | 'REMOVE_ITEM'
  | 'UPDATE_ITEM'
  | 'COMPLETE_ITEM'
  | 'SEARCH_PRODUCT'
  | 'FILTER_PRODUCTS'
  | 'GET_RECOMMENDATIONS'
  | 'GET_HISTORY'
  | 'GET_SUBSTITUTES'
  | 'GET_SEASONAL_ITEMS'
  | 'CLEAR_LIST'
  | 'SHOW_LIST'
  | 'SHOW_PANTRY'
  | 'ADD_PANTRY'
  | 'UPDATE_PANTRY'
  | 'UNDO_LAST'
  | 'CREATE_SESSION'
  | 'SWITCH_SESSION'
  | 'CONVERSATION'
  | 'UNKNOWN_INTENT';

export interface ParsedIntent {
  intent: IntentType;
  entities: ExtractedEntities;
  rawTranscript: string;
  language: SupportedLanguage;
  confidence: number;
}

export interface ExtractedEntities {
  product?: string;
  products?: string[];
  quantity?: number;
  unit?: string;
  brand?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  dietaryPreference?: string;
  size?: string;
  attributes?: string[];
  substituteFor?: string;
  sessionId?: string;
  conversationContext?: string;
}

export type SupportedLanguage = 'en' | 'hi' | 'hi-en';

export interface VoiceConfig {
  language: SupportedLanguage;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface AIResponse {
  text: string;
  action?: VoiceAction;
  followUpSuggestions?: string[];
}

export interface VoiceAction {
  type: string;
  payload: Record<string, unknown>;
}
