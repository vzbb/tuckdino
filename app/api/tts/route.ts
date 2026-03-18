import { GoogleGenAI } from "@google/genai";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
const TTS_CACHE_DIR = path.join(process.cwd(), ".cache", "tts");

function toBase64UrlSafe(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "voice";
}

function buildCacheKey(text: string, voiceName: string) {
  return createHash("sha256").update(`${voiceName}\n${text}`).digest("hex");
}

function pcm16ToWavBuffer(pcmBytes: Uint8Array, sampleRate: number, channels: number) {
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmBytes.length;

  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  writeStr(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(view, 8, "WAVE");
  writeStr(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(view, 36, "data");
  view.setUint32(40, dataSize, true);

  return Buffer.concat([Buffer.from(header), Buffer.from(pcmBytes)]);
}

function writeStr(view: DataView, offset: number, s: string) {
  for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
}

function pcmBase64ToWavBase64(pcmBase64: string, sampleRate: number, channels: number) {
  const pcmBuffer = Buffer.from(pcmBase64, "base64");
  const wavBuffer = pcm16ToWavBuffer(new Uint8Array(pcmBuffer), sampleRate, channels);
  return wavBuffer.toString("base64");
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing GEMINI_API_KEY (or GOOGLE_API_KEY) env var." }),
      { status: 500 }
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { text?: string; voiceName?: string }
    | null;

  const text = (body?.text || "").trim();
  const voiceName = (body?.voiceName || "Leda").trim();

  if (!text) {
    return new Response(JSON.stringify({ error: "text required" }), { status: 400 });
  }

  const sampleRate = 24000;
  const channels = 1;
  const cacheKey = buildCacheKey(text, voiceName);
  const voiceSlug = toBase64UrlSafe(voiceName.toLowerCase());
  const cacheBase = path.join(TTS_CACHE_DIR, `${voiceSlug}-${cacheKey}`);
  const wavPath = `${cacheBase}.wav`;
  const metaPath = `${cacheBase}.json`;

  await mkdir(TTS_CACHE_DIR, { recursive: true });

  try {
    const [wavBuffer, metaRaw] = await Promise.all([readFile(wavPath), readFile(metaPath, "utf8")]);
    const meta = JSON.parse(metaRaw) as { sampleRate?: number; channels?: number };
    return Response.json({
      audioBase64: wavBuffer.toString("base64"),
      mimeType: "audio/wav",
      sampleRate: meta.sampleRate ?? sampleRate,
      channels: meta.channels ?? channels,
      cacheHit: true,
    });
  } catch {
    // Cache miss, continue to Gemini.
  }

  const ai = new GoogleGenAI({ apiKey });

  // TTS models accept text prompts. We give style guidance while ensuring the main
  // content is what we want spoken.
  const prompt = [
    "You are a friendly baby dinosaur talking to a toddler.",
    "Speak warmly, playfully, and slowly.",
    "Say this exact line:",
    text,
  ].join("\n");

  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const data =
    (response as any).candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!data) {
    return new Response(JSON.stringify({ error: "No audio returned from model." }), { status: 500 });
  }

  const wavBase64 = pcmBase64ToWavBase64(data, sampleRate, channels);
  const wavBuffer = Buffer.from(wavBase64, "base64");

  await Promise.all([
    writeFile(wavPath, wavBuffer),
    writeFile(
      metaPath,
      JSON.stringify(
        {
          text,
          voiceName,
          model: TTS_MODEL,
          sampleRate,
          channels,
          createdAt: new Date().toISOString(),
        },
        null,
        2
      ),
      "utf8"
    ),
  ]);

  return Response.json({
    audioBase64: wavBase64,
    mimeType: "audio/wav",
    sampleRate,
    channels,
    cacheHit: false,
  });
}
