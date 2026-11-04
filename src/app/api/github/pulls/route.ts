import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const instant = false;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (!owner || !repo) {
      return NextResponse.json({ success: false, error: "Missing owner or repo" }, { status: 400 });
    }

    const user = await getSessionUser();
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ShipHype-App",
    };

    if (user?.accessToken) {
      headers["Authorization"] = `Bearer ${user.accessToken}`;
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&sort=updated&direction=desc&per_page=15`;
    const res = await fetch(apiUrl, { headers });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `GitHub API error (${res.status})` },
        { status: res.status }
      );
    }

    const rawPulls = await res.json();
    const pulls = rawPulls.map((p: any) => ({
      number: p.number,
      title: p.title,
      state: p.state,
      mergedAt: p.merged_at,
      author: p.user?.login,
      htmlUrl: p.html_url,
      updatedAt: p.updated_at,
    }));

    return NextResponse.json({ success: true, pulls });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load pulls";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
