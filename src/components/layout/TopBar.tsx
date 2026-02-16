// src/components/layout/TopBar.tsx

"use client";

import { useUserStore } from "@/stores/useUserStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { formatNumber } from "@/lib/utils";
import { Sun, Moon, Coins, Gift } from "lucide-react";

export function TopBar() {
  const balance = useUserStore((s) => s.balance);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header
      className="fixed top-0 inset-x-0 glass-nav"
      style={{ zIndex: 9998 }}
    >
      <div className="flex items-center justify-between max-w-md mx-auto px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🎮</span>
          <span className="font-bold text-sm gradient-text tracking-tight">
            ARCADE CHEST
          </span>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-1.5">
          {balance && (
            <>
              {/* Access Tokens */}
              <div className="glass flex items-center gap-1 px-2 py-1 rounded-full">
                <Coins size={14} className="text-amber-400" />
                <span className="text-xs font-bold tabular-nums">
                  {balance.accessTokensOffchain}
                </span>
              </div>

              {/* Pending chests */}
              {balance.chestFreePending > 0 && (
                <div className="glass flex items-center gap-1 px-2 py-1 rounded-full animate-pulse">
                  <Gift size={14} className="text-purple-400" />
                  <span className="text-xs font-bold tabular-nums">
                    {balance.chestFreePending}
                  </span>
                </div>
              )}

              {/* Points */}
              <div className="glass flex items-center gap-1 px-2 py-1 rounded-full">
                <span className="text-xs">⭐</span>
                <span className="text-xs font-bold tabular-nums">
                  {formatNumber(balance.pointsSeason)}
                </span>
              </div>
            </>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors"
            style={{ minWidth: 36, minHeight: 36 }}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={16} className="text-amber-400" />
            ) : (
              <Moon size={16} style={{ color: "var(--primary)" }} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}