import type { Metadata } from "next";
import Providers from "./providers";
import { Container } from "@chakra-ui/react";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import AuthProvider from "./auth-provider";
import ClientOnly from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "HongBridge",
  description: "Hongik 학생정보 챗봇",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <Header />
            <Container maxW="6xl" py={8}>
              {children}
            </Container>
            <ClientOnly>
              <Toaster /> {/* 전역 토스터 */}
            </ClientOnly>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}