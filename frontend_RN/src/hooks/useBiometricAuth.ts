import * as LocalAuthentication from "expo-local-authentication";

/**
 * Hook para gestionar la autenticación biométrica
 */
export function useBiometricAuth() {

  /**
   * Comprueba si el dispositivo tiene hardware biométrico (huella/face)
   */
  const checkBiometricSupport = async (): Promise<boolean> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    return compatible;
  };

  /**
   * Comprueba si el usuario tiene biometría configurada en el dispositivo
   */
  const checkBiometricEnrolled = async (): Promise<boolean> => {
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  };

  /**
   * Solicita autenticación biométrica al usuario
   * Retorna true si la autenticación fue exitosa
   */
  const authenticate = async (promptMessage?: string): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: promptMessage ?? "Confirma tu identidad",
      fallbackLabel: "Usar contraseña",
      cancelLabel: "Cancelar",
      disableDeviceFallback: false, // Permite PIN como alternativa
    });

    return result.success;
  };

  return {
    checkBiometricSupport,
    checkBiometricEnrolled,
    authenticate,
  };
}