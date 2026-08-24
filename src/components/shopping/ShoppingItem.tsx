'use client';

import { motion } from 'framer-motion';
import { Check, Trash2, Star } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { ShoppingItem as ShoppingItemType } from '@/types/shopping';
import { useShoppingStore } from '@/store/shoppingStore';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/constants/categories';

interface ShoppingItemProps {
  item: ShoppingItemType;
  onRemove?: (id: string) => void;
  onComplete?: (id: string) => void;
  index?: number;
}

export function ShoppingItemCard({ item, index = 0 }: ShoppingItemProps) {
  const removeItemById = useShoppingStore(s => s.removeItemById);
  const completeItem = useShoppingStore(s => s.completeItem);
  const setItemPriority = useShoppingStore(s => s.setItemPriority);
  const isCompleted = item.status === 'completed';
  const categoryColor = CATEGORY_COLORS[item.category] || 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
  const categoryIcon = CATEGORY_ICONS[item.category] || '📦';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      layout
      className={cn(
        'group flex items-center gap-3 px-4 py-3 rounded-xl',
        'bg-surface border border-border/50',
        'hover:border-border hover:shadow-sm transition-all duration-200',
        isCompleted && 'opacity-60',
      )}
    >
      {/* Complete button */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => !isCompleted && completeItem(item.name)}
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
          isCompleted
            ? 'bg-success text-white'
            : 'border-2 border-border hover:border-primary hover:bg-primary/5',
        )}
        aria-label={isCompleted ? `${item.name} completed` : `Mark ${item.name} as purchased`}
      >
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Check size={14} strokeWidth={3} />
          </motion.div>
        )}
      </motion.button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-[15px] font-medium leading-tight',
              isCompleted && 'line-through text-text-muted',
            )}
          >
            {item.name}
          </span>
          {item.brand && (
            <span className="text-xs text-text-muted hidden sm:inline">
              {item.brand}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text-muted">
            {item.quantity} {item.unit}
          </span>
          {item.estimatedPrice && (
            <>
              <span className="text-xs text-text-muted">·</span>
              <span className="text-xs text-text-secondary font-medium">
                {formatCurrency(item.estimatedPrice * item.quantity)}
              </span>
            </>
          )}
          {item.priority === 'need_soon' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
              Need soon
            </span>
          )}
        </div>
      </div>

      {/* Category badge */}
      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium hidden sm:inline-block', categoryColor)}>
        {categoryIcon} {item.category}
      </span>

      {/* Price */}
      {item.estimatedPrice && (
        <span className="text-sm font-semibold text-text-secondary tabular-nums hidden sm:inline">
          {formatCurrency(item.estimatedPrice * item.quantity)}
        </span>
      )}

      {/* Delete button */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => removeItemById(item.id)}
        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-danger/10 hover:text-danger transition-all duration-200 flex-shrink-0"
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 size={14} />
      </motion.button>

      {/* Favorite star */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => setItemPriority(item.id, item.priority === 'optional' ? 'normal' : 'optional')}
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        aria-label={item.priority === 'optional' ? `Unfavorite ${item.name}` : `Favorite ${item.name}`}
      >
        <Star
          size={14}
          className={item.priority === 'optional' ? 'fill-amber-400 text-amber-400' : 'text-text-muted hover:text-amber-400'}
        />
      </motion.button>
    </motion.div>
  );
}
