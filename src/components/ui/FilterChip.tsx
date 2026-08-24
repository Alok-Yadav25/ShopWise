'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  active?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

export function FilterChip({ label, active, onRemove, onClick }: FilterChipProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'text-xs font-medium transition-all duration-200',
        active
          ? 'bg-primary text-white shadow-sm'
          : 'bg-surface-elevated text-text-secondary border border-border hover:border-primary/30 hover:text-primary',
      )}
    >
      <span>{label}</span>
      {onRemove && (
        <X
          size={12}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70"
        />
      )}
    </motion.button>
  );
}
