import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

const TOKEN_KEY = "unitrip_token";
const ROLE_KEY = "unitrip_role";
const USER_KEY = "unitrip_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((data) => {
        setRole(data.role);
        setUser(data.user);
        localStorage.setItem(ROLE_KEY, data.role);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, [token]);

  function persist(session) {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(ROLE_KEY, session.role);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    setToken(session.token);
    setRole(session.role);
    setUser(session.user);
  }

  async function login(email, password) {
    const data = await authApi.login({ email, password });
    persist(data);
    return data;
  }

  async function register(payload) {
    const data = await authApi.register(payload);
    persist(data);
    return data;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setRole(null);
    setUser(null);
  }

  const value = {
    token,
    role,
    user,
    loading,
    isAuthenticated: !!token,
    isAdmin: role === "admin",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
