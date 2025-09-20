// ==== 전역 API 유틸 ====

// ✅ 환경변수 키 하나로 통일 (URL 끝 슬래시 제거)
export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080")
    .replace(/\/+$/, "");

// ===== 공통 타입 =====
export interface JwtToken {
  accessToken: string;
  refreshToken: string;
}

export interface SignInDto {
  studentId: string;
  password: string;
}

export interface SignUpDto {
  studentId: string;
  name: string;
  grade: number;
  email: string;
  majorId: number;
  password: string;
}

export interface MemberDto {
  id?: number;
  studentId: string;
  name: string;
  grade: number;
  email: string;
  majorId: number;
}

// ===== 토큰 로컬 저장소 헬퍼 =====
// ✅ 키 이름을 "accessToken" / "refreshToken"으로 통일
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export function saveTokens(tokens: JwtToken) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}
export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ===== 공통 fetch 래퍼 =====
async function fetchJson<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  // ✅ auth 옵션 시 자동으로 Authorization 헤더 주입
  if (init.auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "GET",
    ...init,
    headers,
  });

  const rawText = await res.text().catch(() => "");
  const data: any = (() => {
    try {
      return rawText ? JSON.parse(rawText) : null;
    } catch {
      return rawText; // 문자열 응답 지원
    }
  })();

  if (!res.ok) {
    const err: any = new Error(
      typeof data === "string" && data ? data : `HTTP ${res.status}`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

// ===== API 함수들 =====

// 로그인: POST /members/sign-in → JwtToken
export async function signInWithStudentId(body: SignInDto): Promise<JwtToken> {
  const tokens = await fetchJson<JwtToken>("/members/sign-in", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return tokens;
}

// 회원가입: POST /members/sign-up → MemberDto
export async function signUp(body: SignUpDto): Promise<MemberDto> {
  const member = await fetchJson<MemberDto>("/members/sign-up", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return member;
}

// 채팅: POST /chat → string
export async function sendChat(message: string): Promise<string> {
  // ✅ 공통 래퍼 + auth:true 사용 (Authorization 자동 주입)
  const reply = await fetchJson<string>("/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
    auth: true,
  });

  // 컨트롤러가 String 반환하므로 그대로
  return reply;
}