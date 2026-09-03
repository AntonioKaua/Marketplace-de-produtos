import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUserRequest,
  loginRequest,
  logoutRequest,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getCurrentUserRequest()
      .then(response => {
        if (active) setUser(response.user);
      })
      .catch(error => {
        if (active && error.status !== 401) {
          console.error("Erro ao restaurar a sessão:", error);
        }
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    const response = await loginRequest(email, password);
    setUser(response.user);
    return response.user;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
