import { MD3DarkTheme } from "react-native-paper";
import { AppTheme } from "./theme.types";

/**
 * Tema oscuro con colores personalizados
 */
export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Colores de éxito (verde)
    success: "#4CAF50",              // Verde medio
    onSuccess: "#FFFFFF",            // Blanco sobre verde
    successContainer: "#1B5E20",     // Verde oscuro para fondos
    onSuccessContainer: "#C8E6C9",   // Verde claro para texto
  },
};
