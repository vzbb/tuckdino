import type { Vec3 } from "@/src/state/useGameStore";

export type EnemyTemperament = "wary" | "territorial" | "boss";
export type EnemyMoveKind = "strike" | "guard" | "trick";
export type EncounterReward = {
  trailTokens: number;
  companionXp: number;
  badge?: string;
};

export type EnemyMove = {
  id: string;
  name: string;
  kind: EnemyMoveKind;
  power: number;
  tell: string;
};

export type EnemySpecies = {
  id: string;
  name: string;
  title: string;
  temperament: EnemyTemperament;
  color: string;
  accent: string;
  maxHp: number;
  difficulty: number;
  aggroRadius: number;
  disengageRadius: number;
  moves: EnemyMove[];
  reward: EncounterReward;
};

export type EnemySpawn = {
  id: string;
  speciesId: EnemySpecies["id"];
  home: Vec3;
  patrolRadius: number;
  unlock: "start" | "trained" | "crest";
  respawnSeconds: number;
};

export const ENEMY_SPECIES: Record<string, EnemySpecies> = {
  bramble_boar: {
    id: "bramble_boar",
    name: "Bramble Boar",
    title: "Grumpy Trail Blocker",
    temperament: "territorial",
    color: "#75543c",
    accent: "#b7d66a",
    maxHp: 9,
    difficulty: 1,
    aggroRadius: 5,
    disengageRadius: 11,
    moves: [
      { id: "snout_shove", name: "Snout Shove", kind: "strike", power: 2, tell: "scrapes one hoof" },
      { id: "bristle_guard", name: "Bristle Guard", kind: "guard", power: 2, tell: "puffs every bristle" },
    ],
    reward: { trailTokens: 2, companionXp: 3 },
  },
  gloomwing: {
    id: "gloomwing",
    name: "Gloomwing",
    title: "Mischief Moth",
    temperament: "wary",
    color: "#594d7a",
    accent: "#e6d36f",
    maxHp: 11,
    difficulty: 2,
    aggroRadius: 6,
    disengageRadius: 13,
    moves: [
      { id: "dust_puff", name: "Dizzy Dust", kind: "trick", power: 2, tell: "wings glow gold" },
      { id: "wing_bop", name: "Wing Bop", kind: "strike", power: 3, tell: "folds its wings tight" },
    ],
    reward: { trailTokens: 3, companionXp: 4 },
  },
  thornjaw: {
    id: "thornjaw",
    name: "Thornjaw",
    title: "Fernwood Stalker",
    temperament: "territorial",
    color: "#315b43",
    accent: "#e78b54",
    maxHp: 15,
    difficulty: 3,
    aggroRadius: 7,
    disengageRadius: 15,
    moves: [
      { id: "vine_snap", name: "Vine Snap", kind: "strike", power: 4, tell: "tail vines pull backward" },
      { id: "leaf_feint", name: "Leaf Feint", kind: "trick", power: 3, tell: "vanishes behind a leaf cloud" },
      { id: "bark_hide", name: "Bark Hide", kind: "guard", power: 3, tell: "plants all four feet" },
    ],
    reward: { trailTokens: 5, companionXp: 6 },
  },
  elder_rootshell: {
    id: "elder_rootshell",
    name: "Elder Rootshell",
    title: "Guardian of the Old Grove",
    temperament: "boss",
    color: "#3f664a",
    accent: "#d7b45f",
    maxHp: 32,
    difficulty: 5,
    aggroRadius: 9,
    disengageRadius: 18,
    moves: [
      { id: "root_rumble", name: "Root Rumble", kind: "strike", power: 5, tell: "shell roots begin to drum" },
      { id: "ancient_shell", name: "Ancient Shell", kind: "guard", power: 5, tell: "mossy shell seals shut" },
      { id: "seed_scatter", name: "Seed Scatter", kind: "trick", power: 4, tell: "shakes a crown of seed pods" },
    ],
    reward: { trailTokens: 14, companionXp: 18, badge: "Rootshell Friend" },
  },
  comet_raptor: {
    id: "comet_raptor",
    name: "Comet Raptor",
    title: "The Silverrun Flash",
    temperament: "boss",
    color: "#315d79",
    accent: "#8ce3ef",
    maxHp: 38,
    difficulty: 6,
    aggroRadius: 10,
    disengageRadius: 20,
    moves: [
      { id: "comet_dash", name: "Comet Dash", kind: "strike", power: 6, tell: "silver feet sparkle" },
      { id: "mirror_step", name: "Mirror Step", kind: "trick", power: 5, tell: "three watery reflections appear" },
      { id: "crescent_guard", name: "Crescent Guard", kind: "guard", power: 5, tell: "curls its glowing tail" },
    ],
    reward: { trailTokens: 18, companionXp: 22, badge: "Silverrun Star" },
  },
};

export const ENEMY_SPAWNS: EnemySpawn[] = [
  { id: "boar_whispercap", speciesId: "bramble_boar", home: { x: -17, y: 0, z: 3 }, patrolRadius: 3, unlock: "start", respawnSeconds: 90 },
  { id: "boar_silverrun", speciesId: "bramble_boar", home: { x: -11, y: 0, z: -14 }, patrolRadius: 4, unlock: "trained", respawnSeconds: 90 },
  { id: "moth_prism", speciesId: "gloomwing", home: { x: 17, y: 1.6, z: -7 }, patrolRadius: 5, unlock: "trained", respawnSeconds: 120 },
  { id: "thornjaw_fern_1", speciesId: "thornjaw", home: { x: 23, y: 0, z: 17 }, patrolRadius: 5, unlock: "crest", respawnSeconds: 150 },
  { id: "thornjaw_fern_2", speciesId: "thornjaw", home: { x: 15, y: 0, z: 24 }, patrolRadius: 4, unlock: "crest", respawnSeconds: 150 },
  { id: "boss_rootshell", speciesId: "elder_rootshell", home: { x: 28, y: 0, z: 27 }, patrolRadius: 1, unlock: "crest", respawnSeconds: 900 },
  { id: "boss_comet", speciesId: "comet_raptor", home: { x: -19, y: 0, z: -23 }, patrolRadius: 4, unlock: "crest", respawnSeconds: 900 },
];

export function getEnemySpecies(speciesId: string) {
  const species = ENEMY_SPECIES[speciesId];
  if (!species) throw new Error(`Unknown enemy species: ${speciesId}`);
  return species;
}

