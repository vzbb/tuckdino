import { create } from "zustand";
import {
  DEFAULT_TRAINING_LEDGER,
  finishSpar,
  normalizeTrainingLedger,
  restTrainingDay,
  sparDifficulty,
  spendTrainingSession,
  trainingBlockReason,
  type TrainingLedger,
} from "@/src/systems/training/trainingProgression";
import { WORLD_ZONES } from "@/src/world/worldZones";
import {
  resolveEncounterTurn,
  startEncounter,
  type CompanionMove,
  type EncounterState,
} from "@/src/systems/combat/encounterEngine";
import {
  awardEncounter,
  EMPTY_ENCOUNTER_PROGRESS,
  type EncounterProgress,
} from "@/src/systems/combat/encounterProgress";
import { ENEMY_SPAWNS, getEnemySpecies } from "@/src/world/enemies/enemyCatalog";

export type Vec3 = { x: number; y: number; z: number };

export type SceneName = "egg" | "hatching" | "world";
export type AdventureMode = "explore" | "training" | "battle" | "resolving" | "victory";
export type BattleMove = "stomp" | "tail_whip" | "brace";

export type FaceEmotion = "happy" | "neutral" | "excited" | "tired" | "confused";

export type SpeechIntent =
  | "greeting"
  | "calling_dino"
  | "saying_name"
  | "excited"
  | "random"
  | "unknown";

export type DinoAction = "pet" | "feed" | "bathe" | "play" | "camp";

export type DinoAnimationKey =
  | "idle"
  | "walk"
  | "run"
  | "hop"
  | "happy_jump"
  | "nuzzle"
  | "sit"
  | "look_at_camera"
  | "clap"
  | "wave";

export type DinoDirective = {
  mood: "calm" | "playful" | "excited" | "comforting";
  animation: DinoAnimationKey;
  speech_text?: string;
  shouldSpeak: boolean;
  moveTarget?: Vec3; // Optional target for autonomous movement
};

export type InterestPoint = {
  id: string;
  pos: Vec3;
  type: "flowers" | "butterfly" | "village" | "stream" | "camp";
  label: string;
};

export type GameEvent =
  | { t: number; type: "egg_selected"; eggId: number }
  | { t: number; type: "egg_hatched" }
  | { t: number; type: "tap_move"; target: Vec3 }
  | { t: number; type: "dino_action"; action: DinoAction }
  | { t: number; type: "collectible_found"; id: string; treats?: number; xp?: number }
  | { t: number; type: "dino_investigate"; targetId: string }
  | { t: number; type: "arena_reward"; reward: "meadow_crest"; growthStage: number }
  | { t: number; type: "camp_crest_celebration" }
  | { t: number; type: "arena_started" }
  | { t: number; type: "training_completed"; stat: "power" | "agility" | "heart" }
  | { t: number; type: "battle_move"; move: BattleMove }
  | { t: number; type: "zone_discovered"; zoneId: string }
  | { t: number; type: "world_encounter_started"; spawnId: string }
  | { t: number; type: "world_encounter_won"; spawnId: string; boss: boolean };

type GameState = {
  activeSaveSlot: number | null;
  childName: string;
  scene: SceneName;

  // Egg selection
  eggSelectedId: number | null;

  // Player movement
  playerPos: Vec3;
  playerRotation: number; // yaw in radians
  playerPitch: number; // pitch in radians
  playerZoom: number; // 1.0 is default, higher is zoomed out
  playerTarget: Vec3 | null;
  moveSequenceId: number; // increments on each new target

  // Dino
  dinoPos: Vec3;
  dinoScale: number;
  dinoColor: string; // hex color
  dinoStats: {
    hunger: number; // 0..1
    cleanliness: number; // 0..1
    happiness: number; // 0..1
    xp: number; // 0..inf
    growthStage: number; // 1..n
  };
  adventure: {
    chapter: number;
    mode: AdventureMode;
    quest: string;
    trainingStars: number;
    power: number;
    agility: number;
    heart: number;
    playerHp: number;
    rivalHp: number;
    battleMessage: string;
    turn: number;
  };
  progression: {
    arenaWins: number;
    meadowCrestEarned: boolean;
    campCrestCelebrations: number;
    training: TrainingLedger;
    encounters: EncounterProgress;
    defeatedEnemyAt: Record<string, number>;
    collectedItems: string[];
  };
  activeEncounter: EncounterState | null;
  activeEnemySpawnId: string | null;
  dinoDirective: DinoDirective;
  radialMenuOpen: boolean;
  mapOpen: boolean;
  discoveredZones: string[];

  // World Context
  interestPoints: InterestPoint[];

  // Camp
  campActive: boolean;
  campPos: Vec3 | null;

  // Time
  dayPhase: "morning" | "afternoon" | "evening" | "night";
  dayLight: number; // 0..1
  lastTimeSyncAt: number;

  // Sensors
  cameraEnabled: boolean;
  micEnabled: boolean;

  face: { emotion: FaceEmotion; confidence: number; updatedAt: number } | null;
  speech:
    | {
        transcript: string;
        intent: SpeechIntent;
        excitementLevel: number;
        updatedAt: number;
      }
    | null;

  // Events for AI context
  recentEvents: GameEvent[];

  // Actions
  setScene: (scene: SceneName) => void;

  selectEgg: (eggId: number) => void;
  markEggHatched: () => void;

  setPlayerPos: (pos: Vec3) => void;
  setPlayerRotation: (yaw: number) => void;
  setPlayerPitch: (pitch: number) => void;
  setPlayerZoom: (zoom: number) => void;
  setMoveTarget: (target: Vec3) => void;
  clearMoveTarget: () => void;

  setDinoPos: (pos: Vec3) => void;
  setDinoScale: (scale: number) => void;
  setDinoColor: (color: string) => void;
  setDinoDirective: (d: DinoDirective) => void;

  openRadialMenu: () => void;
  closeRadialMenu: () => void;
  setMapOpen: (open: boolean) => void;
  discoverZone: (zoneId: string) => void;
  collectItem: (id: string) => void;

  applyDinoAction: (action: DinoAction) => void;
  beginTraining: () => void;
  trainStat: (stat: "power" | "agility" | "heart") => void;
  beginBattle: () => void;
  useBattleMove: (move: BattleMove) => void;
  finishBattleResolution: () => void;
  returnToRanch: () => void;
  celebrateCrestAtCamp: () => void;
  startWorldEncounter: (spawnId: string) => void;
  playWorldEncounterMove: (move: CompanionMove) => void;
  retreatWorldEncounter: () => void;
  closeWorldEncounter: () => void;

  setCamp: (active: boolean, pos: Vec3 | null) => void;

  setDayCycle: (phase: GameState["dayPhase"], daylight: number) => void;

  setCameraEnabled: (v: boolean) => void;
  setMicEnabled: (v: boolean) => void;

  setFace: (emotion: FaceEmotion, confidence: number) => void;
  setSpeech: (s: GameState["speech"]) => void;

  pushEvent: (e: GameEvent) => void;
  clearEvents: () => void;

  // Persistence
  hydrateFromStorage: () => void;
  startNewGame: (slot: number) => void;
  loadGame: (slot: number) => boolean;
  deleteGame: (slot: number) => void;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const defaultDirective: DinoDirective = {
  mood: "calm",
  animation: "idle",
  shouldSpeak: false,
};

const HOME_SPAWN: Vec3 = { x: 0, y: 0, z: -2 };
const HOME_DINO_SPAWN: Vec3 = { x: 1.5, y: 0, z: 0.2 };
const isNearZone = (player: Vec3, zoneId: string) => {
  const zone = WORLD_ZONES.find((candidate) => candidate.id === zoneId);
  return !!zone && Math.hypot(player.x - zone.position.x, player.z - zone.position.z) <= zone.radius;
};

export const useGameStore = create<GameState>((set, get) => ({
  activeSaveSlot: null,
  childName: "Ranger",
  scene: "egg",

  eggSelectedId: null,

  playerPos: { ...HOME_SPAWN },
  playerRotation: 0,
  playerPitch: 0,
  playerZoom: 1.25, // default slightly zoomed out
  playerTarget: null,
  moveSequenceId: 0,

  dinoPos: { ...HOME_DINO_SPAWN },
  dinoScale: 1,
  dinoColor: "#16d8c5",
  dinoStats: {
    hunger: 0.8,
    cleanliness: 0.8,
    happiness: 0.9,
    xp: 0,
    growthStage: 1,
  },
  adventure: {
    chapter: 1,
    mode: "explore",
    quest: "Meet Pip at the training ring",
    trainingStars: 0,
    power: 1,
    agility: 1,
    heart: 1,
    playerHp: 12,
    rivalHp: 12,
    battleMessage: "A friendly challenger is waiting beyond the ranch!",
    turn: 0,
  },
  progression: {
    arenaWins: 0,
    meadowCrestEarned: false,
    campCrestCelebrations: 0,
    training: { ...DEFAULT_TRAINING_LEDGER },
    encounters: { ...EMPTY_ENCOUNTER_PROGRESS },
    defeatedEnemyAt: {},
    collectedItems: [],
  },
  activeEncounter: null,
  activeEnemySpawnId: null,
  dinoDirective: defaultDirective,
  radialMenuOpen: false,
  mapOpen: false,
  discoveredZones: ["sunpatch_ranch"],

  interestPoints: [
    { id: "village_hut", pos: { x: -10, y: 0, z: -6 }, type: "village", label: "Cozy Hut" },
    { id: "stream_bank", pos: { x: 0, y: 0, z: -12 }, type: "stream", label: "Sparkling Stream" },
    { id: "flower_field", pos: { x: -2, y: 0, z: 10 }, type: "flowers", label: "Smelly Flowers" },
    { id: "camp_center", pos: { x: 10, y: 0, z: 10 }, type: "camp", label: "Warm Campfire" },
  ],

  campActive: false,
  campPos: null,

  dayPhase: "afternoon",
  dayLight: 1,
  lastTimeSyncAt: 0,

  cameraEnabled: false,
  micEnabled: false,

  face: null,
  speech: null,

  recentEvents: [],

  setScene: (scene) => set({ scene }),

  selectEgg: (eggId) => {
    set({ eggSelectedId: eggId, scene: "hatching" });
    get().pushEvent({ t: Date.now(), type: "egg_selected", eggId });
  },

  markEggHatched: () => {
    get().pushEvent({ t: Date.now(), type: "egg_hatched" });
  },

  setPlayerPos: (pos) => set({ playerPos: pos }),

  setPlayerRotation: (yaw) => set({ playerRotation: yaw }),

  setPlayerPitch: (pitch) => set({ playerPitch: pitch }),

  setPlayerZoom: (zoom) => set({ playerZoom: zoom }),

  setMoveTarget: (target) => {
    set((s) => ({
      playerTarget: target,
      moveSequenceId: s.moveSequenceId + 1,
    }));
    get().pushEvent({ t: Date.now(), type: "tap_move", target });
  },

  clearMoveTarget: () => set({ playerTarget: null }),

  setDinoPos: (pos) => set({ dinoPos: pos }),

  setDinoScale: (scale) => set({ dinoScale: scale }),

  setDinoColor: (color) => set({ dinoColor: color }),

  setDinoDirective: (d) => set({ dinoDirective: d }),

  openRadialMenu: () => set({ radialMenuOpen: true }),
  closeRadialMenu: () => set({ radialMenuOpen: false }),
  setMapOpen: (mapOpen) => set({ mapOpen, radialMenuOpen: false }),
  discoverZone: (zoneId) => {
    if (get().discoveredZones.includes(zoneId)) return;
    set((s) => ({ discoveredZones: [...s.discoveredZones, zoneId] }));
    get().pushEvent({ t: Date.now(), type: "zone_discovered", zoneId });
    persistGame();
  },
  collectItem: (id) => {
    const s = get();
    if (s.progression.collectedItems.includes(id)) return;
    const treats = 1;
    const xp = 4;
    set({
      progression: {
        ...s.progression,
        collectedItems: [...s.progression.collectedItems, id],
        training: { ...s.progression.training, supplies: s.progression.training.supplies + treats },
      },
      dinoStats: { ...s.dinoStats, xp: s.dinoStats.xp + xp },
    });
    get().pushEvent({ t: Date.now(), type: "collectible_found", id, treats, xp });
    persistGame();
  },

  applyDinoAction: (action) => {
    const s = get();
    const now = Date.now();
    const stats = { ...s.dinoStats };
    // Keep actions super forgiving: everything improves something 🙂
    switch (action) {
      case "pet":
        stats.happiness = clamp01(stats.happiness + 0.08);
        stats.xp += 1;
        break;
      case "feed":
        stats.hunger = clamp01(stats.hunger + 0.25);
        stats.happiness = clamp01(stats.happiness + 0.05);
        stats.xp += 2;
        break;
      case "bathe":
        stats.cleanliness = clamp01(stats.cleanliness + 0.35);
        stats.happiness = clamp01(stats.happiness + 0.03);
        stats.xp += 2;
        break;
      case "play":
        stats.happiness = clamp01(stats.happiness + 0.18);
        stats.hunger = clamp01(stats.hunger - 0.05);
        stats.xp += 3;
        break;
      case "camp":
        stats.happiness = clamp01(stats.happiness + 0.06);
        stats.xp += 1;
        break;
    }

    // Growth: every 25 XP → next stage, subtle scale bump
    let growthStage = stats.growthStage;
    let dinoScale = s.dinoScale;
    const shouldGrow = Math.floor(stats.xp / 25) + 1;
    if (shouldGrow > growthStage) {
      growthStage = shouldGrow;
      dinoScale = Math.min(1.8, 1 + 0.08 * (growthStage - 1));
    }
    stats.growthStage = growthStage;

    set({ dinoStats: stats, dinoScale });

    s.pushEvent({ t: now, type: "dino_action", action });

    // Camp action toggles camp at current player position
    if (action === "camp") {
      const isActive = get().campActive;
      set({
        campActive: !isActive,
        campPos: !isActive ? { ...get().playerPos } : null,
      });
    }
  },

  beginTraining: () => set((s) => {
    const zone = WORLD_ZONES.find((candidate) => candidate.id === "training_ring")!;
    if (!isNearZone(s.playerPos, zone.id)) return {
      adventure: { ...s.adventure, mode: "explore", quest: "Follow Pip's trail to the training ring" },
      playerTarget: zone.position,
      moveSequenceId: s.moveSequenceId + 1,
    };
    return { adventure: { ...s.adventure, mode: "training", quest: "Earn 3 training stars" } };
  }),

  trainStat: (stat) => set((s) => {
    const blocked = trainingBlockReason(s.progression.training, s.adventure[stat], s.dinoStats.growthStage);
    if (blocked) {
      return { adventure: { ...s.adventure, battleMessage: blocked } };
    }
    const stars = Math.min(3, s.adventure.trainingStars + 1);
    const ready = stars >= 3;
    queueMicrotask(() => get().pushEvent({ t: Date.now(), type: "training_completed", stat }));
    return {
      dinoStats: { ...s.dinoStats, xp: s.dinoStats.xp + 4, happiness: clamp01(s.dinoStats.happiness + .04) },
      progression: { ...s.progression, training: spendTrainingSession(s.progression.training) },
      adventure: {
        ...s.adventure,
        [stat]: s.adventure[stat] + 1,
        trainingStars: stars,
        chapter: ready ? Math.max(2, s.adventure.chapter) : s.adventure.chapter,
        mode: ready ? "explore" : "training",
        quest: ready ? "Challenge the Mossback at the meadow gate" : `Earn ${3 - stars} more training ${3 - stars === 1 ? "star" : "stars"}`,
        battleMessage: ready ? "Pip says your bond is strong enough. The meadow gate is open!" : `Great ${stat} practice!`,
      },
    };
  }),

  beginBattle: () => {
    set((s) => {
      const zone = WORLD_ZONES.find((candidate) => candidate.id === "mossback_gate")!;
      if (!isNearZone(s.playerPos, zone.id)) return {
        adventure: { ...s.adventure, mode: "explore", quest: "Follow the trail to Mossback Meadow Gate" },
        playerTarget: zone.position,
        moveSequenceId: s.moveSequenceId + 1,
      };
      const rival = sparDifficulty(s.progression.arenaWins, s.adventure);
      return {
      adventure: {
        ...s.adventure,
        mode: "battle",
        quest: s.progression.meadowCrestEarned ? `Spar with ${rival.label}` : "Win your first friendly ranch battle",
        playerHp: 12 + s.adventure.heart,
        rivalHp: rival.hp,
        turn: 0,
        battleMessage: `${rival.label} wants to test your teamwork! Choose a move.`,
      },
      playerTarget: null,
      };
    });
    if (get().adventure.mode === "battle") {
      get().pushEvent({ t: Date.now(), type: "arena_started" });
    }
  },

  useBattleMove: (move) => set((s) => {
    if (s.adventure.mode !== "battle") return s;
    queueMicrotask(() => get().pushEvent({ t: Date.now(), type: "battle_move", move }));
    const a = s.adventure;
    const rival = sparDifficulty(s.progression.arenaWins, a);
    const damage = move === "stomp" ? 2 + Math.floor(a.power / 2) : move === "tail_whip" ? 1 + Math.floor(a.agility / 2) : 0;
    const rivalHp = Math.max(0, a.rivalHp - damage);
    const reply = rivalHp <= 0 ? 0 : Math.max(1, rival.damage - (move === "brace" ? 2 : 0) - Math.floor(a.heart / 5));
    const playerHp = Math.max(0, a.playerHp - reply);
    const won = rivalHp <= 0;
    const lost = playerHp <= 0;
    const name = move === "stomp" ? "Comet Stomp" : move === "tail_whip" ? "Leaf Whirl" : "Brave Brace";
    const firstCrest = won && !s.progression.meadowCrestEarned;
    const growthStage = firstCrest ? s.dinoStats.growthStage + 1 : s.dinoStats.growthStage;
    if (firstCrest) {
      queueMicrotask(() => {
        get().pushEvent({ t: Date.now(), type: "arena_reward", reward: "meadow_crest", growthStage });
        persistGame();
      });
    } else if (won) {
      queueMicrotask(persistGame);
    }
    return {
      dinoStats: won ? { ...s.dinoStats, xp: s.dinoStats.xp + 15, happiness: 1, growthStage } : s.dinoStats,
      dinoScale: firstCrest ? Math.min(1.8, Math.max(s.dinoScale + .08, 1 + .08 * (growthStage - 1))) : s.dinoScale,
      progression: won ? {
        ...s.progression,
        arenaWins: s.progression.arenaWins + 1,
        meadowCrestEarned: true,
        training: finishSpar(s.progression.training, true),
      } : lost ? { ...s.progression, training: finishSpar(s.progression.training, false) } : s.progression,
      adventure: {
        ...a,
        mode: won ? "victory" : lost ? "resolving" : "battle",
        chapter: won ? 3 : a.chapter,
        playerHp: lost ? 12 + a.heart : playerHp,
        rivalHp: lost ? rival.hp : rivalHp,
        turn: a.turn + 1,
        quest: won ? "Take the Meadow Crest home to the ranch" : lost ? "Train and try again" : a.quest,
        battleMessage: won ? (firstCrest ? `Mossback bows! Meadow Crest earned — your dino grew to stage ${growthStage}!` : "Mossback bows! Another arena win!") : lost ? "Mossback helps you up. Train once more and try again!" : `${name}! Mossback answers with a gentle head bump.`,
      },
    };
  }),

  finishBattleResolution: () => set((s) => {
    if (s.adventure.mode !== "resolving") return s;
    return {
      adventure: {
        ...s.adventure,
        mode: "training",
        playerHp: 12 + s.adventure.heart,
        rivalHp: 12,
      },
      playerTarget: { x: -8, y: 0, z: 8 },
      moveSequenceId: s.moveSequenceId + 1,
    };
  }),

  returnToRanch: () => set((s) => ({
    adventure: { ...s.adventure, mode: "explore", quest: s.progression.meadowCrestEarned ? "Celebrate the Meadow Crest at the ranch fire" : s.adventure.quest },
    playerTarget: { ...HOME_SPAWN },
    moveSequenceId: s.moveSequenceId + 1,
  })),

  celebrateCrestAtCamp: () => {
    const s = get();
    if (!s.progression.meadowCrestEarned) return;
    const zone = WORLD_ZONES.find((candidate) => candidate.id === "sunpatch_ranch")!;
    if (!isNearZone(s.playerPos, zone.id)) {
      set({ adventure: { ...s.adventure, mode: "explore", quest: "Follow the trail to Sunpatch Ranch" }, playerTarget: zone.position, moveSequenceId: s.moveSequenceId + 1 });
      return;
    }
    set({
      adventure: { ...s.adventure, quest: "Follow the glowing tracks into Fernwood" },
      progression: { ...s.progression, campCrestCelebrations: s.progression.campCrestCelebrations + 1 },
      dinoStats: { ...s.dinoStats, happiness: 1 },
      dinoDirective: { mood: "excited", animation: "happy_jump", shouldSpeak: false },
      playerTarget: null,
    });
    get().pushEvent({ t: Date.now(), type: "camp_crest_celebration" });
    persistGame();
  },

  startWorldEncounter: (spawnId) => {
    const spawn = ENEMY_SPAWNS.find((candidate) => candidate.id === spawnId);
    if (!spawn || get().activeEncounter) return;
    const species = getEnemySpecies(spawn.speciesId);
    const stats = get().adventure;
    set({
      activeEnemySpawnId: spawnId,
      activeEncounter: startEncounter(species, stats),
      playerTarget: null,
      mapOpen: false,
    });
    get().pushEvent({ t: Date.now(), type: "world_encounter_started", spawnId });
  },

  playWorldEncounterMove: (move) => {
    const s = get();
    const spawn = ENEMY_SPAWNS.find((candidate) => candidate.id === s.activeEnemySpawnId);
    if (!spawn || !s.activeEncounter) return;
    const species = getEnemySpecies(spawn.speciesId);
    const result = resolveEncounterTurn(s.activeEncounter, species, s.adventure, move);
    if (result.state.outcome !== "won" || !result.reward) {
      set({ activeEncounter: result.state });
      return;
    }
    const now = Date.now();
    const encounters = awardEncounter(s.progression.encounters, spawn.id, result.reward);
    const bossGrowth = species.temperament === "boss" ? 1 : 0;
    set({
      activeEncounter: result.state,
      progression: {
        ...s.progression,
        encounters,
        defeatedEnemyAt: { ...s.progression.defeatedEnemyAt, [spawn.id]: now },
        training: {
          ...s.progression.training,
          supplies: s.progression.training.supplies + result.reward.trailTokens,
        },
      },
      dinoStats: {
        ...s.dinoStats,
        xp: s.dinoStats.xp + result.reward.companionXp,
        growthStage: s.dinoStats.growthStage + bossGrowth,
        happiness: 1,
      },
      dinoScale: bossGrowth ? Math.min(1.8, s.dinoScale + .08) : s.dinoScale,
    });
    get().pushEvent({
      t: now,
      type: "world_encounter_won",
      spawnId: spawn.id,
      boss: species.temperament === "boss",
    });
    queueMicrotask(persistGame);
  },

  retreatWorldEncounter: () => set((s) => s.activeEncounter ? ({
    activeEncounter: {
      ...s.activeEncounter,
      outcome: "retreated",
      log: [...s.activeEncounter.log, "Your team retreats safely to the ranch trail."].slice(-6),
    },
  }) : {}),

  closeWorldEncounter: () => set({
    activeEncounter: null,
    activeEnemySpawnId: null,
  }),

  setCamp: (active, pos) => set({ campActive: active, campPos: pos }),

  setDayCycle: (phase, daylight) =>
    set((s) => ({
      dayPhase: phase,
      dayLight: daylight,
      lastTimeSyncAt: Date.now(),
      progression: { ...s.progression, training: restTrainingDay(s.progression.training) },
    })),

  setCameraEnabled: (v) => set({ cameraEnabled: v }),
  setMicEnabled: (v) => set({ micEnabled: v }),

  setFace: (emotion, confidence) =>
    set({
      face: { emotion, confidence, updatedAt: Date.now() },
    }),

  setSpeech: (speech) => set({ speech }),

  pushEvent: (e) => set((s) => ({ recentEvents: [...s.recentEvents, e].slice(-20) })),

  clearEvents: () => set({ recentEvents: [] }),

  hydrateFromStorage: () => {
    // Save selection is handled explicitly by the kid-friendly slot screen.
  },
  startNewGame: (slot) => set({
    activeSaveSlot: slot,
    scene: "egg",
    eggSelectedId: null,
    playerPos: { ...HOME_SPAWN },
    playerRotation: 0,
    playerPitch: 0,
    playerTarget: null,
    dinoPos: { ...HOME_DINO_SPAWN },
    dinoScale: 1,
    dinoColor: "#31d7c5",
    dinoStats: { hunger: .8, cleanliness: .8, happiness: .9, xp: 0, growthStage: 1 },
    adventure: { chapter: 1, mode: "explore", quest: "Meet Pip at the training ring", trainingStars: 0, power: 1, agility: 1, heart: 1, playerHp: 12, rivalHp: 12, battleMessage: "A friendly challenger is waiting beyond the ranch!", turn: 0 },
    progression: {
      arenaWins: 0,
      meadowCrestEarned: false,
      campCrestCelebrations: 0,
      training: { ...DEFAULT_TRAINING_LEDGER },
      encounters: { ...EMPTY_ENCOUNTER_PROGRESS },
      defeatedEnemyAt: {},
      collectedItems: [],
    },
    activeEncounter: null,
    activeEnemySpawnId: null,
    campActive: false,
    campPos: null,
    mapOpen: false,
    discoveredZones: ["sunpatch_ranch"],
    recentEvents: [],
  }),
  loadGame: (slot) => {
    try {
      const raw = localStorage.getItem(`rawrcade_save_${slot}`) ?? localStorage.getItem(`tucker_dino_save_${slot}`);
      if (!raw) return false;
      const saved = JSON.parse(raw) as Partial<GameState>;
      set((s) => ({
        ...s,
        activeSaveSlot: slot,
        scene: saved.scene ?? (saved.eggSelectedId !== null ? "world" : "egg"),
        eggSelectedId: saved.eggSelectedId ?? null,
        playerPos: { ...HOME_SPAWN },
        playerRotation: 0,
        playerTarget: null,
        dinoPos: { ...HOME_DINO_SPAWN },
        dinoStats: saved.dinoStats ?? s.dinoStats,
        dinoColor: saved.dinoColor ?? "#31d7c5",
        adventure: saved.adventure ?? s.adventure,
        progression: {
          arenaWins: saved.progression?.arenaWins ?? 0,
          meadowCrestEarned: saved.progression?.meadowCrestEarned ?? false,
          campCrestCelebrations: saved.progression?.campCrestCelebrations ?? 0,
          training: normalizeTrainingLedger(saved.progression?.training),
          encounters: saved.progression?.encounters ?? { ...EMPTY_ENCOUNTER_PROGRESS },
          defeatedEnemyAt: saved.progression?.defeatedEnemyAt ?? {},
          collectedItems: saved.progression?.collectedItems ?? [],
        },
        activeEncounter: null,
        activeEnemySpawnId: null,
        dinoScale: saved.dinoScale ?? 1,
        campActive: saved.campActive ?? false,
        campPos: saved.campPos ?? null,
        mapOpen: false,
        discoveredZones: saved.discoveredZones ?? ["sunpatch_ranch"],
      }));
      return true;
    } catch { return false; }
  },
  deleteGame: (slot) => {
    try {
      localStorage.removeItem(`rawrcade_save_${slot}`);
      localStorage.removeItem(`tucker_dino_save_${slot}`);
    } catch {
      // The slot screen will still reflect whatever storage allows.
    }
    if (get().activeSaveSlot === slot) {
      get().startNewGame(slot);
      set({ activeSaveSlot: null });
    }
  },
}));

export function persistGame() {
  const s = useGameStore.getState();
  if (s.activeSaveSlot === null) return;
  const save = {
    scene: s.scene,
    eggSelectedId: s.eggSelectedId,
    playerPos: s.playerPos,
    playerRotation: s.playerRotation,
    dinoPos: s.dinoPos,
    dinoStats: s.dinoStats,
    dinoColor: s.dinoColor,
    adventure: s.adventure,
    progression: s.progression,
    dinoScale: s.dinoScale,
    campActive: s.campActive,
    campPos: s.campPos,
    discoveredZones: s.discoveredZones,
  };
  try {
    localStorage.setItem(`rawrcade_save_${s.activeSaveSlot}`, JSON.stringify(save));
  } catch {
    // ignore
  }
}
