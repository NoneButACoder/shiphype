"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { GitHubAuthModal } from "@/components/GitHubAuthModal";
import { ProjectBrandingModal } from "@/components/ProjectBrandingModal";
import { BroadcastModal } from "@/components/BroadcastModal";
import { AuthUser } from "@/lib/auth";
import { ProjectRecord, ReleaseRecord } from "@/lib/storage";
import {
  Layers,
  Sparkles,
  ExternalLink,
  Trash2,
  CheckCircle,
  Clock,
  Rss,
  GitPullRequest,
  Plus,
  RefreshCw,
  FolderGit2,
  Copy,
  Check,
  Zap,
  ChevronDown,
  ChevronUp,
  Radio,
  Mail,
  Palette,
  ShieldCheck,
  Lock,
  ArrowRight,
  Globe,
} from "lucide-react";

export default function DashboardPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<"en" | "zh">("en");
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showWebhookGuide, setShowWebhookGuide] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simSuccess, setSimSuccess] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false);
  const [subscribersCount, setSubscribersCount] = useState<number>(0);

  // User session state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Project Branding Modal State
  const [brandingProject, setBrandingProject] = useState<ProjectRecord | null>(null);

  // Email Broadcast Modal State
  const [broadcastRelease, setBroadcastRelease] = useState<ReleaseRecord | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch((err) => console.error("Session check failed", err))
      .finally(() => {
        setAuthChecking(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setProjects([]);
      setReleases([]);
      setSubscribersCount(0);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // Initialize theme & language from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("shiphype_theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }

    const savedLang = localStorage.getItem("shiphype_lang") as "en" | "zh" | null;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("shiphype_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  };

  const handleLanguageChange = (newLang: "en" | "zh") => {
    setLanguage(newLang);
    localStorage.setItem("shiphype_lang", newLang);
  };

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/releases");
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
        setReleases(data.releases || []);
        setSubscribersCount(data.subscribersCount || 0);
      }
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReleases();
    } else {
      setProjects([]);
      setReleases([]);
      setSubscribersCount(0);
      setLoading(false);
    }
  }, [user]);

  const handleToggleStatus = async (release: ReleaseRecord) => {
    const nextStatus = release.status === "draft" ? "published" : "draft";
    setActionLoading(release.id);
    try {
      const res = await fetch("/api/releases", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: release.id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReleases((prev) =>
          prev.map((r) => (r.id === release.id ? { ...r, status: nextStatus } : r))
        );
      }
    } catch (e) {
      console.error("Failed to toggle status", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSimulateWebhook = async () => {
    setSimulating(true);
    setSimSuccess(null);
    try {
      const res = await fetch("/api/webhook/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: "NoneButACoder/ShoppinggWebSite",
          tag: "v1.2.0",
          name: "ShoppinggWebSite v1.2.0 - Automated Webhook Release",
          body: "### What's Changed\n* Added instant checkout coupons and promo code verification\n* Improved responsive drawer animation performance\n* Fixed pricing rounding bugs on discounted items",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimSuccess(
          language === "zh"
            ? "🎉 模拟 Webhook 触发成功！Gemini 已自动生成物料并放入下方草稿箱。"
            : "🎉 Webhook simulated successfully! Draft release generated and added below."
        );
        await fetchReleases();
      } else {
        alert("Simulation failed: " + (data.result?.error || data.error || "Unknown error"));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Simulation error";
      alert("Simulation error: " + msg);
    } finally {
      setSimulating(false);
    }
  };

  const handleCopy = (text: string, type: "url" | "secret") => {
    navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleDeleteRelease = async (id: string) => {
    const confirmMsg =
      language === "zh"
        ? "确定要删除此发布记录吗？该操作不可撤销。"
        : "Are you sure you want to delete this release? This cannot be undone.";
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/releases?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setReleases((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete release", e);
    } finally {
      setActionLoading(null);
    }
  };

  const isZh = language === "zh";

  const filteredReleases =
    selectedSlug === "all"
      ? releases
      : releases.filter((r) => r.projectSlug.toLowerCase() === selectedSlug.toLowerCase());

  const publishedCount = releases.filter((r) => r.status !== "draft").length;
  const draftCount = releases.filter((r) => r.status === "draft").length;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#070709] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors ${theme}`}>
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeChange={handleThemeChange}
        user={user}
        onOpenConnectModal={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <Layers className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                <span>{isZh ? "项目控制台 & 发版中心" : "Project Dashboard & Releases"}</span>
              </h1>
              {user && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  @{user.login}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {isZh
                ? "管理您的所有独立项目、历史发版时间轴、草稿箱与公共更新页"
                : "Manage your projects, historical release timelines, drafts, and hosted changelogs."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={fetchReleases}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{isZh ? "刷新" : "Refresh"}</span>
                </button>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isZh ? "生成新版本" : "Generate New Release"}</span>
                </Link>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <GitPullRequest className="h-3.5 w-3.5" />
                <span>{isZh ? "连接 GitHub 账号" : "Connect GitHub"}</span>
              </button>
            )}
          </div>
        </div>

        {authChecking ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <RefreshCw className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
              {isZh ? "正在加载开发者专属工作台..." : "Loading developer workspace..."}
            </p>
          </div>
        ) : !user ? (
          <div className="py-6 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden text-center">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 shadow-xs">
                  <Lock className="h-8 w-8" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/70 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{isZh ? "工作台数据隔离保护" : "Multi-Tenant Data Isolation"}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                  {isZh ? "连接 GitHub 账号以进入工作台" : "Connect GitHub to Access Your Workspace"}
                </h2>

                <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
                  {isZh
                    ? "ShipHype 控制台受严格的数据隔离保护。未登录访客无法查看或操作任何开发者的专属项目、草稿箱、订阅邮箱及 Webhook 密钥。连接您的 GitHub 即可解锁专属工作台。"
                    : "ShipHype dashboard is strictly protected by data isolation. Unauthenticated visitors cannot view or modify any developer's private projects, release drafts, subscriber lists, or webhook keys. Connect your GitHub account to continue."}
                </p>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <GitPullRequest className="h-5 w-5" />
                  <span>{isZh ? "一键连接 GitHub 账号" : "Connect with GitHub"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* 3 Value Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 w-full text-left">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                      <Lock className="h-4 w-4 text-indigo-500" />
                      <span>{isZh ? "专属数据隔离" : "Strict Isolation"}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-normal">
                      {isZh
                        ? "仅您本人可见您创建的项目、草稿箱和邮件订阅者。"
                        : "Only you can access your private projects, drafts, and subscriber emails."}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span>{isZh ? "自动化 Webhook" : "Automated Webhooks"}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-normal">
                      {isZh
                        ? "GitHub Tag 发版全自动生成 AI 宣发图与 X 推文。"
                        : "Automated AI changelogs & hype assets when you push tags."}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                      <Globe className="h-4 w-4 text-emerald-500" />
                      <span>{isZh ? "公共主页公开可查" : "Public Changelogs"}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-normal">
                      {isZh
                        ? "您公开发布的更新日志主页无需登录，全球可访问。"
                        : "Your published changelogs (/p/[slug]) remain public to the world."}
                    </p>
                  </div>
                </div>

                {/* Public changelog discovery link */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                  <span>{isZh ? "想先看看公开的更新日志效果？" : "Want to see what a public changelog looks like?"}</span>
                  <Link
                    href="/p/shoppinggwebsite"
                    className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    <span>{isZh ? "查看 ShoppinggWebSite 公开主页" : "Visit ShoppinggWebSite Changelog"}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
              {isZh ? "已绑项目" : "Active Projects"}
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {projects.length}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
              {isZh ? "总记录数" : "Total Releases"}
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {releases.length}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {isZh ? "已公开发布" : "Published"}
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {publishedCount}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {isZh ? "草稿箱" : "Drafts"}
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {draftCount}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              {isZh ? "邮件订阅" : "Subscribers"}
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {subscribersCount}
            </div>
          </div>
        </div>

        {/* Webhook Automation Banner / Collapsible Section */}
        <div className="mb-8 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-pink-50/20 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-zinc-900/40 p-5 shadow-xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{isZh ? "GitHub Release Webhook 自动监听" : "GitHub Release Webhook Ingestion"}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {isZh ? "已就绪" : "Ready"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {isZh
                    ? "在仓库发布 Release 时，ShipHype 将自动抓取、调用 AI 编排并存入草稿箱"
                    : "Automatically trigger Gemini AI generation on GitHub 'release: published' and queue drafts."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSimulateWebhook}
                disabled={simulating}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>{isZh ? "AI 正在自动生成..." : "Simulating & Generating..."}</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span>{isZh ? "一键模拟触发 Webhook" : "Simulate Webhook Event"}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowWebhookGuide(!showWebhookGuide)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
              >
                <span>{isZh ? "配置说明" : "Setup Guide"}</span>
                {showWebhookGuide ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Simulation Success Feedback */}
          {simSuccess && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>{simSuccess}</span>
              </div>
              <button onClick={() => setSimSuccess(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Webhook Configuration Guide Accordion */}
          {showWebhookGuide && (
            <div className="mt-5 pt-4 border-t border-indigo-100 dark:border-zinc-800 space-y-4 animate-in fade-in duration-200 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="font-semibold text-slate-800 dark:text-zinc-200">
                  {isZh ? "GitHub 仓库 Webhook 配置步骤：" : "GitHub Repository Webhook Setup Instructions:"}
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-zinc-400">
                  <li>{isZh ? "进入 GitHub 仓库 -> Settings -> Webhooks -> Add webhook" : "Go to GitHub Repo -> Settings -> Webhooks -> Add webhook"}</li>
                  <li>
                    {isZh ? "填写 Payload URL：" : "Set Payload URL to:"}
                    <div className="mt-1 flex items-center gap-2">
                      <code className="px-2 py-1 bg-slate-100 dark:bg-zinc-950 rounded text-indigo-600 dark:text-indigo-400 font-mono text-[11px] truncate">
                        {typeof window !== "undefined" ? `${window.location.origin}/api/webhook/github` : "http://localhost:3000/api/webhook/github"}
                      </code>
                      <button
                        onClick={() => handleCopy(typeof window !== "undefined" ? `${window.location.origin}/api/webhook/github` : "http://localhost:3000/api/webhook/github", "url")}
                        className="px-2 py-1 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedUrl ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedUrl ? (isZh ? "已复制" : "Copied") : (isZh ? "复制" : "Copy")}</span>
                      </button>
                    </div>
                  </li>
                  <li>{isZh ? "Content type 选择：" : "Select Content type:"} <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-950 rounded font-mono">application/json</code></li>
                  <li>
                    {isZh ? "Secret（签名验证密钥）：" : "Secret (HMAC-SHA256 Secret):"}
                    <div className="mt-1 flex items-center gap-2">
                      <code className="px-2 py-1 bg-slate-100 dark:bg-zinc-950 rounded text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
                        shiphype_dev_secret
                      </code>
                      <button
                        onClick={() => handleCopy("shiphype_dev_secret", "secret")}
                        className="px-2 py-1 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSecret ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedSecret ? (isZh ? "已复制" : "Copied") : (isZh ? "复制" : "Copy")}</span>
                      </button>
                    </div>
                  </li>
                  <li>{isZh ? "触发事件（Which events）：选择 'Let me select individual events'，仅勾选 'Releases'" : "Select events: choose 'Let me select individual events' and check ONLY 'Releases'"}</li>
                </ol>
                <div className="text-[11px] text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-200/60 dark:border-zinc-800/60">
                  {isZh
                    ? "💡 提示：在本地开发环境（localhost），你可以直接点击上方「一键模拟触发 Webhook」进行免外网穿透的完整端到端测试；线上部署至 Vercel 时直接填写真实域名即可。"
                    : "💡 Tip: For localhost testing, simply click 'Simulate Webhook Event' above to test end-to-end without tunnels like ngrok. When deployed, use your production URL."}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Project Selector & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedSlug("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedSlug === "all"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800"
              }`}
            >
              {isZh ? "全部项目" : "All Projects"} ({releases.length})
            </button>
            {projects.map((p) => {
              const count = releases.filter(
                (r) => r.projectSlug.toLowerCase() === p.slug.toLowerCase()
              ).length;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedSlug(p.slug)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedSlug === p.slug
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800"
                  }`}
                >
                  <FolderGit2 className="h-3 w-3" />
                  <span>{p.name}</span>
                  <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {selectedSlug !== "all" && (
              <button
                onClick={() => {
                  const proj = projects.find(
                    (p) => p.slug.toLowerCase() === selectedSlug.toLowerCase()
                  );
                  if (proj) setBrandingProject(proj);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Palette className="h-3.5 w-3.5" />
                <span>{isZh ? "品牌定制" : "Brand Settings"}</span>
              </button>
            )}
            {selectedSlug === "all" && projects.length > 0 && (
              <button
                onClick={() => setBrandingProject(projects[0])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium shadow-xs transition-all cursor-pointer"
              >
                <Palette className="h-3.5 w-3.5" />
                <span>{isZh ? "品牌定制" : "Brand Settings"}</span>
              </button>
            )}
            {selectedSlug !== "all" && (
              <>
                <a
                  href={`/p/${selectedSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:underline shadow-xs"
                >
                  <span>{isZh ? "打开公开日志页" : "View Changelog Page"}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={`/p/${selectedSlug}/rss.xml`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-medium hover:underline shadow-xs"
                  title="RSS Feed"
                >
                  <Rss className="h-3 w-3" />
                  <span>RSS</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Releases List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 dark:text-zinc-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
            <span>{isZh ? "加载中..." : "Loading releases..."}</span>
          </div>
        ) : filteredReleases.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-8">
            <Layers className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="font-semibold text-base text-slate-800 dark:text-zinc-200">
              {isZh ? "暂无发布记录" : "No releases found"}
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
              {isZh
                ? "输入任何 GitHub PR 链接即可自动提取生成并发布到更新日志"
                : "Paste any GitHub PR to extract, generate, and publish to your changelog."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isZh ? "立即生成" : "Generate First Release"}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReleases.map((release) => {
              const isDraft = release.status === "draft";
              const pubDate = new Date(release.publishedAt).toLocaleDateString(
                isZh ? "zh-CN" : "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              );

              return (
                <div
                  key={release.id}
                  className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40 font-semibold">
                        {release.versionTag}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                        {release.projectSlug}
                      </span>
                      {isDraft ? (
                        <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                          <Clock className="h-3 w-3" />
                          <span>{isZh ? "草稿" : "Draft"}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                          <CheckCircle className="h-3 w-3" />
                          <span>{isZh ? "已发布" : "Published"}</span>
                        </span>
                      )}
                      <span className="text-xs text-slate-400 dark:text-zinc-500">{pubDate}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {release.title}
                    </h3>

                    {/* Highlights bullet previews */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                      {release.changelog.features?.length > 0 && (
                        <span>✨ {release.changelog.features.length} {isZh ? "个新功能" : "features"}</span>
                      )}
                      {release.changelog.improvements?.length > 0 && (
                        <span>⚡ {release.changelog.improvements.length} {isZh ? "项优化" : "improvements"}</span>
                      )}
                      {release.changelog.fixes?.length > 0 && (
                        <span>🛠 {release.changelog.fixes.length} {isZh ? "个修复" : "fixes"}</span>
                      )}
                      {release.sourcePr && (
                        <a
                          href={release.sourcePr.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 text-indigo-500"
                        >
                          <GitPullRequest className="h-3 w-3" />
                          <span>PR #{release.sourcePr.pullNumber}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isDraft && (
                      <>
                        <button
                          onClick={() => setBroadcastRelease(release)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          title={isZh ? "向订阅者广播邮件" : "Broadcast to subscribers via email"}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span>{isZh ? "邮件广播" : "Broadcast"}</span>
                        </button>
                        <a
                          href={`/p/${release.projectSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
                          title={isZh ? "在公开更新页查看" : "View in Public Page"}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </>
                    )}
                    <button
                      onClick={() => handleToggleStatus(release)}
                      disabled={actionLoading === release.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                        isDraft
                          ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                          : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {actionLoading === release.id
                        ? "..."
                        : isDraft
                        ? isZh
                          ? "转为公开"
                          : "Publish"
                        : isZh
                        ? "设为草稿"
                        : "Unpublish"}
                    </button>
                    <button
                      onClick={() => handleDeleteRelease(release.id)}
                      disabled={actionLoading === release.id}
                      className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title={isZh ? "删除记录" : "Delete"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </main>

      <GitHubAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(newUser) => setUser(newUser)}
        language={language}
      />

      <ProjectBrandingModal
        project={brandingProject}
        isOpen={!!brandingProject}
        onClose={() => setBrandingProject(null)}
        onSaved={(updated) => {
          setProjects((prev) => prev.map((p) => (p.slug === updated.slug ? updated : p)));
          setBrandingProject(null);
        }}
        language={language}
      />

      <BroadcastModal
        release={broadcastRelease}
        isOpen={!!broadcastRelease}
        onClose={() => setBroadcastRelease(null)}
        language={language}
      />
    </div>
  );
}
