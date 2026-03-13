"use client";

import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// ─── RESPONSIVE HOOK ──────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const PARAMETERS = {
  count: 160000,
  size: 0.013,
  radius: 130,
  branches: 5,
  spin: 1.3,
  randomness: 0.24,
  randomnessPower: 3.1,
  thicknessScale: 0.28,
};

// FIX: LAYERS at module scope — stable reference, no stale-closure risk in useMemo
const GALAXY_LAYERS = [
  {
    count: 80000,
    radiusScale: 1.0,
    spinMult: 1.0,
    branchOffset: 0,
    thickMult: 1.0,
    colorShift: 0.0,
    speed: 0.017,
    opacity: 0.65,
    size: 0.013,
    seed: 1,
  },
  {
    count: 28000,
    radiusScale: 1.18,
    spinMult: -0.8,
    branchOffset: 1,
    thickMult: 2.5,
    colorShift: -0.6,
    speed: -0.008,
    opacity: 0.2,
    size: 0.011,
    seed: 2,
  },
  {
    count: 22000,
    radiusScale: 0.58,
    spinMult: 1.45,
    branchOffset: 2,
    thickMult: 0.4,
    colorShift: 0.5,
    speed: 0.026,
    opacity: 0.48,
    size: 0.01,
    seed: 3,
  },
  {
    count: 18000,
    radiusScale: 0.92,
    spinMult: 0.7,
    branchOffset: 3,
    thickMult: 3.2,
    colorShift: -0.3,
    speed: 0.01,
    opacity: 0.28,
    size: 0.014,
    seed: 4,
  },
  {
    count: 14000,
    radiusScale: 1.42,
    spinMult: 0.5,
    branchOffset: 0,
    thickMult: 5.0,
    colorShift: -0.9,
    speed: 0.005,
    opacity: 0.12,
    size: 0.012,
    seed: 5,
  },
];

const TOTAL_PARTICLES = GALAXY_LAYERS.reduce((s, l) => s + l.count, 0);

const DOMAIN_DATA = {
  physics: {
    title: "Physics",
    subtitle: "The architecture of reality",
    color: "#5bc8ff",
    emissive: "#1a6fff",
    spectralClass: "O-type Supergiant",
    magnitude: "−6.5",
    temp: "45,000 K",
    description:
      "From quantum fluctuations to cosmic expansion, physics reveals the deep grammar of the universe — the rules that everything must obey.",
    concepts: [
      "Relativity",
      "Quantum Mechanics",
      "Entropy",
      "Black Holes",
      "Thermodynamics",
    ],
    distance: "4.37 ly",
    type: "blue_giant",
    radius: 6.5,
  },
  math: {
    title: "Mathematics",
    subtitle: "The language of structure",
    color: "#ddeeff",
    emissive: "#8ab0ff",
    spectralClass: "A-type Main Sequence",
    magnitude: "−0.72",
    temp: "9,800 K",
    description:
      "Mathematics is not invented but discovered — an eternal realm of pattern and proof that exists independent of any physical universe.",
    concepts: [
      "Calculus",
      "Infinity",
      "Chaos Theory",
      "Information Theory",
      "Emergence",
    ],
    distance: "8.61 ly",
    type: "white_star",
    radius: 4.5,
  },
  history: {
    title: "History",
    subtitle: "Memory made permanent",
    color: "#ffd060",
    emissive: "#ff8800",
    spectralClass: "G2-type Main Sequence",
    magnitude: "4.83",
    temp: "5,780 K",
    description:
      "History is not the past — it is interpretation, the story we tell ourselves about how we arrived here and who we truly are.",
    concepts: [
      "Civilizations",
      "Revolutions",
      "Philosophy of Time",
      "Archaeology",
      "Oral Tradition",
    ],
    distance: "11.9 ly",
    type: "sun_like",
    radius: 5.2,
  },
  philosophy: {
    title: "Philosophy",
    subtitle: "Questions without final answers",
    color: "#ff8855",
    emissive: "#cc2200",
    spectralClass: "K5-type Giant",
    magnitude: "5.68",
    temp: "4,100 K",
    description:
      "Philosophy dissolves problems rather than solving them — showing that our deepest confusions arise from how we use language and thought.",
    concepts: [
      "Consciousness",
      "Free Will",
      "Epistemology",
      "Ethics",
      "Metaphysics",
    ],
    distance: "16.3 ly",
    type: "red_giant",
    radius: 7.5,
  },
  arts: {
    title: "Arts",
    subtitle: "Expression beyond words",
    color: "#e060ff",
    emissive: "#9900cc",
    spectralClass: "M-type Pulsating",
    magnitude: "3.20",
    temp: "3,500 K",
    description:
      "Art is the universe becoming aware of its own beauty — a dialogue between the human spirit and the infinite, conducted in color, sound, and form.",
    concepts: [
      "Aesthetics",
      "Creativity",
      "Symbolism",
      "Composition",
      "Imagination",
    ],
    distance: "22.1 ly",
    type: "red_giant",
    radius: 6.8,
  },
  business: {
    title: "Business",
    subtitle: "Value in motion",
    color: "#40e080",
    emissive: "#007744",
    spectralClass: "F-type Subgiant",
    magnitude: "2.14",
    temp: "6,700 K",
    description:
      "Business is organized human cooperation — the art of creating systems that convert ideas, labor, and capital into value shared across society.",
    concepts: [
      "Markets",
      "Strategy",
      "Innovation",
      "Supply & Demand",
      "Leadership",
    ],
    distance: "18.5 ly",
    type: "white_star",
    radius: 5.0,
  },
  tech: {
    title: "Technology",
    subtitle: "Tools that reshape the world",
    color: "#00eeff",
    emissive: "#006688",
    spectralClass: "B-type Hot Subdwarf",
    magnitude: "−1.44",
    temp: "20,000 K",
    description:
      "Technology is applied imagination — the translation of scientific understanding into instruments that amplify human capability and transform civilization.",
    concepts: ["Computing", "Networks", "AI", "Engineering", "Automation"],
    distance: "6.8 ly",
    type: "blue_giant",
    radius: 6.0,
  },
};

interface StarNode {
  id: keyof typeof DOMAIN_DATA;
  position: THREE.Vector3;
  color: string;
}

const SPECIAL_NODES: StarNode[] = [
  { id: "physics", position: new THREE.Vector3(42, 5, 28), color: "#5bc8ff" },
  { id: "math", position: new THREE.Vector3(-30, 6, 44), color: "#ddeeff" },
  {
    id: "history",
    position: new THREE.Vector3(-44, -3, -30),
    color: "#ffd060",
  },
  {
    id: "philosophy",
    position: new THREE.Vector3(30, -6, -44),
    color: "#ff8855",
  },
  { id: "arts", position: new THREE.Vector3(-52, 4, 10), color: "#e060ff" },
  { id: "business", position: new THREE.Vector3(10, -5, 56), color: "#40e080" },
  { id: "tech", position: new THREE.Vector3(54, 3, -14), color: "#00eeff" },
];

// ─── TEXTURE GENERATORS ───────────────────────────────────────────────────────
const textureCache = new Map();

function getStarTexture(type: string) {
  if (textureCache.has(type)) return textureCache.get(type);
  const SIZE = 512;
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d")!;
  const cx = SIZE / 2,
    cy = SIZE / 2;

  if (type === "blue_giant") {
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, SIZE / 2);
    core.addColorStop(0, "rgba(255,255,255,1)");
    core.addColorStop(0.03, "rgba(235,248,255,1)");
    core.addColorStop(0.09, "rgba(140,210,255,0.92)");
    core.addColorStop(0.2, "rgba(70,140,255,0.55)");
    core.addColorStop(0.45, "rgba(30,70,220,0.18)");
    core.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      for (let w = -1.5; w <= 1.5; w += 0.75) {
        const wa = a + w * 0.025;
        const g = ctx.createLinearGradient(
          cx,
          cy,
          cx + Math.cos(wa) * 250,
          cy + Math.sin(wa) * 250,
        );
        g.addColorStop(0, "rgba(180,220,255,0.6)");
        g.addColorStop(0.3, "rgba(100,180,255,0.2)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(wa) * 250, cy + Math.sin(wa) * 250);
        ctx.stroke();
      }
    }
  } else if (type === "white_star") {
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, SIZE / 2);
    core.addColorStop(0, "rgba(255,255,255,1)");
    core.addColorStop(0.05, "rgba(245,248,255,0.98)");
    core.addColorStop(0.14, "rgba(210,225,255,0.7)");
    core.addColorStop(0.3, "rgba(180,205,255,0.25)");
    core.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI;
      [-1, 0, 1].forEach((w) => {
        const wa = a + w * 0.03;
        const g = ctx.createLinearGradient(
          cx,
          cy,
          cx + Math.cos(wa) * 256,
          cy + Math.sin(wa) * 256,
        );
        g.addColorStop(0, "rgba(255,255,255,0.7)");
        g.addColorStop(0.2, "rgba(200,220,255,0.25)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(wa) * 256, cy + Math.sin(wa) * 256);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - Math.cos(wa) * 256, cy - Math.sin(wa) * 256);
        ctx.stroke();
      });
    }
  } else if (type === "sun_like") {
    const core = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, SIZE / 2);
    core.addColorStop(0, "rgba(255,255,230,1)");
    core.addColorStop(0.04, "rgba(255,248,180,1)");
    core.addColorStop(0.1, "rgba(255,210,80,0.95)");
    core.addColorStop(0.22, "rgba(255,160,30,0.65)");
    core.addColorStop(0.42, "rgba(220,90,10,0.28)");
    core.addColorStop(0.7, "rgba(160,40,5,0.08)");
    core.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = 72 + (i % 3) * 30;
      const g = ctx.createLinearGradient(
        cx,
        cy,
        cx + Math.cos(a) * r,
        cy + Math.sin(a) * r,
      );
      g.addColorStop(0, "rgba(255,190,40,0.4)");
      g.addColorStop(0.6, "rgba(255,100,10,0.12)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 3 + (i % 4) * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }
  } else {
    const core = ctx.createRadialGradient(cx + 10, cy - 5, 0, cx, cy, SIZE / 2);
    core.addColorStop(0, "rgba(255,240,200,1)");
    core.addColorStop(0.03, "rgba(255,180,100,1)");
    core.addColorStop(0.09, "rgba(255,100,40,0.9)");
    core.addColorStop(0.2, "rgba(210,50,15,0.55)");
    core.addColorStop(0.42, "rgba(160,20,5,0.22)");
    core.addColorStop(0.7, "rgba(100,10,2,0.06)");
    core.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = 100 + (i % 3) * 40;
      const g = ctx.createLinearGradient(
        cx,
        cy,
        cx + Math.cos(a) * r,
        cy + Math.sin(a) * r,
      );
      g.addColorStop(0, "rgba(255,100,30,0.35)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 8 + (i % 3) * 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  textureCache.set(type, tex);
  return tex;
}

function getSurfaceTexture(type: string) {
  const key = type + "_surface";
  if (textureCache.has(key)) return textureCache.get(key);
  const SIZE = 512;
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d")!;
  const colors: Record<string, string[]> = {
    blue_giant: ["#0a1a4a", "#1a3080", "#0a60cc", "#60aaff"],
    white_star: ["#c8d8f0", "#dde8ff", "#e8f0ff", "#ffffff"],
    sun_like: ["#8b3000", "#cc6600", "#ff9900", "#ffcc44"],
    red_giant: ["#4a0800", "#8b1500", "#cc3300", "#ff6622"],
  };
  const [c1, , c3, c4] = colors[type] || colors.sun_like;
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * SIZE,
      y = Math.random() * SIZE;
    const r = 2 + Math.random() * 18;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, (Math.random() > 0.5 ? c4 : c1) + "55");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * SIZE,
      y = Math.random() * SIZE;
    const r = 8 + Math.random() * 35;
    ctx.strokeStyle = c3 + "33";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  textureCache.set(key, tex);
  return tex;
}

function getRingTexture() {
  if (textureCache.has("ring")) return textureCache.get("ring");
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 1;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 512, 0);
  g.addColorStop(0, "rgba(255,100,40,0)");
  g.addColorStop(0.08, "rgba(255,120,50,0.55)");
  g.addColorStop(0.18, "rgba(255,160,80,0.35)");
  g.addColorStop(0.28, "rgba(200,80,30,0.6)");
  g.addColorStop(0.42, "rgba(255,110,50,0.22)");
  g.addColorStop(0.55, "rgba(220,90,40,0.48)");
  g.addColorStop(0.7, "rgba(180,70,30,0.18)");
  g.addColorStop(0.85, "rgba(240,100,50,0.32)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 1);
  const tex = new THREE.CanvasTexture(c);
  textureCache.set("ring", tex);
  return tex;
}

// ─── NEBULA CLOUD ─────────────────────────────────────────────────────────────
function NebulaCloud() {
  const meshes = useMemo(() => {
    const clouds = [];
    const cols = ["#1a0533", "#001830", "#0a0020", "#200010", "#001520"];
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2 + 0.4;
      const r = 55 + Math.random() * 85;
      clouds.push({
        x: Math.cos(a) * r * (0.8 + Math.random() * 0.5),
        y: (Math.random() - 0.5) * 18,
        z: Math.sin(a) * r * (0.8 + Math.random() * 0.5),
        scale: 35 + Math.random() * 65,
        color: cols[i % cols.length],
        opacity: 0.04 + Math.random() * 0.08,
      });
    }
    return clouds;
  }, []);
  return (
    <>
      {meshes.map((m, i) => (
        <mesh key={i} position={[m.x, m.y, m.z]}>
          <planeGeometry args={[m.scale, m.scale]} />
          <meshBasicMaterial
            color={m.color}
            transparent
            opacity={m.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── REALISTIC STAR MESH ──────────────────────────────────────────────────────
interface SpecialStarProps {
  id: keyof typeof DOMAIN_DATA;
  position: THREE.Vector3;
  color: string;
  onClick: (id: keyof typeof DOMAIN_DATA, position: THREE.Vector3) => void;
  isSelected: boolean;
}
function SpecialStar({ id, position, color, onClick, isSelected }: SpecialStarProps) {
  const data = DOMAIN_DATA[id];
  const [hovered, setHovered] = useState(false);
  const isMobile = useIsMobile();

  // FIX: removed unused groupRef
  const coreRef = useRef<THREE.Mesh>(null);
  const glowSpr = useRef<THREE.Sprite>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);

  const starTex = useMemo(() => getStarTexture(data.type), [data.type]);
  const surfTex = useMemo(() => getSurfaceTexture(data.type), [data.type]);
  const ringTex = useMemo(() => getRingTexture(), []);

  const R = data.radius;
  const hasRing = data.type === "red_giant";
  const hasMoon = data.type === "sun_like";
  const threeColor = useMemo(() => new THREE.Color(color), [color]);
  const emissiveColor = useMemo(
    () => new THREE.Color(data.emissive),
    [data.emissive],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y =
        t * (data.type === "red_giant" ? 0.05 : 0.14);
      coreRef.current.scale.setScalar(
        1 + 0.025 * Math.sin(t * 1.8 + position.x * 0.3),
      );
    }
    if (glowSpr.current) {
      const bonus = hovered || isSelected ? 0.3 : 0;
      glowSpr.current.scale.setScalar(
        (R * 5.5 + bonus * R) * (1 + 0.1 * Math.sin(t * 1.2)),
      );
      glowSpr.current.material.opacity =
        0.28 + 0.1 * Math.sin(t * 1.6) + (isSelected ? 0.1 : 0);
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.z = t * 0.07;
      coronaRef.current.scale.setScalar(1 + 0.06 * Math.sin(t * 0.9));
      (coronaRef.current.material as THREE.MeshBasicMaterial).opacity = 0.18 + 0.06 * Math.sin(t * 1.1);
    }
    if (ringRef.current)
      ringRef.current.rotation.x = Math.PI * 0.42 + Math.sin(t * 0.18) * 0.04;
    if (orbitRef.current) orbitRef.current.rotation.y = t * 0.11;
  });

  const active = hovered || isSelected;

  return (
    <group position={position}>
      {hasMoon && (
        <group ref={orbitRef}>
          <mesh position={[R * 3.2, 0.2, 0]}>
            <sphereGeometry args={[0.3, 24, 24]} />
            <meshStandardMaterial
              color="#9a9890"
              roughness={0.95}
              metalness={0.05}
            />
          </mesh>
          <mesh position={[R * 3.2, 0.2, 0]}>
            <sphereGeometry args={[0.32, 24, 24]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={0.3}
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {hasRing && (
        <group ref={ringRef}>
          {[1.6, 1.9, 2.25, 2.6].map((rInner, i) => (
            <mesh key={i}>
              <ringGeometry args={[R * rInner, R * (rInner + 0.22), 120]} />
              <meshBasicMaterial
                map={ringTex}
                color={color}
                transparent
                opacity={[0.45, 0.22, 0.38, 0.18][i]}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}

      {(data.type === "blue_giant" || data.type === "white_star") && (
        <mesh ref={coronaRef}>
          <planeGeometry args={[R * 14, R * 14]} />
          <meshBasicMaterial
            map={starTex}
            color={threeColor}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0.22}
          />
        </mesh>
      )}

      <sprite ref={glowSpr} scale={[R * 10, R * 10, 1]}>
        <spriteMaterial
          map={starTex}
          color={threeColor}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          opacity={0.5}
        />
      </sprite>

      <mesh>
        <sphereGeometry args={[R * 1.18, 32, 32]} />
        <meshBasicMaterial
          color={threeColor}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={coreRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(id, position);
        }}
      >
        <sphereGeometry args={[R, 80, 80]} />
        <meshStandardMaterial
          map={surfTex}
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={1.4}
          emissiveMap={surfTex}
          roughness={0.35}
          metalness={0}
        />
      </mesh>

      {active && (
        <mesh rotation={[Math.PI / 2.15, 0, 0]}>
          <ringGeometry args={[R * 2.0, R * 2.18, 128]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isSelected ? 0.8 : 0.4}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      <pointLight
        color={color}
        intensity={isSelected ? 1.2 : 0.45}
        distance={55}
        decay={2}
      />

      <Html
        distanceFactor={isMobile ? 30 : 22}
        center
        position={[0, R * 2.6 + 2.5, 0]}
        zIndexRange={[50, 0]}
        occlude={false}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            pointerEvents: "none",
            userSelect: "none",
            opacity: isSelected ? 1 : hovered ? 1 : 0.82,
            transform: isSelected
              ? "scale(1.08)"
              : hovered
                ? "scale(1.04)"
                : "scale(1)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg,${color}18 0%,rgba(4,4,18,0.72) 100%)`,
              border: `1px solid ${color}${isSelected ? "88" : "44"}`,
              borderRadius: 40,
              padding: isMobile ? "5px 12px 6px" : "7px 20px 8px",
              backdropFilter: "blur(12px)",
              boxShadow: isSelected
                ? `0 0 24px ${color}44,0 0 60px ${color}22,inset 0 1px 0 ${color}22`
                : `0 0 12px ${color}22,inset 0 1px 0 ${color}11`,
              display: "flex",
              alignItems: "center",
              gap: 7,
              whiteSpace: "nowrap",
              transition: "box-shadow 0.35s ease,border-color 0.35s ease",
            }}
          >
            <div
              style={{
                width: isMobile ? 6 : 8,
                height: isMobile ? 6 : 8,
                borderRadius: "50%",
                flexShrink: 0,
                background: `radial-gradient(circle,#fff 0%,${color} 55%,${color}00 100%)`,
                boxShadow: `0 0 8px 2px ${color}99`,
              }}
            />
            <span
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: isMobile ? 11 : 15,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textShadow: `0 0 18px ${color}cc`,
              }}
            >
              {data.title}
            </span>
          </div>
          {!isMobile && (
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 9,
                color: `${color}bb`,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textAlign: "center",
                textShadow: `0 0 10px ${color}66`,
              }}
            >
              {data.subtitle}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ─── GALAXY LAYER BUILDER ─────────────────────────────────────────────────────
function buildGalaxyLayer({
  count,
  radiusScale,
  spinMult,
  branchOffset,
  thickMult,
  colorShift,
  seed,
}: {
  count: number;
  radiusScale: number;
  spinMult: number;
  branchOffset: number;
  thickMult: number;
  colorShift: number;
  seed: number;
}) {
  let s = seed * 9301 + 49297;
  const rng = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const pos = new Float32Array(count * 3);
  const cols = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = Math.pow(rng(), 0.55) * PARAMETERS.radius * radiusScale;
    const a =
      r * PARAMETERS.spin * spinMult +
      (((i + branchOffset) % PARAMETERS.branches) / PARAMETERS.branches) *
        Math.PI *
        2;
    const rX =
      Math.pow(rng(), PARAMETERS.randomnessPower) *
      (rng() < 0.5 ? 1 : -1) *
      PARAMETERS.randomness *
      r;
    const rY =
      Math.pow(rng(), PARAMETERS.randomnessPower) *
      (rng() < 0.5 ? 1 : -1) *
      PARAMETERS.randomness *
      r *
      PARAMETERS.thicknessScale *
      thickMult;
    const rZ =
      Math.pow(rng(), PARAMETERS.randomnessPower) *
      (rng() < 0.5 ? 1 : -1) *
      PARAMETERS.randomness *
      r;
    pos[i3] = Math.cos(a) * r + rX;
    pos[i3 + 1] = rY;
    pos[i3 + 2] = Math.sin(a) * r + rZ;

    const t = r / (PARAMETERS.radius * radiusScale);
    const roll = rng();
    let col: THREE.Color = new THREE.Color();
    if (r < 10)
      col = new THREE.Color().setHSL(
        0.08 + colorShift * 0.04 + rng() * 0.05,
        0.6,
        0.65 + rng() * 0.25,
      );
    else if (roll < 0.006)
      col = new THREE.Color().setHSL(0.6 + colorShift * 0.05, 0.7, 0.78);
    else if (roll < 0.018)
      col = new THREE.Color().setHSL(0.04 + colorShift * 0.03, 0.85, 0.58);
    else if (roll < 0.04) col = new THREE.Color("#fff0c0");
    else if (t < 0.28)
      col = new THREE.Color("#ffe8c0").lerp(
        new THREE.Color("#ffcc88"),
        t / 0.28,
      );
    else if (t < 0.6)
      col = new THREE.Color("#ffcc88").lerp(
        new THREE.Color("#aaaaff"),
        (t - 0.28) / 0.32,
      );
    else
      col = new THREE.Color("#aaaaff").lerp(
        new THREE.Color("#3366ff"),
        (t - 0.6) / 0.4,
      );
    cols[i3] = col.r;
    cols[i3 + 1] = col.g;
    cols[i3 + 2] = col.b;
  }
  return { pos, cols };
}

// ─── GALAXY PARTICLES — 5 INDEPENDENT DISK LAYERS ────────────────────────────
function SpiralGalaxy() {
  // FIX: stable ref array — plain objects wrapping null, assigned via callback refs.
  // No React.createRef() called on every render.
  const layerRefs = useRef<Array<{ current: THREE.Points<any, any> | null }>>(GALAXY_LAYERS.map(() => ({ current: null })));
  const dustRef = useRef<THREE.Points<any, any>>(null);
  const coreRef = useRef<THREE.Points<any, any>>(null);

  // FIX: GALAXY_LAYERS is module-level const → useMemo dep array is truly stable.
  const layerData = useMemo(
    () => GALAXY_LAYERS.map((cfg) => buildGalaxyLayer(cfg)),
    [],
  );

  const { dustPos, dustCol } = useMemo(() => {
    const D = 22000;
    const dp = new Float32Array(D * 3);
    const dc = new Float32Array(D * 3);
    for (let i = 0; i < D; i++) {
      const i3 = i * 3;
      const r = 10 + Math.random() * PARAMETERS.radius * 0.9;
      const a =
        r * PARAMETERS.spin +
        (((i % PARAMETERS.branches) + 0.5) / PARAMETERS.branches) * Math.PI * 2;
      const sp = r * 0.07;
      dp[i3] = Math.cos(a) * r + (Math.random() - 0.5) * sp;
      dp[i3 + 1] = (Math.random() - 0.5) * 2.0;
      dp[i3 + 2] = Math.sin(a) * r + (Math.random() - 0.5) * sp;
      const dcol = new THREE.Color("#1a0800").lerp(
        new THREE.Color("#080200"),
        r / PARAMETERS.radius,
      );
      dc[i3] = dcol.r;
      dc[i3 + 1] = dcol.g;
      dc[i3 + 2] = dcol.b;
    }
    return { dustPos: dp, dustCol: dc };
  }, []);

  const { corePos, coreCols } = useMemo(() => {
    const CN = 10000;
    const cp = new Float32Array(CN * 3);
    const cc = new Float32Array(CN * 3);
    for (let i = 0; i < CN; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const th = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 2.2) * 9;
      cp[i * 3] = Math.sin(phi) * Math.cos(th) * r;
      cp[i * 3 + 1] = Math.cos(phi) * r * 0.45;
      cp[i * 3 + 2] = Math.sin(phi) * Math.sin(th) * r;
      const warm = new THREE.Color().setHSL(
        0.09,
        0.5,
        0.7 + Math.random() * 0.3,
      );
      cc[i * 3] = warm.r;
      cc[i * 3 + 1] = warm.g;
      cc[i * 3 + 2] = warm.b;
    }
    return { corePos: cp, coreCols: cc };
  }, []);

  useFrame((_, delta) => {
    GALAXY_LAYERS.forEach((cfg, idx) => {
      const ref = layerRefs.current[idx]?.current;
      if (ref) ref.rotation.y += delta * cfg.speed;
    });
    if (dustRef.current) dustRef.current.rotation.y += delta * 0.013;
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.01;
  });

  return (
    <>
      {GALAXY_LAYERS.map((cfg, idx) => (
        // FIX: callback ref pattern — assigns into our stable wrapper objects
        <points
          key={idx}
          ref={(el) => {
            layerRefs.current[idx].current = el;
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[layerData[idx].pos, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[layerData[idx].cols, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={cfg.size}
            sizeAttenuation
            depthWrite={false}
            vertexColors
            blending={THREE.AdditiveBlending}
            transparent
            opacity={cfg.opacity}
          />
        </points>
      ))}

      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dustPos, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[dustCol, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          sizeAttenuation
          depthWrite={false}
          vertexColors
          blending={THREE.NormalBlending}
          transparent
          opacity={0.3}
        />
      </points>

      <points ref={coreRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[corePos, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[coreCols, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          sizeAttenuation
          depthWrite={false}
          vertexColors
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.6}
        />
      </points>

      <mesh renderOrder={-1}>
        <sphereGeometry args={[7, 32, 32]} />
        <meshBasicMaterial
          color="#ffe8c0"
          transparent
          opacity={0.025}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight color="#ffd090" intensity={0.5} distance={50} decay={2} />
    </>
  );
}

// ─── CAMERA RIG ───────────────────────────────────────────────────────────────
interface CameraRigProps {
  targetPosition: THREE.Vector3 | null;
  onArrived: () => void;
  onInterrupt: () => void;
}
function CameraRig({ targetPosition, onArrived, onInterrupt }: CameraRigProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const arriving = useRef(false);

  useEffect(() => {
    if (targetPosition) arriving.current = true;
  }, [targetPosition]);

  useFrame((_, delta) => {
    if (targetPosition && arriving.current && controlsRef.current) {
      const desired = targetPosition.clone().add(new THREE.Vector3(10, 6, 22));
      camera.position.lerp(desired, 3.5 * delta);
      controlsRef.current.target.lerp(targetPosition, 3.5 * delta);
      controlsRef.current.update();
      if (camera.position.distanceTo(desired) < 0.4) {
        arriving.current = false;
        onArrived();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableZoom
      minDistance={5}
      maxDistance={420}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      onStart={() => {
        arriving.current = false;
        onInterrupt();
      }}
    />
  );
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
function Scanlines() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        backgroundImage:
          "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.022) 2px,rgba(0,0,0,0.022) 4px)",
      }}
    />
  );
}

type CornerPos = "tl" | "tr" | "bl" | "br";
function CornerDecor({ pos }: { pos: CornerPos }) {
  const base: React.CSSProperties = {
    position: "absolute",
    width: 32,
    height: 32,
    pointerEvents: "none",
    zIndex: 5,
  };
  const v = {
    tl: {
      top: 10,
      left: 10,
      borderTop: "1px solid rgba(255,255,255,0.16)",
      borderLeft: "1px solid rgba(255,255,255,0.16)",
    },
    tr: {
      top: 10,
      right: 10,
      borderTop: "1px solid rgba(255,255,255,0.16)",
      borderRight: "1px solid rgba(255,255,255,0.16)",
    },
    bl: {
      bottom: 10,
      left: 10,
      borderBottom: "1px solid rgba(255,255,255,0.16)",
      borderLeft: "1px solid rgba(255,255,255,0.16)",
    },
    br: {
      bottom: 10,
      right: 10,
      borderBottom: "1px solid rgba(255,255,255,0.16)",
      borderRight: "1px solid rgba(255,255,255,0.16)",
    },
  };
  return <div style={{ ...base, ...v[pos] }} />;
}

// ─── MOBILE BOTTOM SHEET ──────────────────────────────────────────────────────
// Full-height sheet, large fonts, safe-area inset at bottom, smooth entrance.
interface MobileDetailSheetProps {
  nodeId: keyof typeof DOMAIN_DATA;
  onClose: () => void;
}
function MobileDetailSheet({ nodeId, onClose }: MobileDetailSheetProps) {
  const [vis, setVis] = useState(false);
  const data = DOMAIN_DATA[nodeId];

  useEffect(() => {
    setVis(false);
    const t = setTimeout(() => setVis(true), 20);
    return () => clearTimeout(t);
  }, [nodeId]);

  if (!data) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        maxHeight: "74vh",
        transform: vis ? "translateY(0)" : "translateY(105%)",
        transition: "transform 0.44s cubic-bezier(0.22,1,0.36,1)",
        borderRadius: "24px 24px 0 0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: `0 -8px 60px ${data.color}18, 0 -2px 0 ${data.color}44`,
      }}
    >
      {/* Top colour line */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg,transparent 0%,${data.color} 40%,${data.color} 60%,transparent 100%)`,
          flexShrink: 0,
        }}
      />

      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          background: `linear-gradient(160deg,${data.color}26 0%,rgba(5,5,18,0.97) 52%)`,
          backdropFilter: "blur(32px)",
          padding: "12px 20px 16px",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 5,
              borderRadius: 3,
              background: `${data.color}55`,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Spectral badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: `${data.color}18`,
                border: `1px solid ${data.color}33`,
                borderRadius: 20,
                padding: "3px 10px",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: data.color,
                  boxShadow: `0 0 6px ${data.color}`,
                }}
              />
              <span
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 9,
                  color: data.color,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                {data.spectralClass}
              </span>
            </div>

            <h2
              style={{
                margin: 0,
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: 28,
                color: "#fff",
                textShadow: `0 0 32px ${data.color}aa`,
                letterSpacing: "0.02em",
                lineHeight: 1.1,
              }}
            >
              {data.title}
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                fontFamily: "'Space Mono',monospace",
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
              }}
            >
              {data.subtitle}
            </p>
          </div>

          {/* Close — large tap target */}
          <button
            onClick={onClose}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              flexShrink: 0,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          overflowY: "auto",
          flexGrow: 1,
          background: "rgba(4,4,16,0.96)",
          backdropFilter: "blur(28px)",
          WebkitOverflowScrolling: "touch" as const,
          paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
        }}
      >
        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            padding: "16px 20px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            gap: 4,
          }}
        >
          {[
            ["DIST", data.distance],
            ["MAG", data.magnitude],
            ["TEMP", data.temp],
            ["TYPE", data.spectralClass.split("-")[0]],
          ].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 8,
                  color: "rgba(255,255,255,0.28)",
                  letterSpacing: "0.14em",
                  marginBottom: 6,
                  textTransform: "uppercase",
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 13,
                  color: data.color,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div
          style={{
            padding: "18px 22px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "'Space Mono',monospace",
              fontSize: 12,
              lineHeight: 2.05,
              color: "rgba(255,255,255,0.52)",
              letterSpacing: "0.01em",
            }}
          >
            {data.description}
          </p>
        </div>

        {/* Concepts */}
        <div style={{ padding: "16px 22px 0" }}>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 8,
              color: "rgba(255,255,255,0.22)",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            KEY CONCEPTS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.concepts.map((concept) => (
              <span
                key={concept}
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 11,
                  color: data.color,
                  background: `${data.color}14`,
                  border: `1px solid ${data.color}30`,
                  borderRadius: 8,
                  padding: "7px 13px",
                  letterSpacing: "0.07em",
                }}
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DESKTOP DETAIL PANEL ─────────────────────────────────────────────────────
interface DesktopDetailPanelProps {
  nodeId: keyof typeof DOMAIN_DATA;
  onClose: () => void;
}
function DesktopDetailPanel({ nodeId, onClose }: DesktopDetailPanelProps) {
  const [vis, setVis] = useState(false);
  const data = DOMAIN_DATA[nodeId];
  useEffect(() => {
    const t = setTimeout(() => setVis(true), 30);
    return () => clearTimeout(t);
  }, [nodeId]);
  if (!data) return null;

  return (
    <div
      style={{
        position: "absolute",
        right: 18,
        top: "50%",
        transform: vis
          ? "translateY(-50%) translateX(0)"
          : "translateY(-50%) translateX(40px)",
        opacity: vis ? 1 : 0,
        transition: "all 0.42s cubic-bezier(0.22,1,0.36,1)",
        zIndex: 20,
        width: 320,
      }}
    >
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg,transparent,${data.color},transparent)`,
        }}
      />
      <div
        style={{
          background: `linear-gradient(135deg,${data.color}18,rgba(4,4,14,0.95))`,
          borderRight: `1px solid ${data.color}33`,
          borderBottom: `1px solid ${data.color}33`,
          borderLeft: `1px solid ${data.color}33`,
          backdropFilter: "blur(24px)",
          padding: "14px 18px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 8,
              color: data.color,
              letterSpacing: "0.24em",
              marginBottom: 6,
              textTransform: "uppercase",
            }}
          >
            ✦ {data.spectralClass.toUpperCase()}
          </div>
          <h2
            style={{
              margin: 0,
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: 22,
              color: "#fff",
              textShadow: `0 0 24px ${data.color}99`,
              letterSpacing: "0.03em",
            }}
          >
            {data.title}
          </h2>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 9,
              color: "rgba(255,255,255,0.36)",
              marginTop: 4,
              letterSpacing: "0.1em",
            }}
          >
            {data.subtitle}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            color: "rgba(255,255,255,0.4)",
            width: 28,
            height: 28,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
      <div
        style={{
          background: "rgba(4,4,14,0.92)",
          backdropFilter: "blur(24px)",
          borderLeft: `1px solid ${data.color}33`,
          borderRight: `1px solid ${data.color}33`,
          padding: "10px 18px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {[
          ["Dist", data.distance],
          ["Mag", data.magnitude],
          ["Temp", data.temp],
          ["Class", data.spectralClass.split("-")[0]],
        ].map(([l, v]) => (
          <div key={l} style={{ textAlign: "center", padding: "3px 0" }}>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 7,
                color: "rgba(255,255,255,0.24)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {l}
            </div>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 11,
                color: data.color,
                fontWeight: 700,
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          background: "rgba(4,4,14,0.92)",
          backdropFilter: "blur(24px)",
          borderLeft: `1px solid ${data.color}33`,
          borderRight: `1px solid ${data.color}33`,
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.03)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'Space Mono',monospace",
            fontSize: 10,
            lineHeight: 1.95,
            color: "rgba(255,255,255,0.48)",
            letterSpacing: "0.02em",
          }}
        >
          {data.description}
        </p>
      </div>
      <div
        style={{
          background: "rgba(4,4,14,0.92)",
          backdropFilter: "blur(24px)",
          borderLeft: `1px solid ${data.color}33`,
          borderRight: `1px solid ${data.color}33`,
          borderBottom: `1px solid ${data.color}44`,
          borderRadius: "0 0 6px 6px",
          padding: "12px 18px 16px",
        }}
      >
        <div
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 7,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          KEY CONCEPTS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {data.concepts.map((c) => (
            <span
              key={c}
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 9,
                color: data.color,
                background: `${data.color}12`,
                border: `1px solid ${data.color}2a`,
                borderRadius: 3,
                padding: "3px 8px",
                letterSpacing: "0.08em",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg,transparent,${data.color}55,transparent)`,
        }}
      />
    </div>
  );
}

// ─── MOBILE STAR DOCK ─────────────────────────────────────────────────────────
// Horizontally scrollable pill dock at the bottom.
// Hides (opacity 0, pointer-events none) while the detail sheet is open so it
// doesn't peek out from behind. Safe-area inset keeps it off the home bar.
interface MobileStarDockProps {
  nodes: StarNode[];
  selectedId: keyof typeof DOMAIN_DATA | null;
  onSelect: (id: keyof typeof DOMAIN_DATA, position: THREE.Vector3) => void;
  panelOpen: boolean;
}
function MobileStarDock({ nodes, selectedId, onSelect, panelOpen }: MobileStarDockProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 16,
        paddingBottom: "calc(14px + env(safe-area-inset-bottom))",
        paddingTop: 10,
        paddingLeft: 12,
        paddingRight: 12,
        background: "linear-gradient(transparent,rgba(0,0,8,0.90) 36%)",
        opacity: panelOpen ? 0 : 1,
        pointerEvents: panelOpen ? "none" : "auto",
        transition: "opacity 0.25s ease",
      }}
    >
      <div
        className="dock-scroll"
        style={{
          display: "flex",
          gap: 7,
          overflowX: "auto",
          scrollbarWidth: "none" as React.CSSProperties["scrollbarWidth"],
          WebkitOverflowScrolling: "touch" as const,
          paddingBottom: 2, // tiny buffer so box-shadows aren't clipped
        }}
      >
        {nodes.map((node) => {
          const data = DOMAIN_DATA[node.id];
          const isSel = selectedId === node.id;
          return (
            <button
              key={node.id}
              onClick={() => onSelect(node.id, node.position)}
              style={{
                flexShrink: 0,
                background: isSel ? `${node.color}1e` : "rgba(8,8,24,0.86)",
                border: `1px solid ${isSel ? node.color + "88" : "rgba(255,255,255,0.09)"}`,
                borderRadius: 14,
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 9,
                cursor: "pointer",
                backdropFilter: "blur(20px)",
                boxShadow: isSel
                  ? `0 0 22px ${node.color}2a, 0 2px 14px rgba(0,0,0,0.45), inset 0 1px 0 ${node.color}22`
                  : "0 2px 10px rgba(0,0,0,0.35)",
                transition: "all 0.22s ease",
                outline: "none",
                minHeight: 46, // iOS 44 pt minimum touch target
              }}
            >
              {/* Star dot */}
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: `radial-gradient(circle,#fff 0%,${node.color} 45%,transparent 100%)`,
                  boxShadow: `0 0 9px 2px ${node.color}66`,
                }}
              />
              <span
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: isSel ? node.color : "rgba(255,255,255,0.78)",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {data.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DESKTOP STAR CATALOG ─────────────────────────────────────────────────────
interface DesktopStarCatalogProps {
  nodes: StarNode[];
  selectedId: keyof typeof DOMAIN_DATA | null;
  onSelect: (id: keyof typeof DOMAIN_DATA, position: THREE.Vector3) => void;
}
function DesktopStarCatalog({ nodes, selectedId, onSelect }: DesktopStarCatalogProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: 18,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 15,
        display: "flex",
        flexDirection: "column",
        gap: 7,
      }}
    >
      {nodes.map((node, i) => {
        const data = DOMAIN_DATA[node.id];
        const isSel = selectedId === node.id;
        return (
          <button
            key={node.id}
            onClick={() => onSelect(node.id, node.position)}
            style={{
              background: isSel ? `${node.color}1c` : "rgba(4,4,14,0.78)",
              borderTop: `1px solid ${isSel ? node.color + "aa" : "rgba(255,255,255,0.07)"}`,
              borderRight: `1px solid ${isSel ? node.color + "aa" : "rgba(255,255,255,0.07)"}`,
              borderBottom: `1px solid ${isSel ? node.color + "aa" : "rgba(255,255,255,0.07)"}`,
              borderLeft: `3px solid ${isSel ? node.color : "rgba(255,255,255,0.1)"}`,
              borderRadius: 5,
              padding: "10px 14px",
              cursor: "pointer",
              backdropFilter: "blur(16px)",
              display: "flex",
              alignItems: "center",
              gap: 11,
              transition: "all 0.22s ease",
              minWidth: 208,
              outline: "none",
              animation: `fadeInLeft 0.45s ease ${i * 0.09}s both`,
              boxShadow: isSel ? `0 0 18px ${node.color}1e` : "none",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 14,
                height: 14,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: `radial-gradient(circle,#fff 0%,${node.color} 42%,${node.color}00 100%)`,
                  boxShadow: `0 0 9px 2px ${node.color}88`,
                }}
              />
            </div>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.13em",
                  color: isSel ? node.color : "rgba(255,255,255,0.82)",
                  textTransform: "uppercase",
                }}
              >
                {data.title}
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 8,
                  color: "rgba(255,255,255,0.25)",
                  marginTop: 2,
                  letterSpacing: "0.09em",
                }}
              >
                {data.spectralClass.split(" ")[0]} · {data.distance}
              </div>
            </div>
            {isSel && (
              <div
                style={{
                  marginLeft: "auto",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: node.color,
                  boxShadow: `0 0 6px ${node.color}`,
                  animation: "blink 1.5s infinite",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
function TopBar({ isMobile }: { isMobile: boolean }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  const ts = `${p(time.getUTCHours())}:${p(time.getUTCMinutes())}:${p(time.getUTCSeconds())} UTC`;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: isMobile ? "14px 16px" : "14px 24px",
        paddingTop: isMobile ? "calc(14px + env(safe-area-inset-top))" : "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(rgba(0,0,4,0.85) 0%,transparent 100%)",
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#4fffaa",
            boxShadow: "0 0 8px #4fffaa",
            animation: "blink 2s ease infinite",
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: isMobile ? 11 : 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.12em",
            }}
          >
            MILKY WAY SIM
          </div>
          {!isMobile && (
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 8,
                color: "rgba(255,255,255,0.24)",
                letterSpacing: "0.13em",
                marginTop: 2,
              }}
            >
              {TOTAL_PARTICLES.toLocaleString()} PARTICLES · 5-ARM SPIRAL · 7
              DOMAINS
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: isMobile ? 9 : 10,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.14em",
          }}
        >
          {ts}
        </div>
        {!isMobile && (
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 8,
              color: "rgba(255,255,255,0.14)",
              letterSpacing: "0.11em",
              marginTop: 2,
            }}
          >
            OBSERVATORY MODE
          </div>
        )}
      </div>
    </div>
  );
}

function BottomHints() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(transparent,rgba(0,0,4,0.65) 100%)",
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", gap: 20 }}>
        {[
          ["DRAG", "Rotate"],
          ["SCROLL", "Zoom"],
          ["CLICK", "Navigate"],
        ].map(([k, d]) => (
          <div
            key={k}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 8,
                color: "rgba(255,255,255,0.45)",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 3,
                padding: "2px 6px",
                letterSpacing: "0.12em",
              }}
            >
              {k}
            </span>
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 8,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.08em",
              }}
            >
              {d}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: 8,
          color: "rgba(255,255,255,0.14)",
          letterSpacing: "0.1em",
        }}
      >
        Ω={PARAMETERS.spin} · ε={PARAMETERS.randomness} · n=
        {PARAMETERS.branches}
      </div>
    </div>
  );
}

// ─── TRAVEL NOTIFICATION ──────────────────────────────────────────────────────
interface TravelNotifProps {
  traveling: boolean;
  destination: keyof typeof DOMAIN_DATA | null;
  isMobile: boolean;
}
function TravelNotif({ traveling, destination, isMobile }: TravelNotifProps) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (traveling) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(t);
    }
  }, [traveling]);

  const data = destination ? DOMAIN_DATA[destination] : null;
  if (!show || !data) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 25,
        textAlign: "center",
        pointerEvents: "none",
        animation: "fadeOut 3s ease forwards",
      }}
    >
      <div
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: 8,
          color: data.color,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          marginBottom: 10,
          opacity: 0.8,
        }}
      >
        NAVIGATING TO
      </div>
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 800,
          fontSize: isMobile ? 26 : 30,
          color: "#fff",
          textShadow: `0 0 40px ${data.color},0 0 80px ${data.color}55`,
          letterSpacing: "0.06em",
        }}
      >
        {data.title}
      </div>
      <div
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: 8,
          color: "rgba(255,255,255,0.28)",
          letterSpacing: "0.18em",
          marginTop: 8,
        }}
      >
        {data.spectralClass.toUpperCase()} · {data.temp}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function GalaxyScene() {
  const [selectedId, setSelectedId] = useState<keyof typeof DOMAIN_DATA | null>(null);
  const [travelTarget, setTravelTarget] = useState<THREE.Vector3 | null>(null);
  const [traveling, setTraveling] = useState(false);
  const isMobile = useIsMobile();

  const handleSelect = useCallback((id: keyof typeof DOMAIN_DATA, position: THREE.Vector3) => {
    setSelectedId(id);
    setTravelTarget(position);
    setTraveling(true);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
    setTravelTarget(null);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000002",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        html,body{margin:0;overscroll-behavior:none;touch-action:none}
        @keyframes fadeInLeft{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes fadeOut{0%{opacity:0}8%{opacity:1}75%{opacity:1}100%{opacity:0}}
        button{outline:none;-webkit-appearance:none;border:none;background:none;padding:0;font:inherit}
        button:active{filter:brightness(1.35)}
        .dock-scroll::-webkit-scrollbar{display:none}
      `}</style>

      <Canvas
        camera={{
          position: [80, 55, 150],
          fov: isMobile ? 68 : 58,
          near: 0.5,
          far: 900,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.72,
        }}
        dpr={[1, isMobile ? 1.5 : 2]}
        onPointerMissed={() => {
          setSelectedId(null);
          setTravelTarget(null);
        }}
        style={{ position: "absolute", inset: 0, touchAction: "none" }}
      >
        <color attach="background" args={["#000002"]} />
        <ambientLight intensity={0.03} />
        <NebulaCloud />
        <SpiralGalaxy />

        {SPECIAL_NODES.map((node) => (
          <SpecialStar
            key={node.id}
            {...node}
            onClick={handleSelect}
            isSelected={selectedId === node.id}
          />
        ))}

        <Stars
          radius={340}
          depth={90}
          count={isMobile ? 3000 : 6000}
          factor={4.5}
          saturation={0.1}
          fade
          speed={0.35}
        />

        <CameraRig
          targetPosition={travelTarget}
          onArrived={() => setTraveling(false)}
          onInterrupt={() => {
            setTravelTarget(null);
            setTraveling(false);
          }}
        />

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.01}
            luminanceSmoothing={0.88}
            intensity={isMobile ? 1.1 : 1.4}
            radius={0.88}
          />
        </EffectComposer>
      </Canvas>

      <Scanlines />
      <CornerDecor pos="tl" />
      <CornerDecor pos="tr" />
      <CornerDecor pos="bl" />
      <CornerDecor pos="br" />

      <TopBar isMobile={isMobile} />

      {/* ── Desktop layout ── */}
      {!isMobile && <BottomHints />}
      {!isMobile && (
        <DesktopStarCatalog
          nodes={SPECIAL_NODES}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      )}
      {!isMobile && selectedId && (
        <DesktopDetailPanel nodeId={selectedId} onClose={handleClose} />
      )}

      {/* ── Mobile layout ── */}
      {isMobile && (
        <MobileStarDock
          nodes={SPECIAL_NODES}
          selectedId={selectedId}
          onSelect={handleSelect}
          panelOpen={!!selectedId}
        />
      )}
      {isMobile && selectedId && (
        <MobileDetailSheet nodeId={selectedId} onClose={handleClose} />
      )}

      <TravelNotif
        traveling={traveling}
        destination={selectedId}
        isMobile={isMobile}
      />
    </div>
  );
}
