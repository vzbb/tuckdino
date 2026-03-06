"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { useGameStore } from "@/src/state/useGameStore";
import { clamp } from "@/src/systems/utils/math";
import { BabyDino } from "@/src/three/characters/BabyDino";
import { useDinoSpeak } from "@/src/systems/ai/useDinoSpeak";

type EggStyle = { base: string; accent: string; glow: string };

const EGG_STYLES: EggStyle[] = [
  { base: "#ff7aa2", accent: "#ffe36e", glow: "#ffb1c6" },
  { base: "#66d9ff", accent: "#b1ff7a", glow: "#b6f0ff" },
  { base: "#a77bff", accent: "#ffbe6e", glow: "#cbb3ff" },
  { base: "#7affc8", accent: "#ffffff", glow: "#baffdf" },
  { base: "#ffd36e", accent: "#7aa2ff", glow: "#ffe7b1" },
];

function Egg({
  id,
  style,
  position,
  onPick,
  disabled,
}: {
  id: number;
  style: EggStyle;
  position: [number, number, number];
  onPick: (id: number) => void;
  disabled: boolean;
}) {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!meshRef.current) return;
    // Gentle hover to feel magical ✨
    meshRef.current.position.y = position[1] + Math.sin(t * 1.2 + id) * 0.07;
    meshRef.current.rotation.y = Math.sin(t * 0.6 + id) * 0.15;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
      onPointerDown={(e) => {
        e.stopPropagation();
        if (!disabled) onPick(id);
      }}
    >
      <sphereGeometry args={[0.85, 32, 32]} />
      <meshStandardMaterial
        color={style.base}
        emissive={style.glow}
        emissiveIntensity={0.45}
        roughness={0.6}
        metalness={0.05}
      />
      {/* Simple “spots” pattern */}
      <mesh position={[0.2, 0.25, 0.65]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={style.accent} roughness={0.7} />
      </mesh>
      <mesh position={[-0.35, 0.05, 0.55]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={style.accent} roughness={0.7} />
      </mesh>
      <mesh position={[0.0, -0.25, 0.75]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color={style.accent} roughness={0.7} />
      </mesh>
    </mesh>
  );
}

function GladeGround() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={"#2c5d3a"} roughness={1} />
      </mesh>

      {/* little “flowers” */}
      {Array.from({ length: 60 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 22,
            0.02,
            (Math.random() - 0.5) * 22,
          ]}
          rotation-y={Math.random() * Math.PI}
        >
          <coneGeometry args={[0.07, 0.25, 6]} />
          <meshStandardMaterial color={i % 3 === 0 ? "#ffd1e8" : i % 3 === 1 ? "#b6f0ff" : "#fff2b3"} />
        </mesh>
      ))}
    </group>
  );
}

function HatchingSequence() {
  const selectedId = useGameStore((s) => s.eggSelectedId);
  const setScene = useGameStore((s) => s.setScene);
  const markEggHatched = useGameStore((s) => s.markEggHatched);

  const eggGroup = useRef<Group>(null);
  const [phase, setPhase] = useState<"wiggle" | "crack" | "dino">("wiggle");
  const [startedAt] = useState(() => Date.now());
  const speak = useDinoSpeak();

  const style = EGG_STYLES[selectedId ?? 0] ?? EGG_STYLES[0];

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("crack"), 1200);
    const t2 = window.setTimeout(() => {
      setPhase("dino");
      markEggHatched();
    }, 2200);

    const t3 = window.setTimeout(async () => {
      // Baby dino introduction
      await speak({
        text: "Hi Tucker... I’m your baby dino!",
        mood: "excited",
        sceneHint: "hatching",
      });
    }, 2500);

    const t4 = window.setTimeout(() => {
      // auto transition to world after the moment lands
      setScene("world");
    }, 7000);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [markEggHatched, setScene, speak]);

  useFrame(({ clock }) => {
    if (!eggGroup.current) return;
    const t = clock.getElapsedTime();
    const elapsed = (Date.now() - startedAt) / 1000;

    if (phase === "wiggle") {
      eggGroup.current.rotation.z = Math.sin(t * 12) * 0.12;
      eggGroup.current.position.y = 0.85 + Math.abs(Math.sin(t * 7)) * 0.08;
    } else if (phase === "crack") {
      eggGroup.current.rotation.z = Math.sin(t * 20) * 0.22;
      eggGroup.current.position.y = 0.85 + Math.abs(Math.sin(t * 12)) * 0.12;
      eggGroup.current.scale.setScalar(1 + Math.sin(t * 10) * 0.03);
    } else {
      // dino phase — egg sinks a bit to reveal dino
      const sink = clamp((elapsed - 2.2) / 0.7, 0, 1);
      eggGroup.current.position.y = 0.85 - sink * 0.55;
      eggGroup.current.rotation.z = 0;
      eggGroup.current.scale.setScalar(1);
    }
  });

  return (
    <group>
      <group ref={eggGroup} position={[0, 0.85, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.95, 32, 32]} />
          <meshStandardMaterial
            color={style.base}
            emissive={style.glow}
            emissiveIntensity={0.5}
            roughness={0.6}
          />
        </mesh>
        {phase !== "wiggle" && (
          <mesh position={[0.0, 0.2, 0.85]}>
            <boxGeometry args={[0.6, 0.08, 0.05]} />
            <meshStandardMaterial color={"#ffffff"} emissive={"#ffffff"} emissiveIntensity={0.15} />
          </mesh>
        )}
      </group>

      {phase === "dino" && (
        <BabyDino
          position={[0, 0, -1.8]}
          scale={1.05}
          lookAtCamera
          // During the hatch intro, keep it charming and direct
          forcedAnimation="happy_jump"
        />
      )}
    </group>
  );
}

export function EggSelectionScene() {
  const scene = useGameStore((s) => s.scene);
  const selectEgg = useGameStore((s) => s.selectEgg);

  const eggs = useMemo(
    () => [
      { id: 0, pos: [-3.2, 0.85, 0] as [number, number, number] },
      { id: 1, pos: [-1.6, 0.85, -1.8] as [number, number, number] },
      { id: 2, pos: [0, 0.85, 0] as [number, number, number] },
      { id: 3, pos: [1.6, 0.85, -1.8] as [number, number, number] },
      { id: 4, pos: [3.2, 0.85, 0] as [number, number, number] },
    ],
    []
  );

  return (
    <group>
      <Sky sunPosition={[3, 2, 1]} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 12, 8]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <GladeGround />

      {/* Simple “glow stones” to frame eggs */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 12) * Math.PI * 2) * 6.5,
            0.12,
            Math.sin((i / 12) * Math.PI * 2) * 6.5,
          ]}
          castShadow
        >
          <dodecahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial color={"#7aa2ff"} emissive={"#7aa2ff"} emissiveIntensity={0.55} />
        </mesh>
      ))}

      {scene === "egg" && (
        <>
          {eggs.map((e) => (
            <Egg
              key={e.id}
              id={e.id}
              style={EGG_STYLES[e.id]}
              position={e.pos}
              onPick={(id) => selectEgg(id)}
              disabled={false}
            />
          ))}
        </>
      )}

      {scene === "hatching" && <HatchingSequence />}

      {/* Set an easy camera view */}
      <group position={[0, 0, 0]} />
    </group>
  );
}
