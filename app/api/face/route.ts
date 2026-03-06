import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const FACE_MODEL = process.env.GEMINI_FACE_MODEL || "gemini-2.5-flash-lite";

const schema = {
  type: "object",
  required: ["emotion", "confidence"],
  properties: {
    emotion: {
      type: "string",
      enum: ["happy", "neutral", "excited", "tired", "confused"],
      description: "Toddler facial emotion classification.",
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Confidence 0..1",
    },
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
    | { imageBase64Jpeg?: string; gameState?: unknown }
    | null;

  const imageBase64Jpeg = body?.imageBase64Jpeg;
  if (!imageBase64Jpeg) {
    return new Response(JSON.stringify({ error: "imageBase64Jpeg required" }), { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = [
    "You are analyzing ONE low-resolution image of a toddler's face.",
    "Classify the emotion as exactly ONE of:",
    "happy, neutral, excited, tired, confused.",
    "",
    "Rules:",
    "- Be conservative: if face is not clear, return neutral with low confidence.",
    "- Use only what is visible in the image.",
    "",
    "Return ONLY valid JSON matching the provided schema.",
  ].join("\n");

  const response = await ai.models.generateContent({
    model: FACE_MODEL,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64Jpeg,
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

  // @google/genai returns structured output as JSON text in response.text
  const text = (response as any).text as string;
  try {
    const parsed = JSON.parse(text);
    return Response.json(parsed);
  } catch {
    // If parsing fails, still return a safe default.
    return Response.json({ emotion: "neutral", confidence: 0.2 });
  }
}
