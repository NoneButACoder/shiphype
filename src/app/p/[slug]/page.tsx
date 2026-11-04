import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProjectBySlug, getAllReleases, getSubscribersCount, BrandAccentColor } from "@/lib/storage";
import { ChangelogTimeline } from "@/components/ChangelogTimeline";
import {
  GitPullRequest,
  ArrowLeft,
  Rss,
  Globe,
  Sparkles,
  CheckCircle2,
  Calendar,
} from "lucide-react";

function XIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  const releases = getAllReleases(slug);

  if (!project) {
    return {
      title: "Changelog Not Found - ShipHype",
    };
  }

  const latest = releases[0];
  const ogTitle = project.tagline
    ? `${project.name} - ${project.tagline}`
    : `${project.name} Changelog & Product Updates`;
  const ogDesc =
    project.description ||
    (latest
      ? `Latest update: ${latest.title} (${latest.versionTag})`
      : `Official product changelog and release history for ${project.name}.`);

  const ogImage = latest
    ? `/api/card?badge=${encodeURIComponent(latest.cardData.badge)}&title=${encodeURIComponent(
        latest.cardData.title
      )}&subtitle=${encodeURIComponent(latest.cardData.subtitle)}&highlights=${encodeURIComponent(
        JSON.stringify(latest.cardData.highlights || [])
      )}&repo=${encodeURIComponent(project.repo || project.slug)}&template=${encodeURIComponent(
        latest.cardData.template || "bento"
      )}&color=${encodeURIComponent(project.accentColor || latest.cardData.themeColor || "indigo")}`
    : null;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: `${project.name} Changelog | ShipHype`,
    description: ogDesc,
    alternates: {
      types: {
        "application/rss+xml": `/p/${slug}/rss.xml`,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDesc,
      images: ogImage ? [ogImage] : [],
    },
  };
}

const COLOR_MAP: Record<
  BrandAccentColor,
  {
    bg: string;
    bgHover: string;
    text: string;
    border: string;
    gradient: string;
    heroGlow: string;
  }
> = {
  indigo: {
    bg: "bg-indigo-600",
    bgHover: "hover:bg-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
    gradient: "from-indigo-600 to-purple-600",
    heroGlow: "from-indigo-500/10 via-purple-500/5 to-transparent",
  },
  cyan: {
    bg: "bg-cyan-600",
    bgHover: "hover:bg-cyan-500",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
    gradient: "from-cyan-500 to-blue-600",
    heroGlow: "from-cyan-500/10 via-blue-500/5 to-transparent",
  },
  emerald: {
    bg: "bg-emerald-600",
    bgHover: "hover:bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    gradient: "from-emerald-500 to-teal-600",
    heroGlow: "from-emerald-500/10 via-teal-500/5 to-transparent",
  },
  amber: {
    bg: "bg-amber-600",
    bgHover: "hover:bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    gradient: "from-amber-500 to-orange-600",
    heroGlow: "from-amber-500/10 via-orange-500/5 to-transparent",
  },
  rose: {
    bg: "bg-rose-600",
    bgHover: "hover:bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    gradient: "from-rose-500 to-pink-600",
    heroGlow: "from-rose-500/10 via-pink-500/5 to-transparent",
  },
  purple: {
    bg: "bg-purple-600",
    bgHover: "hover:bg-purple-500",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
    gradient: "from-purple-600 to-pink-600",
    heroGlow: "from-purple-500/10 via-pink-500/5 to-transparent",
  },
};

export default async function PublicChangelogPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const releases = getAllReleases(slug);
  const subscribersCount = getSubscribersCount(slug);
  const displayYear = project.createdAt ? new Date(project.createdAt).getFullYear() : 2026;

  const accentColor = project.accentColor || "indigo";
  const color = COLOR_MAP[accentColor] || COLOR_MAP.indigo;

  const isImageLogo = project.logoUrl && project.logoUrl.startsWith("http");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors p-1"
              title="Back to ShipHype"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-2.5">
              <div
                className={`h-9 w-9 rounded-xl bg-gradient-to-tr ${color.gradient} flex items-center justify-center text-white text-sm font-bold shadow-sm overflow-hidden shrink-0`}
              >
                {isImageLogo ? (
                  <img src={project.logoUrl} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{project.logoUrl || project.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h1 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                  <span>{project.name}</span>
                  <CheckCircle2 className={`h-3.5 w-3.5 ${color.text}`} />
                </h1>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                  {project.tagline || "Changelog & Product Updates"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Website Link */}
            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all shadow-xs"
                title="Official Website"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Website</span>
              </a>
            )}

            {/* Twitter Link */}
            {project.twitterHandle && (
              <a
                href={`https://x.com/${project.twitterHandle.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all shadow-xs"
                title={`Follow @${project.twitterHandle} on X`}
              >
                <XIcon className="h-3 w-3" />
                <span className="hidden sm:inline">@{project.twitterHandle.replace("@", "")}</span>
              </a>
            )}

            {/* RSS Feed */}
            <a
              href={`/p/${project.slug}/rss.xml`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-medium transition-all shadow-xs"
              title="Subscribe via RSS"
            >
              <Rss className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">RSS</span>
            </a>

            {/* GitHub Repo */}
            {project.repo && (
              <a
                href={`https://github.com/${project.repo}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all shadow-xs"
              >
                <GitPullRequest className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{project.repo}</span>
              </a>
            )}

            <Link
              href="/"
              className={`px-3 py-1.5 rounded-xl ${color.bg} ${color.bgHover} text-white text-xs font-medium shadow-sm transition-all`}
            >
              ShipHype
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className={`border-b border-slate-200 dark:border-zinc-800/80 bg-gradient-to-b ${color.heroGlow} py-10 px-4`}>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${color.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/10 overflow-hidden shrink-0`}
              >
                {isImageLogo ? (
                  <img src={project.logoUrl} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{project.logoUrl || project.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {project.name}
                  </h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${color.bg}/10 ${color.text} border ${color.border}`}>
                    Official
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-2xl font-normal">
                  {project.tagline || "Official changelog, feature drops, and product announcements."}
                </p>
                {project.description && (
                  <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-2xl pt-1 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col items-end gap-2 text-xs text-slate-500 dark:text-zinc-400 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>{releases.length} releases published</span>
              </div>
              {project.customDomain && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono text-[11px]">
                  <span>{project.customDomain}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Changelog Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        <ChangelogTimeline
          project={project}
          releases={releases}
          initialSubscribersCount={subscribersCount}
        />
      </main>

      {/* Growth Flywheel Badge Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-8 text-center text-xs text-slate-500 dark:text-zinc-500 transition-colors">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {displayYear} {project.name}. All releases tracked.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 text-xs font-medium transition-colors"
          >
            <span>⚡ Shipped via</span>
            <strong className={color.text}>ShipHype</strong>
          </a>
        </div>
      </footer>
    </div>
  );
}
