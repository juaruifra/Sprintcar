import { supabase } from "../lib/supabaseClient";
import { User } from "../types/user";
import i18n from "../i18n/i18n";

// Fila tal y como viene de Supabase (nombres snake_case)
export type SupabaseUserRow = {
  id: number;
  auth_user_id: string;
  role_id: number;
  name: string;
  email: string;
  avatar_url?: string;
};

/**
 * Mapea la fila de Supabase al modelo User de tu app
 * - role_id  → roleId
 * - el resto queda igual
 */
export function mapSupabaseUserToUser(
  supabaseUser: SupabaseUserRow
): User {
  return {
    id: supabaseUser.id,
    roleId: supabaseUser.role_id,
    name: supabaseUser.name,
    email: supabaseUser.email,
    avatarUrl: supabaseUser.avatar_url ?? undefined,
  };
}

/**
 * Login con email y password usando Supabase Auth
 * Devuelve SIEMPRE un User con { id, roleId, name, email }
 */
export async function loginWithEmailAndPassword(
  email: string,
  password: string
): Promise<User> {
  // Login en Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Error de credenciales, usuario no existe, etc.
    throw new Error(error.message);
  }

  if (!data.user) {
    // Por seguridad, no debería pasar si no hay error
    throw new Error(i18n.t("errors.userNotAuthenticated"));
  }

  // Leer perfil en tu tabla "users"
  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    // Solo pedimos las columnas que necesitamos
    .select("id, role_id, name, email, auth_user_id, avatar_url")
    .eq("auth_user_id", data.user.id)
    .single();

  if (profileError || !userProfile) {
    throw new Error(i18n.t("errors.userProfileLoadError"));
  }

  // MAPEAR a tu tipo User antes de devolver
  return mapSupabaseUserToUser(userProfile as SupabaseUserRow);
}

/**
 * Logout: cierra sesión en Supabase
 */
export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Restaurar sesión:
 * - Consulta la sesión actual en Supabase
 * - Si hay usuario, recupera su perfil en "users"
 * - Devuelve un User con { id, roleId, name, email, avatarUrl } o null
 */
export async function getStoredUser(): Promise<User | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Si no hay sesión activa, devolvemos null
  if (!session?.user) return null;

  const { data: userProfile, error } = await supabase
    .from("users")
    .select("id, role_id, name, email, auth_user_id, avatar_url")
    .eq("auth_user_id", session.user.id)
    .single();

  if (error || !userProfile) {
    // No hay perfil o ha fallado la consulta
    return null;
  }

  // Mapeamos a User antes de devolver
  return mapSupabaseUserToUser(userProfile as SupabaseUserRow);
}

/**
 * Cambia la contraseña del usuario autenticado
 * Primero valida la contraseña actual y luego actualiza
 * @param email - Email del usuario (tomado del store)
 * @param currentPassword - Contraseña actual (para validar)
 * @param newPassword - Nueva contraseña
 */
export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  // Validamos la contraseña actual haciendo un re-login
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (loginError) {
    throw new Error(i18n.t("errors.currentPasswordWrong"));
  }

  // Si la validación fue exitosa, cambiamos la contraseña
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error(i18n.t("errors.passwordChangeError", { message: updateError.message }));
  }
}