"use client";
import * as React from "react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import EmotionRoot from "@/lib/emotion";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRoot>
      <ChakraProvider value={defaultSystem}>
        {children}
      </ChakraProvider>
    </EmotionRoot>
  );
}