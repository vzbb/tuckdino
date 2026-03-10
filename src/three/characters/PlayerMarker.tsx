"use client";

import { useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/src/state/useGameStore";
import { clamp } from "@/src/systems/utils/math";

function TargetFeedback() {
  const target = useGameStore((s) => s.playerTarget);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !target) return;
    
    // Position at target
    meshRef.current.position.set(target.x, 0.05, target.z);
    
    // Pulsing/fading effect
    const t = (state.clock.elapsedTime * 2) % 1;
    const s = 0.5 + t * 1.5;
    meshRef.current.scale.set(s, s, s);
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.opacity = 1 - t;
    }
  });

  if (!target) return null;

  return (
    <mesh ref={meshRef} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.4, 0.5, 32]} />
      <meshStandardMaterial 
        color={"#ffffff"} 
        transparent 
        opacity={0.5} 
        emissive={"#7aa2ff"} 
        emissiveIntensity={1} 
      />
    </mesh>
  );
}

/**
 * A simple “Tucker marker” — a friendly glowing orb that moves where Tucker taps.
 * (You can replace this later with a character model if you want.)
 */
export function PlayerMarker() {
  const playerPos = useGameStore((s) => s.playerPos);
  const setPlayerPos = useGameStore((s) => s.setPlayerPos);
  const target = useGameStore((s) => s.playerTarget);
  const clearTarget = useGameStore((s) => s.clearMoveTarget);

  const meshRef = useRef<THREE.Mesh>(null);
  const posRef = useRef<THREE.Vector3>(new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z));
  const lastStoreSync = useRef<number>(0);

  // keep local ref in sync if something external changes
  useEffect(() => {
    posRef.current.set(playerPos.x, playerPos.y, playerPos.z);
  }, [playerPos.x, playerPos.y, playerPos.z]);

  useFrame((_, delta) => {
    const cur = posRef.current;

    if (target) {
      const t = new THREE.Vector3(target.x, target.y, target.z);
      const dist = cur.distanceTo(t);

      const speed = 2.2; // gentle walking speed
      const step = Math.min(dist, speed * delta);

      if (dist > 0.02) {
        cur.lerp(t, clamp(step / Math.max(dist, 0.0001), 0, 1));
      } else {
        // reached target
        clearTarget();
      }
    }

    if (meshRef.current) {
      meshRef.current.position.set(cur.x, 0.25 + Math.sin(Date.now() / 180) * 0.03, cur.z);
    }

    const now = performance.now();
    if (now - lastStoreSync.current > 120) {
      lastStoreSync.current = now;
      setPlayerPos({ x: cur.x, y: 0, z: cur.z });
    }
  });

  return (
    <>
      <TargetFeedback />
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.25, 20, 20]} />
        <meshStandardMaterial color={"#ffffff"} emissive={"#7aa2ff"} emissiveIntensity={0.6} />
      </mesh>
    </>
  );
}

