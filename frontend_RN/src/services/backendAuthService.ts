import i18n from '../i18n/i18n';
import { apiClient } from '../lib/apiClient';
import { User } from '../types/user';
import {
  clearAuthStorage,
  saveToken,
  saveUser,
} from '../storage/authStorage';

type LoginResponse = {
  accessToken: string;
  user: User;
};

export type RegisterPayload = {
  email: string;
  password: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export async function loginWithEmailAndPassword(
  email: string,
  password: string,
): Promise<User> {
  const data = await apiClient.post<LoginResponse>(
    '/auth/login',
    { email, password },
    {
      // Mensaje específico de login en caso de credenciales incorrectas.
      fallbackErrorMessage: i18n.t('login.invalidCredentials'),
    },
  );

  // Guardamos token/usuario para restaurar sesión en reinicio de app.
  await saveToken(data.accessToken);
  await saveUser(data.user);

  return data.user;
}

export async function registerWithEmailAndPassword(payload: RegisterPayload): Promise<User> {
  const data = await apiClient.post<LoginResponse>('/auth/register', payload, {
    fallbackErrorMessage: i18n.t('common.unexpectedError'),
  });

  await saveToken(data.accessToken);
  await saveUser(data.user);

  return data.user;
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const user = await apiClient.get<User>('/auth/me', {
      // auth=true obliga a leer token del storage y enviarlo como Bearer.
      auth: true,
      fallbackErrorMessage: i18n.t('common.unexpectedError'),
    });

    await saveUser(user);
    return user;
  } catch {
    // Si falla el refresh de sesión, limpiamos estado local para evitar sesión zombie.
    await clearAuthStorage();
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  await clearAuthStorage();
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.post<{ success: boolean }>('/auth/change-password', payload, {
    auth: true,
    fallbackErrorMessage: i18n.t('common.unexpectedError'),
  });
}
