'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useShoppingStore } from '@/store/shoppingStore';
import { useVoiceStore } from '@/store/voiceStore';
import { useUserStore } from '@/store/userStore';
import { useVoiceRecognition } from '@/lib/voice/useVoiceRecognition';
import { useSpeechSynthesis } from '@/lib/voice/useSpeechSynthesis';
import { handleVoiceCommand } from '@/lib/voice/commandHandler';
import type { CommandResult } from '@/lib/voice/commandHandler';
import { VoiceButton } from '@/components/voice/VoiceButton';
import { VoiceVisualizer } from '@/components/voice/VoiceVisualizer';
import { ShoppingList } from '@/components/shopping/ShoppingList';
import { SmartSuggestions } from '@/components/recommendations/SmartSuggestions';
import { CommandHistory } from '@/components/shopping/CommandHistory';
import { Toast } from '@/components/ui/Toast';
import { MobileNavigation, DesktopNavigation } from '@/components/ui/Navigation';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { getGreeting } from '@/lib/utils';

interface ResponseUIState {
  response: string;
  toastMessage: string;
  showToast: boolean;
}

export default function HomePage() {
  const { name, darkMode, toggleDarkMode } = useUserStore();
  const { voiceState, setVoiceState, setLastResponse } = useVoiceStore();
  const { items } = useShoppingStore();
  const { speak, cancel: cancelSpeech } = useSpeechSynthesis();

  const [uiState, setUIState] = useState<ResponseUIState>({ response: '', toastMessage: '', showToast: false });
  const [textInput, setTextInput] = useState('');
  const pendingItems = useMemo(() => items.filter(i => i.status === 'pending').length, [items]);

  // ─── Command executor (defined BEFORE useVoiceRecognition so the callback ref is stable) ───
  const executeCommand = useCallback((text: string) => {
    const result: CommandResult = handleVoiceCommand(text);

    setUIState({ response: result.message, toastMessage: result.message, showToast: true });
    setLastResponse(result.message);

    if (result.shouldSpeak) {
      speak(result.message);
    } else {
      setVoiceState('success');
      setTimeout(() => {
        if (useVoiceStore.getState().voiceState === 'success') {
          setUIState(prev => ({ ...prev, response: '' }));
          setVoiceState('idle');
        }
      }, 3000);
    }
  }, [speak, setLastResponse, setVoiceState]);

  // ─── Voice recognition (receives executeCommand as callback — fires synchronously on final transcript) ───
  const { startListening, stopListening, isSupported } = useVoiceRecognition(executeCommand);

  // ─── Clear stale error state on mount if speech recognition is actually supported ───
  useEffect(() => {
    const errorState = useVoiceStore.getState();
    if (isSupported && errorState.voiceState === 'error') {
      useVoiceStore.getState().setError(null);
    }
  }, [isSupported]);

  // ─── Voice button handler ───
  const handleVoiceClick = useCallback(() => {
    if (!isSupported) {
      if (voiceState === 'error') {
        useVoiceStore.getState().setError(null);
      }
      return;
    }
    if (voiceState === 'speaking') {
      cancelSpeech();
      setVoiceState('idle');
      return;
    }
    if (voiceState === 'listening' || voiceState === 'processing') {
      stopListening();
      return;
    }
    if (voiceState === 'error') {
      useVoiceStore.getState().setError(null);
      startListening('en-IN');
    } else if (voiceState === 'idle' || voiceState === 'success') {
      startListening('en-IN');
    }
  }, [voiceState, startListening, stopListening, isSupported, cancelSpeech, setVoiceState]);

  // ─── Text input submission ───
  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const text = textInput.trim();
    if (!text) return;
    setTextInput('');
    executeCommand(text);
  }, [textInput, executeCommand]);

  const pageContent = (
    <>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl lg:text-3xl font-bold text-text"
              >
                Welcome to ShopWise
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-text-muted mt-1"
              >
                {pendingItems > 0
                  ? `${pendingItems} item${pendingItems === 1 ? '' : 's'} on your list`
                  : 'Your shopping list is empty'}
              </motion.p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-surface transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Voice Interaction Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-2xl border border-border p-6 mb-6"
          >
            <div className="flex flex-col items-center gap-4">
              <VoiceButton onClick={handleVoiceClick} />

              <div className="text-center space-y-1">
                {(voiceState === 'idle' || voiceState === 'success') && !uiState.response && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-text-muted"
                  >
                    {isSupported ? 'Tap to speak naturally' : 'Type your command below'}
                  </motion.p>
                )}
                {voiceState === 'error' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-danger"
                  >
                    {isSupported
                      ? 'Voice input failed. Try again or type below.'
                      : 'Microphone not available in this browser. Type below.'}
                  </motion.p>
                )}
                {voiceState === 'listening' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-primary font-medium"
                  >
                    Listening...
                  </motion.p>
                )}
                {voiceState === 'processing' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-text-muted"
                  >
                    Processing...
                  </motion.p>
                )}
                {voiceState === 'speaking' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-success"
                  >
                    {uiState.response || 'Done!'}
                  </motion.p>
                )}
              </div>

              <VoiceVisualizer />

              {/* Response */}
              <AnimatePresence>
                {uiState.response && voiceState !== 'speaking' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center mb-2"
                  >
                    <p className="text-sm text-text-muted">{uiState.response}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Text Input */}
            <form onSubmit={handleTextSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder='Type a command... (e.g., "Add 2 bottles of milk")'
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="px-4 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </form>
          </motion.div>

          {/* Quick Suggestions */}
          <SmartSuggestions />

          {/* Shopping List */}
          <ShoppingList />

          {/* Command History */}
          <CommandHistory />
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop layout */}
      <div className="hidden md:flex">
        <DesktopNavigation />
        <main className="flex-1 pb-8 pt-6 px-8">
          <div className="max-w-2xl mx-auto">
            {pageContent}
          </div>
        </main>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        <MobileNavigation />
        <main className="pb-24 pt-6 px-4">
          <div className="max-w-2xl mx-auto">
            {pageContent}
          </div>
        </main>
      </div>

      {/* Toast */}
      <Toast
        message={uiState.toastMessage}
        show={uiState.showToast}
        onClose={() => setUIState(prev => ({ ...prev, showToast: false }))}
      />

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
