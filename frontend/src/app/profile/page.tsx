"use client";
import RequireAuth from "@/components/RequireAuth";
import { getMe, MemberDto } from "@/lib/api";
import { useEffect, useState } from "react";
import { Box, Heading, Text, VStack, HStack, Badge, Spinner } from "@chakra-ui/react";

export default function ProfilePage() {
  const [me, setMe] = useState<MemberDto | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <RequireAuth>
      <Box>
        <Heading size="lg" mb={4}>내 프로필</Heading>
        {loading ? (
          <HStack><Spinner /><Text>불러오는 중…</Text></HStack>
        ) : me ? (
          <VStack align="start" gap={3}>
            <HStack>
              <Text fontWeight="bold">학번</Text>
              <Badge colorPalette="blue">{me.studentId}</Badge>
            </HStack>
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
        ) : (
          <Text>프로필을 불러오지 못했습니다.</Text>
        )}
      </Box>
    </RequireAuth>
  );
}