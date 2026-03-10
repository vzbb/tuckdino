"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/src/state/useGameStore";
import { clamp } from "@/src/systems/utils/math";

/**
 * Manages player position and movement logic.
 * In FPS mode, this is the "camera source" and has no visible mesh.
 */
export function PlayerMarker() {
  const playerPos = useGameStore((s) => s.playerPos);
  const setPlayerPos = useGameStore((s) => s.setPlayerPos);
  const target = useGameStore((s) => s.playerTarget);
  const clearTarget = useGameStore((s) => s.clearMoveTarget);

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

      const speed = 2.4; // walking speed
      const step = Math.min(dist, speed * delta);

      if (dist > 0.02) {
        cur.lerp(t, clamp(step / Math.max(dist, 0.0001), 0, 1));
      } else {
        // reached target
        clearTarget();
      }
    }

    const now = performance.now();
    if (now - lastStoreSync.current > 120) {
      lastStoreSync.current = now;
      setPlayerPos({ x: cur.x, y: 0, z: cur.z });
    }
  });

  return null;
}


