'use client';

import { motion } from 'framer-motion';
import { Clock, ShoppingBag, Calendar, Package, IndianRupee } from 'lucide-react';
import { MobileNavigation, DesktopNavigation } from '@/components/ui/Navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { getShoppingInsights, INSIGHT_ICON_MAP } from '@/lib/recommendations/engine';
import { formatCurrency } from '@/lib/utils';
import type { PurchaseHistory } from '@/types/shopping';

const iconComponents: Record<string, typeof Clock> = {
  calendar: Calendar,
  'shopping-bag': ShoppingBag,
  package: Package,
  'indian-rupee': IndianRupee,
  clock: Clock,
};

export default function HistoryPage() {
  // TODO: Fetch from /api/purchases
  const purchaseHistory: PurchaseHistory[] = [];
  const insights = getShoppingInsights(purchaseHistory);

  const history = [...purchaseHistory].sort(
    (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
  );

  // Group history by date
  const grouped: Record<string, typeof history> = {};
  for (const item of history) {
    const date = new Date(item.purchasedAt).toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  }

  const pageContent = (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">History & Insights</h1>
        <p className="text-sm text-text-muted mt-1">Your shopping patterns at a glance</p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {insights.map((insight, idx) => {
          const iconType = insight.type || 'frequency';
          const iconName = INSIGHT_ICON_MAP[iconType] || 'clock';
          const Icon = iconComponents[iconName] || Clock;
          return (
            <motion.div
              key={insight.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-xl bg-surface border border-border/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon size={14} className="text-primary" />
                </div>
              </div>
              <p className="text-xs text-text-muted">{insight.label}</p>
              <p className="text-lg font-bold text-text-primary mt-0.5">{insight.value}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{insight.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Purchase History Timeline */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={14} className="text-text-muted" />
          <h2 className="text-sm font-semibold text-text-primary">Purchase Timeline</h2>
        </div>

        {Object.entries(grouped).map(([date, items]) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{date}</h3>
            <div className="space-y-1.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-primary">{item.productName}</span>
                      <span className="text-xs text-text-muted">
                        ×{item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-text-secondary tabular-nums">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {Object.keys(grouped).length === 0 && (
        <EmptyState
          icon={Clock}
          title="No purchase history"
          description="Your purchase history will appear here as you buy items. Mark items as purchased to start building your history."
        />
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:flex">
        <DesktopNavigation />
        <main className="flex-1 max-w-3xl mx-auto px-6 py-8">
          {pageContent}
        </main>
      </div>

      <div className="md:hidden">
        <MobileNavigation />
        <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
          {pageContent}
        </main>
      </div>
    </div>
  );
}
