// src/app/tasks/page.tsx

"use client";

import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";

export default function TasksPage() {
  return (
    <motion.div
      className="space-y-4 py-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h1 className="text-xl font-bold">Tasks</h1>
        <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          Complete tasks to earn bonus rewards
        </p>
      </div>

      <Card variant="glass" className="text-center py-12">
        <ListChecks
          className="h-12 w-12 mx-auto mb-3"
          style={{ color: "hsla(var(--muted-foreground), 0.3)" }}
        />
        <p className="text-sm font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
          Coming Soon
        </p>
        <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          Daily tasks, promo challenges, and social quests will appear here.
        </p>
      </Card>
    </motion.div>
  );
}