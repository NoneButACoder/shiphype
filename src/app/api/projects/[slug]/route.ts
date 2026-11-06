import { NextRequest, NextResponse } from "next/server";
import { getProjectBySlug, updateProject, BrandAccentColor, BannerPattern } from "@/lib/storage";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const project = getProjectBySlug(slug);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in with GitHub." }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    const allowedColors: BrandAccentColor[] = ["indigo", "cyan", "emerald", "amber", "rose", "purple"];
    const allowedPatterns: BannerPattern[] = ["dots", "gradient", "grid", "minimal"];

    const updates: Parameters<typeof updateProject>[1] = {};

    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
    }
    if (typeof body.repo === "string") {
      updates.repo = body.repo.trim();
    }
    if (typeof body.tagline === "string") {
      updates.tagline = body.tagline.trim();
    }
    if (typeof body.description === "string") {
      updates.description = body.description.trim();
    }
    if (typeof body.logoUrl === "string") {
      updates.logoUrl = body.logoUrl.trim();
    }
    if (body.accentColor && allowedColors.includes(body.accentColor)) {
      updates.accentColor = body.accentColor;
    }
    if (typeof body.websiteUrl === "string") {
      updates.websiteUrl = body.websiteUrl.trim();
    }
    if (typeof body.twitterHandle === "string") {
      let handle = body.twitterHandle.trim();
      if (handle.startsWith("@")) handle = handle.slice(1);
      updates.twitterHandle = handle;
    }
    if (typeof body.customDomain === "string") {
      updates.customDomain = body.customDomain.trim().toLowerCase();
    }
    if (body.bannerPattern && allowedPatterns.includes(body.bannerPattern)) {
      updates.bannerPattern = body.bannerPattern;
    }

    const updated = updateProject(slug, updates, user.login);
    if (!updated) {
      return NextResponse.json({ error: "Project not found or not owned by you." }, { status: 403 });
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
