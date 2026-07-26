"use client";

import { useGameStore } from "@/src/state/useGameStore";

type Point = { x: number; z: number; scale: number; turn: number };

const EDGE_CANOPY: Point[] = [
  { x: -33, z: -4, scale: 1.7, turn: 0.2 }, { x: -29, z: 7, scale: 1.45, turn: 0.8 },
  { x: -24, z: 18, scale: 1.85, turn: 1.4 }, { x: -14, z: 27, scale: 1.6, turn: 2.1 },
  { x: -2, z: 31, scale: 1.95, turn: 2.8 }, { x: 12, z: 28, scale: 1.55, turn: 3.4 },
  { x: 25, z: 23, scale: 1.82, turn: 4.1 }, { x: 31, z: 10, scale: 1.58, turn: 4.8 },
  { x: 33, z: -5, scale: 1.9, turn: 5.3 }, { x: 29, z: -19, scale: 1.5, turn: 5.8 },
  { x: 18, z: -29, scale: 1.75, turn: 0.45 }, { x: 5, z: -33, scale: 1.5, turn: 1.1 },
  { x: -11, z: -31, scale: 1.85, turn: 1.75 }, { x: -24, z: -25, scale: 1.48, turn: 2.45 },
];

const UNDERSTORY: Point[] = [
  { x: -25, z: -7, scale: 1.2, turn: 0.3 }, { x: -22, z: 13, scale: 1.45, turn: 1.2 },
  { x: -17, z: 22, scale: 1.15, turn: 2.1 }, { x: -7, z: 27, scale: 1.4, turn: 2.7 },
  { x: 7, z: 27, scale: 1.18, turn: 3.1 }, { x: 20, z: 21, scale: 1.38, turn: 4.2 },
  { x: 27, z: 4, scale: 1.2, turn: 5.0 }, { x: 24, z: -15, scale: 1.45, turn: 5.6 },
  { x: 12, z: -26, scale: 1.25, turn: 0.7 }, { x: -3, z: -28, scale: 1.48, turn: 1.45 },
  { x: -19, z: -23, scale: 1.18, turn: 2.4 }, { x: -29, z: -16, scale: 1.35, turn: 3.0 },
];

const SILHOUETTES: Point[] = [
  { x: -46, z: -20, scale: 2.4, turn: 0 }, { x: -39, z: 20, scale: 1.9, turn: 0.5 },
  { x: -24, z: 42, scale: 2.25, turn: 1 }, { x: 0, z: 45, scale: 2.65, turn: 1.5 },
  { x: 23, z: 42, scale: 2.05, turn: 2 }, { x: 43, z: 22, scale: 2.4, turn: 2.5 },
  { x: 46, z: -7, scale: 2.1, turn: 3 }, { x: 35, z: -35, scale: 2.5, turn: 3.5 },
  { x: 8, z: -44, scale: 2.2, turn: 4 }, { x: -21, z: -41, scale: 2.45, turn: 4.5 },
];

function CanopyMass({ point, distant = false }: { point: Point; distant?: boolean }) {
  const trunkHeight = distant ? 3.8 : 3.2;
  const leaf = distant ? "#365d63" : "#275c45";
  return (
    <group position={[point.x, 0, point.z]} rotation-y={point.turn} scale={point.scale}>
      <mesh position={[0, trunkHeight / 2, 0]} raycast={() => {}}>
        <cylinderGeometry args={[0.2, 0.3, trunkHeight, 7]} />
        <meshStandardMaterial color={distant ? "#405053" : "#65442e"} roughness={1} />
      </mesh>
      <mesh position={[0.1, trunkHeight + 0.95, 0]} scale={[1.25, 1, 1.1]} raycast={() => {}}>
        <sphereGeometry args={[1.35, 10, 8]} />
        <meshStandardMaterial color={leaf} roughness={1} />
      </mesh>
      <mesh position={[-0.72, trunkHeight + 0.55, 0.26]} scale={[0.9, 0.78, 0.85]} raycast={() => {}}>
        <sphereGeometry args={[1.2, 9, 7]} />
        <meshStandardMaterial color={distant ? "#426b6a" : "#34704c"} roughness={1} />
      </mesh>
      <mesh position={[0.72, trunkHeight + 0.5, -0.22]} scale={[0.86, 0.74, 0.82]} raycast={() => {}}>
        <sphereGeometry args={[1.15, 9, 7]} />
        <meshStandardMaterial color={distant ? "#2c515a" : "#1f523e"} roughness={1} />
      </mesh>
    </group>
  );
}

function Understory({ point, index }: { point: Point; index: number }) {
  const berry = index % 3 === 0;
  return (
    <group position={[point.x, 0, point.z]} rotation-y={point.turn} scale={point.scale}>
      <mesh position={[0, 0.47, 0]} scale={[1.15, 0.7, 0.9]} raycast={() => {}}>
        <sphereGeometry args={[0.82, 9, 7]} />
        <meshStandardMaterial color={berry ? "#517a48" : "#3f7947"} roughness={1} />
      </mesh>
      <mesh position={[0.5, 0.31, 0.16]} scale={[0.65, 0.5, 0.6]} raycast={() => {}}>
        <sphereGeometry args={[0.65, 8, 6]} />
        <meshStandardMaterial color="#6e9553" roughness={1} />
      </mesh>
      {berry && <mesh position={[-0.28, 0.7, 0.52]} raycast={() => {}}><sphereGeometry args={[0.12, 7, 6]} /><meshStandardMaterial color="#e78c67" emissive="#7f3f46" emissiveIntensity={0.18} /></mesh>}
    </group>
  );
}

export function ForestAtmospherePass() {
  const phase = useGameStore((state) => state.dayPhase);
  const night = phase === "night";

  return (
    <group name="forest-atmosphere-pass">
      <group name="distant-forest-silhouettes">
        {SILHOUETTES.map((point, index) => <CanopyMass key={index} point={point} distant />)}
      </group>
      <group name="biome-edge-canopy">
        {EDGE_CANOPY.map((point, index) => <CanopyMass key={index} point={point} />)}
      </group>
      <group name="varied-understory">
        {UNDERSTORY.map((point, index) => <Understory key={index} point={point} index={index} />)}
      </group>

      <group name="foreground-framing">
        <CanopyMass point={{ x: -10, z: -5, scale: 1.25, turn: 0.4 }} />
        <CanopyMass point={{ x: 13, z: 2, scale: 1.1, turn: 2.4 }} />
        <Understory point={{ x: -7.8, z: -3.6, scale: 1.1, turn: 0.2 }} index={1} />
        <Understory point={{ x: 9.7, z: 3.4, scale: 1.25, turn: 2.2 }} index={3} />
      </group>

      <group name="warm-landmark-glow" position={[0, 0, -27]}>
        <mesh position={[0, 2.25, 0]} raycast={() => {}}>
          <cylinderGeometry args={[0.14, 0.2, 4.5, 8]} />
          <meshStandardMaterial color="#5e432e" roughness={1} />
        </mesh>
        <mesh position={[0, 4.55, 0]} raycast={() => {}}>
          <sphereGeometry args={[0.5, 12, 9]} />
          <meshStandardMaterial color="#ffd48a" emissive="#ff9a58" emissiveIntensity={night ? 1.8 : 0.55} roughness={0.4} />
        </mesh>
        <pointLight position={[0, 4.5, 0]} color="#ffbc77" intensity={night ? 1.4 : 0.32} distance={night ? 15 : 7} />
      </group>
    </group>
  );
}
