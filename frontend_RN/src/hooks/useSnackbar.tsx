import React, { useState } from "react";
import { Snackbar, useTheme, Text } from "react-native-paper";
import { AppTheme } from "../theme/theme.types";

type SnackbarState = {
  visible: boolean;
  message: string;
  type: "success" | "error";
};

/**
 * Hook para mostrar mensajes temporales (toast/snackbar)
 * con estilos de éxito o error
 */
export function useSnackbar() {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: "",
    type: "success",
  });

  // Muestra un mensaje de éxito
  const showSuccess = (message: string) => {
    setSnackbar({
      visible: true,
      message,
      type: "success",
    });
  };

  // Muestra un mensaje de error
  const showError = (message: string) => {
    setSnackbar({
      visible: true,
      message,
      type: "error",
    });
  };

  // Cierra el snackbar
  const hideSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, visible: false }));
  };

  // Componente que debe renderizarse en la pantalla
  const SnackbarUI = () => {
    const theme = useTheme<AppTheme>();
    return (

    <Snackbar
      visible={snackbar.visible}
      onDismiss={hideSnackbar}
      duration={4000} // Se cierra automáticamente en 4 segundos
      style={{
        backgroundColor:
          snackbar.type === "success"
            ? theme.colors.successContainer
            : theme.colors.errorContainer,
      }}
      wrapperStyle={{ bottom: 20 }}
      action={{
        label: "Cerrar",
        onPress: hideSnackbar,
      }}
    >
      <Text
            style={{
            color: snackbar.type === "success"
                ? theme.colors.onSuccessContainer
                : theme.colors.onErrorContainer,
            fontWeight: "500",
            }}
        >
            {snackbar.message}
        </Text>
    </Snackbar>
  );
  };

  return {
    showSuccess,
    showError,
    SnackbarUI,
  };
}