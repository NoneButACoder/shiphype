import { NextResponse } from "next/server";
import { getAllProjects } from "@/lib/storage";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: true, projects: [], authenticated: false });
    }
    const projects = getAllProjects(user.login);
    return NextResponse.json({ success: true, projects, authenticated: true, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
