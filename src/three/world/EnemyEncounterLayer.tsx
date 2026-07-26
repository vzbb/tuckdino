"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { useGameStore } from "@/src/state/useGameStore";
import { respawnAvailable } from "@/src/systems/combat/encounterProgress";
import { EnemyWorld, type VisibleEnemy } from "@/src/three/world/EnemyWorld";
import { ENEMY_SPAWNS, getEnemySpecies } from "@/src/world/enemies/enemyCatalog";
import {
  initialEnemyWorldState,
  updateEnemyPatrol,
  type EnemyWorldState,
} from "@/src/world/enemies/patrol";

function unlocked(unlock: "start" | "trained" | "crest", stars: number, crest: boolean) {
  if (unlock === "start") return true;
  if (unlock === "trained") return stars >= 3;
  return crest;
}

export function EnemyEncounterLayer() {
  const startEncounter = useGameStore((state) => state.startWorldEncounter);
  const trainingStars = useGameStore((state) => state.adventure.trainingStars);
  const crest = useGameStore((state) => state.progression.meadowCrestEarned);
  const defeatedAt = useGameStore((state) => state.progression.defeatedEnemyAt);
  const activeSpawnId = useGameStore((state) => state.activeEnemySpawnId);
  const patrols = useRef<Record<string, EnemyWorldState>>(
    Object.fromEntries(ENEMY_SPAWNS.map((spawn) => [spawn.id, initialEnemyWorldState(spawn)]))
  );
  const lastPublish = useRef(0);
  const [visible, setVisible] = useState<VisibleEnemy[]>([]);

  useFrame((state, delta) => {
    const now = Date.now();
    const player = useGameStore.getState().playerPos;
    const next: VisibleEnemy[] = [];

    for (const spawn of ENEMY_SPAWNS) {
      if (!unlocked(spawn.unlock, trainingStars, crest)) continue;
      const species = getEnemySpecies(spawn.speciesId);
      const defeated = species.temperament === "boss"
        ? defeatedAt[spawn.id] !== undefined
        : !respawnAvailable(defeatedAt[spawn.id], spawn.respawnSeconds, now);
      const current = patrols.current[spawn.id] ?? initialEnemyWorldState(spawn);
      const updated = updateEnemyPatrol(current, spawn, species, player, delta);
      patrols.current[spawn.id] = activeSpawnId === spawn.id
        ? { ...updated, mode: "engaged" }
        : updated;
      next.push({
        spawn,
        species,
        position: patrols.current[spawn.id].position,
        mode: patrols.current[spawn.id].mode,
        defeated,
      });
    }

    if (state.clock.elapsedTime - lastPublish.current > .12) {
      lastPublish.current = state.clock.elapsedTime;
      setVisible(next);
    }
  });

  return <EnemyWorld enemies={visible} onChallenge={startEncounter} />;
}
