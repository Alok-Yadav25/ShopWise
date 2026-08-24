'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Star } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Product } from '@/types/product';
import { useShoppingStore } from '@/store/shoppingStore';
import { CATEGORY_ICONS } from '@/lib/constants/categories';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useShoppingStore(s => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      name: product.name,
      quantity: 1,
      unit: product.unit,
      category: product.category,
      brand: product.brand,
      estimatedPrice: product.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="p-3 rounded-xl bg-surface border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center text-xl flex-shrink-0">
          {CATEGORY_ICONS[product.category] || '📦'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-text-primary truncate">{product.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                {product.brand && (
                  <span className="text-xs text-text-muted">{product.brand}</span>
                )}
                {product.size && (
                  <span className="text-xs text-text-muted">{product.size}</span>
                )}
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-text-primary tabular-nums">
                {formatCurrency(product.price)}
              </p>
              <p className="text-[10px] text-text-muted">/{product.unit}</p>
            </div>
          </div>

          {/* Attributes */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {product.organic && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/10 text-success font-medium">
                Organic
              </span>
            )}
            {product.rating && (
              <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium">
                <Star size={8} className="fill-current" />
                {product.rating}
              </span>
            )}
            {product.attributes?.slice(0, 2).map(attr => (
              <span
                key={attr}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-hover text-text-muted font-medium capitalize"
              >
                {attr}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Add button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleAdd}
        disabled={added}
        className={cn(
          'w-full mt-3 py-2 rounded-lg text-xs font-medium',
          added
            ? 'bg-success/10 text-success'
            : 'bg-primary/5 text-primary hover:bg-primary hover:text-white',
          'transition-all duration-200',
          'flex items-center justify-center gap-1.5',
        )}
      >
        {added ? (
          <>
            <Check size={14} />
            Added!
          </>
        ) : (
          <>
            <Plus size={14} />
            Add to List
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
