import { describe, it, expect } from 'vitest';
import { parseNumber, parseQuantityAndUnit, normalizeUnit, extractPriceConstraints, extractMultipleItems } from '../numbers';

describe('Number Parsing', () => {
  it('parses digit numbers', () => {
    expect(parseNumber('5')).toBe(5);
    expect(parseNumber('10')).toBe(10);
    expect(parseNumber('100')).toBe(100);
  });

  it('parses English word numbers', () => {
    expect(parseNumber('one')).toBe(1);
    expect(parseNumber('two')).toBe(2);
    expect(parseNumber('five')).toBe(5);
    expect(parseNumber('ten')).toBe(10);
    expect(parseNumber('twenty')).toBe(20);
  });

  it('parses Hindi/Hinglish word numbers', () => {
    expect(parseNumber('ek')).toBe(1);
    expect(parseNumber('do')).toBe(2);
    expect(parseNumber('teen')).toBe(3);
    expect(parseNumber('chaar')).toBe(4);
    expect(parseNumber('paanch')).toBe(5);
    expect(parseNumber('chhe')).toBe(6);
    expect(parseNumber('saat')).toBe(7);
    expect(parseNumber('aath')).toBe(8);
    expect(parseNumber('nau')).toBe(9);
    expect(parseNumber('das')).toBe(10);
  });

  it('returns undefined for no number', () => {
    expect(parseNumber('milk')).toBeUndefined();
    expect(parseNumber('hello world')).toBeUndefined();
  });
});

describe('Quantity and Unit Parsing', () => {
  it('parses "2 litres"', () => {
    const result = parseQuantityAndUnit('2 litres of milk');
    expect(result.quantity).toBe(2);
    expect(result.unit).toBe('L');
  });

  it('parses "500 ml"', () => {
    const result = parseQuantityAndUnit('500 ml');
    expect(result.quantity).toBe(500);
    expect(result.unit).toBe('ml');
  });

  it('parses "1 kg"', () => {
    const result = parseQuantityAndUnit('1 kg');
    expect(result.quantity).toBe(1);
    expect(result.unit).toBe('kg');
  });

  it('parses "do litre"', () => {
    const result = parseQuantityAndUnit('do litre');
    expect(result.quantity).toBe(2);
    expect(result.unit).toBe('L');
  });

  it('parses "teen pack"', () => {
    const result = parseQuantityAndUnit('teen pack');
    expect(result.quantity).toBe(3);
    expect(result.unit).toBe('pack');
  });

  it('parses "6 bottles"', () => {
    const result = parseQuantityAndUnit('6 bottles');
    expect(result.quantity).toBe(6);
    expect(result.unit).toBe('bottle');
  });

  it('defaults to quantity 1, unit pcs', () => {
    const result = parseQuantityAndUnit('milk');
    expect(result.quantity).toBe(1);
    expect(result.unit).toBe('pcs');
  });
});

describe('Unit Normalization', () => {
  it('normalizes common units', () => {
    expect(normalizeUnit('litre')).toBe('L');
    expect(normalizeUnit('liter')).toBe('L');
    expect(normalizeUnit('litres')).toBe('L');
    expect(normalizeUnit('kilogram')).toBe('kg');
    expect(normalizeUnit('kilo')).toBe('kg');
    expect(normalizeUnit('dozen')).toBe('dozen');
    expect(normalizeUnit('bottle')).toBe('bottle');
    expect(normalizeUnit('packets')).toBe('pack');
  });
});

describe('Price Constraints', () => {
  it('extracts "under 200"', () => {
    const result = extractPriceConstraints('milk under 200');
    expect(result.priceMax).toBe(200);
  });

  it('extracts "below ₹100"', () => {
    const result = extractPriceConstraints('toothpaste below ₹100');
    expect(result.priceMax).toBe(100);
  });

  it('extracts "over 50"', () => {
    const result = extractPriceConstraints('premium over 50');
    expect(result.priceMin).toBe(50);
  });

  it('extracts "between 100 and 500"', () => {
    const result = extractPriceConstraints('rice between 100 and 500');
    expect(result.priceMin).toBe(100);
    expect(result.priceMax).toBe(500);
  });
});

describe('Multiple Item Extraction', () => {
  it('splits by "and"', () => {
    const result = extractMultipleItems('milk and eggs');
    expect(result).toEqual(['milk', 'eggs']);
  });

  it('splits by comma', () => {
    const result = extractMultipleItems('milk, eggs, bread');
    expect(result).toEqual(['milk', 'eggs', 'bread']);
  });

  it('splits by "aur"', () => {
    const result = extractMultipleItems('doodh aur ande');
    expect(result).toEqual(['doodh', 'ande']);
  });

  it('returns single item as-is', () => {
    const result = extractMultipleItems('milk');
    expect(result).toEqual(['milk']);
  });
});
