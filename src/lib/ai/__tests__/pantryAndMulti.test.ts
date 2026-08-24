import { describe, it, expect } from 'vitest';
import { parseIntent } from '../intentParser';
import { mergeQuantities, areSameProduct, normalizeProductName } from '@/lib/domain/productNormalization';
import { parseQuantityAndUnit } from '@/lib/domain/numbers';
import { extractMultipleItems } from '@/lib/domain/numbers';

describe('Pantry Commands', () => {
  it('parses "We have one litre milk left"', () => {
    const r = parseIntent('We have one litre milk left');
    expect(r.intent).toBe('UPDATE_PANTRY');
    expect(r.entities.quantity).toBe(1);
  });

  it('parses "We have 500 ml milk left"', () => {
    const r = parseIntent('We have 500 ml milk left');
    expect(r.intent).toBe('UPDATE_PANTRY');
    expect(r.entities.quantity).toBe(500);
  });

  it('parses "I have 3 eggs left"', () => {
    const r = parseIntent('I have 3 eggs left');
    expect(r.intent).toBe('UPDATE_PANTRY');
    expect(r.entities.quantity).toBe(3);
  });

  it('parses "Add milk to pantry"', () => {
    const r = parseIntent('Add milk to pantry');
    expect(r.intent).toBe('ADD_PANTRY');
  });

  it('parses "Pantry mein doodh daal do"', () => {
    const r = parseIntent('Pantry mein doodh daal do');
    expect(r.intent).toBe('ADD_PANTRY');
  });
});

describe('Unit Merging', () => {
  it('merges litre + ml correctly', () => {
    const result = mergeQuantities(1, 'L', 500, 'ml');
    expect(result).toEqual({ quantity: 1.5, unit: 'L' });
  });

  it('merges same units', () => {
    const result = mergeQuantities(2, 'kg', 3, 'kg');
    expect(result).toEqual({ quantity: 5, unit: 'kg' });
  });

  it('merges pack + pack', () => {
    const result = mergeQuantities(1, 'pack', 2, 'pack');
    expect(result).toEqual({ quantity: 3, unit: 'pack' });
  });

  it('rejects incompatible families', () => {
    const result = mergeQuantities(1, 'L', 1, 'kg');
    expect(result).toBeNull();
  });

  it('converts kg to g when total < 1kg', () => {
    const result = mergeQuantities(200, 'g', 300, 'g');
    expect(result).toEqual({ quantity: 500, unit: 'g' });
  });

  it('converts g to kg when total >= 1000g', () => {
    const result = mergeQuantities(600, 'g', 500, 'g');
    expect(result).toEqual({ quantity: 1.1, unit: 'kg' });
  });
});

describe('Product Identity', () => {
  it('recognizes same product with different names', () => {
    expect(areSameProduct('milk', 'Milk')).toBe(true);
    expect(areSameProduct('apples', 'Apples')).toBe(true);
  });

  it('normalizes Hindi product names', () => {
    expect(normalizeProductName('doodh')).toBe('Amul Taaza Milk');
    expect(normalizeProductName('tamatar')).toBe('Tomatoes');
    expect(normalizeProductName('kela')).toBe('Bananas');
  });

  it('recognizes different products', () => {
    expect(areSameProduct('milk', 'bread')).toBe(false);
  });
});

describe('Multi-Item Extraction', () => {
  it('splits "milk and eggs"', () => {
    const items = extractMultipleItems('milk and eggs');
    expect(items).toEqual(['milk', 'eggs']);
  });

  it('splits "milk, eggs, bread"', () => {
    const items = extractMultipleItems('milk, eggs, bread');
    expect(items).toEqual(['milk', 'eggs', 'bread']);
  });

  it('does not split greetings', () => {
    const items = extractMultipleItems('Bhai, list mein 5 apples daal do');
    // Should be a single item, not split on "Bhai,"
    expect(items.length).toBe(1);
  });

  it('preserves single items', () => {
    const items = extractMultipleItems('milk');
    expect(items).toEqual(['milk']);
  });
});

describe('Quantity Parsing Edge Cases', () => {
  it('parses "do litre"', () => {
    const r = parseQuantityAndUnit('do litre');
    expect(r.quantity).toBe(2);
    expect(r.unit).toBe('L');
  });

  it('parses "teen pack"', () => {
    const r = parseQuantityAndUnit('teen pack');
    expect(r.quantity).toBe(3);
    expect(r.unit).toBe('pack');
  });

  it('parses "500 ml"', () => {
    const r = parseQuantityAndUnit('500 ml');
    expect(r.quantity).toBe(500);
    expect(r.unit).toBe('ml');
  });

  it('defaults to 1 when no number', () => {
    const r = parseQuantityAndUnit('milk');
    expect(r.quantity).toBe(1);
  });

  it('parses "one litre"', () => {
    const r = parseQuantityAndUnit('one litre');
    expect(r.quantity).toBe(1);
    expect(r.unit).toBe('L');
  });

  it('parses "ek litre"', () => {
    const r = parseQuantityAndUnit('ek litre');
    expect(r.quantity).toBe(1);
    expect(r.unit).toBe('L');
  });
});

describe('Intent Classification Edge Cases', () => {
  it('"Add milk and bread" produces ADD_ITEM with products', () => {
    const r = parseIntent('Add milk and bread');
    expect(r.intent).toBe('ADD_ITEM');
    expect(r.entities.products).toBeDefined();
    expect(r.entities.products!.length).toBe(2);
  });

  it('"Find organic apples under 200" extracts filters', () => {
    const r = parseIntent('Find organic apples under 200');
    expect(r.intent).toBe('SEARCH_PRODUCT');
    expect(r.entities.attributes).toContain('organic');
    expect(r.entities.priceMax).toBe(200);
  });

  it('"Show toothpaste under 200" is SEARCH_PRODUCT', () => {
    const r = parseIntent('Show toothpaste under 200');
    expect(r.intent).toBe('SEARCH_PRODUCT');
    expect(r.entities.priceMax).toBe(200);
  });

  it('"Clear my list" is CLEAR_LIST', () => {
    const r = parseIntent('Clear my list');
    expect(r.intent).toBe('CLEAR_LIST');
  });

  it('"Undo that" is UNDO_LAST', () => {
    const r = parseIntent('Undo that');
    expect(r.intent).toBe('UNDO_LAST');
  });

  it('"What should I buy?" is GET_RECOMMENDATIONS', () => {
    const r = parseIntent('What should I buy?');
    expect(r.intent).toBe('GET_RECOMMENDATIONS');
  });

  it('"Show seasonal items" is GET_SEASONAL_ITEMS', () => {
    const r = parseIntent('Show seasonal items');
    expect(r.intent).toBe('GET_SEASONAL_ITEMS');
  });
});
