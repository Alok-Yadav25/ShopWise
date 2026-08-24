'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Trash2, Check, Edit2, Search, RotateCcw } from 'lucide-react';
import { useShoppingStore } from '@/store/shoppingStore';
import { getTimeAgo, cn } from '@/lib/utils';

const intentIcons: Record<string, typeof Plus> = {
  ADD_ITEM: Plus,
  REMOVE_ITEM: Trash2,
  UPDATE_ITEM: Edit2,
  COMPLETE_ITEM: Check,
  SEARCH_PRODUCT: Search,
  UNDO_LAST: RotateCcw,
};

const intentColors: Record<string, string> = {
  ADD_ITEM: 'text-success bg-success/10',
  REMOVE_ITEM: 'text-danger bg-danger/10',
  UPDATE_ITEM: 'text-primary bg-primary/10',
  COMPLETE_ITEM: 'text-success bg-success/10',
  SEARCH_PRODUCT: 'text-primary bg-primary/10',
  UNDO_LAST: 'text-warning bg-warning/10',
};

export function CommandHistory() {
  const commandHistory = useShoppingStore(s => s.commandHistory);
  const recent = commandHistory.slice(0, 8);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Clock size={14} className="text-text-muted" />
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Recent Activity</h3>
      </div>

      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {recent.map((entry, idx) => {
            const Icon = intentIcons[entry.intent] || Plus;
            const colorClass = intentColors[entry.intent] || 'text-text-muted bg-surface-hover';

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15, delay: idx * 0.03 }}
                className="flex items-center gap-3 py-2 px-1"
              >
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', colorClass)}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{entry.result}</p>
                </div>
                <span className="text-[10px] text-text-muted flex-shrink-0">
                  {getTimeAgo(entry.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}


