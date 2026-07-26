import type { Vec3 } from "@/src/state/useGameStore";
import type { EnemySpawn, EnemySpecies } from "./enemyCatalog";

export type EnemyWorldMode = "idle" | "patrol" | "alert" | "engaged" | "cooldown";

export type EnemyWorldState = {
  mode: EnemyWorldMode;
  position: Vec3;
  patrolPhase: number;
};

function distanceXZ(a: Vec3, b: Vec3) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function initialEnemyWorldState(spawn: EnemySpawn): EnemyWorldState {
  return { mode: "idle", position: { ...spawn.home }, patrolPhase: 0 };
}

export function updateEnemyPatrol(
  current: EnemyWorldState,
  spawn: EnemySpawn,
  species: EnemySpecies,
  player: Vec3,
  elapsedSeconds: number,
): EnemyWorldState {
  const playerDistance = distanceXZ(current.position, player);
  if (current.mode === "engaged" || current.mode === "cooldown") return current;
  if (playerDistance <= species.aggroRadius) return { ...current, mode: "alert" };
  if (current.mode === "alert" && playerDistance <= species.disengageRadius) return current;

  const phase = current.patrolPhase + elapsedSeconds * (0.22 + species.difficulty * 0.025);
  const position = {
    x: spawn.home.x + Math.cos(phase) * spawn.patrolRadius,
    y: spawn.home.y,
    z: spawn.home.z + Math.sin(phase * 0.73) * spawn.patrolRadius,
  };
  return { mode: "patrol", position, patrolPhase: phase };
}

export function canStartEncounter(state: EnemyWorldState, species: EnemySpecies, player: Vec3) {
  return state.mode === "alert" && distanceXZ(state.position, player) <= species.aggroRadius + 1;
}

