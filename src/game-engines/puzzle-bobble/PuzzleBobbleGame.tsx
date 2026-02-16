// src/game-engines/puzzle-bobble/PuzzleBobbleGame.tsx

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { RoundEndRequest } from "@/types";

interface Props {
  onGameEnd: (summary: RoundEndRequest["runSummary"]) => void;
  isPlaying: boolean;
  nonce: string | null;
}

const BUBBLE_RADIUS = 16;
const COLORS = ["#EF4444", "#3B82F6", "#22C55E", "#FBBF24", "#A855F7", "#F97316"];
const GRID_COLS = 10;
const GRID_ROWS = 12;
const MAX_SHOTS = 50;

interface Bubble {
  x: number;
  y: number;
  color: number;
  row: number;
  col: number;
}

export function PuzzleBobbleGame({ onGameEnd, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const gridRef = useRef<(number | null)[][]>([]);
  const shooterRef = useRef({ angle: Math.PI / 2, color: 0 });
  const flyingRef = useRef<{ x: number; y: number; dx: number; dy: number; color: number } | null>(null);
  const scoreRef = useRef(0);
  const shotsRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const [score, setScore] = useState(0);
  const [shotsLeft, setShotsLeft] = useState(MAX_SHOTS);
  const [gameOver, setGameOver] = useState(false);
  const gameOverRef = useRef(false);

  const getCanvasSize = useCallback(() => {
    const w = Math.min(window.innerWidth - 16, 360);
    const h = Math.min(window.innerHeight * 0.65, 520);
    return { w, h };
  }, []);

  const createGrid = useCallback(() => {
    const grid: (number | null)[][] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      grid[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        if (r < 5) {
          grid[r][c] = Math.floor(Math.random() * COLORS.length);
        } else {
          grid[r][c] = null;
        }
      }
    }
    return grid;
  }, []);

  const getBubblePos = useCallback(
    (row: number, col: number, canvasWidth: number) => {
      const offset = row % 2 === 1 ? BUBBLE_RADIUS : 0;
      return {
        x: col * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS + offset + 10,
        y: row * BUBBLE_RADIUS * 1.7 + BUBBLE_RADIUS + 10,
      };
    },
    []
  );

  const findConnected = useCallback(
    (grid: (number | null)[][], row: number, col: number, color: number): Set<string> => {
      const visited = new Set<string>();
      const stack = [{ r: row, c: col }];

      while (stack.length > 0) {
        const { r, c } = stack.pop()!;
        const key = `${r},${c}`;
        if (visited.has(key)) continue;
        if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) continue;
        if (grid[r][c] !== color) continue;

        visited.add(key);

        // Hex neighbors
        const isOddRow = r % 2 === 1;
        const neighbors = [
          { r: r - 1, c: isOddRow ? c : c - 1 },
          { r: r - 1, c: isOddRow ? c + 1 : c },
          { r: r, c: c - 1 },
          { r: r, c: c + 1 },
          { r: r + 1, c: isOddRow ? c : c - 1 },
          { r: r + 1, c: isOddRow ? c + 1 : c },
        ];

        for (const n of neighbors) {
          stack.push(n);
        }
      }

      return visited;
    },
    []
  );

  const snapBubble = useCallback(
    (x: number, y: number, canvasWidth: number): { row: number; col: number } => {
      let bestRow = 0;
      let bestCol = 0;
      let bestDist = Infinity;

      for (let r = 0; r < GRID_ROWS; r++) {
        const maxCols = r % 2 === 1 ? GRID_COLS - 1 : GRID_COLS;
        for (let c = 0; c < maxCols; c++) {
          const pos = getBubblePos(r, c, canvasWidth);
          const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
          if (dist < bestDist) {
            bestDist = dist;
            bestRow = r;
            bestCol = c;
          }
        }
      }

      return { row: bestRow, col: bestCol };
    },
    [getBubblePos]
  );

  const shoot = useCallback(() => {
    if (gameOverRef.current || flyingRef.current) return;

    const { w, h } = getCanvasSize();
    const speed = 8;
    const angle = shooterRef.current.angle;

    flyingRef.current = {
      x: w / 2,
      y: h - 40,
      dx: Math.cos(angle) * speed,
      dy: -Math.sin(angle) * speed,
      color: shooterRef.current.color,
    };

    shotsRef.current++;
    setShotsLeft(MAX_SHOTS - shotsRef.current);
    shooterRef.current.color = Math.floor(Math.random() * COLORS.length);
  }, [getCanvasSize]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = getCanvasSize();
    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, w, h);

    // Grid bubbles
    const grid = gridRef.current;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid[r]?.[c] !== null && grid[r]?.[c] !== undefined) {
          const pos = getBubblePos(r, c, w);
          const colorIdx = grid[r][c]!;

          ctx.fillStyle = COLORS[colorIdx];
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.beginPath();
          ctx.arc(pos.x - 4, pos.y - 4, BUBBLE_RADIUS * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Flying bubble
    const flying = flyingRef.current;
    if (flying) {
      ctx.fillStyle = COLORS[flying.color];
      ctx.beginPath();
      ctx.arc(flying.x, flying.y, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shooter
    const shooterX = w / 2;
    const shooterY = h - 40;
    const aimLen = 50;
    const angle = shooterRef.current.angle;

    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(shooterX, shooterY);
    ctx.lineTo(
      shooterX + Math.cos(angle) * aimLen,
      shooterY - Math.sin(angle) * aimLen
    );
    ctx.stroke();
    ctx.setLineDash([]);

    // Shooter bubble
    ctx.fillStyle = COLORS[shooterRef.current.color];
    ctx.beginPath();
    ctx.arc(shooterX, shooterY, BUBBLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [getCanvasSize, getBubblePos]);

  const update = useCallback(() => {
    if (gameOverRef.current) return;

    const { w, h } = getCanvasSize();
    const flying = flyingRef.current;

    if (flying) {
      flying.x += flying.dx;
      flying.y += flying.dy;

      // Wall bounce
      if (flying.x - BUBBLE_RADIUS <= 0 || flying.x + BUBBLE_RADIUS >= w) {
        flying.dx = -flying.dx;
      }

      // Hit top or hit another bubble
      let landed = false;

      if (flying.y - BUBBLE_RADIUS <= 10) {
        landed = true;
      }

      // Check collision with grid bubbles
      const grid = gridRef.current;
      if (!landed) {
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (grid[r]?.[c] === null || grid[r]?.[c] === undefined) continue;
            const pos = getBubblePos(r, c, w);
            const dist = Math.sqrt(
              (flying.x - pos.x) ** 2 + (flying.y - pos.y) ** 2
            );
            if (dist < BUBBLE_RADIUS * 2) {
              landed = true;
              break;
            }
          }
          if (landed) break;
        }
      }

      if (landed) {
        const snap = snapBubble(flying.x, flying.y, w);
        grid[snap.row] = grid[snap.row] || [];
        grid[snap.row][snap.col] = flying.color;

        // Check matches
        const connected = findConnected(grid, snap.row, snap.col, flying.color);
        if (connected.size >= 3) {
          for (const key of connected) {
            const [r, c] = key.split(",").map(Number);
            grid[r][c] = null;
          }
          const points = connected.size * 20;
          scoreRef.current += points;
          setScore(scoreRef.current);
        }

        flyingRef.current = null;

        // Check game over
        if (shotsRef.current >= MAX_SHOTS || snap.row >= GRID_ROWS - 2) {
          gameOverRef.current = true;
          setGameOver(true);
          const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
          onGameEnd({
            rawScore: scoreRef.current,
            durationSeconds: duration,
            shotsUsed: shotsRef.current,
          });
        }

        // Check win (all cleared)
        const hasAny = grid.some((row) => row?.some((cell) => cell !== null));
        if (!hasAny) {
          scoreRef.current += 1000;
          setScore(scoreRef.current);
          gameOverRef.current = true;
          setGameOver(true);
          const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
          onGameEnd({
            rawScore: scoreRef.current,
            durationSeconds: duration,
            shotsUsed: shotsRef.current,
          });
        }
      }
    }
  }, [getCanvasSize, getBubblePos, snapBubble, findConnected, onGameEnd]);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    gridRef.current = createGrid();
    shooterRef.current = {
      angle: Math.PI / 2,
      color: Math.floor(Math.random() * COLORS.length),
    };
    flyingRef.current = null;
    scoreRef.current = 0;
    shotsRef.current = 0;
    startTimeRef.current = Date.now();
    gameOverRef.current = false;
    setScore(0);
    setShotsLeft(MAX_SHOTS);
    setGameOver(false);

    const loop = () => {
      if (gameOverRef.current) return;
      update();
      draw();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, createGrid, update, draw]);

  // Aim & shoot
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const aim = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const { h } = getCanvasSize();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const shooterX = canvas.width / 2;
      const shooterY = h - 40;

      const angle = Math.atan2(shooterY - y, x - shooterX);
      shooterRef.current.angle = Math.max(0.2, Math.min(Math.PI - 0.2, angle));
    };

    const handleClick = (e: MouseEvent) => {
      aim(e.clientX, e.clientY);
      shoot();
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      aim(e.touches[0].clientX, e.touches[0].clientY);
      shoot();
    };

    const handleMove = (e: MouseEvent) => aim(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      aim(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTouch, { passive: false });
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleTouch);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isPlaying, shoot, getCanvasSize]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background relative">
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="glass px-3 py-1.5 rounded-lg">
          <span className="text-muted-foreground">Score: </span>
          <span className="font-bold">{score}</span>
        </div>
        <div className="glass px-3 py-1.5 rounded-lg">
          <span className="text-muted-foreground">Shots: </span>
          <span className="font-bold">{shotsLeft}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-xl border border-border shadow-2xl"
        style={{ touchAction: "none" }}
      />

      <p className="text-[10px] text-muted-foreground mt-3">
        Aim & tap to shoot bubbles. Match 3+ same color!
      </p>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-3xl font-bold mb-2">
              {shotsLeft > 0 ? "Cleared!" : "No Shots Left!"}
            </p>
            <p className="text-lg gradient-text font-bold">{score} pts</p>
          </div>
        </div>
      )}
    </div>
  );
}