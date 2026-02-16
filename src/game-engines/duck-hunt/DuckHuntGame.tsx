// src/game-engines/duck-hunt/DuckHuntGame.tsx

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { RoundEndRequest } from "@/types";

interface Props {
  onGameEnd: (summary: RoundEndRequest["runSummary"]) => void;
  isPlaying: boolean;
  nonce: string | null;
}

interface Duck {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  alive: boolean;
  color: string;
  spawnTime: number;
}

const DUCK_COLORS = ["#22C55E", "#3B82F6", "#FBBF24", "#EF4444", "#A855F7"];
const ROUND_DURATION = 60;

export function DuckHuntGame({ onGameEnd, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const ducksRef = useRef<Duck[]>([]);
  const scoreRef = useRef(0);
  const shotsRef = useRef(0);
  const hitsRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const lastSpawnRef = useRef(Date.now());
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const gameOverRef = useRef(false);

  const spawnDuck = useCallback((w: number, h: number) => {
    const fromLeft = Math.random() > 0.5;
    const duck: Duck = {
      x: fromLeft ? -30 : w + 30,
      y: 50 + Math.random() * (h * 0.5),
      dx: (fromLeft ? 1 : -1) * (2 + Math.random() * 3),
      dy: -1 + Math.random() * 2,
      size: 28 + Math.random() * 16,
      alive: true,
      color: DUCK_COLORS[Math.floor(Math.random() * DUCK_COLORS.length)],
      spawnTime: Date.now(),
    };
    ducksRef.current.push(duck);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#1a1a3e");
    grad.addColorStop(0.6, "#2d1b69");
    grad.addColorStop(1, "#1a472a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Ground
    ctx.fillStyle = "#1a472a";
    ctx.fillRect(0, h * 0.8, w, h * 0.2);

    // Trees (simple triangles)
    ctx.fillStyle = "#0d3320";
    for (let i = 0; i < 5; i++) {
      const tx = i * (w / 4) + 20;
      const th = 40 + Math.random() * 20;
      ctx.beginPath();
      ctx.moveTo(tx, h * 0.8);
      ctx.lineTo(tx + 20, h * 0.8 - th);
      ctx.lineTo(tx + 40, h * 0.8);
      ctx.fill();
    }

    // Ducks
    for (const duck of ducksRef.current) {
      if (!duck.alive) continue;

      // Body
      ctx.fillStyle = duck.color;
      ctx.beginPath();
      ctx.ellipse(duck.x, duck.y, duck.size * 0.6, duck.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(
        duck.x + (duck.dx > 0 ? duck.size * 0.4 : -duck.size * 0.4),
        duck.y - duck.size * 0.25,
        duck.size * 0.25,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Eye
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(
        duck.x + (duck.dx > 0 ? duck.size * 0.5 : -duck.size * 0.5),
        duck.y - duck.size * 0.3,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Beak
      ctx.fillStyle = "#FF8C42";
      ctx.beginPath();
      const beakDir = duck.dx > 0 ? 1 : -1;
      ctx.moveTo(
        duck.x + beakDir * duck.size * 0.65,
        duck.y - duck.size * 0.25
      );
      ctx.lineTo(
        duck.x + beakDir * (duck.size * 0.65 + 10),
        duck.y - duck.size * 0.2
      );
      ctx.lineTo(
        duck.x + beakDir * duck.size * 0.65,
        duck.y - duck.size * 0.15
      );
      ctx.fill();

      // Wings (flapping)
      const wingFlap = Math.sin(Date.now() / 100 + duck.spawnTime) * 8;
      ctx.fillStyle = duck.color;
      ctx.beginPath();
      ctx.ellipse(
        duck.x,
        duck.y + wingFlap,
        duck.size * 0.35,
        duck.size * 0.15,
        duck.dx > 0 ? -0.3 : 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }, []);

  const update = useCallback(() => {
    if (gameOverRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const remaining = Math.max(0, ROUND_DURATION - elapsed);
    setTimeLeft(remaining);

    if (remaining <= 0) {
      gameOverRef.current = true;
      setGameOver(true);
      onGameEnd({
        rawScore: scoreRef.current,
        durationSeconds: ROUND_DURATION,
        shotsUsed: shotsRef.current,
      });
      return;
    }

    // Spawn ducks
    const spawnInterval = Math.max(400, 1500 - elapsed * 15);
    if (Date.now() - lastSpawnRef.current > spawnInterval) {
      spawnDuck(w, h);
      lastSpawnRef.current = Date.now();
    }

    // Update ducks
    for (const duck of ducksRef.current) {
      if (!duck.alive) continue;
      duck.x += duck.dx;
      duck.y += duck.dy;
      duck.dy += (Math.random() - 0.5) * 0.3;
      duck.dy = Math.max(-2, Math.min(2, duck.dy));

      if (duck.y < 30) duck.dy = Math.abs(duck.dy);
      if (duck.y > h * 0.75) duck.dy = -Math.abs(duck.dy);
    }

    // Remove off-screen ducks
    ducksRef.current = ducksRef.current.filter(
      (d) => d.alive && d.x > -50 && d.x < w + 50
    );
  }, [onGameEnd, spawnDuck]);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = Math.min(window.innerWidth - 16, 400);
    canvas.height = Math.min(window.innerHeight * 0.65, 500);

    gameOverRef.current = false;
    scoreRef.current = 0;
    shotsRef.current = 0;
    hitsRef.current = 0;
    startTimeRef.current = Date.now();
    ducksRef.current = [];
    setScore(0);
    setShots(0);
    setTimeLeft(ROUND_DURATION);
    setGameOver(false);

    const loop = () => {
      if (gameOverRef.current) return;
      update();
      draw();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, update, draw]);

  // Click/tap to shoot
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const shoot = (clientX: number, clientY: number) => {
      if (gameOverRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      shotsRef.current++;
      setShots(shotsRef.current);

      // Check hit
      for (const duck of ducksRef.current) {
        if (!duck.alive) continue;
        const dist = Math.sqrt((x - duck.x) ** 2 + (y - duck.y) ** 2);
        if (dist < duck.size * 0.7) {
          duck.alive = false;
          hitsRef.current++;
          const points = Math.round(100 + (duck.size < 35 ? 50 : 0));
          scoreRef.current += points;
          setScore(scoreRef.current);
          break;
        }
      }
    };

    const handleClick = (e: MouseEvent) => shoot(e.clientX, e.clientY);
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      shoot(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTouch, { passive: false });
    return () => {
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleTouch);
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background relative">
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="glass px-3 py-1.5 rounded-lg">
          <span className="text-muted-foreground">Score: </span>
          <span className="font-bold">{score}</span>
        </div>
        <div className="glass px-3 py-1.5 rounded-lg">
          <span className="text-muted-foreground">Shots: </span>
          <span className="font-bold">{shots}</span>
        </div>
        <div className="glass px-3 py-1.5 rounded-lg">
          <span className="text-muted-foreground">Time: </span>
          <span className="font-bold">{timeLeft}s</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-xl border border-border shadow-2xl cursor-crosshair"
        style={{ touchAction: "none" }}
      />

      <p className="text-[10px] text-muted-foreground mt-3">
        Tap ducks to shoot! 🦆
      </p>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-3xl font-bold mb-2">Time&apos;s Up!</p>
            <p className="text-lg gradient-text font-bold">{score} pts</p>
            <p className="text-sm text-muted-foreground mt-1">
              {hitsRef.current}/{shots} accuracy
            </p>
          </div>
        </div>
      )}
    </div>
  );
}