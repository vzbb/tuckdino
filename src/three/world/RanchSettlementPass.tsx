"use client";

type Spot = readonly [number, number, number?];

const WOOD = "#70462d";
const TIMBER = "#a96d3d";
const CANVAS = "#e7bf73";

function Post({ position, height = 1.35 }: { position: Spot; height?: number }) {
  return <mesh position={[position[0], height / 2, position[1]]} castShadow><cylinderGeometry args={[0.09, 0.13, height, 7]} /><meshStandardMaterial color={WOOD} roughness={1} /></mesh>;
}

function FenceRun({ start, end }: { start: Spot; end: Spot }) {
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dx, dz);
  return <group>
    <Post position={start} />
    <Post position={end} />
    {[0.46, 0.87].map((y) => <mesh key={y} position={[(start[0] + end[0]) / 2, y, (start[1] + end[1]) / 2]} rotation={[0, angle, Math.PI / 2]} castShadow><cylinderGeometry args={[0.045, 0.065, length, 7]} /><meshStandardMaterial color={TIMBER} roughness={1} /></mesh>)}
  </group>;
}

function Building({ position, width, depth, height, wall, roof }: { position: Spot; width: number; depth: number; height: number; wall: string; roof: string }) {
  return <group position={[position[0], 0, position[1]]} rotation-y={position[2] ?? 0}>
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow><boxGeometry args={[width, height, depth]} /><meshStandardMaterial color={wall} roughness={0.95} /></mesh>
    <mesh position={[0, height + 0.52, 0]} rotation-y={Math.PI / 4} castShadow><coneGeometry args={[Math.max(width, depth) * 0.82, 1.15, 4]} /><meshStandardMaterial color={roof} roughness={0.9} /></mesh>
    <mesh position={[0, 0.72, depth / 2 + 0.012]} castShadow><boxGeometry args={[width * 0.22, 1.05, 0.06]} /><meshStandardMaterial color="#4c3024" roughness={1} /></mesh>
    <mesh position={[width * 0.27, height * 0.63, depth / 2 + 0.02]} castShadow><boxGeometry args={[width * 0.23, height * 0.2, 0.05]} /><meshStandardMaterial color="#d9d8a8" emissive="#9b8052" emissiveIntensity={0.18} roughness={0.7} /></mesh>
  </group>;
}

function Awning({ position, width = 2.4 }: { position: Spot; width?: number }) {
  return <group position={[position[0], 0, position[1]]} rotation-y={position[2] ?? 0}>
    {[-width / 2 + 0.14, width / 2 - 0.14].map((x) => <Post key={x} position={[x, 0]} height={1.9} />)}
    <mesh position={[0, 1.88, 0.3]} rotation-x={0.1} castShadow><boxGeometry args={[width, 0.12, 1.25]} /><meshStandardMaterial color={CANVAS} roughness={0.95} /></mesh>
    <mesh position={[0, 0.42, 0.15]} castShadow><boxGeometry args={[width * 0.72, 0.68, 0.52]} /><meshStandardMaterial color="#875334" roughness={1} /></mesh>
  </group>;
}

function Lantern({ position, scale = 1 }: { position: Spot; scale?: number }) {
  return <group position={[position[0], 0, position[1]]} scale={scale}>
    <Post position={[0, 0]} height={2.35} />
    <mesh position={[0, 2.14, 0]} castShadow><cylinderGeometry args={[0.2, 0.25, 0.43, 8]} /><meshStandardMaterial color="#f3c96b" emissive="#ff9d42" emissiveIntensity={0.85} roughness={0.55} /></mesh>
    <mesh position={[0, 2.42, 0]} castShadow><coneGeometry args={[0.32, 0.26, 8]} /><meshStandardMaterial color="#473329" roughness={0.9} /></mesh>
    <pointLight position={[0, 2.12, 0]} color="#ffb25d" intensity={0.55} distance={5} />
  </group>;
}

function Crates({ position }: { position: Spot }) {
  return <group position={[position[0], 0, position[1]]} rotation-y={position[2] ?? 0}>{[[0, .25, 0], [.52, .25, .12], [.24, .74, .05]].map(([x, y, z], index) => <mesh key={index} position={[x, y, z]} rotation-y={index * .18} castShadow><boxGeometry args={[.48, .48, .48]} /><meshStandardMaterial color={index === 2 ? "#b97a3f" : "#8a5734"} roughness={1} /></mesh>)}</group>;
}

/** Ranch landmark cluster. Mount near Sunpatch Ranch; all geometry static and primitive-only. */
export function RanchSettlementPass() {
  const fences: [Spot, Spot][] = [
    [[-3.2, 4.3], [2.9, 4.3]], [[-3.2, 4.3], [-3.2, 10.8]], [[-3.2, 10.8], [-.9, 10.8]],
    [[1.2, 10.8], [5.9, 10.8]], [[5.9, 10.8], [5.9, 5.6]], [[5.9, 5.6], [4.5, 5.6]],
    [[-1.15, 10.8], [1.05, 10.8]], [[4.35, 5.6], [2.6, 5.6]],
  ];
  return <group name="ranch-settlement-pass">
    <mesh position={[1.3, .014, 7.7]} rotation-x={-Math.PI / 2} receiveShadow raycast={() => {}}><circleGeometry args={[4.7, 28]} /><meshStandardMaterial color="#bd9658" roughness={1} polygonOffset polygonOffsetFactor={-2} /></mesh>
    <mesh position={[1.3, .021, 7.7]} rotation-x={-Math.PI / 2} scale={[.58, 1, .93]} receiveShadow raycast={() => {}}><circleGeometry args={[3.8, 24]} /><meshStandardMaterial color="#d8b66f" roughness={1} polygonOffset polygonOffsetFactor={-3} /></mesh>
    {fences.map(([start, end], index) => <FenceRun key={index} start={start} end={end} />)}
    <group position={[-.05, 0, 10.8]}><Post position={[-1.08, 0]} height={1.65} /><Post position={[1.08, 0]} height={1.65} /><mesh position={[0, .86, 0]} castShadow><boxGeometry args={[1.78, .13, .12]} /><meshStandardMaterial color={TIMBER} roughness={1} /></mesh><mesh position={[0, .42, 0]} rotation-z={-.15} castShadow><boxGeometry args={[1.75, .1, .1]} /><meshStandardMaterial color={TIMBER} roughness={1} /></mesh></group>
    <Building position={[3.95, 8.25, -.22]} width={2.7} depth={2.3} height={2.35} wall="#b86f45" roof="#6d3d32" />
    <Building position={[-1.25, 7.35, .16]} width={2.15} depth={1.85} height={1.65} wall="#d49a52" roof="#46664d" />
    <Building position={[3.55, 5.15, -.45]} width={1.65} depth={1.55} height={3.05} wall="#9a653e" roof="#3e5650" />
    <Awning position={[.45, 5.48, -.12]} width={2.6} />
    <Awning position={[-1.62, 9.18, .4]} width={1.85} />
    <group position={[1.15, 0, 8.15]}><mesh position={[0, .22, 0]} castShadow><cylinderGeometry args={[.7, .84, .42, 12]} /><meshStandardMaterial color="#8f5e3d" roughness={1} /></mesh><mesh position={[0, .45, 0]} castShadow><torusGeometry args={[.63, .1, 7, 12]} /><meshStandardMaterial color="#b37a4a" roughness={1} /></mesh><mesh position={[0, .3, 0]}><circleGeometry args={[.56, 16]} /><meshStandardMaterial color="#6399a2" emissive="#397885" emissiveIntensity={.22} roughness={.25} /></mesh></group>
    <group position={[4.65, 0, 9.65]}>{[-.42, .42].map((x) => <mesh key={x} position={[x, .27, 0]} rotation-z={x * .35} castShadow><cylinderGeometry args={[.13, .16, 1.1, 8]} /><meshStandardMaterial color="#765035" roughness={1} /></mesh>)}<mesh position={[0, .1, 0]} castShadow><boxGeometry args={[1.45, .14, .72]} /><meshStandardMaterial color="#99633c" roughness={1} /></mesh></group>
    <Crates position={[-2.35, 5.08, .2]} /><Crates position={[2.05, 5.25, -.4]} />
    <Lantern position={[-2.72, 9.95]} /><Lantern position={[2.0, 10.35]} scale={1.1} /><Lantern position={[5.3, 6.45]} />
    <mesh position={[5.25, .52, 7.15]} castShadow><coneGeometry args={[.7, 1.05, 5]} /><meshStandardMaterial color="#d6a85b" roughness={.95} /></mesh>
    <mesh position={[-2.45, .28, 8.15]} castShadow><dodecahedronGeometry args={[.45, 0]} /><meshStandardMaterial color="#718b5b" roughness={1} /></mesh>
  </group>;
}
