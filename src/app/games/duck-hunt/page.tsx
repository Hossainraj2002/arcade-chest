// src/app/games/duck-hunt/page.tsx

"use client";

import { GameWrapper } from "@/components/games/GameWrapper";
import { DuckHuntGame } from "@/game-engines/duck-hunt/DuckHuntGame";

export default function DuckHuntPage() {
  return (
    <GameWrapper gameId="duck-hunt">
      {({ onGameEnd, isPlaying, nonce }) => (
        <DuckHuntGame
          onGameEnd={onGameEnd}
          isPlaying={isPlaying}
          nonce={nonce}
        />
      )}
    </GameWrapper>
  );
}