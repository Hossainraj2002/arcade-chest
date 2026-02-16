// src/stores/useGameStore.ts

import { create } from "zustand";
import type { GameId } from "@/lib/constants";

interface GameState {
  currentGame: GameId | null;
  roundId: string | null;
  nonce: string | null;
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  startTime: number | null;

  // Post-game
  showPostGame: boolean;
  lastResult: {
    validatedScore: number;
    pointsAwarded: number;
    chestGranted: boolean;
  } | null;

  setCurrentGame: (game: GameId | null) => void;
  startRound: (roundId: string, nonce: string, gameId: GameId) => void;
  updateScore: (score: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endRound: (result: {
    validatedScore: number;
    pointsAwarded: number;
    chestGranted: boolean;
  }) => void;
  closePostGame: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentGame: null,
  roundId: null,
  nonce: null,
  isPlaying: false,
  isPaused: false,
  score: 0,
  startTime: null,
  showPostGame: false,
  lastResult: null,

  setCurrentGame: (game) => set({ currentGame: game }),

  startRound: (roundId, nonce, gameId) =>
    set({
      roundId,
      nonce,
      currentGame: gameId,
      isPlaying: true,
      isPaused: false,
      score: 0,
      startTime: Date.now(),
      showPostGame: false,
      lastResult: null,
    }),

  updateScore: (score) => set({ score }),

  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),

  endRound: (result) =>
    set({
      isPlaying: false,
      isPaused: false,
      showPostGame: true,
      lastResult: result,
    }),

  closePostGame: () =>
    set({
      showPostGame: false,
      lastResult: null,
      currentGame: null,
      roundId: null,
      nonce: null,
      score: 0,
      startTime: null,
    }),

  reset: () =>
    set({
      currentGame: null,
      roundId: null,
      nonce: null,
      isPlaying: false,
      isPaused: false,
      score: 0,
      startTime: null,
      showPostGame: false,
      lastResult: null,
    }),
}));