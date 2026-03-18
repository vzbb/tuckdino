export type FaceResult = {
  emotion: "happy" | "neutral" | "excited" | "tired" | "confused";
  confidence: number;
};

export type AudioResult = {
  transcript: string;
  intent:
    | "greeting"
    | "calling_dino"
    | "saying_tucker"
    | "excited"
    | "random"
    | "unknown";
  excitement_level: number;
};

export type DinoDirectiveResult = {
  mood: "calm" | "playful" | "excited" | "comforting";
  animation:
    | "idle"
    | "walk"
    | "run"
    | "hop"
    | "happy_jump"
    | "nuzzle"
    | "sit"
    | "look_at_camera"
    | "clap"
    | "wave";
  shouldSpeak: boolean;
  speech_text?: string;
  moveTarget?: { x: number; y: number; z: number };
};

export type TtsResult = {
  audioBase64: string;
  mimeType?: string;
  sampleRate: number;
  channels: number;
  cacheHit?: boolean;
};

async function postJson<T>(url: string, body: unknown, timeoutMs = 12_000): Promise<T> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`POST ${url} failed (${res.status}): ${msg}`);
    }
    return (await res.json()) as T;
  } finally {
    window.clearTimeout(t);
  }
}

export async function geminiFace(imageBase64Jpeg: string, gameState: unknown): Promise<FaceResult> {
  return postJson<FaceResult>("/api/face", { imageBase64Jpeg, gameState });
}

export async function geminiAudio(wavBase64: string, gameState: unknown): Promise<AudioResult> {
  return postJson<AudioResult>("/api/audio", { wavBase64, mimeType: "audio/wav", gameState }, 18_000);
}

export async function geminiBrain(context: unknown): Promise<DinoDirectiveResult> {
  return postJson<DinoDirectiveResult>("/api/brain", { context }, 14_000);
}

export async function geminiTts(text: string, voiceName: string): Promise<TtsResult> {
  return postJson<TtsResult>("/api/tts", { text, voiceName }, 18_000);
}
