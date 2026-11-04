import { ProjectRecord, ReleaseRecord } from "./storage";

interface EmailTemplateOptions {
  project: ProjectRecord;
  release: ReleaseRecord;
  recipientEmail?: string;
  appUrl?: string;
}

export function generateReleaseEmailHtml({
  project,
  release,
  recipientEmail = "subscriber@example.com",
  appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
}: EmailTemplateOptions): { subject: string; html: string; text: string } {
  const versionTag = release.versionTag || "v1.0.0";
  const title = release.title || "New Release";
  const projectName = project.name || "Project";
  const subject = `[${projectName} ${versionTag}] ${title}`;

  const publicUrl = `${appUrl}/p/${project.slug}#${encodeURIComponent(versionTag)}`;
  const unsubscribeUrl = `${appUrl}/api/subscribe?slug=${project.slug}&email=${encodeURIComponent(
    recipientEmail
  )}`;

  // Accent color hex
  const colorMap: Record<string, string> = {
    indigo: "#6366f1",
    cyan: "#06b6d4",
    emerald: "#10b981",
    amber: "#f59e0b",
    rose: "#f43f5e",
    purple: "#a855f7",
  };
  const accentHex = colorMap[project.accentColor || "indigo"] || "#6366f1";

  // Card image preview URL
  const cardQuery = new URLSearchParams({
    badge: release.cardData?.badge || versionTag,
    title: release.cardData?.title || title,
    subtitle: release.cardData?.subtitle || "",
    highlights: JSON.stringify(release.cardData?.highlights || []),
    repo: project.repo || project.slug,
    template: release.cardData?.template || "bento",
    color: project.accentColor || release.cardData?.themeColor || "indigo",
    watermark: String(release.cardData?.watermark !== false),
  }).toString();
  const cardImageUrl = `${appUrl}/api/card?${cardQuery}`;

  // Plain text fallback
  let text = `${projectName} ${versionTag} is here!\n\n`;
  text += `${title}\n\n`;
  if (release.changelog?.features?.length > 0) {
    text += "✨ Features:\n" + release.changelog.features.map((f) => `• ${f}`).join("\n") + "\n\n";
  }
  if (release.changelog?.improvements?.length > 0) {
    text += "⚡ Improvements:\n" + release.changelog.improvements.map((i) => `• ${i}`).join("\n") + "\n\n";
  }
  if (release.changelog?.fixes?.length > 0) {
    text += "🛠️ Fixes:\n" + release.changelog.fixes.map((fx) => `• ${fx}`).join("\n") + "\n\n";
  }
  text += `Read full release notes online: ${publicUrl}\n\n`;
  text += `To unsubscribe, visit: ${unsubscribeUrl}\n`;

  // HTML template
  const featuresHtml =
    release.changelog?.features?.length > 0
      ? `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; display: flex; align-items: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; background: #ecfdf5; color: #059669; font-size: 12px; margin-right: 8px;">✨ Features</span>
          What's New
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6;">
          ${release.changelog.features.map((f) => `<li style="margin-bottom: 6px;">${escapeHtml(f)}</li>`).join("")}
        </ul>
      </div>
    `
      : "";

  const improvementsHtml =
    release.changelog?.improvements?.length > 0
      ? `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; display: flex; align-items: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; background: #eef2ff; color: #4f46e5; font-size: 12px; margin-right: 8px;">⚡ Improvements</span>
          Performance & UX
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6;">
          ${release.changelog.improvements.map((i) => `<li style="margin-bottom: 6px;">${escapeHtml(i)}</li>`).join("")}
        </ul>
      </div>
    `
      : "";

  const fixesHtml =
    release.changelog?.fixes?.length > 0
      ? `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; display: flex; align-items: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; background: #fef2f2; color: #dc2626; font-size: 12px; margin-right: 8px;">🛠️ Bug Fixes</span>
          Fixes & Stability
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6;">
          ${release.changelog.fixes.map((fx) => `<li style="margin-bottom: 6px;">${escapeHtml(fx)}</li>`).join("")}
        </ul>
      </div>
    `
      : "";

  const logoDisplay =
    project.logoUrl && project.logoUrl.startsWith("http")
      ? `<img src="${project.logoUrl}" alt="${projectName}" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover;" />`
      : `<div style="width: 36px; height: 36px; border-radius: 8px; background: ${accentHex}; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; text-align: center; line-height: 36px;">${
          project.logoUrl || projectName.slice(0, 2).toUpperCase()
        }</div>`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #f1f5f9; background: linear-gradient(to right, #ffffff, #fafafa);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-right: 12px;">${logoDisplay}</td>
                        <td style="vertical-align: middle;">
                          <h1 style="margin: 0; font-size: 17px; font-weight: 800; color: #0f172a; line-height: 1.2;">${escapeHtml(
                            projectName
                          )}</h1>
                          <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">${escapeHtml(
                            project.tagline || "Product Changelog"
                          )}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; background-color: ${accentHex}15; color: ${accentHex}; font-size: 12px; font-weight: 700; border: 1px solid ${accentHex}30;">
                      ${escapeHtml(versionTag)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Release Title & Announcement -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${accentHex}; display: block; margin-bottom: 8px;">
                🚀 New Version Deployed
              </span>
              <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.3;">
                ${escapeHtml(title)}
              </h2>
              <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.5;">
                A new update has just been deployed to production. Here is a summary of all key features, performance improvements, and bug fixes included in this release.
              </p>
            </td>
          </tr>

          <!-- Visual Card Embed -->
          <tr>
            <td style="padding: 8px 32px 24px 32px;">
              <a href="${publicUrl}" target="_blank" style="text-decoration: none; display: block;">
                <img src="${cardImageUrl}" alt="${escapeHtml(title)}" style="width: 100%; height: auto; border-radius: 12px; border: 1px solid #e2e8f0; display: block;" />
              </a>
            </td>
          </tr>

          <!-- Changelog Breakdown -->
          <tr>
            <td style="padding: 0 32px 16px 32px;">
              ${featuresHtml}
              ${improvementsHtml}
              ${fixesHtml}
            </td>
          </tr>

          <!-- Call To Action Button -->
          <tr>
            <td align="center" style="padding: 16px 32px 36px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius: 12px; background-color: ${accentHex};">
                    <a href="${publicUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: -0.01em;">
                      View Full Changelog & Discussion →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;">
                You are receiving this email because you subscribed to product updates for <strong>${escapeHtml(
                  projectName
                )}</strong>.
              </p>
              <p style="margin: 0;">
                <a href="${publicUrl}" style="color: #64748b; text-decoration: underline;">View Online</a>
                &nbsp;•&nbsp;
                <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
                &nbsp;•&nbsp;
                <span style="color: #94a3b8;">Sent via <strong style="color: ${accentHex};">ShipHype</strong></span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
