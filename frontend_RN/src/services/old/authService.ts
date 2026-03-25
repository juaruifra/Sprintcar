import {
  saveUser,
  getUser,
  saveToken,
  clearAuthStorage,
} from "../../storage/authStorage";

import { User,credentials,usuarios } from "../../data/mockApi";

// Función auxiliar para simular tiempo de espera (latencia de red)
const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// Login con email y contraseña
export async function loginWithEmailAndPassword(
  email: string,
  password: string
): Promise<User> {

  // Simulamos una llamada al backend
  await delay(800);

  // Buscamos el usuario por email
  const user = usuarios.find(
    (u) => u.email === email
  );

  if (!user) {
    // Si el email no existe, devolvemos un error genérico
    throw new Error("Correo o contraseña incorrectos");
  }

  // Buscamos la credencial asociada a ese usuario
  const credential = credentials.find(
    (c) => c.userId === user.id
  );

  if (!credential) {
    // El usuario existe pero no tiene credenciales configuradas
    throw new Error("Credenciales no configuradas");
  }

  // Comprobamos si la contraseña coincide
  if (credential.password !== password) {
    throw new Error("Correo o contraseña incorrectos");
  }

  // Simulamos un token devuelto por el backend
  const fakeToken = `FAKE_TOKEN_${user.id}`;

  // Guardamos el usuario y el token en el almacenamiento
  await saveUser(user);
  await saveToken(fakeToken);

  // Devolvemos el usuario sin password
  return user;
}



// Leer usuario persistido
export async function getStoredUser(): Promise<User | null> {
  return getUser<User>();
}

// Logout
export async function logoutUser(): Promise<void> {
  await clearAuthStorage();
}

export { User };
