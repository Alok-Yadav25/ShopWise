'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, AlertTriangle, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { MobileNavigation, DesktopNavigation } from '@/components/ui/Navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { useShoppingStore } from '@/store/shoppingStore';
import { PantryItem } from '@/types/product';
import { CATEGORY_ICONS } from '@/lib/constants/categories';
import { cn } from '@/lib/utils';
import { products } from '@/data/products';

export default function PantryPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:flex">
        <DesktopNavigation />
        <main className="flex-1 max-w-3xl mx-auto px-6 py-8">
          <PantryContent />
        </main>
      </div>

      <div className="md:hidden">
        <MobileNavigation />
        <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
          <PantryContent />
        </main>
      </div>
    </div>
  );
}

function PantryContent() {
  const pantryItems = useShoppingStore(s => s.pantryItems);
  const addPantryItem = useShoppingStore(s => s.addPantryItem);
  const removePantryItem = useShoppingStore(s => s.removePantryItem);
  const addItem = useShoppingStore(s => s.addItem);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addQty, setAddQty] = useState('1');
  const [addUnit, setAddUnit] = useState('pcs');


  const runningLow = pantryItems.filter(i => i.estimatedRemaining <= (i.lowStockThreshold || 1));
  const adequate = pantryItems.filter(i => i.estimatedRemaining > (i.lowStockThreshold || 1));

  const handleAdd = () => {
    if (!addName.trim()) return;
    const product = products.find(p => p.name.toLowerCase().includes(addName.toLowerCase()));
    addPantryItem({
      productId: product?.id || '',
      productName: addName,
      quantity: parseFloat(addQty) || 1,
      unit: addUnit,
      category: product?.category || 'Other',
      estimatedRemaining: parseFloat(addQty) || 1,
      lastPurchasedAt: new Date().toISOString(),
      purchaseFrequencyDays: 7,
      lowStockThreshold: 1,
    });
    setAddName('');
    setAddQty('1');
    setShowAdd(false);
  };

  const handleAddToCart = (item: PantryItem) => {
    addItem({
      name: item.productName,
      quantity: 1,
      unit: item.unit,
      category: item.category,
    });
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Smart Pantry</h1>
        <p className="text-sm text-text-muted mt-1">Track what you have at home</p>
      </div>

      {/* Add button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
            'bg-primary/10 text-primary hover:bg-primary hover:text-white',
          )}
        >
          <Plus size={16} />
          Add to Pantry
        </button>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-4 rounded-xl bg-surface border border-border space-y-3">
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Product name (e.g., Milk)"
                  className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={addQty}
                    onChange={(e) => setAddQty(e.target.value)}
                    placeholder="Qty"
                    className="w-20 px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary focus:outline-none focus:border-primary"
                  />
                  <select
                    value={addUnit}
                    onChange={(e) => setAddUnit(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="pcs">pcs</option>
                    <option value="L">L</option>
                    <option value="kg">kg</option>
                    <option value="pack">pack</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                  </select>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Running Low / Empty */}
      {runningLow.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-warning" />
            <h2 className="text-sm font-semibold text-text-primary">Need Attention</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
              {runningLow.length}
            </span>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {runningLow.map((item, idx) => {
                const urgencyPercent = Math.min(100, (item.estimatedRemaining / (item.lowStockThreshold || 1)) * 100);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-xl bg-surface border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center text-lg">
                        {CATEGORY_ICONS[item.category] || '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-text-primary">{item.productName}</h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
                            Running low
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          ~{item.estimatedRemaining} {item.unit} remaining
                        </p>

                        {/* Urgency bar */}
                        <div className="mt-2 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${urgencyPercent}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={cn(
                              'h-full rounded-full',
                              urgencyPercent < 30 ? 'bg-danger' : urgencyPercent < 60 ? 'bg-warning' : 'bg-success',
                            )}
                          />
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">
                          Usual cycle: {item.purchaseFrequencyDays} days
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAddToCart(item)}
                          className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                          aria-label={`Add ${item.productName} to cart`}
                        >
                          <ShoppingCart size={14} />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removePantryItem(item.id)}
                          className="w-8 h-8 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center justify-center"
                          aria-label={`Remove ${item.productName} from pantry`}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Adequate Stock */}
      {adequate.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Package size={14} className="text-success" />
            <h2 className="text-sm font-semibold text-text-primary">Good Stock</h2>
          </div>

          <div className="space-y-2">
            {adequate.map((item, idx) => {
              const fillPercent = Math.min(100, (item.estimatedRemaining / Math.max(item.lowStockThreshold || 1, item.quantity)) * 100);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 rounded-xl bg-surface border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center text-lg">
                      {CATEGORY_ICONS[item.category] || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-text-primary">{item.productName}</h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        ~{item.estimatedRemaining} {item.unit} remaining
                      </p>
                      <div className="mt-2 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${fillPercent}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="h-full rounded-full bg-success/60"
                        />
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removePantryItem(item.id)}
                      className="w-8 h-8 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all flex items-center justify-center"
                      aria-label={`Remove ${item.productName}`}
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {pantryItems.length === 0 && (
        <EmptyState
          icon={Package}
          title="Your pantry is empty"
          description="Start adding items and we'll track your inventory automatically. Add items you have at home to get running-low alerts."
          action={
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium"
            >
              Add your first item
            </button>
          }
        />
      )}
    </>
  );
}
