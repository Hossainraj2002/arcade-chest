// src/game-engines/breakout/BreakoutGame.tsx

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { RoundEndRequest } from "@/types";

interface Props {
  onGameEnd: (summary: RoundEndRequest["runSummary"]) => void;
  isPlaying: boolean;
  nonce: string | null;
}

const BRICK_ROWS = 6;
const BRICK_COLS = 8;
const BRICK_COLORS = ["#EF4444", "#F97316", "#FBBF24", "#22C55E", "#3B82F6", "#A855F7"];

export function BreakoutGame({ onGameEnd, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    paddleX: 0,
    ballX: 0,
    ballY: 0,
    ballDX: 3,
    ballDY: -3,
    bricks: [] as { x: number; y: number; w: number; h: number; color: string; alive: boolean }[],
    score: 0,
    bricksDestroyed: 0,
    lives: 3,
    gameOver: false,
    startTime: Date.now(),
    paddleWidth: 80,
    ballRadius: 6,
  });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const touchXRef = useRef<number | null>(null);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = Math.min(window.innerWidth - 16, 400);
    const h = Math.min(window.innerHeight * 0.7, 600);
    canvas.width = w;
    canvas.height = h;

    const s = stateRef.current;
    s.paddleX = w / 2 - s.paddleWidth / 2;
    s.ballX = w / 2;
    s.ballY = h - 50;
    s.ballDX = 3;
    s.ballDY = -3;
    s.score = 0;
    s.bricksDestroyed = 0;
    s.lives = 3;
    s.gameOver = false;
    s.startTime = Date.now();

    // Create bricks
    const brickW = (w - 20) / BRICK_COLS;
    const brickH = 20;
    s.bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        s.bricks.push({
          x: 10 + c * brickW,
          y: 40 + r * (brickH + 4),
          w: brickW - 4,
          h: brickH,
          color: BRICK_COLORS[r],
          alive: true,
        });
      }
    }

    setScore(0);
    setLives(3);
    setGameOver(false);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, w, h);

    // Bricks
    for (const brick of s.bricks) {
      if (!brick.alive) continue;
      ctx.fillStyle = brick.color;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(brick.x, brick.y, brick.w, 3);
    }

    // Paddle
    ctx.fillStyle = "#A855F7";
    ctx.beginPath();
    ctx.roundRect(s.paddleX, h - 30, s.paddleWidth, 12, 6);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(s.paddleX + 2, h - 30, s.paddleWidth - 4, 3);

    // Ball
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, s.ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = "#A855F7";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (s.gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    s.ballX += s.ballDX;
    s.ballY += s.ballDY;

    // Wall bounce
    if (s.ballX - s.ballRadius <= 0 || s.ballX + s.ballRadius >= w) {
      s.ballDX = -s.ballDX;
    }
    if (s.ballY - s.ballRadius <= 0) {
      s.ballDY = -s.ballDY;
    }

    // Bottom - lose life
    if (s.ballY + s.ballRadius >= h) {
      s.lives--;
      setLives(s.lives);
      if (s.lives <= 0) {
        s.gameOver = true;
        setGameOver(true);
        const duration = Math.floor((Date.now() - s.startTime) / 1000);
        onGameEnd({
          rawScore: s.score,
          durationSeconds: duration,
          bricksDestroyed: s.bricksDestroyed,
        });
        return;
      }
      s.ballX = w / 2;
      s.ballY = h - 50;
      s.ballDX = 3;
      s.ballDY = -3;
    }

    // Paddle collision
    if (
      s.ballY + s.ballRadius >= h - 30 &&
      s.ballY + s.ballRadius <= h - 18 &&
      s.ballX >= s.paddleX &&
      s.ballX <= s.paddleX + s.paddleWidth
    ) {
      s.ballDY = -Math.abs(s.ballDY);
      const hitPos = (s.ballX - s.paddleX) / s.paddleWidth;
      s.ballDX = (hitPos - 0.5) * 8;
    }

    // Brick collision
    for (const brick of s.bricks) {
      if (!brick.alive) continue;
      if (
        s.ballX + s.ballRadius >= brick.x &&
        s.ballX - s.ballRadius <= brick.x + brick.w &&
        s.ballY + s.ballRadius >= brick.y &&
        s.ballY - s.ballRadius <= brick.y + brick.h
      ) {
        brick.alive = false;
        s.ballDY = -s.ballDY;
        s.score += 10;
        s.bricksDestroyed++;
        setScore(s.score);

        // Check win
        if (s.bricks.every((b) => !b.alive)) {
          s.gameOver = true;
          setGameOver(true);
          s.score += 1000;
          setScore(s.score);
          const duration = Math.floor((Date.now() - s.startTime) / 1000);
          onGameEnd({
            rawScore: s.score,
            durationSeconds: duration,
            bricksDestroyed: s.bricksDestroyed,
          });
        }
        break;
      }
    }
  }, [onGameEnd]);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;
    initGame();

    const loop = () => {
      if (stateRef.current.gameOver) return;
      update();
      draw();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, initGame, update, draw]);

  // Touch controls
  useEffect(() => {
    if (!isPlaying) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      stateRef.current.paddleX = Math.max(
        0,
        Math.min(touchX - stateRef.current.paddleWidth / 2, canvas.width - stateRef.current.paddleWidth)
      );
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      stateRef.current.paddleX = Math.max(
        0,
        Math.min(mouseX - stateRef.current.paddleWidth / 2, canvas.width - stateRef.current.paddleWidth)
      );
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mousemove", handleMouseMove);
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
          <span className="text-muted-foreground">Lives: </span>
          <span className="font-bold">{"❤️".repeat(lives)}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-xl border border-border shadow-2xl"
        style={{ touchAction: "none" }}
      />

      <p className="text-[10px] text-muted-foreground mt-3">
        Move finger / mouse to control paddle
      </p>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-3xl font-bold mb-2">
              {stateRef.current.bricks.every((b) => !b.alive) ? "You Win!" : "Game Over"}
            </p>
            <p className="text-lg gradient-text font-bold">{score} pts</p>
          </div>
        </div>
      )}
    </div>
  );
}