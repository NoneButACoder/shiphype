import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getDataFilePath } from "@/lib/storage";
import {
  postTweetToTwitter,
  uploadMediaToTwitter,
  TwitterCredentials,
} from "@/lib/twitter";

function getTweetLogsFilePath() {
  const file = getDataFilePath("tweet_publications.json");
  if (!fs.existsSync(file)) {
    try {
      fs.writeFileSync(file, JSON.stringify([]), "utf8");
    } catch {
      // ignore
    }
  }
  return file;
}

function saveTweetLog(record: {
  id: string;
  text: string;
  tweetUrl: string;
  simulated: boolean;
  repo?: string;
  publishedAt: string;
}) {
  try {
    const file = getTweetLogsFilePath();
    const raw = fs.readFileSync(file, "utf8");
    const logs = JSON.parse(raw);
    logs.unshift(record);
    fs.writeFileSync(file, JSON.stringify(logs.slice(0, 50), null, 2), "utf8");
  } catch (e) {
    console.error("Failed to save tweet log", e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      cardData,
      repoName = "shiphype",
      attachImage = true,
      credentials: clientCredentials,
      simulate = false,
    } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Tweet text is required" }, { status: 400 });
    }

    if (text.length > 280) {
      return NextResponse.json(
        { error: `Tweet exceeds 280 character limit (${text.length} chars)` },
        { status: 400 }
      );
    }

    // Resolve credentials from client or environment
    const credentials: TwitterCredentials = {
      apiKey: clientCredentials?.apiKey || process.env.X_API_KEY,
      apiSecret: clientCredentials?.apiSecret || process.env.X_API_SECRET,
      accessToken: clientCredentials?.accessToken || process.env.X_ACCESS_TOKEN,
      accessTokenSecret:
        clientCredentials?.accessTokenSecret || process.env.X_ACCESS_TOKEN_SECRET,
      bearerToken: clientCredentials?.bearerToken || process.env.X_BEARER_TOKEN,
    };

    const hasValidCreds =
      (credentials.apiKey &&
        credentials.apiSecret &&
        credentials.accessToken &&
        credentials.accessTokenSecret) ||
      credentials.bearerToken;

    // If simulation requested or no credentials configured, run dry-run simulation
    if (simulate || !hasValidCreds) {
      const mockId = Math.floor(1000000000000000000 + Math.random() * 900000000000000000).toString();
      const mockUrl = `https://x.com/shiphype/status/${mockId}`;

      saveTweetLog({
        id: mockId,
        text,
        tweetUrl: mockUrl,
        simulated: true,
        repo: repoName,
        publishedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        simulated: true,
        tweetId: mockId,
        tweetUrl: mockUrl,
        message:
          "Post simulation succeeded! (Configure X API credentials in modal or .env.local for live X API posting).",
      });
    }

    // 1. If attachImage is requested and cardData is available, generate card image buffer
    const mediaIds: string[] = [];
    if (attachImage && cardData && credentials.apiKey) {
      try {
        const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const query = new URLSearchParams({
          badge: cardData.badge || "",
          title: cardData.title || "",
          subtitle: cardData.subtitle || "",
          highlights: JSON.stringify(cardData.highlights || []),
          repo: repoName,
          template: cardData.template || "bento",
          color: cardData.themeColor || "indigo",
          watermark: String(cardData.watermark !== false),
        });

        const cardRes = await fetch(`${origin}/api/card?${query.toString()}`);
        if (cardRes.ok) {
          const arrayBuffer = await cardRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const uploadResult = await uploadMediaToTwitter(buffer, {
            apiKey: credentials.apiKey!,
            apiSecret: credentials.apiSecret!,
            accessToken: credentials.accessToken!,
            accessTokenSecret: credentials.accessTokenSecret!,
          });

          if (uploadResult.mediaId) {
            mediaIds.push(uploadResult.mediaId);
          } else {
            console.warn("Media upload warning:", uploadResult.error);
          }
        }
      } catch (err) {
        console.warn("Failed to generate/upload card image for tweet:", err);
      }
    }

    // 2. Post tweet via Twitter API v2
    const result = await postTweetToTwitter(text, mediaIds, credentials);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to post to X" }, { status: 400 });
    }

    saveTweetLog({
      id: result.tweetId || "unknown",
      text,
      tweetUrl: result.tweetUrl || "https://x.com",
      simulated: false,
      repo: repoName,
      publishedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      tweetId: result.tweetId,
      tweetUrl: result.tweetUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const file = getTweetLogsFilePath();
    const raw = fs.readFileSync(file, "utf8");
    const logs = JSON.parse(raw);
    return NextResponse.json({ success: true, logs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
