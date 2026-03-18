"use client";

import { useCallback, useRef } from "react";
import { geminiTts } from "@/src/systems/ai/aiClient";
import { base64ToUint8Array } from "@/src/systems/utils/base64";
import { wavBlobFromGeminiPcmBase64 } from "@/src/systems/utils/wav";

type SpeakArgs = {
  text: string;
  mood?: "calm" | "playful" | "excited" | "comforting";
  sceneHint?: "hatching" | "world";
};

type CachedAudio = {
  audioBase64: string;
  mimeType: string;
  sampleRate: number;
  channels: number;
};

const memoryCache = new Map<string, CachedAudio>();

const DEFAULT_VOICE = process.env.NEXT_PUBLIC_DINO_VOICE_NAME || "Leda";

export function useDinoSpeak() {
  const lastSpokenAt = useRef<number>(0);
  const lastText = useRef<string>("");
  const ttsDisabledUntil = useRef<number>(0);

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
      if (now < ttsDisabledUntil.current) {
        throw new Error("Gemini TTS temporarily disabled");
      }

      const cacheKey = `${DEFAULT_VOICE}::${rawText}`;
      let cachedAudio = memoryCache.get(cacheKey) || null;
      if (!cachedAudio) {
        const tts = await geminiTts(rawText, DEFAULT_VOICE);
        cachedAudio = {
          audioBase64: tts.audioBase64,
          mimeType: tts.mimeType || "audio/wav",
          sampleRate: tts.sampleRate,
          channels: tts.channels,
        };
        memoryCache.set(cacheKey, cachedAudio);
      }

      const audioBytes = base64ToUint8Array(cachedAudio.audioBase64);
      const audioBytesCopy = new Uint8Array(audioBytes.length);
      audioBytesCopy.set(audioBytes);
      const audioBlob =
        cachedAudio.mimeType === "audio/wav"
          ? new Blob([audioBytesCopy], { type: "audio/wav" })
          : wavBlobFromGeminiPcmBase64(
              cachedAudio.audioBase64,
              cachedAudio.sampleRate,
              cachedAudio.channels
            );
      const url = URL.createObjectURL(audioBlob);

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
      if ((err as Error)?.message !== "Gemini TTS temporarily disabled") {
        ttsDisabledUntil.current = now + 60_000;
      }
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
