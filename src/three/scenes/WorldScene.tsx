"use client";

import { Suspense, useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars, Sky } from "@react-three/drei";
import { Color, Vector3 } from "three";
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
  const playerPitch = useGameStore((s) => s.playerPitch);
  const playerZoom = useGameStore((s) => s.playerZoom);

  const target = useMemo(() => new Vector3(), []);

  useFrame(() => {
    // First person camera: at player position, looking in rotation direction
    camera.position.set(playerPos.x, 1.4, playerPos.z);
    
    // Default FOV is usually 75. Scale it by zoom factor.
    if ("fov" in camera) {
      (camera as any).fov = 75 * playerZoom;
      (camera as any).updateProjectionMatrix();
    }

    // Look target including pitch (vertical) and yaw (horizontal)
    const cosPitch = Math.cos(playerPitch);
    const sinPitch = Math.sin(playerPitch);
    const cosYaw = Math.cos(playerRotation);
    const sinYaw = Math.sin(playerRotation);

    target.set(
      playerPos.x + sinYaw * cosPitch,
      1.4 + sinPitch,
      playerPos.z + cosYaw * cosPitch
    );
    camera.lookAt(target);
  });

  return null;
}

function Controls() {
  const { gl } = useThree();
  const setPlayerRotation = useGameStore((s) => s.setPlayerRotation);
  const playerRotation = useGameStore((s) => s.playerRotation);
  const setPlayerPitch = useGameStore((s) => s.setPlayerPitch);
  const playerPitch = useGameStore((s) => s.playerPitch);
  const setPlayerZoom = useGameStore((s) => s.setPlayerZoom);
  const playerZoom = useGameStore((s) => s.playerZoom);

  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const didMove = useRef(false);
  
  // Pinch zoom state
  const lastPinchDist = useRef<number | null>(null);

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      didMove.current = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      
      const deltaX = e.clientX - lastX.current;
      const deltaY = e.clientY - lastY.current;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        didMove.current = true;
        
        // Horizontal pan (yaw)
        const newYaw = playerRotation - deltaX * 0.008;
        setPlayerRotation(newYaw);

        // Vertical tilt (pitch) - clamped to prevent flipping
        const newPitch = clamp(playerPitch - deltaY * 0.006, -Math.PI / 3, Math.PI / 3);
        setPlayerPitch(newPitch);
      }

      lastX.current = e.clientX;
      lastY.current = e.clientY;
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      // Zoom in/out with mouse wheel
      const delta = e.deltaY * 0.001;
      const newZoom = clamp(playerZoom + delta, 0.5, 2.0);
      setPlayerZoom(newZoom);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch-to-zoom logic
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.sqrt(
          Math.pow(t1.clientX - t2.clientX, 2) + 
          Math.pow(t1.clientY - t2.clientY, 2)
        );

        if (lastPinchDist.current !== null) {
          const delta = (lastPinchDist.current - dist) * 0.005;
          const newZoom = clamp(playerZoom + delta, 0.5, 2.0);
          setPlayerZoom(newZoom);
        }
        lastPinchDist.current = dist;
      }
    };

    const onTouchEnd = () => {
      lastPinchDist.current = null;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [gl, playerRotation, setPlayerRotation, playerPitch, setPlayerPitch, playerZoom, setPlayerZoom]);

  return null;
}

function Lighting() {
  const dayLight = useGameStore((s) => s.dayLight);
  const phase = useGameStore((s) => s.dayPhase);
  const isNight = phase === "night";

  // Clamp and bias to keep it cozy
  const sun = clamp(dayLight, 0, 1);
  const ambient = isNight ? 0.5 : 0.26 + sun * 0.42;
  const dir = isNight ? 0.38 : 0.2 + sun * 1.0;
  const hemiIntensity = isNight ? 0.6 : 0.22 + sun * 0.22;

  // Smoother sun position based on daylight
  // x: -8 (sunrise) to 8 (sunset), y: -1 (night) to 10 (noon), z: 6
  const sunX = (dayLight - 0.5) * 16;
  const sunY = isNight ? 3.5 : sun * 10;
  const sunPos: [number, number, number] = [sunX, sunY, 6];

  return (
    <>
      <ambientLight intensity={ambient} color={isNight ? "#b7c8ff" : "#ffffff"} />
      <hemisphereLight
        args={[isNight ? "#c9dcff" : "#f5fbff", isNight ? "#35506b" : "#4f7548", hemiIntensity]}
      />
      <directionalLight
        position={sunPos}
        intensity={dir}
        color={isNight ? "#b8cbff" : "#fff3d6"}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      {isNight && (
        <>
          <pointLight position={[0, 2.2, 0]} intensity={0.55} distance={18} color={"#9ebdff"} />
          <pointLight position={[10, 1.8, 10]} intensity={0.8} distance={24} color={"#ffcc8a"} />
        </>
      )}
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
  const scene = useThree((s) => s.scene);
  const isNight = phase === "night";

  const fogColor = isNight ? "#314c78" : phase === "morning" ? "#ffecdb" : phase === "evening" ? "#ffae80" : "#d0f0ff";
  const fogIntensity = isNight ? 0.009 : 0.008;
  const skySunY = isNight ? 2.5 : dayLight * 10;

  useEffect(() => {
    scene.background = new Color(isNight ? "#4f6f9f" : phase === "morning" ? "#ffe4c7" : phase === "evening" ? "#ffb27f" : "#bfe6ff");
    return () => {
      scene.background = null;
    };
  }, [scene, isNight, phase]);

  return (
    <group>
      <fogExp2 attach="fog" args={[fogColor, fogIntensity]} />
      
      <Sky 
        sunPosition={[(dayLight - 0.5) * 16, skySunY, 6]}
        turbidity={isNight ? 2.4 : 0.1}
        rayleigh={isNight ? 1.2 : 0.5}
        mieCoefficient={isNight ? 0.018 : 0.005}
        mieDirectionalG={isNight ? 0.82 : 0.8}
      />
      {isNight && <Stars radius={80} depth={40} count={1800} factor={3.6} saturation={0.8} fade />}

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
