import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const instant = false;

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ShipHype-App",
    };

    if (user.accessToken) {
      headers["Authorization"] = `Bearer ${user.accessToken}`;
    }

    const apiUrl = user.accessToken
      ? "https://api.github.com/user/repos?sort=updated&per_page=50&affiliation=owner,collaborator"
      : `https://api.github.com/users/${user.login}/repos?sort=updated&per_page=50`;

    const res = await fetch(apiUrl, { headers });
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `GitHub API error (${res.status})` },
        { status: res.status }
      );
    }

    const rawRepos = await res.json();
    const repos = rawRepos.map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: r.owner?.login,
      private: r.private,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
      updatedAt: r.updated_at,
      defaultBranch: r.default_branch,
    }));

    return NextResponse.json({ success: true, repos });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load repos";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
