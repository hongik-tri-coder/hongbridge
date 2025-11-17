"use client";
import RequireAuth from "@/components/RequireAuth";
import { getMe, MemberDto, updateMe } from "@/lib/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Heading, Text, VStack, HStack, Badge, Spinner, Button, Input, Field } from "@chakra-ui/react";
import { toastBus } from "@/utils/toast-bus";

export default function ProfilePage() {
  const [me, setMe] = useState<MemberDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [majorId, setMajorId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const sendingRef = useRef(false);

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

  return (
    <RequireAuth>
      <Box>
        <Heading size="lg" mb={4}>내 프로필</Heading>
        {loading ? (
          <HStack><Spinner /><Text>불러오는 중…</Text></HStack>
        ) : me ? (
          <VStack align="start" gap={4}>
            <HStack justify="space-between" w="100%">
              <HStack>
                <Text fontWeight="bold">학번</Text>
                <Badge colorPalette="blue">{me.studentId}</Badge>
              </HStack>
              {!editing && (
                <Button size="sm" onClick={() => setEditing(true)}>수정</Button>
              )}
            </HStack>

            {editing ? (
              <VStack align="stretch" w="100%" gap={3}>
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
                <HStack>
                  <Button onClick={onSave} disabled={saving || !dirty} aria-busy={saving} bg="black" color="white" _hover={{ bg: "gray.800" }}>
                    {saving ? "저장 중…" : "저장"}
                  </Button>
                  <Button variant="outline" onClick={() => { setEditing(false); setName(me.name ?? ""); setEmail(me.email ?? ""); setGrade(me.grade != null ? String(me.grade) : ""); setMajorId(me.majorId != null ? String(me.majorId) : ""); }}>취소</Button>
                </HStack>
              </VStack>
            ) : (
              <VStack align="start" gap={3}>
                <HStack>
                  <Text fontWeight="bold">이름</Text>
                  <Text>{me.name || "-"}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">학년</Text>
                  <Text>{me.grade ?? "-"}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">이메일</Text>
                  <Text>{me.email || "-"}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">전공 ID</Text>
                  <Text>{me.majorId ?? "-"}</Text>
                </HStack>
              </VStack>
            )}
          </VStack>
        ) : (
          <Text>프로필을 불러오지 못했습니다.</Text>
        )}
      </Box>
    </RequireAuth>
  );
}