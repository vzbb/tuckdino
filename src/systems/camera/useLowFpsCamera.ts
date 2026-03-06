"use client";

import { useEffect, useRef, useState } from "react";

export function useLowFpsCamera(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let canceled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 320 },
            height: { ideal: 240 },
          },
          audio: false,
        });

        if (canceled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        const v = document.createElement("video");
        v.playsInline = true;
        v.muted = true;
        v.autoplay = true;
        v.srcObject = stream;
        videoRef.current = v;

        await v.play().catch(() => undefined);
        setReady(true);
      } catch (err) {
        console.warn("Camera permission denied or unavailable:", err);
        setReady(false);
      }
    }

    function stop() {
      setReady(false);
      videoRef.current?.pause();
      videoRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }

    if (enabled) start();
    else stop();

    return () => {
      canceled = true;
      stop();
    };
  }, [enabled]);

  const captureBase64Jpeg = (w = 160, h = 120, quality = 0.6) => {
    const v = videoRef.current;
    if (!v || !ready || typeof document === "undefined") return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }

    const canvas = canvasRef.current;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(v, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);

    const idx = dataUrl.indexOf(",");
    return idx >= 0 ? dataUrl.slice(idx + 1) : null;
  };

  return { ready, captureBase64Jpeg };
}