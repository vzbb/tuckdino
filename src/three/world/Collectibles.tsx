"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/src/state/useGameStore";
import { Vector3 } from "three";

type Item = { id: string; x: number; z: number };

export function Collectibles() {
  const playerPos = useGameStore((s) => s.playerPos);
  const pushEvent = useGameStore((s) => s.pushEvent);

  const [collected, setCollected] = useState<Record<string, boolean>>({});

  const items = useMemo<Item[]>(
    () => [
      { id: "stone-1", x: -6, z: -12 },
      { id: "stone-2", x: 4, z: -14 },
      { id: "stone-3", x: 8, z: -10 },
      { id: "shell-1", x: -2, z: -16 },
      { id: "shell-2", x: 2, z: -17 },
    ],
    []
  );

  const p = useMemo(() => new Vector3(), []);

  useFrame(() => {
    p.set(playerPos.x, 0, playerPos.z);

    for (const item of items) {
      if (collected[item.id]) continue;
      const d = p.distanceTo(new Vector3(item.x, 0, item.z));
      if (d < 1.2) {
        setCollected((c) => ({ ...c, [item.id]: true }));
        pushEvent({ t: Date.now(), type: "collectible_found", id: item.id });
      }
    }
  });

  return (
    <group>
      {items.map((item) => {
        if (collected[item.id]) return null;
        return (
          <mesh key={item.id} position={[item.x, 0.2, item.z]} castShadow>
            <icosahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial
              color={"#ffffff"}
              emissive={"#b6f0ff"}
              emissiveIntensity={0.85}
              roughness={0.35}
            />
          </mesh>
        );
      })}
    </group>
  );
}
