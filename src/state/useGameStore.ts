import { create } from "zustand";

export type Vec3 = { x: number; y: number; z: number };

export type SceneName = "egg" | "hatching" | "world";

export type FaceEmotion = "happy" | "neutral" | "excited" | "tired" | "confused";

export type SpeechIntent =
  | "greeting"
  | "calling_dino"
  | "saying_tucker"
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
  | { t: number; type: "collectible_found"; id: string }
  | { t: number; type: "dino_investigate"; targetId: string };

type GameState = {
  childName: string;
  scene: SceneName;

  // Egg selection
  eggSelectedId: number | null;

  // Player movement
  playerPos: Vec3;
  playerRotation: number; // yaw in radians
  playerTarget: Vec3 | null;
  moveSequenceId: number; // increments on each new target

  // Dino
  dinoPos: Vec3;
  dinoScale: number;
  dinoStats: {
    hunger: number; // 0..1
    cleanliness: number; // 0..1
    happiness: number; // 0..1
    xp: number; // 0..inf
    growthStage: number; // 1..n
  };
  dinoDirective: DinoDirective;
  radialMenuOpen: boolean;

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
  setMoveTarget: (target: Vec3) => void;
  clearMoveTarget: () => void;

  setDinoPos: (pos: Vec3) => void;
  setDinoScale: (scale: number) => void;
  setDinoDirective: (d: DinoDirective) => void;

  openRadialMenu: () => void;
  closeRadialMenu: () => void;

  applyDinoAction: (action: DinoAction) => void;

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
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const defaultDirective: DinoDirective = {
  mood: "calm",
  animation: "idle",
  shouldSpeak: false,
};

export const useGameStore = create<GameState>((set, get) => ({
  childName: "Tucker",
  scene: "egg",

  eggSelectedId: null,

  playerPos: { x: 0, y: 0, z: 6 },
  playerRotation: 0,
  playerTarget: null,
  moveSequenceId: 0,

  dinoPos: { x: 0, y: 0, z: 3.5 },
  dinoScale: 1,
  dinoStats: {
    hunger: 0.8,
    cleanliness: 0.8,
    happiness: 0.9,
    xp: 0,
    growthStage: 1,
  },
  dinoDirective: defaultDirective,
  radialMenuOpen: false,

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

  setDinoDirective: (d) => set({ dinoDirective: d }),

  openRadialMenu: () => set({ radialMenuOpen: true }),
  closeRadialMenu: () => set({ radialMenuOpen: false }),

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

  setCamp: (active, pos) => set({ campActive: active, campPos: pos }),

  setDayCycle: (phase, daylight) =>
    set({
      dayPhase: phase,
      dayLight: daylight,
      lastTimeSyncAt: Date.now(),
    }),

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
    try {
      const raw = localStorage.getItem("tucker_dino_save_v1");
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<GameState>;
      // Only restore safe/progression bits (not sensors).
      set((s) => ({
        ...s,
        eggSelectedId: saved.eggSelectedId ?? s.eggSelectedId,
        dinoStats: saved.dinoStats ?? s.dinoStats,
        dinoScale: saved.dinoScale ?? s.dinoScale,
        campActive: saved.campActive ?? s.campActive,
        campPos: saved.campPos ?? s.campPos,
      }));
    } catch {
      // ignore
    }
  },
}));

export function persistGame() {
  const s = useGameStore.getState();
  const save = {
    eggSelectedId: s.eggSelectedId,
    dinoStats: s.dinoStats,
    dinoScale: s.dinoScale,
    campActive: s.campActive,
    campPos: s.campPos,
  };
  try {
    localStorage.setItem("tucker_dino_save_v1", JSON.stringify(save));
  } catch {
    // ignore
  }
}
