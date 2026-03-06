"use client";

import { useCallback, useRef } from "react";
import { geminiTts } from "@/src/systems/ai/aiClient";
import { wavBlobFromGeminiPcmBase64 } from "@/src/systems/utils/wav";

type SpeakArgs = {
  text: string;
  mood?: "calm" | "playful" | "excited" | "comforting";
  sceneHint?: "hatching" | "world";
};

const memoryCache = new Map<string, string>(); // text -> pcmBase64

const DEFAULT_VOICE = process.env.NEXT_PUBLIC_DINO_VOICE_NAME || "Leda";

export function useDinoSpeak() {
  const lastSpokenAt = useRef<number>(0);
  const lastText = useRef<string>("");

  // Reuse a single audio element to avoid stacking too many
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  return useCallback(async (args: SpeakArgs) => {
    const rawText = (args.text || "").trim();
    if (!rawText) return;

    const now = performance.now();
    if (rawText === lastText.current && now - lastSpokenAt.current < 1200) {
      return;
    }
    lastText.current = rawText;
    lastSpokenAt.current = now;

    // Try Gemini TTS first (server route), fallback to browser TTS
    try {
      let pcmBase64 = memoryCache.get(rawText) || null;
      if (!pcmBase64) {
        const tts = await geminiTts(rawText, DEFAULT_VOICE);
        pcmBase64 = tts.audioBase64;
        memoryCache.set(rawText, pcmBase64);
      }

      const wav = wavBlobFromGeminiPcmBase64(pcmBase64, 24000, 1);
      const url = URL.createObjectURL(wav);

      let audio = audioElRef.current;
      if (!audio) {
        audio = new Audio();
        audioElRef.current = audio;
      }

      audio.pause();
      audio.src = url;
      audio.currentTime = 0;
      await audio.play().catch(() => {
        // If autoplay blocks, fallback
        throw new Error("Audio playback blocked");
      });

      // Cleanup URL after playback begins
      window.setTimeout(() => URL.revokeObjectURL(url), 12_000);
      return;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Gemini TTS failed; using browser speech synthesis.", err);
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(rawText);
        u.rate = 0.95;
        u.pitch = 1.2;
        u.volume = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    }
  }, []);
}
