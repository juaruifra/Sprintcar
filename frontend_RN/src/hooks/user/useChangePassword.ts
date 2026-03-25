import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../../services/backendAuthService";

// Datos que recibe la mutación
type ChangePasswordParams = {
  currentPassword: string;
  newPassword: string;
};

// Opciones opcionales para callbacks
type UseChangePasswordOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

/**
 * Hook para cambiar la contraseña del usuario
 * - Valida la contraseña actual
 * - Actualiza la contraseña en Supabase
 * @param options - Callbacks opcionales de éxito y error
 */
export function useChangePassword(options?: UseChangePasswordOptions) {
  return useMutation({
    // Función que ejecuta el cambio de contraseña
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordParams) =>
      changePassword({ currentPassword, newPassword }),

    // Si el cambio fue exitoso, llamamos al callback
    onSuccess: () => {
      options?.onSuccess?.();
    },

    // Si hay error, llamamos al callback de error
    onError: (error) => {
      options?.onError?.(error as Error);
    },
  });
}