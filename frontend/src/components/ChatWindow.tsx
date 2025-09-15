"use client";
import { useRef, useState } from "react";
import { Box, VStack, HStack, Input, IconButton, Text } from "@chakra-ui/react";
import { ArrowUpIcon } from "@chakra-ui/icons";
import { sendMessage } from "@/lib/api";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatWindow() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "안녕하세요! 무엇을 도와드릴까요?" },
  ]);
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const sendingRef = useRef(false);

  const onSend = async () => {
    const content = input.trim();
    if (!content || sendingRef.current) return;

    sendingRef.current = true;
    const next = [...messages, { role: "user", content } as Msg];
    setMessages(next);
    setInput("");

    try {
      const reply = await sendMessage(next);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "오류가 발생했어요. 잠시 후 다시 시도해주세요." }]);
    } finally {
      sendingRef.current = false;
    }
  };

  return (
    <Box border="1px solid" borderColor="gray.200" rounded="xl" p={4}>
      <VStack align="stretch" gap={3} h="60vh" overflowY="auto" mb={3}>
        {messages.map((m, i) => (
          <Box key={i} alignSelf={m.role === "user" ? "flex-end" : "flex-start"} maxW="80%">
            <Box
              bg={m.role === "user" ? "black" : "gray.100"}
              color={m.role === "user" ? "white" : "gray.800"}
              px={3}
              py={2}
              rounded="lg"
            >
              <Text whiteSpace="pre-wrap">{m.content}</Text>
            </Box>
          </Box>
        ))}
      </VStack>

      <Box height="1px" bg="gray.200" mb={3} />

      <HStack as="form" onSubmit={(e) => { e.preventDefault(); onSend(); }}>
        <Input
          placeholder="메시지를 입력하세요…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              if (isComposing) return;
              e.preventDefault();
              onSend();
            }
          }}
        />
        <IconButton
          aria-label="send"
          type="submit"
          disabled={sendingRef.current || input.trim() === ""}
        >
          <ArrowUpIcon />
        </IconButton>
      </HStack>
    </Box>
  );
}