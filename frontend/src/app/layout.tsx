import type { Metadata } from "next";
import Providers from "./providers";
import Header from "@/components/Header";
import { Container, Theme } from "@chakra-ui/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "HongBridge",
  description: "Hongik 학생정보 챗봇",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          {/* 라이트 모드 강제 */}
          <Theme appearance="light">
            <Header />
            <Container maxW="6xl" py={8}>
              {children}
            </Container>
          </Theme>
        </Providers>
      </body>
    </html>
  );
}