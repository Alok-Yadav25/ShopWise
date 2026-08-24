'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, List, Compass, Package, Clock, Settings, Moon, Sun, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/list', label: 'List', icon: List },
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/pantry', label: 'Pantry', icon: Package },
  { href: '/history', label: 'History', icon: Clock },
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-xl border-t border-border safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors relative',
                isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopNavigation() {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useUserStore();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-surface h-screen sticky top-0">
      {/* Logo + Search */}
      <div className="px-6 py-5 border-b border-border space-y-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-text-primary tracking-tight">Shopwise</span>
        </Link>
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-hover border border-border text-xs text-text-muted hover:border-primary/30 transition-all"
        >
          <Search size={13} />
          <span>Search...</span>
          <kbd className="ml-auto text-[10px] px-1 py-0.5 rounded bg-surface border border-border font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
              )}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings and theme */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all w-full"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
          )}
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
