export async function sendMessage(messages: { role: "user" | "assistant"; content: string }[]): Promise<string> {
  const last = [...messages].reverse().find((m) => m.role === "user");
  return Promise.resolve(`백엔드 연결후 가능`);
}