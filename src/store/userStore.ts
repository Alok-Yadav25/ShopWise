import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SupportedLanguage } from '@/types/voice';

interface UserStore {
  name: string;
  language: SupportedLanguage;
  darkMode: boolean;
  dietaryPreferences: string[];
  favoriteBrands: string[];
  region: string;
  showDemo: boolean;
  _hasHydrated: boolean;

  // Voice settings
  voiceResponseEnabled: boolean;
  speechRate: number;
  speechPitch: number;
  preferredVoiceName: string;

  setName: (name: string) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  setDietaryPreferences: (prefs: string[]) => void;
  setFavoriteBrands: (brands: string[]) => void;
  setShowDemo: (show: boolean) => void;
  setHasHydrated: (v: boolean) => void;
  setVoiceResponseEnabled: (enabled: boolean) => void;
  setSpeechRate: (rate: number) => void;
  setSpeechPitch: (pitch: number) => void;
  setPreferredVoiceName: (name: string) => void;
  resetUser: () => void;
}

const defaultUser = {
  name: '',
  language: 'en' as SupportedLanguage,
  darkMode: false,
  dietaryPreferences: [] as string[],
  favoriteBrands: ['Amul', 'Britannia', 'Tata'],
  region: 'Mumbai',
  showDemo: true,
  voiceResponseEnabled: false,
  speechRate: 1.0,
  speechPitch: 1.0,
  preferredVoiceName: '',
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...defaultUser,
      _hasHydrated: false,

      setName: (name) => set({ name }),
      setLanguage: (language) => set({ language }),
      toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
      setDarkMode: (darkMode) => set({ darkMode }),
      setDietaryPreferences: (dietaryPreferences) => set({ dietaryPreferences }),
      setFavoriteBrands: (favoriteBrands) => set({ favoriteBrands }),
      setShowDemo: (showDemo) => set({ showDemo }),
      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),
      setVoiceResponseEnabled: (voiceResponseEnabled) => set({ voiceResponseEnabled }),
      setSpeechRate: (speechRate) => set({ speechRate }),
      setSpeechPitch: (speechPitch) => set({ speechPitch }),
      setPreferredVoiceName: (preferredVoiceName) => set({ preferredVoiceName }),
      resetUser: () => set({ ...defaultUser, _hasHydrated: true }),
    }),
    {
      name: 'shopwise-user',
      version: 1,
      partialize: (state) => ({
        name: state.name,
        language: state.language,
        darkMode: state.darkMode,
        dietaryPreferences: state.dietaryPreferences,
        favoriteBrands: state.favoriteBrands,
        region: state.region,
        voiceResponseEnabled: state.voiceResponseEnabled,
        speechRate: state.speechRate,
        speechPitch: state.speechPitch,
        preferredVoiceName: state.preferredVoiceName,
      }),
    }
  )
);
