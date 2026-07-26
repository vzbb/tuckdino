"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars, useTexture } from "@react-three/drei";
import { BackSide, Color, SRGBColorSpace, Vector3 } from "three";
import { useGameStore } from "@/src/state/useGameStore";
import { clamp } from "@/src/systems/utils/math";
import { BabyDino } from "@/src/three/characters/BabyDino";
import { PlayerMarker } from "@/src/three/characters/PlayerMarker";
import { playerRenderPosition } from "@/src/three/characters/PlayerMarker";
import { WorldProps } from "@/src/three/world/WorldProps";
import { Camp } from "@/src/three/world/Camp";
import { Collectibles } from "@/src/three/world/Collectibles";
import { DinosaurArena } from "@/src/three/world/DinosaurArena";
import { AssetBoundary } from "@/src/three/components/AssetBoundary";
import { EnemyEncounterLayer } from "@/src/three/world/EnemyEncounterLayer";
import { ForestAtmospherePass } from "@/src/three/world/ForestAtmospherePass";
import { NpcWorldPass } from "@/src/three/world/NpcWorldPass";
import { RanchSettlementPass } from "@/src/three/world/RanchSettlementPass";
import { TerrainComposition } from "@/src/three/world/TerrainComposition";
import { WorldBiomePass } from "@/src/three/world/WorldBiomePass";
import { ZoneLandmarkPass } from "@/src/three/world/ZoneLandmarkPass";

function CameraRig() {
  const camera = useThree((s) => s.camera);
  const target = useMemo(() => new Vector3(), []);
  const desiredPosition = useMemo(() => new Vector3(), []);
  const cinematicTarget = useMemo(() => new Vector3(0, 1.55, -25), []);
  const smoothedTarget = useRef(new Vector3(0, 1.55, -25));
  const lastTurn = useRef(-1);
  const shakeUntil = useRef(0);

  useFrame((state, delta) => {
    const { playerRotation, playerPitch, playerZoom, adventure } = useGameStore.getState();
    const cinematic = adventure.mode === "battle" || adventure.mode === "resolving" || adventure.mode === "victory";

    if (cinematic) {
      if (lastTurn.current !== adventure.turn) {
        lastTurn.current = adventure.turn;
        shakeUntil.current = state.clock.elapsedTime + 0.65;
      }

      const victory = adventure.mode === "victory";
      const orbit = state.clock.elapsedTime * (victory ? 0.22 : 0.1);
      const shake = state.clock.elapsedTime < shakeUntil.current
        ? Math.sin(state.clock.elapsedTime * 48) * 0.1
        : 0;
      desiredPosition.set(
        Math.sin(orbit) * (victory ? 6.2 : 1.25) + shake,
        victory ? 4.8 : 3.65 + shake * 0.35,
        victory ? -15.5 + Math.cos(orbit) * 2.2 : -14.2
      );
      camera.position.lerp(desiredPosition, 1 - Math.exp(-delta * 3.1));
      smoothedTarget.current.lerp(cinematicTarget, 1 - Math.exp(-delta * 4.5));
      camera.lookAt(smoothedTarget.current);
      if ("fov" in camera) {
        const perspective = camera as typeof camera & { fov: number; updateProjectionMatrix: () => void };
        perspective.fov += ((victory ? 48 : 54) - perspective.fov) * (1 - Math.exp(-delta * 4));
        perspective.updateProjectionMatrix();
      }
      return;
    }

    // First person camera: at player position, looking in rotation direction
    camera.position.set(playerRenderPosition.x, 1.4, playerRenderPosition.z);
    
    // Default FOV is usually 75. Scale it by zoom factor.
    if ("fov" in camera) {
      const perspective = camera as typeof camera & { fov: number; updateProjectionMatrix: () => void };
      perspective.fov = 75 * playerZoom;
      perspective.updateProjectionMatrix();
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
    smoothedTarget.current.copy(target);
    camera.lookAt(smoothedTarget.current);
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
      const game = useGameStore.getState();
      const mode = game.adventure.mode;
      if (game.activeEncounter || mode === "battle" || mode === "resolving" || mode === "victory") return;
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
      const mode = useGameStore.getState().adventure.mode;
      if (useGameStore.getState().activeEncounter || mode === "battle" || mode === "resolving" || mode === "victory") return;
      // Zoom in/out with mouse wheel
      const delta = e.deltaY * 0.001;
      const newZoom = clamp(useGameStore.getState().playerZoom + delta, 0.5, 2.0);
      setPlayerZoom(newZoom);
    };

    const onTouchMove = (e: TouchEvent) => {
      const mode = useGameStore.getState().adventure.mode;
      if (useGameStore.getState().activeEncounter || mode === "battle" || mode === "resolving" || mode === "victory") return;
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
  const ambient = isNight ? 0.22 : 0.26 + sun * 0.42;
  const dir = isNight ? 0.46 : 0.2 + sun * 1.0;
  const hemiIntensity = isNight ? 0.28 : 0.22 + sun * 0.22;

  // Smoother sun position based on daylight
  // x: -8 (sunrise) to 8 (sunset), y: -1 (night) to 10 (noon), z: 6
  const sunX = (dayLight - 0.5) * 16;
  const sunY = isNight ? 3.5 : sun * 10;
  const sunPos: [number, number, number] = [sunX, sunY, 6];

  return (
    <>
      <ambientLight intensity={ambient} color={isNight ? "#839bd1" : "#ffffff"} />
      <hemisphereLight
        args={[isNight ? "#7898d1" : "#f5fbff", isNight ? "#16293a" : "#4f7548", hemiIntensity]}
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
          <pointLight position={[0, 2.2, 0]} intensity={0.38} distance={14} color={"#7f9bd8"} />
          <pointLight position={[10, 2.4, 10]} intensity={1.25} distance={21} color={"#ffad5c"} />
        </>
      )}
    </>
  );
}

function WorldGround() {
  const setMoveTarget = useGameStore((s) => s.setMoveTarget);
  const adventureMode = useGameStore((s) => s.adventure.mode);
  const encounterActive = useGameStore((s) => s.activeEncounter !== null);
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
        if (!isDragging.current && !encounterActive && adventureMode !== "battle" && adventureMode !== "resolving" && adventureMode !== "victory") {
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

function HorizonPanorama() {
  const texture = useTexture("/world-horizon.png");
  texture.colorSpace = SRGBColorSpace;
  return (
    <mesh position={[0, 0, 0]} rotation-y={Math.PI * .12}>
      <sphereGeometry args={[74, 64, 32]} />
      <meshBasicMaterial map={texture} side={BackSide} fog={false} toneMapped={false} />
    </mesh>
  );
}

export function WorldScene() {
  const phase = useGameStore((s) => s.dayPhase);
  const dayLight = useGameStore((s) => s.dayLight);
  const scene = useThree((s) => s.scene);
  const adventureMode = useGameStore((s) => s.adventure.mode);
  const isNight = phase === "night";

  const fogColor = isNight ? "#17263e" : phase === "morning" ? "#ffecdb" : phase === "evening" ? "#ffae80" : "#d0f0ff";
  const fogIntensity = isNight ? 0.011 : 0.0055;

  useEffect(() => {
    scene.background = new Color(isNight ? "#111d34" : phase === "morning" ? "#ffe8c9" : phase === "evening" ? "#ffb982" : "#aee8ff");
    return () => {
      scene.background = null;
    };
  }, [scene, isNight, phase]);

  return (
    <group>
      <fogExp2 attach="fog" args={[fogColor, fogIntensity]} />
      
      {!isNight && <HorizonPanorama />}
      {isNight && <Stars radius={80} depth={40} count={900} factor={2.5} saturation={0.65} fade />}

      <Lighting />

      <Controls />
      <WorldGround />

      <TerrainComposition />
      <ForestAtmospherePass />
      <RanchSettlementPass />
      <NpcWorldPass />
      <ZoneLandmarkPass />
      <WorldProps />
      <AssetBoundary fallback={null}>
        <WorldBiomePass />
      </AssetBoundary>
      {(adventureMode === "battle" || adventureMode === "resolving" || adventureMode === "victory") && (
        <AssetBoundary fallback={null}>
          <DinosaurArena />
        </AssetBoundary>
      )}
      <Collectibles />
      <Camp />
      <EnemyEncounterLayer />

      {adventureMode !== "battle" && adventureMode !== "resolving" && adventureMode !== "victory" && (
        <>
          <PlayerMarker />
          <BabyDino />
        </>
      )}

      <CameraRig />
    </group>
  );
}
