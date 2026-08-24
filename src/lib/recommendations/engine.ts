import { Recommendation, ShoppingInsight, SubstitutionSuggestion, ShoppingInsightType } from '@/types/recommendation';
import { PurchaseHistory } from '@/types/shopping';
import { products } from '@/data/products';
import { generateId } from '@/lib/domain/ids';

interface ProductFrequency {
  productName: string;
  category: string;
  avgFrequencyDays: number;
  lastPurchasedDaysAgo: number;
  totalPurchases: number;
}

function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / 86400000);
}

function analyzePurchasePatterns(history: PurchaseHistory[]): ProductFrequency[] {
  const productMap = new Map<string, { purchases: PurchaseHistory[]; category: string }>();

  for (const p of history) {
    const key = p.productName.toLowerCase();
    if (!productMap.has(key)) {
      productMap.set(key, { purchases: [], category: p.category });
    }
    productMap.get(key)!.purchases.push(p);
  }

  const patterns: ProductFrequency[] = [];

  for (const [, { purchases, category }] of productMap) {
    if (purchases.length < 1) continue;

    const sorted = purchases.sort(
      (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
    );

    const lastPurchased = daysSince(sorted[0].purchasedAt);

    let avgFrequency = 30; // default
    if (sorted.length >= 2) {
      let totalDays = 0;
      for (let i = 0; i < sorted.length - 1; i++) {
        const d1 = new Date(sorted[i].purchasedAt).getTime();
        const d2 = new Date(sorted[i + 1].purchasedAt).getTime();
        totalDays += (d1 - d2) / 86400000;
      }
      avgFrequency = totalDays / (sorted.length - 1);
    }

    patterns.push({
      productName: sorted[0].productName,
      category,
      avgFrequencyDays: Math.round(avgFrequency),
      lastPurchasedDaysAgo: lastPurchased,
      totalPurchases: purchases.length,
    });
  }

  return patterns;
}

/**
 * Get recommendations based on real purchase history.
 * @param history - The purchase history to analyze (from store)
 * @param existingItemNames - Items already in the shopping list (to exclude)
 * @param maxItems - Maximum number of recommendations to return
 */
export function getRecommendations(
  history: PurchaseHistory[],
  existingItemNames: string[] = [],
  maxItems: number = 10,
  pantryStockedNames: string[] = [],
  dietaryExclusions: string[] = [],
): Recommendation[] {
  if (!history || history.length === 0) return [];

  const patterns = analyzePurchasePatterns(history);
  const recommendations: Recommendation[] = [];

  for (const pattern of patterns) {
    // Skip if already in list
    if (existingItemNames.some(name => name.toLowerCase() === pattern.productName.toLowerCase())) {
      continue;
    }

    // Skip if pantry has adequate stock
    if (pantryStockedNames.some(name => name.toLowerCase() === pattern.productName.toLowerCase())) {
      continue;
    }

    // Skip if conflicts with dietary preferences
    const lowerName = pattern.productName.toLowerCase();
    if (dietaryExclusions.some(excl => lowerName.includes(excl))) {
      continue;
    }

    const timeSinceExpected = pattern.lastPurchasedDaysAgo - pattern.avgFrequencyDays;
    const overdue = timeSinceExpected >= 0;

    // Frequency score: how overdue is this purchase (0-1)
    const frequencyScore = overdue
      ? Math.min(1, timeSinceExpected / pattern.avgFrequencyDays + 0.5)
      : Math.max(0, 1 - (timeSinceExpected * -1) / pattern.avgFrequencyDays);

    // Recency score: how long since last purchase (0-1)
    const recencyScore = Math.min(1, pattern.lastPurchasedDaysAgo / (pattern.avgFrequencyDays * 2));

    // Purchase frequency score: more frequent = more important
    const purchaseCountScore = Math.min(1, pattern.totalPurchases / 10);

    // Composite score
    const score = frequencyScore * 0.5 + recencyScore * 0.3 + purchaseCountScore * 0.2;

    // Determine urgency
    let urgency: 'high' | 'medium' | 'low' = 'low';
    if (timeSinceExpected >= pattern.avgFrequencyDays * 0.8) urgency = 'high';
    else if (timeSinceExpected >= pattern.avgFrequencyDays * 0.3) urgency = 'medium';

    // Build explainable reason
    let reason: string;
    if (overdue && timeSinceExpected > 0) {
      reason = `Usually purchased every ${pattern.avgFrequencyDays} days. You're about ${Math.abs(timeSinceExpected)} day${Math.abs(timeSinceExpected) !== 1 ? 's' : ''} overdue.`;
    } else if (overdue) {
      reason = `You usually buy this every ${pattern.avgFrequencyDays} days.`;
    } else {
      const daysUntil = Math.abs(timeSinceExpected);
      reason = `You usually buy this every ${pattern.avgFrequencyDays} days. Next purchase in ~${daysUntil} day${daysUntil !== 1 ? 's' : ''}.`;
    }

    const product = products.find(p =>
      p.name.toLowerCase().includes(pattern.productName.toLowerCase().split(' ')[0])
    );

    recommendations.push({
      id: generateId(),
      productName: pattern.productName,
      category: pattern.category,
      reason,
      score: Math.round(score * 100) / 100,
      type: 'frequency',
      estimatedPrice: product?.price,
      urgency,
      purchaseFrequencyDays: pattern.avgFrequencyDays,
      lastPurchasedDaysAgo: pattern.lastPurchasedDaysAgo,
    });
  }

  // Sort by score descending, limit results
  return recommendations.sort((a, b) => b.score - a.score).slice(0, maxItems);
}

/**
 * Get product substitutions — fully data-driven from the product database.
 * Uses category matching, attribute matching, dietary compatibility,
 * brand alternatives, and price ranking.
 */
export function getSubstitutions(productName: string, dietaryPrefs: string[] = []): SubstitutionSuggestion[] {
  const lower = productName.toLowerCase();
  const subs: SubstitutionSuggestion[] = [];

  // Find the original product in the database
  const originalProduct = products.find(p =>
    p.name.toLowerCase() === lower ||
    p.name.toLowerCase().includes(lower) ||
    lower.includes(p.name.toLowerCase())
  );

  // If we found the product, suggest same-category alternatives from the database
  if (originalProduct) {
    const candidates = products.filter(
      p => p.category === originalProduct.category && p.id !== originalProduct.id
    );

    for (const candidate of candidates) {
      let score = 0.5;
      const reasons: string[] = [];

      // Category match (always true since we filtered)
      score += 0.2;

      // Attribute overlap
      const origAttrs = new Set(originalProduct.attributes);
      const candAttrs = new Set(candidate.attributes);
      const commonAttrs = [...origAttrs].filter(a => candAttrs.has(a));
      if (commonAttrs.length > 0) {
        score += commonAttrs.length * 0.05;
        reasons.push(`Same attributes: ${commonAttrs.join(', ')}`);
      }

      // Dietary compatibility
      if (candidate.dietaryTags?.length && originalProduct.dietaryTags?.length) {
        const commonDiet = candidate.dietaryTags.filter(d => originalProduct.dietaryTags!.includes(d));
        if (commonDiet.length > 0) {
          score += 0.05;
        }
      }

      // Dietary preference match bonus
      if (dietaryPrefs.length && candidate.dietaryTags?.length) {
        const matchesPrefs = candidate.dietaryTags.some(d => dietaryPrefs.includes(d));
        if (matchesPrefs) {
          score += 0.1;
          reasons.push('Matches your dietary preferences');
        }
      }

      // Price comparison
      const priceDiff = candidate.price - originalProduct.price;
      if (priceDiff < 0) {
        score += 0.08;
        reasons.push(`₹${Math.abs(priceDiff)} cheaper`);
      } else if (priceDiff === 0) {
        score += 0.05;
        reasons.push('Similar price');
      }

      // Rating comparison
      if (candidate.rating && originalProduct.rating && candidate.rating > originalProduct.rating) {
        score += 0.05;
        reasons.push('Higher rated');
      }

      // Brand diversity bonus (different brand = more options)
      if (candidate.brand && candidate.brand !== originalProduct.brand) {
        score += 0.03;
      }

      subs.push({
        originalProduct: originalProduct.name,
        substituteProduct: candidate.name,
        substituteBrand: candidate.brand,
        price: candidate.price,
        reason: reasons.length > 0 ? reasons[0] : `Similar ${candidate.category.toLowerCase()} product`,
        attributes: candidate.attributes,
        score: Math.min(score, 1.0),
      });
    }
  }

  // Fallback: if no product found, search by category keyword
  if (subs.length === 0) {
    const matchedProduct = products.find(p => {
      const pLower = p.name.toLowerCase();
      // Check if any word in the product name matches
      const words = lower.split(/\s+/);
      return words.some(w => w.length > 2 && pLower.includes(w));
    });

    if (matchedProduct) {
      const sameCategory = products.filter(
        p => p.category === matchedProduct.category && p.id !== matchedProduct.id
      );
      for (const s of sameCategory.slice(0, 3)) {
        subs.push({
          originalProduct: productName,
          substituteProduct: s.name,
          substituteBrand: s.brand,
          price: s.price,
          reason: `Similar ${s.category.toLowerCase()} product`,
          attributes: s.attributes,
          score: 0.5,
        });
      }
    }
  }

  return subs.sort((a, b) => b.score - a.score).slice(0, 5);
}

// Icon mapping at the UI domain level (not in the business layer)
export const INSIGHT_ICON_MAP: Record<ShoppingInsightType, string> = {
  frequency: 'calendar',
  spending: 'indian-rupee',
  category: 'shopping-bag',
  seasonal: 'package',
};

/**
 * Compute shopping insights from real purchase history.
 */
export function getShoppingInsights(history: PurchaseHistory[] = []): ShoppingInsight[] {
  if (history.length === 0) {
    return [
      { label: 'Shopping frequency', value: '—', description: 'Add purchases to see insights', type: 'frequency' },
      { label: 'Top category', value: '—', description: 'Add purchases to see insights', type: 'category' },
      { label: 'Weekly items', value: '—', description: 'Add purchases to see insights', type: 'seasonal' },
      { label: 'Monthly spend', value: '—', description: 'Add purchases to see insights', type: 'spending' },
    ];
  }

  // Top category
  const catCounts: Record<string, number> = {};
  for (const p of history) {
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  }
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  // Average items per purchase
  const avgItems = history.length; // simplified

  // Total spend in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const recentSpend = history
    .filter(p => new Date(p.purchasedAt) >= thirtyDaysAgo)
    .reduce((sum, p) => sum + p.price, 0);

  // Shopping day analysis
  const dayCounts: Record<string, number> = {};
  for (const p of history) {
    const day = new Date(p.purchasedAt).toLocaleDateString('en-IN', { weekday: 'long' });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  }
  const topDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  return [
    { label: 'Shopping frequency', value: `Mostly on ${topDay}`, description: `Based on your ${history.length} purchases`, type: 'frequency' },
    { label: 'Top category', value: topCategory, description: 'Your most purchased category', type: 'category' },
    { label: 'Weekly items', value: `~${Math.round(avgItems / Math.max(1, Math.ceil(daysSince(history[history.length - 1]?.purchasedAt || new Date().toISOString()) / 7)))} items`, description: 'Your average weekly shopping', type: 'seasonal' },
    { label: 'Monthly spend', value: `₹${recentSpend.toLocaleString('en-IN')}`, description: 'Estimated monthly grocery spend', type: 'spending' },
  ];
}

/**
 * Get running low items from purchase history patterns.
 */
export function getRunningLowItems(history: PurchaseHistory[] = []): { name: string; daysSinceLastPurchase: number; frequencyDays: number }[] {
  if (history.length === 0) return [];

  const patterns = analyzePurchasePatterns(history);

  return patterns
    .filter(p => p.lastPurchasedDaysAgo >= p.avgFrequencyDays * 0.7)
    .map(p => ({
      name: p.productName,
      daysSinceLastPurchase: p.lastPurchasedDaysAgo,
      frequencyDays: p.avgFrequencyDays,
    }))
    .sort((a, b) => {
      const urgencyA = a.daysSinceLastPurchase / a.frequencyDays;
      const urgencyB = b.daysSinceLastPurchase / b.frequencyDays;
      return urgencyB - urgencyA;
    });
}
