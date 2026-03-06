"use client";

import { useEffect, useRef } from "react";
import { useGameStore, type DinoDirective, type FaceEmotion } from "@/src/state/useGameStore";
import { geminiBrain } from "@/src/systems/ai/aiClient";
import { useDinoSpeak } from "@/src/systems/ai/useDinoSpeak";

function buildContext() {
  const s = useGameStore.getState();
  return {
    childName: s.childName,
    scene: s.scene,
    time: {
      localTime: new Date().toISOString(),
      dayPhase: s.dayPhase,
      dayLight: s.dayLight,
    },
    player: {
      pos: s.playerPos,
      hasTarget: !!s.playerTarget,
      target: s.playerTarget,
    },
    dino: {
      pos: s.dinoPos,
      scale: s.dinoScale,
      stats: s.dinoStats,
      lastDirective: s.dinoDirective,
    },
    sensors: {
      face: s.face,
      speech: s.speech,
    },
    recentEvents: s.recentEvents.slice(-12),
    camp: {
      active: s.campActive,
      pos: s.campPos,
    },
  };
}

function localFallbackDirective(
  emotion: FaceEmotion | null,
  hasMoveTarget: boolean,
  childName: string
): DinoDirective {
  if (hasMoveTarget) {
    return { mood: "excited", animation: "hop", shouldSpeak: true, speech_text: `This way, ${childName}!` };
  }
  if (emotion === "excited") {
    return { mood: "excited", animation: "happy_jump", shouldSpeak: true, speech_text: `Yay ${childName}!` };
  }
  if (emotion === "happy") {
    return { mood: "playful", animation: "wave", shouldSpeak: false };
  }
  if (emotion === "tired") {
    return { mood: "comforting", animation: "sit", shouldSpeak: true, speech_text: `Hi ${childName}. Cozy time?` };
  }
  if (emotion === "confused") {
    return { mood: "comforting", animation: "look_at_camera", shouldSpeak: true, speech_text: `It’s okay, ${childName}. I’m here.` };
  }
  return { mood: "calm", animation: "idle", shouldSpeak: false };
}

export function useDinoBrainLoop() {
  const setDirective = useGameStore((s) => s.setDinoDirective);
  const clearEvents = useGameStore((s) => s.clearEvents);

  const speak = useDinoSpeak();

  const inFlight = useRef(false);
  const lastBrainAt = useRef<number>(0);
  const lastFaceAt = useRef<number>(0);
  const lastSpeechAt = useRef<number>(0);
  const lastEventsLen = useRef<number>(0);
  const lastSpokeAt = useRef<number>(0);

  useEffect(() => {
    const id = window.setInterval(async () => {
      const s = useGameStore.getState();

      const faceUpdatedAt = s.face?.updatedAt ?? 0;
      const speechUpdatedAt = s.speech?.updatedAt ?? 0;

      const hasNewFace = faceUpdatedAt > lastFaceAt.current;
      const hasNewSpeech = speechUpdatedAt > lastSpeechAt.current;
      const hasNewEvents = s.recentEvents.length !== lastEventsLen.current;

      const idleForMs = performance.now() - lastSpokeAt.current;
      const shouldProactivelyPing = idleForMs > 12_000;

      const shouldCall =
        (hasNewFace || hasNewSpeech || hasNewEvents || shouldProactivelyPing) &&
        performance.now() - lastBrainAt.current > 2200;

      if (!shouldCall) return;
      if (inFlight.current) return;

      inFlight.current = true;
      lastBrainAt.current = performance.now();
      lastFaceAt.current = faceUpdatedAt;
      lastSpeechAt.current = speechUpdatedAt;
      lastEventsLen.current = s.recentEvents.length;

      try {
        const ctx = buildContext();
        const res = await geminiBrain(ctx);

        const directive: DinoDirective = {
          mood: res.mood,
          animation: res.animation,
          shouldSpeak: res.shouldSpeak,
          speech_text: res.speech_text,
        };

        setDirective(directive);
        clearEvents();

        if (directive.shouldSpeak && directive.speech_text) {
          lastSpokeAt.current = performance.now();
          await speak({ text: directive.speech_text, mood: directive.mood, sceneHint: s.scene === "hatching" ? "hatching" : "world" });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Brain loop error (fallback engaged):", err);

        const fallback = localFallbackDirective(
          s.face?.emotion ?? null,
          !!s.playerTarget,
          s.childName
        );
        setDirective(fallback);
        clearEvents();

        if (fallback.shouldSpeak && fallback.speech_text) {
          lastSpokeAt.current = performance.now();
          await speak({ text: fallback.speech_text, mood: fallback.mood, sceneHint: "world" });
        }
      } finally {
        inFlight.current = false;
      }
    }, 500);

    return () => window.clearInterval(id);
  }, [setDirective, clearEvents, speak]);
}
