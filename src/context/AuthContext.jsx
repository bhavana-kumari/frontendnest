import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authService
      .me()
      .then((nextUser) => {
        if (active) setUser(nextUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener("nestfind:unauthorized", onUnauthorized);
    return () => window.removeEventListener("nestfind:unauthorized", onUnauthorized);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(payload) {
        const nextUser = await authService.login(payload);
        setUser(nextUser);
        return nextUser;
      },
      async register(payload) {
        const nextUser = await authService.register(payload);
        setUser(nextUser);
        return nextUser;
      },
      async logout() {
        await authService.logout();
        setUser(null);
      },
      setUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
