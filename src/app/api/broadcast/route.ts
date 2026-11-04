import { NextRequest, NextResponse } from "next/server";
import {
  getReleaseById,
  getProjectBySlug,
  getAllSubscribers,
} from "@/lib/storage";
import { generateReleaseEmailHtml } from "@/lib/emailTemplate";
import { sendEmail, saveBroadcastLog, getBroadcastLogs } from "@/lib/mailer";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const releaseId = searchParams.get("releaseId");
    const preview = searchParams.get("preview") === "true";
    const slug = searchParams.get("slug");
    const getLogs = searchParams.get("logs") === "true";

    if (getLogs) {
      const logs = getBroadcastLogs(slug || undefined);
      return NextResponse.json({ success: true, logs });
    }

    if (!releaseId) {
      return NextResponse.json({ error: "Missing releaseId parameter" }, { status: 400 });
    }

    const release = getReleaseById(releaseId);
    if (!release) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    const project = getProjectBySlug(release.projectSlug);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const subscribers = getAllSubscribers(project.slug);
    const emailData = generateReleaseEmailHtml({
      project,
      release,
      recipientEmail: subscribers[0]?.email || "you@example.com",
    });

    if (preview) {
      return NextResponse.json({
        success: true,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        subscribersCount: subscribers.length,
        subscribers: subscribers.map((s) => s.email),
      });
    }

    return new Response(emailData.html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { releaseId, testEmail, simulate = false } = body;

    if (!releaseId) {
      return NextResponse.json({ error: "Missing releaseId" }, { status: 400 });
    }

    const release = getReleaseById(releaseId);
    if (!release) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    const project = getProjectBySlug(release.projectSlug);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let recipients: string[] = [];

    if (testEmail && typeof testEmail === "string" && testEmail.includes("@")) {
      recipients = [testEmail.trim().toLowerCase()];
    } else {
      const subscribers = getAllSubscribers(project.slug);
      recipients = subscribers.map((s) => s.email.trim().toLowerCase());
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        {
          error:
            "No subscribers found for this project yet. Please send to a test email first or subscribe via the public changelog page.",
        },
        { status: 400 }
      );
    }

    // Generate email content
    const emailData = generateReleaseEmailHtml({
      project,
      release,
      recipientEmail: recipients[0],
    });

    const sendResult = await sendEmail({
      to: recipients,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      fromName: `${project.name} Updates`,
      fromEmail:
        process.env.RESEND_FROM_EMAIL ||
        (project.websiteUrl
          ? `updates@${new URL(project.websiteUrl).hostname}`
          : "onboarding@resend.dev"),
      simulate,
    });

    // Save audit log
    const logId = "bcast_" + Math.random().toString(36).substring(2, 9);
    saveBroadcastLog({
      id: logId,
      releaseId: release.id,
      projectSlug: project.slug,
      subject: emailData.subject,
      recipientCount: sendResult.deliveredCount,
      recipients: sendResult.recipients,
      simulated: sendResult.simulated,
      status: sendResult.success ? "success" : "failed",
      timestamp: new Date().toISOString(),
      error: sendResult.error,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { error: sendResult.error || "Failed to deliver broadcast" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logId,
      deliveredCount: sendResult.deliveredCount,
      recipients: sendResult.recipients,
      simulated: sendResult.simulated,
      subject: emailData.subject,
      message: sendResult.simulated
        ? `Broadcast simulated successfully to ${sendResult.deliveredCount} recipients!`
        : `Broadcast successfully sent to ${sendResult.deliveredCount} recipients via email!`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
