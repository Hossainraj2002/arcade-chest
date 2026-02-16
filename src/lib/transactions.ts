// src/lib/transactions.ts

import { encodeFunctionData, parseUnits } from "viem";
import { CONTRACTS, TREASURY_WALLET } from "./constants";

const USDC_DECIMALS = 6;

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function buildUsdcTransferTx(usdcAmount: number) {
  const amount = parseUnits(usdcAmount.toString(), USDC_DECIMALS);

  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [TREASURY_WALLET, amount],
  });

  return {
    to: CONTRACTS.USDC_BASE,
    data,
    value: BigInt(0),
  };
}

export const buildBuyTokensTx = (usdcAmount: number) =>
  buildUsdcTransferTx(usdcAmount);

export const buildPremiumChestTx = (usdcAmount: number) =>
  buildUsdcTransferTx(usdcAmount);

export const buildStreakRestoreTx = (usdcAmount: number) =>
  buildUsdcTransferTx(usdcAmount);