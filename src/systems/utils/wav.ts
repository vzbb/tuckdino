import { base64ToUint8Array } from "@/src/systems/utils/base64";

/**
 * Wrap raw PCM16 bytes into a WAV container so the browser can play it easily.
 * - pcmBytes: little-endian 16-bit signed PCM
 */
export function pcm16ToWavBlob(pcmBytes: Uint8Array, sampleRate: number, channels: number) {
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmBytes.length;

  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // "RIFF"
  writeStr(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(view, 8, "WAVE");

  // fmt chunk
  writeStr(view, 12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // audio format 1 = PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  writeStr(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const blob = new Blob([header, pcmBytes], { type: "audio/wav" });
  return blob;
}

function writeStr(view: DataView, offset: number, s: string) {
  for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
}

export function wavBlobFromGeminiPcmBase64(pcmBase64: string, sampleRate = 24000, channels = 1) {
  const pcmBytes = base64ToUint8Array(pcmBase64);
  return pcm16ToWavBlob(pcmBytes, sampleRate, channels);
}
