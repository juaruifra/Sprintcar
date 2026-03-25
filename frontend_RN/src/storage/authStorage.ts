/*
  Este archivo es la ÚNICA fuente de acceso al storage de auth.
  De momento vamos a utilizar AsyncStorage.
  En el futuro usaremos SecureStore o el que se nos recomiende sin tocar el resto de la app.
*/

import AsyncStorage from "@react-native-async-storage/async-storage";

// Claves centralizadas (mejor que strings sueltos)
const USER_KEY = "auth_user";
const TOKEN_KEY = "auth_token";

// Guardar usuario
export async function saveUser(user: unknown): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Leer usuario
export async function getUser<T>(): Promise<T | null> {
  const json = await AsyncStorage.getItem(USER_KEY);
  if (!json) return null;

  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

// Guardar token (simulado)
export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

// Leer token
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

// Borrar todo al cerrar sesión
export async function clearAuthStorage(): Promise<void> {
  await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
}
