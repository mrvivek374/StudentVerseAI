import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Explore Your Universe — six holographic zone islands in one 3D scene,
 * selected by hover/click/keyboard. A list alternative is rendered outside
 * this component so important tools are never gated behind 3D navigation.
 */

export type Zone = {
  id: string;
  name: string;
  route: string;
  color: string;
  desc: string;
};

export const ZONES: Zone[] = [
  { id: "knowledge", name: "Knowledge Galaxy", route: "/app/study", color: "#22d3ee", desc: "AI study assistant, doubt solver, notes summarizer, quizzes and a personalized planner." },
  { id: "innovation", name: "Innovation Lab", route: "/app/projects", color: "#14b8a6", desc: "Project generator, report & PPT creators, coding hub and an AI project mentor." },
  { id: "career", name: "Career Station", route: "/app/career", color: "#8b5cf6", desc: "Resume builder with ATS check, interview coach and career roadmap generator." },
  { id: "opportunity", name: "Opportunity Portal", route: "/app/opportunities", color: "#22c55e", desc: "Internships, scholarships, events and hackathons in one searchable hub." },
  { id: "productivity", name: "Productivity Core", route: "/app/productivity", color: "#facc15", desc: "Pomodoro timer, attendance & CGPA calculators, daily challenges and analytics." },
  { id: "community", name: "Community Nexus", route: "/app/community", color: "#f472b6", desc: "Study groups, campus collaboration, forum, leaderboards and success stories." },
];

function ZoneIsland({ zone, index, active, onSelect }: { zone: Zone; index: number; active: boolean; onSelect: (id: string) => void }) {
  const group = useRef<THREE.Group>(null!);
  const angle = (index / ZONES.length) * Math.PI * 2;
  const radius = 4.1;
  const pos: [number, number, number] = [Math.cos(angle) * radius, Math.sin(angle * 1.3) * 0.7, Math.sin(angle) * radius];

  useFrame((state) => {
    if (!group.current) return;
    if (state.gl.domElement.dataset.reduced === "1") return;
    const t = state.clock.elapsedTime;
    group.current.position.y = pos[1] + Math.sin(t * 0.7 + index) * 0.12;
    group.current.rotation.y += 0.002;
    const target = active ? 1.25 : 1;
    group.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
  });

  const color = new THREE.Color(zone.color);

  return (
    <group
      ref={group}
      position={pos}
      onPointerOver={(e) => { e.stopPropagation(); onSelect(zone.id); }}
      onClick={(e) => { e.stopPropagation(); onSelect(zone.id); }}
    >
      {/* island base */}
      <mesh>
        <icosahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.8 : 0.3}
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* holographic outline ring */}
      <mesh rotation={[Math.PI / 2.4, 0.2, 0]}>
        <torusGeometry args={[0.92, 0.012, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.95 : 0.45} />
      </mesh>
      <Html center distanceFactor={9} position={[0, -1.05, 0]} zIndexRange={[2, 0]}>
        <button
          onClick={() => onSelect(zone.id)}
          className={
            "px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border transition " +
            (active ? "border-cyan-300/70 bg-cyan-400/15 text-cyan-200" : "border-slate-500/40 bg-slate-900/60 text-slate-300")
          }
          style={{ color: active ? zone.color : undefined }}
        >
          {zone.name}
        </button>
      </Html>
    </group>
  );
}

function ZoneScene({ active, onSelect, onOpen }: { active: string | null; onSelect: (id: string) => void; onOpen: (zone: Zone) => void }) {
  // rotate slowly when nothing is active
  const world = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (!world.current || active || state.gl.domElement.dataset.reduced === "1") return;
    world.current.rotation.y += 0.0007;
  });
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= ZONES.length) {
        onSelect(ZONES[num - 1].id);
      }
      if (e.key === "Enter" && active) onOpen(ZONES.find((z) => z.id === active)!);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onSelect, onOpen]);

  return (
    <group ref={world}>
      {ZONES.map((z, i) => (
        <ZoneIsland key={z.id} zone={z} index={i} active={active === z.id} onSelect={onSelect} />
      ))}
    </group>
  );
}

export default function UniverseScene() {
  const [active, setActive] = useState<string | null>("knowledge");
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)), { rootMargin: "150px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const zone = ZONES.find((z) => z.id === active);
  return (
    <div ref={hostRef} className="relative w-full" style={{ height: "26rem" }}>
      {!visible ? (
        <div className="absolute inset-0 grid place-items-center text-sm text-secondary">Loading universe…</div>
      ) : (
      <Canvas camera={{ position: [0, 0.6, 8.5], fov: 45 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.9} color="#22d3ee" />
        <Stars radius={40} depth={20} count={700} factor={2} fade speed={0.5} />
        <ZoneScene active={active} onSelect={setActive} onOpen={() => undefined} />
      </Canvas>
      )}

      {/* Description panel + accessible list alternative */}
      <div className="absolute bottom-3 left-3 right-3 md:right-auto md:w-96 flex items-start gap-3">
        {zone && (
          <div className="glass-strong rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-sm" style={{ color: zone.color }}>{zone.name}</p>
              <a href={zone.route} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-2">
                Open module →
              </a>
            </div>
            <p className="text-xs text-secondary mt-1 leading-relaxed">{zone.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
