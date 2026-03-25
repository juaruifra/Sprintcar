import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { lightTheme, darkTheme } from "../src/theme/index";

import { AuthProvider } from "../src/context/AuthContext";
import { usePreferencesStore } from "../src/store/preferencesStore";
import { useUserStore } from "../src/store/userStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Inicialización de i18n
import "../src/i18n/i18n"; 
import i18n from "i18next";

import { useBiometricAuth } from "../src/hooks/useBiometricAuth";
import BiometricLockScreen from "../src/components/auth/BiometricLockScreen";
import { useTranslation } from "react-i18next";

export default function RootLayout() {
  // Obtenemos estado y acciones del store de preferencias
  const themeMode = usePreferencesStore((state) => state.theme);
  // Obtenemos el idioma seleccionado para configurarlo
  const language = usePreferencesStore((state) => state.language);
  const isReady = usePreferencesStore((state) => state.isReady);
  const loadPreferences = usePreferencesStore(
    (state) => state.loadPreferences
  );
  
  // Biometría
  const biometricEnabled = usePreferencesStore((state) => state.biometricEnabled);
  const user = useUserStore((state) => state.user);
  const isLocked = useUserStore((state) => state.isLocked);
  const setIsLocked = useUserStore((state) => state.setIsLocked);
  const { authenticate } = useBiometricAuth();
  const { t } = useTranslation();

  // Función para intentar desbloquear
  const handleUnlock = async () => {
    const success = await authenticate(t("biometric.locked.subtitle"));
    if (success) {
      setIsLocked(false);
    }
  };

  // Crear una instancia de QueryClient
  const queryClient = new QueryClient();

  // Al arrancar la app cargamos las preferencias guardadas
  useEffect(() => {
    loadPreferences();
  }, []);

  // Actualizamos el idioma de i18n
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  // Mientras no estén listas, no renderizamos la app
  if (!isReady) {
    return null;
  }

  // Elegimos el tema personalizado según las preferencias
  const theme = themeMode === "dark" ? darkTheme : lightTheme;

  // Si hay usuario autenticado, biometría activada y la app está bloqueada
  if (user && biometricEnabled && isLocked) {
    return (
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <BiometricLockScreen onUnlock={handleUnlock} />
        </PaperProvider>
      </QueryClientProvider>
    );
  }

  return (
    //Envolver toda la app con QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
