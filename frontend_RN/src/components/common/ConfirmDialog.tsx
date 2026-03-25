import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  Portal,
  Dialog,
  Button,
  Text,
  useTheme,
  Icon,
} from "react-native-paper";

import { useTranslation } from "react-i18next";

/**
 * Props del diálogo reutilizable
 * - confirm: Cancelar + Aceptar (con acción)
 * - error: solo Aceptar (informativo)
 */
type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  variant: "confirm" | "error";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void; // solo se usa en confirm
  onCancel: () => void;   // siempre cierra el diálogo
};

export default function ConfirmDialog({
  visible,
  title,
  message,
  variant,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isError = variant === "error";

  // Colores según variante
  const headerColor = isError
    ? theme.colors.error
    : theme.colors.primary;

  const iconName = isError
    ? "alert-circle-outline"
    : "help-circle-outline";

  const iconColor = isError
    ? theme.colors.error
    : theme.colors.primary;
    

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel}>
        {/* Header usando Dialog.Title para evitar huecos */}
        <Dialog.Title style={[styles.header, { backgroundColor: headerColor }]}>
          <Text style={styles.headerTitle}>{title}</Text>
        </Dialog.Title>

        {/* Contenido */}
        <Dialog.Content>
          <View style={styles.content}>
            {/* Icono grande y centrado */}
            <Icon
              source={iconName}
              size={56}
              color={iconColor}
            />

            {/* Mensaje */}
            <Text style={styles.message}>
              {message}
            </Text>
          </View>
        </Dialog.Content>

        {/* Acciones */}
        <Dialog.Actions>
          {/* Cancelar solo en confirmación */}
          {variant === "confirm" && (
            <Button onPress={onCancel}
            mode="outlined"
            >
              {cancelText}
            </Button>
          )}

          {/* Aceptar: ejecuta acción solo en confirm y cierra siempre */}
          <Button
            mode="contained"
            buttonColor={variant === "error" ? theme.colors.error : theme.colors.primary}
            onPress={() => {
              if (variant === "confirm") {
                onConfirm?.();
              }
              onCancel();
            }}
          >
            {confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  header: {
    margin: 0, // importante: evita espacios extra
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  message: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 8, // separa los botones (web y mobile)
    },
});
