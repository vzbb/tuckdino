"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/src/state/useGameStore";
import { RadialMenu } from "@/src/ui/RadialMenu";

export function HUD() {
  const scene = useGameStore((s) => s.scene);
  const radialOpen = useGameStore((s) => s.radialMenuOpen);
  const recentEvents = useGameStore((s) => s.recentEvents);
  const lastEvent = recentEvents[recentEvents.length - 1];
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    setShowHint(true);
    const timer = window.setTimeout(() => setShowHint(false), 8000);
    return () => window.clearTimeout(timer);
  }, [scene]);

  return (
    <>
      {scene === "world" && lastEvent?.type === "collectible_found" && (
        <div className="discovery-toast" key={`${lastEvent.id}-${lastEvent.t}`}>
          <span>✨</span><strong>{lastEvent.id.replaceAll("_", " ")}</strong>
        </div>
      )}

      {showHint && scene !== "egg" && (
        <div className="play-hint">
          {scene === "hatching" ? "Your new friend is hatching!" : "Tap the path to explore • Tap sparkly things!"}
        </div>
      )}

      {radialOpen && <RadialMenu />}
    </>
  );
}
