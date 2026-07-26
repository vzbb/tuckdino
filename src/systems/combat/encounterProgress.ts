import type { EncounterReward } from "@/src/world/enemies/enemyCatalog";
import { canTrainRank, trainingCost } from "./encounterEngine";

export type EncounterProgress = {
  trailTokens: number;
  defeatedSpawnIds: string[];
  bossBadges: string[];
  victories: number;
};

export const EMPTY_ENCOUNTER_PROGRESS: EncounterProgress = {
  trailTokens: 0,
  defeatedSpawnIds: [],
  bossBadges: [],
  victories: 0,
};

export function awardEncounter(
  progress: EncounterProgress,
  spawnId: string,
  reward: EncounterReward,
): EncounterProgress {
  const firstClear = !progress.defeatedSpawnIds.includes(spawnId);
  return {
    trailTokens: progress.trailTokens + reward.trailTokens,
    defeatedSpawnIds: firstClear ? [...progress.defeatedSpawnIds, spawnId] : progress.defeatedSpawnIds,
    bossBadges: reward.badge && !progress.bossBadges.includes(reward.badge)
      ? [...progress.bossBadges, reward.badge]
      : progress.bossBadges,
    victories: progress.victories + 1,
  };
}

export function buyTrainingRank(
  progress: EncounterProgress,
  currentRank: number,
  chapter: number,
): { progress: EncounterProgress; rank: number } | null {
  if (!canTrainRank(currentRank, progress.trailTokens, chapter)) return null;
  return {
    progress: { ...progress, trailTokens: progress.trailTokens - trainingCost(currentRank) },
    rank: currentRank + 1,
  };
}

export function respawnAvailable(defeatedAt: number | undefined, respawnSeconds: number, now = Date.now()) {
  return defeatedAt === undefined || now - defeatedAt >= respawnSeconds * 1000;
}

