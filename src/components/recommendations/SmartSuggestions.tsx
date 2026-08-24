'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Plus } from 'lucide-react';
import { getRecommendations, getRunningLowItems } from '@/lib/recommendations/engine';
import { RecommendationCard } from './RecommendationCard';
import { useShoppingStore } from '@/store/shoppingStore';
import { useUserStore } from '@/store/userStore';
import type { PurchaseHistory } from '@/types/shopping';

export function SmartSuggestions() {
  const items = useShoppingStore(s => s.items);
  // TODO: Fetch from /api/purchases
  const purchaseHistory: PurchaseHistory[] = [];
  const pantryItems = useShoppingStore(s => s.pantryItems);
  const addItem = useShoppingStore(s => s.addItem);
  const dietaryPreferences = useUserStore(s => s.dietaryPreferences);

  const existingNames = items.filter(i => i.status === 'pending').map(i => i.name);
  const pantryStockedNames = pantryItems
    .filter(i => i.estimatedRemaining > (i.lowStockThreshold || 1))
    .map(i => i.productName);

  const recommendations = useMemo(() => getRecommendations(
    purchaseHistory,
    existingNames,
    10,
    pantryStockedNames,
    dietaryPreferences,
  ), [purchaseHistory, existingNames, pantryStockedNames, dietaryPreferences]);

  const runningLow = useMemo(() => getRunningLowItems(purchaseHistory), [purchaseHistory]);

  const topRecommendations = recommendations.filter(r => r.urgency !== 'low').slice(0, 4);
  const topRunningLow = runningLow.slice(0, 3);

  if (topRecommendations.length === 0 && topRunningLow.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Running Low */}
      {topRunningLow.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-warning/10 flex items-center justify-center">
              <Lightbulb size={14} className="text-warning" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">You may be running low</h3>
          </div>

          <div className="space-y-2">
            {topRunningLow.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border/50 hover:border-border transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{item.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Last purchased {item.daysSinceLastPurchase}d ago · Your usual cycle: {item.frequencyDays} days
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addItem({
                    name: item.name,
                    quantity: 1,
                    unit: 'pcs',
                    category: 'Other',
                  })}
                  className="w-7 h-7 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100"
                  aria-label={`Add ${item.name} to list`}
                >
                  <Plus size={14} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Smart Recommendations */}
      {topRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lightbulb size={14} className="text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Smart Suggestions</h3>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {topRecommendations.map((rec, idx) => (
                <RecommendationCard key={rec.id} recommendation={rec} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
