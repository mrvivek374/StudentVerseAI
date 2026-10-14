import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, Stars, Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * StudentVerse Core — the hero 3D scene.
 * Original composition: holographic core planet + orbital rings + connected
 * node constellations + floating tool panels + deep-space starfield.
 * Responds to pointer with gentle parallax; respects reduced motion.
 */

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Core planet ---------------- */
function CorePlanet() {
  const mesh = useRef<THREE.Mesh>(null!);
  const glow = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const rm = state.gl.domElement.dataset.reduced === "1";
    if (!rm) {
      mesh.current.rotation.y += 0.0015;
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.012;
      glow.current.scale.setScalar(s);
    }
  });
  return (
    <group>
      {/* Inner glowing core */}
      <mesh ref={glow}>
        <sphereGeometry args={[1.18, 48, 48]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.16} />
      </mesh>
      {/* Main planet — teal shader-ish lambert look */}
      <mesh ref={mesh}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#0b3c46"
          emissive="#14b8a6"
          emissiveIntensity={0.55}
          metalness={0.35}
          roughness={0.25}
        />
      </mesh>
      {/* Equator band */}
      <mesh rotation={[0.32, 0, 0]}>
        <torusGeometry args={[1.32, 0.012, 8, 100]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

/* ---------------- Orbital rings ---------------- */
function OrbitalRings() {
  const group = useRef<THREE.Group>(null!);
  const rings = useMemo(
    () => [
      { r: 1.9, tilt: [Math.PI / 2.15, 0.1, 0.2], speed: 0.12, color: "#14b8a6", op: 0.5 },
      { r: 2.5, tilt: [Math.PI / 2.5, -0.25, -0.15], speed: -0.07, color: "#22d3ee", op: 0.35 },
      { r: 3.1, tilt: [Math.PI / 1.9, 0.35, 0.05], speed: 0.05, color: "#8b5cf6", op: 0.28 },
    ],
    []
  );
  useFrame((state) => {
    if (state.gl.domElement.dataset.reduced === "1") return;
    group.current.children.forEach((child, i) => {
      child.rotation.z += rings[i].speed * 0.004;
    });
  });
  return (
    <group ref={group}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={ring.tilt as unknown as [number, number, number]}>
          <torusGeometry args={[ring.r, 0.008, 8, 128]} />
          <meshBasicMaterial color={ring.color} transparent opacity={ring.op} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Constellation nodes ---------------- */
const NODES: { pos: [number, number, number]; color: string }[] = [
  { pos: [2.2, 1.1, 0.4], color: "#14b8a6" },
  { pos: [-2.4, 0.7, 0.9], color: "#22d3ee" },
  { pos: [1.6, -1.6, 1.1], color: "#8b5cf6" },
  { pos: [-1.4, -1.9, -0.6], color: "#14b8a6" },
  { pos: [0.9, 2.2, -0.9], color: "#22d3ee" },
  { pos: [-0.6, 2.5, 0.8], color: "#22d3ee" },
  { pos: [2.9, -0.6, -0.7], color: "#8b5cf6" },
  { pos: [-2.8, -0.9, -0.4], color: "#22d3ee" },
];

function Constellation() {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (state.gl.domElement.dataset.reduced === "1") return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.25;
    group.current.children.forEach((n, i) => {
      n.position.y += Math.sin(state.clock.elapsedTime * 0.9 + i * 1.7) * 0.0009;
    });
  });
  const links: [number, number][] = [
    [0, 4], [1, 5], [2, 6], [3, 7], [0, 1], [6, 2], [4, 3], [5, 7], [0, 6], [1, 3],
  ];
  return (
    <group ref={group}>
      {NODES.map((n, i) => (
        <Float key={i} speed={1.4} rotationIntensity={0.4} floatIntensity={0.9}>
          <mesh position={n.pos}>
            <octahedronGeometry args={[0.09]} />
            <meshBasicMaterial color={n.color} />
          </mesh>
        </Float>
      ))}
      {links.map(([a, b], i) => (
        <Line
          key={`l${i}`}
          points={[NODES[a].pos, NODES[b].pos]}
          color="#22d3ee"
          transparent
          opacity={0.22}
          lineWidth={1}
        />
      ))}
    </group>
  );
}

/* ---------------- Floating tool panels (AI, Code, Career, Productivity) ---------------- */
function HoloPanel({ position, label, color }: { position: [number, number, number]; label: string; color: string }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (!group.current) return;
    if (state.gl.domElement.dataset.reduced === "1") return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35 + position[0]) * 0.28;
    group.current.lookAt(0, 0, 6);
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + position[1]) * 0.1;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.7}>
      <group ref={group} position={position}>
        <mesh>
          <planeGeometry args={[0.72, 0.5]} />
          <meshBasicMaterial color={color} transparent opacity={0.16} side={THREE.DoubleSide} />
        </mesh>
        <Line
          points={[
            [-0.36, -0.25, 0], [0.36, -0.25, 0], [0.36, 0.25, 0], [-0.36, 0.25, 0], [-0.36, -0.25, 0],
          ]}
          color={color}
          transparent
          opacity={0.9}
          lineWidth={1.4}
        />
        {/* Icon rows inside the panel */}
        {[0.12, 0, -0.12].map((y, r) => (
          <group key={r}>
            {[0, 1, 2].map((c) => (
              <mesh key={c} position={[-0.15 + c * 0.15, y, 0.01]}>
                <planeGeometry args={[0.08, 0.028]} />
                <meshBasicMaterial color={color} transparent opacity={0.55} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </Float>
  );
}

function Panels() {
  return (
    <group>
      <HoloPanel position={[0, -2.35, 1.3]} label="AI" color="#14b8a6" />
      <HoloPanel position={[-2.6, 0.1, 0.9]} label="Code" color="#22d3ee" />
      <HoloPanel position={[2.75, -0.3, 0.6]} label="Career" color="#8b5cf6" />
      <HoloPanel position={[0.4, 2.6, 0.2]} label="Pro" color="#22d3ee" />
    </group>
  );
}

/* ---------------- Ambient particles ---------------- */
function AmbientParticles() {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(220 * 3);
    for (let i = 0; i < 220; i++) {
      const r = 2.6 + Math.random() * 2.6;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(ph);
    }
    return arr;
  }, []);
  useFrame((state) => {
    if (state.gl.domElement.dataset.reduced === "1") return;
    ref.current.rotation.y += 0.0006;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#67e8f9" transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

/* ---------------- Pointer parallax camera rig ---------------- */
function ParallaxRig() {
  const { camera, gl } = useThree();
  const target = useRef({ x: 0, y: 0 });
  React.useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      target.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.6;
      target.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.35;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);
  useFrame(() => {
    if (gl.domElement.dataset.reduced === "1") return;
    camera.position.x += (0.6 + target.current.x - camera.position.x) * 0.04;
    camera.position.y += (0.25 + target.current.y - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function SceneRig({ onContextLost }: { onContextLost?: () => void }) {
  const { gl } = useThree();
  React.useEffect(() => {
    gl.domElement.dataset.reduced = prefersReducedMotion() ? "1" : "0";
    const onLost = (e: Event) => {
      e.preventDefault();
      onContextLost?.();
    };
    gl.domElement.addEventListener("webglcontextlost", onLost);
    return () => gl.domElement.removeEventListener("webglcontextlost", onLost);
  }, [gl, onContextLost]);
  return null;
}

/** Mounts children only when the element scrolls near the viewport. */
function useVisible<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

export default function StudentVerseCore({ className = "" }: { className?: string }) {
  const [failed, setFailed] = React.useState(false);
  const { ref, visible } = useVisible<HTMLDivElement>();

  if (failed) {
    // CSS 3D fallback (no WebGL) — honest fallback, not a fake canvas
    return (
      <div className={`relative ${className}`}>
        <div
          className="mx-auto w-64 h-64 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, #22d3ee33, #14b8a655 40%, #0b1220 75%)",
            boxShadow: "0 0 80px rgba(20,184,166,.35), inset 0 0 40px rgba(34,211,238,.25)",
            border: "1px solid rgba(34,211,238,.4)",
          }}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {!visible ? (
        <div className="absolute inset-0 grid place-items-center text-xs text-secondary">Loading universe…</div>
      ) : (
      <Canvas
        camera={{ position: [0.6, 0.3, 7], fov: 42 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
        }}
        className="!absolute inset-0"
      >
        <SceneRig onContextLost={() => setFailed(true)} />
        <ambientLight intensity={0.5} />
        <pointLight position={[4, 4, 6]} intensity={1.1} color="#22d3ee" />
        <pointLight position={[-5, -2, 3]} intensity={0.5} color="#8b5cf6" />
        <CorePlanet />
        <OrbitalRings />
        <Constellation />
        <Panels />
        <AmbientParticles />
        <Stars radius={30} depth={18} count={900} factor={2.2} saturation={0.4} fade speed={0.6} />
        <ParallaxRig />
      </Canvas>
      )}
    </div>
  );
}
