import { create } from "zustand";
import { RoleName, User } from "../types/user";
//import type { User, RoleName } from "../data/mockApi";

/**
 * Usuario autenticado para la UI
 * Reutiliza el User del dominio y añade el rol legible
 */
export type AuthUser = User & {
  role: RoleName;
};

/**
 * Estado y acciones del store de usuario
 */
type UserState = {
  user: AuthUser | null;

  // Inicializa el usuario tras el login
  setUser: (user: AuthUser) => void;

  // Limpia el usuario al hacer logout
  clearUser: () => void;

  // Permite actualizar datos del usuario (perfil)
  updateUser: (data: Partial<AuthUser>) => void;

  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
};

/**
 * Store global de usuario autenticado
 */
export const useUserStore = create<UserState>((set) => ({
  // Al iniciar la app no hay usuario cargado
  user: null,

  // La app empieza bloqueada (para biometría)
  isLocked: true,

  // Guardamos el usuario completo
  setUser: (user) =>
    set({
      user,
    }),

  // Eliminamos el usuario (logout)
  clearUser: () =>
    set({
      user: null,
      isLocked: true
    }),

  // Actualizamos solo los campos que cambian
  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),

  // Cambia el estado de bloqueo
  setIsLocked: (locked) => set({ isLocked: locked }),
}));
