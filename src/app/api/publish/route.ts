import { NextRequest, NextResponse } from "next/server";
import { saveProject, saveRelease } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, projectName, repo, versionTag, title, changelog, cardData, sourcePr } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ success: false, error: "Project slug is required." }, { status: 400 });
    }

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");

    if (!cleanSlug) {
      return NextResponse.json({ success: false, error: "Invalid project slug." }, { status: 400 });
    }

    // 1. Ensure project exists or create it
    const project = saveProject({
      name: projectName || cleanSlug,
      slug: cleanSlug,
      repo: repo || "",
    });

    // 2. Save published release
    const release = saveRelease({
      projectSlug: cleanSlug,
      versionTag: versionTag || "v1.0.0",
      title: title || "New Release",
      changelog: changelog || { features: [], improvements: [], fixes: [] },
      cardData: cardData || {
        badge: versionTag || "Update",
        title: title || "Release",
        subtitle: "",
        highlights: [],
      },
      sourcePr,
    });

    return NextResponse.json({
      success: true,
      project,
      release,
      publicUrl: `/p/${cleanSlug}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to publish release.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
