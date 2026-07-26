"use client";

import { useEffect } from "react";
import { useGameStore } from "@/src/state/useGameStore";
import { WORLD_ZONES, zoneIsUnlocked } from "@/src/world/worldZones";

export function useWorldDiscovery() {
  const scene = useGameStore((s) => s.scene);
  const playerPos = useGameStore((s) => s.playerPos);
  const trainingStars = useGameStore((s) => s.adventure.trainingStars);
  const meadowCrestEarned = useGameStore((s) => s.progression.meadowCrestEarned);
  const discoverZone = useGameStore((s) => s.discoverZone);

  useEffect(() => {
    if (scene !== "world") return;
    for (const zone of WORLD_ZONES) {
      if (!zoneIsUnlocked(zone, trainingStars, meadowCrestEarned)) continue;
      const distance = Math.hypot(playerPos.x - zone.position.x, playerPos.z - zone.position.z);
      if (distance <= zone.radius) discoverZone(zone.id);
    }
  }, [discoverZone, meadowCrestEarned, playerPos.x, playerPos.z, scene, trainingStars]);
}
