import { NextRequest, NextResponse } from "next/server";
import { verifyGitHubSignature, hasProcessedDelivery, recordDelivery } from "@/lib/webhook";
import { generateReleasePack } from "@/lib/gemini";
import { saveProject, saveRelease } from "@/lib/storage";
import { PRSummary } from "@/types";

export const instant = false;

export async function POST(req: NextRequest) {
  const event = req.headers.get("x-github-event") || "";
  const deliveryId = req.headers.get("x-github-delivery") || "dev-" + Date.now();
  const signature = req.headers.get("x-hub-signature-256");

  // Read raw body for HMAC verification
  const rawBody = await req.text();

  // 1. Signature Verification
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "shiphype_dev_secret";
  const isValid = verifyGitHubSignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    recordDelivery({
      id: deliveryId,
      event,
      repo: "unknown",
      action: "unauthorized",
      processedAt: new Date().toISOString(),
      status: "failed",
      summary: "Invalid x-hub-signature-256 signature",
    });
    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
  }

  // 2. Handle Ping Event
  if (event === "ping") {
    recordDelivery({
      id: deliveryId,
      event: "ping",
      repo: "github",
      action: "ping",
      processedAt: new Date().toISOString(),
      status: "success",
      summary: "GitHub Webhook Ping Pong verified",
    });
    return NextResponse.json({ success: true, message: "Pong! ShipHype Webhook connection verified." });
  }

  // 3. Filter for Release Events Only
  if (event !== "release") {
    recordDelivery({
      id: deliveryId,
      event,
      repo: "unknown",
      action: "ignored",
      processedAt: new Date().toISOString(),
      status: "skipped",
      summary: `Ignored event: ${event}`,
    });
    return NextResponse.json({ success: true, message: `Ignored event type: ${event}` });
  }

  // 4. Parse Payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, error: "Malformed JSON payload" }, { status: 400 });
  }

  const action = payload.action;
  const repoFullName = payload.repository?.full_name || "unknown/repo";
  const repoName = payload.repository?.name || "repo";
  const repoOwner = payload.repository?.owner?.login || "user";

  // Only trigger on "published" releases
  if (action !== "published") {
    recordDelivery({
      id: deliveryId,
      event,
      repo: repoFullName,
      action: action || "unknown",
      processedAt: new Date().toISOString(),
      status: "skipped",
      summary: `Ignored release action '${action}' (only 'published' is processed)`,
    });
    return NextResponse.json({ success: true, message: `Release action '${action}' skipped.` });
  }

  // 5. Idempotency Check
  if (hasProcessedDelivery(deliveryId)) {
    return NextResponse.json({ success: true, message: "Delivery already processed." });
  }

  const release = payload.release;
  const tagName = release.tag_name || "v1.0.0";
  const releaseTitle = release.name || tagName;
  const releaseBody = release.body || "";
  const releaseUrl = release.html_url || "";

  try {
    // 6. Build Pseudo PR for Gemini AI Generation
    const pseudoPR: PRSummary = {
      owner: repoOwner,
      repo: repoName,
      pullNumber: 0,
      title: `${releaseTitle} (${tagName})`,
      body: releaseBody,
      author: release.author?.login || repoOwner,
      labels: ["release", "automated"],
      changedFiles: [],
      htmlUrl: releaseUrl,
    };

    const { payload: generated, unmatchedNumbers } = await generateReleasePack(pseudoPR, {
      notes: `GitHub Automated Release webhook triggered for tag: ${tagName}`,
      language: "en",
    });

    // 7. Normalize Slug & Save Project
    const cleanSlug = repoName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");

    const project = saveProject({
      name: repoName,
      slug: cleanSlug,
      repo: repoFullName,
    });

    // 8. Save Release as DRAFT (Requires user review in /dashboard before publishing)
    const newRelease = saveRelease({
      projectSlug: cleanSlug,
      versionTag: tagName,
      title: generated.visual_card?.title || releaseTitle,
      status: "draft", // Stored safely as draft for developer review
      changelog: generated.changelog,
      cardData: generated.visual_card,
      sourcePr: {
        owner: repoOwner,
        repo: repoName,
        pullNumber: 0,
        url: releaseUrl,
      },
    });

    recordDelivery({
      id: deliveryId,
      event: "release",
      repo: repoFullName,
      action: "published",
      processedAt: new Date().toISOString(),
      status: "success",
      summary: `Generated draft release ${tagName} for ${cleanSlug}`,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully drafted release ${tagName} for ${repoFullName}`,
      releaseId: newRelease.id,
      projectSlug: cleanSlug,
      status: "draft",
      unmatchedNumbers,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Generation failed";
    recordDelivery({
      id: deliveryId,
      event: "release",
      repo: repoFullName,
      action: "published",
      processedAt: new Date().toISOString(),
      status: "failed",
      summary: `Failed to generate: ${errorMsg}`,
    });

    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
