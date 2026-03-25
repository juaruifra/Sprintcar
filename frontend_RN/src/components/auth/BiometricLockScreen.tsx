import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

type Props = {
  onUnlock: () => void;
};

/**
 * Pantalla que bloquea la app hasta que el usuario
 * se autentique con biometría
 */
export default function BiometricLockScreen({ onUnlock }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <MaterialCommunityIcons
        name="fingerprint"
        size={80}
        color={theme.colors.primary}
      />

      <Text variant="headlineSmall" style={styles.title}>
        {t("biometric.locked.title")}
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.outline }]}>
        {t("biometric.locked.subtitle")}
      </Text>

      <Button
        mode="contained"
        onPress={onUnlock}
        style={styles.button}
        icon="fingerprint"
      >
        {t("biometric.locked.button")}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    marginTop: 24,
    fontWeight: "600",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
  },
  button: {
    marginTop: 32,
  },
});