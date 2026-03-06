"use client";

import { useEffect, useRef, useState } from "react";
import { uint8ArrayToBase64 } from "@/src/systems/utils/base64";

type Options = {
  enabled: boolean;
  chunkMs?: number; // 3000-5000 suggested
  targetSampleRate?: number; // optional resample
  onChunk: (wavBase64: string) => void;
};

/**
 * Microphone capture that emits WAV (base64) chunks.
 * This is intentionally simple and “good enough” for toddler speech.
 */
export function useMicWavChunks({
  enabled,
  chunkMs = 4000,
  targetSampleRate = 16000,
  onChunk,
}: Options) {
  const [ready, setReady] = useState(false);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const bufRef = useRef<Float32Array[]>([]);
  const bufSamplesRef = useRef<number>(0);

  useEffect(() => {
    let canceled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        if (canceled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;

        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;

        const src = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        src.connect(processor);
        const gain = audioCtx.createGain();
        gain.gain.value = 0;
        processor.connect(gain);
        gain.connect(audioCtx.destination);

        processor.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          // copy because input buffer is reused
          const copy = new Float32Array(input.length);
          copy.set(input);
          bufRef.current.push(copy);
          bufSamplesRef.current += copy.length;

          const inputSampleRate = audioCtx.sampleRate;
          const chunkSamples = Math.floor((chunkMs / 1000) * inputSampleRate);

          if (bufSamplesRef.current >= chunkSamples) {
            const merged = mergeFloat32(bufRef.current, bufSamplesRef.current);
            // reset
            bufRef.current = [];
            bufSamplesRef.current = 0;

            // take exactly chunkSamples from merged (discard any extra to simplify)
            const slice = merged.subarray(0, chunkSamples);

            const resampled =
              targetSampleRate && targetSampleRate !== inputSampleRate
                ? resampleLinear(slice, inputSampleRate, targetSampleRate)
                : slice;

            const wavBytes = encodeWavPcm16(resampled, targetSampleRate || inputSampleRate);
            const wavBase64 = uint8ArrayToBase64(wavBytes);
            onChunk(wavBase64);
          }
        };

        setReady(true);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Mic permission denied or unavailable:", err);
        setReady(false);
      }
    }

    function stop() {
      setReady(false);
      bufRef.current = [];
      bufSamplesRef.current = 0;

      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
        processorRef.current = null;
      }

      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => undefined);
        audioCtxRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    }

    if (enabled) start();
    else stop();

    return () => {
      canceled = true;
      stop();
    };
  }, [enabled, chunkMs, targetSampleRate, onChunk]);

  return { ready };
}

function mergeFloat32(chunks: Float32Array[], totalLength: number) {
  const out = new Float32Array(totalLength);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

// Basic linear resampling (fast + “good enough”)
function resampleLinear(input: Float32Array, inRate: number, outRate: number) {
  const ratio = inRate / outRate;
  const outLength = Math.floor(input.length / ratio);
  const out = new Float32Array(outLength);

  for (let i = 0; i < outLength; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = input[idx] ?? 0;
    const b = input[idx + 1] ?? a;
    out[i] = a + (b - a) * frac;
  }
  return out;
}

function encodeWavPcm16(samples: Float32Array, sampleRate: number) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeStr(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(view, 8, "WAVE");

  writeStr(view, 12, "fmt ");
  view.setUint32(16, 16, true); // PCM
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);

  writeStr(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Uint8Array(buffer);
}

function writeStr(view: DataView, offset: number, s: string) {
  for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
}
