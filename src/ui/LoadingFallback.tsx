"use client";

export function LoadingFallback() {
  return (
    <group>
      <ambientLight intensity={0.6} />
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.5, 20, 20]} />
        <meshStandardMaterial color={"#7aa2ff"} emissive={"#7aa2ff"} emissiveIntensity={0.8} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={"#1b2a22"} />
      </mesh>
    </group>
  );
}
