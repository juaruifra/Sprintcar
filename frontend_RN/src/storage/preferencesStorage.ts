import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Clave única donde guardamos las preferencias
 */
const PREFERENCES_KEY = "app_preferences";

/**
 * Tipo de las preferencias que vamos a persistir
 */
export type StoredPreferences = {
  theme: "light" | "dark";
  language: "es" | "en";
  biometricEnabled: boolean;
};

/**
 * Guardar preferencias en storage
 */
export const savePreferences = async (
  preferences: StoredPreferences
) => {
  await AsyncStorage.setItem(
    PREFERENCES_KEY,
    JSON.stringify(preferences)
  );
};

/**
 * Leer preferencias desde storage
 */
export const getPreferences = async (): Promise<StoredPreferences | null> => {
  const raw = await AsyncStorage.getItem(PREFERENCES_KEY);

  if (!raw) return null;

  return JSON.parse(raw);
};
