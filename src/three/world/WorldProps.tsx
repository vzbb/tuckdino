"use client";

import { Suspense, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AssetBoundary } from "@/src/three/components/AssetBoundary";

const TENT_GLB = "/assets/quaternius/Tent.glb";
const BONFIRE_GLB = "/assets/quaternius/Bonfire.glb";

type ScatterPoint = {
  x: number;
  z: number;
  scale: number;
  rotation: number;
};

function makeScatter(count: number, radius: number, minRadius = 0): ScatterPoint[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = minRadius + Math.random() * (radius - minRadius);
    return {
      x: Math.cos(angle) * distance,
      z: Math.sin(angle) * distance,
      scale: 0.8 + Math.random() * 0.6,
      rotation: Math.random() * Math.PI * 2,
    };
  });
}

function FallbackTent() {
  return (
    <group>
      <mesh position={[0, 0.72, 0]} castShadow>
        <coneGeometry args={[1.3, 1.55, 4]} />
        <meshStandardMaterial color={"#e8c98f"} roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.15, 1.15, 0.16, 20]} />
        <meshStandardMaterial color={"#6e8d52"} roughness={1} />
      </mesh>
    </group>
  );
}

function FallbackBonfire() {
  return (
    <group>
      {Array.from({ length: 5 }).map((_, index) => (
        <mesh
          key={index}
          position={[Math.cos((index / 5) * Math.PI * 2) * 0.24, 0.18, Math.sin((index / 5) * Math.PI * 2) * 0.24]}
          rotation-z={0.25}
          rotation-y={(index / 5) * Math.PI * 2}
          castShadow
        >
          <cylinderGeometry args={[0.06, 0.08, 0.6, 8]} />
          <meshStandardMaterial color={"#7a5134"} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.44, 0]} castShadow>
        <coneGeometry args={[0.22, 0.6, 8]} />
        <meshStandardMaterial color={"#ffc56e"} emissive={"#ff7a36"} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function TentModel() {
  const gltf = useGLTF(TENT_GLB);
  return <primitive object={gltf.scene} />;
}

function BonfireModel() {
  const gltf = useGLTF(BONFIRE_GLB);
  return <primitive object={gltf.scene} />;
}

function Tree({ x, z, scale, rotation }: ScatterPoint) {
  const groupRef = useRef<THREE.Group>(null);
  const randomOffset = useMemo(() => Math.random() * 10, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime + randomOffset;
    groupRef.current.rotation.z = Math.sin(t * 0.42) * 0.015;
    groupRef.current.rotation.x = Math.cos(t * 0.36) * 0.012;
  });

  return (
    <group position={[x, 0, z]} scale={scale} rotation-y={rotation} ref={groupRef}>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.6, 0.14, 18]} />
        <meshStandardMaterial color={"#3f5f39"} roughness={1} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 1.9, 10]} />
        <meshStandardMaterial color={"#6e4b30"} roughness={0.96} />
      </mesh>
      <mesh position={[0, 1.95, 0]} castShadow>
        <coneGeometry args={[0.95, 1.4, 9]} />
        <meshStandardMaterial color={"#447d4b"} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.6, 0.05]} castShadow>
        <coneGeometry args={[0.72, 1.08, 9]} />
        <meshStandardMaterial color={"#63a861"} roughness={0.88} />
      </mesh>
      <mesh position={[0.12, 2.08, 0.28]} castShadow>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color={"#8dd675"} emissive={"#7bcf68"} emissiveIntensity={0.2} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Campfire() {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.1 + Math.sin(state.clock.elapsedTime * 8) * 0.12 + Math.random() * 0.18;
    }
    if (flameRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.04;
      flameRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[10, 0, 10]}>
      <group ref={flameRef} scale={0.8} position={[0, 0.06, 0]}>
        <AssetBoundary fallback={<FallbackBonfire />}>
          <Suspense fallback={<FallbackBonfire />}>
            <BonfireModel />
          </Suspense>
        </AssetBoundary>
      </group>
      <pointLight ref={lightRef} position={[0, 1.5, 0]} intensity={1.15} distance={18} decay={2} color={"#ffb36e"} />
    </group>
  );
}

function Butterflies() {
  const count = 5;
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const initialPositions = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        x: (Math.random() - 0.5) * 20,
        y: 1 + Math.random() * 2,
        z: (Math.random() - 0.5) * 20,
        offset: Math.random() * 100,
      })),
    [count]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const pos = initialPositions[i];

      mesh.position.x = pos.x + Math.sin(t * 0.5 + pos.offset) * 3;
      mesh.position.y = pos.y + Math.sin(t * 2 + pos.offset) * 0.5;
      mesh.position.z = pos.z + Math.cos(t * 0.4 + pos.offset) * 3;

      const wing = mesh.children[0] as THREE.Mesh | undefined;
      if (wing) {
        wing.rotation.z = Math.sin(t * 15) * 0.8;
      }
      const wing2 = mesh.children[1] as THREE.Mesh | undefined;
      if (wing2) {
        wing2.rotation.z = -Math.sin(t * 15) * 0.8;
      }

      mesh.rotation.y = t * 0.5 + pos.offset;
    });
  });

  return (
    <group>
      {initialPositions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) meshRefs.current[i] = el;
          }}
          position={[pos.x, pos.y, pos.z]}
        >
          <mesh rotation-y={Math.PI / 2}>
            <planeGeometry args={[0.15, 0.15]} />
            <meshStandardMaterial color={"#ff9ebb"} side={THREE.DoubleSide} emissive={"#ff9ebb"} emissiveIntensity={0.5} />
          </mesh>
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
  const treePoints = useMemo(() => makeScatter(40, 33, 12), []);
  const hillPoints = useMemo(() => makeScatter(18, 36, 18), []);
  const flowerPoints = useMemo(() => makeScatter(120, 11), []);
  const pebblePoints = useMemo(() => makeScatter(24, 8, 2), []);
  const lanternPoints = useMemo(() => makeScatter(9, 7, 3), []);

  return (
    <group>
      <Butterflies />

      <group position={[15.5, 0, 16.5]} rotation-y={-0.55} scale={0.28}>
        <AssetBoundary fallback={<FallbackTent />}>
          <Suspense fallback={<FallbackTent />}>
            <TentModel />
          </Suspense>
        </AssetBoundary>
      </group>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -15]} receiveShadow>
        <planeGeometry args={[60, 10]} />
        <meshStandardMaterial color={"#3d96cf"} emissive={"#1d5f8b"} emissiveIntensity={0.12} roughness={0.2} metalness={0.1} />
      </mesh>

      {Array.from({ length: 18 }).map((_, i) => (
        <mesh
          key={`stream-stone-${i}`}
          position={[-28 + i * 3.1, 0.09, -11.4 - (i % 3) * 1.9]}
          castShadow
          receiveShadow
          rotation-y={i * 0.4}
        >
          <dodecahedronGeometry args={[0.45 + (i % 4) * 0.08, 0]} />
          <meshStandardMaterial color={"#93a3a6"} roughness={1} />
        </mesh>
      ))}

      {flowerPoints.map((point, i) => (
        <group key={`flower-${i}`} position={[-2 + point.x, 0.02, 10 + point.z]} rotation-y={point.rotation} scale={point.scale}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.18, 6]} />
            <meshStandardMaterial color={"#4e8c4f"} roughness={1} />
          </mesh>
          <mesh position={[0, 0.14, 0]} castShadow>
            <coneGeometry args={[0.07, 0.12, 6]} />
            <meshStandardMaterial color={i % 3 === 0 ? "#ffd1e8" : i % 3 === 1 ? "#b6f0ff" : "#fff2b3"} roughness={0.82} />
          </mesh>
        </group>
      ))}

      {treePoints.map((point, i) => (
        <Tree key={`tree-${i}`} {...point} />
      ))}

      <Campfire />

      {pebblePoints.map((point, i) => (
        <mesh
          key={`camp-pebble-${i}`}
          position={[10 + point.x * 0.35, 0.06, 10 + point.z * 0.35]}
          rotation-y={point.rotation}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[0.12 + (i % 3) * 0.05, 0]} />
          <meshStandardMaterial color={"#8a897f"} roughness={1} />
        </mesh>
      ))}

      {lanternPoints.map((point, i) => (
        <group key={`lantern-${i}`} position={[10 + point.x * 0.5, 0, 10 + point.z * 0.5]} rotation-y={point.rotation} scale={0.55 + (i % 3) * 0.12}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.64, 6]} />
            <meshStandardMaterial color={"#6f5336"} roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.74, 0]} castShadow>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color={"#ffe0a1"} emissive={"#ffca70"} emissiveIntensity={0.8} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {hillPoints.map((point, i) => (
        <mesh key={`hill-${i}`} position={[point.x, 0.35, point.z]} castShadow receiveShadow scale={point.scale} rotation-y={point.rotation}>
          <dodecahedronGeometry args={[2.8, 0]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#3e7244" : "#447f4a"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

useGLTF.preload(TENT_GLB);
useGLTF.preload(BONFIRE_GLB);
