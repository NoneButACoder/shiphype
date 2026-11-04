import { NextRequest, NextResponse } from "next/server";
import { getProjectBySlug, getAllReleases } from "@/lib/storage";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return new NextResponse("Project not found", { status: 404 });
  }

  const releases = getAllReleases(slug); // Only published releases
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;
  const siteUrl = `${baseUrl}/p/${project.slug}`;
  const feedUrl = `${baseUrl}/p/${project.slug}/rss.xml`;

  const itemsXml = releases
    .map((release) => {
      let contentHtml = `<h3>${escapeXml(release.title)} (${escapeXml(release.versionTag)})</h3>`;

      if (release.changelog.features?.length > 0) {
        contentHtml += `<h4>✨ Features</h4><ul>`;
        release.changelog.features.forEach((feat) => {
          contentHtml += `<li>${escapeXml(feat)}</li>`;
        });
        contentHtml += `</ul>`;
      }

      if (release.changelog.improvements?.length > 0) {
        contentHtml += `<h4>⚡ Improvements</h4><ul>`;
        release.changelog.improvements.forEach((imp) => {
          contentHtml += `<li>${escapeXml(imp)}</li>`;
        });
        contentHtml += `</ul>`;
      }

      if (release.changelog.fixes?.length > 0) {
        contentHtml += `<h4>🛠 Fixes</h4><ul>`;
        release.changelog.fixes.forEach((fix) => {
          contentHtml += `<li>${escapeXml(fix)}</li>`;
        });
        contentHtml += `</ul>`;
      }

      const itemLink = `${siteUrl}#${encodeURIComponent(release.versionTag)}`;
      const pubDate = new Date(release.publishedAt).toUTCString();

      return `
    <item>
      <title>[${escapeXml(release.versionTag)}] ${escapeXml(release.title)}</title>
      <link>${itemLink}</link>
      <guid isPermaLink="false">${release.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${contentHtml}]]></description>
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(project.name)} Changelog</title>
    <link>${siteUrl}</link>
    <description>Product updates, release notes, and changelog for ${escapeXml(project.name)}</description>
    <language>en-us</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
    },
  });
}
