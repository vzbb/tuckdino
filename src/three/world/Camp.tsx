"use client";

import { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { AssetBoundary } from "@/src/three/components/AssetBoundary";
import { useGameStore } from "@/src/state/useGameStore";

const TENT_GLB = "/assets/quaternius/tent.glb";

function FallbackTent() {
  return (
    <group>
      <mesh castShadow>
        <coneGeometry args={[2.0, 1.7, 4]} />
        <meshStandardMaterial color={"#ffe36e"} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.2, 0]} castShadow>
        <boxGeometry args={[2.4, 0.4, 2.4]} />
        <meshStandardMaterial color={"#8b6b4d"} roughness={0.95} />
      </mesh>
    </group>
  );
}

function TentModel() {
  const gltf = useGLTF(TENT_GLB);
  return <primitive object={gltf.scene} />;
}

function Campfire() {
  return (
    <group>
      {/* stones */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 10) * Math.PI * 2) * 0.7,
            0.05,
            Math.sin((i / 10) * Math.PI * 2) * 0.7,
          ]}
          castShadow
        >
          <dodecahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial color={"#6b6b6b"} roughness={1} />
        </mesh>
      ))}
      {/* flame */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <coneGeometry args={[0.25, 0.7, 10]} />
        <meshStandardMaterial color={"#ffbe6e"} emissive={"#ff7a2f"} emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

export function Camp() {
  const active = useGameStore((s) => s.campActive);
  const pos = useGameStore((s) => s.campPos);
  const phase = useGameStore((s) => s.dayPhase);

  if (!active || !pos) return null;

  return (
    <group position={[pos.x + 3.5, 0, pos.z + 1.5]}>
      <group position={[0, 0, 0]}>
        <AssetBoundary fallback={<FallbackTent />}>
          <Suspense fallback={<FallbackTent />}>
            <TentModel />
          </Suspense>
        </AssetBoundary>
      </group>

      <group position={[-2.2, 0, 1.4]}>
        <Campfire />
        {/* warm light */}
        <pointLight
          position={[0, 1.2, 0]}
          intensity={phase === "night" ? 1.15 : 0.6}
          distance={12}
          decay={2}
          color={"#ffb36e"}
        />
      </group>
    </group>
  );
}

