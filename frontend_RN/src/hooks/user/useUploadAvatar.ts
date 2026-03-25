import { useMutation } from "@tanstack/react-query";
import { uploadAndSaveAvatar } from "../../services/userProfileService";
import { useUserStore } from "../../store/userStore";

// Datos que recibe la mutación
type UploadAvatarParams = {
  userId: number;
  fileUri: string;
  fileType?: string;
};

// Opciones opcionales para callbacks
type UseUploadAvatarOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

/**
 * Hook para subir un avatar
 * - Sube la imagen a Supabase Storage
 * - Guarda la URL en la base de datos
 * - Si tiene éxito, actualiza el store local con la nueva URL
 * @param options - Callbacks opcionales de éxito y error
 */
export function useUploadAvatar(options?: UseUploadAvatarOptions) {
  // Obtenemos la función para actualizar el store
  const updateUser = useUserStore((state) => state.updateUser);

  return useMutation({
    // Función que ejecuta la subida y guardado del avatar
    mutationFn: ({ userId, fileUri, fileType }: UploadAvatarParams) =>
      uploadAndSaveAvatar(userId, fileUri, fileType),

    // Si la subida fue exitosa, actualizamos el store con la nueva URL
    onSuccess: (avatarUrl) => {
      updateUser({ avatarUrl });
      // Llamamos al callback de éxito si existe
      options?.onSuccess?.();
    },

    // Si hay error, llamamos al callback de error si existe
    onError: (error) => {
      options?.onError?.(error as Error);
    },
  });
}