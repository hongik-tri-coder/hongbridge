import ChatWindow from "@/components/ChatWindow";
import { Heading, Box } from "@chakra-ui/react";

export default function ChatPage() {
  return (
    <Box>
      <Heading size="lg" mb={4}>홍브릿지 채팅</Heading>
      <ChatWindow />
    </Box>
  );
}