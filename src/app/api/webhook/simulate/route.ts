import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const instant = false;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const tag = body.tag || "v1.2.0";
    const name = body.name || `Release ${tag} - High Performance Update`;
    const repo = body.repo || "NoneButACoder/ShoppinggWebSite";
    const [owner, repoName] = repo.split("/");

    const simulatedPayload = {
      action: "published",
      release: {
        tag_name: tag,
        name: name,
        body: body.body || `### What's Changed\n* Added instant checkout coupons and promo code verification\n* Improved responsive drawer animation performance\n* Fixed pricing rounding bugs on discounted items`,
        html_url: `https://github.com/${repo}/releases/tag/${tag}`,
        author: { login: owner || "developer" },
      },
      repository: {
        name: repoName || "ShoppinggWebSite",
        full_name: repo,
        owner: { login: owner || "NoneButACoder" },
      },
    };

    const rawBody = JSON.stringify(simulatedPayload);
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "shiphype_dev_secret";
    const signature = "sha256=" + crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const webhookUrl = `${protocol}://${host}/api/webhook/github`;

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-github-event": "release",
        "x-github-delivery": "sim_" + Math.random().toString(36).substring(2, 9),
        "x-hub-signature-256": signature,
      },
      body: rawBody,
    });

    const data = await res.json();
    return NextResponse.json({
      success: res.ok,
      simulated: true,
      result: data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Simulation failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
