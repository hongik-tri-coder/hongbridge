"use client";

import { useState, useRef } from "react";
import {
  Box, Heading, Text, VStack, Input, Button, IconButton, Link, Field, HStack,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { useRouter } from "next/navigation";           // ✅ 여기!
import { toastBus } from "@/utils/toast-bus";
import { signInWithStudentId, saveTokens } from "@/lib/api";
import { useAuth } from "@/app/auth-provider";

export default function SignInPage() {
  const router = useRouter();                           // ✅ 여기!
  const auth = useAuth();
  const [studentId, setStudentId] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(false);
  const sendingRef = useRef(false);

  const validate = () => {
    const id = studentId.trim();
    if (!id) return "학번을 입력해 주세요.";
    if (!/^[A-Za-z0-9]{5,12}$/.test(id)) return "올바른 학번을 입력해 주세요.";
    if (!pwd.trim()) return "비밀번호를 입력해 주세요.";
    return null;
  };

  const onSubmit = async () => {
    const err = validate();
    if (err) { toastBus.warning("입력 확인", err); return; }
    if (sendingRef.current) return;

    setLoading(true);
    sendingRef.current = true;
    try {
      const tokens = await signInWithStudentId({ studentId: studentId.trim(), password: pwd });
      saveTokens(tokens);
      auth.setToken(tokens.accessToken);
      toastBus.success("로그인 완료", "환영합니다!");
      router.push("/");                                 // ✅ App Router 전환
    } catch (e: any) {
      const msg =
        e?.status === 401 || e?.status === 403 || /invalid|credential|자격|비밀번호|password/i.test(String(e?.message))
          ? "학번과 비밀번호를 확인해주세요."
          : (e?.message ?? "서버 오류가 발생했어요.");
      toastBus.error("로그인 실패", msg);               // ✅ 들여쓰기/범위 수정
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (isComposing) return;
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={12} border="1px solid" borderColor="gray.200" rounded="xl" p={6} bg="white">
      <VStack align="stretch" gap={5}>
        <Box>
          <Heading size="lg" mb={1}>로그인</Heading>
          <Text color="gray.600">HongBridge에 오신 걸 환영해요.</Text>
        </Box>

        {/* 학번 */}
        <Field.Root>
          <Field.Label>학번</Field.Label>
          <Box w="100%">
            <Input
              w="100%"
              size="md"
              h="44px"
              value={studentId}
              placeholder="C123456"
              onChange={(e) => setStudentId(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={onKeyDown}
            />
          </Box>
        </Field.Root>

        {/* 비밀번호 */}
        <Field.Root>
          <Field.Label>비밀번호</Field.Label>
          <Box position="relative" w="100%">
            <Input
              w="100%"
              size="md"
              h="44px"
              type={showPwd ? "text" : "password"}
              value={pwd}
              placeholder="••••••••"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPwd(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={onKeyDown}
              pr="10"
            />
            <IconButton
              aria-label={showPwd ? "비밀번호 숨기기" : "비밀번호 보기"}
              size="sm"
              variant="ghost"
              onClick={() => setShowPwd(v => !v)}
              tabIndex={-1}
              position="absolute"
              top="50%"
              right="2"
              transform="translateY(-50%)"
            >
              {showPwd ? <ViewOffIcon /> : <ViewIcon />}
            </IconButton>
          </Box>
        </Field.Root>

        <Button
          w="100%"
          h="44px"
          bg="black" color="white"
          _hover={{ bg: "gray.800" }}
          onClick={onSubmit}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "로그인 중…" : "로그인"}
        </Button>

        <HStack justify="end">
          <Text color="gray.700">
            처음이신가요?{" "}
            <Link as={NextLink} href="/signup" textDecoration="underline">
              회원가입
            </Link>
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}