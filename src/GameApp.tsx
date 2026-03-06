import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useGameStore, persistGame } from "@/src/state/useGameStore";
import { HUD } from "@/src/ui/HUD";
import { useDayNightSync } from "@/src/systems/time/useDayNightSync";
import { useGeminiSensorLoops } from "@/src/systems/ai/useGeminiSensorLoops";
import { useDinoBrainLoop } from "@/src/systems/ai/useDinoBrainLoop";

// R3F Canvas must be client-side. We already are in a client page, but
// dynamic import avoids any SSR edge cases.
const GameCanvas = dynamic(() => import("@/src/three/GameCanvas").then((m) => m.GameCanvas), {
  ssr: false,
});

export function GameApp() {
  const hydrateFromStorage = useGameStore((s) => s.hydrateFromStorage);

  // Hydrate once
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // Persist progression occasionally
  useEffect(() => {
    const id = window.setInterval(() => persistGame(), 2500);
    return () => window.clearInterval(id);
  }, []);

  // Time sync + lighting
  useDayNightSync();

  // Camera/mic → Gemini → store(face/speech)
  useGeminiSensorLoops();

  // Dino directive brain loop
  useDinoBrainLoop();

  return (
    <div id="game-root">
      <GameCanvas />
      <div className="overlay">
        <HUD />
      </div>
    </div>
  );
}
