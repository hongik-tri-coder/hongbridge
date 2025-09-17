import type { Metadata } from "next";
import Providers from "./providers";
import { Container } from "@chakra-ui/react";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "HongBridge",
  description: "Hongik 학생정보 챗봇",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>
          <Header />
          <Container maxW="6xl" py={8}>
            {children}
          </Container>
          <Toaster /> {/* 전역 토스터 */}
        </Providers>
      </body>
    </html>
  );
}