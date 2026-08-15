import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "ledger:auth";

function loadEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

interface AuthContextValue {
  email: string | null;
  isLoggedIn: boolean;
  isModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(loadEmail);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (email) window.localStorage.setItem(STORAGE_KEY, email);
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [email]);

  const login = useCallback((newEmail: string) => {
    setEmail(newEmail);
    setIsModalOpen(false);
  }, []);

  const logout = useCallback(() => setEmail(null), []);
  const openLoginModal = useCallback(() => setIsModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsModalOpen(false), []);

  const value = useMemo(
    () => ({ email, isLoggedIn: !!email, isModalOpen, openLoginModal, closeLoginModal, login, logout }),
    [email, isModalOpen, openLoginModal, closeLoginModal, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
