// src/stores/useUserStore.ts

import { create } from "zustand";
import type {
  UserProfile,
  UserBalance,
  StreakInfo,
} from "@/types";

interface UserState {
  profile: UserProfile | null;
  balance: UserBalance | null;
  streak: StreakInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setProfile: (profile: UserProfile) => void;
  setBalance: (balance: UserBalance) => void;
  setStreak: (streak: StreakInfo) => void;
  setLoading: (loading: boolean) => void;
  setAuthenticated: (auth: boolean) => void;
  decrementToken: () => void;
  addPoints: (points: number) => void;
  addChest: (type: "free" | "premium") => void;
  removeChest: (type: "free" | "premium") => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  balance: null,
  streak: null,
  isLoading: true,
  isAuthenticated: false,

  setProfile: (profile) => set({ profile }),
  setBalance: (balance) => set({ balance }),
  setStreak: (streak) => set({ streak }),
  setLoading: (loading) => set({ isLoading: loading }),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),

  decrementToken: () =>
    set((state) => ({
      balance: state.balance
        ? {
            ...state.balance,
            accessTokensOffchain: Math.max(
              0,
              state.balance.accessTokensOffchain - 1
            ),
          }
        : null,
    })),

  addPoints: (points) =>
    set((state) => ({
      balance: state.balance
        ? {
            ...state.balance,
            pointsTotal: state.balance.pointsTotal + points,
            pointsSeason: state.balance.pointsSeason + points,
          }
        : null,
    })),

  addChest: (type) =>
    set((state) => ({
      balance: state.balance
        ? {
            ...state.balance,
            chestFreePending:
              type === "free"
                ? state.balance.chestFreePending + 1
                : state.balance.chestFreePending,
            chestPremiumPending:
              type === "premium"
                ? state.balance.chestPremiumPending + 1
                : state.balance.chestPremiumPending,
          }
        : null,
    })),

  removeChest: (type) =>
    set((state) => ({
      balance: state.balance
        ? {
            ...state.balance,
            chestFreePending:
              type === "free"
                ? Math.max(0, state.balance.chestFreePending - 1)
                : state.balance.chestFreePending,
            chestPremiumPending:
              type === "premium"
                ? Math.max(0, state.balance.chestPremiumPending - 1)
                : state.balance.chestPremiumPending,
          }
        : null,
    })),

  reset: () =>
    set({
      profile: null,
      balance: null,
      streak: null,
      isLoading: true,
      isAuthenticated: false,
    }),
}));