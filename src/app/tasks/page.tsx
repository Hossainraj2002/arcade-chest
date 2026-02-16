"use client";

import { ListChecks } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="space-y-4 py-3">
      <h1 className="text-xl font-bold">Tasks</h1>
      <p className="text-xs" style={{ color: "var(--muted-fg)" }}>Complete tasks for bonus rewards</p>

      <div className="glass-card text-center py-16">
        <ListChecks size={40} style={{ color: "var(--muted-fg)", opacity: 0.3 }} className="mx-auto mb-3" />
        <p className="text-sm font-semibold" style={{ color: "var(--muted-fg)" }}>Coming Soon</p>
        <p className="text-xs mt-1" style={{ color: "var(--muted-fg)" }}>
          Daily quests, social challenges, and promo tasks.
        </p>
      </div>
    </div>
  );
}