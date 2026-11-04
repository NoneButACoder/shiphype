"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  GitPullRequest,
  Globe,
  Sun,
  Moon,
  LayoutDashboard,
  LogOut,
  UserCheck,
} from "lucide-react";
import { AuthUser } from "@/lib/auth";

interface HeaderProps {
  language: "en" | "zh";
  onLanguageChange: (lang: "en" | "zh") => void;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  user?: AuthUser | null;
  onOpenConnectModal?: () => void;
  onLogout?: () => void;
}

export function Header({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  user,
  onOpenConnectModal,
  onLogout,
}: HeaderProps) {
  const isZh = language === "zh";

  return (
    <header className="border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                ShipHype <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">v1 Beta</span>
              </span>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            >
              {isZh ? "生成工坊" : "Generator"}
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>{isZh ? "控制台 & 项目" : "Dashboard"}</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prominent Dashboard Button */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold shadow-xs transition-all"
            title={isZh ? "进入发版管理控制台" : "Go to Release Dashboard"}
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isZh ? "控制台" : "Dashboard"}</span>
          </Link>

          {/* Theme Toggle (Day / Night) */}
          <button
            onClick={() => onThemeChange(theme === "light" ? "dark" : "light")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs dark:shadow-none"
            title={
              isZh
                ? theme === "light"
                  ? "切换为夜晚主题"
                  : "切换为白天主题"
                : theme === "light"
                ? "Switch to Night Mode"
                : "Switch to Day Mode"
            }
          >
            {theme === "light" ? (
              <>
                <Sun className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium hidden sm:inline">{isZh ? "白天" : "Day"}</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-medium hidden sm:inline">{isZh ? "夜晚" : "Night"}</span>
              </>
            )}
          </button>

          {/* Top-Right Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-0.5 text-xs">
            <div className="flex items-center pl-2 pr-1 text-slate-400 dark:text-zinc-500">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                language === "en"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange("zh")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                language === "zh"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
              }`}
            >
              中文
            </button>
          </div>

          {/* User GitHub Profile or Connect Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatarUrl}
                  alt={user.login}
                  className="w-5 h-5 rounded-full ring-1 ring-indigo-500/50"
                />
                <span className="font-semibold text-slate-900 dark:text-white hidden sm:inline">
                  @{user.login}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title={isZh ? "退出登录" : "Sign out"}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenConnectModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 text-xs font-semibold shadow-xs transition-opacity cursor-pointer pl-2 border-l border-slate-200 dark:border-zinc-800"
            >
              <GitPullRequest className="h-3.5 w-3.5" />
              <span>{isZh ? "连接 GitHub" : "Connect GitHub"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
