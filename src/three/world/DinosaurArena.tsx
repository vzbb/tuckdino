"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { useGameStore } from "@/src/state/useGameStore";
import {
  AnimatedDinosaur,
  getSpeciesForEgg,
  type DinoClip,
  type DinoSpecies,
} from "@/src/three/characters/DinosaurModel";

const ARENA_Z = -25;
const ARENA_TOP = 0.46;
const IMPACT_PARTICLES = 14;

const STATIC_ASSETS = {
  woodLog: "/assets/quaternius/WoodLog.glb",
  torch: "/assets/quaternius/WoodenTorch_Fire.glb",
  backpack: "/assets/quaternius/Backpack.glb",
  compass: "/assets/quaternius/Compass_Open.glb",
  raft: "/assets/quaternius/Raft.glb",
} as const;

type StaticAsset = keyof typeof STATIC_ASSETS;
type Vec3 = [number, number, number];

type ArenaModelProps = {
  asset: StaticAsset;
  position?: Vec3;
  rotation?: Vec3;
  scale?: number | Vec3;
};

type PreparedStaticModel = {
  object: THREE.Group;
  materials: THREE.Material[];
};

function prepareStaticModel(source: THREE.Group, asset: StaticAsset): PreparedStaticModel {
  const object = SkeletonUtils.clone(source) as THREE.Group;
  const materialClones = new Map<THREE.Material, THREE.Material>();

  const cloneMaterial = (sourceMaterial: THREE.Material) => {
    const cached = materialClones.get(sourceMaterial);
    if (cached) return cached;

    const material = sourceMaterial.clone();
    materialClones.set(sourceMaterial, material);

    if (asset === "torch" && material instanceof THREE.MeshStandardMaterial) {
      const name = material.name.toLowerCase();
      if (name.includes("fire")) {
        material.emissive.set("#ff4e16");
        material.emissiveIntensity = 2.2;
      } else if (name.includes("yellow")) {
        material.emissive.set("#ffc83d");
        material.emissiveIntensity = 0.75;
      }
    }

    return material;
  };

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.material = Array.isArray(child.material)
      ? child.material.map(cloneMaterial)
      : cloneMaterial(child.material);
  });

  return { object, materials: Array.from(materialClones.values()) };
}

function ArenaModel({
  asset,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: ArenaModelProps) {
  const gltf = useGLTF(STATIC_ASSETS[asset]);
  const prepared = useMemo(
    () => prepareStaticModel(gltf.scene, asset),
    [asset, gltf.scene]
  );

  useEffect(
    () => () => {
      prepared.materials.forEach((material) => material.dispose());
    },
    [prepared]
  );

  return (
    <primitive
      object={prepared.object}
      position={position}
      rotation={rotation}
      scale={scale}
      dispose={null}
    />
  );
}

function ArenaTorch({ position, phase }: { position: Vec3; phase: number }) {
  const light = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!light.current) return;
    const flicker =
      Math.sin(clock.elapsedTime * 11 + phase) * 0.17 +
      Math.sin(clock.elapsedTime * 19 + phase * 2.3) * 0.09;
    light.current.intensity = 1.7 + flicker;
  });

  return (
    <group position={position}>
      <ArenaModel asset="torch" position={[0, 0.43, 0]} scale={0.72} />
      <pointLight
        ref={light}
        position={[0, 2.45, 0]}
        color="#ff8a3d"
        intensity={1.7}
        distance={7.5}
        decay={2}
      />
    </group>
  );
}

export type ArenaImpactFxProps = {
  trigger: number;
  position: Vec3;
  color?: string;
  size?: number;
};

/** A single-draw-call particle pop plus an expanding magic ring. */
export function ArenaImpactFx({
  trigger,
  position,
  color = "#7de8ff",
  size = 1,
}: ArenaImpactFxProps) {
  const group = useRef<THREE.Group>(null);
  const particles = useRef<THREE.InstancedMesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useRef<THREE.Mesh>(null);
  const glowMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const startedAt = useRef(0);
  const [active, setActive] = useState(false);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const directions = useMemo(
    () =>
      Array.from({ length: IMPACT_PARTICLES }, (_, index) => {
        const angle = (index / IMPACT_PARTICLES) * Math.PI * 2;
        const lift = 0.18 + (index % 4) * 0.13;
        return new THREE.Vector3(Math.cos(angle), lift, Math.sin(angle)).normalize();
      }),
    []
  );

  useEffect(() => {
    if (trigger <= 0) {
      setActive(false);
      return;
    }

    startedAt.current = performance.now() / 1000;
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), 900);
    return () => window.clearTimeout(timer);
  }, [trigger]);

  useFrame(() => {
    if (!active || !particles.current) return;
    const elapsed = performance.now() / 1000 - startedAt.current;
    const progress = THREE.MathUtils.clamp(elapsed / 0.82, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const fade = 1 - progress;

    directions.forEach((direction, index) => {
      dummy.position.copy(direction).multiplyScalar(eased * 1.9 * size);
      dummy.position.y += eased * 0.32 * size;
      dummy.rotation.set(eased * 2.2, index * 0.61, eased * 1.3);
      dummy.scale.setScalar(Math.max(0.03, (0.78 - eased * 0.5) * size));
      dummy.updateMatrix();
      particles.current?.setMatrixAt(index, dummy.matrix);
    });
    particles.current.instanceMatrix.needsUpdate = true;

    if (ring.current) ring.current.scale.setScalar(0.35 + eased * 2.45 * size);
    if (ringMaterial.current) ringMaterial.current.opacity = fade * 0.78;
    if (glow.current) glow.current.scale.setScalar((0.5 + eased * 1.2) * size);
    if (glowMaterial.current) glowMaterial.current.opacity = fade * 0.38;
    if (light.current) light.current.intensity = fade * 3.4 * size;
  });

  return (
    <group ref={group} position={position} visible={active}>
      <instancedMesh
        ref={particles}
        args={[undefined, undefined, IMPACT_PARTICLES]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[0.12, 0]} />
        <meshBasicMaterial color={color} transparent depthWrite={false} toneMapped={false} />
      </instancedMesh>

      <mesh ref={ring} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.34, 0.5, 32]} />
        <meshBasicMaterial
          ref={ringMaterial}
          color={color}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={glow}>
        <sphereGeometry args={[0.46, 12, 8]} />
        <meshBasicMaterial
          ref={glowMaterial}
          color={color}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={light} color={color} distance={7} decay={2} />
    </group>
  );
}

function ArenaRuneStones() {
  const stones = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!stones.current) return;
    for (let index = 0; index < 12; index += 1) {
      const angle = (index / 12) * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * 7.25, ARENA_TOP + 0.08, Math.sin(angle) * 7.25);
      dummy.rotation.set(0, -angle, 0);
      dummy.scale.set(0.52, 0.22, 0.95);
      dummy.updateMatrix();
      stones.current.setMatrixAt(index, dummy.matrix);
    }
    stones.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  useFrame(({ clock }) => {
    if (material.current) {
      material.current.emissiveIntensity = 0.42 + Math.sin(clock.elapsedTime * 1.8) * 0.12;
    }
  });

  return (
    <instancedMesh ref={stones} args={[undefined, undefined, 12]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.48, 0]} />
      <meshStandardMaterial
        ref={material}
        color="#43aac0"
        emissive="#2fd9f2"
        emissiveIntensity={0.45}
        roughness={0.55}
      />
    </instancedMesh>
  );
}

function ArenaFloor() {
  return (
    <group>
      <mesh position-y={0.2} castShadow receiveShadow>
        <cylinderGeometry args={[8.25, 8.7, 0.4, 48]} />
        <meshStandardMaterial color="#263c4b" roughness={0.9} />
      </mesh>
      <mesh position-y={0.4} castShadow receiveShadow>
        <cylinderGeometry args={[7.55, 7.78, 0.1, 48]} />
        <meshStandardMaterial color="#cf9c59" roughness={0.96} />
      </mesh>
      <mesh position-y={ARENA_TOP} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[6.9, 48]} />
        <meshStandardMaterial color="#6c915d" roughness={0.96} />
      </mesh>
      <mesh position-y={ARENA_TOP + 0.012} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[5.7, 6.03, 48]} />
        <meshStandardMaterial
          color="#f2c85d"
          emissive="#ffb735"
          emissiveIntensity={0.34}
          roughness={0.55}
        />
      </mesh>
      <mesh position-y={ARENA_TOP + 0.018} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.35, 1.58, 36]} />
        <meshStandardMaterial
          color="#4be0df"
          emissive="#20bacd"
          emissiveIntensity={0.55}
          roughness={0.45}
        />
      </mesh>

      {([-2.6, 2.6] as const).map((x) => (
        <mesh key={x} position={[x, ARENA_TOP + 0.02, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[1.05, 1.24, 32]} />
          <meshStandardMaterial
            color={x < 0 ? "#55d5f2" : "#85d45d"}
            emissive={x < 0 ? "#1689bf" : "#4aa82f"}
            emissiveIntensity={0.5}
            roughness={0.5}
          />
        </mesh>
      ))}

      <ArenaRuneStones />
    </group>
  );
}

function ArenaGate() {
  return (
    <group position={[0, 0, -7.2]}>
      <mesh position={[0, 2.15, -0.32]}>
        <planeGeometry args={[8.4, 4.1]} />
        <meshStandardMaterial
          color="#153844"
          emissive="#0e7180"
          emissiveIntensity={0.28}
          roughness={0.7}
        />
      </mesh>

      {([-1, 1] as const).map((side) => (
        <group key={side} position={[side * 4.55, 0, 0]}>
          <mesh position={[0, 1.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.25, 3.8, 1.35]} />
            <meshStandardMaterial color="#365c68" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.85, 0]} castShadow>
            <dodecahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial
              color="#4ba5ac"
              emissive="#1d7280"
              emissiveIntensity={0.35}
              roughness={0.7}
            />
          </mesh>
          <mesh position={[0, 0.27, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.08, 1.35, 0.54, 8]} />
            <meshStandardMaterial color="#203e4b" roughness={0.95} />
          </mesh>
          <mesh position={[side * -0.08, 2.2, 0.71]}>
            <planeGeometry args={[0.68, 1.75]} />
            <meshStandardMaterial
              color={side < 0 ? "#ef675e" : "#f1c94d"}
              emissive={side < 0 ? "#7c2425" : "#8b5d0d"}
              emissiveIntensity={0.28}
              side={THREE.DoubleSide}
              roughness={0.72}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 4.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[10.1, 1.15, 1.5]} />
        <meshStandardMaterial color="#315663" roughness={0.88} />
      </mesh>
      <mesh position={[0, 4.25, 0.78]}>
        <torusGeometry args={[0.66, 0.16, 8, 24]} />
        <meshStandardMaterial
          color="#ffd55e"
          emissive="#ffad24"
          emissiveIntensity={0.7}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[0, 4.25, 0.79]} rotation-z={Math.PI / 4}>
        <octahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color="#5ef4ec"
          emissive="#21cfda"
          emissiveIntensity={0.75}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

const SPECTATORS: ReadonlyArray<{
  species: DinoSpecies;
  position: Vec3;
  rotation: number;
  scale: number;
}> = [
  { species: "trex", position: [-6.9, ARENA_TOP, -3.9], rotation: 1.06, scale: 1.18 },
  { species: "stegosaurus", position: [6.9, ARENA_TOP, -4.2], rotation: -1.02, scale: 1.02 },
  { species: "velociraptor", position: [-7.25, ARENA_TOP, 1.35], rotation: 1.48, scale: 0.86 },
  { species: "apatosaurus", position: [7.65, ARENA_TOP, 0.8], rotation: -1.46, scale: 1.22 },
];

function HeroDinosaur({
  species,
  animation,
  animationKey,
  victory,
}: {
  species: DinoSpecies;
  animation: DinoClip;
  animationKey: string;
  victory: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const arenaScale = species === "apatosaurus" ? 1.02 : 1.58;

  useFrame(({ clock }) => {
    if (!group.current) return;
    if (victory) {
      const bounce = Math.max(0, Math.sin(clock.elapsedTime * 3.7));
      group.current.position.y = ARENA_TOP + bounce * 0.34;
      group.current.rotation.y = Math.sin(clock.elapsedTime * 1.8) * 0.17;
    } else {
      group.current.position.y = ARENA_TOP;
      group.current.rotation.y = Math.PI / 2;
    }
  });

  return (
    <group ref={group} position={[-2.6, ARENA_TOP, 0]} rotation-y={Math.PI / 2}>
      <AnimatedDinosaur
        species={species}
        animation={animation}
        animationKey={animationKey}
        scale={arenaScale}
        glowColor={victory ? "#ffe36b" : "#4fe8ff"}
        glowIntensity={victory ? 0.68 : 0.28}
      />
    </group>
  );
}

function ArenaProps() {
  return (
    <group>
      <ArenaTorch position={[-5.7, 0, -6.4]} phase={0.2} />
      <ArenaTorch position={[5.7, 0, -6.4]} phase={1.7} />
      <ArenaTorch position={[-8.15, 0, 2.45]} phase={3.1} />
      <ArenaTorch position={[8.15, 0, 2.45]} phase={4.8} />

      <ArenaModel asset="woodLog" position={[-8.15, 0.72, -1.5]} rotation={[0, 0.72, 0]} scale={0.9} />
      <ArenaModel asset="woodLog" position={[8.2, 0.7, -1.7]} rotation={[0, -0.65, 0]} scale={0.88} />
      <ArenaModel asset="woodLog" position={[-7.45, 0.7, 4.2]} rotation={[0, 1.15, 0]} scale={0.78} />

      <ArenaModel asset="backpack" position={[-5.9, 0.95, 4.6]} rotation={[0, 0.38, 0]} scale={0.32} />
      <ArenaModel asset="compass" position={[-5.25, 0.82, 4.35]} rotation={[0, -0.25, 0]} scale={0.72} />
      <ArenaModel asset="raft" position={[9.35, 0.4, 5.05]} rotation={[0, -0.34, 0]} scale={0.25} />
    </group>
  );
}

export function DinosaurArena() {
  const eggSelectedId = useGameStore((state) => state.eggSelectedId);
  const mode = useGameStore((state) => state.adventure.mode);
  const turn = useGameStore((state) => state.adventure.turn);
  const [heroClip, setHeroClip] = useState<DinoClip>("idle");
  const [rivalClip, setRivalClip] = useState<DinoClip>("idle");
  const [impact, setImpact] = useState<{ token: number; target: "hero" | "rival" }>({
    token: 0,
    target: "rival",
  });
  const heroSpecies = getSpeciesForEgg(eggSelectedId ?? 0);
  const active = mode === "battle" || mode === "resolving" || mode === "victory";
  const victory = mode === "victory";

  useEffect(() => {
    const timers: number[] = [];
    const later = (callback: () => void, delay: number) => {
      timers.push(window.setTimeout(callback, delay));
    };
    const burstAt = (target: "hero" | "rival") => {
      setImpact((current) => ({ token: current.token + 1, target }));
    };

    setHeroClip("idle");
    setRivalClip("idle");

    if ((mode === "battle" || mode === "resolving") && turn > 0) {
      setHeroClip("attack");
      later(() => burstAt("rival"), 300);
      later(() => setHeroClip("idle"), 680);
      later(() => setRivalClip("attack"), 900);
      later(() => burstAt("hero"), 1_175);
      later(() => setRivalClip("idle"), 1_560);
    } else if (mode === "victory") {
      if (turn > 0) {
        setHeroClip("attack");
        later(() => burstAt("rival"), 300);
        later(() => setHeroClip("jump"), 720);
      } else {
        setHeroClip("jump");
      }
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [mode, turn]);

  return (
    <group position={[0, 0, ARENA_Z]}>
      <ArenaFloor />
      <ArenaGate />
      <ArenaProps />

      <pointLight
        position={[0, 4.6, -3.6]}
        color="#5ae7ff"
        intensity={active ? 1.25 : 0.42}
        distance={18}
        decay={2}
      />

      {active && (
        <>
          <HeroDinosaur
            species={heroSpecies}
            animation={heroClip}
            animationKey={`hero-${turn}-${mode}-${heroClip}`}
            victory={victory}
          />

          <group position={[2.6, ARENA_TOP, 0]} rotation-y={-Math.PI / 2}>
            <AnimatedDinosaur
              species="triceratops"
              animation={rivalClip}
              animationKey={`mossback-${turn}-${mode}-${rivalClip}`}
              scale={1.45}
              glowColor="#72f083"
              glowIntensity={victory ? 0.16 : 0.31}
            />
          </group>

          {SPECTATORS.map((spectator) => (
            <group
              key={spectator.species}
              position={spectator.position}
              rotation-y={spectator.rotation}
            >
              <AnimatedDinosaur
                species={spectator.species}
                animation="idle"
                animationKey={`spectator-${spectator.species}`}
                scale={spectator.scale}
                glowColor="#74dce8"
                glowIntensity={0.1}
              />
            </group>
          ))}

          <ArenaImpactFx
            trigger={impact.token}
            position={impact.target === "hero" ? [-2.6, 1.25, 0] : [2.6, 1.25, 0]}
            color={impact.target === "hero" ? "#69e9ff" : "#a8ff71"}
          />
          <ArenaImpactFx
            trigger={victory ? turn + 1 : 0}
            position={[-2.6, 0.72, 0]}
            color="#ffd85e"
            size={1.3}
          />
        </>
      )}
    </group>
  );
}
