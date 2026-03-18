import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useGameStore, persistGame } from "@/src/state/useGameStore";
import { HUD } from "@/src/ui/HUD";
import { useDayNightSync } from "@/src/systems/time/useDayNightSync";
import { useGeminiSensorLoops } from "@/src/systems/ai/useGeminiSensorLoops";
import { useDinoBrainLoop } from "@/src/systems/ai/useDinoBrainLoop";

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => Promise<void>;
  }
}

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

  useEffect(() => {
    window.render_game_to_text = () => {
      const s = useGameStore.getState();
      return JSON.stringify({
        coords: "x/right, y/up, z/forward",
        scene: s.scene,
        dayPhase: s.dayPhase,
        player: {
          pos: s.playerPos,
          rotation: s.playerRotation,
          pitch: s.playerPitch,
          zoom: s.playerZoom,
          target: s.playerTarget,
        },
        dino: {
          pos: s.dinoPos,
          directive: s.dinoDirective.animation,
          stats: s.dinoStats,
        },
        camp: {
          active: s.campActive,
          pos: s.campPos,
        },
        ui: {
          radialMenuOpen: s.radialMenuOpen,
          cameraEnabled: s.cameraEnabled,
          micEnabled: s.micEnabled,
        },
      });
    };

    window.advanceTime = async (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
      });

    return () => {
      delete window.render_game_to_text;
      delete window.advanceTime;
    };
  }, []);

  return (
    <div id="game-root">
      <GameCanvas />
      <div className="overlay">
        <HUD />
      </div>
    </div>
  );
}
