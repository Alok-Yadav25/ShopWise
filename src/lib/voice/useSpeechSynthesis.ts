'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useVoiceStore } from '@/store/voiceStore';
import { useUserStore } from '@/store/userStore';
import { SupportedLanguage } from '@/types/voice';

// Language code mapping for TTS
const LANGUAGE_VOICE_MAP: Record<SupportedLanguage, string[]> = {
  'en': ['en-IN', 'en-US', 'en-GB'],
  'hi': ['hi-IN', 'hi'],
  'hi-en': ['en-IN', 'hi-IN', 'en-US'],
};

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis || null;
}

function getVoicesForLanguage(synth: SpeechSynthesis, lang: SupportedLanguage): SpeechSynthesisVoice[] {
  const preferredCodes = LANGUAGE_VOICE_MAP[lang] || LANGUAGE_VOICE_MAP['en'];
  const allVoices = synth.getVoices();

  // Try to find exact language matches first
  for (const code of preferredCodes) {
    const matches = allVoices.filter(v => v.lang.startsWith(code));
    if (matches.length > 0) return matches;
  }

  // Fallback: any English voice
  return allVoices.filter(v => v.lang.startsWith('en'));
}

export function useSpeechSynthesis() {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const setVoiceState = useVoiceStore(s => s.setVoiceState);
  const voiceState = useVoiceStore(s => s.voiceState);

  const {
    voiceResponseEnabled,
    speechRate,
    speechPitch,
    preferredVoiceName,
  } = useUserStore();

  const language = useUserStore(s => s.language);

  // Initialize speech synthesis
  useEffect(() => {
    synthRef.current = getSpeechSynthesis();

    // Some browsers need this to populate voices
    if (synthRef.current) {
      const loadVoices = () => {
        synthRef.current?.getVoices();
      };
      synthRef.current.addEventListener('voiceschanged', loadVoices);
      loadVoices();
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!voiceResponseEnabled) {
      // Skip TTS but still transition through states
      return;
    }

    const synth = synthRef.current || getSpeechSynthesis();
    if (!synth) {
      // TTS unavailable, skip silently
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set language
    const langCodes = LANGUAGE_VOICE_MAP[language] || LANGUAGE_VOICE_MAP['en'];
    utterance.lang = langCodes[0];

    // Find appropriate voice
    const voices = getVoicesForLanguage(synth, language);
    if (preferredVoiceName) {
      const preferred = voices.find(v => v.name === preferredVoiceName);
      if (preferred) utterance.voice = preferred;
    }
    if (!utterance.voice && voices.length > 0) {
      utterance.voice = voices[0];
    }

    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    utterance.onstart = () => {
      setVoiceState('speaking');
    };

    utterance.onend = () => {
      utteranceRef.current = null;
      setVoiceState('success');
      // Auto-transition from success to idle after brief delay
      setTimeout(() => {
        if (useVoiceStore.getState().voiceState === 'success') {
          setVoiceState('idle');
        }
      }, 1500);
    };

    utterance.onerror = (event) => {
      utteranceRef.current = null;
      // Don't treat 'interrupted' as a real error
      if (event.error === 'interrupted' || event.error === 'canceled') {
        setVoiceState('idle');
      } else {
        setVoiceState('success');
        setTimeout(() => {
          if (useVoiceStore.getState().voiceState === 'success') {
            setVoiceState('idle');
          }
        }, 1000);
      }
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  }, [voiceResponseEnabled, language, speechRate, speechPitch, preferredVoiceName, setVoiceState]);

  const cancel = useCallback(() => {
    const synth = synthRef.current || getSpeechSynthesis();
    if (synth) {
      synth.cancel();
    }
    utteranceRef.current = null;
  }, []);

  const isSpeaking = voiceState === 'speaking';
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported,
  };
}
