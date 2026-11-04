"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Send,
  Eye,
  Users,
  Check,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Radio,
} from "lucide-react";
import { ReleaseRecord } from "@/lib/storage";

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: ReleaseRecord | null;
  language?: "en" | "zh";
}

export function BroadcastModal({
  isOpen,
  onClose,
  release,
  language = "en",
}: BroadcastModalProps) {
  const isZh = language === "zh";

  const [activeTab, setActiveTab] = useState<"send" | "preview">("send");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    subject: string;
    html: string;
    subscribersCount: number;
    subscribers: string[];
  } | null>(null);

  // Send controls
  const [targetMode, setTargetMode] = useState<"all" | "test">("all");
  const [testEmail, setTestEmail] = useState("");
  const [simulate, setSimulateMode] = useState(true);

  // Sending state
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    deliveredCount?: number;
    recipients?: string[];
    simulated?: boolean;
    subject?: string;
    error?: string;
  } | null>(null);

  // Load preview data when modal opens
  useEffect(() => {
    if (isOpen && release) {
      setSendResult(null);
      setLoadingPreview(true);
      fetch(`/api/broadcast?releaseId=${encodeURIComponent(release.id)}&preview=true`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPreviewData(data);
            if (data.subscribers?.[0]) {
              setTestEmail(data.subscribers[0]);
            }
          }
        })
        .catch((err) => console.error("Failed to load broadcast preview", err))
        .finally(() => setLoadingPreview(false));
    }
  }, [isOpen, release]);

  if (!isOpen || !release) return null;

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (targetMode === "test" && (!testEmail || !testEmail.includes("@"))) {
      alert(isZh ? "请输入有效的测试邮箱地址。" : "Please enter a valid test email.");
      return;
    }

    try {
      setSending(true);
      setSendResult(null);

      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          releaseId: release.id,
          testEmail: targetMode === "test" ? testEmail.trim() : undefined,
          simulate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to deliver broadcast");
      }

      setSendResult({
        success: true,
        deliveredCount: data.deliveredCount,
        recipients: data.recipients,
        simulated: data.simulated,
        subject: data.subject,
      });
    } catch (err: unknown) {
      setSendResult({
        success: false,
        error: err instanceof Error ? err.message : "Broadcast failed",
      });
    } finally {
      setSending(false);
    }
  };

  const subscribersCount = previewData?.subscribersCount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isZh ? "发版邮件广播" : "Release Email Broadcast"}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  {release.versionTag}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isZh
                  ? `向 ${release.projectSlug} 项目的邮件订阅者发送精美发版周报与更新通知`
                  : `Broadcast release announcement to ${release.projectSlug} subscribers.`}
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

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("send")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "send"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isZh ? "发送配置与受众" : "Send & Audience"}</span>
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{isZh ? "邮件外观实时预览" : "HTML Email Preview"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 pb-2">
            <Users className="h-3.5 w-3.5 text-purple-500" />
            <span>
              {subscribersCount} {isZh ? "位订阅用户" : "subscribers"}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "send" ? (
            <form onSubmit={handleSendBroadcast} className="space-y-6">
              {/* Audience Overview */}
              <div className="p-4 rounded-2xl border border-purple-100 dark:border-purple-950/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {isZh ? "邮件接收受众" : "Target Audience"}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                    {subscribersCount} {isZh ? "个有效邮箱" : "verified emails"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  {isZh
                    ? `当前项目共有 ${subscribersCount} 位订阅者。系统将自动生成包含项目品牌、版本亮点与 Bento 配图的专业发版 HTML 邮件。`
                    : `Your project has ${subscribersCount} subscribers. ShipHype will render a responsive email with your release highlights & card.`}
                </p>
                {previewData?.subscribers && previewData.subscribers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {previewData.subscribers.map((email) => (
                      <span
                        key={email}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                      >
                        {email}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Target Mode Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {isZh ? "发送方式" : "Dispatch Mode"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setTargetMode("all")}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      targetMode === "all"
                        ? "border-purple-600 bg-purple-50/40 dark:bg-purple-950/30 shadow-xs"
                        : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={targetMode === "all"}
                        onChange={() => setTargetMode("all")}
                        className="text-purple-600"
                      />
                      <span className="font-semibold text-xs text-slate-800 dark:text-zinc-200">
                        {isZh ? "全量群发给所有订阅者" : "Broadcast to All Subscribers"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 pl-5">
                      {isZh
                        ? `一次性向全部 ${subscribersCount} 位订阅者发送发版公告`
                        : `Send announcement email to all ${subscribersCount} subscribers.`}
                    </p>
                  </div>

                  <div
                    onClick={() => setTargetMode("test")}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      targetMode === "test"
                        ? "border-purple-600 bg-purple-50/40 dark:bg-purple-950/30 shadow-xs"
                        : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={targetMode === "test"}
                        onChange={() => setTargetMode("test")}
                        className="text-purple-600"
                      />
                      <span className="font-semibold text-xs text-slate-800 dark:text-zinc-200">
                        {isZh ? "仅发送单条测试邮件" : "Send Single Test Email"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 pl-5">
                      {isZh ? "先发送至指定测试邮箱确认排版" : "Deliver a sample test email to verify formatting."}
                    </p>
                  </div>
                </div>

                {targetMode === "test" && (
                  <div className="pt-1 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                      {isZh ? "测试收件人邮箱" : "Test Recipient Email"}
                    </label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Simulation Mode Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {isZh ? "演练模拟发送模式 (Simulation Mode)" : "Simulation Mode"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {isZh
                      ? "无需配置 Resend API 密钥即可演练完整广播流程与记录投递日志；配置 RESEND_API_KEY 后可取消勾选直发真实邮箱。"
                      : "Test the flow without external SMTP/Resend keys; full logs recorded."}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={simulate}
                  onChange={(e) => setSimulateMode(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending || (targetMode === "all" && subscribersCount === 0)}
                  className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className={`h-4 w-4 ${sending ? "animate-spin" : ""}`} />
                  <span>
                    {sending
                      ? isZh
                        ? "正在渲染并投递邮件..."
                        : "Rendering & Dispatching Emails..."
                      : targetMode === "test"
                      ? isZh
                        ? "发送测试邮件"
                        : "Send Test Email"
                      : simulate
                      ? isZh
                        ? `模拟广播给 ${subscribersCount} 位订阅者`
                        : `Simulate Broadcast to ${subscribersCount} Subscribers`
                      : isZh
                      ? `立即群发给 ${subscribersCount} 位订阅者`
                      : `Send Broadcast to ${subscribersCount} Subscribers`}
                  </span>
                </button>
              </div>

              {/* Send Result Feedback */}
              {sendResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in ${
                    sendResult.success
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {sendResult.success ? (
                    <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <span className="font-bold text-sm">
                      {sendResult.success
                        ? sendResult.simulated
                          ? isZh
                            ? "🎉 模拟广播演练投递成功！"
                            : "🎉 Simulated Broadcast Succeeded!"
                          : isZh
                          ? "🚀 邮件广播投递成功！"
                          : "🚀 Broadcast Delivered Successfully!"
                        : isZh
                        ? "投递失败"
                        : "Broadcast Failed"}
                    </span>
                    {sendResult.recipients && (
                      <p className="text-[11px] opacity-90">
                        {isZh
                          ? `已成功投递至 ${sendResult.deliveredCount} 个邮箱（${sendResult.recipients.join(
                              ", "
                            )}）`
                          : `Successfully delivered to ${sendResult.deliveredCount} recipients.`}
                      </p>
                    )}
                    {sendResult.error && <p className="text-[11px] font-mono">{sendResult.error}</p>}
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* HTML Preview Tab */
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 truncate">
                  Subject: <strong className="text-slate-900 dark:text-white">{previewData?.subject}</strong>
                </span>
                <a
                  href={`/api/broadcast?releaseId=${encodeURIComponent(release.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                >
                  <span>{isZh ? "在新标签打开" : "Open in Tab"}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {loadingPreview ? (
                <div className="py-20 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-purple-500" />
                  <span>{isZh ? "正在渲染邮件 HTML..." : "Rendering email HTML..."}</span>
                </div>
              ) : previewData?.html ? (
                <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm bg-slate-100 dark:bg-zinc-950">
                  <iframe
                    srcDoc={previewData.html}
                    title="Email Preview"
                    className="w-full h-[460px] bg-white border-0"
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs bg-slate-50 dark:bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            <span>{isZh ? "自适应响应式邮件模板" : "Responsive HTML Email Newsletter"}</span>
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
