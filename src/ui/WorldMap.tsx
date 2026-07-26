"use client";

import { useGameStore } from "@/src/state/useGameStore";
import { WORLD_ZONES, mapPosition, zoneIsUnlocked } from "@/src/world/worldZones";

export function WorldMap() {
  const open = useGameStore((s) => s.mapOpen);
  const setOpen = useGameStore((s) => s.setMapOpen);
  const setMoveTarget = useGameStore((s) => s.setMoveTarget);
  const playerPos = useGameStore((s) => s.playerPos);
  const discovered = useGameStore((s) => s.discoveredZones);
  const trainingStars = useGameStore((s) => s.adventure.trainingStars);
  const meadowCrestEarned = useGameStore((s) => s.progression.meadowCrestEarned);

  if (!open) return null;

  const guideTo = (zoneId: string) => {
    const zone = WORLD_ZONES.find((candidate) => candidate.id === zoneId);
    if (!zone || !zoneIsUnlocked(zone, trainingStars, meadowCrestEarned)) return;
    setMoveTarget(zone.position);
    setOpen(false);
  };

  return (
    <div className="world-map-overlay" role="dialog" aria-label="Adventure map">
      <div className="world-map-shell">
        <header>
          <div><small>RANGER'S FIELD MAP</small><strong>The Sunpatch Valley</strong></div>
          <button onClick={() => setOpen(false)} aria-label="Close map">×</button>
        </header>
        <div className="world-map-canvas">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <path className="map-land" d="M4,27 C12,8 34,5 48,15 C64,3 88,13 94,31 C102,49 88,66 94,83 C77,98 57,91 43,97 C27,90 8,92 5,72 C-2,57 8,43 4,27Z" />
            <path className="map-water" d="M4,58 C20,49 29,65 44,57 C57,50 68,61 97,49" />
            <path className="map-path" d="M57,32 C49,39 38,42 30,38 M48,43 C48,56 48,67 50,87 M48,47 C61,47 70,52 72,62 M55,36 C67,26 78,23 82,17" />
            <path className="map-forest" d="M68,15 C76,7 91,11 94,23 C92,34 83,34 74,31 C65,28 63,21 68,15Z" />
          </svg>
          {WORLD_ZONES.map((zone) => {
            const unlocked = zoneIsUnlocked(zone, trainingStars, meadowCrestEarned);
            const found = discovered.includes(zone.id);
            const pos = mapPosition(zone.position);
            return (
              <button
                key={zone.id}
                className={`map-node ${found ? "found" : ""} ${unlocked ? "" : "locked"}`}
                style={{ ...pos, "--zone-color": zone.color } as React.CSSProperties}
                disabled={!unlocked}
                onClick={() => guideTo(zone.id)}
                aria-label={`${zone.name}${unlocked ? ", guide me there" : ", locked"}`}
              >
                <span>{unlocked ? zone.icon : "🔒"}</span>
                <b>{found || unlocked ? zone.shortName : "Unknown"}</b>
              </button>
            );
          })}
          <div className="map-player" style={mapPosition(playerPos)}><span>▲</span><b>You</b></div>
        </div>
        <footer>
          <span><i className="map-key found" /> Discovered {discovered.length}/{WORLD_ZONES.length}</span>
          <strong>Tap a place and your trail guide will lead the way.</strong>
        </footer>
      </div>
    </div>
  );
}
