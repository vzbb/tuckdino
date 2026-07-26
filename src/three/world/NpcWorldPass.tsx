"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "@/src/state/useGameStore";

type Npc = {
  id: string;
  name: string;
  position: [number, number, number];
  facing: number;
  body: string;
  accent: string;
  skin: string;
  silhouette: "cap" | "hat" | "pack" | "crystal" | "scout" | "marshal" | "warden";
  firstLine: string;
  changedLine: string;
};

const NPCS: Npc[] = [
  { id: "pip", name: "Pip", position: [-5.4, 0, 8], facing: -Math.PI / 2, body: "#e8a84a", accent: "#fff0a8", skin: "#9b6047", silhouette: "cap", firstLine: "Three focused sessions make a Meadow-ready team.", changedLine: "Mossback Gate is south. Your three stars opened it." },
  { id: "marlow", name: "Marlow", position: [4.2, 0, 10.8], facing: Math.PI, body: "#758f54", accent: "#df7e45", skin: "#774d3b", silhouette: "pack", firstLine: "Campfire means rest, care, and a safe return.", changedLine: "That Meadow Crest deserves a warm fire celebration." },
  { id: "suri", name: "Suri", position: [1.2, 0, 5.6], facing: Math.PI, body: "#5d9cc2", accent: "#f6d36f", skin: "#8a5845", silhouette: "hat", firstLine: "Map places, then follow a trail guide.", changedLine: "Fresh trails wait beyond every discovered landmark." },
  { id: "nib", name: "Nib", position: [-10.2, 0, 3.8], facing: -Math.PI / 2, body: "#a776b7", accent: "#ff9ecb", skin: "#705142", silhouette: "cap", firstLine: "Caps sing loudest after rain.", changedLine: "Boar patrol stays west. These caps mark safe way home." },
  { id: "iona", name: "Iona", position: [10.2, 0, -2.2], facing: Math.PI / 2, body: "#52aeb7", accent: "#83f0ee", skin: "#865a48", silhouette: "crystal", firstLine: "Find humming color, then watch sky.", changedLine: "Gloomwing circles beyond Prism once training is done." },
  { id: "toma", name: "Toma", position: [-2.4, 0, -9.8], facing: -Math.PI / 2, body: "#5b8fbd", accent: "#d6f0ff", skin: "#85543f", silhouette: "scout", firstLine: "Stones return west; road returns home.", changedLine: "Boar patrol stays south-west, away from crossing stones." },
  { id: "moss", name: "Moss", position: [0, 0, -19.2], facing: 0, body: "#b84f46", accent: "#f2bf54", skin: "#694637", silhouette: "marshal", firstLine: "Three stars earns a friendly crest match.", changedLine: "Fine crest work. Ranch fire is ready for your return." },
  { id: "alder", name: "Alder", position: [15.4, 0, 14.4], facing: Math.PI / 2, body: "#4d8a61", accent: "#e2c15d", skin: "#76513d", silhouette: "warden", firstLine: "A Meadow Crest opens old trails.", changedLine: "Take north fork, then east. Rootshell waits in clearing." },
];

const noRaycast = () => undefined;

function NpcActor({ npc, index }: { npc: Npc; index: number }) {
  const group = useRef<THREE.Group>(null);
  const playerPos = useGameStore((s) => s.playerPos);
  const stars = useGameStore((s) => s.adventure.trainingStars);
  const crest = useGameStore((s) => s.progression.meadowCrestEarned);
  const alderOpen = npc.id === "alder" && crest;
  const position: [number, number, number] = alderOpen ? [20.2, 0, 17.4] : npc.position;
  const changed = npc.id === "pip" ? stars >= 3 : npc.id === "iona" || npc.id === "moss" ? stars >= 3 : npc.id === "alder" || npc.id === "marlow" ? crest : false;
  const near = Math.hypot(playerPos.x - position[0], playerPos.z - position[2]) < 7;

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime + index * 1.73;
    group.current.position.y = Math.sin(t * 1.45) * 0.025;
    group.current.rotation.z = Math.sin(t * 0.72) * 0.018;
  });

  return (
    <group position={position} rotation-y={alderOpen ? 0.72 : npc.facing}>
      <group ref={group}>
        <mesh raycast={noRaycast} position={[0, 0.72, 0]} castShadow>
          <capsuleGeometry args={[0.31, 0.62, 5, 8]} />
          <meshStandardMaterial color={npc.body} roughness={0.9} />
        </mesh>
        <mesh raycast={noRaycast} position={[0, 1.38, 0.02]} castShadow>
          <sphereGeometry args={[0.31, 12, 10]} />
          <meshStandardMaterial color={npc.skin} roughness={0.9} />
        </mesh>
        <mesh raycast={noRaycast} position={[-0.16, 0.84, 0.04]} rotation-z={0.38} castShadow><capsuleGeometry args={[0.075, 0.38, 4, 6]} /><meshStandardMaterial color={npc.skin} roughness={0.9} /></mesh>
        <mesh raycast={noRaycast} position={[0.16, 0.84, 0.04]} rotation-z={-0.38} castShadow><capsuleGeometry args={[0.075, 0.38, 4, 6]} /><meshStandardMaterial color={npc.skin} roughness={0.9} /></mesh>
        <mesh raycast={noRaycast} position={[-0.14, 0.16, 0]} castShadow><capsuleGeometry args={[0.1, 0.25, 4, 6]} /><meshStandardMaterial color="#4a413e" roughness={1} /></mesh>
        <mesh raycast={noRaycast} position={[0.14, 0.16, 0]} castShadow><capsuleGeometry args={[0.1, 0.25, 4, 6]} /><meshStandardMaterial color="#4a413e" roughness={1} /></mesh>
        {(npc.silhouette === "cap" || npc.silhouette === "marshal") && <mesh raycast={noRaycast} position={[0, 1.67, 0]} castShadow><coneGeometry args={[0.4, npc.silhouette === "marshal" ? 0.36 : 0.24, 8]} /><meshStandardMaterial color={npc.accent} roughness={0.82} /></mesh>}
        {(npc.silhouette === "hat" || npc.silhouette === "scout") && <group><mesh raycast={noRaycast} position={[0, 1.67, 0]} castShadow><cylinderGeometry args={[0.25, 0.34, 0.22, 8]} /><meshStandardMaterial color={npc.accent} roughness={0.85} /></mesh><mesh raycast={noRaycast} position={[0, 1.56, 0.12]} castShadow><boxGeometry args={[0.7, 0.06, 0.36]} /><meshStandardMaterial color={npc.accent} roughness={0.85} /></mesh></group>}
        {npc.silhouette === "pack" && <mesh raycast={noRaycast} position={[0, 0.82, -0.26]} castShadow><boxGeometry args={[0.46, 0.57, 0.18]} /><meshStandardMaterial color={npc.accent} roughness={0.9} /></mesh>}
        {npc.silhouette === "crystal" && <mesh raycast={noRaycast} position={[0, 1.76, 0]} rotation-y={0.4} castShadow><octahedronGeometry args={[0.28, 0]} /><meshStandardMaterial color={npc.accent} emissive={npc.accent} emissiveIntensity={0.38} roughness={0.35} /></mesh>}
        {npc.silhouette === "warden" && <mesh raycast={noRaycast} position={[0, 1.7, -0.03]} castShadow><coneGeometry args={[0.34, 0.58, 7]} /><meshStandardMaterial color={npc.accent} roughness={0.84} /></mesh>}
        <mesh raycast={noRaycast} position={[0, 0.025, 0]} rotation-x={-Math.PI / 2}><ringGeometry args={[0.44, 0.49, 16]} /><meshBasicMaterial color={npc.accent} transparent opacity={0.42} /></mesh>
        {near && <Html center position={[0, 2.28, 0]} distanceFactor={11} style={{ pointerEvents: "none" }}><div style={{ maxWidth: 176, padding: "5px 8px", border: `1px solid ${npc.accent}`, borderRadius: 10, color: "#fff9df", background: "rgba(20, 48, 39, .86)", boxShadow: "0 4px 14px rgba(0,0,0,.28)", fontFamily: "system-ui, sans-serif", fontSize: 11, fontWeight: 700, lineHeight: 1.25, textAlign: "center" }}><strong style={{ color: npc.accent, display: "block", fontSize: 12 }}>{npc.name}</strong>{changed ? npc.changedLine : npc.firstLine}</div></Html>}
      </group>
    </group>
  );
}

/** Visible-only NPC anchors. All meshes opt out of raycasting so world clicks pass through. */
export function NpcWorldPass() {
  return <group name="npc-world-pass">{NPCS.map((npc, index) => <NpcActor key={npc.id} npc={npc} index={index} />)}</group>;
}
