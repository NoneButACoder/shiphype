import { NextRequest, NextResponse } from "next/server";
import { saveSubscriber, getSubscribersCount } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectSlug, email } = body;

    if (!projectSlug || !email) {
      return NextResponse.json(
        { success: false, error: "Project slug and email are required." },
        { status: 400 }
      );
    }

    const result = saveSubscriber(projectSlug, email);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    const count = getSubscribersCount(projectSlug);

    return NextResponse.json({
      success: true,
      isNew: result.isNew,
      message: result.message,
      subscribersCount: count,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to subscribe";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("projectSlug");
    if (!slug) {
      return NextResponse.json({ success: false, error: "Missing projectSlug" }, { status: 400 });
    }
    const count = getSubscribersCount(slug);
    return NextResponse.json({ success: true, projectSlug: slug, count });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to get subscriber count";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
