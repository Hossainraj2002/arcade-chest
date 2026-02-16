// src/hooks/useUser.ts

import { useCallback, useEffect, useRef } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useFrame } from "@/components/providers/FrameProvider";

export function useUser(wallet: string | undefined) {
  const {
    setProfile,
    setBalance,
    setStreak,
    setLoading,
    setAuthenticated,
    isLoading,
  } = useUserStore();
  const initRef = useRef(false);
  const { context } = useFrame();

  const initUser = useCallback(
    async (walletAddr: string, referralCode?: string, fid?: number) => {
      setLoading(true);
      try {
        const res = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: walletAddr,
            referralCode,
            fid,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setProfile(data.profile);
          setBalance(data.balance);
          setStreak(data.streak);
          setAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to init user:", error);
      } finally {
        setLoading(false);
      }
    },
    [setProfile, setBalance, setStreak, setLoading, setAuthenticated]
  );

  const checkin = useCallback(async (): Promise<boolean> => {
    const walletAddr = useUserStore.getState().profile?.wallet;
    if (!walletAddr) return false;

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddr }),
      });

      if (res.ok) {
        await initUser(walletAddr);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, [initUser]);

  const refreshUser = useCallback(async () => {
    const walletAddr = useUserStore.getState().profile?.wallet;
    if (walletAddr) {
      await initUser(walletAddr);
    }
  }, [initUser]);

  useEffect(() => {
    if (wallet && !initRef.current) {
      initRef.current = true;

      // Check for referral code in URL
      let ref: string | undefined;
      try {
        const params = new URLSearchParams(window.location.search);
        ref = params.get("ref") || undefined;
      } catch {
        // SSR safe
      }

      // Get FID from frame context
      const fid = context?.user?.fid;

      initUser(wallet, ref, fid);
    }

    if (!wallet) {
      initRef.current = false;
    }
  }, [wallet, initUser, context]);

  return { initUser, checkin, refreshUser, isLoading };
}