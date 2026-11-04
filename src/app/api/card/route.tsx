import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const COLOR_PALETTES: Record<
  string,
  {
    primary: string;
    secondary: string;
    gradient: string;
    glow: string;
    lightBg: string;
    lightBorder: string;
    tagBg: string;
  }
> = {
  indigo: {
    primary: "#818cf8",
    secondary: "#4f46e5",
    gradient: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    glow: "rgba(99, 102, 241, 0.25)",
    lightBg: "#eef2ff",
    lightBorder: "#c7d2fe",
    tagBg: "rgba(99, 102, 241, 0.15)",
  },
  cyan: {
    primary: "#22d3ee",
    secondary: "#0891b2",
    gradient: "linear-gradient(135deg, #0891b2, #0284c7)",
    glow: "rgba(6, 182, 212, 0.25)",
    lightBg: "#ecfeff",
    lightBorder: "#a5f3fc",
    tagBg: "rgba(6, 182, 212, 0.15)",
  },
  emerald: {
    primary: "#34d399",
    secondary: "#059669",
    gradient: "linear-gradient(135deg, #059669, #0d9488)",
    glow: "rgba(16, 185, 129, 0.25)",
    lightBg: "#ecfdf5",
    lightBorder: "#a7f3d0",
    tagBg: "rgba(16, 185, 129, 0.15)",
  },
  amber: {
    primary: "#fbbf24",
    secondary: "#d97706",
    gradient: "linear-gradient(135deg, #d97706, #ea580c)",
    glow: "rgba(245, 158, 11, 0.25)",
    lightBg: "#fffbeb",
    lightBorder: "#fde68a",
    tagBg: "rgba(245, 158, 11, 0.15)",
  },
  rose: {
    primary: "#fb7185",
    secondary: "#e11d48",
    gradient: "linear-gradient(135deg, #e11d48, #c026d3)",
    glow: "rgba(244, 63, 94, 0.25)",
    lightBg: "#fff1f2",
    lightBorder: "#fecdd3",
    tagBg: "rgba(244, 63, 94, 0.15)",
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const badge = searchParams.get("badge") || "NEW UPDATE";
    const title = searchParams.get("title") || "Release Highlights";
    const subtitle = searchParams.get("subtitle") || "Major enhancements and stability improvements shipped.";
    const highlightsParam = searchParams.get("highlights");
    const repo = searchParams.get("repo") || "shiphype/core";
    const template = (searchParams.get("template") || "bento").toLowerCase();
    const colorKey = (searchParams.get("color") || "indigo").toLowerCase();
    const showWatermark = searchParams.get("watermark") !== "false";

    const color = COLOR_PALETTES[colorKey] || COLOR_PALETTES.indigo;

    let highlights: string[] = [
      "Optimized runtime pipeline for faster iterations",
      "Fixed edge-case state synchronization issues",
      "Polished developer-facing interfaces and CLI",
    ];

    if (highlightsParam) {
      try {
        const parsed = JSON.parse(highlightsParam);
        if (Array.isArray(parsed) && parsed.length > 0) {
          highlights = parsed;
        }
      } catch {
        // Fallback to default
      }
    }

    // ==========================================
    // TEMPLATE 1: Clean Minimal (Light & Crisp)
    // ==========================================
    if (template === "clean") {
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "54px 64px",
              backgroundColor: "#f8fafc",
              backgroundImage: `radial-gradient(circle at 90% 10%, ${color.lightBg}, transparent 45%), radial-gradient(circle at 10% 90%, #f1f5f9, transparent 40%)`,
              color: "#0f172a",
              fontFamily: "system-ui, -apple-system, sans-serif",
              position: "relative",
            }}
          >
            {/* Top Accent Stripe */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "8px",
                background: color.gradient,
              }}
            />

            {/* Header Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    background: color.lightBg,
                    border: `1.5px solid ${color.lightBorder}`,
                    color: color.secondary,
                    fontSize: "15px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {badge}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "18px",
                    color: "#64748b",
                    fontWeight: 600,
                  }}
                >
                  {repo}
                </div>
              </div>

              {showWatermark && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    fontSize: "14px",
                    color: "#475569",
                    fontWeight: 600,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                  }}
                >
                  <span>⚡ Shipped via ShipHype</span>
                </div>
              )}
            </div>

            {/* Title & Subtitle Section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "46px",
                  fontWeight: 900,
                  lineHeight: 1.15,
                  color: "#0f172a",
                  letterSpacing: "-0.03em",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: "1070px",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 500,
                  color: "#475569",
                  lineHeight: 1.4,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: "1070px",
                }}
              >
                {subtitle}
              </div>
            </div>

            {/* Clean Feature Cards */}
            <div
              style={{
                display: "flex",
                gap: "20px",
                width: "100%",
              }}
            >
              {highlights.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "24px",
                    borderRadius: "16px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
                    minHeight: "140px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: color.secondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: color.secondary,
                      }}
                    />
                    Feature 0{idx + 1}
                  </div>
                  <div
                    style={{
                      fontSize: "17px",
                      color: "#1e293b",
                      lineHeight: 1.45,
                      fontWeight: 500,
                    }}
                  >
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // ==========================================
    // TEMPLATE 2: Terminal Hacker (macOS Shell)
    // ==========================================
    if (template === "terminal") {
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "44px 56px",
              backgroundColor: "#0d1117",
              color: "#c9d1d9",
              fontFamily: "Courier New, Menlo, Monaco, monospace",
            }}
          >
            {/* Terminal Window Shell */}
            <div
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "28px 36px",
                borderRadius: "18px",
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
              }}
            >
              {/* Terminal Window Header Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #21262d",
                  paddingBottom: "18px",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#ff5f56" }} />
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#27c93f" }} />
                </div>
                <div style={{ display: "flex", fontSize: "15px", color: "#8b949e", fontWeight: 600 }}>
                  {`developer@github: ~/${repo}`}
                </div>
                <div
                  style={{
                    display: "flex",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: color.primary,
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {`TAG: ${badge}`}
                </div>
              </div>

              {/* Command Prompt Line */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "20px", marginTop: "16px" }}>
                <span style={{ color: "#38bdf8" }}>$</span>
                <span style={{ color: "#f0f6fc", fontWeight: 700 }}>shiphype release</span>
                <span style={{ color: color.primary }}>--deploy --production</span>
              </div>

              {/* Main Release Output Banner */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  margin: "14px 0",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderLeft: `4px solid ${color.primary}`,
                }}
              >
                <div style={{ display: "flex", fontSize: "36px", fontWeight: 800, color: "#f0f6fc", lineHeight: 1.2 }}>
                  {`✔ ${title}`}
                </div>
                <div style={{ display: "flex", fontSize: "18px", color: "#8b949e", lineHeight: 1.4 }}>
                  {`> ${subtitle}`}
                </div>
              </div>

              {/* Highlights as Terminal Log lines */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                {highlights.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "16px",
                      color: "#e6edf3",
                    }}
                  >
                    <span style={{ color: color.primary, fontWeight: 700 }}>[+]</span>
                    <span style={{ fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Terminal Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  color: "#6e7681",
                  marginTop: "16px",
                  borderTop: "1px solid #21262d",
                  paddingTop: "12px",
                }}
              >
                <span>status: 200 OK • git branch: main</span>
                {showWatermark && <span># Shipped via ShipHype</span>}
              </div>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // ==========================================
    // TEMPLATE 3: Bento Dark (Default)
    // ==========================================
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
            backgroundColor: "#09090b",
            backgroundImage: `radial-gradient(circle at 85% 15%, ${color.glow}, transparent 45%), radial-gradient(circle at 15% 85%, rgba(168, 85, 247, 0.14), transparent 40%)`,
            color: "#fafafa",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  background: color.gradient,
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  boxShadow: `0 0 20px ${color.glow}`,
                }}
              >
                {badge}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  color: "#71717a",
                  fontWeight: 500,
                }}
              >
                {repo}
              </div>
            </div>

            {showWatermark && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  fontSize: "14px",
                  color: "#a1a1aa",
                  fontWeight: 600,
                }}
              >
                <span>🚀 Shipped via ShipHype</span>
              </div>
            )}
          </div>

          {/* Title & Subtitle Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "24px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "46px",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                maxWidth: "1070px",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 400,
                color: "#a1a1aa",
                lineHeight: 1.4,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                maxWidth: "1070px",
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Bento Highlights Cards Row */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              width: "100%",
            }}
          >
            {highlights.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "24px",
                  borderRadius: "16px",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.36)",
                  minHeight: "140px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: color.primary,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: color.primary,
                    }}
                  />
                  Feature 0{idx + 1}
                </div>
                <div
                  style={{
                    fontSize: "17px",
                    color: "#e4e4e7",
                    lineHeight: 1.45,
                    fontWeight: 500,
                  }}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error generating visual card";
    return new Response(`Failed to generate image: ${msg}`, { status: 500 });
  }
}
