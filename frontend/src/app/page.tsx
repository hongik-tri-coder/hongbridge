import { Box, Heading, Text, Stack, SimpleGrid } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <Box>
      {/* Hero 섹션 */}
      <Box
        bgGradient="linear(to-r, gray.900, gray.700)"
        rounded="xl"
        p={{ base: 6, md: 10 }}
        mb={8}
      >
        <Heading size="xl" mb={3} color="black">홍브릿지</Heading>
        <Text fontSize={{ base: "md", md: "lg" }} color="black" mb={5}>
          전공 정보 탐색과 학교 일정 관리를 하나의 공간에서.
        </Text>
        {/* 기능 카드 영역 제거 */}
      </Box>

      {/* 정보 블록 */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <Box border="1px solid" borderColor="gray.200" rounded="lg" p={5}>
          <Heading size="sm" mb={2}>챗봇</Heading>
          <Text color="gray.600">자격증, 학사일정 정보를 챗봇에게 물어보세요!</Text>
        </Box>
        <Box border="1px solid" borderColor="gray.200" rounded="lg" p={5}>
          <Heading size="sm" mb={2}>캘린더</Heading>
          <Text color="gray.600">월별 일정을 한눈에 관리하세요!</Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
}