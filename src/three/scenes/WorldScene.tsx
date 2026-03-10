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
  const playerRotation = useGameStore((s) => s.playerRotation);

  const target = useMemo(() => new Vector3(), []);

  useFrame(() => {
    // First person camera: at player position, looking in rotation direction
    camera.position.set(playerPos.x, 1.4, playerPos.z);
    
    target.set(
      playerPos.x + Math.sin(playerRotation),
      1.4,
      playerPos.z + Math.cos(playerRotation)
    );
    camera.lookAt(target);
  });

  return null;
}

function Controls() {
  const { gl } = useThree();
  const setPlayerRotation = useGameStore((s) => s.setPlayerRotation);
  const playerRotation = useGameStore((s) => s.playerRotation);
  const setMoveTarget = useGameStore((s) => s.setMoveTarget);

  const isDragging = useRef(false);
  const lastX = useRef(0);
  const didMove = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastX.current = e.clientX;
      didMove.current = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      
      const deltaX = e.clientX - lastX.current;
      if (Math.abs(deltaX) > 2) {
        didMove.current = true;
        // Adjust sensitivity for kid-friendly rotation
        const newYaw = playerRotation - deltaX * 0.008;
        setPlayerRotation(newYaw);
      }
      lastX.current = e.clientX;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      
      // If we didn't drag much, treat it as a tap for movement
      if (!didMove.current) {
        // We'll handle tapping the ground via WorldGround's onPointerDown
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [gl, playerRotation, setPlayerRotation]);

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
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  return (
    <mesh
      rotation-x={-Math.PI / 2}
      receiveShadow
      onPointerDown={(e) => {
        startPos.current = { x: e.clientX, y: e.clientY };
        isDragging.current = false;
      }}
      onPointerMove={(e) => {
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          isDragging.current = true;
        }
      }}
      onPointerUp={(e) => {
        // Only move if we weren't dragging the camera
        if (!isDragging.current) {
          e.stopPropagation();
          setMoveTarget({ x: e.point.x, y: 0, z: e.point.z });
        }
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

      <Controls />
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
