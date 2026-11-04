"use client";

import React, { useState } from "react";
import { Check, Copy, Sparkles, Wrench, ShieldAlert } from "lucide-react";

interface ChangelogEditorProps {
  changelog: {
    features: string[];
    improvements: string[];
    fixes: string[];
  };
  language?: "en" | "zh";
  onChange: (changelog: { features: string[]; improvements: string[]; fixes: string[] }) => void;
}

export function ChangelogEditor({ changelog, language = "en", onChange }: ChangelogEditorProps) {
  const [copied, setCopied] = useState(false);
  const isZh = language === "zh";

  const getMarkdown = () => {
    const lines: string[] = [];
    if (changelog.features.length > 0) {
      lines.push(isZh ? "### 🚀 新增功能\n" : "### 🚀 New Features\n");
      changelog.features.forEach((f) => lines.push(`- ${f}`));
      lines.push("");
    }
    if (changelog.improvements.length > 0) {
      lines.push(isZh ? "### ⚡ 优化改进\n" : "### ⚡ Improvements\n");
      changelog.improvements.forEach((i) => lines.push(`- ${i}`));
      lines.push("");
    }
    if (changelog.fixes.length > 0) {
      lines.push(isZh ? "### 🐛 问题修复\n" : "### 🐛 Fixes & Stability\n");
      changelog.fixes.forEach((x) => lines.push(`- ${x}`));
      lines.push("");
    }
    return lines.join("\n");
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(getMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateItem = (category: "features" | "improvements" | "fixes", index: number, val: string) => {
    const updated = { ...changelog };
    updated[category][index] = val;
    onChange(updated);
  };

  const removeItem = (category: "features" | "improvements" | "fixes", index: number) => {
    const updated = { ...changelog };
    updated[category] = updated[category].filter((_, i) => i !== index);
    onChange(updated);
  };

  const addItem = (category: "features" | "improvements" | "fixes") => {
    const updated = { ...changelog };
    updated[category] = [...updated[category], isZh ? "新增条目说明" : "New item"];
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
          {isZh
            ? "结构化发版日志（可直接用于 GitHub Release 或产品更新日志页）"
            : "Categorized Release Notes (Ready for GitHub Release & Markdown pages)"}
        </span>
        <button
          onClick={handleCopyMarkdown}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-all cursor-pointer border border-slate-200 dark:border-transparent"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {isZh ? (copied ? "已复制" : "复制 Markdown") : (copied ? "Copied" : "Copy Markdown")}
        </button>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {isZh ? "新增功能" : "New Features"} ({changelog.features.length})
            </span>
          </div>
          <button
            onClick={() => addItem("features")}
            className="text-[11px] text-slate-400 hover:text-emerald-600 dark:text-zinc-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            {isZh ? "+ 添加条目" : "+ Add item"}
          </button>
        </div>
        {changelog.features.length === 0 ? (
          <div className="text-xs text-slate-400 dark:text-zinc-600 italic pl-5">
            {isZh ? "本次更新未记录新功能。" : "No new features recorded for this PR."}
          </div>
        ) : (
          changelog.features.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-zinc-500">•</span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem("features", idx, e.target.value)}
                className="flex-1 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => removeItem("features", idx)}
                className="text-slate-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 text-xs px-1 cursor-pointer"
                title={isZh ? "删除" : "Remove"}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Improvements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-sky-400">
          <div className="flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5" />
            <span>
              {isZh ? "优化与改进" : "Improvements"} ({changelog.improvements.length})
            </span>
          </div>
          <button
            onClick={() => addItem("improvements")}
            className="text-[11px] text-slate-400 hover:text-sky-600 dark:text-zinc-500 dark:hover:text-sky-400 transition-colors cursor-pointer"
          >
            {isZh ? "+ 添加条目" : "+ Add item"}
          </button>
        </div>
        {changelog.improvements.length === 0 ? (
          <div className="text-xs text-slate-400 dark:text-zinc-600 italic pl-5">
            {isZh ? "本次更新未记录改进项。" : "No improvements recorded for this PR."}
          </div>
        ) : (
          changelog.improvements.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-zinc-500">•</span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem("improvements", idx, e.target.value)}
                className="flex-1 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => removeItem("improvements", idx)}
                className="text-slate-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 text-xs px-1 cursor-pointer"
                title={isZh ? "删除" : "Remove"}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Fixes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>
              {isZh ? "问题与稳定性修复" : "Bug Fixes"} ({changelog.fixes.length})
            </span>
          </div>
          <button
            onClick={() => addItem("fixes")}
            className="text-[11px] text-slate-400 hover:text-amber-600 dark:text-zinc-500 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            {isZh ? "+ 添加条目" : "+ Add item"}
          </button>
        </div>
        {changelog.fixes.length === 0 ? (
          <div className="text-xs text-slate-400 dark:text-zinc-600 italic pl-5">
            {isZh ? "本次更新未记录问题修复。" : "No bug fixes recorded for this PR."}
          </div>
        ) : (
          changelog.fixes.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-zinc-500">•</span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem("fixes", idx, e.target.value)}
                className="flex-1 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => removeItem("fixes", idx)}
                className="text-slate-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 text-xs px-1 cursor-pointer"
                title={isZh ? "删除" : "Remove"}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
