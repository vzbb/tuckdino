"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/src/state/useGameStore";
import { RadialMenu } from "@/src/ui/RadialMenu";

function TogglePill({
  label,
  emoji,
  enabled,
  onToggle,
}: {
  label: string;
  emoji: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.16)",
        background: enabled ? "rgba(122,162,255,0.28)" : "rgba(0,0,0,0.25)",
        color: "white",
        fontSize: 18,
        boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
      }}
    >
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <span style={{ fontWeight: 700 }}>{label}</span>
      <span style={{ opacity: 0.85 }}>{enabled ? "ON" : "OFF"}</span>
    </button>
  );
}

export function HUD() {
  const scene = useGameStore((s) => s.scene);
  const radialOpen = useGameStore((s) => s.radialMenuOpen);

  const cameraEnabled = useGameStore((s) => s.cameraEnabled);
  const micEnabled = useGameStore((s) => s.micEnabled);

  const setCameraEnabled = useGameStore((s) => s.setCameraEnabled);
  const setMicEnabled = useGameStore((s) => s.setMicEnabled);

  const dayPhase = useGameStore((s) => s.dayPhase);

  // Tiny hint that fades away after a few seconds
  const [showHint, setShowHint] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setShowHint(false), 7500);
    return () => window.clearTimeout(t);
  }, [scene]);

  const phaseEmoji =
    dayPhase === "morning"
      ? "🌅"
      : dayPhase === "afternoon"
      ? "☀️"
      : dayPhase === "evening"
      ? "🌇"
      : "🌙";

  return (
    <>
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          pointerEvents: "auto",
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <TogglePill
            label="Camera"
            emoji="📷"
            enabled={cameraEnabled}
            onToggle={() => setCameraEnabled(!cameraEnabled)}
          />
          <TogglePill
            label="Mic"
            emoji="🎤"
            enabled={micEnabled}
            onToggle={() => setMicEnabled(!micEnabled)}
          />
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(0,0,0,0.25)",
            color: "white",
            fontSize: 18,
            boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
          }}
        >
          <span style={{ fontSize: 22 }}>{phaseEmoji}</span>
          <span style={{ fontWeight: 800, letterSpacing: 0.2 }}>
            {dayPhase.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Gentle hint */}
      {showHint && (
        <div
          style={{
            position: "absolute",
            bottom: 18,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              pointerEvents: "none",
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "white",
              padding: "12px 16px",
              borderRadius: 18,
              fontSize: 20,
              fontWeight: 800,
              boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
            }}
          >
            {scene === "egg"
              ? "👆 Tap an egg!"
              : "👆 Tap the ground to walk"}
          </div>
        </div>
      )}

      {radialOpen && <RadialMenu />}
    </>
  );
}
