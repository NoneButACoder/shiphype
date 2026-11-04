"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ChangelogEditor } from "@/components/ChangelogEditor";
import { TweetsEditor } from "@/components/TweetsEditor";
import { CardEditor } from "@/components/CardEditor";
import { GitHubAuthModal } from "@/components/GitHubAuthModal";
import { RepoSelectorDrawer } from "@/components/RepoSelectorDrawer";
import { AuthUser } from "@/lib/auth";
import { GeneratedPayload, PRSummary } from "@/types";
import {
  Sparkles,
  ArrowRight,
  FileCode2,
  Share2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  Rocket,
  Check,
  Copy,
  X,
  Globe,
  LayoutDashboard,
  GitPullRequest,
} from "lucide-react";

export default function Home() {
  const [prUrl, setPrUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [language, setLanguage] = useState<"en" | "zh">("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [payload, setPayload] = useState<GeneratedPayload | null>(null);
  const [prInfo, setPrInfo] = useState<PRSummary | null>(null);
  const [unmatchedNumbers, setUnmatchedNumbers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"changelog" | "tweets" | "card">("tweets");

  // Publish Modal state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSlug, setPublishSlug] = useState("");
  const [publishVersion, setPublishVersion] = useState("");
  const [publishTitle, setPublishTitle] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ url: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // User Session State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Session check failed", err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // Apply theme to document and body
  const applyTheme = (t: "light" | "dark") => {
    if (typeof document !== "undefined") {
      if (t === "dark") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
        document.body.style.backgroundColor = "#070709";
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
        document.body.style.backgroundColor = "#f8fafc";
      }
    }
  };

  // Initialize theme from localStorage (default "light")
  useEffect(() => {
    const savedTheme = localStorage.getItem("shiphype_theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("shiphype_theme", newTheme);
    applyTheme(newTheme);
  };

  const isZh = language === "zh";

  const t = {
    en: {
      heroBadge: "Turn GitHub PRs into high-converting launch hype",
      heroTitle1: "Stop procrastinating your ",
      heroTitle2: "release announcements",
      heroDesc:
        "Paste any GitHub PR. Get an accurate changelog, 3 customized tweet drafts, and a 1200×630 Bento card ready to paste directly on X.",
      inputPlaceholder: "e.g. https://github.com/owner/repo/pull/123 or owner/repo#123",
      btnGenerate: "Generate Hype",
      btnGenerating: "Generating...",
      quickPresets: "Quick presets:",
      devNotesToggle: "Developer notes & context (Optional)",
      devNotesLabel: "Release Notes / Context (Optional - Great if PR description is short):",
      devNotesPlaceholder: "e.g. Highlight the 30% performance boost and why users will love it...",
      tabTweets: "3x Tweet Drafts",
      tabCard: "Bento Visual Card",
      tabChangelog: "Changelog Markdown",
      viewOnGithub: "View on GitHub",
      btnPublish: "Publish to Changelog (/p/...)",
      feature1Title: "Low-Sensitivity PR Ingestion",
      feature1Desc: "Reads titles, descriptions, and file paths. Leaves raw sensitive diffs private by default.",
      feature2Title: "3x High-Converting Tweet Formats",
      feature2Desc: "Get a story-based tweet, a bulleted list, and a short punchy hook ready for single-click posting to X.",
      feature3Title: "Zero-Click Bento Visual Card",
      feature3Desc: "1200×630 image card with instant clipboard copy. Hot-tune headline and copy with zero AI cost.",
      footer: "ShipHype • Shipped for indie builders who build in public.",
    },
    zh: {
      heroBadge: "将 GitHub PR 极速转化为高质量发版宣发物料",
      heroTitle1: "别再拖延你的版本 ",
      heroTitle2: "更新宣发",
      heroDesc:
        "粘贴任意 GitHub PR 链接，几秒内自动生成准确更新日志、3 篇定制推文草稿与 1200×630 Bento 宣发配图。",
      inputPlaceholder: "例如 https://github.com/owner/repo/pull/123 或 owner/repo#123",
      btnGenerate: "生成发版物料",
      btnGenerating: "正在生成中...",
      quickPresets: "快捷示例：",
      devNotesToggle: "补充改动背景或亮点（可选）",
      devNotesLabel: "开发者备忘 / 补充说明（可选 - PR 描述较短时推荐填写）：",
      devNotesPlaceholder: "例如：重点突出本次新增优惠券打 8 折，提升了结账转化率...",
      tabTweets: "3 篇推文草稿",
      tabCard: "Bento 宣发配图",
      tabChangelog: "更新日志 Markdown",
      viewOnGithub: "在 GitHub 查看",
      btnPublish: "发布到公开更新页 (/p/...)",
      feature1Title: "低敏感度 PR 摘要解析",
      feature1Desc: "仅读取标题、描述及变动文件路径，默认不上传完整敏感代码，保障隐私安全。",
      feature2Title: "3 种高转化推文格式",
      feature2Desc: "一键获得故事型、要点型和短钩子型推文，原生适配发帖习惯，支持一键拉起发推。",
      feature3Title: "1200×630 Bento 宣发大图",
      feature3Desc: "自动渲染精美 Bento 配图，支持一键写入系统剪贴板（Ctrl+V 直贴），文案即时热微调。",
      footer: "ShipHype • 专为 Build in Public 独立开发者与创造者打造。",
    },
  }[language];

  const samplePRs = [
    {
      name: "ShoppinggWebSite (My PR #1)",
      url: "https://github.com/NoneButACoder/ShoppinggWebSite/pull/1",
    },
    {
      name: "shadcn/ui Registry feat",
      url: "https://github.com/shadcn-ui/ui/pull/12560",
    },
    {
      name: "Supabase Grafana Integration",
      url: "https://github.com/supabase/supabase/pull/52580",
    },
  ];

  const handleGenerate = async (targetUrl?: string) => {
    const urlToUse = targetUrl || prUrl;
    if (!urlToUse.trim()) {
      setError(isZh ? "请输入有效的 GitHub PR 链接或选择下方示例。" : "Please enter a valid GitHub Pull Request URL or select one of the presets.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutTimer = setTimeout(() => controller.abort(), 90000);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          prUrl: urlToUse.trim(),
          notes: notes.trim(),
          language,
        }),
      });

      clearTimeout(timeoutTimer);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate release pack.");
      }

      setPayload(data.data);
      setPrInfo(data.pr);
      setUnmatchedNumbers(data.numbersAudit?.unmatchedNumbers || []);
      setActiveTab("tweets");
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(isZh ? "请求超时（60秒），Google 模型响应较慢，请稍后重试。" : "Request timed out (60s). Google Gemini API might be slow or unstable, please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPublishModal = () => {
    if (prInfo && payload) {
      const defaultSlug = prInfo.repo.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      setPublishSlug(defaultSlug);
      setPublishVersion(payload.visual_card.badge || "v1.1.0");
      setPublishTitle(payload.visual_card.title || prInfo.title);
    }
    setPublishResult(null);
    setShowPublishModal(true);
  };

  const handlePublishConfirm = async () => {
    if (!publishSlug.trim()) {
      alert(isZh ? "请输入项目唯一标识 Slug" : "Please provide a project slug.");
      return;
    }

    try {
      setPublishing(true);
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: publishSlug,
          projectName: prInfo?.repo || publishSlug,
          repo: prInfo ? `${prInfo.owner}/${prInfo.repo}` : "",
          versionTag: publishVersion,
          title: publishTitle,
          changelog: payload?.changelog,
          cardData: payload?.visual_card,
          sourcePr: prInfo
            ? {
                owner: prInfo.owner,
                repo: prInfo.repo,
                pullNumber: prInfo.pullNumber,
                url: prInfo.htmlUrl,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish release.");
      }

      setPublishResult({ url: data.publicUrl });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Publishing failed.");
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyPublicLink = () => {
    if (publishResult) {
      const fullUrl = `${window.location.origin}${publishResult.url}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""} bg-slate-50 dark:bg-[#070709] text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-700 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-200 transition-colors duration-200`}>
      <Header
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={handleThemeChange}
        user={user}
        onOpenConnectModal={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>{t.heroBadge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {t.heroTitle1}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {t.heroTitle2}
            </span>
          </h1>

          <p className="text-slate-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            {t.heroDesc}
          </p>
        </div>

        {/* GitHub Ingestion Drawer or Connect Banner */}
        <div className="max-w-3xl mx-auto w-full">
          {user ? (
            <RepoSelectorDrawer
              user={user}
              language={language}
              onSelectPr={(url, autoGenerate) => {
                setPrUrl(url);
                if (autoGenerate) {
                  handleGenerate(url);
                }
              }}
            />
          ) : (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/60 border border-indigo-100 dark:border-indigo-950/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs backdrop-blur-xs transition-all">
              <div className="flex items-center gap-3 text-slate-700 dark:text-zinc-300">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <GitPullRequest className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {isZh ? "连接 GitHub 账号" : "Connect GitHub"}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {isZh
                      ? "直接在网页内一键挑选你的仓库与 PR 列表，无需反复切换复制链接。"
                      : "Browse your personal repositories & PRs directly with 1-click auto ingestion."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs shrink-0 cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>{isZh ? "一键连接 GitHub" : "Connect Account"}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="max-w-3xl mx-auto w-full bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-sm space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder={t.inputPlaceholder}
              className="flex-1 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 px-4 py-3 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  {t.btnGenerating}
                </>
              ) : (
                <>
                  {t.btnGenerate}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 dark:text-zinc-500">{t.quickPresets}</span>
            {samplePRs.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setPrUrl(preset.url);
                  handleGenerate(preset.url);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800/80 transition-colors cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Optional Developer Notes Accordion */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/60">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <span>{t.devNotesToggle}</span>
              {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    {t.devNotesLabel}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder={t.devNotesPlaceholder}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 p-3 text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Quick Link to Dashboard */}
        {!payload && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span>{isZh ? "已有发布记录？" : "Already published releases?"}</span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>{isZh ? "打开项目控制台 & 历史版本" : "Open Project Dashboard"}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* Results Workspace */}
        {payload && prInfo && (
          <div className="max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
            {/* PR Meta Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-100/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-zinc-200">
                  {prInfo.owner}/{prInfo.repo}#{prInfo.pullNumber}
                </span>
                <span className="text-slate-300 dark:text-zinc-600">•</span>
                <span className="truncate max-w-md text-slate-700 dark:text-zinc-300">{prInfo.title}</span>
              </div>
              <a
                href={prInfo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                <span>{t.viewOnGithub}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Results Navigation Tabs & Publish Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("tweets")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === "tweets"
                      ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Share2 className="h-4 w-4" />
                  {t.tabTweets}
                </button>

                <button
                  onClick={() => setActiveTab("card")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === "card"
                      ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  {t.tabCard}
                </button>

                <button
                  onClick={() => setActiveTab("changelog")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === "changelog"
                      ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <FileCode2 className="h-4 w-4" />
                  {t.tabChangelog}
                </button>
              </div>

              {/* Publish to Changelog Action */}
              <button
                onClick={handleOpenPublishModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer mb-2 sm:mb-0"
              >
                <Rocket className="h-3.5 w-3.5" />
                <span>{t.btnPublish}</span>
              </button>
            </div>

            {/* Tab Panels */}
            <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
              {activeTab === "tweets" && (
                <TweetsEditor
                  drafts={payload.social_drafts}
                  cardData={payload.visual_card}
                  repoName={`${prInfo.owner}/${prInfo.repo}`}
                  projectSlug={prInfo.repo.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}
                  language={language}
                  onChange={(type, val) => {
                    setPayload({
                      ...payload,
                      social_drafts: {
                        ...payload.social_drafts,
                        [type]: val,
                      },
                    });
                  }}
                />
              )}

              {activeTab === "card" && (
                <CardEditor
                  card={payload.visual_card}
                  repoName={`${prInfo.owner}/${prInfo.repo}`}
                  language={language}
                  onChange={(newCard) => {
                    setPayload({
                      ...payload,
                      visual_card: newCard,
                    });
                  }}
                />
              )}

              {activeTab === "changelog" && (
                <ChangelogEditor
                  changelog={payload.changelog}
                  language={language}
                  onChange={(newChangelog) => {
                    setPayload({
                      ...payload,
                      changelog: newChangelog,
                    });
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Feature Grid / Empty state guide */}
        {!payload && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800/60 shadow-xs dark:shadow-none space-y-2 transition-colors">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-zinc-200 text-sm">{t.feature1Title}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                {t.feature1Desc}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800/60 shadow-xs dark:shadow-none space-y-2 transition-colors">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-zinc-200 text-sm">{t.feature2Title}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                {t.feature2Desc}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800/60 shadow-xs dark:shadow-none space-y-2 transition-colors">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-zinc-200 text-sm">{t.feature3Title}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                {t.feature3Desc}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Rocket className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {isZh ? "发布至项目公开更新日志页" : "Publish to Public Changelog"}
                </h3>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!publishResult ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {isZh
                    ? "将本次发版日志与配图保存并生成永久可访问的公开更新页。任何人都能访问你的项目更新时间轴。"
                    : "Save this release to a publicly hosted changelog timeline. Users and backers can browse all your version updates."}
                </p>

                {/* Slug Input with Live Preview */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    {isZh ? "公开主页标识 (Project Slug)" : "Public URL Slug"}
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-2 text-xs">
                    <span className="text-slate-400 dark:text-zinc-500 font-mono">/p/</span>
                    <input
                      type="text"
                      value={publishSlug}
                      onChange={(e) => setPublishSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"))}
                      className="flex-1 bg-transparent border-none text-slate-900 dark:text-white font-mono focus:outline-none pl-1"
                      placeholder="my-project"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                    {isZh ? "主页链接：" : "Live URL: "}
                    <code className="text-indigo-600 dark:text-indigo-400 font-mono">
                      /p/{publishSlug || "my-project"}
                    </code>
                  </span>
                </div>

                {/* Version Tag */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      {isZh ? "版本标签" : "Version Tag"}
                    </label>
                    <input
                      type="text"
                      value={publishVersion}
                      onChange={(e) => setPublishVersion(e.target.value)}
                      className="w-full rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. v1.1.0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      {isZh ? "关联仓库" : "Repository"}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={prInfo ? `${prInfo.owner}/${prInfo.repo}` : ""}
                      className="w-full rounded-xl bg-slate-200/50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 px-3 py-2 text-xs text-slate-500 dark:text-zinc-500"
                    />
                  </div>
                </div>

                {/* Release Headline */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    {isZh ? "发版大标题" : "Release Headline"}
                  </label>
                  <input
                    type="text"
                    value={publishTitle}
                    onChange={(e) => setPublishTitle(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Headline summary"
                  />
                </div>

                {/* Confirm Action Button */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {isZh ? "取消" : "Cancel"}
                  </button>
                  <button
                    onClick={handlePublishConfirm}
                    disabled={publishing}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {publishing ? (
                      <>
                        <Sparkles className="h-3.5 w-3.5 animate-spin" />
                        <span>{isZh ? "正在发布..." : "Publishing..."}</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="h-3.5 w-3.5" />
                        <span>{isZh ? "确认公开发布" : "Confirm & Publish"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Success State */
              <div className="py-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {isZh ? "发布成功！" : "Successfully Published!"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {isZh
                      ? "你的更新日志现已在公开时间轴上线，所有人均可访问："
                      : "Your update is now live on the public timeline for everyone to see:"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  <span className="truncate">{publishResult.url}</span>
                  <button
                    onClick={handleCopyPublicLink}
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedLink ? (isZh ? "已复制" : "Copied") : (isZh ? "复制链接" : "Copy")}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {isZh ? "关闭" : "Close"}
                  </button>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold shadow-xs transition-all"
                  >
                    <span>{isZh ? "前往控制台" : "Go to Dashboard"}</span>
                  </Link>
                  <Link
                    href={publishResult.url}
                    target="_blank"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <span>{isZh ? "在新窗口打开公开页" : "Open Public Page"}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GitHub Auth Modal */}
      <GitHubAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(newUser) => setUser(newUser)}
        language={language}
      />

      <footer className="border-t border-slate-200 dark:border-zinc-800/60 py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
