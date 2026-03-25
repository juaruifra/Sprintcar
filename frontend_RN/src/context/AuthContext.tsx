import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// Servicios de auth con backend propio
import {
  getStoredUser,
  loginWithEmailAndPassword,
  logoutUser,
  registerWithEmailAndPassword,
} from "../services/backendAuthService";

import { useUserStore } from "../store/userStore";

/*
  DEFINIMOS qué información va a compartir el contexto
*/
type AuthContextType = {
  isAuthenticated: boolean; // ¿hay sesión activa?
  isLoading: boolean;       // ¿estamos restaurando sesión?
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

/*
  CREAMOS el contexto
*/
const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

/*
  PROVIDER de autenticación
*/
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const user = useUserStore((state) => state.user);
  const setIsLocked = useUserStore((state) => state.setIsLocked);

  /*
    Restaurar sesión al arrancar la app
    (por ahora sigue usando getStoredUser)
  */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await getStoredUser();

        if (storedUser) {
          // Convertimos roleId numérico a rol de UI
          setUser({
            ...storedUser,
            role: storedUser.roleId === 1 ? "ADMIN" : "NORMAL",
          });
        }
      } catch (error) {
        console.warn("Error restaurando sesión", error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  /*
    LOGIN
    - Autentica contra backend propio
    - Guarda el usuario en Zustand
  */
  const login = async (email: string, password: string) => {
    const loggedUser = await loginWithEmailAndPassword(
      email,
      password
    );

    setUser({
      ...loggedUser,
      role: loggedUser.roleId === 1 ? "ADMIN" : "NORMAL",
    });

    setIsLocked(false);  // Desbloquear porque hizo login manual
  };

  const register = async (email: string, password: string) => {
    const registeredUser = await registerWithEmailAndPassword({
      email,
      password,
    });

    setUser({
      ...registeredUser,
      role: registeredUser.roleId === 1 ? "ADMIN" : "NORMAL",
    });

    setIsLocked(false);
  };

  /*
    LOGOUT
    - Limpia sesión local y store global
  */
  const logout = async () => {
    await logoutUser();
    clearUser();
  };

  /*
    Valor compartido por el contexto
  */
  const value: AuthContextType = {
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/*
  Hook helper
*/
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe usarse dentro de un AuthProvider"
    );
  }

  return context;
};
