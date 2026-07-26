"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGameStore, type BattleMove, type GameEvent } from "@/src/state/useGameStore";

const ROOT = "/assets/sounds/";
const url = (file: string) => `${ROOT}${file.split("/").map(encodeURIComponent).join("/")}`;

const sounds = {
  music: {
    egg: "Tender_baby-dinosaur_#1-1785017385883.mp3",
    ranch: "Warm_playful_ranch_t_#1-1785017521842.mp3",
    meadow: "Bright_open-world_me_#1-1785017497322.mp3",
    crystal: "crystal_discovery.mp3",
    mystery: "mystery_forest.mp3",
    night: "night_exploration.mp3",
    training: "training_ring.mp3",
    battle: "arena_battle.mp3",
    victory: "victory_transition_loop.mp3",
    setback: "gentle_setback.mp3",
  },
  ambience: {
    meadow: "Seamless_bright_fant_#1-1785014701893.mp3",
    quietMeadow: "quiet_meadow_variant.mp3",
    forest: "Seamless_friendly_fo_#1-1785015030432.mp3",
    ranch: "Seamless_lively_dino_#1-1785015657153.mp3",
    night: "Seamless_cozy_ranch__#1-1785018653498.mp3",
    dawn: "dawn_awakening.mp3",
    crystal: "Seamless_magical_cry_#2-1785017782856.mp3",
    mushrooms: "Seamless_whimsical_m_#3-1785017455862.mp3",
    stream: "quiet_meadow_variant.mp3",
    campfire: "Seamless_close_campf_#1-1785015796678.mp3",
  },
  sfx: {
    stomp: "Cute_heavy_dinosaur__#4-1785010397025.wav",
    tail: "leafy_forest_movement.mp3",
    brace: "Rustic_wooden_ranch__#1-1785017910232.mp3",
    charge: "Friendly_young_dinos_#1-1785014572922.mp3",
    reward: "battle_to_victory.mp3",
    celebration: "Small_ranch_celebrat_#1-1785018148030.mp3",
    discovery: "Tiny_magical_object__#3-1785019591181.mp3",
    crystal: "Seamless_magical_cry_#1-1785017782854.mp3",
    mushrooms: "Seamless_whimsical_m_#1-1785017428096.mp3",
    butterfly: "butterfly_flutter.mp3",
    trail: "glowing_trail.mp3",
    water: "shallow_water_movement.mp3",
    hatch: "baby_dinosaur_scamper.mp3",
    camp: "Canvas_tent_gently_s_#1-1785015787382.mp3",
    gate: "Rustic_wooden_ranch__#2-1785017979414.mp3",
    training: "wind_gust.mp3",
  },
  movement: {
    playerWalk: "player_walking.mp3",
    dinoRun: "dinosaur_running.mp3",
  },
  transitions: {
    toBattle: "exploration_to_battle.mp3",
    toVictory: "battle_to_victory.mp3",
    toSetback: "c_major_to_a_minor.mp3",
    toHappy: "a_minor_to_c_major.mp3",
  },
} as const;

type VolumeSettings = { muted: boolean; music: number; ambience: number; sfx: number };
const defaults: VolumeSettings = { muted: false, music: .34, ambience: .24, sfx: .62 };

function loadSettings(): VolumeSettings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem("rawrcade_audio") ?? "{}") };
  } catch {
    return defaults;
  }
}

function eventSound(event: GameEvent): string | null {
  switch (event.type) {
    case "egg_selected": return sounds.sfx.discovery;
    case "egg_hatched": return sounds.sfx.hatch;
    case "arena_started": return sounds.sfx.charge;
    case "battle_move": return event.move === "stomp" ? sounds.sfx.stomp : event.move === "tail_whip" ? sounds.sfx.tail : sounds.sfx.brace;
    case "training_completed": return sounds.sfx.training;
    case "arena_reward": return sounds.sfx.reward;
    case "camp_crest_celebration": return sounds.sfx.celebration;
    case "dino_action": return event.action === "bathe" ? sounds.sfx.water : event.action === "camp" ? sounds.sfx.camp : event.action === "play" ? sounds.sfx.butterfly : null;
    case "collectible_found":
      if (event.id.includes("crystal")) return sounds.sfx.crystal;
      if (event.id.includes("mushroom")) return sounds.sfx.mushrooms;
      if (event.id.includes("stepping")) return sounds.sfx.water;
      return sounds.sfx.discovery;
    default: return null;
  }
}

export function useGameAudio() {
  const scene = useGameStore((s) => s.scene);
  const mode = useGameStore((s) => s.adventure.mode);
  const dayPhase = useGameStore((s) => s.dayPhase);
  const playerMoving = useGameStore((s) => !!s.playerTarget);
  const atRanch = useGameStore((s) => (s.playerPos.x - 4.2) ** 2 + (s.playerPos.z - 8.4) ** 2 < 110);
  const nearCrystal = useGameStore((s) => (s.playerPos.x - 13) ** 2 + (s.playerPos.z + 4) ** 2 < 55);
  const nearMushrooms = useGameStore((s) => (s.playerPos.x + 12) ** 2 + (s.playerPos.z - 2) ** 2 < 55);
  const nearStream = useGameStore((s) => s.playerPos.z < -9);
  const campActive = useGameStore((s) => s.campActive);
  const lastEvent = useGameStore((s) => s.recentEvents[s.recentEvents.length - 1]);
  const [unlocked, setUnlocked] = useState(false);
  const settings = useRef<VolumeSettings>(defaults);
  const music = useRef<HTMLAudioElement | null>(null);
  const ambience = useRef<HTMLAudioElement | null>(null);
  const campfire = useRef<HTMLAudioElement | null>(null);
  const footsteps = useRef<HTMLAudioElement | null>(null);
  const dinoSteps = useRef<HTMLAudioElement | null>(null);
  const previousMode = useRef(mode);
  const handledEvent = useRef(0);

  const makeLoop = useCallback((file: string, volume: number) => {
    const audio = new Audio(url(file));
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = settings.current.muted ? 0 : volume;
    return audio;
  }, []);

  const playOneShot = useCallback((file: string, volume = 1) => {
    if (!unlocked || settings.current.muted) return;
    const audio = new Audio(url(file));
    audio.preload = "auto";
    audio.volume = Math.min(1, settings.current.sfx * volume);
    void audio.play().catch(() => undefined);
  }, [unlocked]);

  const crossfade = useCallback((slot: React.MutableRefObject<HTMLAudioElement | null>, file: string, target: number) => {
    if (!unlocked) return;
    const old = slot.current;
    if (old?.dataset.file === file) {
      old.volume = settings.current.muted ? 0 : target;
      return;
    }
    const next = makeLoop(file, 0);
    next.dataset.file = file;
    slot.current = next;
    void next.play().catch(() => undefined);
    const started = performance.now();
    const fade = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - started) / 1400);
      next.volume = settings.current.muted ? 0 : target * progress;
      if (old) old.volume = settings.current.muted ? 0 : target * (1 - progress);
      if (progress >= 1) {
        window.clearInterval(fade);
        old?.pause();
      }
    }, 50);
  }, [makeLoop, unlocked]);

  useEffect(() => {
    settings.current = loadSettings();
    const unlock = () => setUnlocked(true);
    const update = (event: Event) => {
      settings.current = { ...settings.current, ...(event as CustomEvent<Partial<VolumeSettings>>).detail };
      localStorage.setItem("rawrcade_audio", JSON.stringify(settings.current));
      [music.current, ambience.current, campfire.current, footsteps.current, dinoSteps.current].forEach((audio) => {
        if (audio && settings.current.muted) audio.volume = 0;
      });
      setUnlocked(false);
      window.setTimeout(() => setUnlocked(true), 0);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("rawrcade-audio-settings", update);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("rawrcade-audio-settings", update);
    };
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const track = scene !== "world" ? sounds.music.egg
      : mode === "training" ? sounds.music.training
      : mode === "battle" ? sounds.music.battle
      : mode === "victory" ? sounds.music.victory
      : mode === "resolving" ? sounds.music.setback
      : dayPhase === "night" ? sounds.music.night
      : nearCrystal ? sounds.music.crystal
      : nearMushrooms ? sounds.music.mystery
      : atRanch ? sounds.music.ranch
      : sounds.music.meadow;
    crossfade(music, track, settings.current.music);
  }, [atRanch, crossfade, dayPhase, mode, nearCrystal, nearMushrooms, scene, unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    if (scene !== "world") {
      ambience.current?.pause();
      ambience.current = null;
      return;
    }
    const track = dayPhase === "night" ? sounds.ambience.night
      : dayPhase === "morning" ? sounds.ambience.dawn
      : nearCrystal ? sounds.ambience.crystal
      : nearMushrooms ? sounds.ambience.mushrooms
      : nearStream ? sounds.ambience.stream
      : atRanch ? sounds.ambience.ranch
      : sounds.ambience.meadow;
    crossfade(ambience, track, settings.current.ambience);
  }, [atRanch, crossfade, dayPhase, nearCrystal, nearMushrooms, nearStream, scene, unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    const transition = previousMode.current !== mode
      ? mode === "battle" ? sounds.transitions.toBattle
      : mode === "victory" ? sounds.transitions.toVictory
      : mode === "resolving" ? sounds.transitions.toSetback
      : previousMode.current === "victory" || previousMode.current === "resolving" ? sounds.transitions.toHappy
      : null
      : null;
    if (transition) playOneShot(transition, .72);
    previousMode.current = mode;
  }, [mode, playOneShot, unlocked]);

  useEffect(() => {
    if (!lastEvent || lastEvent.t <= handledEvent.current) return;
    handledEvent.current = lastEvent.t;
    const file = eventSound(lastEvent);
    if (file) playOneShot(file);
  }, [lastEvent, playOneShot]);

  useEffect(() => {
    const active = unlocked && scene === "world" && playerMoving && mode !== "battle" && mode !== "victory" && mode !== "resolving";
    if (active && !footsteps.current) {
      footsteps.current = makeLoop(sounds.movement.playerWalk, settings.current.sfx * .28);
      dinoSteps.current = makeLoop(sounds.movement.dinoRun, settings.current.sfx * .22);
      void footsteps.current.play().catch(() => undefined);
      void dinoSteps.current.play().catch(() => undefined);
    } else if (!active) {
      footsteps.current?.pause();
      dinoSteps.current?.pause();
      footsteps.current = null;
      dinoSteps.current = null;
    }
  }, [makeLoop, mode, playerMoving, scene, unlocked]);

  useEffect(() => {
    if (unlocked && scene === "world" && campActive && !campfire.current) {
      campfire.current = makeLoop(sounds.ambience.campfire, settings.current.ambience * .5);
      void campfire.current.play().catch(() => undefined);
    } else if ((!campActive || scene !== "world") && campfire.current) {
      campfire.current.pause();
      campfire.current = null;
    }
  }, [campActive, makeLoop, scene, unlocked]);

  useEffect(() => () => {
    [music.current, ambience.current, campfire.current, footsteps.current, dinoSteps.current].forEach((audio) => audio?.pause());
  }, []);
}
