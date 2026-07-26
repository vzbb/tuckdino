"use client";

import { useGameStore } from "@/src/state/useGameStore";

/**
 * Hero silhouettes for destination reading. They deliberately sit at zone centers,
 * use only static primitives, and opt out of raycasting so ground taps still work.
 */
const noRaycast = () => {};

function TrainingRingLandmark() {
  return (
    <group name="training-ring-gold-hoop" position={[-8, 0, 8]}>
      <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2} raycast={noRaycast}>
        <ringGeometry args={[3.05, 3.42, 32]} />
        <meshStandardMaterial color="#f4bf48" roughness={0.82} />
      </mesh>
      {[-2.25, 2.25].map((x) => (
        <mesh key={x} position={[x, 1.15, 0]} rotation-z={Math.PI / 2} raycast={noRaycast}>
          <torusGeometry args={[1.12, 0.14, 8, 20, Math.PI]} />
          <meshStandardMaterial color="#ffd66a" emissive="#b97725" emissiveIntensity={0.16} roughness={0.58} />
        </mesh>
      ))}
      <mesh position={[0, 0.95, 0]} raycast={noRaycast}>
        <cylinderGeometry args={[0.25, 0.38, 1.9, 6]} />
        <meshStandardMaterial color="#9a5c38" roughness={0.96} />
      </mesh>
      <mesh position={[0, 2.08, 0]} raycast={noRaycast}>
        <octahedronGeometry args={[0.48, 0]} />
        <meshStandardMaterial color="#fff09b" emissive="#e59a35" emissiveIntensity={0.45} roughness={0.35} />
      </mesh>
    </group>
  );
}

function WhispercapLandmark() {
  return (
    <group name="whispercap-giant-caps" position={[-12, 0, 2]} rotation-y={-0.28}>
      {[
        [-1.45, 1.75, -0.25, 1.35, "#ff6f9c"],
        [0.1, 2.25, 0.18, 1.72, "#c87be8"],
        [1.55, 1.52, -0.18, 1.15, "#ffae58"],
      ].map(([x, height, z, scale, color], index) => (
        <group key={index} position={[x as number, 0, z as number]} scale={scale as number}>
          <mesh position={[0, (height as number) / 2, 0]} raycast={noRaycast}>
            <cylinderGeometry args={[0.22, 0.34, height as number, 10]} />
            <meshStandardMaterial color="#faebc8" roughness={0.9} />
          </mesh>
          <mesh position={[0, height as number, 0]} scale={[1.2, 0.68, 1.2]} raycast={noRaycast}>
            <sphereGeometry args={[0.98, 14, 9, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={color as string} emissive={color as string} emissiveIntensity={0.12} roughness={0.7} />
          </mesh>
          <mesh position={[-0.22, (height as number) + 0.16, 0.79]} scale={[0.16, 0.09, 0.07]} raycast={noRaycast}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#fff0ca" roughness={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PrismLandmark() {
  return (
    <group name="prism-glen-cyan-spire" position={[13, 0, -4]} rotation-y={0.24}>
      <mesh position={[0, 0.16, 0]} scale={[2.45, 0.3, 1.7]} raycast={noRaycast}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#315c70" roughness={0.95} />
      </mesh>
      {[
        [-0.82, 1.18, 0.3, 0.56, "#71e8fa"],
        [0, 2.4, 0, 1.1, "#76d9ff"],
        [0.82, 1.36, -0.22, 0.64, "#b898ff"],
      ].map(([x, y, z, scale, color], index) => (
        <mesh key={index} position={[x as number, y as number, z as number]} scale={scale as number} rotation-z={(index - 1) * 0.14} raycast={noRaycast}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color as string} emissive={color as string} emissiveIntensity={0.44} roughness={0.18} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function SilverrunLandmark() {
  return (
    <group name="silverrun-blue-waterwheel" position={[-5, 0, -12]} rotation-y={Math.PI / 2}>
      <mesh position={[0, 0.88, 0]} raycast={noRaycast}>
        <torusGeometry args={[1.24, 0.13, 7, 18]} />
        <meshStandardMaterial color="#83d9ef" emissive="#3e9fc5" emissiveIntensity={0.26} roughness={0.3} metalness={0.15} />
      </mesh>
      {Array.from({ length: 8 }).map((_, index) => (
        <mesh key={index} position={[0, 0.88, 0]} rotation-z={(index * Math.PI) / 4} raycast={noRaycast}>
          <boxGeometry args={[0.13, 2.2, 0.18]} />
          <meshStandardMaterial color="#d5f5f5" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.88, 0]} raycast={noRaycast}>
        <cylinderGeometry args={[0.22, 0.22, 0.4, 10]} />
        <meshStandardMaterial color="#486a72" roughness={0.85} />
      </mesh>
      {[-1.48, 1.48].map((x) => <mesh key={x} position={[x, 0.65, 0]} raycast={noRaycast}><cylinderGeometry args={[0.13, 0.17, 1.3, 8]} /><meshStandardMaterial color="#496a55" roughness={1} /></mesh>)}
    </group>
  );
}

function MossbackLandmark() {
  return (
    <group name="mossback-arena-banner-gate" position={[0, 0, -24]}>
      {[-2.25, 2.25].map((x, index) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.9, 0]} raycast={noRaycast}><cylinderGeometry args={[0.16, 0.22, 3.8, 8]} /><meshStandardMaterial color="#71452d" roughness={1} /></mesh>
          <mesh position={[index ? -0.32 : 0.32, 2.52, 0.03]} raycast={noRaycast}><boxGeometry args={[0.72, 1.3, 0.11]} /><meshStandardMaterial color={index ? "#d85e48" : "#efbd45"} emissive={index ? "#8d342f" : "#9a6723"} emissiveIntensity={0.16} roughness={0.82} /></mesh>
        </group>
      ))}
      <mesh position={[0, 3.35, 0]} raycast={noRaycast}><boxGeometry args={[4.9, 0.32, 0.34]} /><meshStandardMaterial color="#805133" roughness={0.94} /></mesh>
      <mesh position={[0, 3.34, 0.2]} raycast={noRaycast}><octahedronGeometry args={[0.38, 0]} /><meshStandardMaterial color="#fff0a3" emissive="#e49b38" emissiveIntensity={0.42} roughness={0.35} /></mesh>
    </group>
  );
}

function FernwoodLandmark() {
  const crestEarned = useGameStore((state) => state.progression.meadowCrestEarned);
  const leaf = crestEarned ? "#458b59" : "#516c53";
  return (
    <group name="fernwood-green-gold-gate" position={[18, 0, 16]}>
      {[-2.4, 2.4].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 2.25, 0]} scale={[1, 1, 1.1]} raycast={noRaycast}><cylinderGeometry args={[0.48, 0.66, 4.5, 9]} /><meshStandardMaterial color="#4f382a" roughness={1} /></mesh>
          <mesh position={[0, 4.55, 0]} scale={[1.35, 0.9, 1.1]} raycast={noRaycast}><icosahedronGeometry args={[1.28, 1]} /><meshStandardMaterial color={leaf} roughness={0.92} /></mesh>
        </group>
      ))}
      <mesh position={[0, 4.0, 0]} raycast={noRaycast}><boxGeometry args={[5.2, 0.45, 0.48]} /><meshStandardMaterial color="#80613a" roughness={0.9} /></mesh>
      <mesh position={[0, 3.9, 0.28]} raycast={noRaycast}><boxGeometry args={[2.35, 0.86, 0.12]} /><meshStandardMaterial color={crestEarned ? "#e6c763" : "#84876c"} emissive={crestEarned ? "#a57b2e" : "#000000"} emissiveIntensity={crestEarned ? 0.22 : 0} roughness={0.78} /></mesh>
    </group>
  );
}

export function ZoneLandmarkPass() {
  return (
    <group name="zone-landmark-pass">
      <TrainingRingLandmark />
      <WhispercapLandmark />
      <PrismLandmark />
      <SilverrunLandmark />
      <MossbackLandmark />
      <FernwoodLandmark />
    </group>
  );
}
