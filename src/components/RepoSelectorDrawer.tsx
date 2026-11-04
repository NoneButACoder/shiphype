"use client";

import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  GitPullRequest,
  Lock,
  Star,
  ChevronRight,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { AuthUser } from "@/lib/auth";

export interface RepoItem {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  description: string | null;
  stars: number;
  language: string | null;
  updatedAt: string;
}

export interface PullItem {
  number: number;
  title: string;
  state: string;
  mergedAt: string | null;
  author: string;
  htmlUrl: string;
  updatedAt: string;
}

interface RepoSelectorDrawerProps {
  user: AuthUser;
  onSelectPr: (prUrl: string, autoGenerate?: boolean) => void;
  language?: "en" | "zh";
}

export function RepoSelectorDrawer({
  user,
  onSelectPr,
  language = "en",
}: RepoSelectorDrawerProps) {
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [loadingRepos, setLoadingRepos] = useState<boolean>(true);
  const [selectedRepo, setSelectedRepo] = useState<RepoItem | null>(null);

  const [pulls, setPulls] = useState<PullItem[]>([]);
  const [loadingPulls, setLoadingPulls] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);

  const isZh = language === "zh";

  const fetchRepos = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch("/api/github/repos");
      const data = await res.json();
      if (data.success && Array.isArray(data.repos)) {
        setRepos(data.repos);
        if (data.repos.length > 0 && !selectedRepo) {
          // Preselect first repo
          handleSelectRepo(data.repos[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch repos", err);
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, [user.id]);

  const handleSelectRepo = async (repo: RepoItem) => {
    setSelectedRepo(repo);
    setLoadingPulls(true);
    setPulls([]);
    try {
      const res = await fetch(`/api/github/pulls?owner=${encodeURIComponent(repo.owner)}&repo=${encodeURIComponent(repo.name)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.pulls)) {
        setPulls(data.pulls);
      }
    } catch (err) {
      console.error("Failed to load pulls", err);
    } finally {
      setLoadingPulls(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/60 via-purple-50/30 to-slate-50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-zinc-900/40 p-4 shadow-xs space-y-3 transition-all">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs shadow-xs">
            <FolderGit2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                {isZh ? "我的 GitHub 仓库与发版 PR" : "Connected Repositories & PRs"}
              </span>
              <span className="text-[11px] px-2 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono">
                @{user.login}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {isZh ? "点击任意 PR 即可一键载入并生成全套发版素材" : "Click any Pull Request to generate marketing material in 1 click."}
            </p>
          </div>
        </div>

        <button
          onClick={fetchRepos}
          disabled={loadingRepos}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white text-xs transition-colors cursor-pointer"
          title={isZh ? "刷新仓库" : "Refresh"}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingRepos ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Repo Chips Picker */}
      {loadingRepos ? (
        <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-500" />
          <span>{isZh ? "正在加载 GitHub 仓库..." : "Loading repositories..."}</span>
        </div>
      ) : repos.length === 0 ? (
        <div className="p-3 text-center text-xs text-slate-400">
          {isZh ? "未检测到公开仓库，请确保该账号拥有公开或私有代码库。" : "No repositories found for this account."}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Repos Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {repos.map((r) => {
              const isSelected = selectedRepo?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelectRepo(r)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs font-semibold"
                      : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {r.private ? <Lock className="h-3 w-3" /> : <FolderGit2 className="h-3 w-3" />}
                  <span>{r.name}</span>
                  {r.stars > 0 && (
                    <span className="flex items-center gap-0.5 opacity-80 text-[10px]">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      {r.stars}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Pull Requests list for selected repo */}
          {selectedRepo && (
            <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                <span>
                  {isZh ? `${selectedRepo.fullName} 的最新 PR 列表：` : `Recent PRs in ${selectedRepo.fullName}:`}
                </span>
                <a
                  href={`https://github.com/${selectedRepo.fullName}/pulls`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                >
                  <span>{isZh ? "在 GitHub 查看全部" : "View all on GitHub"}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {loadingPulls ? (
                <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                  <span>{isZh ? "正在拉取 PR 列表..." : "Loading PRs..."}</span>
                </div>
              ) : pulls.length === 0 ? (
                <div className="py-3 text-center text-xs text-slate-400">
                  {isZh ? "该仓库暂无 PR 记录，支持直接在下方输入框粘贴其它 PR 链接。" : "No PRs found in this repo. You can also paste any PR URL below."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {pulls.slice(0, 6).map((pr) => (
                    <button
                      key={pr.number}
                      onClick={() => onSelectPr(pr.htmlUrl, true)}
                      className="group flex items-start justify-between gap-2 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/70 dark:bg-zinc-950/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 text-left transition-all cursor-pointer"
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            #{pr.number}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                            {pr.mergedAt ? (isZh ? "已合并" : "Merged") : pr.state}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-zinc-200 font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {pr.title}
                        </p>
                      </div>

                      <div className="shrink-0 pt-1 text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
