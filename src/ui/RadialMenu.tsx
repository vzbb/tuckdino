"use client";

import { useMemo } from "react";
import { useGameStore } from "@/src/state/useGameStore";

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
      className="radial-button"
      aria-label={label}
      style={{
        width: 100,
        height: 100,
        borderRadius: 24,
        border: "2px solid rgba(255,255,255,0.15)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        backdropFilter: "blur(8px)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 4, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>{emoji}</div>
      <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
    </button>
  );
}

export function RadialMenu() {
  const isOpen = useGameStore((s) => s.radialMenuOpen);
  const close = useGameStore((s) => s.closeRadialMenu);
  const apply = useGameStore((s) => s.applyDinoAction);
  const campActive = useGameStore((s) => s.campActive);


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

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes radialFadeIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .radial-overlay {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .radial-content {
          animation: radialFadeIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .radial-button:active {
          transform: scale(0.92);
          background: rgba(255,255,255,0.2) !important;
        }
      `}</style>
      <div
        className="radial-overlay"
        onPointerDown={() => close()}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          display: "grid",
          placeItems: "center",
          padding: 20,
          zIndex: 100,
        }}
      >
        <div
          className="radial-content"
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            width: "min(480px, 94vw)",
            borderRadius: 40,
            padding: 24,
            border: "2px solid rgba(255,255,255,0.2)",
            background: "linear-gradient(180deg, rgba(30,40,70,0.9), rgba(15,20,40,0.95))",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 28 }}>🦕</div>
              <div style={{ color: "white", fontWeight: 900, fontSize: 22, letterSpacing: "-0.5px" }}>
                Baby Dino Care
              </div>
            </div>
            <button
              onClick={() => close()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontWeight: 900,
                fontSize: 18,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                transition: "background 0.2s",
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              justifyItems: "center",
            }}
          >
            {actions.map((a) => (
              <ActionButton
                key={a.action}
                emoji={a.emoji}
                label={a.label}
                onClick={() => {
                  close();
                  apply(a.action);
                }}
              />
            ))}
          </div>

          <div style={{ 
            marginTop: 24, 
            padding: "12px 16px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: 16,
            color: "rgba(255,255,255,0.7)", 
            fontWeight: 600,
            fontSize: 14,
            textAlign: "center"
          }}>
            Tap anywhere else to close
          </div>
        </div>
      </div>
    </>
  );
}

