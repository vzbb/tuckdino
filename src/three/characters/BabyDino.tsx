"use client";

import { Suspense, useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { AssetBoundary } from "@/src/three/components/AssetBoundary";
import { useGameStore, type DinoAnimationKey } from "@/src/state/useGameStore";
import { clamp, dampAngle } from "@/src/systems/utils/math";
import { playerRenderPosition } from "@/src/three/characters/PlayerMarker";
import {
  AnimatedDinosaur,
  getSpeciesForEgg,
  type DinoClip,
} from "@/src/three/characters/DinosaurModel";

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

function toDinoClip(key: DinoAnimationKey): DinoClip {
  switch (key) {
    case "walk": return "walk";
    case "run": return "run";
    case "hop":
    case "happy_jump": return "jump";
    default: return "idle";
  }
}

function InteractionEffects() {
  const recentEvents = useGameStore((s) => s.recentEvents);
  const [showHearts, setShowHearts] = useState(false);
  const lastEventRef = useRef<number>(0);

  useEffect(() => {
    const last = recentEvents[recentEvents.length - 1];
    if (last?.type === "dino_action" && (last.action === "pet" || last.action === "feed") && last.t > lastEventRef.current) {
      lastEventRef.current = last.t;
      setShowHearts(true);
      const timer = setTimeout(() => setShowHearts(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentEvents]);

  if (!showHearts) return null;

  return (
    <group position={[0, 1.2, 0]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Heart key={i} index={i} />
      ))}
    </group>
  );
}

function Heart({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.5 + Math.random() * 1, []);
  const offset = useMemo(() => new THREE.Vector3(
    (Math.random() - 0.5) * 1.5,
    Math.random() * 0.5,
    (Math.random() - 0.5) * 1.5
  ), []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime % 2;
    ref.current.position.y = offset.y + t * speed;
    ref.current.position.x = offset.x + Math.sin(t * 5 + index) * 0.2;
    ref.current.scale.setScalar(clamp(1 - t/2, 0, 1) * 0.4);
    ref.current.rotation.y = t * 2;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial color={"#ff6b8b"} emissive={"#ff3366"} emissiveIntensity={1} />
    </mesh>
  );
}

function MeadowCrest() {
  const crest = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!crest.current) return;
    crest.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.8) * .18;
    crest.current.position.y = 1.42 + Math.sin(state.clock.elapsedTime * 2.6) * .035;
  });
  return (
    <group ref={crest} position={[0, 1.42, .12]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[.24, .24, .07, 8]} />
        <meshStandardMaterial color="#f6c94a" emissive="#d98c20" emissiveIntensity={.35} metalness={.55} roughness={.28} />
      </mesh>
      <mesh position={[0, .01, .055]} rotation-z={Math.PI / 4}>
        <boxGeometry args={[.17, .17, .055]} />
        <meshStandardMaterial color="#fff1a6" emissive="#ffc83d" emissiveIntensity={.7} metalness={.35} roughness={.22} />
      </mesh>
    </group>
  );
}

function GrowthCosmetics({ stage, color }: { stage: number; color: string }) {
  const aura = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!aura.current) return;
    aura.current.rotation.y = state.clock.elapsedTime * .35;
  });

  return (
    <group ref={aura}>
      {stage >= 2 && (
        <group position={[0, .93, -.08]}>
          {[-.34, 0, .34].map((z, index) => (
            <mesh key={z} position={[0, index === 1 ? .16 : .05, z]} rotation-x={-.18} castShadow>
              <coneGeometry args={[.1 + index * .025, .34 + index * .08, 5]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={.32} roughness={.38} />
            </mesh>
          ))}
        </group>
      )}
      {stage >= 3 && Array.from({ length: 6 }).map((_, index) => {
        const angle = index / 6 * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * .62, .68 + index % 2 * .16, Math.sin(angle) * .62]}>
            <octahedronGeometry args={[.055 + Math.min(stage, 6) * .006, 0]} />
            <meshStandardMaterial color="#fff0a8" emissive={color} emissiveIntensity={.9} />
          </mesh>
        );
      })}
      {stage >= 4 && (
        <mesh position-y={.05} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[.7, .77, 36]} />
          <meshBasicMaterial color={color} transparent opacity={.45} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
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
  const playerTarget = useGameStore((s) => s.playerTarget);
  const moveSequenceId = useGameStore((s) => s.moveSequenceId);
  const openMenu = useGameStore((s) => s.openRadialMenu);
  const setDinoDirective = useGameStore((s) => s.setDinoDirective);
  const eggSelectedId = useGameStore((s) => s.eggSelectedId);
  const dayPhase = useGameStore((s) => s.dayPhase);
  const meadowCrestEarned = useGameStore((s) => s.progression.meadowCrestEarned);
  const dinoColor = useGameStore((s) => s.dinoColor);
  const growthStage = useGameStore((s) => s.dinoStats.growthStage);

  const group = useRef<THREE.Group>(null);
  const posRef = useRef<THREE.Vector3>(new THREE.Vector3(storeDinoPos.x, storeDinoPos.y, storeDinoPos.z));
  const lastStoreSync = useRef<number>(0);
  const [animKey, setAnimKey] = useState<DinoAnimationKey>("idle");
  const animKeyRef = useRef<DinoAnimationKey>("idle");

  // Behavior state for wandering/attention
  const wanderOffset = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const nextWanderAt = useRef<number>(0);
  const lastLookedAt = useRef<number>(0);
  const isLookingAtPlayer = useRef<boolean>(false);
  const moveHeading = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 1));
  const followSide = useRef<number>(1);

  const controlled = !!position;

  useEffect(() => {
    if (controlled || !playerTarget) return;
    setDinoDirective({ mood: "excited", animation: "hop", shouldSpeak: false });
    const t = window.setTimeout(() => {
      setDinoDirective({ mood: "excited", animation: "run", shouldSpeak: false });
    }, 500);
    return () => window.clearTimeout(t);
  }, [moveSequenceId, playerTarget, controlled, setDinoDirective]);

  useEffect(() => {
    if (!controlled && playerTarget) {
      followSide.current = Math.random() > 0.5 ? 1 : -1;
    }
  }, [controlled, moveSequenceId, playerTarget]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const playerRotation = useGameStore.getState().playerRotation;
    const desired = new THREE.Vector3();
    const cur = posRef.current;
    const now = state.clock.elapsedTime;

    if (controlled && position) {
      desired.set(position[0], position[1], position[2]);
      cur.copy(desired);
    } else if (directive.moveTarget) {
      desired.set(directive.moveTarget.x, 0, directive.moveTarget.z);
    } else {
      const p = playerRenderPosition.clone();
      
      if (playerTarget) {
        const t = new THREE.Vector3(playerTarget.x, 0, playerTarget.z);
        const travel = t.clone().sub(p);
        const travelDir =
          travel.lengthSq() > 0.0001 ? travel.normalize() : moveHeading.current.clone();
        const sideDir = new THREE.Vector3(-travelDir.z, 0, travelDir.x);
        const trailingDist = -1.15;
        const sideDist = 1.35 * followSide.current;
        const targetPos = p
          .clone()
          .add(travelDir.multiplyScalar(-trailingDist))
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

        const offsetDist = 2.8;
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
    const speed = (playerTarget || directive.moveTarget) ? 3.5 : 1.2;
    const step = Math.min(distToDesired, speed * delta);
    const moveDelta = desired.clone().sub(cur);
    if (distToDesired > 0.001) {
      cur.lerp(desired, clamp(step / Math.max(distToDesired, 0.0001), 0, 1));
    }
    if (moveDelta.lengthSq() > 0.0004) {
      moveHeading.current.copy(moveDelta.normalize());
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
    
    if (moveHeading.current.lengthSq() > 0.04 && distToDesired > 0.18) {
      look.copy(group.current.position).add(moveHeading.current);
    } else if (shouldLookAtCamera) {
      look.copy(camera.position);
    } else if (directive.moveTarget) {
      look.set(directive.moveTarget.x, 0, directive.moveTarget.z);
    } else {
      look.copy(group.current.position).add(moveHeading.current);
    }

    const dir = look.clone().sub(group.current.position);
    const yaw = Math.atan2(dir.x, dir.z);
    group.current.rotation.y = dampAngle(group.current.rotation.y, yaw, 6, delta);

    let desiredAnim: DinoAnimationKey = forcedAnimation ?? directive.animation ?? "idle";
    if (!controlled && distToDesired > 0.1) {
      desiredAnim = (playerTarget || directive.moveTarget) ? "run" : "walk";
    }
    if (animKeyRef.current !== desiredAnim) {
      animKeyRef.current = desiredAnim;
      setAnimKey(desiredAnim);
    }

    if (!controlled) {
      const storeNow = performance.now();
      if (storeNow - lastStoreSync.current > 120) {
        lastStoreSync.current = storeNow;
        setDinoPos({ x: cur.x, y: 0, z: cur.z });
      }
    }
  });

  const finalScale = (scale ?? 1) * (controlled ? 1 : dinoScale);
  const species = getSpeciesForEgg(eggSelectedId);
  const modelAnimation = toDinoClip(animKey);

  return (
    <group ref={group} scale={finalScale} onPointerDown={(e) => { if (interactive) { e.stopPropagation(); openMenu(); } }}>
      <InteractionEffects />
      {!controlled && meadowCrestEarned && <MeadowCrest />}
      {!controlled && <GrowthCosmetics stage={growthStage} color={dinoColor} />}
      <AssetBoundary fallback={<FallbackDinoBody />}>
        <Suspense fallback={<FallbackDinoBody />}>
          <AnimatedDinosaur
            species={species}
            animation={modelAnimation}
            animationKey={animKey}
            tintColor={dinoColor}
            tintStrength={.2 + Math.min(growthStage, 5) * .018}
            glowColor={dayPhase === "night" || growthStage >= 4 ? dinoColor : undefined}
            glowIntensity={dayPhase === "night" ? .16 : growthStage >= 4 ? .1 : 0}
          />
        </Suspense>
      </AssetBoundary>
    </group>
  );
}
