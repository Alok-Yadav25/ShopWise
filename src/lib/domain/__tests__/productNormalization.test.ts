import { describe, it, expect } from 'vitest';
import { normalizeProductName, areSameProduct, mergeQuantities } from '../productNormalization';

describe('Product Normalization', () => {
  it('normalizes "milk" to canonical name', () => {
    expect(normalizeProductName('milk')).toBe('Amul Taaza Milk');
  });

  it('normalizes "bread" to canonical name', () => {
    expect(normalizeProductName('bread')).toBe('Whole Wheat Bread');
  });

  it('normalizes "apples"', () => {
    expect(normalizeProductName('apples')).toBe('Apples');
  });

  it('normalizes "organic apples"', () => {
    expect(normalizeProductName('organic apples')).toBe('Organic Apples');
  });

  it('normalizes Hindi "doodh" to milk alias', () => {
    expect(normalizeProductName('doodh')).toBe('Amul Taaza Milk');
  });

  it('normalizes Hindi "tamatar" to tomatoes', () => {
    expect(normalizeProductName('tamatar')).toBe('Tomatoes');
  });

  it('normalizes "double roti" to bread', () => {
    expect(normalizeProductName('double roti')).toBe('Whole Wheat Bread');
  });

  it('normalizes "chai" to tea', () => {
    expect(normalizeProductName('chai')).toBe('Tata Gold Tea');
  });

  it('normalizes "dahi" to curd/yogurt', () => {
    expect(normalizeProductName('dahi')).toBe('Epigamia Greek Yogurt');
  });

  it('removes noise words', () => {
    expect(normalizeProductName('some milk')).toBe('Amul Taaza Milk');
    expect(normalizeProductName('a bottle of water')).toBe('Bisleri Water');
  });

  it('returns cleaned name for unknown products', () => {
    const result = normalizeProductName('exotic fruit');
    expect(result).toBe('Exotic fruit');
  });
});

describe('Product Identity', () => {
  it('detects same product', () => {
    expect(areSameProduct('milk', 'Milk')).toBe(true);
    expect(areSameProduct('apples', 'Apples')).toBe(true);
  });

  it('detects different products', () => {
    expect(areSameProduct('milk', 'bread')).toBe(false);
    expect(areSameProduct('apples', 'bananas')).toBe(false);
  });
});

describe('Quantity Merging', () => {
  it('merges same units', () => {
    const result = mergeQuantities(1, 'L', 2, 'L');
    expect(result).toEqual({ quantity: 3, unit: 'L' });
  });

  it('merges litre family (litre + ml)', () => {
    const result = mergeQuantities(1, 'L', 500, 'ml');
    expect(result).toEqual({ quantity: 1.5, unit: 'L' });
  });

  it('merges kg family', () => {
    const result = mergeQuantities(1, 'kg', 500, 'g');
    expect(result).toEqual({ quantity: 1.5, unit: 'kg' });
  });

  it('returns null for incompatible units', () => {
    const result = mergeQuantities(1, 'L', 1, 'kg');
    expect(result).toBeNull();
  });

  it('merges pack + pack', () => {
    const result = mergeQuantities(1, 'pack', 2, 'pack');
    expect(result).toEqual({ quantity: 3, unit: 'pack' });
  });
});
