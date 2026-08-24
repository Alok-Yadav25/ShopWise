'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ShoppingList } from '@/components/shopping/ShoppingList';
import { MobileNavigation, DesktopNavigation } from '@/components/ui/Navigation';
import { useShoppingStore } from '@/store/shoppingStore';
import { useVoiceStore } from '@/store/voiceStore';
import { handleVoiceCommand } from '@/lib/voice/commandHandler';
import { Toast } from '@/components/ui/Toast';

export default function ListPage() {
  const { items } = useShoppingStore();
  const { setVoiceState } = useVoiceStore();
  const [textInput, setTextInput] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const pendingCount = items.filter(i => i.status === 'pending').length;

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setVoiceState('processing');
    setTimeout(() => {
      const result = handleVoiceCommand(textInput);
      setToastMsg(result.message);
      setShowToast(true);
      setTextInput('');
      setVoiceState('idle');
      setTimeout(() => setShowToast(false), 3000);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:flex">
        <DesktopNavigation />
        <main className="flex-1 max-w-3xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary">Shopping List</h1>
            <p className="text-sm text-text-muted mt-1">{pendingCount} items to buy</p>
          </div>
          <ShoppingList />
        </main>
      </div>

      <div className="md:hidden">
        <MobileNavigation />
        <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-text-primary">Shopping List</h1>
              <p className="text-xs text-text-muted">{pendingCount} items to buy</p>
            </div>
          </div>

          {/* Voice input */}
          <div className="mb-4">
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder='Add items... "milk, eggs, bread"'
                className="flex-1 px-4 py-3 rounded-xl bg-surface border border-border text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
              />
              <button type="submit" className="px-4 py-3 rounded-xl bg-primary text-white text-sm font-medium">
                <Plus size={18} />
              </button>
            </form>
          </div>

          <ShoppingList />
        </main>
      </div>

      <Toast message={toastMsg} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}
