"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken, logOut, saveTokens, clearTokens } from "@/lib/api";

type User = { studentId: string; name?: string; email?: string } | null;

type AuthCtx = {
  user: User;
  loading: boolean;
  setToken: (token: string | null) => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // token 변동 감지
  const setToken = (token: string | null) => {
    if (token) {
      // accessToken만 직접 설정 (refresh는 별도 저장 함수 사용)
      localStorage.setItem("accessToken", token);
    } else {
      clearTokens();
    }
    void hydrate();
  };

  const hydrate = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      // accessToken에서 subject(studentId) 복호화
      const parts = token.split(".");
      if (parts.length < 2) {
        setUser(null);
        return;
      }
      try {
        const payload = JSON.parse(atob(parts[1]));
        const studentId = payload?.sub as string | undefined;
        if (studentId) setUser({ studentId });
        else setUser(null);
      } catch {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await logOut().catch(() => {});
    } finally {
      setToken(null);
    }
  };

  useEffect(() => { void hydrate(); }, []);

  return (
    <Ctx.Provider value={{ user, loading, setToken, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}