"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  ExternalLink,
  Check,
  Copy,
  Send,
  Key,
  ShieldCheck,
  Image as ImageIcon,
  MessageSquare,
  Repeat2,
  Heart,
  Bookmark,
  Share,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { CardData } from "@/types";

function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface PostToXModalProps {
  isOpen: boolean;
  onClose: () => void;
  tweetText: string;
  cardData?: CardData;
  repoName?: string;
  projectSlug?: string;
  language?: "en" | "zh";
}

export function PostToXModal({
  isOpen,
  onClose,
  tweetText,
  cardData,
  repoName = "shiphype",
  projectSlug,
  language = "en",
}: PostToXModalProps) {
  const isZh = language === "zh";

  const [activeMode, setActiveMode] = useState<"intent" | "api">("intent");
  const [copiedImage, setCopiedImage] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);

  // X API Keys state
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessTokenSecret, setAccessTokenSecret] = useState("");
  const [simulateMode, setSimulateMode] = useState(true);

  // Posting state
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<{
    success: boolean;
    simulated?: boolean;
    tweetUrl?: string;
    error?: string;
  } | null>(null);

  // Load saved credentials from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shiphype_x_keys");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey) setApiKey(parsed.apiKey);
        if (parsed.apiSecret) setApiSecret(parsed.apiSecret);
        if (parsed.accessToken) setAccessToken(parsed.accessToken);
        if (parsed.accessTokenSecret) setAccessTokenSecret(parsed.accessTokenSecret);
        setSimulateMode(false);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  const charCount = tweetText.length;
  const isOverLimit = charCount > 280;

  // Construct card preview image URL
  const cardQuery = cardData
    ? new URLSearchParams({
        badge: cardData.badge || "",
        title: cardData.title || "",
        subtitle: cardData.subtitle || "",
        highlights: JSON.stringify(cardData.highlights || []),
        repo: repoName,
        template: cardData.template || "bento",
        color: cardData.themeColor || "indigo",
        watermark: String(cardData.watermark !== false),
      }).toString()
    : "";

  const cardImageUrl = cardQuery ? `/api/card?${cardQuery}` : null;

  // Copy card image to clipboard
  const handleCopyImageToClipboard = async (): Promise<boolean> => {
    if (!cardImageUrl) return false;
    try {
      setCopyingImage(true);
      const res = await fetch(cardImageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2500);
      return true;
    } catch (e) {
      console.warn("Failed to copy image to clipboard", e);
      return false;
    } finally {
      setCopyingImage(false);
    }
  };

  // Mode 1: Copy Image & Open X Composer
  const handleOpenComposerWithCopy = async () => {
    // 1. Copy image to clipboard
    await handleCopyImageToClipboard();

    // 2. Open X Intent window
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}`;
    window.open(intentUrl, "_blank", "width=600,height=550");
  };

  // Mode 2: Direct Post via API
  const handleDirectPost = async () => {
    if (isOverLimit) {
      alert(
        isZh
          ? "推文字数超过 280 字符限制，请先缩减内容。"
          : "Tweet exceeds 280 characters limit."
      );
      return;
    }

    try {
      setPosting(true);
      setPostResult(null);

      // Save credentials if provided
      if (apiKey && apiSecret && accessToken && accessTokenSecret) {
        localStorage.setItem(
          "shiphype_x_keys",
          JSON.stringify({
            apiKey,
            apiSecret,
            accessToken,
            accessTokenSecret,
          })
        );
      }

      const res = await fetch("/api/social/x/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: tweetText,
          cardData,
          repoName,
          attachImage: true,
          credentials: {
            apiKey: apiKey.trim(),
            apiSecret: apiSecret.trim(),
            accessToken: accessToken.trim(),
            accessTokenSecret: accessTokenSecret.trim(),
          },
          simulate: simulateMode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to post to X");
      }

      setPostResult({
        success: true,
        simulated: data.simulated,
        tweetUrl: data.tweetUrl,
      });
    } catch (err: unknown) {
      setPostResult({
        success: false,
        error: err instanceof Error ? err.message : "Posting failed",
      });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-sm">
              <XIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isZh ? "发布推文到 X (Twitter)" : "Publish Tweet to X"}</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  Ready
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isZh
                  ? "支持免 Key 自动复制配图一键拉起发帖，或配置 API 自动直发带图"
                  : "Post with 1-click clipboard image attach, or connect API keys for direct publishing."}
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Authentic X Tweet Preview Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                {isZh ? "X 真实推文预览" : "Authentic X Tweet Preview"}
              </span>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                  isOverLimit
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                }`}
              >
                {charCount} / 280 {isZh ? "字" : "chars"}
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-black/60 shadow-xs space-y-3 font-sans">
              {/* User row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                    SH
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Indie Creator
                      </span>
                      <svg className="h-3.5 w-3.5 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span className="text-xs text-slate-400 dark:text-zinc-500">
                        @{repoName.split("/")[0] || "shiphype"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">Just now</span>
                  </div>
                </div>

                <XIcon className="h-4 w-4 text-slate-400" />
              </div>

              {/* Text content */}
              <p className="text-sm text-slate-900 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed">
                {tweetText}
              </p>

              {/* Bento Card Image Attachment */}
              {cardImageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950 shadow-sm relative group">
                  <img
                    src={cardImageUrl}
                    alt="Bento Visual Card"
                    className="w-full h-auto object-cover max-h-56 sm:max-h-64"
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1 opacity-90">
                    <ImageIcon className="h-3 w-3" />
                    <span>1200×630 Bento Card</span>
                  </div>
                </div>
              )}

              {/* Mock X Engagement Icons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 text-slate-400 dark:text-zinc-500 text-xs px-2">
                <span className="flex items-center gap-1.5 hover:text-sky-500 transition-colors">
                  <MessageSquare className="h-3.5 w-3.5" /> 12
                </span>
                <span className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                  <Repeat2 className="h-3.5 w-3.5" /> 28
                </span>
                <span className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                  <Heart className="h-3.5 w-3.5" /> 142
                </span>
                <span className="flex items-center gap-1.5 hover:text-sky-500 transition-colors">
                  <Bookmark className="h-3.5 w-3.5" />
                </span>
                <span className="flex items-center gap-1.5 hover:text-sky-500 transition-colors">
                  <Share className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveMode("intent")}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeMode === "intent"
                  ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{isZh ? "零门槛自动带图拉起 (推荐)" : "Instant Composer (No API Key)"}</span>
            </button>
            <button
              onClick={() => setActiveMode("api")}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeMode === "api"
                  ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isZh ? "X 官方 API 直连发推" : "Direct Post (X API v2)"}</span>
            </button>
          </div>

          {/* Mode 1 Description & Controls */}
          {activeMode === "intent" && (
            <div className="p-4 rounded-2xl border border-sky-100 dark:border-sky-950/60 bg-sky-50/50 dark:bg-sky-950/20 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/20">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {isZh ? "无感带图发帖机制" : "Seamless Image Attachment Workflow"}
                  </h4>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {isZh
                      ? "点击下方按钮，ShipHype 将在 0.1 秒内自动把 1200×630 Bento 宣发卡片写入剪贴板并打开 X 发帖弹窗。进入后直接按 Ctrl+V（或右键粘贴），配图即自动插入推文！"
                      : "Click below, and ShipHype instantly copies the 1200×630 visual card to your clipboard and opens the X composer. Just press Ctrl+V to attach the image!"}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={handleOpenComposerWithCopy}
                  disabled={copyingImage}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>
                    {copyingImage
                      ? isZh
                        ? "正在复制配图..."
                        : "Copying Image..."
                      : isZh
                      ? "复制配图并拉起 X 发帖"
                      : "Copy Image & Open X Composer"}
                  </span>
                </button>

                <button
                  onClick={handleCopyImageToClipboard}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedImage ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedImage ? (isZh ? "配图已写入剪贴板" : "Image in Clipboard!") : (isZh ? "仅复制配图" : "Copy Image")}</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Direct Post via API */}
          {activeMode === "api" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {isZh ? "X API v2 开发者直发配置" : "X API v2 Credentials"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(!showKeyConfig)}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Key className="h-3 w-3" />
                  <span>{showKeyConfig ? (isZh ? "收起配置" : "Hide Keys") : (isZh ? "配置 API Key" : "Configure Keys")}</span>
                </button>
              </div>

              {/* Simulation Mode Toggle */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {isZh ? "演练模拟发布模式 (Simulation Mode)" : "Simulation Mode"}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {isZh
                      ? "免配置 API 密钥，校验推文字数并模拟生成真实推文链接"
                      : "Test the flow without Twitter developer keys; generates audit logs & mock tweet URL."}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={simulateMode}
                  onChange={(e) => setSimulateMode(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
              </div>

              {/* Key Configuration Inputs (Collapsible) */}
              {showKeyConfig && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                        API Key (Consumer Key)
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="e.g. abcd123..."
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                        API Key Secret (Consumer Secret)
                      </label>
                      <input
                        type="password"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        placeholder="e.g. secret..."
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                        Access Token
                      </label>
                      <input
                        type="password"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        placeholder="e.g. token..."
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                        Access Token Secret
                      </label>
                      <input
                        type="password"
                        value={accessTokenSecret}
                        onChange={(e) => setAccessTokenSecret(e.target.value)}
                        placeholder="e.g. token_secret..."
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                    {isZh
                      ? "密钥仅保存在本地浏览器端或通过环境变量 X_API_KEY 传递，绝不泄露给任何第三方。"
                      : "Keys are stored locally in your browser and used only for signing requests."}
                  </p>
                </div>
              )}

              {/* Direct Post Button */}
              <button
                onClick={handleDirectPost}
                disabled={posting}
                className="w-full py-3 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Send className={`h-4 w-4 ${posting ? "animate-spin" : ""}`} />
                <span>
                  {posting
                    ? isZh
                      ? "正在发布推文并上传配图..."
                      : "Publishing to X & Uploading Card..."
                    : simulateMode
                    ? isZh
                      ? "执行模拟发推演练 (Simulate Post)"
                      : "Run Simulated Post"
                    : isZh
                    ? "调用 X API 立即直发"
                    : "Direct Post to X Now"}
                </span>
              </button>

              {/* Post Result Feedback */}
              {postResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                    postResult.success
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {postResult.success ? (
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <span className="font-bold">
                      {postResult.success
                        ? postResult.simulated
                          ? isZh
                            ? "🎉 模拟演练发布成功！"
                            : "🎉 Simulated Post Succeeded!"
                          : isZh
                          ? "🚀 成功直发到 X！"
                          : "🚀 Successfully Published to X!"
                        : isZh
                        ? "发布失败"
                        : "Publication Failed"}
                    </span>
                    {postResult.tweetUrl && (
                      <p className="text-[11px]">
                        {isZh ? "推文链接：" : "Tweet URL: "}
                        <a
                          href={postResult.tweetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline font-mono text-sky-600 dark:text-sky-400"
                        >
                          {postResult.tweetUrl}
                        </a>
                      </p>
                    )}
                    {postResult.error && <p className="text-[11px]">{postResult.error}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs bg-slate-50 dark:bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-sky-500" />
            <span>{isZh ? "已附带 1200×630 视觉宣发配图" : "Attached 1200×630 Bento Card"}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isZh ? "关闭" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
