import React from "react";
import { View, StyleSheet } from "react-native";
import AppHeader from "../layout/AppHeader";
import { Text, useTheme } from "react-native-paper";

import { useTranslation } from "react-i18next";

export default function PedidosScreen() {

  const theme = useTheme();
  const { t } = useTranslation();

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Barra superior reutilizable */}
        <AppHeader />

        {/* Contenido principal de la pagina de pedidos */}
        <View style={styles.content}>
          <Text variant="titleMedium">
            {t("orders.subtitle")}
          </Text>

        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});


