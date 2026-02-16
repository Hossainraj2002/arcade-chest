// src/components/layout/BottomNav.tsx

"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Gamepad2,
  Trophy,
  User,
  ListChecks,
} from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";

const NAV = [
  { path: "/", label: "Home", Icon: Home },
  { path: "/games", label: "Games", Icon: Gamepad2 },
  { path: "/tasks", label: "Tasks", Icon: ListChecks },
  { path: "/leaderboard", label: "Ranks", Icon: Trophy },
  { path: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const balance = useUserStore((s) => s.balance);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 glass-nav"
      style={{
        zIndex: 9999,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-stretch justify-around max-w-md mx-auto h-16">
        {NAV.map(({ path, label, Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 relative transition-colors"
              style={{
                minHeight: 48,
                color: active ? "var(--primary)" : "var(--muted-fg)",
              }}
            >
              {/* Active indicator bar */}
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-7 rounded-full"
                  style={{ background: "var(--primary)" }}
                />
              )}

              <span className="relative">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.8}
                />
                {/* Chest badge on Profile */}
                {path === "/profile" &&
                  balance &&
                  balance.chestFreePending > 0 && (
                    <span className="absolute -top-1 -right-1.5 h-2.5 w-2.5 rounded-full bg-amber-400 border-2" style={{ borderColor: "var(--bg)" }} />
                  )}
              </span>
              <span
                className="text-[11px] font-medium leading-none"
                style={{ opacity: active ? 1 : 0.7 }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}