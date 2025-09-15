import { Box, Heading, Text, Button, Stack } from "@chakra-ui/react";
import NextLink from "next/link";

export default function HomePage() {
  return (
    <Box>
      <Heading size="lg" mb={3}>홍브릿지 메인</Heading>
      <Text color="gray.600" mb={6}>
        전공 관련 정보를 대화로 쉽게 찾는 AI 챗봇
      </Text>
      <Stack direction={{ base: "column", sm: "row" }} gap={3}>
        <NextLink href="/chat">
          <Button
            as="span"
            bg="black"
            color="white"
            _hover={{ bg: "gray.800" }}
          >
            대화하러 가기
          </Button>
        </NextLink>
      </Stack>
    </Box>
  );
}