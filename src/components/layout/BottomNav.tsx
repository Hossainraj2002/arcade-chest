// src/components/layout/BottomNav.tsx

"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Gamepad2, Trophy, User, ListChecks } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "@/stores/useUserStore";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/games", label: "Games", icon: Gamepad2 },
  { path: "/tasks", label: "Tasks", icon: ListChecks },
  { path: "/leaderboard", label: "Ranks", icon: Trophy },
  { path: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const balance = useUserStore((s) => s.balance);

  // Hide nav during active gameplay
  const isInGame = pathname.startsWith("/games/");

  if (isInGame) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="glass-nav px-2 pt-2 pb-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === "/"
                ? pathname === "/"
                : pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-all",
                      isActive && "scale-110"
                    )}
                  />
                  {item.path === "/profile" &&
                    balance &&
                    balance.chestFreePending > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-amber-400 rounded-full border-2 border-background" />
                    )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}