import { cookies } from "next/headers";

export interface AuthUser {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
  accessToken?: string;
  connectedAt: string;
}

const COOKIE_NAME = "shiphype_session";

export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return null;

    const raw = Buffer.from(sessionCookie.value, "base64").toString("utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function parseSessionFromHeader(cookieHeader: string | null): AuthUser | null {
  if (!cookieHeader) return null;
  try {
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!match || !match[1]) return null;
    const raw = Buffer.from(match[1], "base64").toString("utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function serializeSession(user: AuthUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64");
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  return `${COOKIE_NAME}=${payload}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

export function serializeLogout(): string {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}
