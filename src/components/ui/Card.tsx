// src/components/ui/Card.tsx

"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glow";
  children: ReactNode;
}

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-card border border-border rounded-2xl",
    glass: "glass-card",
    glow: "glass-card glow",
  };

  return (
    <div className={cn(variants[variant], "p-4", className)} {...props}>
      {children}
    </div>
  );
}