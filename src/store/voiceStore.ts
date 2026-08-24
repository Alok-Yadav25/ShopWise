import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VoiceState } from '@/types/voice';

interface VoiceStore {
  voiceState: VoiceState;
  transcript: string;
  interimTranscript: string;
  lastResponse: string;
  isSupported: boolean;
  permissionDenied: boolean;
  error: string | null;

  setVoiceState: (state: VoiceState) => void;
  setTranscript: (text: string) => void;
  setInterimTranscript: (text: string) => void;
  setLastResponse: (text: string) => void;
  setSupported: (supported: boolean) => void;
  setPermissionDenied: (denied: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceStore>()(
  persist(
    (set) => ({
      voiceState: 'idle',
      transcript: '',
      interimTranscript: '',
      lastResponse: '',
      isSupported: false,
      permissionDenied: false,
      error: null,

      setVoiceState: (voiceState) => set({ voiceState }),
      setTranscript: (transcript) => set({ transcript }),
      setInterimTranscript: (interimTranscript) => set({ interimTranscript }),
      setLastResponse: (lastResponse) => set({ lastResponse }),
      setSupported: (isSupported) => set({ isSupported }),
      setPermissionDenied: (permissionDenied) => set({ permissionDenied }),
      setError: (error) => set({ error, voiceState: error ? 'error' : 'idle' }),
      reset: () => set({ voiceState: 'idle', transcript: '', interimTranscript: '', error: null }),
    }),
    {
      name: 'shopwise-voice',
      version: 1,
      partialize: (state) => ({
        lastResponse: state.lastResponse,
        isSupported: state.isSupported,
        permissionDenied: state.permissionDenied,
      }),
    }
  )
);
