import * as ImagePicker from "expo-image-picker";
import { useUploadAvatar } from "./useUploadAvatar";
import { useDeleteAvatar } from "./useDeleteAvatar";
import { useSnackbar } from "../useSnackbar";
import { useConfirmAction } from "../useConfirmAction";
import { useTranslation } from "react-i18next";

// Parámetros que necesita el hook 
type UseAvatarManagementParams = {
  userId: number;
};

/**
 * Hook que encapsula toda la lógica de gestión del avatar
 * - Seleccionar imagen de galería
 * - Validar permisos, tamaño y tipo
 * - Subir avatar
 * - Eliminar avatar
 * - Gestiona sus propios mensajes de éxito/error y confirmaciones
 */
export function useAvatarManagement({ userId }: UseAvatarManagementParams) {
  const { t } = useTranslation();
  
  // Hook para mensajes de éxito/error
  const { showSuccess, showError: showSnackbarError, SnackbarUI } = useSnackbar();
  
  // Hook para confirmaciones y errores modales
  const { showError, confirm, ConfirmDialogUI } = useConfirmAction();
  
  // Hook para subir avatar
  const uploadAvatarMutation = useUploadAvatar({
    onSuccess: () => {
      showSuccess(t("profile.avatar.updatedSuccess"));
    },
    onError: (error) => {
      showSnackbarError(
        error instanceof Error ? error.message : t("profile.avatar.uploadError")
      );
    },
  });

  // Hook para eliminar avatar
  const deleteAvatarMutation = useDeleteAvatar({
    onSuccess: () => {
      showSuccess(t("profile.avatar.deletedSuccess"));
    },
    onError: (error) => {
      showSnackbarError(
        error instanceof Error ? error.message : t("profile.avatar.deleteError")
      );
    },
  });

  // Función para seleccionar y subir un avatar
  const handlePickAvatar = async () => {
    // Pedimos permiso para acceder a la galería
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      showError({
        title: t("profile.avatar.permissionTitle"),
        message: t("profile.avatar.permissionMessage"),
      });
      return;
    }

    // Abrimos el selector de imágenes
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Permite recortar la imagen
      aspect: [1, 1], // Proporción cuadrada para el avatar
      quality: 0.8, // Calidad de la imagen (0-1)
    });

    // Si el usuario no canceló la selección
    if (!result.canceled && result.assets[0]) {
      const selectedImage = result.assets[0];

      // Validamos el tamaño del archivo (máximo 5MB)
      const MAX_SIZE_MB = 5;
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

      if (selectedImage.fileSize && selectedImage.fileSize > MAX_SIZE_BYTES) {
        showError({
          title: t("profile.avatar.tooLargeTitle"),
          message: t("profile.avatar.tooLargeMessage", { maxSizeMb: MAX_SIZE_MB }),
        });
        return;
      }

      // Subimos el avatar
      uploadAvatarMutation.mutate({
        userId: userId,
        fileUri: selectedImage.uri,
        fileType: selectedImage.mimeType || "image/jpeg",
      });
    }
  };

  // Función para eliminar el avatar (con confirmación)
  const handleDeleteAvatar = () => {
    confirm({
      title: t("profile.avatar.deleteConfirmTitle"),
      message: t("profile.avatar.deleteConfirmMessage"),
      action: () => {
        deleteAvatarMutation.mutate({
          userId: userId,
        });
      },
    });
  };

  // Devolvemos las funciones, estados Y los componentes UI
  return {
    handlePickAvatar,
    handleDeleteAvatar,
    isUploading: uploadAvatarMutation.isPending,
    isDeleting: deleteAvatarMutation.isPending,
    // Componentes UI que deben renderizarse en el componente padre
    SnackbarUI,
    ConfirmDialogUI,
  };
}