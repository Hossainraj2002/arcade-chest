// src/game-engines/bejeweled/BejeweledGame.tsx

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { RoundEndRequest } from "@/types";

interface Props {
  onGameEnd: (summary: RoundEndRequest["runSummary"]) => void;
  isPlaying: boolean;
  nonce: string | null;
}

const GRID_SIZE = 8;
const GEM_TYPES = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠"];
const GEM_COLORS = ["#EF4444", "#3B82F6", "#22C55E", "#FBBF24", "#A855F7", "#F97316"];
const MOVE_LIMIT = 30;

export function BejeweledGame({ onGameEnd, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<number[][]>([]);
  const selectedRef = useRef<{ r: number; c: number } | null>(null);
  const scoreRef = useRef(0);
  const movesRef = useRef(MOVE_LIMIT);
  const combosRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const animatingRef = useRef(false);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(MOVE_LIMIT);
  const [gameOver, setGameOver] = useState(false);
  const gameOverRef = useRef(false);

  const cellSize = useCallback(() => {
    const w = Math.min(window.innerWidth - 32, 380);
    return Math.floor(w / GRID_SIZE);
  }, []);

  const createGrid = useCallback((): number[][] => {
    const grid: number[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      grid[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        let gem: number;
        do {
          gem = Math.floor(Math.random() * GEM_COLORS.length);
        } while (
          (c >= 2 && grid[r][c - 1] === gem && grid[r][c - 2] === gem) ||
          (r >= 2 && grid[r - 1][c] === gem && grid[r - 2][c] === gem)
        );
        grid[r][c] = gem;
      }
    }
    return grid;
  }, []);

  const findMatches = useCallback((grid: number[][]): Set<string> => {
    const matches = new Set<string>();

    // Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        if (
          grid[r][c] === grid[r][c + 1] &&
          grid[r][c] === grid[r][c + 2] &&
          grid[r][c] >= 0
        ) {
          matches.add(`${r},${c}`);
          matches.add(`${r},${c + 1}`);
          matches.add(`${r},${c + 2}`);
        }
      }
    }

    // Vertical
    for (let r = 0; r < GRID_SIZE - 2; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (
          grid[r][c] === grid[r + 1][c] &&
          grid[r][c] === grid[r + 2][c] &&
          grid[r][c] >= 0
        ) {
          matches.add(`${r},${c}`);
          matches.add(`${r + 1},${c}`);
          matches.add(`${r + 2},${c}`);
        }
      }
    }

    return matches;
  }, []);

  const removeAndDrop = useCallback(
    (grid: number[][], matches: Set<string>): number => {
      const points = matches.size * 10;

      // Remove matched gems
      for (const key of matches) {
        const [r, c] = key.split(",").map(Number);
        grid[r][c] = -1;
      }

      // Drop gems down
      for (let c = 0; c < GRID_SIZE; c++) {
        let writePos = GRID_SIZE - 1;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          if (grid[r][c] >= 0) {
            grid[writePos][c] = grid[r][c];
            if (writePos !== r) grid[r][c] = -1;
            writePos--;
          }
        }
        // Fill top with new gems
        for (let r = writePos; r >= 0; r--) {
          grid[r][c] = Math.floor(Math.random() * GEM_COLORS.length);
        }
      }

      return points;
    },
    []
  );

  const processMatches = useCallback(() => {
    const grid = gridRef.current;
    let totalPoints = 0;
    let cascades = 0;

    let matches = findMatches(grid);
    while (matches.size > 0) {
      totalPoints += removeAndDrop(grid, matches);
      cascades++;
      matches = findMatches(grid);
    }

    if (totalPoints > 0) {
      const comboMultiplier = Math.min(cascades, 5);
      const finalPoints = totalPoints * comboMultiplier;
      scoreRef.current += finalPoints;
      combosRef.current += cascades > 1 ? cascades : 0;
      setScore(scoreRef.current);
    }

    return totalPoints > 0;
  }, [findMatches, removeAndDrop]);

  const swap = useCallback(
    (r1: number, c1: number, r2: number, c2: number) => {
      if (gameOverRef.current || animatingRef.current) return;

      const grid = gridRef.current;
      const temp = grid[r1][c1];
      grid[r1][c1] = grid[r2][c2];
      grid[r2][c2] = temp;

      const matches = findMatches(grid);
      if (matches.size === 0) {
        // Swap back
        grid[r2][c2] = grid[r1][c1];
        grid[r1][c1] = temp;
        return;
      }

      movesRef.current--;
      setMoves(movesRef.current);

      animatingRef.current = true;
      setTimeout(() => {
        processMatches();
        animatingRef.current = false;

        if (movesRef.current <= 0) {
          gameOverRef.current = true;
          setGameOver(true);
          const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
          onGameEnd({
            rawScore: scoreRef.current,
            durationSeconds: duration,
            combos: combosRef.current,
          });
        }
      }, 100);
    },
    [findMatches, processMatches, onGameEnd]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cs = cellSize();
    canvas.width = GRID_SIZE * cs;
    canvas.height = GRID_SIZE * cs;

    // Background
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const grid = gridRef.current;
    const selected = selectedRef.current;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const x = c * cs;
        const y = r * cs;
        const gem = grid[r]?.[c];

        // Cell background
        const isSelected = selected && selected.r === r && selected.c === c;
        ctx.fillStyle = isSelected
          ? "rgba(168, 85, 247, 0.3)"
          : (r + c) % 2 === 0
          ? "rgba(255,255,255,0.03)"
          : "rgba(255,255,255,0.06)";
        ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);

        if (gem !== undefined && gem >= 0) {
          // Gem circle
          const radius = cs * 0.35;
          ctx.fillStyle = GEM_COLORS[gem];
          ctx.beginPath();
          ctx.arc(x + cs / 2, y + cs / 2, radius, 0, Math.PI * 2);
          ctx.fill();

          // Shine
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.beginPath();
          ctx.arc(
            x + cs / 2 - radius * 0.2,
            y + cs / 2 - radius * 0.2,
            radius * 0.35,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // Selection ring
        if (isSelected) {
          ctx.strokeStyle = "#A855F7";
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 2, y + 2, cs - 4, cs - 4);
        }
      }
    }
  }, [cellSize]);

  // Init
  useEffect(() => {
    if (!isPlaying) return;

    gridRef.current = createGrid();
    selectedRef.current = null;
    scoreRef.current = 0;
    movesRef.current = MOVE_LIMIT;
    combosRef.current = 0;
    startTimeRef.current = Date.now();
    gameOverRef.current = false;
    animatingRef.current = false;
    setScore(0);
    setMoves(MOVE_LIMIT);
    setGameOver(false);

    // Initial match clearing
    processMatches();

    const loop = () => {
      draw();
      if (!gameOverRef.current) {
        requestAnimationFrame(loop);
      }
    };
    requestAnimationFrame(loop);
  }, [isPlaying, createGrid, processMatches, draw]);

  // Click/touch handler
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleInteraction = (clientX: number, clientY: number) => {
      if (gameOverRef.current || animatingRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const cs = cellSize();
      const c = Math.floor((clientX - rect.left) / cs);
      const r = Math.floor((clientY - rect.top) / cs);

      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return;

      const sel = selectedRef.current;
      if (!sel) {
        selectedRef.current = { r, c };
      } else {
        const dr = Math.abs(sel.r - r);
        const dc = Math.abs(sel.c - c);

        if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
          swap(sel.r, sel.c, r, c);
          selectedRef.current = null;
        } else {
          selectedRef.current = { r, c };
        }
      }
    };

    const handleClick = (e: MouseEvent) => handleInteraction(e.clientX, e.clientY);
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTouch, { passive: false });
    return () => {
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleTouch);
    };
  }, [isPlaying, cellSize, swap]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background relative">
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="glass px-3 py-1.5 rounded-lg">
          <span className="text-muted-foreground">Score: </span>
          <span className="font-bold">{score}</span>
        </div>
        <div className="glass px-3 py-1.5 rounded-lg">
          <span className="text-muted-foreground">Moves: </span>
          <span className="font-bold">{moves}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-xl border border-border shadow-2xl"
        style={{ touchAction: "none" }}
      />

      <p className="text-[10px] text-muted-foreground mt-3">
        Tap a gem, then tap adjacent gem to swap. Match 3+!
      </p>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-3xl font-bold mb-2">No Moves Left!</p>
            <p className="text-lg gradient-text font-bold">{score} pts</p>
          </div>
        </div>
      )}
    </div>
  );
}