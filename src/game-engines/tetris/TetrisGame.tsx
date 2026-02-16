// src/game-engines/tetris/TetrisGame.tsx

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { RoundEndRequest } from "@/types";

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE_RATIO = 0.09;

const PIECES = [
  { shape: [[1, 1, 1, 1]], color: "#00D4FF" },
  { shape: [[1, 1], [1, 1]], color: "#FFD93D" },
  { shape: [[0, 1, 0], [1, 1, 1]], color: "#A855F7" },
  { shape: [[1, 0, 0], [1, 1, 1]], color: "#FF6B35" },
  { shape: [[0, 0, 1], [1, 1, 1]], color: "#3B82F6" },
  { shape: [[1, 1, 0], [0, 1, 1]], color: "#22C55E" },
  { shape: [[0, 1, 1], [1, 1, 0]], color: "#EF4444" },
];

interface Props {
  onGameEnd: (summary: RoundEndRequest["runSummary"]) => void;
  isPlaying: boolean;
  nonce: string | null;
}

export function TetrisGame({ onGameEnd, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<(string | null)[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );
  const currentPieceRef = useRef<{
    shape: number[][];
    color: string;
    x: number;
    y: number;
  } | null>(null);
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const gameOverRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const lastDropRef = useRef(Date.now());
  const animFrameRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const getBlockSize = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxW = w * BLOCK_SIZE_RATIO;
    const maxH = (h * 0.75) / ROWS;
    return Math.floor(Math.min(maxW, maxH));
  }, []);

  const spawnPiece = useCallback(() => {
    const piece = PIECES[Math.floor(Math.random() * PIECES.length)];
    const newPiece = {
      shape: piece.shape.map((r) => [...r]),
      color: piece.color,
      x: Math.floor((COLS - piece.shape[0].length) / 2),
      y: 0,
    };

    if (collides(boardRef.current, newPiece)) {
      gameOverRef.current = true;
      setGameOver(true);
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onGameEnd({
        rawScore: scoreRef.current,
        durationSeconds: duration,
        linesCleared: linesRef.current,
        levelReached: levelRef.current,
      });
      return;
    }

    currentPieceRef.current = newPiece;
  }, [onGameEnd]);

  function collides(
    board: (string | null)[][],
    piece: { shape: number[][]; x: number; y: number }
  ): boolean {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const newX = piece.x + c;
          const newY = piece.y + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && board[newY][newX]) return true;
        }
      }
    }
    return false;
  }

  function lockPiece() {
    const piece = currentPieceRef.current;
    if (!piece) return;

    const board = boardRef.current;
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const y = piece.y + r;
          const x = piece.x + c;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            board[y][x] = piece.color;
          }
        }
      }
    }

    // Clear lines
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every((cell) => cell !== null)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        r++;
      }
    }

    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800][cleared] || 800;
      scoreRef.current += points * levelRef.current;
      linesRef.current += cleared;
      levelRef.current = Math.floor(linesRef.current / 10) + 1;
      setScore(scoreRef.current);
      setLines(linesRef.current);
      setLevel(levelRef.current);
    }

    spawnPiece();
  }

  function movePiece(dx: number, dy: number): boolean {
    const piece = currentPieceRef.current;
    if (!piece || gameOverRef.current) return false;

    const moved = { ...piece, x: piece.x + dx, y: piece.y + dy };
    if (!collides(boardRef.current, moved)) {
      currentPieceRef.current = moved;
      return true;
    }

    if (dy > 0) {
      lockPiece();
    }
    return false;
  }

  function rotatePiece() {
    const piece = currentPieceRef.current;
    if (!piece || gameOverRef.current) return;

    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map((row) => row[i]).reverse()
    );
    const test = { ...piece, shape: rotated };

    if (!collides(boardRef.current, test)) {
      currentPieceRef.current = test;
    } else if (!collides(boardRef.current, { ...test, x: test.x - 1 })) {
      currentPieceRef.current = { ...test, x: test.x - 1 };
    } else if (!collides(boardRef.current, { ...test, x: test.x + 1 })) {
      currentPieceRef.current = { ...test, x: test.x + 1 };
    }
  }

  function hardDrop() {
    const piece = currentPieceRef.current;
    if (!piece || gameOverRef.current) return;

    while (movePiece(0, 1)) {
      scoreRef.current += 2;
    }
    setScore(scoreRef.current);
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bs = getBlockSize();
    canvas.width = COLS * bs;
    canvas.height = ROWS * bs;

    // Background
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.strokeRect(c * bs, r * bs, bs, bs);
      }
    }

    // Board
    const board = boardRef.current;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) {
          ctx.fillStyle = board[r][c]!;
          ctx.fillRect(c * bs + 1, r * bs + 1, bs - 2, bs - 2);
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.fillRect(c * bs + 1, r * bs + 1, bs - 2, 3);
        }
      }
    }

    // Current piece
    const piece = currentPieceRef.current;
    if (piece) {
      // Ghost piece
      let ghostY = piece.y;
      while (
        !collides(boardRef.current, { ...piece, y: ghostY + 1 })
      ) {
        ghostY++;
      }
      ctx.fillStyle = piece.color + "30";
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            ctx.fillRect(
              (piece.x + c) * bs + 1,
              (ghostY + r) * bs + 1,
              bs - 2,
              bs - 2
            );
          }
        }
      }

      // Actual piece
      ctx.fillStyle = piece.color;
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            ctx.fillRect(
              (piece.x + c) * bs + 1,
              (piece.y + r) * bs + 1,
              bs - 2,
              bs - 2
            );
            ctx.fillStyle = "rgba(255,255,255,0.2)";
            ctx.fillRect(
              (piece.x + c) * bs + 1,
              (piece.y + r) * bs + 1,
              bs - 2,
              3
            );
            ctx.fillStyle = piece.color;
          }
        }
      }
    }
  }, [getBlockSize]);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    gameOverRef.current = false;
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    startTimeRef.current = Date.now();
    boardRef.current = Array.from({ length: ROWS }, () =>
      Array(COLS).fill(null)
    );
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);

    spawnPiece();

    const loop = () => {
      if (gameOverRef.current) return;

      const now = Date.now();
      const dropInterval = Math.max(100, 1000 - (levelRef.current - 1) * 80);

      if (now - lastDropRef.current > dropInterval) {
        movePiece(0, 1);
        lastDropRef.current = now;
      }

      draw();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, spawnPiece, draw]);

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying) return;

    const handleKey = (e: KeyboardEvent) => {
      if (gameOverRef.current) return;
      switch (e.key) {
        case "ArrowLeft":
          movePiece(-1, 0);
          break;
        case "ArrowRight":
          movePiece(1, 0);
          break;
        case "ArrowDown":
          movePiece(0, 1);
          scoreRef.current += 1;
          setScore(scoreRef.current);
          break;
        case "ArrowUp":
          rotatePiece();
          break;
        case " ":
          hardDrop();
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying]);

  // Touch controls
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (!touchStartRef.current || gameOverRef.current) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < 10 && absDy < 10 && dt < 200) {
        rotatePiece();
      } else if (absDy > 60 && absDy > absDx && dy > 0) {
        hardDrop();
      } else if (absDx > 20 && absDx > absDy) {
        movePiece(dx > 0 ? 1 : -1, 0);
      } else if (dy > 20 && absDy > absDx) {
        movePiece(0, 1);
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }

      touchStartRef.current = null;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background relative">
      {/* HUD */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="glass px-3 py-1.5 rounded-lg">
          <span className="text-muted-foreground">Score: </span>
          <span className="font-bold">{score.toLocaleString()}</span>
        </div>
        <div className="glass px-3 py-1.5 rounded-lg">
          <span className="text-muted-foreground">Lines: </span>
          <span className="font-bold">{lines}</span>
        </div>
        <div className="glass px-3 py-1.5 rounded-lg">
          <span className="text-muted-foreground">Lvl: </span>
          <span className="font-bold">{level}</span>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="rounded-xl border border-border shadow-2xl"
        style={{ touchAction: "none" }}
      />

      {/* Touch hint */}
      <p className="text-[10px] text-muted-foreground mt-3">
        Tap = Rotate • Swipe ← → = Move • Swipe ↓ = Drop
      </p>

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-3xl font-bold mb-2">Game Over</p>
            <p className="text-lg gradient-text font-bold">
              {score.toLocaleString()} pts
            </p>
          </div>
        </div>
      )}
    </div>
  );
}