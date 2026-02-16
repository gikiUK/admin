"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { logout as apiLogout, checkSession } from "./api";

type AuthState = {
  authenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    checkSession()
      .then((result) => {
        setAuthenticated(result.ok);
        if (!result.ok) {
          if (result.error) {
            setError(result.error);
          } else {
            router.replace("/login");
          }
        }
      })
      .catch(() => {
        setAuthenticated(false);
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const logout = useCallback(async () => {
    await apiLogout();
    setAuthenticated(false);
    router.replace("/login");
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive text-sm">{error}</p>
        <button type="button" onClick={logout} className="text-sm text-primary underline">
          Sign out and try a different account
        </button>
      </div>
    );
  }

  if (!authenticated) return null;

  return <AuthContext.Provider value={{ authenticated, loading, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
