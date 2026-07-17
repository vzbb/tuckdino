"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useGameStore } from "@/src/state/useGameStore";
import { EggSelectionScene } from "@/src/three/scenes/EggSelectionScene";
import { WorldScene } from "@/src/three/scenes/WorldScene";
import { LoadingFallback } from "@/src/ui/LoadingFallback";

export function GameCanvas() {
  const scene = useGameStore((s) => s.scene);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 7, 12], fov: 55 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={<LoadingFallback />}>
        {scene === "egg" || scene === "hatching" ? <EggSelectionScene /> : <WorldScene />}
      </Suspense>
    </Canvas>
  );
}
