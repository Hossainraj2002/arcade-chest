// src/hooks/useUser.ts

import { useCallback, useEffect, useRef } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useFrame } from "@/components/providers/FrameProvider";

type UseUserOptions = {
  /**
   * Default: false
   * Only AppShell should set autoInit: true.
   */
  autoInit?: boolean;
};

export function useUser(wallet: string | undefined, options?: UseUserOptions) {
  const autoInit = options?.autoInit ?? false;

  const {
    setProfile,
    setBalance,
    setStreak,
    setLoading,
    setAuthenticated,
  } = useUserStore();

  const { context } = useFrame();

  // Prevent repeated init storms (even if effects re-run)
  const initInFlightRef = useRef(false);
  const lastInitAtRef = useRef(0);

  const initUser = useCallback(
    async (walletAddr: string, referralCode?: string, fid?: number) => {
      const now = Date.now();

      // hard throttle: max 1 init per 5 seconds
      if (now - lastInitAtRef.current < 5000) return;
      if (initInFlightRef.current) return;

      initInFlightRef.current = true;
      lastInitAtRef.current = now;

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

        if (!res.ok) {
          const err = await res.text().catch(() => "");
          console.error("User init failed:", res.status, err);
          setAuthenticated(false);
          return;
        }

        const data = await res.json();

        setProfile(data.profile);
        setBalance(data.balance);
        setStreak(data.streak);
        setAuthenticated(true);
      } catch (error) {
        console.error("Failed to init user:", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
        initInFlightRef.current = false;
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
    if (walletAddr) await initUser(walletAddr);
  }, [initUser]);

  useEffect(() => {
    if (!autoInit) return;
    if (!wallet) return;

    let ref: string | undefined;
    try {
      const params = new URLSearchParams(window.location.search);
      ref = params.get("ref") || undefined;
    } catch {}

    const fid = context?.user?.fid;
    initUser(wallet, ref, fid);
  }, [wallet, autoInit, context, initUser]);

  return { initUser, checkin, refreshUser };
}
