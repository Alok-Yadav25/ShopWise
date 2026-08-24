'use client';

import { motion } from 'framer-motion';
import { Plus, Clock, TrendingUp, Zap } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Recommendation } from '@/types/recommendation';
import { useShoppingStore } from '@/store/shoppingStore';

const urgencyStyles = {
  high: 'border-l-danger',
  medium: 'border-l-warning',
  low: 'border-l-text-muted',
};

const typeIcons = {
  frequency: Clock,
  seasonal: TrendingUp,
  pantry: Zap,
  substitute: TrendingUp,
  habit: Clock,
  trending: TrendingUp,
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  index?: number;
}

export function RecommendationCard({ recommendation, index = 0 }: RecommendationCardProps) {
  const { addItem } = useShoppingStore();

  const handleAdd = () => {
    const itemData: Record<string, unknown> = {
      name: recommendation.productName,
      quantity: 1,
      unit: 'pcs',
      category: recommendation.category,
      estimatedPrice: recommendation.estimatedPrice,
      priority: recommendation.urgency === 'high' ? 'need_soon' : 'normal',
    };
    addItem(itemData as Parameters<typeof addItem>[0]);
  };

  const Icon = typeIcons[recommendation.type] || Clock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={cn(
        'p-3 rounded-xl bg-surface border border-border/50',
        'hover:border-border hover:shadow-sm transition-all duration-200',
        'border-l-[3px]',
        urgencyStyles[recommendation.urgency],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text-primary truncate">
              {recommendation.productName}
            </h4>
            {recommendation.estimatedPrice && (
              <span className="text-xs font-medium text-text-secondary tabular-nums">
                {formatCurrency(recommendation.estimatedPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <Icon size={12} className="text-text-muted flex-shrink-0" />
            <p className="text-xs text-text-muted leading-relaxed">
              {recommendation.reason}
            </p>
          </div>

          {recommendation.purchaseFrequencyDays && (
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-hover text-text-muted font-medium">
                Every {recommendation.purchaseFrequencyDays} days
              </span>
              {recommendation.lastPurchasedDaysAgo !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-hover text-text-muted font-medium">
                  Last {recommendation.lastPurchasedDaysAgo}d ago
                </span>
              )}
            </div>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleAdd}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            'bg-primary/10 text-primary hover:bg-primary hover:text-white',
            'transition-all duration-200',
          )}
          aria-label={`Add ${recommendation.productName}`}
        >
          <Plus size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}
