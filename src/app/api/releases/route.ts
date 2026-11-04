import { NextRequest, NextResponse } from "next/server";
import {
  getAllProjects,
  getAllReleases,
  deleteRelease,
  updateReleaseStatus,
  deleteProject,
  getAllSubscribers,
} from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const projects = getAllProjects();
    const releases = getAllReleases(slug || undefined, true);
    const subscribers = getAllSubscribers(slug || undefined);

    return NextResponse.json({
      success: true,
      projects,
      releases,
      subscribersCount: subscribers.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load releases";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || (status !== "draft" && status !== "published")) {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    const updated = updateReleaseStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Release not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id, status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update release";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const releaseId = searchParams.get("id");
    const projectSlug = searchParams.get("projectSlug");

    if (releaseId) {
      const deleted = deleteRelease(releaseId);
      return NextResponse.json({ success: deleted });
    }

    if (projectSlug) {
      const deleted = deleteProject(projectSlug);
      return NextResponse.json({ success: deleted });
    }

    return NextResponse.json({ success: false, error: "Missing id or projectSlug" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete item";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
