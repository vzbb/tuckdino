"use client";

import { Suspense, useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars, Sky } from "@react-three/drei";
import { Color, Vector3 } from "three";
import { useGameStore } from "@/src/state/useGameStore";
import { clamp } from "@/src/systems/utils/math";
import { BabyDino } from "@/src/three/characters/BabyDino";
import { PlayerMarker } from "@/src/three/characters/PlayerMarker";
import { playerRenderPosition } from "@/src/three/characters/PlayerMarker";
import { WorldProps } from "@/src/three/world/WorldProps";
import { Camp } from "@/src/three/world/Camp";
import { Collectibles } from "@/src/three/world/Collectibles";

function FollowCamera() {
  const camera = useThree((s) => s.camera);

  const target = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const { playerRotation, playerPitch, playerZoom } = useGameStore.getState();
    // First person camera: at player position, looking in rotation direction
    camera.position.set(playerRenderPosition.x, 1.4, playerRenderPosition.z);
    
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
      playerRenderPosition.x + sinYaw * cosPitch,
      1.4 + sinPitch,
      playerRenderPosition.z + cosYaw * cosPitch
    );
    camera.lookAt(target);
  });

  return null;
}

function Controls() {
  const { gl } = useThree();
  const setPlayerRotation = useGameStore((s) => s.setPlayerRotation);
  const setPlayerPitch = useGameStore((s) => s.setPlayerPitch);
  const setPlayerZoom = useGameStore((s) => s.setPlayerZoom);

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
        const current = useGameStore.getState();
        const newYaw = current.playerRotation - deltaX * 0.008;
        setPlayerRotation(newYaw);

        // Vertical tilt (pitch) - clamped to prevent flipping
        const newPitch = clamp(current.playerPitch - deltaY * 0.006, -Math.PI / 3, Math.PI / 3);
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
      const newZoom = clamp(useGameStore.getState().playerZoom + delta, 0.5, 2.0);
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
          const newZoom = clamp(useGameStore.getState().playerZoom + delta, 0.5, 2.0);
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
  }, [gl, setPlayerRotation, setPlayerPitch, setPlayerZoom]);

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
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
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
      <meshStandardMaterial color={"#65a957"} roughness={0.92} />
    </mesh>
  );
}

function DistantLandscape() {
  const peaks = useMemo(() => Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const radius = 61 + (i % 3) * 3;
    return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, scale: 6 + (i % 5) * 1.35, angle };
  }), []);

  return (
    <group>
      {peaks.map((peak, i) => (
        <group key={i} position={[peak.x, -1.5, peak.z]} rotation-y={-peak.angle}>
          <mesh scale={[1.45, 1, 1]}>
            <coneGeometry args={[peak.scale, peak.scale * 1.8, 6]} />
            <meshStandardMaterial color={i % 2 ? "#79a893" : "#6f9b8a"} roughness={1} flatShading />
          </mesh>
          <mesh position={[0, peak.scale * .63, 0]} scale={[1.46,.45,1.02]}>
            <coneGeometry args={[peak.scale * .5, peak.scale * .72, 6]} />
            <meshStandardMaterial color="#d9f0de" roughness={1} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function WorldScene() {
  const phase = useGameStore((s) => s.dayPhase);
  const dayLight = useGameStore((s) => s.dayLight);
  const scene = useThree((s) => s.scene);
  const isNight = phase === "night";

  const fogColor = isNight ? "#314c78" : phase === "morning" ? "#ffecdb" : phase === "evening" ? "#ffae80" : "#d0f0ff";
  const fogIntensity = isNight ? 0.007 : 0.0055;
  const skySunY = isNight ? 2.5 : dayLight * 10;

  useEffect(() => {
    scene.background = new Color(isNight ? "#536fa3" : phase === "morning" ? "#ffe8c9" : phase === "evening" ? "#ffb982" : "#aee8ff");
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
      <DistantLandscape />

      <WorldProps />
      <Collectibles />
      <Camp />

      <PlayerMarker />
      <BabyDino />

      <FollowCamera />
    </group>
  );
}
