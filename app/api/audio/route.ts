import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const AUDIO_MODEL = process.env.GEMINI_AUDIO_MODEL || "gemini-2.5-flash-lite";

const schema = {
  type: "object",
  required: ["transcript", "intent", "excitement_level"],
  properties: {
    transcript: {
      type: "string",
      description:
        "Best-effort transcription of toddler speech. Empty string if unclear.",
    },
    intent: {
      type: "string",
      enum: [
        "greeting",
        "calling_dino",
        "saying_tucker",
        "excited",
        "random",
        "unknown",
      ],
    },
    excitement_level: { type: "number", minimum: 0, maximum: 1 },
  },
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing GEMINI_API_KEY (or GOOGLE_API_KEY) env var." }),
      { status: 500 }
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { wavBase64?: string; mimeType?: string; gameState?: unknown }
    | null;

  const wavBase64 = body?.wavBase64;
  const mimeType = body?.mimeType || "audio/wav";
  if (!wavBase64) {
    return new Response(JSON.stringify({ error: "wavBase64 required" }), { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = [
    "You are transcribing a SHORT audio clip (3-5 seconds) of a 3-year-old toddler.",
    "Do your best to transcribe the speech. The toddler may speak in broken sentences.",
    "",
    "Then detect an intent label from this set:",
    "greeting, calling_dino, saying_tucker, excited, random, unknown",
    "",
    "Also estimate excitement_level from 0..1.",
    "",
    "Guidelines:",
    "- If unclear, transcript can be empty string and intent 'unknown'.",
    "- If you hear laughing/squeals, that can still be intent 'excited'.",
    "",
    "Return ONLY valid JSON matching the provided schema.",
  ].join("\n");

  const response = await ai.models.generateContent({
    model: AUDIO_MODEL,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: wavBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: schema,
      temperature: 0.2,
    },
  });

  const text = (response as any).text as string;
  try {
    const parsed = JSON.parse(text);
    return Response.json(parsed);
  } catch {
    return Response.json({ transcript: "", intent: "unknown", excitement_level: 0.0 });
  }
}
