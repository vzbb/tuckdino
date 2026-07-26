/**
 * Runtime-ready data for Sunpatch Valley's first playable story arc.
 *
 * This file deliberately describes only Chapter 1.  Later chapters can use the
 * same schema once their routes, encounters, and rewards exist in the world.
 */

export type StoryVec3 = { x: number; y: number; z: number };

export type StoryNpcId = "pip" | "mossback" | "juniper" | "luma" | "elder_rootshell";
export type StoryLocationId =
  | "sunpatch_ranch"
  | "sunpatch_fire"
  | "training_ring"
  | "mossback_gate"
  | "whispercap_grove"
  | "whispercap_mushrooms"
  | "whispercap_bramble_boar"
  | "whispercap_grove_heart";
export type StoryQuestId =
  | "meet_pip_at_ring"
  | "three_kinds_of_brave"
  | "mossbacks_listening_test"
  | "bring_crest_home"
  | "humming_grove"
  | "rootshells_quiet"
  | "brighter_map";
export type StoryFlag =
  | "introPipMet"
  | "zone_training_ring_discovered"
  | "trainingTutorialSeen"
  | "mossbackIntroSeen"
  | "meadowCrestEarned"
  | "meadowCrestCelebrated"
  | "whispercapLandmarkFound"
  | "boarEncounterSeen"
  | "elderRootshellResolved"
  | "groveLanternRestored"
  | "groveLanternCelebrated"
  | "chapter1Complete";

export type StoryRequirement =
  | { type: "flag"; flag: StoryFlag; value?: boolean }
  | { type: "trainingStars"; atLeast: number }
  | { type: "arenaWins"; atLeast: number }
  | { type: "zoneDiscovered"; zoneId: "training_ring" | "whispercap_grove" }
  | { type: "collectible"; itemId: string }
  | { type: "encounterResolved"; spawnId: "boar_whispercap" | "boss_rootshell"; allowRetreat?: boolean };

export type StoryReward =
  | { type: "xp"; amount: number }
  | { type: "supplies"; amount: number }
  | { type: "trailTokens"; amount: number }
  | { type: "growthStage"; amount: number }
  | { type: "badge"; badge: string }
  | { type: "ranchRelic"; relicId: "meadow_crest" | "grove_lantern" }
  | { type: "mapRoute"; routeId: "whispercap" | "chapter2_teasers" }
  | { type: "unlock"; unlockId: "mossback_gate" | "chapter2" | "repeat_spars" };

export type DialogueBeat = {
  id: string;
  speaker: StoryNpcId;
  lines: readonly [string] | readonly [string, string];
  trigger: "questStart" | "locationReached" | "objectiveComplete" | "repeatHint" | "encounterStart" | "questComplete";
  onceFlag?: StoryFlag;
};

export type StoryLocation = {
  id: StoryLocationId;
  label: string;
  position: StoryVec3;
  radius: number;
  worldAnchor: string;
};

export type StoryQuestStep = {
  id: string;
  objective: string;
  target?: StoryLocationId;
  requirements: readonly StoryRequirement[];
  completionFlags?: readonly StoryFlag[];
  guideTo?: StoryLocationId;
};

export type StoryQuest = {
  id: StoryQuestId;
  chapter: 1;
  title: string;
  startsWhen: readonly StoryRequirement[];
  steps: readonly StoryQuestStep[];
  rewards: readonly StoryReward[];
  completionFlags: readonly StoryFlag[];
  dialogue: readonly DialogueBeat[];
  nextQuestId?: StoryQuestId;
};

export const STORY_LOCATIONS: Record<StoryLocationId, StoryLocation> = {
  sunpatch_ranch: { id: "sunpatch_ranch", label: "Sunpatch Ranch", position: { x: 4.2, y: 0, z: 8.4 }, radius: 10, worldAnchor: "WORLD_ZONES.sunpatch_ranch" },
  sunpatch_fire: { id: "sunpatch_fire", label: "Sunpatch Fire", position: { x: 4, y: 0, z: 9 }, radius: 4, worldAnchor: "WorldProps HOME_FIRE / berry picnic" },
  training_ring: { id: "training_ring", label: "Pip's Training Ring", position: { x: -8, y: 0, z: 8 }, radius: 6, worldAnchor: "WORLD_ZONES.training_ring / WorldProps ring" },
  mossback_gate: { id: "mossback_gate", label: "Mossback Meadow Gate", position: { x: 0, y: 0, z: -24 }, radius: 8, worldAnchor: "WORLD_ZONES.mossback_gate / DinosaurArena" },
  whispercap_grove: { id: "whispercap_grove", label: "Whispercap Grove", position: { x: -12, y: 0, z: 2 }, radius: 7, worldAnchor: "WORLD_ZONES.whispercap_grove" },
  whispercap_mushrooms: { id: "whispercap_mushrooms", label: "Singing Mushrooms", position: { x: -12, y: 0, z: 2 }, radius: 3, worldAnchor: "WorldProps singing_mushrooms" },
  whispercap_bramble_boar: { id: "whispercap_bramble_boar", label: "Bramble Boar Shortcut", position: { x: -17, y: 0, z: 3 }, radius: 5, worldAnchor: "ENEMY_SPAWNS.boar_whispercap" },
  whispercap_grove_heart: { id: "whispercap_grove_heart", label: "Grove Heart", position: { x: -17, y: 0, z: 3 }, radius: 6, worldAnchor: "Chapter 1 target; relocate ENEMY_SPAWNS.boss_rootshell here" },
};

export const STORY_NPCS = {
  pip: { id: "pip", name: "Pip", role: "Warm trainer and first quest voice", home: "training_ring" },
  mossback: { id: "mossback", name: "Mossback", role: "Friendly arena steward", home: "mossback_gate" },
  juniper: { id: "juniper", name: "Juniper", role: "Ranch keeper", home: "sunpatch_fire" },
  luma: { id: "luma", name: "Luma", role: "Field-map scout", home: "sunpatch_fire" },
  elder_rootshell: { id: "elder_rootshell", name: "Elder Rootshell", role: "Frightened grove guardian", home: "whispercap_grove_heart" },
} as const satisfies Record<StoryNpcId, { id: StoryNpcId; name: string; role: string; home: StoryLocationId }>;

export const CHAPTER_ONE_QUESTS = [
  {
    id: "meet_pip_at_ring", chapter: 1, title: "Meet Pip at the Ring", startsWhen: [],
    steps: [{ id: "reach_ring", objective: "Walk to Pip's Training Ring", target: "training_ring", guideTo: "training_ring", requirements: [{ type: "zoneDiscovered", zoneId: "training_ring" }], completionFlags: ["introPipMet", "zone_training_ring_discovered"] }],
    rewards: [], completionFlags: ["introPipMet", "zone_training_ring_discovered"],
    dialogue: [{ id: "pip_welcome", speaker: "pip", trigger: "locationReached", onceFlag: "introPipMet", lines: ["Big trails begin with tiny practice.", "Which strength does your friend want to try first?"] }], nextQuestId: "three_kinds_of_brave",
  },
  {
    id: "three_kinds_of_brave", chapter: 1, title: "Three Kinds of Brave", startsWhen: [{ type: "flag", flag: "introPipMet" }],
    steps: [{ id: "earn_stars", objective: "Earn 3 training stars", target: "training_ring", guideTo: "training_ring", requirements: [{ type: "trainingStars", atLeast: 3 }], completionFlags: ["trainingTutorialSeen"] }],
    rewards: [{ type: "unlock", unlockId: "mossback_gate" }], completionFlags: ["trainingTutorialSeen"],
    dialogue: [
      { id: "pip_power", speaker: "pip", trigger: "questStart", lines: ["Push together."] },
      { id: "pip_agility", speaker: "pip", trigger: "repeatHint", lines: ["Watch, then move."] },
      { id: "pip_heart", speaker: "pip", trigger: "repeatHint", lines: ["Brave can be gentle."] },
    ], nextQuestId: "mossbacks_listening_test",
  },
  {
    id: "mossbacks_listening_test", chapter: 1, title: "Mossback's Listening Test", startsWhen: [{ type: "trainingStars", atLeast: 3 }],
    steps: [{ id: "win_first_spar", objective: "Win Mossback's friendly first spar", target: "mossback_gate", guideTo: "mossback_gate", requirements: [{ type: "arenaWins", atLeast: 1 }], completionFlags: ["mossbackIntroSeen", "meadowCrestEarned"] }],
    rewards: [{ type: "xp", amount: 15 }, { type: "growthStage", amount: 1 }, { type: "ranchRelic", relicId: "meadow_crest" }], completionFlags: ["mossbackIntroSeen", "meadowCrestEarned"],
    dialogue: [{ id: "mossback_opening", speaker: "mossback", trigger: "encounterStart", onceFlag: "mossbackIntroSeen", lines: ["Strong feet help. Strong listening helps more."] }], nextQuestId: "bring_crest_home",
  },
  {
    id: "bring_crest_home", chapter: 1, title: "Bring the Crest Home", startsWhen: [{ type: "flag", flag: "meadowCrestEarned" }],
    steps: [{ id: "celebrate_crest", objective: "Return to Sunpatch Fire with Meadow Crest", target: "sunpatch_fire", guideTo: "sunpatch_fire", requirements: [{ type: "flag", flag: "meadowCrestCelebrated" }], completionFlags: ["meadowCrestCelebrated"] }],
    rewards: [{ type: "mapRoute", routeId: "whispercap" }], completionFlags: ["meadowCrestCelebrated"],
    dialogue: [
      { id: "juniper_crest", speaker: "juniper", trigger: "objectiveComplete", onceFlag: "meadowCrestCelebrated", lines: ["This crest says you came home together."] },
      { id: "luma_lantern", speaker: "luma", trigger: "objectiveComplete", lines: ["Whispercap's lantern has gone dim. Map marks places you have truly seen."] },
    ], nextQuestId: "humming_grove",
  },
  {
    id: "humming_grove", chapter: 1, title: "The Humming Grove", startsWhen: [{ type: "flag", flag: "meadowCrestCelebrated" }],
    steps: [
      { id: "find_landmark", objective: "Find Whispercap's singing mushrooms", target: "whispercap_mushrooms", guideTo: "whispercap_grove", requirements: [{ type: "zoneDiscovered", zoneId: "whispercap_grove" }, { type: "collectible", itemId: "singing_mushrooms" }], completionFlags: ["whispercapLandmarkFound"] },
      { id: "meet_boar", objective: "Meet the Bramble Boar, or give it space", target: "whispercap_bramble_boar", guideTo: "whispercap_bramble_boar", requirements: [{ type: "encounterResolved", spawnId: "boar_whispercap", allowRetreat: true }], completionFlags: ["boarEncounterSeen"] },
    ],
    rewards: [], completionFlags: ["whispercapLandmarkFound", "boarEncounterSeen"],
    dialogue: [{ id: "luma_boar", speaker: "luma", trigger: "questStart", lines: ["A worried creature is not a bad creature.", "Give it space, or show it you can listen."] }], nextQuestId: "rootshells_quiet",
  },
  {
    id: "rootshells_quiet", chapter: 1, title: "Rootshell's Quiet", startsWhen: [{ type: "flag", flag: "whispercapLandmarkFound" }, { type: "flag", flag: "boarEncounterSeen" }],
    steps: [{ id: "resolve_guardian", objective: "Help Elder Rootshell hear your teamwork", target: "whispercap_grove_heart", guideTo: "whispercap_grove_heart", requirements: [{ type: "encounterResolved", spawnId: "boss_rootshell" }], completionFlags: ["elderRootshellResolved", "groveLanternRestored"] }],
    rewards: [{ type: "trailTokens", amount: 14 }, { type: "xp", amount: 18 }, { type: "growthStage", amount: 1 }, { type: "badge", badge: "Rootshell Friend" }, { type: "ranchRelic", relicId: "grove_lantern" }], completionFlags: ["elderRootshellResolved", "groveLanternRestored"],
    dialogue: [{ id: "rootshell_start", speaker: "elder_rootshell", trigger: "encounterStart", lines: ["Roots drum. Little Trailkeeper, can you listen?"] }], nextQuestId: "brighter_map",
  },
  {
    id: "brighter_map", chapter: 1, title: "A Brighter Map", startsWhen: [{ type: "flag", flag: "groveLanternRestored" }],
    steps: [{ id: "light_lantern", objective: "Return to Sunpatch Fire and light Grove Lantern", target: "sunpatch_fire", guideTo: "sunpatch_fire", requirements: [{ type: "flag", flag: "groveLanternCelebrated" }], completionFlags: ["groveLanternCelebrated", "chapter1Complete"] }],
    rewards: [{ type: "unlock", unlockId: "chapter2" }, { type: "unlock", unlockId: "repeat_spars" }, { type: "mapRoute", routeId: "chapter2_teasers" }], completionFlags: ["groveLanternCelebrated", "chapter1Complete"],
    dialogue: [{ id: "luma_chapter_end", speaker: "luma", trigger: "questComplete", onceFlag: "chapter1Complete", lines: ["Your map is brighter because you listened.", "New routes can wait until you are ready."] }],
  },
] as const satisfies readonly StoryQuest[];

export const STORY_QUEST_BY_ID: Record<StoryQuestId, StoryQuest> = Object.fromEntries(
  CHAPTER_ONE_QUESTS.map((quest) => [quest.id, quest]),
) as unknown as Record<StoryQuestId, StoryQuest>;
