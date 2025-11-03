import ChatWindow from "@/components/ChatWindow";
import RequireAuth from "@/components/RequireAuth";
import { Heading, Box } from "@chakra-ui/react";

export default function ChatPage() {
  return (
    <RequireAuth>
      <Box>
        <Heading size="lg" mb={4}>홍브릿지 채팅</Heading>
        <ChatWindow />
      </Box>
    </RequireAuth>
  );
}