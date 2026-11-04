import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const instant = false;

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }
    return NextResponse.json({ authenticated: true, user });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Auth check failed";
    return NextResponse.json({ authenticated: false, error: msg }, { status: 500 });
  }
}
