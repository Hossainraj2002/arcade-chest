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
import { Coins, ShoppingBag } from "lucide-react";
import { useAccount } from "wagmi";

export function TokenShop() {
  const balance = useUserStore((s) => s.balance);
  const { address } = useAccount();

  // IMPORTANT: do NOT auto-init here, AppShell already does it.
  const { refreshUser } = useUser(address, { autoInit: false });

  const { sendTx, isSending } = useAppTransaction();
  const [showModal, setShowModal] = useState(false);

  const handleBuy = async () => {
    const tx = buildBuyTokensTx(ECONOMY.TOKEN_PURCHASE_PRICE_USDC);
    const hash = await sendTx(tx);

    if (hash) {
      await fetch("/api/tokens/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          txHash: hash,
          amount: ECONOMY.TOKEN_PURCHASE_AMOUNT,
        }),
      });

      await refreshUser();
      setShowModal(false);
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
              <p className="text-xs text-muted-foreground">1 token = 1 game play</p>
            </div>
          </div>

          <Button size="sm" variant="glass" onClick={() => setShowModal(true)}>
            <ShoppingBag className="h-3.5 w-3.5" />
            Buy
          </Button>
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="🪙 Buy Access Tokens">
        <div className="space-y-4">
          <div className="glass-card p-4 text-center">
            <p className="text-sm font-bold">
              {ECONOMY.TOKEN_PURCHASE_AMOUNT} Tokens
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Costs {ECONOMY.TOKEN_PURCHASE_PRICE_USDC} USDC
            </p>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={handleBuy}
            loading={isSending}
          >
            Confirm Purchase
          </Button>

          <p className="text-[11px] text-muted-foreground text-center">
            You’ll sign a transaction in your wallet.
          </p>
        </div>
      </Modal>
    </>
  );
}
