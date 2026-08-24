'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useShoppingStore } from '@/store/shoppingStore';
import { ShoppingItemCard } from './ShoppingItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils';
import { CATEGORY_ORDER, CATEGORY_ICONS } from '@/lib/constants/categories';

export function ShoppingList() {
  const items = useShoppingStore(s => s.items);
  const getEstimatedTotal = useShoppingStore(s => s.getEstimatedTotal);
  const pendingItems = items.filter(i => i.status === 'pending');
  const completedItems = items.filter(i => i.status === 'completed');
  const { total, itemsWithoutPrice } = getEstimatedTotal();

  // Group pending items by category
  const grouped: Record<string, typeof items> = {};
  for (const item of pendingItems) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  // Sort categories
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a as typeof CATEGORY_ORDER[number]);
      const idxB = CATEGORY_ORDER.indexOf(b as typeof CATEGORY_ORDER[number]);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    }
  );

  if (pendingItems.length === 0 && completedItems.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your list is empty"
        description="Tap the microphone or type to add items to your shopping list."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-1"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <ShoppingCart size={16} />
            <span className="font-medium">{pendingItems.length} items</span>
          </div>
          {completedItems.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 size={14} />
              <span>{completedItems.length} done</span>
            </div>
          )}
        </div>
        {total > 0 && (
          <div className="text-sm font-semibold text-text-primary">
            Est. {formatCurrency(total)}
            {itemsWithoutPrice > 0 && (
              <span className="text-xs text-text-muted font-normal ml-1">
                ({itemsWithoutPrice} without price)
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Categories */}
      <AnimatePresence mode="popLayout">
        {sortedCategories.map((category, catIdx) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: catIdx * 0.05 }}
          >
            {/* Category header */}
            <div className="flex items-center gap-2 px-1 mb-2">
              <span className="text-sm">{CATEGORY_ICONS[category] || '📦'}</span>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {category}
              </h3>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted">
                {grouped[category].length}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {grouped[category].map((item, idx) => (
                  <ShoppingItemCard key={item.id} item={item} index={idx} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Completed items */}
      {completedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          <div className="flex items-center gap-2 px-1 mb-2">
            <CheckCircle2 size={14} className="text-success" />
            <h3 className="text-xs font-semibold text-success uppercase tracking-wider">
              Purchased
            </h3>
            <div className="flex-1 h-px bg-success/20" />
          </div>
          <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
              {completedItems.map((item, idx) => (
                <ShoppingItemCard key={item.id} item={item} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
