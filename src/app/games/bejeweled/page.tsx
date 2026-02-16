"use client";
import { GameWrapper } from "@/components/games/GameWrapper";
import { BejeweledGame } from "@/game-engines/bejeweled/BejeweledGame";

export default function BejeweledPage() {
  return (
    <GameWrapper gameId="bejeweled">
      {(props) => <BejeweledGame {...props} />}
    </GameWrapper>
  );
}