"use client";

import { useEffect, useRef } from "react";
import {
  useGameStore,
  type DinoAnimationKey,
  type DinoDirective,
  type FaceEmotion,
} from "@/src/state/useGameStore";
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
    world: {
      interestPoints: s.interestPoints,
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
  const consecutiveFailures = useRef<number>(0);
  const disabledUntil = useRef<number>(0);

  useEffect(() => {
    const id = window.setInterval(async () => {
      const s = useGameStore.getState();
      const now = performance.now();

      if (s.scene !== "world") return;
      if (now < disabledUntil.current) return;

      const faceUpdatedAt = s.face?.updatedAt ?? 0;
      const speechUpdatedAt = s.speech?.updatedAt ?? 0;

      const hasNewFace = faceUpdatedAt > lastFaceAt.current;
      const hasNewSpeech = speechUpdatedAt > lastSpeechAt.current;
      const hasNewEvents = s.recentEvents.length !== lastEventsLen.current;

      const idleForMs = now - lastSpokeAt.current;
      const shouldProactivelyPing = idleForMs > 12_000;

      const shouldCall =
        (hasNewFace || hasNewSpeech || hasNewEvents || shouldProactivelyPing) &&
        now - lastBrainAt.current > 2200;

      if (!shouldCall) return;
      if (inFlight.current) return;

      inFlight.current = true;
      lastBrainAt.current = now;
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
          moveTarget: res.moveTarget,
        };

        setDirective(directive);
        consecutiveFailures.current = 0;
        disabledUntil.current = 0;

        // If moveTarget is a known interest point, record the event
        if (directive.moveTarget) {
          const point = s.interestPoints.find(p => 
            Math.abs(p.pos.x - directive.moveTarget!.x) < 0.1 && 
            Math.abs(p.pos.z - directive.moveTarget!.z) < 0.1
          );
          if (point) {
            useGameStore.getState().pushEvent({
              t: Date.now(),
              type: "dino_investigate",
              targetId: point.id
            });
          }
        }

        clearEvents();

        if (directive.shouldSpeak && directive.speech_text) {
          lastSpokeAt.current = performance.now();
          await speak({ text: directive.speech_text, mood: directive.mood, sceneHint: "world" });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Brain loop error (fallback engaged):", err);
        consecutiveFailures.current += 1;
        disabledUntil.current =
          now + Math.min(60_000, 8_000 * consecutiveFailures.current);

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

  // Local proximity reactive loop (for immediate wiggles/reactions)
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = useGameStore.getState();
      if (s.scene !== "world") return;

      const dPos = s.dinoPos;
      
      // Find closest interest point
      let closestDist = Infinity;
      let closestId = "";
      s.interestPoints.forEach(p => {
        const dist = Math.sqrt(Math.pow(p.pos.x - dPos.x, 2) + Math.pow(p.pos.z - dPos.z, 2));
        if (dist < closestDist) {
          closestDist = dist;
          closestId = p.id;
        }
      });

      // If very close to an interest point and idle/calm, trigger a small reaction
      if (closestDist < 1.5 && s.dinoDirective.animation === "idle") {
        const point = s.interestPoints.find(p => p.id === closestId);
        if (point) {
          // Special reaction based on type
          let anim: DinoAnimationKey = "look_at_camera";
          if (point.type === "flowers") anim = "nuzzle";
          else if (point.type === "camp") anim = "sit";
          else if (point.type === "stream") anim = "hop";

          setDirective({
            ...s.dinoDirective,
            animation: anim,
            mood: "playful"
          });
        }
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [setDirective]);
}
