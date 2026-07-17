import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useGameStore, persistGame } from "@/src/state/useGameStore";
import { HUD } from "@/src/ui/HUD";
import { useDayNightSync } from "@/src/systems/time/useDayNightSync";

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
  const scene = useGameStore((s) => s.scene);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const loadGame = useGameStore((s) => s.loadGame);
  const [saveChosen, setSaveChosen] = useState(false);
  const [slotInfo, setSlotInfo] = useState<Array<{ slot: number; exists: boolean; stage: number }>>([]);
  const [introBeat, setIntroBeat] = useState(0);

  useEffect(() => {
    setSlotInfo([1, 2, 3].map((slot) => {
      try {
        const raw = localStorage.getItem(`tucker_dino_save_${slot}`);
        const saved = raw ? JSON.parse(raw) : null;
        return { slot, exists: !!saved, stage: saved?.dinoStats?.growthStage ?? 1 };
      } catch { return { slot, exists: false, stage: 1 }; }
    }));
  }, []);

  useEffect(() => {
    if (scene !== "egg" || !saveChosen) return;
    setIntroBeat(0);
    const first = window.setTimeout(() => setIntroBeat(1), 650);
    const second = window.setTimeout(() => setIntroBeat(2), 2100);
    return () => { window.clearTimeout(first); window.clearTimeout(second); };
  }, [scene, saveChosen]);

  // Persist progression occasionally
  useEffect(() => {
    const id = window.setInterval(() => persistGame(), 2500);
    return () => window.clearInterval(id);
  }, []);

  // Time sync + lighting
  useDayNightSync();

  // Voice, camera and cloud-brain loops are intentionally paused while the
  // tactile world and companion play loop are being developed.

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
      {(scene === "egg" || scene === "hatching") && <div className="egg-backdrop" />}
      <GameCanvas />
      <div className="overlay">
        {saveChosen && <HUD />}
        {saveChosen && scene === "egg" && (
          <div className="story-dialogue">
            <span className="story-speaker">TUCKER&apos;S ADVENTURE</span>
            <strong>{introBeat < 1 ? "..." : introBeat < 2 ? "Whoa! Are these... dinosaur eggs?!" : "Which one do you want?"}</strong>
          </div>
        )}
        {!saveChosen && (
          <div className="save-screen">
            <div className="save-card">
              <div className="save-title"><span>🦕</span><div><small>WELCOME TO</small><strong>Tucker&apos;s Dino Day</strong></div></div>
              <p>Pick an adventure!</p>
              <div className="save-slots">
                {slotInfo.map((info, index) => (
                  <button key={info.slot} className={`save-slot slot-${index + 1}`} onClick={() => {
                    if (info.exists) loadGame(info.slot); else startNewGame(info.slot);
                    persistGame();
                    setSaveChosen(true);
                  }}>
                    <span className="slot-egg">{info.exists ? "🦕" : "🥚"}</span>
                    <span><strong>{info.exists ? `Dino Friend ${info.slot}` : "New Egg"}</strong><small>{info.exists ? `Growing stage ${info.stage}` : "Start a new adventure"}</small></span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
