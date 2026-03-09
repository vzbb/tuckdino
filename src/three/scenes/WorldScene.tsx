"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars, Sky } from "@react-three/drei";
import { Vector3 } from "three";
import { useGameStore } from "@/src/state/useGameStore";
import { clamp } from "@/src/systems/utils/math";
import { BabyDino } from "@/src/three/characters/BabyDino";
import { PlayerMarker } from "@/src/three/characters/PlayerMarker";
import { WorldProps } from "@/src/three/world/WorldProps";
import { Camp } from "@/src/three/world/Camp";
import { Collectibles } from "@/src/three/world/Collectibles";

function FollowCamera() {
  const camera = useThree((s) => s.camera);
  const playerPos = useGameStore((s) => s.playerPos);
  const dinoPos = useGameStore((s) => s.dinoPos);

  const target = useMemo(() => new Vector3(), []);
  const desired = useMemo(() => new Vector3(), []);

  useFrame(() => {
    // Camera focus is between Tucker + dino
    target.set(
      (playerPos.x + dinoPos.x) * 0.5,
      1.2,
      (playerPos.z + dinoPos.z) * 0.5
    );
    desired.set(target.x, target.y + 6.0, target.z + 10.5);

    camera.position.lerp(desired, 0.06);
    camera.lookAt(target);
  });

  return null;
}

function Lighting() {
  const dayLight = useGameStore((s) => s.dayLight);
  const phase = useGameStore((s) => s.dayPhase);

  // Clamp and bias to keep it cozy
  const sun = clamp(dayLight, 0, 1);
  const ambient = 0.22 + sun * 0.45;
  const dir = 0.15 + sun * 1.05;

  // Smoother sun position based on daylight
  // x: -8 (sunrise) to 8 (sunset), y: -1 (night) to 10 (noon), z: 6
  const sunX = (dayLight - 0.5) * 16;
  const sunY = phase === "night" ? -1.5 : sun * 10;
  const sunPos: [number, number, number] = [sunX, sunY, 6];

  return (
    <>
      <ambientLight intensity={ambient} />
      <directionalLight
        position={sunPos}
        intensity={dir}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      {phase === "night" && <pointLight position={[0, 2.2, 0]} intensity={0.35} />}
    </>
  );
}

function WorldGround() {
  const setMoveTarget = useGameStore((s) => s.setMoveTarget);

  return (
    <mesh
      rotation-x={-Math.PI / 2}
      receiveShadow
      onPointerDown={(e) => {
        // Touch to move (tap anywhere on the ground)
        e.stopPropagation();
        setMoveTarget({ x: e.point.x, y: 0, z: e.point.z });
      }}
    >
      <planeGeometry args={[140, 140, 1, 1]} />
      <meshStandardMaterial color={"#2b5a38"} roughness={0.8} />
    </mesh>
  );
}

export function WorldScene() {
  const phase = useGameStore((s) => s.dayPhase);
  const dayLight = useGameStore((s) => s.dayLight);

  const fogColor = phase === "night" ? "#0a0a1a" : phase === "morning" ? "#ffecdb" : phase === "evening" ? "#ffae80" : "#d0f0ff";
  const fogIntensity = phase === "night" ? 0.015 : 0.008;

  return (
    <group>
      <fogExp2 attach="fog" args={[fogColor, fogIntensity]} />
      
      <Sky 
        sunPosition={[(dayLight - 0.5) * 16, phase === "night" ? -1 : dayLight * 10, 6]} 
        turbidity={0.1}
        rayleigh={phase === "night" ? 0.1 : 0.5}
      />
      {phase === "night" && <Stars radius={80} depth={40} count={1800} factor={3} />}

      <Lighting />

      <WorldGround />

      <WorldProps />
      <Collectibles />
      <Camp />

      <PlayerMarker />
      <BabyDino />

      <FollowCamera />
    </group>
  );
}
