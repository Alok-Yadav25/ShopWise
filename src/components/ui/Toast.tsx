'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  show: boolean;
  onClose: () => void;
  onUndo?: () => void;
}

export function Toast({ message, type = 'success', show, onClose, onUndo }: ToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'fixed left-1/2 -translate-x-1/2 z-50',
            'flex items-center gap-3 px-4 py-3',
            'rounded-2xl shadow-lg backdrop-blur-md',
            'text-sm font-medium',
            'max-w-[calc(100vw-2rem)]',
            // Above mobile bottom nav (h-16 = 4rem) + safe area
            'bottom-20 md:bottom-6',
            type === 'success' && 'bg-surface-elevated/90 text-text-primary border border-border',
            type === 'error' && 'bg-danger/10 text-danger border border-danger/20',
            type === 'info' && 'bg-primary/10 text-primary border border-primary/20',
          )}
        >
          <span className="flex-1">{message}</span>

          {onUndo && (
            <button
              onClick={() => {
                onUndo();
                onClose();
              }}
              className="flex items-center gap-1.5 text-primary hover:text-primary-dark transition-colors flex-shrink-0"
            >
              <Undo2 size={14} />
              <span>Undo</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-2 text-text-muted hover:text-text-secondary transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
