import { NextRequest, NextResponse } from "next/server";
import { saveProject, saveRelease } from "@/lib/storage";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { slug, projectName, repo, versionTag, title, changelog, cardData, sourcePr, status } = body;

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

    // Determine the owner login: logged in GitHub user or PR owner or fallback to repo owner
    const ownerLogin = user?.login || sourcePr?.owner || (repo && repo.includes("/") ? repo.split("/")[0] : undefined);

    // 1. Ensure project exists or create it
    const project = saveProject({
      name: projectName || cleanSlug,
      slug: cleanSlug,
      repo: repo || "",
      ownerLogin,
    });

    // 2. Save release (or draft)
    const release = saveRelease({
      projectSlug: cleanSlug,
      versionTag: versionTag || "v1.0.0",
      title: title || "New Release",
      status: status || "published",
      ownerLogin,
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
