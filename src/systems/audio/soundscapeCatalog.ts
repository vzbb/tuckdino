/**
 * Declarative sound design source. Files are public URLs so consumers can pass
 * them directly to `new Audio(...)` without knowing the asset directory.
 */
export type SoundBus = "music" | "ambience" | "sfx";
export type PlaybackMode = "loop" | "oneShot";
export type SoundFile = `/assets/sounds/${string}`;

export type SoundCue = Readonly<{
  files: readonly SoundFile[];
  bus: SoundBus;
  playback: PlaybackMode;
  volume: number;
  cooldownMs: number;
  randomization: Readonly<{
    pick: "first" | "random";
    volumeJitter: number;
    playbackRate: readonly [number, number];
  }>;
}>;

const loop = (files: readonly SoundFile[], volume: number): SoundCue => ({
  files,
  bus: "ambience",
  playback: "loop",
  volume,
  cooldownMs: 0,
  randomization: { pick: "random", volumeJitter: 0.04, playbackRate: [0.97, 1.03] },
});

const cue = (files: readonly SoundFile[], volume: number, cooldownMs: number): SoundCue => ({
  files,
  bus: "sfx",
  playback: "oneShot",
  volume,
  cooldownMs,
  randomization: { pick: "random", volumeJitter: 0.08, playbackRate: [0.94, 1.06] },
});

export const soundscapeCatalog = {
  zones: {
    ranch: {
      music: loop([
        "/assets/sounds/Warm_playful_ranch_t_#1-1785017521842.mp3",
        "/assets/sounds/Warm_playful_ranch_t_#2-1785017534971.mp3",
        "/assets/sounds/Warm_playful_ranch_t_#3-1785017540770.mp3",
        "/assets/sounds/Warm_playful_ranch_t_#4-1785017540775.mp3",
      ], 0.34),
      ambientLayers: {
        ranchLife: loop([
          "/assets/sounds/Seamless_lively_dino_#1-1785015657153.mp3",
          "/assets/sounds/Seamless_lively_dino_#2-1785015657155.mp3",
          "/assets/sounds/Seamless_lively_dino_#3-1785015681108.mp3",
        ], 0.24),
        water: loop([
          "/assets/sounds/Gentle_ranch_water_t_#1-1785018084165.mp3",
          "/assets/sounds/Gentle_ranch_water_t_#2-1785018050737.mp3",
        ], 0.16),
      },
    },
    meadow: {
      music: loop([
        "/assets/sounds/Bright_open-world_me_#1-1785017497322.mp3",
        "/assets/sounds/Bright_open-world_me_#2-1785017497324.mp3",
        "/assets/sounds/Bright_open-world_me_#3-1785017506522.mp3",
        "/assets/sounds/Bright_open-world_me_#4-1785017506524.mp3",
      ], 0.34),
      ambientLayers: {
        breeze: loop(["/assets/sounds/Seamless_bright_fant_#1-1785014701893.mp3"], 0.24),
        summer: loop([
          "/assets/sounds/Seamless_gentle_summ_#1-1785015360028.mp3",
          "/assets/sounds/Seamless_gentle_summ_#2-1785015359577.mp3",
          "/assets/sounds/Seamless_gentle_summ_#3-1785015406896.mp3",
          "/assets/sounds/Seamless_gentle_summ_#4-1785015406901.mp3",
        ], 0.14),
      },
    },
    forest: {
      music: loop(["/assets/sounds/mystery_forest.mp3"], 0.32),
      ambientLayers: {
        canopy: loop([
          "/assets/sounds/Seamless_friendly_fo_#1-1785015030432.mp3",
          "/assets/sounds/Seamless_friendly_fo_#2-1785015030381.mp3",
          "/assets/sounds/Seamless_friendly_fo_#3-1785015030875.mp3",
          "/assets/sounds/Seamless_friendly_fo_#4-1785015030400.mp3",
        ], 0.24),
        mushrooms: loop([
          "/assets/sounds/Seamless_whimsical_m_#1-1785017428096.mp3",
          "/assets/sounds/Seamless_whimsical_m_#3-1785017455862.mp3",
          "/assets/sounds/Seamless_whimsical_m_#4-1785017468738.mp3",
        ], 0.15),
      },
    },
    crystalGrove: {
      music: loop(["/assets/sounds/crystal_discovery.mp3"], 0.32),
      ambientLayers: {
        resonance: loop([
          "/assets/sounds/Seamless_magical_cry_#1-1785017782854.mp3",
          "/assets/sounds/Seamless_magical_cry_#2-1785017782856.mp3",
          "/assets/sounds/Seamless_magical_cry_#3-1785018277383.mp3",
        ], 0.22),
      },
    },
    stream: {
      music: loop(["/assets/sounds/quiet_meadow_variant.mp3"], 0.3),
      ambientLayers: { water: loop(["/assets/sounds/shallow_water_movement.mp3"], 0.22) },
    },
    camp: {
      music: loop(["/assets/sounds/Seamless_close_campf_#1-1785015796678.mp3"], 0.3),
      ambientLayers: {
        fire: loop([
          "/assets/sounds/Seamless_close_campf_#2-1785015829933.mp3",
          "/assets/sounds/Seamless_close_campf_#3-1785015829934.mp3",
        ], 0.2),
        tent: loop([
          "/assets/sounds/Canvas_tent_gently_s_#1-1785015787382.mp3",
          "/assets/sounds/Canvas_tent_gently_s_#3-1785015813744.mp3",
        ], 0.12),
      },
    },
    night: {
      music: loop(["/assets/sounds/night_exploration.mp3"], 0.3),
      ambientLayers: {
        nightAir: loop([
          "/assets/sounds/Seamless_cozy_ranch__#1-1785018653498.mp3",
          "/assets/sounds/Seamless_cozy_ranch__#3-1785018653501.mp3",
          "/assets/sounds/Seamless_cozy_ranch__#4-1785018653502.mp3",
        ], 0.2),
      },
    },
  },
  movement: {
    playerWalk: cue(["/assets/sounds/player_walking.mp3"], 0.28, 280),
    playerRun: cue(["/assets/sounds/player_running.mp3"], 0.34, 180),
    dinoSlowWalk: cue(["/assets/sounds/slow_dinosaur_walk.mp3"], 0.3, 420),
    dinoHeavyWalk: cue(["/assets/sounds/heavy_dinosaur_walk.mp3"], 0.38, 360),
    dinoScamper: cue(["/assets/sounds/baby_dinosaur_scamper.mp3"], 0.3, 220),
    dinoRun: cue(["/assets/sounds/dinosaur_running.mp3"], 0.36, 180),
    mud: cue(["/assets/sounds/muddy_footsteps.mp3"], 0.34, 300),
    shallowWater: cue(["/assets/sounds/shallow_water_movement.mp3"], 0.32, 320),
  },
  wildlife: {
    butterfly: cue(["/assets/sounds/butterfly_flutter.mp3"], 0.22, 900),
    leafyMovement: cue(["/assets/sounds/leafy_forest_movement.mp3"], 0.3, 1100),
    friendlyDinos: cue([
      "/assets/sounds/Friendly_young_dinos_#1-1785014572922.mp3",
      "/assets/sounds/Friendly_young_dinos_#2-1785014572923.mp3",
      "/assets/sounds/Friendly_young_dinos_#3-1785014572924.mp3",
      "/assets/sounds/Friendly_young_dinos_#4-1785014572926.mp3",
    ], 0.28, 1500),
    wind: cue(["/assets/sounds/wind_gust.mp3", "/assets/sounds/approaching_storm.mp3"], 0.24, 2400),
  },
  cues: {
    ui: {
      select: cue(["/assets/sounds/Tiny_magical_object__#3-1785019591181.mp3", "/assets/sounds/Tiny_magical_object__#4-1785019591183.mp3"], 0.44, 120),
      discover: cue(["/assets/sounds/glowing_trail.mp3", "/assets/sounds/crystal_discovery.mp3"], 0.5, 500),
      gate: cue(["/assets/sounds/Rustic_wooden_ranch__#2-1785017979414.mp3"], 0.38, 350),
    },
    combat: {
      stomp: cue(["/assets/sounds/Cute_heavy_dinosaur__#4-1785010397025.wav"], 0.62, 380),
      tailWhip: cue(["/assets/sounds/leafy_forest_movement.mp3"], 0.5, 320),
      brace: cue(["/assets/sounds/Rustic_wooden_ranch__#1-1785017910232.mp3"], 0.45, 400),
      enter: cue(["/assets/sounds/exploration_to_battle.mp3", "/assets/sounds/arena_preparation.mp3"], 0.58, 750),
      battle: loop(["/assets/sounds/arena_battle.mp3"], 0.38),
      victory: cue(["/assets/sounds/battle_to_victory.mp3", "/assets/sounds/victory_transition_loop.mp3"], 0.62, 900),
      setback: cue(["/assets/sounds/gentle_setback.mp3", "/assets/sounds/c_major_to_a_minor.mp3"], 0.46, 800),
    },
    training: {
      start: cue(["/assets/sounds/training_ring.mp3"], 0.5, 650),
      complete: cue(["/assets/sounds/a_minor_to_c_major.mp3", "/assets/sounds/Small_ranch_celebrat_#1-1785018148030.mp3"], 0.56, 900),
    },
    rewards: {
      ranchCelebration: cue([
        "/assets/sounds/Small_ranch_celebrat_#1-1785018148030.mp3",
        "/assets/sounds/Small_ranch_celebrat_#2-1785018159676.mp3",
        "/assets/sounds/Small_ranch_celebrat_#3-1785018183674.mp3",
      ], 0.6, 900),
      crystal: cue(["/assets/sounds/Seamless_magical_cry_#1-1785017782854.mp3"], 0.52, 600),
      hatch: cue([
        "/assets/sounds/Tender_baby-dinosaur_#1-1785017385883.mp3",
        "/assets/sounds/Tender_baby-dinosaur_#2-1785017409455.mp3",
        "/assets/sounds/Tender_baby-dinosaur_#3-1785017418084.mp3",
        "/assets/sounds/Tender_baby-dinosaur_#4-1785017418089.mp3",
      ], 0.58, 1000),
    },
  },
} as const satisfies Readonly<Record<string, unknown>>;

export type SoundscapeCatalog = typeof soundscapeCatalog;
