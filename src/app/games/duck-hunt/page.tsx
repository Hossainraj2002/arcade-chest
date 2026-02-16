"use client";
import { GameWrapper } from "@/components/games/GameWrapper";
import { DuckHuntGame } from "@/game-engines/duck-hunt/DuckHuntGame";

export default function DuckHuntPage() {
  return (
    <GameWrapper gameId="duck-hunt">
      {(props) => <DuckHuntGame {...props} />}
    </GameWrapper>
  );
}