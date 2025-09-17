export async function sendMessage(messages: { role: "user" | "assistant"; content: string }[]): Promise<string> {
  const last = [...messages].reverse().find((m) => m.role === "user");
  return Promise.resolve(`백엔드 연결후 가능`);
}

export type SignInResponse = { token?: string; [k: string]: any };

export async function signInWithStudentId(params: { studentId: string; password: string }): Promise<SignInResponse> {
  const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/auth/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    credentials: "include", // 세션/쿠키 기반이면 유지, 토큰만 쓰면 제거해도 됨
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}