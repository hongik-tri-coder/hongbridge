"use client";

import { useRef, useState } from "react";
import {
  Box, Heading, Text, VStack, HStack, Input, Button,
  IconButton, Link, Field, createListCollection, Select, Portal,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { toastBus } from "@/utils/toast-bus";
import { signUp } from "@/lib/api";

export default function SignUpPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [email, setEmail] = useState("");
  const [majorId, setMajorId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(false);
  const sendingRef = useRef(false);

  const validate = () => {
    if (!/^[A-Za-z0-9]{5,12}$/.test(studentId.trim())) return "학번은 영문+숫자 5~12자리로 입력해 주세요.";
    if (name.trim().length < 2) return "이름을 2자 이상 입력해 주세요.";
    if (!/^[1-6]$/.test(grade)) return "학년을 선택해 주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "이메일 형식이 올바르지 않습니다.";
    if (!/^\d+$/.test(majorId)) return "전공 ID는 숫자만 입력해 주세요.";
    if (password.length < 8) return "비밀번호는 8자 이상 입력해 주세요.";
    if (password !== confirmPwd) return "비밀번호가 일치하지 않습니다.";
    return null;
  };

  const gradeOptions = createListCollection({
    items: [
      { label: "1학년", value: "1" },
      { label: "2학년", value: "2" },
      { label: "3학년", value: "3" },
      { label: "4학년", value: "4" },
      { label: "5학년", value: "5" },
      { label: "6학년", value: "6" },
    ],
  });

  const onSubmit = async () => {
    const err = validate();
    if (err) { toastBus.warning("입력 확인", err); return; }
    if (sendingRef.current) return;

    setLoading(true);
    sendingRef.current = true;

    try {
      await signUp({
        studentId: studentId.trim(),
        name: name.trim(),
        grade: Number(grade),
        email: email.trim(),
        majorId: Number(majorId),
        password,
      });

      toastBus.success("회원가입 완료", "이제 로그인할 수 있어요.");
      router.push("/signin");
    } catch (e: any) {
      const msg = /duplicate|중복|exists/i.test(String(e?.message))
        ? "이미 가입된 학번/이메일입니다."
        : (e?.message ?? "회원가입 처리 중 오류가 발생했어요.");
      toastBus.error("회원가입 실패", msg);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          <Heading size="lg" mb={1}>회원가입</Heading>
          <Text color="gray.600">HongBridge에 오신 걸 환영해요.</Text>
        </Box>

        {/* 학번 */}
        <Field.Root>
          <Field.Label>학번</Field.Label>
          <Input
            value={studentId}
            placeholder="C123456"
            onChange={(e) => setStudentId(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={onKeyDown}
            w="100%"
            h="44px"
          />
        </Field.Root>

        {/* 비밀번호 */}
        <Field.Root>
          <Field.Label>비밀번호</Field.Label>
          <Box position="relative" w="100%">
            <Input
              type={showPwd ? "text" : "password"}
              value={password}
              placeholder="••••••••"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={onKeyDown}
              pr="10"
              w="100%"
              h="44px"
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

        {/* 비밀번호 확인 */}
        <Field.Root>
          <Field.Label>비밀번호 확인</Field.Label>
          <Box position="relative" w="100%">
            <Input
              type={showConfirmPwd ? "text" : "password"}
              value={confirmPwd}
              placeholder="••••••••"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPwd(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={onKeyDown}
              pr="10"
              w="100%"
              h="44px"
            />
            <IconButton
              aria-label={showConfirmPwd ? "비밀번호 숨기기" : "비밀번호 보기"}
              size="sm"
              variant="ghost"
              onClick={() => setShowConfirmPwd(v => !v)}
              tabIndex={-1}
              position="absolute"
              top="50%"
              right="2"
              transform="translateY(-50%)"
            >
              {showConfirmPwd ? <ViewOffIcon /> : <ViewIcon />}
            </IconButton>
          </Box>
        </Field.Root>

        {/* 이름 */}
        <Field.Root>
          <Field.Label>이름</Field.Label>
          <Input
            value={name}
            placeholder="홍길동"
            onChange={(e) => setName(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={onKeyDown}
            w="100%"
            h="44px"
          />
        </Field.Root>

        {/* 학년 (Select.Root) */}
        <Field.Root>
          <Field.Label>학년</Field.Label>
          <Select.Root
            collection={gradeOptions}
            value={grade ? [grade] : []}                     // 단일 선택도 배열
            onValueChange={(d) => setGrade(d.value[0] ?? "")}
            size="md"
            width="100%"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="학년 선택" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {gradeOptions.items.map((opt) => (
                    <Select.Item key={opt.value} item={opt}>
                      {opt.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Field.Root>

        {/* 이메일 */}
        <Field.Root>
          <Field.Label>이메일</Field.Label>
          <Input
            type="email"
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKeyDown}
            w="100%"
            h="44px"
          />
        </Field.Root>

        {/* 전공 ID */}
        <Field.Root>
          <Field.Label>전공</Field.Label>
          <Input
            value={majorId}
            placeholder="예) 101"
            onChange={(e) => setMajorId(e.target.value)}
            onKeyDown={onKeyDown}
            w="100%"
            h="44px"
          />
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
          {loading ? "가입 중…" : "가입하기"}
        </Button>

        <HStack justify="space-between">
          <Text color="gray.700">
            이미 계정이 있으신가요?{" "}
            <Link as={NextLink} href="/signin" textDecoration="underline">
              로그인
            </Link>
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}