// src/components/layout/TopBar.tsx

"use client";

import { useUserStore } from "@/stores/useUserStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { formatNumber } from "@/lib/utils";
import { Sun, Moon, Coins, Gift } from "lucide-react";
import { motion } from "framer-motion";

export function TopBar() {
  const balance = useUserStore((s) => s.balance);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="glass-nav px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🎮</span>
            <span className="font-bold text-sm gradient-text">
              ARCADE CHEST
            </span>
          </div>

          {/* Right side - balances + theme */}
          <div className="flex items-center gap-2">
            {/* Access Tokens */}
            {balance && (
              <motion.div
                className="glass flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                whileTap={{ scale: 0.95 }}
              >
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-bold">
                  {balance.accessTokensOffchain}
                </span>
              </motion.div>
            )}

            {/* Pending chests */}
            {balance && balance.chestFreePending > 0 && (
              <motion.div
                className="glass flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Gift className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-xs font-bold">
                  {balance.chestFreePending}
                </span>
              </motion.div>
            )}

            {/* Points */}
            {balance && (
              <div className="glass flex items-center gap-1.5 px-2.5 py-1 rounded-full">
                <span className="text-xs">⭐</span>
                <span className="text-xs font-bold">
                  {formatNumber(balance.pointsSeason)}
                </span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-secondary/60 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}