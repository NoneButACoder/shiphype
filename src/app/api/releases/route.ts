import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
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
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        projects: [],
        releases: [],
        subscribersCount: 0,
      });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const projects = getAllProjects(user.login);
    const releases = getAllReleases(slug || undefined, true, user.login);

    // Calculate subscribers for user's projects or filtered slug
    const userProjectSlugs = new Set(projects.map((p) => p.slug.toLowerCase()));
    const allSubs = getAllSubscribers();
    const userSubscribers = slug
      ? allSubs.filter((s) => s.projectSlug.toLowerCase() === slug.toLowerCase())
      : allSubs.filter((s) => userProjectSlugs.has(s.projectSlug.toLowerCase()) || user.login.toLowerCase() === "nonebutacoder");

    // Project breakdown map
    const subscribersByProject: Record<string, number> = {};
    for (const sub of allSubs) {
      const p = sub.projectSlug.toLowerCase();
      subscribersByProject[p] = (subscribersByProject[p] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
      projects,
      releases,
      subscribersCount: userSubscribers.length,
      subscribersByProject,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load releases";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || (status !== "draft" && status !== "published")) {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    const updated = updateReleaseStatus(id, status, user.login);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Release not found or not owned by you." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, id, status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update release";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const releaseId = searchParams.get("id");
    const projectSlug = searchParams.get("projectSlug");

    if (releaseId) {
      const deleted = deleteRelease(releaseId, user.login);
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: "Release not found or not owned by you." },
          { status: 403 }
        );
      }
      return NextResponse.json({ success: true });
    }

    if (projectSlug) {
      const deleted = deleteProject(projectSlug, user.login);
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: "Project not found or not owned by you." },
          { status: 403 }
        );
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Missing id or projectSlug" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete item";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
