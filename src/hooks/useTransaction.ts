// src/hooks/useTransaction.ts

import { useState, useCallback } from "react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

export function useAppTransaction() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);

  const { sendTransactionAsync, isPending: isSending } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const sendTx = useCallback(
    async (tx: {
      to: `0x${string}`;
      data: `0x${string}`;
      value: bigint;
    }): Promise<`0x${string}` | null> => {
      setError(null);
      setTxHash(undefined);

      try {
        const hash = await sendTransactionAsync({
          to: tx.to,
          data: tx.data,
          value: tx.value,
        });

        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const message =
          err?.shortMessage || err?.message || "Transaction failed";
        setError(message);
        return null;
      }
    },
    [sendTransactionAsync]
  );

  return {
    sendTx,
    txHash,
    isSending,
    isConfirming,
    isConfirmed,
    error,
  };
}