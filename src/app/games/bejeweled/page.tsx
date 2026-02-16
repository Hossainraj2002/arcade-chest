// src/app/games/bejeweled/page.tsx

"use client";

import { GameWrapper } from "@/components/games/GameWrapper";
import { BejeweledGame } from "@/game-engines/bejeweled/BejeweledGame";

export default function BejeweledPage() {
  return (
    <GameWrapper gameId="bejeweled">
      {({ onGameEnd, isPlaying, nonce }) => (
        <BejeweledGame
          onGameEnd={onGameEnd}
          isPlaying={isPlaying}
          nonce={nonce}
        />
      )}
    </GameWrapper>
  );
}