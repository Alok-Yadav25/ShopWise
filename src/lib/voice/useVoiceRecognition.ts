'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useVoiceStore } from '@/store/voiceStore';

// Safe browser Speech Recognition types — no native class redeclaration
interface IBrowserSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: IBrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: IBrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface IBrowserSpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface IBrowserSpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

type SpeechRecognitionConstructor = new () => IBrowserSpeechRecognition;

function getSpeechRecognitionClass(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return (w.SpeechRecognition || w.webkitSpeechRecognition) as SpeechRecognitionConstructor | null;
}

const MAX_RETRIES = 2;
const LISTENING_TIMEOUT_MS = 15000;

export function useVoiceRecognition(onFinalTranscript?: (text: string) => void) {
  const recognitionRef = useRef<IBrowserSpeechRecognition | null>(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  useEffect(() => { onFinalTranscriptRef.current = onFinalTranscript; });
  const isSupported = useVoiceStore(s => s.isSupported);

  const {
    setVoiceState,
    setTranscript,
    setInterimTranscript,
    setSupported,
    setPermissionDenied,
    setError,
  } = useVoiceStore();

  // ─── Timeout helpers (defined before startListening so they're in scope) ───

  const clearListeningTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startListeningTimeout = useCallback(() => {
    clearListeningTimeout();
    timeoutRef.current = setTimeout(() => {
      const currentState = useVoiceStore.getState().voiceState;
      if (currentState === 'listening') {
        try {
          recognitionRef.current?.stop();
        } catch { /* already stopped */ }
        setVoiceState('idle');
        recognitionRef.current = null;
      }
    }, LISTENING_TIMEOUT_MS);
  }, [clearListeningTimeout, setVoiceState]);

  // ─── Check support reactively ───

  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognitionClass();
    setSupported(!!SpeechRecognitionClass);
  }, [setSupported]);

  // ─── Start listening ───

  const startListening = useCallback(
    (lang: string = 'en-IN') => {
      const SpeechRecognitionClass = getSpeechRecognitionClass();
      if (!SpeechRecognitionClass) {
        setSupported(false);
        setError('Speech recognition is not supported in this browser.');
        return;
      }

      // Stop existing recognition to avoid duplicate instances
      retryCountRef.current = 0;
      clearListeningTimeout();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setVoiceState('listening');
        setTranscript('');
        setInterimTranscript('');
      };

      recognition.onresult = (event: IBrowserSpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        if (final) {
          setTranscript(final);
          setInterimTranscript('');
          setVoiceState('processing');
          clearListeningTimeout();
          // Explicitly stop — don't rely on 'continuous: false' auto-stop
          try { recognition.stop(); } catch { /* already stopped */ }
          // Fire callback synchronously so the consumer can process immediately
          onFinalTranscriptRef.current?.(final);
        } else if (interim) {
          setInterimTranscript(interim);
        }
      };

      recognition.onerror = (event: IBrowserSpeechRecognitionErrorEvent) => {
        clearListeningTimeout();
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionDenied(true);
          setError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech' || event.error === 'network' || event.error === 'audio-capture') {
          const currentState = useVoiceStore.getState().voiceState;
          if (currentState === 'listening' && retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            try {
              recognitionRef.current?.start();
            } catch {
              setVoiceState('idle');
              setError(event.error === 'network'
                ? 'Network error. Please check your connection.'
                : 'No speech detected. Please try again.');
              retryCountRef.current = 0;
            }
          } else {
            setVoiceState('idle');
            retryCountRef.current = 0;
            setError(event.error === 'network'
              ? 'Network error. Please check your connection.'
              : 'No speech detected. Please try again.');
          }
        } else if (event.error === 'aborted') {
          setVoiceState('idle');
          setError(null);
        } else {
          setVoiceState('idle');
          retryCountRef.current = 0;
          setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        clearListeningTimeout();
        const currentState = useVoiceStore.getState().voiceState;
        if (currentState === 'listening') {
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            try {
              recognition.start();
            } catch {
              setVoiceState('idle');
              retryCountRef.current = 0;
            }
          } else {
            setVoiceState('idle');
            retryCountRef.current = 0;
          }
        }
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
        startListeningTimeout();
      } catch {
        setError('Failed to start speech recognition. Please try again.');
        recognitionRef.current = null;
      }
    },
    [setVoiceState, setTranscript, setInterimTranscript, setSupported, setPermissionDenied, setError, clearListeningTimeout, startListeningTimeout],
  );

  // ─── Stop listening ───

  const stopListening = useCallback(() => {
    retryCountRef.current = MAX_RETRIES;
    clearListeningTimeout();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setVoiceState('idle');
  }, [clearListeningTimeout, setVoiceState]);

  // ─── Reset transcript ───

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, [setTranscript, setInterimTranscript]);

  // ─── Cleanup on unmount ───

  useEffect(() => {
    return () => {
      clearListeningTimeout();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
        recognitionRef.current = null;
      }
    };
  }, [clearListeningTimeout]);

  return {
    startListening,
    stopListening,
    resetTranscript,
    isListening: useVoiceStore(s => s.voiceState) === 'listening',
    isSupported,
  };
}
