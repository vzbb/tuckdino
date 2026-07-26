import type { Vec3 } from "@/src/state/useGameStore";

export type WorldZone = {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  icon: string;
  color: string;
  position: Vec3;
  radius: number;
  unlock: "start" | "trained" | "crest";
};

export const WORLD_ZONES: WorldZone[] = [
  { id: "sunpatch_ranch", name: "Sunpatch Ranch", shortName: "Ranch", subtitle: "Home, care, and campfire", icon: "🏕️", color: "#f2b84b", position: { x: 4.2, y: 0, z: 8.4 }, radius: 10, unlock: "start" },
  { id: "training_ring", name: "Pip's Training Ring", shortName: "Training", subtitle: "Build power, agility, and heart", icon: "⭐", color: "#70bf72", position: { x: -8, y: 0, z: 8 }, radius: 6, unlock: "start" },
  { id: "whispercap_grove", name: "Whispercap Grove", shortName: "Mushrooms", subtitle: "A tiny forest that sings", icon: "🍄", color: "#c786dc", position: { x: -12, y: 0, z: 2 }, radius: 7, unlock: "start" },
  { id: "prism_glen", name: "Prism Glen", shortName: "Crystals", subtitle: "Rainbow stones hum here", icon: "💎", color: "#68cce8", position: { x: 13, y: 0, z: -4 }, radius: 7, unlock: "start" },
  { id: "silverrun_stream", name: "Silverrun Stream", shortName: "Stream", subtitle: "Splash across shining stones", icon: "💧", color: "#4faedd", position: { x: -5, y: 0, z: -12 }, radius: 8, unlock: "start" },
  { id: "mossback_gate", name: "Mossback Meadow Gate", shortName: "Arena", subtitle: "Friendly crest challenges", icon: "🏅", color: "#df8354", position: { x: 0, y: 0, z: -24 }, radius: 8, unlock: "trained" },
  { id: "fernwood", name: "Fernwood Wilds", shortName: "Fernwood", subtitle: "Ancient trails beyond the crest", icon: "🌿", color: "#3f9369", position: { x: 18, y: 0, z: 16 }, radius: 9, unlock: "crest" },
];

export function zoneIsUnlocked(zone: WorldZone, trainingStars: number, meadowCrestEarned: boolean) {
  if (zone.unlock === "start") return true;
  if (zone.unlock === "trained") return trainingStars >= 3;
  return meadowCrestEarned;
}

export function mapPosition(position: Vec3) {
  return {
    left: `${((position.x + 30) / 60) * 100}%`,
    top: `${((26 - position.z) / 56) * 100}%`,
  };
}
