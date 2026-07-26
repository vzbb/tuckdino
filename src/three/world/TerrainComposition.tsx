"use client";

import { useMemo } from "react";

type GroundMarkProps = {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  rotation?: number;
};

function GroundMark({ position, scale, color, rotation = 0 }: GroundMarkProps) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotation]} scale={scale} receiveShadow raycast={() => {}}>
      <circleGeometry args={[1, 20]} />
      <meshStandardMaterial color={color} roughness={1} polygonOffset polygonOffsetFactor={-3} />
    </mesh>
  );
}

function Ridge({ position, scale, color, rotation = 0 }: { position: [number, number, number]; scale: [number, number, number]; color: string; rotation?: number }) {
  return (
    <group position={position} rotation-y={rotation} scale={scale}>
      <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} roughness={0.96} />
      </mesh>
      <mesh position={[0.18, 1.45, -0.06]} rotation-z={-0.18} castShadow receiveShadow>
        <coneGeometry args={[0.58, 1.5, 7]} />
        <meshStandardMaterial color="#477047" roughness={1} />
      </mesh>
    </group>
  );
}

function Landmark({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.35, 0]} castShadow><cylinderGeometry args={[0.2, 0.32, 2.7, 7]} /><meshStandardMaterial color="#4e3529" roughness={1} /></mesh>
      <mesh position={[0, 3.18, 0]} castShadow><coneGeometry args={[1.18, 2.5, 7]} /><meshStandardMaterial color={color} roughness={0.94} /></mesh>
      <mesh position={[0.16, 4.02, -0.12]} castShadow><coneGeometry args={[0.66, 1.5, 7]} /><meshStandardMaterial color="#719c55" roughness={0.94} /></mesh>
    </group>
  );
}

/** Static landscape layers. Keep separate from interaction ground so all terrain remains decorative. */
export function TerrainComposition() {
  const ridges = useMemo(() => [
    [-31, -18, 2.5, 1.7, "#315d3e", 0.3], [-25, -25, 2.9, 1.9, "#3a6944", -0.2], [-17, -29, 2.2, 1.45, "#315d3e", 0.4],
    [-8, -32, 2.8, 1.7, "#416e45", -0.25], [2, -33, 3.1, 1.9, "#315d3e", 0.15], [12, -31, 2.45, 1.55, "#416e45", 0.45],
    [23, -29, 3, 1.85, "#315d3e", -0.35], [31, -21, 2.6, 1.55, "#3a6944", 0.2], [32, -8, 3, 1.8, "#315d3e", -0.2],
    [31, 6, 2.4, 1.55, "#416e45", 0.4], [26, 20, 3.15, 1.9, "#315d3e", -0.4], [14, 27, 2.7, 1.65, "#3a6944", 0.2],
    [-2, 30, 3.2, 1.9, "#315d3e", -0.15], [-17, 27, 2.5, 1.55, "#416e45", 0.45], [-28, 19, 3, 1.8, "#315d3e", -0.25],
    [-33, 5, 2.65, 1.6, "#3a6944", 0.25], [-34, -7, 3.1, 1.85, "#315d3e", -0.35],
  ] as const, []);
  const road = useMemo(() => [
    [-1.3, -23.2, 2.25, 4.5, -0.16], [-0.6, -18.9, 2.15, 4.1, 0.13], [0.1, -14.8, 2.1, 4.2, -0.13],
    [1.2, -10.8, 2.05, 4.1, 0.2], [2.2, -6.8, 2.05, 3.8, -0.18], [3.1, -3.1, 2.1, 3.9, 0.14],
    [3.5, 0.7, 2.15, 4.1, -0.1], [4.1, 4.7, 2.1, 3.9, 0.2], [5.5, 8.3, 2.2, 3.9, -0.3],
  ] as const, []);
  const banks = useMemo(() => Array.from({ length: 12 }, (_, index) => ({
    x: -24 + index * 4.15,
    z: -10.2 + Math.sin(index * 0.78) * 1.4,
    rotation: Math.sin(index * 0.78) * 0.2,
  })), []);

  return (
    <group name="terrain-composition">
      {/* Broad terrace bands turn edge of playable meadow into layered basin. */}
      <GroundMark position={[0, 0.012, -2]} scale={[34, 24, 1]} color="#568a4d" />
      <GroundMark position={[0, 0.02, -2]} scale={[29.5, 20.5, 1]} color="#6fa354" />
      <GroundMark position={[1, 0.028, -3]} scale={[23.5, 16.5, 1]} color="#76ad5c" />
      <GroundMark position={[3, 0.036, -5]} scale={[17.5, 12.5, 1]} color="#82b964" />

      {/* Built road plus darker packed-earth shoulders: path reads as route, not paint. */}
      {road.map(([x, z, width, length, rotation], index) => (
        <group key={`road-${index}`} position={[x, 0.052, z]} rotation-y={rotation}>
          <mesh rotation-x={-Math.PI / 2} scale={[width * 1.22, length * 1.18, 1]} receiveShadow raycast={() => {}}>
            <circleGeometry args={[1, 20]} /><meshStandardMaterial color="#a57c49" roughness={1} polygonOffset polygonOffsetFactor={-5} />
          </mesh>
          <mesh position={[0, 0.008, 0]} rotation-x={-Math.PI / 2} scale={[width, length, 1]} receiveShadow raycast={() => {}}>
            <circleGeometry args={[1, 20]} /><meshStandardMaterial color={index % 2 ? "#d7b56d" : "#cda85f"} roughness={0.96} polygonOffset polygonOffsetFactor={-6} />
          </mesh>
        </group>
      ))}

      {/* Meandering water channel sits below raised grassy banks. */}
      {banks.map(({ x, z, rotation }, index) => (
        <group key={`stream-${index}`} position={[x, 0.04, z]} rotation-y={rotation}>
          <mesh rotation-x={-Math.PI / 2} scale={[2.35, 2.75, 1]} receiveShadow raycast={() => {}}>
            <circleGeometry args={[1, 18]} /><meshStandardMaterial color="#396e63" roughness={1} polygonOffset polygonOffsetFactor={-4} />
          </mesh>
          <mesh position={[0, -0.008, 0]} rotation-x={-Math.PI / 2} scale={[1.45, 2.7, 1]} receiveShadow raycast={() => {}}>
            <circleGeometry args={[1, 18]} /><meshStandardMaterial color="#54b8cd" emissive="#1d7192" emissiveIntensity={0.15} roughness={0.2} metalness={0.14} polygonOffset polygonOffsetFactor={-5} />
          </mesh>
          {[-1, 1].map((side) => <mesh key={side} position={[side * 1.68, 0.22, index % 2 ? 0.55 : -0.4]} castShadow receiveShadow scale={[0.42, 0.28, 0.75]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#718974" roughness={1} /></mesh>)}
        </group>
      ))}

      {/* Enclosing ridge ring, opening north-east toward ranch and distant gate. */}
      {ridges.map(([x, z, width, height, color, rotation], index) => <Ridge key={`ridge-${index}`} position={[x, 0, z]} scale={[width, height, width * 0.9]} color={color} rotation={rotation} />)}

      {/* Distant silhouettes establish destination depth; foreground pines frame first-person views. */}
      <Landmark position={[-20, 0, -27]} color="#2e5639" scale={1.55} />
      <Landmark position={[18, 0, -29]} color="#385f3e" scale={1.75} />
      <Landmark position={[27, 0, 15]} color="#31583c" scale={1.5} />
      <Landmark position={[-27, 0, 14]} color="#365f3f" scale={1.35} />
      <group position={[-10, 0, -22]} rotation-y={0.28}>
        <mesh position={[0, 2.3, 0]} castShadow><coneGeometry args={[1.1, 4.6, 6]} /><meshStandardMaterial color="#4e5863" roughness={0.85} /></mesh>
        <mesh position={[0, 4.65, 0]} castShadow><coneGeometry args={[0.38, 1.45, 5]} /><meshStandardMaterial color="#a8b7bd" emissive="#506f78" emissiveIntensity={0.2} roughness={0.55} /></mesh>
      </group>
      <Landmark position={[-7.8, 0, -19]} color="#416c42" scale={1.16} />
      <Landmark position={[9.6, 0, -18]} color="#365d3c" scale={1.08} />
    </group>
  );
}
