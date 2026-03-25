import i18n from '../i18n/i18n';
import { apiClient } from '../lib/apiClient';

type UpdateProfilePayload = {
  name?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  documentId?: string;
};

/**
 * Actualiza datos del perfil del usuario autenticado contra backend propio.
 * El parámetro userId se mantiene para no romper hooks existentes, aunque ya no se usa.
 */
export async function updateUserName(
  userId: number,
  name: string,
  extraData?: Omit<UpdateProfilePayload, 'name'>,
): Promise<void> {
  const payload: UpdateProfilePayload = {
    name,
    ...extraData,
  };

  // Referenciamos userId para dejar explícito que se ignora por diseño (el backend usa JWT).
  void userId;

  await apiClient.put('/users/me', payload, {
    auth: true,
    fallbackErrorMessage: i18n.t('common.unexpectedError'),
  });
}

/**
 * Tipos de archivo permitidos para avatares
 */
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

/**
 * Valida que el tipo de archivo sea una imagen permitida
 * @param fileType - Tipo MIME del archivo
 * @returns true si es válido, false si no
 */
function isValidImageType(fileType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(fileType.toLowerCase());
}

/**
 * Obtiene la extensión del archivo según su tipo MIME
 * @param fileType - Tipo MIME del archivo
 * @returns Extensión del archivo (.jpg o .png)
 */
function getFileExtension(fileType: string): string {
  if (fileType === "image/png") return ".png";
  return ".jpg"; // Por defecto jpeg/jpg
}

/**
 * Sube un avatar a Supabase Storage y devuelve su URL pública
 * Solo permite imágenes JPG y PNG
 * @param userId - ID del usuario (se usa para nombrar el archivo)
 * @param fileUri - URI local del archivo en el dispositivo
 * @param fileType - Tipo MIME del archivo (debe ser 'image/jpeg' o 'image/png')
 */
export async function uploadAvatarToStorage(
  userId: number,
  fileUri: string,
  fileType: string = "image/jpeg"
): Promise<string> {
  // Validamos que sea un tipo de imagen permitido
  if (!isValidImageType(fileType)) {
    throw new Error(
      "Tipo de archivo no permitido. Solo se aceptan imágenes JPG y PNG"
    );
  }

  // Armamos multipart/form-data para enviar imagen al endpoint backend.
  const extension = getFileExtension(fileType);
  const formData = new FormData();

  // Nombre consistente para el archivo enviado.
  const fileName = `avatar_${userId}${extension}`;

  // En web (uri tipo blob:http://...), necesitamos adjuntar un Blob real.
  // En nativo mantenemos el objeto { uri, name, type }.
  if (fileUri.startsWith("blob:") || fileUri.startsWith("http://") || fileUri.startsWith("https://")) {
    const sourceResponse = await fetch(fileUri);
    const sourceBlob = await sourceResponse.blob();
    const typedBlob = new Blob([sourceBlob], { type: fileType });

    formData.append('avatar', typedBlob, fileName);
    formData.append('file', typedBlob, fileName);
  } else {
    const fileObject = {
      uri: fileUri,
      name: fileName,
      type: fileType,
    } as any;

    formData.append('avatar', fileObject);
    formData.append('file', fileObject);
  }

  const data = await apiClient.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
    auth: true,
    // Para multipart dejamos que fetch gestione el Content-Type con boundary.
    fallbackErrorMessage: i18n.t('common.unexpectedError'),
  });

  return data.avatarUrl;
}

/**
 * Función completa: sube el avatar y actualiza la BD
 * @param userId - ID del usuario
 * @param fileUri - URI local del archivo
 * @param fileType - Tipo MIME del archivo
 * @returns La URL pública del nuevo avatar
 */
export async function uploadAndSaveAvatar(
  userId: number,
  fileUri: string,
  fileType?: string
): Promise<string> {
  // El backend ya sube el archivo y persiste avatarUrl en la base de datos.
  // Solo devolvemos la URL resultante para sincronizar el estado local.
  return uploadAvatarToStorage(userId, fileUri, fileType);
}

/**
 * Elimina el avatar del usuario
 * Pone avatar_url a null en la base de datos
 * @param userId - ID del usuario
 */
export async function deleteUserAvatar(userId: number): Promise<void> {
  // Referenciamos userId para dejar explícito que se ignora por diseño (el backend usa JWT).
  void userId;

  await apiClient.delete('/users/me/avatar', {
    auth: true,
    fallbackErrorMessage: i18n.t('common.unexpectedError'),
  });
}