"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const NATURE_ROOT = "/assets/world/nature/";

type NatureAsset =
  | "BirchTree_4.gltf"
  | "MapleTree_4.gltf"
  | "Bush.gltf"
  | "Bush_Flowers.gltf"
  | "Flower_5_Clump.gltf"
  | "Grass_Large_Extruded.gltf";

type NaturePlacement = {
  asset: NatureAsset;
  position: [number, number, number];
  rotation?: number;
  scale?: number;
};

function NatureModel({ asset, position, rotation = 0, scale = 1 }: NaturePlacement) {
  const gltf = useGLTF(`${NATURE_ROOT}${asset}`);
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = asset.includes("Tree");
      child.receiveShadow = true;
    });
    return clone;
  }, [asset, gltf.scene]);

  return <primitive object={scene} position={position} rotation-y={rotation} scale={scale} dispose={null} />;
}

function GroundDisc({ position, radius, color, scale = 1 }: { position: [number, number, number]; radius: number; color: string; scale?: number }) {
  return (
    <mesh position={position} rotation-x={-Math.PI / 2} scale={[scale, 1, 0.72]} receiveShadow raycast={() => {}}>
      <circleGeometry args={[radius, 28]} />
      <meshStandardMaterial color={color} roughness={1} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

function Stone({ position, scale = 1, color = "#78908b" }: { position: [number, number, number]; scale?: number; color?: string }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.48, 0]} />
      <meshStandardMaterial color={color} roughness={0.92} />
    </mesh>
  );
}

function SunpatchRanch() {
  const flowers: NaturePlacement[] = [
    { asset: "Bush_Flowers.gltf", position: [7.8, 0, 12.3], rotation: 0.4, scale: 1.05 },
    { asset: "Bush_Flowers.gltf", position: [1.3, 0, 15.4], rotation: 2.2, scale: 0.9 },
    { asset: "Flower_5_Clump.gltf", position: [10.5, 0, 8.8], rotation: 1.2, scale: 1.25 },
    { asset: "Grass_Large_Extruded.gltf", position: [-0.4, 0, 13.8], rotation: 2.5, scale: 1.15 },
  ];
  return <group name="sunpatch-ranch-biome">
    <GroundDisc position={[4.2, 0.012, 8.4]} radius={9.7} color="#719f56" scale={1.12} />
    <GroundDisc position={[4.2, 0.018, 8.4]} radius={5.4} color="#a8c66a" />
    {flowers.map((p, index) => <NatureModel key={index} {...p} />)}
    {[[10.8, 14.7], [8.9, 16], [-1.8, 11.8], [0.3, 4.3]].map(([x, z], index) => <Stone key={index} position={[x, 0.22, z]} scale={0.65 + index * 0.07} color="#bdad7a" />)}
    <group position={[10.7, 0, 11.6]} rotation-y={-0.55}>
      <mesh position={[0, 0.48, 0]} castShadow><boxGeometry args={[0.18, 0.96, 0.18]} /><meshStandardMaterial color="#75482c" roughness={1} /></mesh>
      <mesh position={[0.54, 0.48, 0]} castShadow><boxGeometry args={[0.18, 0.96, 0.18]} /><meshStandardMaterial color="#75482c" roughness={1} /></mesh>
      <mesh position={[0.27, 0.7, 0]} castShadow><boxGeometry args={[0.7, 0.1, 0.12]} /><meshStandardMaterial color="#b67a42" roughness={1} /></mesh>
    </group>
  </group>;
}

function WhispercapGrove() {
  const trees: NaturePlacement[] = [
    { asset: "BirchTree_4.gltf", position: [-16.8, 0, 5.3], rotation: 0.2, scale: 1.42 },
    { asset: "BirchTree_4.gltf", position: [-15.2, 0, -1.5], rotation: 2.6, scale: 1.25 },
    { asset: "MapleTree_4.gltf", position: [-10.3, 0, -3.2], rotation: -0.6, scale: 1.34 },
    { asset: "Bush.gltf", position: [-8.8, 0, 3.7], rotation: 1.4, scale: 1.2 },
    { asset: "Bush_Flowers.gltf", position: [-14.4, 0, 7], rotation: 0.7, scale: 1.08 },
  ];
  return <group name="whispercap-grove-biome">
    <GroundDisc position={[-12, 0.014, 2]} radius={7.1} color="#567b54" scale={1.08} />
    <GroundDisc position={[-12, 0.021, 2]} radius={3.5} color="#6e9461" />
    {trees.map((p, index) => <NatureModel key={index} {...p} />)}
    {[-2.3, -1.1, 0.4, 1.7, 2.8].map((x, index) => (
      <group key={x} position={[-12 + x, 0, 4.6 + (index % 2) * 0.45]} scale={0.72 + (index % 3) * 0.12}>
        <mesh position={[0, 0.26, 0]} castShadow><cylinderGeometry args={[0.1, 0.13, 0.52, 7]} /><meshStandardMaterial color="#e7d5bf" roughness={1} /></mesh>
        <mesh position={[0, 0.58, 0]} castShadow><sphereGeometry args={[0.35, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={index % 2 ? "#a979d2" : "#e889ac"} emissive={index % 2 ? "#71449d" : "#a9416e"} emissiveIntensity={0.26} /></mesh>
      </group>
    ))}
    <pointLight position={[-12, 2.1, 3.8]} color="#c994ed" intensity={0.45} distance={7} />
  </group>;
}

function PrismGlen() {
  return <group name="prism-glen-biome">
    <GroundDisc position={[13, 0.014, -4]} radius={7.2} color="#5c8a82" scale={1.1} />
    <GroundDisc position={[13, 0.022, -4]} radius={4.35} color="#78aaa1" />
    {Array.from({ length: 9 }).map((_, index) => {
      const angle = index / 9 * Math.PI * 2 + 0.18;
      const r = 3.7 + (index % 2) * 0.55;
      return <group key={index} position={[13 + Math.cos(angle) * r, 0, -4 + Math.sin(angle) * r]} rotation-y={angle} scale={0.75 + (index % 3) * 0.14}>
        <mesh position={[0, 0.65, 0]} rotation-z={index % 2 ? 0.18 : -0.16} castShadow><octahedronGeometry args={[0.48, 0]} /><meshStandardMaterial color={["#7ce4eb", "#b39eff", "#f29fc2"][index % 3]} emissive={["#42bbc7", "#8063d5", "#c95c91"][index % 3]} emissiveIntensity={0.38} roughness={0.22} metalness={0.18} /></mesh>
        <mesh position={[0, 0.12, 0]} receiveShadow><circleGeometry args={[0.55, 10]} /><meshStandardMaterial color="#456f6e" roughness={1} /></mesh>
      </group>;
    })}
    <NatureModel asset="Grass_Large_Extruded.gltf" position={[17.5, 0, -7.2]} rotation={1.9} scale={1.1} />
    <NatureModel asset="Bush.gltf" position={[8.6, 0, -7.8]} rotation={0.3} scale={1.05} />
    <pointLight position={[13, 2.8, -4]} color="#82ddff" intensity={0.5} distance={8} />
  </group>;
}

function SilverrunStream() {
  const stones = Array.from({ length: 12 }, (_, index) => ({ x: -15 + index * 1.85, z: -12.1 + Math.sin(index * 1.65) * 1.05 }));
  return <group name="silverrun-stream-biome">
    <mesh position={[-5, 0.018, -12]} rotation-x={-Math.PI / 2} receiveShadow raycast={() => {}}>
      <planeGeometry args={[26, 5.2, 1, 1]} />
      <meshStandardMaterial color="#4caeca" emissive="#247b9c" emissiveIntensity={0.18} roughness={0.22} metalness={0.12} />
    </mesh>
    {stones.map((stone, index) => <Stone key={index} position={[stone.x, 0.17, stone.z]} scale={0.72 + (index % 3) * 0.12} color={index % 2 ? "#aac3c0" : "#d7c995"} />)}
    {[-15.5, -11.8, -7.2, -1.7, 3.2].map((x, index) => <NatureModel key={x} asset={index % 2 ? "Grass_Large_Extruded.gltf" : "Bush_Flowers.gltf"} position={[x, 0, -15.25 + (index % 2) * 0.22]} rotation={index} scale={0.9 + (index % 2) * 0.2} />)}
    {[-13.3, -8.8, -4.5, .4].map((x, index) => <NatureModel key={x} asset="Grass_Large_Extruded.gltf" position={[x, 0, -8.9]} rotation={index * 0.7} scale={1.05} />)}
  </group>;
}

function FernwoodWilds() {
  const trees: NaturePlacement[] = [
    { asset: "MapleTree_4.gltf", position: [13.5, 0, 20.3], rotation: 1.1, scale: 1.7 },
    { asset: "MapleTree_4.gltf", position: [19.4, 0, 23.1], rotation: -0.4, scale: 1.85 },
    { asset: "BirchTree_4.gltf", position: [24.6, 0, 19.5], rotation: 2.5, scale: 1.55 },
    { asset: "BirchTree_4.gltf", position: [23.4, 0, 12.8], rotation: 0.25, scale: 1.4 },
    { asset: "Bush.gltf", position: [14.2, 0, 13.1], rotation: 2.2, scale: 1.3 },
    { asset: "Bush_Flowers.gltf", position: [20.3, 0, 10.7], rotation: 0.6, scale: 1.12 },
  ];
  return <group name="fernwood-wilds-biome">
    <GroundDisc position={[18, 0.014, 16]} radius={10.8} color="#315f48" scale={1.12} />
    <GroundDisc position={[18, 0.022, 16]} radius={5.3} color="#467b54" scale={1.1} />
    {trees.map((p, index) => <NatureModel key={index} {...p} />)}
    {Array.from({ length: 8 }).map((_, index) => {
      const a = index * 0.82;
      return <group key={index} position={[18 + Math.cos(a) * 6.2, 0, 16 + Math.sin(a) * 5.1]} rotation-y={a}>
        <mesh position={[0, 0.72, 0]} castShadow><cylinderGeometry args={[0.1, 0.16, 1.44, 7]} /><meshStandardMaterial color="#5a412d" roughness={1} /></mesh>
        <mesh position={[0.06, 1.55, 0]} castShadow><coneGeometry args={[0.62, 1.3, 8]} /><meshStandardMaterial color={index % 2 ? "#386849" : "#4f8251"} roughness={1} /></mesh>
      </group>;
    })}
    <group position={[18, 0, 16]}>
      <mesh position={[0, 1.6, 0]} castShadow><cylinderGeometry args={[0.42, 0.58, 3.2, 7]} /><meshStandardMaterial color="#756047" roughness={1} /></mesh>
      <mesh position={[0, 3.6, 0]} rotation-y={0.32} castShadow><dodecahedronGeometry args={[1.18, 0]} /><meshStandardMaterial color="#6ba77a" emissive="#3d6e54" emissiveIntensity={0.2} roughness={0.78} /></mesh>
      <pointLight position={[0, 3.4, 0]} color="#9dffc1" intensity={0.34} distance={7} />
    </group>
  </group>;
}

/** Static, low-count biome silhouettes. Parent scene mounts this below terrain and props. */
export function WorldBiomePass() {
  return <group name="world-biome-pass">
    <SunpatchRanch />
    <WhispercapGrove />
    <PrismGlen />
    <SilverrunStream />
    <FernwoodWilds />
  </group>;
}

useGLTF.preload(`${NATURE_ROOT}BirchTree_4.gltf`);
useGLTF.preload(`${NATURE_ROOT}MapleTree_4.gltf`);
useGLTF.preload(`${NATURE_ROOT}Bush.gltf`);
useGLTF.preload(`${NATURE_ROOT}Bush_Flowers.gltf`);
useGLTF.preload(`${NATURE_ROOT}Flower_5_Clump.gltf`);
useGLTF.preload(`${NATURE_ROOT}Grass_Large_Extruded.gltf`);
