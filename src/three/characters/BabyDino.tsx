"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Group, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { AssetBoundary } from "@/src/three/components/AssetBoundary";
import { useGameStore, type DinoAnimationKey } from "@/src/state/useGameStore";
import { clamp, dampAngle } from "@/src/systems/utils/math";

const BABY_DINO_GLB = "/assets/quaternius/Parasaurolophus.glb";

type Props = {
  /** If provided, the dino is “scene controlled” (used during hatch intro). */
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
      {/* body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.45, 0.9, 8, 16]} />
        <meshStandardMaterial color={dinoColor} roughness={0.85} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.7, 0.55]} castShadow>
        <sphereGeometry args={[0.38, 20, 20]} />
        <meshStandardMaterial color={dinoColor} roughness={0.8} />
      </mesh>
      {/* eyes */}
      <mesh position={[0.14, 0.76, 0.88]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={"#111"} />
      </mesh>
      <mesh position={[-0.14, 0.76, 0.88]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={"#111"} />
      </mesh>
      {/* tiny tail */}
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
    case "idle":
      return find(["idle", "rest", "stand"]) ?? null;
    case "walk":
      return find(["walk"]) ?? null;
    case "run":
      return find(["run", "sprint"]) ?? find(["walk"]) ?? null;
    case "hop":
    case "happy_jump":
      return find(["jump", "hop"]) ?? null;
    case "sit":
      return find(["sit"]) ?? null;
    case "nuzzle":
      return find(["nuzzle", "kiss", "sniff"]) ?? null;
    case "look_at_camera":
      return find(["idle"]) ?? null;
    case "clap":
      return find(["clap"]) ?? null;
    case "wave":
      return find(["wave"]) ?? null;
    default:
      return null;
  }
}

function QuaterniusDinoModel({ activeAnimation }: { activeAnimation: DinoAnimationKey }) {
  const gltf = useGLTF(BABY_DINO_GLB);
  const group = useRef<THREE.Group>(null);
  const dinoColor = useGameStore((s) => s.dinoColor);

  const { actions, names } = useAnimations(gltf.animations, group);

  useEffect(() => {
    // Apply dynamic color to all meshes in the model
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.color.set(dinoColor);
        }
      }
    });
  }, [gltf, dinoColor]);

  useEffect(() => {
    if (!actions) return;

    const clipName = pickClipName(names, activeAnimation);
    if (!clipName) return;

    const action = actions[clipName];
    if (!action) return;

    // Stop everything else, play selected
    Object.values(actions).forEach((a) => a?.fadeOut(0.12));
    action.reset().fadeIn(0.12).play();

    return () => {
      action.fadeOut(0.12);
    };
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

  const group = useRef<Group>(null);

  // Local, smooth position state (sync to store at low Hz)
  const posRef = useRef<Vector3>(
    new Vector3(storeDinoPos.x, storeDinoPos.y, storeDinoPos.z)
  );
  const lastStoreSync = useRef<number>(0);

  const [animKey, setAnimKey] = useState<DinoAnimationKey>("idle");

  const controlled = !!position;

  // On each new movement command, briefly “lead the way” with a hop.
  useEffect(() => {
    if (controlled) return;
    if (!playerTarget) return;

    setDinoDirective({
      mood: "excited",
      animation: "hop",
      shouldSpeak: false,
    });

    const t = window.setTimeout(() => {
      // Let the movement animation logic take back over.
      setDinoDirective({
        mood: "excited",
        animation: "run",
        shouldSpeak: false,
      });
    }, 500);

    return () => window.clearTimeout(t);
  }, [moveSequenceId, playerTarget, controlled, setDinoDirective]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const playerRotation = useGameStore.getState().playerRotation;

    // Determine desired position
    const desired = new Vector3();
    const cur = posRef.current;

    if (controlled && position) {
      desired.set(position[0], position[1], position[2]);
    } else if (directive.moveTarget) {
      // Autonomous movement target (Gemini-driven)
      desired.set(directive.moveTarget.x, 0, directive.moveTarget.z);
    } else {
      const p = new Vector3(playerPos.x, 0, playerPos.z);
      
      if (playerTarget) {
        // Player is moving: dino leads slightly but stays in FOV
        const t = new Vector3(playerTarget.x, 0, playerTarget.z);
        const dir = t.clone().sub(p);
        const dist = dir.length();
        dir.normalize();

        const lead = 2.4;
        const stopShort = 1.0; 

        const ahead = p.clone().add(dir.multiplyScalar(Math.min(lead, Math.max(0, dist - stopShort))));
        desired.set(ahead.x, 0, ahead.z);
      } else {
        // No target: Hang out in front of the player view (FPS-style)
        // Offset slightly to the side so we don't block the center of view
        const offsetDist = 3.5;
        const sideOffset = 1.2;
        desired.set(
          p.x + Math.sin(playerRotation) * offsetDist + Math.sin(playerRotation + Math.PI/2) * sideOffset,
          0,
          p.z + Math.cos(playerRotation) * offsetDist + Math.cos(playerRotation + Math.PI/2) * sideOffset
        );
      }
    }

    // Move towards desired
    const distToDesired = desired.distanceTo(cur);
    const speed = controlled ? 0 : playerTarget ? 3.2 : 2.0;
    const step = Math.min(distToDesired, speed * delta);

    if (distToDesired > 0.001) {
      cur.lerp(desired, clamp(step / Math.max(distToDesired, 0.0001), 0, 1));
    }

    // Simple bob to feel alive
    const bob = controlled ? 0 : Math.sin(Date.now() / 220) * 0.03;
    group.current.position.set(cur.x, 0 + bob, cur.z);

    // Face direction
    const look = new Vector3();
    // In FPS mode, the dino should look at the player when speaking or when idling
    const shouldLookAtCamera =
      !!lookAtCamera || 
      directive.animation === "look_at_camera" || 
      directive.shouldSpeak ||
      (!playerTarget && !directive.moveTarget);

    if (shouldLookAtCamera) {
      look.copy(camera.position);
    } else if (playerTarget && !controlled) {
      look.set(playerTarget.x, 0, playerTarget.z);
    } else {
      look.set(playerPos.x, 0, playerPos.z);
    }

    const dir = look.clone().sub(group.current.position);
    const yaw = Math.atan2(dir.x, dir.z);
    group.current.rotation.y = dampAngle(group.current.rotation.y, yaw, 10, delta);

    // Animation key decision
    let desiredAnim: DinoAnimationKey = forcedAnimation ?? directive.animation ?? "idle";
    if (!controlled) {
      const isMoving = distToDesired > 0.05;
      if (isMoving) {
        desiredAnim = (playerTarget || directive.moveTarget) ? "run" : "walk";
      }
    }
    setAnimKey(desiredAnim);

    // Sync to store at low frequency (avoid re-render storms)
    if (!controlled) {
      const now = performance.now();
      if (now - lastStoreSync.current > 120) {
        lastStoreSync.current = now;
        setDinoPos({ x: cur.x, y: 0, z: cur.z });
      }
    }
  });

  const finalScale = (scale ?? 1) * (controlled ? 1 : dinoScale) * 0.25;

  return (
    <group
      ref={group}
      scale={finalScale}
      onPointerDown={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        openMenu();
      }}
    >
      <AssetBoundary fallback={<FallbackDinoBody />}>
        <Suspense fallback={<FallbackDinoBody />}>
          <QuaterniusDinoModel activeAnimation={animKey} />
        </Suspense>
      </AssetBoundary>
    </group>
  );
}

