import { createContext, useContext, useState, useEffect } from "react";
import {
  type AppUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../lib/auth";

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<AppUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {
    throw new Error("AuthContext not initialized");
  },
  logout: () => {
    throw new Error("AuthContext not initialized");
  },
});

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const navigate = window.location;

  const AUTO_LOGOUT_MS = 60 * 20 * 1000; // 20 minute

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));

    const timeout = setTimeout(() => {
      logout();
    }, AUTO_LOGOUT_MS);

    return () => clearTimeout(timeout);
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await loginUser(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    if (window.location.pathname !== "/") {
      navigate.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
