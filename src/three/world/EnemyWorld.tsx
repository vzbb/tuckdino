"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { AssetBoundary } from "@/src/three/components/AssetBoundary";
import {
  WorldMonsterModel,
  type WorldMonsterKind,
} from "@/src/three/characters/WorldMonsterModel";
import type { EnemySpawn, EnemySpecies } from "@/src/world/enemies/enemyCatalog";
import type { EnemyWorldMode } from "@/src/world/enemies/patrol";

export type VisibleEnemy = {
  spawn: EnemySpawn;
  species: EnemySpecies;
  position: { x: number; y: number; z: number };
  mode: EnemyWorldMode;
  defeated?: boolean;
};

export type EnemyWorldProps = {
  enemies: VisibleEnemy[];
  onChallenge: (spawnId: string) => void;
};

const MODEL_BY_SPECIES: Record<string, WorldMonsterKind> = {
  bramble_boar: "pig",
  gloomwing: "bat",
  thornjaw: "tree",
  elder_rootshell: "mushroom",
  comet_raptor: "dragon",
};

function EnemyFallback({ species }: { species: EnemySpecies }) {
  return (
    <group>
      <mesh castShadow position-y={0.55}>
        <capsuleGeometry args={[0.38, 0.7, 6, 12]} />
        <meshStandardMaterial color={species.color} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.73, 0.5]}>
        <sphereGeometry args={[0.32, 12, 10]} />
        <meshStandardMaterial color={species.accent} roughness={0.8} />
      </mesh>
    </group>
  );
}

function EnemyActor({ enemy, onChallenge }: { enemy: VisibleEnemy; onChallenge: (id: string) => void }) {
  const group = useRef<THREE.Group>(null);
  const destination = useMemo(() => new THREE.Vector3(), []);
  const boss = enemy.species.temperament === "boss";
  const alert = enemy.mode === "alert" || enemy.mode === "engaged";
  const scale = boss ? 1.65 : 0.9 + enemy.species.difficulty * 0.08;

  useFrame((state, delta) => {
    if (!group.current) return;
    destination.set(enemy.position.x, enemy.position.y, enemy.position.z);
    const before = group.current.position.clone();
    group.current.position.lerp(destination, 1 - Math.exp(-delta * 8));
    const movement = group.current.position.clone().sub(before);
    if (movement.lengthSq() > 0.00001) {
      group.current.rotation.y = Math.atan2(movement.x, movement.z);
    }
    group.current.position.y = enemy.position.y + Math.sin(state.clock.elapsedTime * (alert ? 5 : 2) + enemy.spawn.home.x) * 0.035;
  });

  if (enemy.defeated) return null;
  return (
    <group
      ref={group}
      position={[enemy.position.x, enemy.position.y, enemy.position.z]}
      onPointerDown={(event) => {
        event.stopPropagation();
        onChallenge(enemy.spawn.id);
      }}
    >
      <AssetBoundary fallback={<EnemyFallback species={enemy.species} />}>
        <Suspense fallback={<EnemyFallback species={enemy.species} />}>
          <WorldMonsterModel
            kind={MODEL_BY_SPECIES[enemy.species.id] ?? "tree"}
            motion={alert ? "attack" : enemy.mode === "patrol" ? "walk" : "idle"}
            scale={scale}
            glow={alert || boss ? enemy.species.accent : undefined}
          />
        </Suspense>
      </AssetBoundary>

      <mesh position-y={0.03} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[boss ? 1.35 : 0.72, boss ? 1.52 : 0.84, 24]} />
        <meshBasicMaterial color={alert ? "#ffb24f" : enemy.species.accent} transparent opacity={alert ? 0.8 : 0.3} />
      </mesh>

      {(alert || boss) && (
        <Html center position={[0, boss ? 3.35 : 2.15, 0]} distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{
            minWidth: boss ? 170 : 125,
            padding: "7px 10px",
            border: `2px solid ${enemy.species.accent}`,
            borderRadius: 14,
            color: "#fff9d8",
            background: "rgba(17,42,36,.88)",
            boxShadow: "0 8px 22px rgba(0,0,0,.35)",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 900,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}>
            <small style={{ display: "block", color: enemy.species.accent, letterSpacing: 1 }}>
              {boss ? "WILD GUARDIAN" : alert ? "TRAIL CHALLENGE" : "GUARDIAN"}
            </small>
            {enemy.species.name}
          </div>
        </Html>
      )}
    </group>
  );
}

export function EnemyWorld({ enemies, onChallenge }: EnemyWorldProps) {
  return (
    <group name="enemy-world">
      {enemies.map((enemy) => (
        <EnemyActor key={enemy.spawn.id} enemy={enemy} onChallenge={onChallenge} />
      ))}
    </group>
  );
}
