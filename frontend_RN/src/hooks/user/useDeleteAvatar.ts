import { useMutation } from "@tanstack/react-query";
import { deleteUserAvatar } from "../../services/userProfileService";
import { useUserStore } from "../../store/userStore";

// Datos que recibe la mutación
type DeleteAvatarParams = {
  userId: number;
};

// Opciones opcionales para callbacks
type UseDeleteAvatarOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

/**
 * Hook para eliminar el avatar del usuario
 * - Elimina el avatar de la base de datos (pone avatar_url a null)
 * - Si tiene éxito, actualiza el store local quitando el avatarUrl
 * @param options - Callbacks opcionales de éxito y error
 */
export function useDeleteAvatar(options?: UseDeleteAvatarOptions) {
  // Obtenemos la función para actualizar el store
  const updateUser = useUserStore((state) => state.updateUser);

  return useMutation({
    // Función que ejecuta la eliminación en BD
    mutationFn: ({ userId }: DeleteAvatarParams) =>
      deleteUserAvatar(userId),

    // Si la eliminación fue exitosa, quitamos avatarUrl del store
    onSuccess: () => {
      updateUser({ avatarUrl: undefined });
      // Llamamos al callback de éxito si existe
      options?.onSuccess?.();
    },

    // Si hay error, llamamos al callback de error si existe
    onError: (error) => {
      options?.onError?.(error as Error);
    },
  });
}