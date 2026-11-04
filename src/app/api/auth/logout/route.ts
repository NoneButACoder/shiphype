import { NextResponse } from "next/server";
import { serializeLogout } from "@/lib/auth";

export async function POST() {
  const cookie = serializeLogout();
  return new NextResponse(JSON.stringify({ success: true }), {
    headers: {
      "Set-Cookie": cookie,
      "Content-Type": "application/json",
    },
  });
}
