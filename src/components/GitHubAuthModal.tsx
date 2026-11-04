"use client";

import React, { useState } from "react";
import { GitPullRequest, X, Key, User, ExternalLink, Check, RefreshCw } from "lucide-react";
import { AuthUser } from "@/lib/auth";

interface GitHubAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  language?: "en" | "zh";
}

export function GitHubAuthModal({
  isOpen,
  onClose,
  onSuccess,
  language = "en",
}: GitHubAuthModalProps) {
  const [tab, setTab] = useState<"token" | "username">("username");
  const [username, setUsername] = useState("NoneButACoder");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isZh = language === "zh";

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = tab === "token" ? { token } : { username };
      const res = await fetch("/api/auth/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to authenticate with GitHub");
      }

      onSuccess(data.user);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
              <GitPullRequest className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isZh ? "连接 GitHub 开发者账户" : "Connect GitHub Account"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-zinc-950 rounded-xl text-xs font-medium border border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setTab("username")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === "username"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>{isZh ? "用户名一键连接" : "Quick Username"}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("token")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === "token"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>{isZh ? "Token 授权 (含私有库)" : "Access Token"}</span>
          </button>
        </div>

        {/* Tab 1: Username Connect */}
        {tab === "username" ? (
          <form onSubmit={handleConnect} className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              {isZh
                ? "输入您的 GitHub 用户名，即可立即自动拉取您的所有公开仓库列表，直接点选 PR 生成物料："
                : "Enter your GitHub username to instantly load all your public repositories and pick PRs in 1 click:"}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                GitHub Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="e.g. NoneButACoder"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>{isZh ? "正在拉取仓库..." : "Connecting & Fetching..."}</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>{isZh ? "立即连接并同步仓库" : "Connect & Sync Repositories"}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Tab 2: Personal Access Token */
          <form onSubmit={handleConnect} className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              {isZh
                ? "使用个人访问令牌（PAT），支持无缝读取您名下的私有仓库（Private Repos）且无 API 频次限制。"
                : "Using a GitHub Personal Access Token (classic or fine-grained) gives full access to your private repos without rate limits."}
            </p>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  GitHub Personal Access Token
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=ShipHype"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  <span>{isZh ? "在 GitHub 生成" : "Generate on GitHub"}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>{isZh ? "正在验证..." : "Verifying Token..."}</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>{isZh ? "验证并连接" : "Verify & Connect"}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
