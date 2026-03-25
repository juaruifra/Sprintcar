import { MD3Theme } from "react-native-paper";

/**
 * Colores personalizados que añadimos al tema de Paper
 */
export type CustomColors = {
  success: string;
  onSuccess: string;
  successContainer: string;
  onSuccessContainer: string;
};

/**
 * Tema extendido con nuestros colores personalizados
 */
export type AppTheme = MD3Theme & {
  colors: MD3Theme["colors"] & CustomColors;
};

/**
 * Declaración para que TypeScript reconozca los colores personalizados
 * en useTheme() de toda la app
 */
declare global {
  namespace ReactNativePaper {
    interface Theme extends AppTheme {}
  }
}
