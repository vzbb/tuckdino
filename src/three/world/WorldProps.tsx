"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AssetBoundary } from "@/src/three/components/AssetBoundary";
import { useGameStore } from "@/src/state/useGameStore";

const TENT_GLB = "/assets/quaternius/Tent.glb";
const BONFIRE_GLB = "/assets/quaternius/Bonfire.glb";
const HOME_FIRE = { x: 4.2, z: 8.4 };

type ScatterPoint = {
  x: number;
  z: number;
  scale: number;
  rotation: number;
};

function makeScatter(count: number, radius: number, minRadius = 0): ScatterPoint[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = minRadius + Math.random() * (radius - minRadius);
    return {
      x: Math.cos(angle) * distance,
      z: Math.sin(angle) * distance,
      scale: 0.8 + Math.random() * 0.6,
      rotation: Math.random() * Math.PI * 2,
    };
  });
}

function FallbackTent() {
  return (
    <group>
      <mesh position={[0, 0.72, 0]} castShadow>
        <coneGeometry args={[1.3, 1.55, 4]} />
        <meshStandardMaterial color={"#e8c98f"} roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.15, 1.15, 0.16, 20]} />
        <meshStandardMaterial color={"#6e8d52"} roughness={1} />
      </mesh>
    </group>
  );
}

function FallbackBonfire() {
  return (
    <group>
      {Array.from({ length: 5 }).map((_, index) => (
        <mesh
          key={index}
          position={[Math.cos((index / 5) * Math.PI * 2) * 0.24, 0.18, Math.sin((index / 5) * Math.PI * 2) * 0.24]}
          rotation-z={0.25}
          rotation-y={(index / 5) * Math.PI * 2}
          castShadow
        >
          <cylinderGeometry args={[0.06, 0.08, 0.6, 8]} />
          <meshStandardMaterial color={"#7a5134"} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.44, 0]} castShadow>
        <coneGeometry args={[0.22, 0.6, 8]} />
        <meshStandardMaterial color={"#ffc56e"} emissive={"#ff7a36"} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function TentModel() {
  const gltf = useGLTF(TENT_GLB);
  return <primitive object={gltf.scene} />;
}

function BonfireModel() {
  const gltf = useGLTF(BONFIRE_GLB);
  return <primitive object={gltf.scene} />;
}

function Tree({ x, z, scale, rotation }: ScatterPoint) {
  return (
    <group position={[x, 0, z]} scale={scale * 1.75} rotation-y={rotation}>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.6, 0.14, 18]} />
        <meshStandardMaterial color={"#3f5f39"} roughness={1} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 1.9, 10]} />
        <meshStandardMaterial color={"#6e4b30"} roughness={0.96} />
      </mesh>
      <mesh position={[0, 1.95, 0]} castShadow>
        <coneGeometry args={[0.95, 1.4, 9]} />
        <meshStandardMaterial color={"#447d4b"} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.6, 0.05]} castShadow>
        <coneGeometry args={[0.72, 1.08, 9]} />
        <meshStandardMaterial color={"#63a861"} roughness={0.88} />
      </mesh>
      <mesh position={[0.12, 2.08, 0.28]} castShadow>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color={"#8dd675"} emissive={"#7bcf68"} emissiveIntensity={0.2} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Campfire() {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.1 + Math.sin(state.clock.elapsedTime * 8) * 0.12 + Math.random() * 0.18;
    }
    if (flameRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.04;
      flameRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[HOME_FIRE.x, 0, HOME_FIRE.z]}>
      <group ref={flameRef} scale={0.8} position={[0, 0.06, 0]}>
        <AssetBoundary fallback={<FallbackBonfire />}>
          <Suspense fallback={<FallbackBonfire />}>
            <BonfireModel />
          </Suspense>
        </AssetBoundary>
      </group>
      <pointLight ref={lightRef} position={[0, 1.5, 0]} intensity={1.15} distance={18} decay={2} color={"#ffb36e"} />
    </group>
  );
}

function Butterflies() {
  const count = 5;
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const initialPositions = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        x: (Math.random() - 0.5) * 20,
        y: 1 + Math.random() * 2,
        z: (Math.random() - 0.5) * 20,
        offset: Math.random() * 100,
      })),
    [count]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const pos = initialPositions[i];

      mesh.position.x = pos.x + Math.sin(t * 0.5 + pos.offset) * 3;
      mesh.position.y = pos.y + Math.sin(t * 2 + pos.offset) * 0.5;
      mesh.position.z = pos.z + Math.cos(t * 0.4 + pos.offset) * 3;

      const wing = mesh.children[0] as THREE.Mesh | undefined;
      if (wing) {
        wing.rotation.z = Math.sin(t * 15) * 0.8;
      }
      const wing2 = mesh.children[1] as THREE.Mesh | undefined;
      if (wing2) {
        wing2.rotation.z = -Math.sin(t * 15) * 0.8;
      }

      mesh.rotation.y = t * 0.5 + pos.offset;
    });
  });

  return (
    <group>
      {initialPositions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) meshRefs.current[i] = el;
          }}
          position={[pos.x, pos.y, pos.z]}
        >
          <mesh rotation-y={Math.PI / 2}>
            <planeGeometry args={[0.15, 0.15]} />
            <meshStandardMaterial color={"#ff9ebb"} side={THREE.DoubleSide} emissive={"#ff9ebb"} emissiveIntensity={0.5} />
          </mesh>
          <mesh rotation-y={-Math.PI / 2}>
            <planeGeometry args={[0.15, 0.15]} />
            <meshStandardMaterial color={"#ff9ebb"} side={THREE.DoubleSide} emissive={"#ff9ebb"} emissiveIntensity={0.5} />
          </mesh>
        </mesh>
      ))}
    </group>
  );
}

function PlayZones() {
  const pushEvent = useGameStore((s) => s.pushEvent);
  const setMoveTarget = useGameStore((s) => s.setMoveTarget);
  const [active, setActive] = useState("welcome");
  const crystal = useRef<THREE.Group>(null);
  const mushrooms = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (crystal.current) crystal.current.rotation.y = t * 0.35;
    if (mushrooms.current) mushrooms.current.position.y = Math.sin(t * 3) * 0.05;
  });

  const discover = (id: string, x: number, z: number) => {
    setActive(id);
    setMoveTarget({ x, y: 0, z });
    pushEvent({ t: Date.now(), type: "collectible_found", id });
  };

  return (
    <group>
      <group position={[-12, 0, 2]} onPointerDown={(e) => { e.stopPropagation(); discover("singing_mushrooms", -12, 2); }} ref={mushrooms}>
        {[-1.1, 0, 1.05].map((x, i) => (
          <group key={x} position={[x, 0, (i % 2) * .45]} scale={.85 + i * .18}>
            <mesh position={[0, .35, 0]} castShadow><cylinderGeometry args={[.13,.2,.7,10]} /><meshStandardMaterial color="#f7e7c6" /></mesh>
            <mesh position={[0,.78,0]} castShadow><sphereGeometry args={[.48,18,10,0,Math.PI*2,0,Math.PI/2]} /><meshStandardMaterial color={i === 0 ? "#ff718f" : i === 1 ? "#a978ff" : "#ffb64c"} emissive={active === "singing_mushrooms" ? "#ff9bc4" : "#321630"} emissiveIntensity={active === "singing_mushrooms" ? .8 : .12} /></mesh>
          </group>
        ))}
        <pointLight position={[0,1.2,0]} color="#ff83d2" intensity={active === "singing_mushrooms" ? 2 : .35} distance={8} />
      </group>

      <group position={[13, 0, -4]} onPointerDown={(e) => { e.stopPropagation(); discover("rainbow_crystal", 13, -4); }} ref={crystal}>
        {[0,1,2,3,4].map((i) => (
          <mesh key={i} position={[(i-2)*.35, .55 + (i%2)*.25, (i%2)*.28]} rotation-z={(i-2)*.12} castShadow>
            <octahedronGeometry args={[.42 + (i%2)*.18,0]} />
            <meshStandardMaterial color={["#69e7ff","#b98cff","#ff86bf","#8cf7b1","#ffe36f"][i]} emissive={["#4edcff","#9d67ff","#ff5eac","#57e58c","#ffd83f"][i]} emissiveIntensity={active === "rainbow_crystal" ? 1.2 : .35} roughness={.2} metalness={.15} />
          </mesh>
        ))}
        <pointLight position={[0,1,0]} color="#aeefff" intensity={active === "rainbow_crystal" ? 2.4 : .6} distance={10} />
      </group>

      <group position={[-5, 0, -17]} onPointerDown={(e) => { e.stopPropagation(); discover("splashy_stepping_stones", -5, -12); }}>
        {Array.from({length: 7}).map((_,i) => (
          <mesh key={i} position={[i*1.55, .16 + (active === "splashy_stepping_stones" ? Math.sin(i)*.05 : 0), (i%2)*1.2]} scale={[1.2,.28,.85]} castShadow>
            <sphereGeometry args={[.65,14,8]} /><meshStandardMaterial color={i%2 ? "#b9ddd1" : "#f5d9a6"} roughness={.8} />
          </mesh>
        ))}
      </group>

      <group position={[4,0,9]} onPointerDown={(e) => { e.stopPropagation(); discover("berry_picnic", 4, 9); }}>
        <mesh position={[0,.05,0]} rotation-x={-Math.PI/2} receiveShadow><circleGeometry args={[2.2,32]} /><meshStandardMaterial color="#ffd46e" /></mesh>
        {[[-1,.5],[.2,-.6],[1,.55]].map(([x,z],i) => <mesh key={i} position={[x,.24,z]} castShadow><sphereGeometry args={[.24,12,10]} /><meshStandardMaterial color={i===1?"#6843b7":"#e64f71"} emissive="#a52f55" emissiveIntensity={.2} /></mesh>)}
      </group>
    </group>
  );
}

function MeadowStructure() {
  const path = [
    { x: 0, z: 7, r: -.08 }, { x: -.5, z: 4.5, r: .12 }, { x: .2, z: 2, r: -.16 },
    { x: 1.2, z: -.5, r: -.28 }, { x: 1.4, z: -3.2, r: .08 }, { x: .6, z: -6, r: .2 },
    { x: -.6, z: -8.6, r: .32 },
  ];
  return (
    <group>
      {path.map((p, i) => (
        <mesh key={i} position={[p.x, .018, p.z]} rotation={[-Math.PI/2, 0, p.r]} scale={[1.25, 2.15, 1]} raycast={() => {}}>
          <circleGeometry args={[1, 24]} />
          <meshStandardMaterial color={i % 2 ? "#d7b875" : "#e2c682"} roughness={1} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}
      {[[-8,5,4.5],[8,4,5.5],[-9,-6,3.8],[9,-8,4.2]].map(([x,z,s],i) => (
        <mesh key={`patch-${i}`} position={[x,.012,z]} rotation-x={-Math.PI/2} scale={[s,s*.72,1]} raycast={() => {}}>
          <circleGeometry args={[1,24]} />
          <meshStandardMaterial color={i%2 ? "#79b966" : "#4f914f"} roughness={1} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
      ))}
    </group>
  );
}

function HomeRanch() {
  const fence = [
    [-7, 11], [-5.2, 11.7], [-3.4, 12.2], [3.2, 12.2], [5.2, 11.5], [7, 10.5],
  ];
  return (
    <group>
      {fence.map(([x,z],i) => (
        <group key={i} position={[x,0,z]} rotation-y={(i-2)*.08}>
          <mesh position={[0,.45,0]} castShadow><cylinderGeometry args={[.09,.12,.9,7]} /><meshStandardMaterial color="#8b5b34" roughness={1} /></mesh>
          {i < fence.length-1 && <mesh position={[.9,.52,0]} rotation-z={Math.PI/2} castShadow><cylinderGeometry args={[.055,.07,1.8,7]} /><meshStandardMaterial color="#a76d3e" roughness={1} /></mesh>}
        </group>
      ))}
      <group position={[-2.2,0,8.8]}>
        <mesh position={[0,.34,0]} castShadow><boxGeometry args={[1.8,.35,.65]} /><meshStandardMaterial color="#a96e3d" roughness={1} /></mesh>
        <mesh position={[0,.55,0]} castShadow><boxGeometry args={[1.55,.18,.48]} /><meshStandardMaterial color="#76a95a" roughness={1} /></mesh>
      </group>
      <group position={[0,0,12.4]}>
        <mesh position={[0,.8,0]} castShadow><cylinderGeometry args={[.11,.14,1.6,8]} /><meshStandardMaterial color="#70482d" /></mesh>
        <mesh position={[0,1.35,0]} castShadow><boxGeometry args={[2.4,.72,.18]} /><meshStandardMaterial color="#e6c178" roughness={.9} /></mesh>
      </group>
    </group>
  );
}

function TrainingAndBattleGround() {
  const mode = useGameStore((s) => s.adventure.mode);
  const pulse = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (pulse.current) pulse.current.rotation.y = Math.sin(state.clock.elapsedTime * .8) * .08;
  });
  return <group>
    <group position={[-8,0,8]}>
      <mesh position={[0,.035,0]} rotation-x={-Math.PI/2} receiveShadow><ringGeometry args={[2.5,3.05,40]} /><meshStandardMaterial color="#e7c268" roughness={1} /></mesh>
      {Array.from({length:8}).map((_,i)=><mesh key={i} position={[Math.cos(i*Math.PI/4)*2.8,.12,Math.sin(i*Math.PI/4)*2.8]} rotation={[0,i*Math.PI/4,Math.PI/2]} castShadow><cylinderGeometry args={[.13,.17,1.1,8]} /><meshStandardMaterial color="#9a6137" /></mesh>)}
      <group ref={pulse}>
        <mesh position={[-.9,.26,0]} rotation-z={Math.PI/2} castShadow><cylinderGeometry args={[.25,.3,1.7,10]} /><meshStandardMaterial color="#8a5635" /></mesh>
        {[[-1.2,.35],[-.55,-.65],[.55,-.8]].map(([x,z],i)=><mesh key={i} position={[x,.15,z]} castShadow><coneGeometry args={[.22,.55,8]} /><meshStandardMaterial color={i===0?"#ffc952":"#f58d4e"} /></mesh>)}
      </group>
      <pointLight position={[0,1,0]} color="#ffd276" intensity={mode==="training"?1.5:.35} distance={8}/>
    </group>
    <group position={[0,0,-25]}>
      <mesh position={[0,.025,0]} rotation-x={-Math.PI/2}><circleGeometry args={[6,48]} /><meshStandardMaterial color={mode==="battle"||mode==="victory"?"#91b45c":"#6fa556"} /></mesh>
      {[-5.8,5.8].map((x)=><group key={x} position={[x,0,0]}><mesh position={[0,1.2,0]}><cylinderGeometry args={[.18,.25,2.4,8]}/><meshStandardMaterial color="#765035"/></mesh><mesh position={[0,2.15,0]}><sphereGeometry args={[.5,12,10]}/><meshStandardMaterial color="#ffd35e" emissive="#ff9d39" emissiveIntensity={mode==="battle"?1:.2}/></mesh></group>)}
    </group>
  </group>;
}

export function WorldProps() {
  const treePoints = useMemo(() => makeScatter(48, 42, 15), []);
  const hillPoints = useMemo(() => makeScatter(8, 40, 24), []);
  const flowerPoints = useMemo(() => makeScatter(120, 11), []);
  const pebblePoints = useMemo(() => makeScatter(24, 8, 2), []);
  const lanternPoints = useMemo(() => makeScatter(9, 7, 3), []);

  return (
    <group>
      <Butterflies />
      <PlayZones />
      <MeadowStructure />
      <HomeRanch />
      <TrainingAndBattleGround />

      <group position={[-5.2, 0, 9.8]} rotation-y={0.45} scale={0.32}>
        <AssetBoundary fallback={<FallbackTent />}>
          <Suspense fallback={<FallbackTent />}>
            <TentModel />
          </Suspense>
        </AssetBoundary>
      </group>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -15]} receiveShadow>
        <planeGeometry args={[60, 10]} />
        <meshStandardMaterial color={"#54bde0"} emissive={"#248eb7"} emissiveIntensity={0.2} roughness={0.15} metalness={0.05} />
      </mesh>

      {Array.from({ length: 18 }).map((_, i) => (
        <mesh
          key={`stream-stone-${i}`}
          position={[-28 + i * 3.1, 0.09, -11.4 - (i % 3) * 1.9]}
          castShadow
          receiveShadow
          rotation-y={i * 0.4}
        >
          <dodecahedronGeometry args={[0.45 + (i % 4) * 0.08, 0]} />
          <meshStandardMaterial color={"#93a3a6"} roughness={1} />
        </mesh>
      ))}

      {flowerPoints.map((point, i) => (
        <group key={`flower-${i}`} position={[-2 + point.x, 0.02, 10 + point.z]} rotation-y={point.rotation} scale={point.scale}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.18, 6]} />
            <meshStandardMaterial color={"#4e8c4f"} roughness={1} />
          </mesh>
          <mesh position={[0, 0.14, 0]} castShadow>
            <coneGeometry args={[0.07, 0.12, 6]} />
            <meshStandardMaterial color={i % 3 === 0 ? "#ffd1e8" : i % 3 === 1 ? "#b6f0ff" : "#fff2b3"} roughness={0.82} />
          </mesh>
        </group>
      ))}

      {treePoints.map((point, i) => (
        <Tree key={`tree-${i}`} {...point} />
      ))}

      <Campfire />

      {pebblePoints.map((point, i) => (
        <mesh
          key={`camp-pebble-${i}`}
          position={[HOME_FIRE.x + point.x * 0.35, 0.06, HOME_FIRE.z + point.z * 0.35]}
          rotation-y={point.rotation}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[0.12 + (i % 3) * 0.05, 0]} />
          <meshStandardMaterial color={"#8a897f"} roughness={1} />
        </mesh>
      ))}

      {lanternPoints.map((point, i) => (
        <group key={`lantern-${i}`} position={[HOME_FIRE.x + point.x * 0.5, 0, HOME_FIRE.z + point.z * 0.5]} rotation-y={point.rotation} scale={0.55 + (i % 3) * 0.12}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.64, 6]} />
            <meshStandardMaterial color={"#6f5336"} roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.74, 0]} castShadow>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color={"#ffe0a1"} emissive={"#ffca70"} emissiveIntensity={0.8} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {hillPoints.map((point, i) => (
        <mesh key={`hill-${i}`} position={[point.x, 0.35, point.z]} castShadow receiveShadow scale={point.scale} rotation-y={point.rotation}>
          <dodecahedronGeometry args={[2.8, 0]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#3e7244" : "#447f4a"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

useGLTF.preload(TENT_GLB);
useGLTF.preload(BONFIRE_GLB);
