// 프런트 전역 API 유틸 (백엔드 컨트롤러에 맞춤)

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8080";

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
  studentId: string; // 학번
  name: string;      // 이름
  grade: number;     // 학년
  email: string;     // 이메일
  majorId: number;   // 전공 ID
  password: string;  // 비밀번호
}

// 백엔드에서 반환하는 회원 정보 형태가 확정되지 않았다면 최소 필드만 정의
export interface MemberDto {
  id?: number;
  studentId: string;
  name: string;
  grade: number;
  email: string;
  majorId: number;
}

// ===== 토큰 로컬 저장소 헬퍼(선택) =====
const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

export function saveTokens(tokens: JwtToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}
export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
export function clearTokens() {
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

  // auth 옵션이 true면 Authorization 헤더 추가
  if (init.auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "GET",
    ...init,
    headers,
    // CORS에서 쿠키를 쓰지 않는다면 credentials 생략 (백엔드 @CrossOrigin에서 origin만 허용됨)
  });

  // 텍스트/JSON 안전 파싱
  const rawText = await res.text().catch(() => "");
  const data = ((): any => {
    try {
      return rawText ? JSON.parse(rawText) : null;
    } catch {
      return rawText; // 문자열일 수도 있음
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

// 채팅: POST /chat → string (답변 텍스트)
export async function sendChat(message: string): Promise<string> {
  // 백엔드 DTO: ChatRequest { message: string }
  const reply = await fetchJson<string>("/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
    // 필요시 인증:
    // auth: true,
  });
  // 백엔드가 문자열로 반환하므로 그대로 리턴
  return reply;
}