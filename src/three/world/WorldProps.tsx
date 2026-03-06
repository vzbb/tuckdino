"use client";

import { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { AssetBoundary } from "@/src/three/components/AssetBoundary";

const HUT_GLB = "/assets/quaternius/village_hut.glb";

function FallbackHut() {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 1.8, 3.2]} />
        <meshStandardMaterial color={"#8b6b4d"} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <coneGeometry args={[2.5, 1.6, 4]} />
        <meshStandardMaterial color={"#4b2f21"} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.3, 1.65]}>
        <boxGeometry args={[0.8, 1.1, 0.1]} />
        <meshStandardMaterial color={"#2b1a12"} roughness={0.9} />
      </mesh>
    </group>
  );
}

function HutModel() {
  const gltf = useGLTF(HUT_GLB);
  return <primitive object={gltf.scene} />;
}

function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 1.8, 10]} />
        <meshStandardMaterial color={"#6b4b32"} roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <coneGeometry args={[1.1, 2.2, 10]} />
        <meshStandardMaterial color={"#2f7a4a"} roughness={0.95} />
      </mesh>
    </group>
  );
}

export function WorldProps() {
  return (
    <group>
      {/* Village hut */}
      <group position={[-10, 0, -6]} rotation-y={0.4} scale={1.1}>
        <AssetBoundary fallback={<FallbackHut />}>
          <Suspense fallback={<FallbackHut />}>
            <HutModel />
          </Suspense>
        </AssetBoundary>
      </group>

      {/* Stream */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -15]} receiveShadow>
        <planeGeometry args={[60, 10]} />
        <meshStandardMaterial color={"#2a7bbd"} roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Flower field */}
      {Array.from({ length: 120 }).map((_, i) => {
        const x = -2 + (Math.random() - 0.5) * 18;
        const z = 10 + (Math.random() - 0.5) * 18;
        return (
          <mesh key={i} position={[x, 0.02, z]} rotation-y={Math.random() * Math.PI} castShadow>
            <coneGeometry args={[0.06, 0.22, 6]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#ffd1e8" : i % 3 === 1 ? "#b6f0ff" : "#fff2b3"}
              roughness={0.85}
            />
          </mesh>
        );
      })}

      {/* Trees */}
      {Array.from({ length: 34 }).map((_, i) => (
        <Tree
          key={i}
          x={(Math.random() - 0.5) * 60}
          z={(Math.random() - 0.5) * 60}
        />
      ))}


      {/* Campfire area (always present) */}
      <group position={[10, 0, 10]}>
        {/* stones */}
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh
            key={`campstone-${i}`}
            position={[
              Math.cos((i / 10) * Math.PI * 2) * 1.2,
              0.06,
              Math.sin((i / 10) * Math.PI * 2) * 1.2,
            ]}
            castShadow
          >
            <dodecahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial color={"#6b6b6b"} roughness={1} />
          </mesh>
        ))}
        {/* little flame */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <coneGeometry args={[0.35, 0.95, 10]} />
          <meshStandardMaterial color={"#ffbe6e"} emissive={"#ff7a2f"} emissiveIntensity={0.7} />
        </mesh>
        <pointLight position={[0, 1.4, 0]} intensity={0.75} distance={16} decay={2} color={"#ffb36e"} />
      </group>
      {/* Soft hills */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 70,
            0.4,
            (Math.random() - 0.5) * 70,
          ]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[2.5 + Math.random() * 3, 0]} />
          <meshStandardMaterial color={"#2f6b3e"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

