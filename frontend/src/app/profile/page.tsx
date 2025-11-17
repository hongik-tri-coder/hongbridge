"use client";
import RequireAuth from "@/components/RequireAuth";
import { getMe, MemberDto, updateMe, signInWithStudentId } from "@/lib/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Heading, Text, VStack, HStack, Spinner, Button, Input, Field, Dialog, SimpleGrid } from "@chakra-ui/react";
import { toastBus } from "@/utils/toast-bus";
import { useAuth } from "@/app/auth-provider";

export default function ProfilePage() {
  const { user } = useAuth();
  const [me, setMe] = useState<MemberDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [majorId, setMajorId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const sendingRef = useRef(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwd, setPwd] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getMe();
        if (mounted) setMe(data);
      } catch {
        if (mounted) setMe(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (me) {
      setName(me.name ?? "");
      setEmail(me.email ?? "");
      setGrade(me.grade != null ? String(me.grade) : "");
      setMajorId(me.majorId != null ? String(me.majorId) : "");
    }
  }, [me]);

  const dirty = useMemo(() => {
    if (!me) return false;
    const g = grade.trim() === "" ? undefined : Number(grade);
    const m = majorId.trim() === "" ? undefined : Number(majorId);
    return (
      (name !== (me.name ?? "")) ||
      (email !== (me.email ?? "")) ||
      (g !== (me.grade ?? undefined)) ||
      (m !== (me.majorId ?? undefined))
    );
  }, [me, name, email, grade, majorId]);

  const onSave = async () => {
    if (!me) return;
    if (sendingRef.current) return;
    const g = grade.trim() === "" ? undefined : Number(grade);
    const m = majorId.trim() === "" ? undefined : Number(majorId);
    setSaving(true);
    sendingRef.current = true;
    try {
      const updated = await updateMe({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        grade: Number.isFinite(g as number) ? (g as number) : undefined,
        majorId: Number.isFinite(m as number) ? (m as number) : undefined,
      });
      setMe(updated);
      setEditing(false);
      toastBus.success("프로필 저장", "변경사항이 적용되었어요.");
    } catch (e: any) {
      const msg = e?.message ?? "저장에 실패했어요.";
      toastBus.error("오류", msg);
    } finally {
      setSaving(false);
      sendingRef.current = false;
    }
  };

  const openEditWithPassword = () => {
    setPwd("");
    setPwdOpen(true);
  };

  const onConfirmPassword = async () => {
    if (!user?.studentId) return;
    if (!pwd.trim()) { toastBus.warning("입력 확인", "비밀번호를 입력해 주세요."); return; }
    setChecking(true);
    try {
      await signInWithStudentId({ studentId: user.studentId, password: pwd });
      setPwdOpen(false);
      setEditing(true);
      toastBus.info("확인 완료", "비밀번호가 확인되었습니다.");
    } catch (e: any) {
      const msg = e?.status === 401 || e?.status === 403 ? "비밀번호가 올바르지 않습니다." : (e?.message ?? "인증에 실패했어요.");
      toastBus.error("확인 실패", msg);
    } finally {
      setChecking(false);
    }
  };

  return (
    <RequireAuth>
      <Box maxW="container.md" mx="auto">
        <Heading size="lg" mb={4}>내 프로필</Heading>
        {loading ? (
          <HStack><Spinner /><Text>불러오는 중…</Text></HStack>
        ) : me ? (
          <VStack align="stretch" gap={5}>
            <Box p={6} bg="gray.50" borderRadius="md" borderWidth="1px">
              {editing ? (
                <VStack align="stretch" gap={5}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field.Root>
                      <Field.Label>학번</Field.Label>
                      <Input value={String(me.studentId)} disabled />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>이름</Field.Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>학년</Field.Label>
                      <Input type="number" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="1" />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>이메일</Field.Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hong@example.com" />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>전공 ID</Field.Label>
                      <Input type="number" value={majorId} onChange={(e) => setMajorId(e.target.value)} placeholder="10" />
                    </Field.Root>
                  </SimpleGrid>
                  <HStack justify="flex-end" gap={3}>
                    <Button onClick={onSave} disabled={saving || !dirty} aria-busy={saving} bg="black" color="white" _hover={{ bg: "gray.800" }}>
                      {saving ? "저장 중…" : "저장"}
                    </Button>
                    <Button variant="outline" onClick={() => { setEditing(false); setName(me.name ?? ""); setEmail(me.email ?? ""); setGrade(me.grade != null ? String(me.grade) : ""); setMajorId(me.majorId != null ? String(me.majorId) : ""); }}>취소</Button>
                  </HStack>
                </VStack>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Box>
                    <Text fontWeight="medium" color="gray.600">학번</Text>
                    <Text mt={1}>{me.studentId}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" color="gray.600">이름</Text>
                    <Text mt={1}>{me.name || "-"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" color="gray.600">학년</Text>
                    <Text mt={1}>{me.grade ?? "-"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" color="gray.600">이메일</Text>
                    <Text mt={1}>{me.email || "-"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" color="gray.600">전공 ID</Text>
                    <Text mt={1}>{me.majorId ?? "-"}</Text>
                  </Box>
                </SimpleGrid>
              )}
            </Box>
            {!editing && (
              <HStack justify="flex-end" w="100%">
                <Button size="sm" onClick={openEditWithPassword}>수정</Button>
              </HStack>
            )}
          </VStack>
        ) : (
          <Text>프로필을 불러오지 못했습니다.</Text>
        )}
      </Box>
      <Dialog.Root open={pwdOpen} onOpenChange={(e) => setPwdOpen(e.open)} placement="center">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>비밀번호 확인</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="stretch" gap={3}>
                <Text color="gray.600">프로필을 수정하려면 비밀번호를 입력해 주세요.</Text>
                <Field.Root>
                  <Field.Label>비밀번호</Field.Label>
                  <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" />
                </Field.Root>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack>
                <Button variant="outline" onClick={() => setPwdOpen(false)}>취소</Button>
                <Button bg="black" color="white" _hover={{ bg: "gray.800" }} onClick={onConfirmPassword} disabled={checking} aria-busy={checking}>{checking ? "확인 중…" : "확인"}</Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </RequireAuth>
  );
}