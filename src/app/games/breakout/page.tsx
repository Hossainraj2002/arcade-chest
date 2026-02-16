"use client";
import { GameWrapper } from "@/components/games/GameWrapper";
import { BreakoutGame } from "@/game-engines/breakout/BreakoutGame";

export default function BreakoutPage() {
  return (
    <GameWrapper gameId="breakout">
      {(props) => <BreakoutGame {...props} />}
    </GameWrapper>
  );
}