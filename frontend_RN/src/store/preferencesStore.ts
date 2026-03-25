import { create } from "zustand";
import {
  getPreferences,
  savePreferences,
  StoredPreferences,
} from "../storage/preferencesStorage";

/**
 * Estado y acciones del store de preferencias
 */
type PreferencesState = {
  theme: "light" | "dark";
  language: "es" | "en";
  biometricEnabled: boolean;
  isReady: boolean; // antes isHydrated

  setTheme: (theme: PreferencesState["theme"]) => void;
  setLanguage: (language: PreferencesState["language"]) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  loadPreferences: () => Promise<void>;
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  theme: "light",
  language: "es",
  biometricEnabled: false,
  isReady: false,

  setTheme: (theme) => {
    set({ theme });

    const { language, biometricEnabled } = get();
    savePreferences({ theme, language, biometricEnabled });
  },

  setLanguage: (language) => {
    set({ language });

    const { theme, biometricEnabled } = get();
    savePreferences({ theme, language, biometricEnabled });
  },

  setBiometricEnabled: (biometricEnabled) => {
    set({ biometricEnabled });

    const { theme, language } = get();
    savePreferences({ theme, language, biometricEnabled });
  },

  /**
   * Carga las preferencias guardadas al iniciar la app
   */
  loadPreferences: async () => {
    const stored = await getPreferences();

    if (stored) {
      set({
        theme: stored.theme,
        language: stored.language,
        biometricEnabled: stored.biometricEnabled ?? false,
      });
    }

    set({ isReady: true });
  },
}));
