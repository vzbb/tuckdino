import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const BRAIN_MODEL = process.env.GEMINI_BRAIN_MODEL || "gemini-2.5-flash-lite";

const schema = {
  type: "object",
  required: ["mood", "animation", "shouldSpeak"],
  properties: {
    mood: {
      type: "string",
      enum: ["calm", "playful", "excited", "comforting"],
    },
    animation: {
      type: "string",
      enum: [
        "idle",
        "walk",
        "run",
        "hop",
        "happy_jump",
        "nuzzle",
        "sit",
        "look_at_camera",
        "clap",
        "wave",
      ],
    },
    shouldSpeak: { type: "boolean" },
    speech_text: {
      type: "string",
      description:
        "If shouldSpeak is true, provide a SHORT phrase (3-6 words).",
    },
    moveTarget: {
      type: "object",
      properties: {
        x: { type: "number" },
        y: { type: "number" },
        z: { type: "number" },
      },
      description: "Optional coordinate to move towards (e.g., an interest point).",
    },
  },
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return Response.json({ mood: "calm", animation: "idle", shouldSpeak: false });
  }

  const body = (await req.json().catch(() => null)) as { context?: unknown } | null;
  if (!body?.context) {
    return new Response(JSON.stringify({ error: "context required" }), { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = [
    "You are a friendly baby dinosaur companion in a cozy game for a 3-year-old child named Tucker.",
    "",
    "PERSONALITY RULES (very important):",
    "- Always be warm, playful, and kind.",
    "- Never scold, shame, threaten, or say anything mean.",
    "- Never say 'wrong' or 'bad'.",
    "- Encourage smiles, curiosity, and gentle behavior.",
    "",
    "SPEECH STYLE:",
    "- Use Tucker's name often.",
    "- Speak in very short sentences: 3 to 6 words.",
    "- Simple toddler-friendly words.",
    "- If asking a question, keep it yes/no or choice-like.",
    "",
    "BEHAVIOR & MOVEMENT:",
    "- If Tucker taps to move, you lead the way happily.",
    "- If Tucker looks tired/confused, be comforting and calm.",
    "- If Tucker is excited/happy, celebrate gently.",
    "- If idle, proactively invite a tiny activity (water, flowers, campfire) without being pushy.",
    "- You can autonomously move to 'interestPoints' in the world (e.g., flowers, hut, camp).",
    "- To move towards an interest point, provide its exact 'pos' in the 'moveTarget' field.",
    "",
    "OUTPUT:",
    "- Return ONLY valid JSON that matches the response schema exactly.",
    "- Choose ONE animation from the enum list.",
    "- 'shouldSpeak' should be true only if you have something helpful to say now. Avoid spamming.",
  ].join("\n");

  const userPrompt = [
    "Game context (JSON):",
    JSON.stringify(body.context),
    "",
    "Decide the next dino behavior.",
    "If you set shouldSpeak=true, provide speech_text that includes 'Tucker' if possible.",
  ].join("\n");

  const response = await ai.models.generateContent({
    model: BRAIN_MODEL,
    contents: [
      {
        parts: [{ text: userPrompt }],
      },
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseJsonSchema: schema,
      temperature: 0.35,
    },
  });

  const text = (response as any).text as string;
  try {
    const parsed = JSON.parse(text);
    // tiny safety guard: cap length
    if (typeof parsed.speech_text === "string" && parsed.speech_text.length > 80) {
      parsed.speech_text = parsed.speech_text.slice(0, 80);
    }
    return Response.json(parsed);
  } catch {
    return Response.json({ mood: "calm", animation: "idle", shouldSpeak: false });
  }
}
