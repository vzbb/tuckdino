import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";

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

  return Response.json({ audioBase64: data, sampleRate: 24000, channels: 1 });
}
