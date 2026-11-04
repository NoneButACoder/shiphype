"use client";

import React, { useState, useEffect } from "react";
import { ProjectRecord, BrandAccentColor, BannerPattern } from "@/lib/storage";
import {
  X,
  Palette,
  Globe,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  Save,
  GitPullRequest,
  HelpCircle,
  Eye,
} from "lucide-react";

function XIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface ProjectBrandingModalProps {
  project: ProjectRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: ProjectRecord) => void;
  language: "en" | "zh";
}

const ACCENT_COLORS: { id: BrandAccentColor; name: string; zhName: string; bgClass: string; textClass: string; borderClass: string; ringClass: string }[] = [
  { id: "indigo", name: "Indigo", zhName: "靛蓝", bgClass: "bg-indigo-600", textClass: "text-indigo-600 dark:text-indigo-400", borderClass: "border-indigo-500", ringClass: "ring-indigo-500" },
  { id: "cyan", name: "Cyan", zhName: "青碧", bgClass: "bg-cyan-500", textClass: "text-cyan-600 dark:text-cyan-400", borderClass: "border-cyan-500", ringClass: "ring-cyan-500" },
  { id: "emerald", name: "Emerald", zhName: "翡翠", bgClass: "bg-emerald-500", textClass: "text-emerald-600 dark:text-emerald-400", borderClass: "border-emerald-500", ringClass: "ring-emerald-500" },
  { id: "amber", name: "Amber", zhName: "琥珀", bgClass: "bg-amber-500", textClass: "text-amber-600 dark:text-amber-400", borderClass: "border-amber-500", ringClass: "ring-amber-500" },
  { id: "rose", name: "Rose", zhName: "玫瑰", bgClass: "bg-rose-500", textClass: "text-rose-600 dark:text-rose-400", borderClass: "border-rose-500", ringClass: "ring-rose-500" },
  { id: "purple", name: "Purple", zhName: "紫晶", bgClass: "bg-purple-600", textClass: "text-purple-600 dark:text-purple-400", borderClass: "border-purple-500", ringClass: "ring-purple-500" },
];

const QUICK_EMOJIS = ["🚀", "🚢", "⚡", "💡", "🔥", "🛠️", "📦", "🔮", "💎", "🎨", "🤖", "📈"];

export function ProjectBrandingModal({
  project,
  isOpen,
  onClose,
  onSaved,
  language,
}: ProjectBrandingModalProps) {
  const isZh = language === "zh";

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [accentColor, setAccentColor] = useState<BrandAccentColor>("indigo");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [repo, setRepo] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [bannerPattern, setBannerPattern] = useState<BannerPattern>("gradient");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedDns, setCopiedDns] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setTagline(project.tagline || "");
      setDescription(project.description || "");
      setLogoUrl(project.logoUrl || "");
      setAccentColor(project.accentColor || "indigo");
      setWebsiteUrl(project.websiteUrl || "");
      setTwitterHandle(project.twitterHandle || "");
      setRepo(project.repo || "");
      setCustomDomain(project.customDomain || "");
      setBannerPattern(project.bannerPattern || "gradient");
      setError(null);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const currentColorMeta = ACCENT_COLORS.find((c) => c.id === accentColor) || ACCENT_COLORS[0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isZh ? "项目名称不能为空" : "Project name is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/projects/${encodeURIComponent(project.slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          logoUrl: logoUrl.trim(),
          accentColor,
          websiteUrl: websiteUrl.trim(),
          twitterHandle: twitterHandle.trim(),
          repo: repo.trim(),
          customDomain: customDomain.trim(),
          bannerPattern,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update project branding");
      }

      onSaved(data.project);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyDnsValue = () => {
    navigator.clipboard.writeText("cname.shiphype.com");
    setCopiedDns(true);
    setTimeout(() => setCopiedDns(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isZh ? `品牌定制: ${project.name}` : `Brand Customization: ${project.name}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isZh
                  ? `自定义公开更新页 (/p/${project.slug}) 的品牌 Logo、主题色、文案与社交链接`
                  : `Customize public changelog (/p/${project.slug}) with your logo, colors, and links.`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Live Preview Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Eye className="h-3.5 w-3.5" />
                <span>{isZh ? "公开页实时预览" : "Public Page Live Preview"}</span>
              </label>
              <a
                href={`/p/${project.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>{isZh ? "查看线上公开页" : "View Live Page"}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${currentColorMeta.bgClass} flex items-center justify-center text-white text-lg font-bold shadow-sm overflow-hidden shrink-0`}>
                    {logoUrl && logoUrl.startsWith("http") ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span>{logoUrl || name.slice(0, 2).toUpperCase() || "SH"}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                      {name || "Your Project Name"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {tagline || "Changelog & Product Updates"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {websiteUrl && (
                    <span className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 text-[11px] font-medium flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span className="hidden sm:inline">Website</span>
                    </span>
                  )}
                  {twitterHandle && (
                    <span className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 text-[11px] font-medium flex items-center gap-1">
                      <XIcon className="h-3 w-3" />
                      <span>@{twitterHandle.replace("@", "")}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-lg ${currentColorMeta.bgClass} text-white font-medium text-xs shadow-xs`}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Basic Identity */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {isZh ? "基础信息" : "General Information"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                  {isZh ? "项目名称" : "Project Name"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ShoppinggWebSite"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                  {isZh ? "一句话标语 / Tagline" : "Tagline / Catchphrase"}
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. The modern e-commerce storefront for creators"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                {isZh ? "关于介绍 (用于公开页顶端与 SEO 描述)" : "About Description (Public Header & SEO)"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="e.g. Track all new features, improvements, and bug fixes shipped by our engineering team."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>
          </div>

          {/* Section: Logo & Brand Accent */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {isZh ? "视觉形象与品牌色" : "Visual Identity & Accent Color"}
            </h4>

            {/* Logo / Emoji */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                {isZh ? "Logo 图片链接 或 Emoji 图标" : "Logo Image URL or Emoji Icon"}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://... 或单个 Emoji (如 🚀)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {isZh ? "重置" : "Clear"}
                </button>
              </div>

              {/* Emoji quick presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                  {isZh ? "快速选用 Emoji:" : "Quick emojis:"}
                </span>
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setLogoUrl(emoji)}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-950 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-sm cursor-pointer transition-transform hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Accent Color */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                {isZh ? "品牌主题色" : "Brand Accent Color"}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {ACCENT_COLORS.map((color) => {
                  const isSelected = accentColor === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setAccentColor(color.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        isSelected
                          ? "border-slate-900 dark:border-white bg-slate-100/80 dark:bg-zinc-800 shadow-xs"
                          : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${color.bgClass} shadow-xs flex items-center justify-center`}>
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                        {isZh ? color.zhName : color.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Banner Pattern */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                {isZh ? "公开页顶部背景样式" : "Hero Banner Pattern"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: "gradient", label: "Gradient / 渐变流光" },
                    { id: "dots", label: "Dots / 点阵科技" },
                    { id: "grid", label: "Grid / 网格极客" },
                    { id: "minimal", label: "Minimal / 纯净极简" },
                  ] as const
                ).map((pat) => (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => setBannerPattern(pat.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      bannerPattern === pat.id
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                        : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                    }`}
                  >
                    {pat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Social & External Links */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {isZh ? "产品主页与社交媒体" : "Official Product & Social Links"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  <span>{isZh ? "官方网站 URL" : "Official Website URL"}</span>
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourproduct.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <XIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>{isZh ? "官方 X / Twitter 用户名" : "X / Twitter Handle"}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                  <input
                    type="text"
                    value={twitterHandle.replace("@", "")}
                    onChange={(e) => setTwitterHandle(e.target.value.replace("@", ""))}
                    placeholder="shiphype"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <GitPullRequest className="h-3.5 w-3.5 text-slate-400" />
                <span>{isZh ? "关联 GitHub 仓库" : "Linked GitHub Repository"}</span>
              </label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="owner/repo (e.g. NoneButACoder/ShoppinggWebSite)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
              />
            </div>
          </div>

          {/* Section: Custom Domain Setup */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span>{isZh ? "自定义独立域名 (Custom Domain)" : "Custom Domain"}</span>
              </h4>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                PRO Ready
              </span>
            </div>

            <div className="space-y-1.5">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g. changelog.yourdomain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
              />
            </div>

            {/* DNS Guidance Box */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                  {isZh ? "域名解析配置说明 (DNS Settings):" : "DNS Configuration Instructions:"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyDnsValue}
                  className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {copiedDns ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedDns ? (isZh ? "已复制目标值" : "Copied Target") : (isZh ? "复制目标 CNAME" : "Copy CNAME")}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Type</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">CNAME</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Name</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    {customDomain ? customDomain.split(".")[0] : "changelog"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Value / Target</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate block">
                    cname.shiphype.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {isZh ? "取消" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl ${currentColorMeta.bgClass} hover:opacity-90 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60`}
            >
              <Save className="h-4 w-4" />
              <span>{saving ? (isZh ? "保存中..." : "Saving...") : (isZh ? "保存品牌配置" : "Save Brand Settings")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
