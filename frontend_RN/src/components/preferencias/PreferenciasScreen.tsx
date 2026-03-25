import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  Text,
  Switch,
  Divider,
  Button,
  Menu,
  useTheme,
} from "react-native-paper";

import AppHeader from "../layout/AppHeader";
import { usePreferencesStore } from "../../store/preferencesStore";

import { useTranslation } from "react-i18next";

import { useBiometricAuth } from "../../hooks/useBiometricAuth";

export default function PreferenciasScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  // Estado global de preferencias (Zustand)
  const {
    theme: currentTheme,
    language,
    setTheme,
    setLanguage,
    biometricEnabled,
    setBiometricEnabled,
  } = usePreferencesStore();

  // Controla si el menú de idioma está abierto
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);

  // ¿Está en modo oscuro?
  const isDark = currentTheme === "dark";

  // Texto legible del idioma actual
  //const languageLabel = language === "es" ? "Español" : "Inglés";
  const languageLabel = language === "es" 
  ? t("preferences.language.spanish") 
  : t("preferences.language.english");

  // Hook de biometría
  const { checkBiometricSupport, checkBiometricEnrolled, authenticate } = useBiometricAuth();

  // Controlar si el dispositivo soporta biometria y tiene configurada alguna
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Comprobamos al montar el componente
  useEffect(() => {
    const checkBiometric = async () => {
      const supported = await checkBiometricSupport();
      const enrolled = await checkBiometricEnrolled();
      setBiometricAvailable(supported && enrolled);
    };
    checkBiometric();
  }, []);

  // Cuando el usuario activa la biometría, pedimos que la confirme
  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Si quiere activar, primero debe autenticarse
      const success = await authenticate(t("biometric.confirmToEnable"));
      if (success) {
        setBiometricEnabled(true);
      }
    } else {
      // Desactivar no requiere confirmación
      setBiometricEnabled(false);
    }
  };

  return (
    <View style={[{ flex: 1 }, { backgroundColor: theme.colors.background }]}>
      {/* Barra superior reutilizable */}
      <AppHeader />

      {/* Contenido de la pantalla */}
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            {/* Título principal */}
            <Text variant="titleMedium" style={styles.title}>
              {t("preferences.title")}
            </Text>

            {/* ===== BLOQUE: TEMA ===== */}
            <Text variant="labelLarge" style={styles.sectionTitle}>
              {t("preferences.theme.title")}
            </Text>

            <View style={styles.row}>
              <View style={styles.textBlock}>
                <Text>{t("preferences.theme.darkMode")}</Text>
                <Text style={styles.helper}>
                  {t("preferences.theme.helper")}
                </Text>
              </View>

              <Switch
                value={isDark}
                onValueChange={(value) =>
                  setTheme(value ? "dark" : "light")
                }
                color={theme.colors.primary}
              />
            </View>

            <Divider style={styles.divider} />

            {/* ===== BLOQUE: IDIOMA ===== */}
            <Text variant="labelLarge" style={styles.sectionTitle}>
              {t("preferences.language.title")}
            </Text>

            <Menu
              visible={languageMenuVisible}
              onDismiss={() => setLanguageMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setLanguageMenuVisible(true)}
                  // Que el texto y el icono queden separados
                  contentStyle={styles.languageButtonContent}
                  icon="chevron-down"
                >
                  {languageLabel}
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setLanguage("es");
                  setLanguageMenuVisible(false);
                }}
                title={t("preferences.language.spanish")}
              />
              <Menu.Item
                onPress={() => {
                  setLanguage("en");
                  setLanguageMenuVisible(false);
                }}
                title={t("preferences.language.english")}
              />
            </Menu>

            {/* <Text style={styles.helper}>
              El idioma se usará para los textos de la aplicación
              más adelante.
            </Text> */}

            {/* ===== BLOQUE: BIOMETRÍA ===== */}
            {biometricAvailable && (
              <>
                <Divider style={styles.divider} />
                
                <Text variant="labelLarge" style={styles.sectionTitle}>
                  {t("preferences.biometric.title")}
                </Text>

                <View style={styles.row}>
                  <View style={styles.textBlock}>
                    <Text>{t("preferences.biometric.enable")}</Text>
                    <Text style={styles.helper}>
                      {t("preferences.biometric.helper")}
                    </Text>
                  </View>

                  <Switch
                    value={biometricEnabled}
                    onValueChange={handleBiometricToggle}
                    color={theme.colors.primary}
                  />
                </View>
              </>
            )}




          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  card: {
    borderRadius: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textBlock: {
    flex: 1,
    paddingRight: 16,
  },
  helper: {
    marginTop: 4,
    opacity: 0.6,
    fontSize: 12,
  },
  divider: {
    marginVertical: 16,
  },
  languageButtonContent: {
    flexDirection: "row-reverse", // icono a la derecha
    justifyContent: "space-between",
  },
});
