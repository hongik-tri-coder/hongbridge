"use client";
import NextLink from "next/link";
import { Box, Flex, HStack, Heading, Button } from "@chakra-ui/react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const baseBtn = {
    as: "span" as const,
    border: "1px solid",
    borderColor: "black",
    _focusVisible: { outline: "2px solid", outlineColor: "black" },
    _active: { transform: "translateY(1px)" },
  };

  return (
    <Box borderBottom="1px solid" borderColor="gray.100" bg="white">
      <Flex maxW="6xl" mx="auto" px={6} py={4} align="center" justify="space-between">
        <Heading size="md">HongBridge</Heading>

        <HStack gap={3}>
          <NextLink href="/" aria-current={isActive("/") ? "page" : undefined}>
            <Button
              {...baseBtn}
              bg={isActive("/") ? "black" : "transparent"}
              color={isActive("/") ? "white" : "black"}
              _hover={{ bg: "black", color: "white" }}
            >
              Home
            </Button>
          </NextLink>

          <NextLink href="/chat" aria-current={isActive("/chat") ? "page" : undefined}>
            <Button
              {...baseBtn}
              bg={isActive("/chat") ? "black" : "transparent"}
              color={isActive("/chat") ? "white" : "black"}
              _hover={{ bg: "black", color: "white" }}
            >
              Chat
            </Button>
          </NextLink>
        </HStack>
      </Flex>
    </Box>
  );
}