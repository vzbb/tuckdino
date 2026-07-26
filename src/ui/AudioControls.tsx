"use client";

import { useEffect, useState } from "react";

export function AudioControls() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    try {
      setMuted(!!JSON.parse(localStorage.getItem("rawrcade_audio") ?? "{}").muted);
    } catch {
      setMuted(false);
    }
  }, []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    window.dispatchEvent(new CustomEvent("rawrcade-audio-settings", { detail: { muted: next } }));
  };

  return (
    <button className="audio-button" onClick={toggle} aria-label={muted ? "Turn sound on" : "Mute sound"}>
      <span>{muted ? "🔇" : "🔊"}</span>
      <small>{muted ? "Sound off" : "Sound on"}</small>
    </button>
  );
}
