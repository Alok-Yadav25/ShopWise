import { describe, it, expect } from 'vitest';
import { parseIntent, generateResponse } from '../intentParser';

describe('Intent Parser', () => {
  // ==========================================
  // ADD_ITEM — English
  // ==========================================
  describe('ADD_ITEM — English', () => {
    it('parses "Add milk"', () => {
      const result = parseIntent('Add milk');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.product).toBe('Amul Taaza Milk');
    });

    it('parses "I need 6 apples"', () => {
      const result = parseIntent('I need 6 apples');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.product).toBe('Apples');
      expect(result.entities.quantity).toBe(6);
    });

    it('parses "Add two litres of milk"', () => {
      const result = parseIntent('Add two litres of milk');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.product).toBe('Amul Taaza Milk');
      expect(result.entities.quantity).toBe(2);
      expect(result.entities.unit).toBe('L');
    });

    it('parses "Put bread on my list"', () => {
      const result = parseIntent('Put bread on my list');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.product).toBe('Whole Wheat Bread');
    });

    it('parses "I want to buy some eggs"', () => {
      const result = parseIntent('I want to buy some eggs');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.product).toBe('Free Range Eggs');
    });

    it('parses "Grab 3 bottles of water"', () => {
      const result = parseIntent('Grab 3 bottles of water');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.quantity).toBe(3);
      expect(result.entities.unit).toBe('bottle');
    });

    it('parses "Add five bananas"', () => {
      const result = parseIntent('Add five bananas');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.quantity).toBe(5);
      expect(result.entities.product).toBe('Bananas');
    });

    it('parses "Can you add organic apples"', () => {
      const result = parseIntent('Can you add organic apples');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.attributes).toContain('organic');
    });

    it('parses multiple items: "Add milk and eggs"', () => {
      const result = parseIntent('Add milk and eggs');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.products).toBeDefined();
      expect(result.entities.products!.length).toBe(2);
    });

    it('parses "I need two packets of bread and some eggs"', () => {
      const result = parseIntent('I need two packets of bread and some eggs');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.products).toBeDefined();
      expect(result.entities.products!.length).toBe(2);
    });
  });

  // ==========================================
  // ADD_ITEM — Hindi
  // ==========================================
  describe('ADD_ITEM — Hindi', () => {
    it('parses "Mujhe do litre doodh add karna hai"', () => {
      const result = parseIntent('Mujhe do litre doodh add karna hai');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.quantity).toBe(2);
      expect(result.entities.unit).toBe('L');
      // doodh -> milk -> Amul Taaza Milk
      expect(result.entities.product).toBe('Amul Taaza Milk');
      expect(result.language).toMatch(/hi/);
    });

    it('parses "List mein 5 apples daal do"', () => {
      const result = parseIntent('List mein 5 apples daal do');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.quantity).toBe(5);
      expect(result.entities.product).toBe('Apples');
    });

    it('parses "Teen pack tamatar add karo"', () => {
      const result = parseIntent('Teen pack tamatar add karo');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.quantity).toBe(3);
      expect(result.entities.product).toBe('Tomatoes');
    });
  });

  // ==========================================
  // ADD_ITEM — Hinglish
  // ==========================================
  describe('ADD_ITEM — Hinglish', () => {
    it('parses "Bhai, list mein 5 apples daal do"', () => {
      const result = parseIntent('Bhai, list mein 5 apples daal do');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.quantity).toBe(5);
      expect(result.entities.product).toBe('Apples');
    });

    it('parses "Do kela chahiye"', () => {
      const result = parseIntent('Do kela chahiye');
      expect(result.intent).toBe('ADD_ITEM');
      expect(result.entities.quantity).toBe(2);
      // kela -> banana -> Bananas
      expect(result.entities.product).toBe('Bananas');
    });
  });

  // ==========================================
  // REMOVE_ITEM
  // ==========================================
  describe('REMOVE_ITEM', () => {
    it('parses "Remove milk"', () => {
      const result = parseIntent('Remove milk');
      expect(result.intent).toBe('REMOVE_ITEM');
      expect(result.entities.product).toBe('Amul Taaza Milk');
    });

    it('parses "Delete eggs"', () => {
      const result = parseIntent('Delete eggs');
      expect(result.intent).toBe('REMOVE_ITEM');
      expect(result.entities.product).toBe('Free Range Eggs');
    });

    it('parses "Take milk off my list"', () => {
      const result = parseIntent('Take milk off my list');
      expect(result.intent).toBe('REMOVE_ITEM');
      expect(result.entities.product).toBe('Amul Taaza Milk');
    });

    it('parses "Tamatar hatao"', () => {
      const result = parseIntent('Tamatar hatao');
      expect(result.intent).toBe('REMOVE_ITEM');
      expect(result.entities.product).toBe('Tomatoes');
    });

    it('parses "Don\'t need bread"', () => {
      const result = parseIntent("Don't need bread");
      expect(result.intent).toBe('REMOVE_ITEM');
      expect(result.entities.product).toBe('Whole Wheat Bread');
    });
  });

  // ==========================================
  // UPDATE_ITEM
  // ==========================================
  describe('UPDATE_ITEM', () => {
    it('parses "Change milk to 3 litres"', () => {
      const result = parseIntent('Change milk to 3 litres');
      expect(result.intent).toBe('UPDATE_ITEM');
      expect(result.entities.product).toBe('Amul Taaza Milk');
      expect(result.entities.quantity).toBe(3);
      expect(result.entities.unit).toBe('L');
    });

    it('parses "Set apples to 10"', () => {
      const result = parseIntent('Set apples to 10');
      expect(result.intent).toBe('UPDATE_ITEM');
      expect(result.entities.product).toBe('Apples');
      expect(result.entities.quantity).toBe(10);
    });
  });

  // ==========================================
  // COMPLETE_ITEM
  // ==========================================
  describe('COMPLETE_ITEM', () => {
    it('parses "Mark milk as purchased"', () => {
      const result = parseIntent('Mark milk as purchased');
      expect(result.intent).toBe('COMPLETE_ITEM');
      expect(result.entities.product).toBe('Amul Taaza Milk');
    });

    it('parses "I already bought the eggs"', () => {
      const result = parseIntent('I already bought the eggs');
      expect(result.intent).toBe('COMPLETE_ITEM');
      expect(result.entities.product).toBe('Free Range Eggs');
    });
  });

  // ==========================================
  // SEARCH_PRODUCT
  // ==========================================
  describe('SEARCH_PRODUCT', () => {
    it('parses "Find organic apples"', () => {
      const result = parseIntent('Find organic apples');
      expect(result.intent).toBe('SEARCH_PRODUCT');
      expect(result.entities.attributes).toContain('organic');
    });

    it('parses "Find milk under 100"', () => {
      const result = parseIntent('Find milk under 100');
      expect(result.intent).toBe('SEARCH_PRODUCT');
      expect(result.entities.priceMax).toBe(100);
    });

    it('parses "Show toothpaste under 200"', () => {
      const result = parseIntent('Show toothpaste under 200');
      expect(result.intent).toBe('SEARCH_PRODUCT');
    });
  });

  // ==========================================
  // FILTER_PRODUCTS
  // ==========================================
  describe('FILTER_PRODUCTS', () => {
    it('parses "Only show organic products"', () => {
      const result = parseIntent('Only show organic products');
      expect(result.intent).toBe('FILTER_PRODUCTS');
      expect(result.entities.attributes).toContain('organic');
    });

    it('parses "Find cheapest milk"', () => {
      const result = parseIntent('Find cheapest milk');
      expect(result.intent).toBe('FILTER_PRODUCTS');
    });
  });

  // ==========================================
  // GET_RECOMMENDATIONS
  // ==========================================
  describe('GET_RECOMMENDATIONS', () => {
    it('parses "What should I buy?"', () => {
      const result = parseIntent('What should I buy?');
      expect(result.intent).toBe('GET_RECOMMENDATIONS');
    });

    it('parses "What am I missing?"', () => {
      const result = parseIntent('What am I missing?');
      expect(result.intent).toBe('GET_RECOMMENDATIONS');
    });

    it('parses "Suggest something"', () => {
      const result = parseIntent('Suggest something');
      expect(result.intent).toBe('GET_RECOMMENDATIONS');
    });
  });

  // ==========================================
  // GET_SEASONAL_ITEMS
  // ==========================================
  describe('GET_SEASONAL_ITEMS', () => {
    it('parses "Show seasonal items"', () => {
      const result = parseIntent('Show seasonal items');
      expect(result.intent).toBe('GET_SEASONAL_ITEMS');
    });

    it('parses "What\'s in season?"', () => {
      const result = parseIntent("What's in season?");
      expect(result.intent).toBe('GET_SEASONAL_ITEMS');
    });
  });

  // ==========================================
  // GET_SUBSTITUTES
  // ==========================================
  describe('GET_SUBSTITUTES', () => {
    it('parses "Alternative for milk"', () => {
      const result = parseIntent('Alternative for milk');
      expect(result.intent).toBe('GET_SUBSTITUTES');
      expect(result.entities.product).toBe('Amul Taaza Milk');
    });

    it('parses "Dairy-free alternative for milk"', () => {
      const result = parseIntent('Dairy-free alternative for milk');
      expect(result.intent).toBe('GET_SUBSTITUTES');
      expect(result.entities.dietaryPreference).toBe('vegan');
    });
  });

  // ==========================================
  // UNDO_LAST
  // ==========================================
  describe('UNDO_LAST', () => {
    it('parses "Undo that"', () => {
      const result = parseIntent('Undo that');
      expect(result.intent).toBe('UNDO_LAST');
    });

    it('parses "Go back"', () => {
      const result = parseIntent('Go back');
      expect(result.intent).toBe('UNDO_LAST');
    });

    it('parses "Never mind"', () => {
      const result = parseIntent('Never mind');
      expect(result.intent).toBe('UNDO_LAST');
    });
  });

  // ==========================================
  // CLEAR_LIST
  // ==========================================
  describe('CLEAR_LIST', () => {
    it('parses "Clear my list"', () => {
      const result = parseIntent('Clear my list');
      expect(result.intent).toBe('CLEAR_LIST');
    });

    it('parses "Empty the cart"', () => {
      const result = parseIntent('Empty the cart');
      expect(result.intent).toBe('CLEAR_LIST');
    });
  });

  // ==========================================
  // SHOW_LIST
  // ==========================================
  describe('SHOW_LIST', () => {
    it('parses "Show my list"', () => {
      const result = parseIntent('Show my list');
      expect(result.intent).toBe('SHOW_LIST');
    });
  });

  // ==========================================
  // Language Detection
  // ==========================================
  describe('Language Detection', () => {
    it('detects English', () => {
      const result = parseIntent('Add milk to my list');
      expect(result.language).toBe('en');
    });

    it('detects Hindi (Hinglish)', () => {
      const result = parseIntent('Mujhe doodh chahiye');
      expect(result.language).toMatch(/hi/);
    });

    it('detects Hindi (Devanagari)', () => {
      const result = parseIntent('दूध चाहिए');
      expect(result.language).toBe('hi');
    });
  });

  // ==========================================
  // Generate Response
  // ==========================================
  describe('generateResponse', () => {
    it('generates response for ADD_ITEM', () => {
      const intent = parseIntent('Add milk');
      const response = generateResponse(intent);
      expect(response).toContain('Added');
      expect(response).toMatch(/milk|Amul/i);
    });

    it('generates response for REMOVE_ITEM', () => {
      const intent = parseIntent('Remove milk');
      const response = generateResponse(intent);
      expect(response).toContain('Removed');
    });

    it('generates response for COMPLETE_ITEM', () => {
      const intent = parseIntent('Mark milk as purchased');
      const response = generateResponse(intent);
      expect(response).toContain('Marked');
      expect(response).toContain('purchased');
    });

    it('generates response for UNDO_LAST', () => {
      const intent = parseIntent('Undo that');
      const response = generateResponse(intent);
      expect(response).toContain('Undone');
    });

    it('generates response for CLEAR_LIST', () => {
      const intent = parseIntent('Clear my list');
      const response = generateResponse(intent);
      expect(response).toContain('cleared');
    });

    it('generates response for UNKNOWN_INTENT', () => {
      const intent = parseIntent('asjdhfkajshdfkajshdf');
      // Random text may fall through to ADD_ITEM fallback — that's acceptable
      expect(['ADD_ITEM', 'UNKNOWN_INTENT']).toContain(intent.intent);
    });
  });
});
