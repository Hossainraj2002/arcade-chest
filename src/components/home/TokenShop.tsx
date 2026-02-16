// src/components/home/TokenShop.tsx

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useUserStore } from "@/stores/useUserStore";
import { useAppTransaction } from "@/hooks/useTransaction";
import { useUser } from "@/hooks/useUser";
import { buildBuyTokensTx } from "@/lib/transactions";
import { ECONOMY } from "@/lib/constants";
import { Coins, ShoppingBag, Check, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";

export function TokenShop() {
  const balance = useUserStore((s) => s.balance);
  const { address } = useAccount();
  const { refreshUser } = useUser(address);
  const { sendTx, isSending, isConfirming, isConfirmed, error } =
    useAppTransaction();
  const [showModal, setShowModal] = useState(false);

  const handleBuy = async () => {
    const tx = buildBuyTokensTx(ECONOMY.TOKEN_PURCHASE_PRICE_USDC);
    const hash = await sendTx(tx);

    if (hash) {
      // Tell backend to credit tokens
      await fetch("/api/tokens/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          txHash: hash,
          amount: ECONOMY.TOKEN_PURCHASE_AMOUNT,
        }),
      });

      // Refresh user data
      await refreshUser();
    }
  };

  return (
    <>
      <Card variant="glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Coins className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {balance?.accessTokensOffchain || 0} Tokens
              </p>
              <p className="text-xs text-muted-foreground">
                1 token = 1 game play
              </p>
            </div>
          </div>

          <Button size="sm" variant="glass" onClick={() => setShowModal(true)}>
            <ShoppingBag className="h-3.5 w-3.5" />
            Buy
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="🪙 Buy Access Tokens"
      >
        <div className="space-y-4">
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="h-6 w-6 text-amber-400" />
              <span className="text-2xl font-bold">
                {ECONOMY.TOKEN_PURCHASE_AMOUNT}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Access Tokens</p>
            <p className="text-lg font-bold mt-2">
              {ECONOMY.TOKEN_PURCHASE_PRICE_USDC} USDC
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 glass-card p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {isConfirmed ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 py-3">
              <Check className="h-5 w-5" />
              <span className="font-bold">Tokens Added!</span>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={handleBuy}
              loading={isSending || isConfirming}
            >
              {isSending
                ? "Confirm in Wallet..."
                : isConfirming
                ? "Processing..."
                : `Pay ${ECONOMY.TOKEN_PURCHASE_PRICE_USDC} USDC`}
            </Button>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Gas fees sponsored by Base • Powered by Smart Wallet
          </p>
        </div>
      </Modal>
    </>
  );
}