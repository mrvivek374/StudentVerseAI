import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Planet() {
  const g = useRef<THREE.Mesh>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const orbiters = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (state.gl.domElement.dataset.reduced === "1") return;
    g.current.rotation.y += 0.004;
    ring.current.rotation.z += 0.002;
    orbiters.current.rotation.y -= 0.008;
  });
  return (
    <group>
      <mesh ref={g}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#155e63" emissive="#14b8a6" emissiveIntensity={0.5} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh ref={ring} rotation={[1.15, 0.2, 0]}>
        <torusGeometry args={[1.45, 0.02, 8, 80]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} />
      </mesh>
      <group ref={orbiters}>
        {[0, 2.1, 4.2].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 1.6, Math.sin(a) * 0.45, Math.sin(a) * 1.4]}>
            <tetrahedronGeometry args={[0.11]} />
            <meshBasicMaterial color={["#22d3ee", "#8b5cf6", "#22c55e"][i]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function MiniPlanet({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0.8, 4.2], fov: 42 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 3, 4]} intensity={1} color="#22d3ee" />
        <Planet />
      </Canvas>
    </div>
  );
}
