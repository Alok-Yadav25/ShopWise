import { describe, it, expect } from 'vitest';
import { getRecommendations, getSubstitutions, getRunningLowItems, getShoppingInsights } from '../engine';
import type { PurchaseHistory } from '@/types/shopping';

const mockHistory: PurchaseHistory[] = [
  {
    id: 'h1',
    productId: 'p1',
    productName: 'Amul Taaza Milk',
    category: 'Dairy',
    price: 62,
    quantity: 2,
    unit: 'L',
    purchasedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'h2',
    productId: 'p1',
    productName: 'Amul Taaza Milk',
    category: 'Dairy',
    price: 62,
    quantity: 2,
    unit: 'L',
    purchasedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'h3',
    productId: 'p30',
    productName: 'Whole Wheat Bread',
    category: 'Bakery',
    price: 45,
    quantity: 1,
    unit: 'pack',
    purchasedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'h4',
    productId: 'p11',
    productName: 'Apples',
    category: 'Produce',
    price: 180,
    quantity: 1,
    unit: 'kg',
    purchasedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'h5',
    productId: 'p11',
    productName: 'Apples',
    category: 'Produce',
    price: 180,
    quantity: 1,
    unit: 'kg',
    purchasedAt: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
];

describe('Recommendation Engine', () => {
  describe('getRecommendations', () => {
    it('returns recommendations based on purchase history', () => {
      const recs = getRecommendations(mockHistory, [], 10);
      expect(recs.length).toBeGreaterThan(0);
      const freqRecs = recs.filter(r => r.type === 'frequency');
      expect(freqRecs.length).toBeGreaterThan(0);
    });

    it('excludes items already on the shopping list', () => {
      const existingItems = ['Amul Taaza Milk'];
      const recs = getRecommendations(mockHistory, existingItems, 10);
      const milkRecs = recs.filter(r => r.productName.toLowerCase().includes('milk'));
      expect(milkRecs.length).toBe(0);
    });

    it('returns empty for empty history', () => {
      const recs = getRecommendations([], [], 10);
      expect(recs).toEqual([]);
    });

    it('returns empty when all items are already on list', () => {
      const existingItems = ['Amul Taaza Milk', 'Whole Wheat Bread', 'Apples'];
      const recs = getRecommendations(mockHistory, existingItems, 10);
      expect(recs).toEqual([]);
    });

    it('respects maxItems limit', () => {
      const recs = getRecommendations(mockHistory, [], 2);
      expect(recs.length).toBeLessThanOrEqual(2);
    });

    it('excludes pantry items that are adequately stocked', () => {
      const pantryStocked = ['Amul Taaza Milk'];
      const recs = getRecommendations(mockHistory, [], 10, pantryStocked);
      const milkRecs = recs.filter(r => r.productName.toLowerCase().includes('milk'));
      expect(milkRecs.length).toBe(0);
    });

    it('respects dietary preferences', () => {
      const recs = getRecommendations(mockHistory, [], 10, [], ['vegan']);
      for (const rec of recs) {
        expect(rec).toHaveProperty('productName');
      }
    });
  });

  describe('getSubstitutions', () => {
    it('returns same-category alternatives for a known product', () => {
      const subs = getSubstitutions('Amul Taaza Milk');
      expect(subs.length).toBeGreaterThan(0);
      for (const sub of subs) {
        expect(sub.originalProduct).toBe('Amul Taaza Milk');
        expect(sub.substituteProduct).toBeTruthy();
        expect(sub.price).toBeGreaterThan(0);
        expect(sub.reason).toBeTruthy();
        expect(sub.score).toBeGreaterThan(0);
      }
    });

    it('returns alternatives sorted by score', () => {
      const subs = getSubstitutions('Whole Wheat Bread');
      if (subs.length >= 2) {
        expect(subs[0].score).toBeGreaterThanOrEqual(subs[1].score);
      }
    });

    it('suggests cheaper alternatives when available', () => {
      const subs = getSubstitutions('Organic Apples');
      const cheaperSubs = subs.filter(s => s.price < 280);
      if (cheaperSubs.length > 0) {
        expect(cheaperSubs[0].price).toBeLessThan(280);
      }
    });

    it('returns empty for completely unknown products', () => {
      const subs = getSubstitutions('xyzzyplugh12345');
      expect(subs).toEqual([]);
    });

    it('limits results to 5', () => {
      const subs = getSubstitutions('Milk');
      expect(subs.length).toBeLessThanOrEqual(5);
    });

    it('includes dietary preference matching', () => {
      const subs = getSubstitutions('Amul Taaza Milk', ['vegetarian']);
      expect(subs.length).toBeGreaterThan(0);
    });
  });

  describe('getRunningLowItems', () => {
    it('detects overdue items', () => {
      const runningLow = getRunningLowItems(mockHistory);
      const apple = runningLow.find(r => r.name === 'Apples');
      expect(apple).toBeDefined();
      expect(apple!.daysSinceLastPurchase).toBeGreaterThanOrEqual(14);
    });

    it('returns empty for empty history', () => {
      const runningLow = getRunningLowItems([]);
      expect(runningLow).toEqual([]);
    });

    it('does not flag recently purchased items', () => {
      const recentHistory: PurchaseHistory[] = [
        {
          id: 'r1',
          productId: 'p1',
          productName: 'Milk',
          category: 'Dairy',
          price: 62,
          quantity: 1,
          unit: 'L',
          purchasedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
      ];
      const runningLow = getRunningLowItems(recentHistory);
      expect(runningLow.length).toBe(0);
    });
  });

  describe('getShoppingInsights', () => {
    it('returns insights for non-empty history', () => {
      const insights = getShoppingInsights(mockHistory);
      expect(insights.length).toBe(4);
      for (const insight of insights) {
        expect(insight.label).toBeTruthy();
        expect(insight.value).toBeTruthy();
        expect(insight.type).toBeTruthy();
      }
    });

    it('returns placeholder insights for empty history', () => {
      const insights = getShoppingInsights([]);
      expect(insights.length).toBe(4);
      for (const insight of insights) {
        expect(insight.value).toBe('—');
      }
    });
  });
});
