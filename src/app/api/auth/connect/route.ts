import { NextRequest, NextResponse } from "next/server";
import { AuthUser, serializeSession } from "@/lib/auth";

export const instant = false;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, username } = body;

    let authUser: AuthUser;

    if (token && typeof token === "string" && token.trim()) {
      // 1. Authenticate with GitHub Personal Access Token
      const cleanToken = token.trim();
      const ghRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "ShipHype-App",
        },
      });

      if (!ghRes.ok) {
        return NextResponse.json(
          { success: false, error: "Invalid GitHub token. Please verify permissions." },
          { status: 401 }
        );
      }

      const ghUser = await ghRes.json();
      authUser = {
        id: String(ghUser.id),
        login: ghUser.login,
        name: ghUser.name || ghUser.login,
        avatarUrl: ghUser.avatar_url,
        accessToken: cleanToken,
        connectedAt: new Date().toISOString(),
      };
    } else if (username && typeof username === "string" && username.trim()) {
      // 2. Connect via GitHub Username (Public Read mode)
      const cleanUsername = username.trim();
      const ghRes = await fetch(`https://api.github.com/users/${cleanUsername}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "ShipHype-App",
        },
      });

      if (!ghRes.ok) {
        return NextResponse.json(
          { success: false, error: `GitHub user '@${cleanUsername}' not found.` },
          { status: 404 }
        );
      }

      const ghUser = await ghRes.json();
      authUser = {
        id: String(ghUser.id),
        login: ghUser.login,
        name: ghUser.name || ghUser.login,
        avatarUrl: ghUser.avatar_url,
        connectedAt: new Date().toISOString(),
      };
    } else {
      return NextResponse.json(
        { success: false, error: "Please provide a GitHub Personal Access Token or Username." },
        { status: 400 }
      );
    }

    const cookie = serializeSession(authUser);

    return new NextResponse(
      JSON.stringify({
        success: true,
        user: {
          id: authUser.id,
          login: authUser.login,
          name: authUser.name,
          avatarUrl: authUser.avatarUrl,
        },
      }),
      {
        headers: {
          "Set-Cookie": cookie,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Connection failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
