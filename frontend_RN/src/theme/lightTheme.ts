import { MD3LightTheme } from "react-native-paper";
import { AppTheme } from "./theme.types";

/**
 * Tema claro con colores personalizados
 */
export const lightTheme: AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Colores de éxito (verde)
    success: "#2E7D32",              // Verde oscuro
    onSuccess: "#FFFFFF",            // Blanco sobre verde
    successContainer: "#A5D6A7",     // Verde claro para fondos
    onSuccessContainer: "#1B5E20",   // Verde muy oscuro para texto
  },
};
