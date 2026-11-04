"use client";

import React, { useState, useMemo } from "react";
import { ProjectRecord, ReleaseRecord } from "@/lib/storage";
import {
  Search,
  Sparkles,
  GitPullRequest,
  Calendar,
  ExternalLink,
  Zap,
  Wrench,
  Share2,
  Copy,
  Check,
  Mail,
  Filter,
  X,
  FileText,
} from "lucide-react";

interface ChangelogTimelineProps {
  project: ProjectRecord;
  releases: ReleaseRecord[];
  initialSubscribersCount?: number;
}

type FilterCategory = "all" | "features" | "improvements" | "fixes";

const BRAND_THEMES: Record<
  string,
  {
    bg: string;
    bgHover: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    gradient: string;
  }
> = {
  indigo: {
    bg: "bg-indigo-600",
    bgHover: "hover:bg-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200/80 dark:border-indigo-900/50",
    badgeBg: "bg-indigo-100 dark:bg-indigo-900/60",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    gradient: "from-indigo-50/70 via-purple-50/40 to-slate-50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-zinc-900/40",
  },
  cyan: {
    bg: "bg-cyan-600",
    bgHover: "hover:bg-cyan-500",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-200/80 dark:border-cyan-900/50",
    badgeBg: "bg-cyan-100 dark:bg-cyan-900/60",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    gradient: "from-cyan-50/70 via-blue-50/40 to-slate-50 dark:from-cyan-950/30 dark:via-blue-950/20 dark:to-zinc-900/40",
  },
  emerald: {
    bg: "bg-emerald-600",
    bgHover: "hover:bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200/80 dark:border-emerald-900/50",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/60",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-50/70 via-teal-50/40 to-slate-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-zinc-900/40",
  },
  amber: {
    bg: "bg-amber-600",
    bgHover: "hover:bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200/80 dark:border-amber-900/50",
    badgeBg: "bg-amber-100 dark:bg-amber-900/60",
    badgeText: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-50/70 via-orange-50/40 to-slate-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-zinc-900/40",
  },
  rose: {
    bg: "bg-rose-600",
    bgHover: "hover:bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200/80 dark:border-rose-900/50",
    badgeBg: "bg-rose-100 dark:bg-rose-900/60",
    badgeText: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-50/70 via-pink-50/40 to-slate-50 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-zinc-900/40",
  },
  purple: {
    bg: "bg-purple-600",
    bgHover: "hover:bg-purple-500",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200/80 dark:border-purple-900/50",
    badgeBg: "bg-purple-100 dark:bg-purple-900/60",
    badgeText: "text-purple-700 dark:text-purple-300",
    gradient: "from-purple-50/70 via-pink-50/40 to-slate-50 dark:from-purple-950/30 dark:via-pink-950/20 dark:to-zinc-900/40",
  },
};

export function ChangelogTimeline({
  project,
  releases,
  initialSubscribersCount = 0,
}: ChangelogTimelineProps) {
  const brand = BRAND_THEMES[project.accentColor || "indigo"] || BRAND_THEMES.indigo;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");

  // Email Subscription State
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subMessage, setSubMessage] = useState("");
  const [subCount, setSubCount] = useState(initialSubscribersCount);

  // Link copy toast per release
  const [copiedReleaseId, setCopiedReleaseId] = useState<string | null>(null);
  const [copiedMdId, setCopiedMdId] = useState<string | null>(null);

  // Filter releases by search and category
  const filteredReleases = useMemo(() => {
    return releases.filter((release) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTag = release.versionTag.toLowerCase().includes(query);
        const matchesTitle = release.title.toLowerCase().includes(query);
        const matchesFeatures = release.changelog.features?.some((f) =>
          f.toLowerCase().includes(query)
        );
        const matchesImprovements = release.changelog.improvements?.some((imp) =>
          imp.toLowerCase().includes(query)
        );
        const matchesFixes = release.changelog.fixes?.some((fix) =>
          fix.toLowerCase().includes(query)
        );

        if (!matchesTag && !matchesTitle && !matchesFeatures && !matchesImprovements && !matchesFixes) {
          return false;
        }
      }

      // 2. Category Filter
      if (activeCategory === "features") {
        return release.changelog.features && release.changelog.features.length > 0;
      }
      if (activeCategory === "improvements") {
        return release.changelog.improvements && release.changelog.improvements.length > 0;
      }
      if (activeCategory === "fixes") {
        return release.changelog.fixes && release.changelog.fixes.length > 0;
      }

      return true;
    });
  }, [releases, searchQuery, activeCategory]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    try {
      setSubscribing(true);
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectSlug: project.slug, email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        setSubCount(data.subscribersCount || subCount + (data.isNew ? 1 : 0));
        setSubMessage(data.isNew ? "🎉 You're subscribed to new updates!" : "You're already subscribed!");
      } else {
        alert(data.error || "Subscription failed");
      }
    } catch (err) {
      alert("Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleCopyReleaseLink = (versionTag: string, id: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/p/${project.slug}#${encodeURIComponent(versionTag)}`;
      navigator.clipboard.writeText(url);
      setCopiedReleaseId(id);
      setTimeout(() => setCopiedReleaseId(null), 2000);
    }
  };

  const handleCopyMarkdown = (release: ReleaseRecord) => {
    let md = `## [${release.versionTag}] - ${release.title}\n\n`;
    if (release.changelog.features?.length > 0) {
      md += `### ✨ Features\n` + release.changelog.features.map((f) => `- ${f}`).join("\n") + "\n\n";
    }
    if (release.changelog.improvements?.length > 0) {
      md += `### ⚡ Improvements\n` + release.changelog.improvements.map((i) => `- ${i}`).join("\n") + "\n\n";
    }
    if (release.changelog.fixes?.length > 0) {
      md += `### 🛠 Fixes\n` + release.changelog.fixes.map((fx) => `- ${fx}`).join("\n") + "\n\n";
    }

    navigator.clipboard.writeText(md.trim());
    setCopiedMdId(release.id);
    setTimeout(() => setCopiedMdId(null), 2000);
  };

  const handleShareToX = (release: ReleaseRecord) => {
    if (typeof window !== "undefined") {
      const pageUrl = `${window.location.origin}/p/${project.slug}#${encodeURIComponent(release.versionTag)}`;
      const text = `Just shipped ${project.name} ${release.versionTag}: ${release.title}!\n\nCheck out the full release changelog:`;
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`;
      window.open(shareUrl, "_blank", "width=550,height=420");
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Email Subscribe Callout Box */}
      <div className={`rounded-3xl border ${brand.border} bg-gradient-to-r ${brand.gradient} p-6 sm:p-7 shadow-xs`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-xs font-semibold uppercase tracking-wider ${brand.text}`}>
                Never Miss a Release
              </span>
              {subCount > 0 && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${brand.badgeBg} ${brand.badgeText} font-medium`}>
                  {subCount} {subCount === 1 ? "subscriber" : "subscribers"}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Get {project.name} release notes in your inbox
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-xl">
              Subscribe to get notified the minute new features and major improvements are deployed. No spam, unsubscribe anytime.
            </p>
          </div>

          {/* Form */}
          <div className="shrink-0 w-full md:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium animate-in fade-in">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{subMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribing}
                  className={`px-4 py-2.5 rounded-xl ${brand.bg} ${brand.bgHover} text-white text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer disabled:opacity-60`}
                >
                  {subscribing ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Updates ({releases.length})
          </button>
          <button
            onClick={() => setActiveCategory("features")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === "features"
                ? `${brand.bg} text-white shadow-xs`
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Features</span>
          </button>
          <button
            onClick={() => setActiveCategory("improvements")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === "improvements"
                ? `${brand.bg} text-white shadow-xs`
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Zap className="h-3 w-3" />
            <span>Improvements</span>
          </button>
          <button
            onClick={() => setActiveCategory("fixes")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === "fixes"
                ? `${brand.bg} text-white shadow-xs`
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Wrench className="h-3 w-3" />
            <span>Fixes</span>
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search release notes..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Timeline Items */}
      {filteredReleases.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white dark:bg-zinc-900/40 rounded-2xl border border-slate-200 dark:border-zinc-800 p-8">
          <Filter className="h-8 w-8 text-slate-300 dark:text-zinc-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
            No matching updates found
          </p>
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            Try adjusting your search keyword or clearing the category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="relative border-l-2 border-indigo-500/20 dark:border-indigo-500/30 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-12">
          {filteredReleases.map((release) => {
            const pubDate = new Date(release.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            const template = release.cardData.template || "bento";
            const color = release.cardData.themeColor || "indigo";
            const watermark = release.cardData.watermark !== false ? "true" : "false";

            const cardImageUrl = `/api/card?badge=${encodeURIComponent(
              release.cardData.badge
            )}&title=${encodeURIComponent(release.cardData.title)}&subtitle=${encodeURIComponent(
              release.cardData.subtitle
            )}&highlights=${encodeURIComponent(
              JSON.stringify(release.cardData.highlights || [])
            )}&repo=${encodeURIComponent(project.repo || project.slug)}&template=${encodeURIComponent(
              template
            )}&color=${encodeURIComponent(color)}&watermark=${watermark}`;

            return (
              <article
                key={release.id}
                id={encodeURIComponent(release.versionTag)}
                className="relative group scroll-mt-24"
              >
                {/* Timeline Dot Indicator */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#070709] border-2 border-indigo-600 dark:border-indigo-400 group-hover:scale-125 transition-transform shadow-xs" />

                {/* Release Card */}
                <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-sm space-y-6 transition-all hover:border-slate-300 dark:hover:border-zinc-700">
                  {/* Header Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="font-mono text-xs sm:text-sm px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 font-bold">
                        {release.versionTag}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{pubDate}</span>
                      </div>
                    </div>

                    {/* Actions: Anchor Copy, Markdown, Share to X */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyReleaseLink(release.versionTag, release.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors cursor-pointer"
                        title="Copy direct anchor link"
                      >
                        {copiedReleaseId === release.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyMarkdown(release)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white text-xs transition-colors cursor-pointer"
                        title="Copy release notes as Markdown"
                      >
                        {copiedMdId === release.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleShareToX(release)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 text-xs font-medium transition-opacity cursor-pointer"
                        title="Share this release on X"
                      >
                        <Share2 className="h-3 w-3" />
                        <span className="hidden sm:inline">Share</span>
                      </button>

                      {release.sourcePr && (
                        <a
                          href={release.sourcePr.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs transition-colors"
                        >
                          <GitPullRequest className="h-3 w-3" />
                          <span className="hidden sm:inline">PR #{release.sourcePr.pullNumber}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Release Title */}
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                    {release.title}
                  </h2>

                  {/* 1200x630 Card Image Preview */}
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-md aspect-[1200/630] bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cardImageUrl}
                      alt={`${release.title} Release Card`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Categorized Changelog Notes */}
                  <div className="space-y-4 pt-2">
                    {/* Features */}
                    {release.changelog.features && release.changelog.features.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>New Features</span>
                        </div>
                        <ul className="space-y-1.5 pl-1">
                          {release.changelog.features.map((feat, i) => (
                            <li key={i} className="text-sm text-slate-700 dark:text-zinc-300 flex items-start gap-2">
                              <span className="text-indigo-500 mt-1">•</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {release.changelog.improvements && release.changelog.improvements.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                          <Zap className="h-3.5 w-3.5" />
                          <span>Improvements & Polish</span>
                        </div>
                        <ul className="space-y-1.5 pl-1">
                          {release.changelog.improvements.map((imp, i) => (
                            <li key={i} className="text-sm text-slate-700 dark:text-zinc-300 flex items-start gap-2">
                              <span className="text-teal-500 mt-1">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Fixes */}
                    {release.changelog.fixes && release.changelog.fixes.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          <Wrench className="h-3.5 w-3.5" />
                          <span>Bug Fixes & Stability</span>
                        </div>
                        <ul className="space-y-1.5 pl-1">
                          {release.changelog.fixes.map((fix, i) => (
                            <li key={i} className="text-sm text-slate-700 dark:text-zinc-300 flex items-start gap-2">
                              <span className="text-amber-500 mt-1">•</span>
                              <span>{fix}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
