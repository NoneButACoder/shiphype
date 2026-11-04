import { NextResponse } from "next/server";
import { getAllProjects } from "@/lib/storage";

export async function GET() {
  try {
    const projects = getAllProjects();
    return NextResponse.json({ success: true, projects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
