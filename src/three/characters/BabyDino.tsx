"use client";

import { Suspense, useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { AssetBoundary } from "@/src/three/components/AssetBoundary";
import { useGameStore, type DinoAnimationKey } from "@/src/state/useGameStore";
import { clamp, dampAngle } from "@/src/systems/utils/math";

const BABY_DINO_GLB = "/assets/quaternius/Parasaurolophus.glb";

type Props = {
  position?: [number, number, number];
  scale?: number;
  lookAtCamera?: boolean;
  forcedAnimation?: DinoAnimationKey;
  interactive?: boolean;
};

function FallbackDinoBody() {
  const dinoColor = useGameStore((s) => s.dinoColor);
  return (
    <group>
      <mesh castShadow>
        <capsuleGeometry args={[0.45, 0.9, 8, 16]} />
        <meshStandardMaterial color={dinoColor} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.7, 0.55]} castShadow>
        <sphereGeometry args={[0.38, 20, 20]} />
        <meshStandardMaterial color={dinoColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.14, 0.76, 0.88]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={"#111"} />
      </mesh>
      <mesh position={[-0.14, 0.76, 0.88]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={"#111"} />
      </mesh>
      <mesh position={[0, 0.25, -0.7]} rotation-x={0.3} castShadow>
        <coneGeometry args={[0.18, 0.8, 10]} />
        <meshStandardMaterial color={"#66d9ff"} roughness={0.8} />
      </mesh>
    </group>
  );
}

function pickClipName(available: string[], key: DinoAnimationKey): string | null {
  const low = available.map((n) => n.toLowerCase());
  const find = (patterns: string[]) => {
    for (const p of patterns) {
      const idx = low.findIndex((n) => n.includes(p));
      if (idx >= 0) return available[idx];
    }
    return null;
  };

  switch (key) {
    case "idle": return find(["idle", "rest", "stand"]) ?? null;
    case "walk": return find(["walk"]) ?? null;
    case "run": return find(["run", "sprint"]) ?? find(["walk"]) ?? null;
    case "hop":
    case "happy_jump": return find(["jump", "hop"]) ?? null;
    case "sit": return find(["sit"]) ?? null;
    case "nuzzle": return find(["nuzzle", "kiss", "sniff"]) ?? null;
    case "look_at_camera": return find(["idle"]) ?? null;
    case "clap": return find(["clap"]) ?? null;
    case "wave": return find(["wave"]) ?? null;
    default: return null;
  }
}

function QuaterniusDinoModel({ activeAnimation }: { activeAnimation: DinoAnimationKey }) {
  const gltf = useGLTF(BABY_DINO_GLB);
  const group = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(gltf.animations, group);

  useEffect(() => {
    if (!actions) return;
    const clipName = pickClipName(names, activeAnimation);
    if (!clipName) return;
    const action = actions[clipName];
    if (!action) return;

    Object.values(actions).forEach((a) => a?.fadeOut(0.12));
    action.reset().fadeIn(0.12).play();
    return () => { action.fadeOut(0.12); };
  }, [actions, names, activeAnimation]);

  return <primitive ref={group} object={gltf.scene} />;
}

export function BabyDino({
  position,
  scale,
  lookAtCamera,
  forcedAnimation,
  interactive = true,
}: Props) {
  const camera = useThree((s) => s.camera);
  const storeDinoPos = useGameStore((s) => s.dinoPos);
  const setDinoPos = useGameStore((s) => s.setDinoPos);
  const dinoScale = useGameStore((s) => s.dinoScale);
  const directive = useGameStore((s) => s.dinoDirective);
  const playerPos = useGameStore((s) => s.playerPos);
  const playerTarget = useGameStore((s) => s.playerTarget);
  const moveSequenceId = useGameStore((s) => s.moveSequenceId);
  const openMenu = useGameStore((s) => s.openRadialMenu);
  const setDinoDirective = useGameStore((s) => s.setDinoDirective);

  const group = useRef<THREE.Group>(null);
  const posRef = useRef<THREE.Vector3>(new THREE.Vector3(storeDinoPos.x, storeDinoPos.y, storeDinoPos.z));
  const lastStoreSync = useRef<number>(0);
  const [animKey, setAnimKey] = useState<DinoAnimationKey>("idle");

  // Behavior state for wandering/attention
  const wanderOffset = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const nextWanderAt = useRef<number>(0);
  const lastLookedAt = useRef<number>(0);
  const isLookingAtPlayer = useRef<boolean>(false);

  const controlled = !!position;

  useEffect(() => {
    if (controlled || !playerTarget) return;
    setDinoDirective({ mood: "excited", animation: "hop", shouldSpeak: false });
    const t = window.setTimeout(() => {
      setDinoDirective({ mood: "excited", animation: "run", shouldSpeak: false });
    }, 500);
    return () => window.clearTimeout(t);
  }, [moveSequenceId, playerTarget, controlled, setDinoDirective]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const playerRotation = useGameStore.getState().playerRotation;
    const desired = new THREE.Vector3();
    const cur = posRef.current;
    const now = state.clock.elapsedTime;

    if (controlled && position) {
      desired.set(position[0], position[1], position[2]);
    } else if (directive.moveTarget) {
      desired.set(directive.moveTarget.x, 0, directive.moveTarget.z);
    } else {
      const p = new THREE.Vector3(playerPos.x, 0, playerPos.z);
      
      if (playerTarget) {
        // Player is moving: dino stays to the side and slightly ahead
        const t = new THREE.Vector3(playerTarget.x, 0, playerTarget.z);
        const dir = t.clone().sub(p).normalize();
        const sideDir = new THREE.Vector3(-dir.z, 0, dir.x); // perpendicular
        
        const aheadDist = 2.2;
        const sideDist = 1.8;
        
        const targetPos = p.clone()
          .add(dir.multiplyScalar(aheadDist))
          .add(sideDir.multiplyScalar(sideDist));
          
        desired.set(targetPos.x, 0, targetPos.z);
      } else {
        // Idle wandering logic
        if (now > nextWanderAt.current) {
          nextWanderAt.current = now + 4 + Math.random() * 6;
          wanderOffset.current.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
          );
        }

        const offsetDist = 4.0;
        const baseOffset = new THREE.Vector3(
          Math.sin(playerRotation) * offsetDist,
          0,
          Math.cos(playerRotation) * offsetDist
        );
        
        desired.set(
          p.x + baseOffset.x + wanderOffset.current.x,
          0,
          p.z + baseOffset.z + wanderOffset.current.y
        );
      }
    }

    const distToDesired = desired.distanceTo(cur);
    const speed = controlled ? 0 : (playerTarget || directive.moveTarget) ? 3.5 : 1.2;
    const step = Math.min(distToDesired, speed * delta);
    if (distToDesired > 0.001) {
      cur.lerp(desired, clamp(step / Math.max(distToDesired, 0.0001), 0, 1));
    }

    const bob = controlled ? 0 : Math.sin(Date.now() / 220) * 0.03;
    group.current.position.set(cur.x, 0 + bob, cur.z);

    // Attention logic: Look at player occasionally
    if (!directive.shouldSpeak && !directive.moveTarget && !playerTarget) {
      const timeSinceLookChange = now - lastLookedAt.current;
      if (isLookingAtPlayer.current) {
        if (timeSinceLookChange > 3 + Math.random() * 2) {
          isLookingAtPlayer.current = false;
          lastLookedAt.current = now;
        }
      } else {
        if (timeSinceLookChange > 5 + Math.random() * 10) {
          isLookingAtPlayer.current = true;
          lastLookedAt.current = now;
        }
      }
    } else if (directive.shouldSpeak) {
      isLookingAtPlayer.current = true;
    }

    const look = new THREE.Vector3();
    const shouldLookAtCamera = !!lookAtCamera || directive.animation === "look_at_camera" || isLookingAtPlayer.current;
    
    if (shouldLookAtCamera) {
      look.copy(camera.position);
    } else if (playerTarget && !controlled) {
      look.set(playerTarget.x, 0, playerTarget.z);
    } else if (directive.moveTarget) {
      look.set(directive.moveTarget.x, 0, directive.moveTarget.z);
    } else {
      // Look where wandering
      look.copy(desired);
    }

    const dir = look.clone().sub(group.current.position);
    const yaw = Math.atan2(dir.x, dir.z);
    group.current.rotation.y = dampAngle(group.current.rotation.y, yaw, 6, delta);

    let desiredAnim: DinoAnimationKey = forcedAnimation ?? directive.animation ?? "idle";
    if (!controlled && distToDesired > 0.1) {
      desiredAnim = (playerTarget || directive.moveTarget) ? "run" : "walk";
    }
    setAnimKey(desiredAnim);

    if (!controlled) {
      const storeNow = performance.now();
      if (storeNow - lastStoreSync.current > 120) {
        lastStoreSync.current = storeNow;
        setDinoPos({ x: cur.x, y: 0, z: cur.z });
      }
    }
  });

  const finalScale = (scale ?? 1) * (controlled ? 1 : dinoScale) * 0.25;

  return (
    <group ref={group} scale={finalScale} onPointerDown={(e) => { if (interactive) { e.stopPropagation(); openMenu(); } }}>
      <AssetBoundary fallback={<FallbackDinoBody />}>
        <Suspense fallback={<FallbackDinoBody />}>
          <QuaterniusDinoModel activeAnimation={animKey} />
        </Suspense>
      </AssetBoundary>
    </group>
  );
}
