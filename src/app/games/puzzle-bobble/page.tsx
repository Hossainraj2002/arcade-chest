"use client";
import { GameWrapper } from "@/components/games/GameWrapper";
import { PuzzleBobbleGame } from "@/game-engines/puzzle-bobble/PuzzleBobbleGame";

export default function PuzzleBobblePage() {
  return (
    <GameWrapper gameId="puzzle-bobble">
      {(props) => <PuzzleBobbleGame {...props} />}
    </GameWrapper>
  );
}