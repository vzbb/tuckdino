"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/src/state/useGameStore";
import { useLowFpsCamera } from "@/src/systems/camera/useLowFpsCamera";
import { useMicWavChunks } from "@/src/systems/audio/useMicWavChunks";
import { geminiAudio, geminiFace } from "@/src/systems/ai/aiClient";

function gameSummary() {
  const s = useGameStore.getState();
  return {
    scene: s.scene,
    dayPhase: s.dayPhase,
    campActive: s.campActive,
    dino: {
      scale: s.dinoScale,
      stats: s.dinoStats,
    },
    lastEvents: s.recentEvents.slice(-6),
  };
}

export function useGeminiSensorLoops() {
  const cameraEnabled = useGameStore((s) => s.cameraEnabled);
  const micEnabled = useGameStore((s) => s.micEnabled);

  const setFace = useGameStore((s) => s.setFace);
  const setSpeech = useGameStore((s) => s.setSpeech);

  // Camera: low FPS image sampling
  const cam = useLowFpsCamera(cameraEnabled);

  const faceInFlight = useRef(false);

  useEffect(() => {
    if (!cameraEnabled) return;
    if (!cam.ready) return;

    const id = window.setInterval(async () => {
      if (faceInFlight.current) return;
      faceInFlight.current = true;

      try {
        const imageBase64 = cam.captureBase64Jpeg(160, 120, 0.55);
        if (!imageBase64) return;

        const res = await geminiFace(imageBase64, gameSummary());
        setFace(res.emotion, res.confidence);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Face loop error:", err);
      } finally {
        faceInFlight.current = false;
      }
    }, 1500);

    return () => window.clearInterval(id);
  }, [cameraEnabled, cam.ready, cam, setFace]);

  // Microphone: WAV chunks → Gemini
  const audioInFlight = useRef(false);
  useMicWavChunks({
    enabled: micEnabled,
    chunkMs: 4000,
    targetSampleRate: 16000,
    onChunk: async (wavBase64) => {
      if (audioInFlight.current) return;
      audioInFlight.current = true;

      try {
        const res = await geminiAudio(wavBase64, gameSummary());
        setSpeech({
          transcript: res.transcript,
          intent: res.intent,
          excitementLevel: res.excitement_level,
          updatedAt: Date.now(),
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Audio loop error:", err);
      } finally {
        audioInFlight.current = false;
      }
    },
  });
}
