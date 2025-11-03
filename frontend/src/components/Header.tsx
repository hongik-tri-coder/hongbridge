// src/components/Header.tsx
"use client";
import NextLink from "next/link";
import { Box, Flex, HStack, Heading, Button } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import useMounted from "@/hooks/useMounted";
import { useAuth } from "@/app/auth-provider";
import { toastBus } from "@/utils/toast-bus";

export default function Header() {
  const mounted = useMounted();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  if (!mounted) return null;

  const isActive = (p: string) => pathname === p;
  const baseBtn = {
    as: "span" as const,
    border: "1px solid",
    borderColor: "black",
    _focusVisible: { outline: "2px solid", outlineColor: "black" },
    _active: { transform: "translateY(1px)" },
  };

  const onClickSignOut = async () => {
    await signOut();
    toastBus.info("로그아웃 완료", "다음에 또 만나요!");
  };

  return (
    <Box borderBottom="1px solid" borderColor="gray.100" bg="white">
      <Flex maxW="6xl" mx="auto" px={6} py={4} align="center" justify="space-between">
        <Heading size="md">HongBridge</Heading>
        <HStack gap={3}>
          <NextLink href="/" aria-current={isActive("/") ? "page" : undefined}>
            <Button {...baseBtn}
              bg={isActive("/") ? "black" : "transparent"}
              color={isActive("/") ? "white" : "black"}
              _hover={{ bg: "black", color: "white" }}>
              Home
            </Button>
          </NextLink>

          <NextLink href="/chat" aria-current={isActive("/chat") ? "page" : undefined}>
            <Button {...baseBtn}
              bg={isActive("/chat") ? "black" : "transparent"}
              color={isActive("/chat") ? "white" : "black"}
              _hover={{ bg: "black", color: "white" }}>
              Chat
            </Button>
          </NextLink>

          <NextLink href="/calendar" aria-current={isActive("/calendar") ? "page" : undefined}>
            <Button {...baseBtn}
              bg={isActive("/calendar") ? "black" : "transparent"}
              color={isActive("/calendar") ? "white" : "black"}
              _hover={{ bg: "black", color: "white" }}>
              Calendar
            </Button>
          </NextLink>

          {/* 로딩 중엔 깜빡임 방지: 아무 것도 안 그림 */}
          {!loading && (
            user ? (
              <>
                <NextLink href="/profile" aria-current={isActive("/profile") ? "page" : undefined}>
                  <Button {...baseBtn}
                    bg={isActive("/profile") ? "black" : "transparent"}
                    color={isActive("/profile") ? "white" : "black"}
                    _hover={{ bg: "black", color: "white" }}>
                    Profile
                  </Button>
                </NextLink>
                <Button
                  {...baseBtn}
                  onClick={onClickSignOut}
                  bg="transparent"
                  color="black"
                  _hover={{ bg: "black", color: "white" }}>
                  Sign Out
                </Button>
              </>
            ) : (
              <NextLink href="/signin" aria-current={isActive("/signin") ? "page" : undefined}>
                <Button {...baseBtn}
                  bg={isActive("/signin") ? "black" : "transparent"}
                  color={isActive("/signin") ? "white" : "black"}
                  _hover={{ bg: "black", color: "white" }}>
                  Sign In
                </Button>
              </NextLink>
            )
          )}
        </HStack>
      </Flex>
    </Box>
  );
}