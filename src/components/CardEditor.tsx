"use client";

import React, { useState } from "react";
import {
  Copy,
  Download,
  RefreshCw,
  Check,
  Sparkles,
  Image as ImageIcon,
  LayoutGrid,
  Sun,
  Terminal,
  Palette,
  Eye,
  EyeOff,
} from "lucide-react";
import { CardTemplateType, CardColorType } from "@/types";

interface CardEditorProps {
  card: {
    badge: string;
    title: string;
    subtitle: string;
    highlights: string[];
    template?: CardTemplateType;
    themeColor?: CardColorType;
    watermark?: boolean;
  };
  repoName: string;
  language?: "en" | "zh";
  onChange: (card: {
    badge: string;
    title: string;
    subtitle: string;
    highlights: string[];
    template?: CardTemplateType;
    themeColor?: CardColorType;
    watermark?: boolean;
  }) => void;
}

const COLOR_OPTIONS: { id: CardColorType; nameEn: string; nameZh: string; hex: string }[] = [
  { id: "indigo", nameEn: "Indigo / Violet", nameZh: "极客紫", hex: "#6366f1" },
  { id: "cyan", nameEn: "Electric Cyan", nameZh: "科技青", hex: "#06b6d4" },
  { id: "emerald", nameEn: "Emerald Mint", nameZh: "翡翠绿", hex: "#10b981" },
  { id: "amber", nameEn: "Sunset Amber", nameZh: "日落金", hex: "#f59e0b" },
  { id: "rose", nameEn: "Crimson Rose", nameZh: "霓虹粉", hex: "#f43f5e" },
];

export function CardEditor({ card, repoName, language = "en", onChange }: CardEditorProps) {
  const [copiedImage, setCopiedImage] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isZh = language === "zh";

  const currentTemplate: CardTemplateType = card.template || "bento";
  const currentColor: CardColorType = card.themeColor || "indigo";
  const showWatermark: boolean = card.watermark !== false;

  // Construct dynamic image URL with current state
  const params = new URLSearchParams({
    badge: card.badge || "NEW UPDATE",
    title: card.title || "Release Highlights",
    subtitle: card.subtitle || "",
    highlights: JSON.stringify(card.highlights || []),
    repo: repoName || "shiphype/core",
    template: currentTemplate,
    color: currentColor,
    watermark: showWatermark ? "true" : "false",
  });
  const imageUrl = `/api/card?${params.toString()}`;

  const handleCopyImage = async () => {
    try {
      setIsCopying(true);
      const res = await fetch(imageUrl);
      const blob = await res.blob();

      if (typeof window !== "undefined" && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
      } else {
        alert(
          isZh
            ? "当前浏览器不支持直接复制图片到剪贴板，请使用“下载 PNG 配图”。"
            : "Clipboard Image API is not supported in this browser. Please use Download PNG."
        );
      }
    } catch (err) {
      console.error("Failed to copy image:", err);
      alert(isZh ? "复制图片失败，请使用“下载 PNG 配图”。" : "Failed to copy image directly. Please try Download PNG.");
    } finally {
      setIsCopying(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shiphype-${currentTemplate}-${card.badge.toLowerCase().replace(/[^a-z0-9]/g, "-") || "release"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const updateHighlight = (index: number, val: string) => {
    const next = [...(card.highlights || [])];
    next[index] = val;
    onChange({ ...card, highlights: next });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs text-slate-700 dark:text-zinc-300 font-medium">
            {isZh ? "宣发配图生成器 (1200 × 630 px)" : "Visual Release Card Generator (1200 × 630 px)"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyImage}
            disabled={isCopying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {copiedImage ? (
              <Check className="h-3.5 w-3.5 text-emerald-300" />
            ) : isCopying ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {isZh
              ? copiedImage
                ? "图片已复制！"
                : "复制图片到剪贴板"
              : copiedImage
              ? "Image Copied!"
              : "Copy Image to Clipboard"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 border border-slate-200 dark:border-transparent"
          >
            <Download className="h-3.5 w-3.5" />
            {isZh ? "下载 PNG 配图" : "Download PNG"}
          </button>
        </div>
      </div>

      {/* Visual Customization Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        {/* 1. Template Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mr-1">
            {isZh ? "视觉模板" : "Template"}:
          </span>
          <div className="flex items-center bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => onChange({ ...card, template: "bento" })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentTemplate === "bento"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Bento Dark</span>
            </button>
            <button
              onClick={() => onChange({ ...card, template: "clean" })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentTemplate === "clean"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sun className="h-3 w-3" />
              <span>Clean Minimal</span>
            </button>
            <button
              onClick={() => onChange({ ...card, template: "terminal" })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentTemplate === "terminal"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Terminal className="h-3 w-3" />
              <span>Terminal Hacker</span>
            </button>
          </div>
        </div>

        {/* 2. Brand Accent Colors & Watermark Toggle */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <div className="flex items-center gap-1">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onChange({ ...card, themeColor: c.id })}
                  title={isZh ? c.nameZh : c.nameEn}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    currentColor === c.id ? "scale-115 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900" : "hover:scale-105 opacity-80"
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {currentColor === c.id && <Check className="h-3 w-3 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:border-zinc-800" />

          {/* Watermark Toggle */}
          <button
            onClick={() => onChange({ ...card, watermark: !showWatermark })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              showWatermark
                ? "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300"
                : "border-slate-200 dark:border-zinc-800 bg-transparent text-slate-400 dark:text-zinc-500 line-through"
            }`}
            title={isZh ? "切换 ShipHype 水印标识" : "Toggle ShipHype badge"}
          >
            {showWatermark ? <Eye className="h-3 w-3 text-indigo-500" /> : <EyeOff className="h-3 w-3" />}
            <span>{isZh ? "水印" : "Badge"}</span>
          </button>
        </div>
      </div>

      {/* Live Preview Container */}
      <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-900 shadow-xl dark:shadow-none aspect-[1200/630] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Release Card Preview"
          className="w-full h-full object-cover select-none"
        />
        <div className="absolute bottom-3 left-4 text-[11px] text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 pointer-events-none">
          {isZh ? "✨ 实时预览 • 1200 × 630 px（社交媒体黄金比例）" : "✨ Live Preview • 1200 × 630 px (Twitter Optimal)"}
        </div>
      </div>

      {/* Instant Hot Editor (Zero LLM Token Usage) */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-300">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>
            {isZh
              ? "即时微调配图文案（毫秒级重绘，零 AI 费用）"
              : "Hot-Tune Card Copy (Instant re-render, zero AI cost)"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              {isZh ? "版本标签 (Badge)" : "Badge Tag"}
            </label>
            <input
              type="text"
              value={card.badge}
              onChange={(e) => onChange({ ...card, badge: e.target.value })}
              className="w-full rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder={isZh ? "例如 v1.2.0" : "e.g. v1.2.0"}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              {isZh ? "卡片主标题" : "Card Main Title"}
            </label>
            <input
              type="text"
              value={card.title}
              onChange={(e) => onChange({ ...card, title: e.target.value })}
              className="w-full rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder={isZh ? "输入卡片大标题" : "Card headline"}
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
            {isZh ? "副标题说明" : "Subtitle"}
          </label>
          <input
            type="text"
            value={card.subtitle}
            onChange={(e) => onChange({ ...card, subtitle: e.target.value })}
            className="w-full rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder={isZh ? "一句话概括本次发布亮点" : "Subheading summary"}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400">
            {isZh ? "亮点特性列表（前 3 项）" : "Highlights (Top 3 items)"}
          </label>
          {(card.highlights || []).slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 w-5">0{idx + 1}</span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateHighlight(idx, e.target.value)}
                className="flex-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder={isZh ? `特性要点 ${idx + 1}` : `Highlight ${idx + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
