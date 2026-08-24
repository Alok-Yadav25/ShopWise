'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ShoppingCart, Package, Clock, Settings, Moon, Sun, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useShoppingStore } from '@/store/shoppingStore';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: typeof Search;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useUserStore();
  const { items } = useShoppingStore();

  const pendingCount = items.filter(i => i.status === 'pending').length;

  const commands: Command[] = [
    { id: 'home', label: 'Go to Home', icon: Sparkles, action: () => router.push('/'), category: 'Navigation' },
    { id: 'list', label: 'Go to Shopping List', description: `${pendingCount} items`, icon: ShoppingCart, action: () => router.push('/list'), category: 'Navigation' },
    { id: 'discover', label: 'Discover Products', icon: Search, action: () => router.push('/discover'), category: 'Navigation' },
    { id: 'pantry', label: 'Smart Pantry', icon: Package, action: () => router.push('/pantry'), category: 'Navigation' },
    { id: 'history', label: 'Purchase History', icon: Clock, action: () => router.push('/history'), category: 'Navigation' },
    { id: 'settings', label: 'Settings', icon: Settings, action: () => router.push('/settings'), category: 'Navigation' },
    { id: 'theme', label: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode', icon: darkMode ? Sun : Moon, action: toggleDarkMode, category: 'Actions' },
    { id: 'add-milk', label: 'Add Milk to List', icon: Plus, action: () => router.push('/'), category: 'Quick Add' },
    { id: 'add-eggs', label: 'Add Eggs to List', icon: Plus, action: () => router.push('/'), category: 'Quick Add' },
    { id: 'add-bread', label: 'Add Bread to List', icon: Plus, action: () => router.push('/'), category: 'Quick Add' },
  ];

  const filtered = query
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = useCallback((cmd: Command) => {
    cmd.action();
    setOpen(false);
    setQuery('');
  }, []);

  // Group commands by category
  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-hover border border-border text-sm text-text-muted hover:text-text-secondary hover:border-primary/30 transition-all"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Search or command...</span>
        <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <Search size={18} className="text-text-muted flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What do you want to do?"
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                  />
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-hover border border-border text-text-muted font-mono">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto p-2">
                  {Object.entries(grouped).map(([category, cmds]) => (
                    <div key={category} className="mb-2">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-2 py-1">
                        {category}
                      </p>
                      {cmds.map((cmd) => {
                        const Icon = cmd.icon;
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => handleSelect(cmd)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-surface-hover transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center flex-shrink-0">
                              <Icon size={16} className="text-text-secondary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary">{cmd.label}</p>
                              {cmd.description && (
                                <p className="text-xs text-text-muted">{cmd.description}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}

                  {filtered.length === 0 && (
                    <p className="text-sm text-text-muted text-center py-8">
                      No commands found
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
