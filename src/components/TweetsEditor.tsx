"use client";

import React, { useState } from "react";
import { Check, Copy, ExternalLink, MessageSquare, ListTree, Zap, Share2 } from "lucide-react";
import { CardData } from "@/types";
import { PostToXModal } from "./PostToXModal";

function XIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface TweetsEditorProps {
  drafts: {
    story: string;
    bullet: string;
    short_hook: string;
  };
  cardData?: CardData;
  repoName?: string;
  projectSlug?: string;
  language?: "en" | "zh";
  onChange: (type: "story" | "bullet" | "short_hook", value: string) => void;
}

export function TweetsEditor({
  drafts,
  cardData,
  repoName = "shiphype",
  projectSlug,
  language = "en",
  onChange,
}: TweetsEditorProps) {
  const [activeTab, setActiveTab] = useState<"story" | "bullet" | "short_hook">("story");
  const [copied, setCopied] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  const isZh = language === "zh";
  const currentText = drafts[activeTab];
  const charCount = currentText.length;
  const isOverLimit = charCount > 280;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveTab("story")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "story"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {isZh ? "故事风格" : "Story Style"}
          </button>
          <button
            onClick={() => setActiveTab("bullet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "bullet"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ListTree className="h-3.5 w-3.5" />
            {isZh ? "要点清单" : "Bullet Style"}
          </button>
          <button
            onClick={() => setActiveTab("short_hook")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "short_hook"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            {isZh ? "短钩引流" : "Short Hook"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-mono px-2 py-1 rounded-md border ${
              isOverLimit
                ? "bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400"
                : "bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400"
            }`}
          >
            {charCount} / 280 {isZh ? "字符" : "chars"}
          </span>
        </div>
      </div>

      {/* Tweet Textarea */}
      <div className="relative">
        <textarea
          value={currentText}
          onChange={(e) => onChange(activeTab, e.target.value)}
          rows={7}
          className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 p-4 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y leading-relaxed font-sans"
          placeholder={isZh ? "在此编辑你的推文草稿..." : "Draft your tweet here..."}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-slate-500 dark:text-zinc-500">
          {isZh
            ? "提示：点击“发布到 X”，系统将自动附带 1200×630 配图，支持一键拉起或 API 直发！"
            : "Tip: Hit \"Post to X\" to attach your 1200×630 Bento card with instant clipboard copy or direct API."}
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-all cursor-pointer border border-slate-200 dark:border-transparent"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {isZh ? (copied ? "已复制" : "复制文案") : (copied ? "Copied" : "Copy Text")}
          </button>
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-semibold shadow-lg shadow-black/10 dark:shadow-white/10 transition-all cursor-pointer"
          >
            <XIcon className="h-3.5 w-3.5" />
            <span>{isZh ? "发布到 X (Twitter)" : "Post to X"}</span>
          </button>
        </div>
      </div>

      {/* Post to X Modal */}
      <PostToXModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        tweetText={currentText}
        cardData={cardData}
        repoName={repoName}
        projectSlug={projectSlug}
        language={language}
      />
    </div>
  );
}
