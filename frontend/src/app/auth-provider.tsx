"use client";

import { createContext, useContext, useEffect, useState } from "react";

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
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    void hydrate(); // 갱신
  };

  const hydrate = async () => {
    try {
      setLoading(true);
      // 1) 토큰이 있으면 우선 로그인된 걸로 가정하고 /me로 검증
      const token = localStorage.getItem("token");
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
      const res = await fetch(`${base}/api/auth/me`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setUser({ studentId: data.studentId, name: data.name, email: data.email });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
      // 서버 세션이 있다면 무시해도 안전
      await fetch(`${base}/api/auth/sign-out`, { method: "POST", credentials: "include" }).catch(() => {});
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