"use client";

import { Suspense, useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
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
  const groupRef = useRef<THREE.Group>(null);
  const randomOffset = useMemo(() => Math.random() * 10, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime + randomOffset;
    // Gentle sway
    groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.03;
    groupRef.current.rotation.z = Math.cos(t * 0.3) * 0.02;
  });

  return (
    <group position={[x, 0, z]} ref={groupRef}>
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

function Campfire() {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lightRef.current) {
      // Flickering light
      lightRef.current.intensity = 0.6 + Math.random() * 0.4;
    }
    if (flameRef.current) {
      // Gentle pulsing flame
      const s = 1.0 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
      flameRef.current.scale.set(s, s, s);
    }
  });

  return (
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
      <mesh position={[0, 0.45, 0]} castShadow ref={flameRef}>
        <coneGeometry args={[0.35, 0.95, 10]} />
        <meshStandardMaterial color={"#ffbe6e"} emissive={"#ff7a2f"} emissiveIntensity={0.7} />
      </mesh>
      <pointLight 
        ref={lightRef}
        position={[0, 1.4, 0]} 
        intensity={0.75} 
        distance={16} 
        decay={2} 
        color={"#ffb36e"} 
      />
    </group>
  );
}

function Butterflies() {
  const count = 5;
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const initialPositions = useMemo(() => 
    Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 20,
      y: 1 + Math.random() * 2,
      z: (Math.random() - 0.5) * 20,
      offset: Math.random() * 100
    }))
  , [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const pos = initialPositions[i];
      
      // Butterfly flight pattern
      mesh.position.x = pos.x + Math.sin(t * 0.5 + pos.offset) * 3;
      mesh.position.y = pos.y + Math.sin(t * 2 + pos.offset) * 0.5;
      mesh.position.z = pos.z + Math.cos(t * 0.4 + pos.offset) * 3;
      
      // Wing flap
      const wing = mesh.children[0] as THREE.Mesh;
      if (wing) {
        wing.rotation.z = Math.sin(t * 15) * 0.8;
      }
      const wing2 = mesh.children[1] as THREE.Mesh;
      if (wing2) {
        wing2.rotation.z = -Math.sin(t * 15) * 0.8;
      }

      // Look in movement direction
      mesh.rotation.y = t * 0.5 + pos.offset;
    });
  });

  return (
    <group>
      {initialPositions.map((pos, i) => (
        <mesh 
          key={i} 
          ref={(el) => { if (el) meshRefs.current[i] = el; }}
          position={[pos.x, pos.y, pos.z]}
        >
          {/* Left Wing */}
          <mesh rotation-y={Math.PI / 2}>
            <planeGeometry args={[0.15, 0.15]} />
            <meshStandardMaterial color={"#ff9ebb"} side={THREE.DoubleSide} emissive={"#ff9ebb"} emissiveIntensity={0.5} />
          </mesh>
          {/* Right Wing */}
          <mesh rotation-y={-Math.PI / 2}>
            <planeGeometry args={[0.15, 0.15]} />
            <meshStandardMaterial color={"#ff9ebb"} side={THREE.DoubleSide} emissive={"#ff9ebb"} emissiveIntensity={0.5} />
          </mesh>
        </mesh>
      ))}
    </group>
  );
}

export function WorldProps() {
  return (
    <group>
      <Butterflies />
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

      <Campfire />

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

