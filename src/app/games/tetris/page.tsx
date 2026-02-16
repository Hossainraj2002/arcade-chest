"use client";
import { GameWrapper } from "@/components/games/GameWrapper";
import { TetrisGame } from "@/game-engines/tetris/TetrisGame";

export default function TetrisPage() {
  return (
    <GameWrapper gameId="tetris">
      {(props) => <TetrisGame {...props} />}
    </GameWrapper>
  );
}