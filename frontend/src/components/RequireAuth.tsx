"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname ?? "/");
      router.replace(`/signin?next=${next}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) return null;
  if (!user) return null;
  return <>{children}</>;
}