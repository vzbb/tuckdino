"use client";

import { useMemo } from "react";
import { useGameStore, type DinoAction } from "@/src/state/useGameStore";
import { useDinoSpeak } from "@/src/systems/ai/useDinoSpeak";

function ActionButton({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 92,
        height: 92,
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.20)",
        background: "rgba(0,0,0,0.40)",
        color: "white",
        display: "grid",
        placeItems: "center",
        boxShadow: "0 12px 26px rgba(0,0,0,0.35)",
        touchAction: "manipulation",
      }}
    >
      <div style={{ fontSize: 36, lineHeight: 1 }}>{emoji}</div>
      <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{label}</div>
    </button>
  );
}

export function RadialMenu() {
  const close = useGameStore((s) => s.closeRadialMenu);
  const apply = useGameStore((s) => s.applyDinoAction);
  const name = useGameStore((s) => s.childName);
  const campActive = useGameStore((s) => s.campActive);

  const speak = useDinoSpeak();

  const actions = useMemo(
    () =>
      [
        { action: "pet" as const, emoji: "🖐️", label: "Pet" },
        { action: "feed" as const, emoji: "🍎", label: "Feed" },
        { action: "bathe" as const, emoji: "🛁", label: "Bathe" },
        { action: "play" as const, emoji: "🎾", label: "Play" },
        { action: "camp" as const, emoji: "⛺", label: campActive ? "Pack" : "Camp" },
      ] as const,
    [campActive]
  );

  const quickPhrase = (a: DinoAction) => {
    switch (a) {
      case "pet":
        return `${name}! That feels nice!`;
      case "feed":
        return `Yum yum, ${name}!`;
      case "bathe":
        return `Splash splash, ${name}!`;
      case "play":
        return `Play time, ${name}!`;
      case "camp":
        return campActive ? `All packed up, ${name}!` : `Camp time, ${name}!`;
    }
  };

  return (
    <div
      onPointerDown={() => close()}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.25)",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <div
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 94vw)",
          borderRadius: 28,
          padding: 18,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(12,18,35,0.82)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ color: "white", fontWeight: 900, fontSize: 20 }}>
            🦕 Baby Dino Menu
          </div>
          <button
            onClick={() => close()}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.35)",
              color: "white",
              fontWeight: 900,
              fontSize: 16,
              padding: "10px 14px",
            }}
          >
            ✖
          </button>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            justifyItems: "center",
          }}
        >
          {actions.map((a) => (
            <ActionButton
              key={a.action}
              emoji={a.emoji}
              label={a.label}
              onClick={async () => {
                close();
                apply(a.action);
                await speak({ text: quickPhrase(a.action), mood: "playful", sceneHint: "world" });
              }}
            />
          ))}
        </div>

        <div style={{ marginTop: 14, color: "rgba(255,255,255,0.82)", fontWeight: 700 }}>
          Tip: Tap the ground to walk. Tap baby dino for this menu. 😊
        </div>
      </div>
    </div>
  );
}
