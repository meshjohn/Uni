"use client";

import * as React from "react";
import {
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

type ViewMode = "orbit" | "top" | "focus";

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

type DomainId = keyof typeof DOMAIN_DATA;

interface StarNode {
  id: DomainId;
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

const DOMAIN_IDS = SPECIAL_NODES.map((n) => n.id);

// ─── TEXTURES ─────────────────────────────────────────────────────────────────
const textureCache = new Map();

function getStarTexture(type: string) {
  if (textureCache.has(type)) return textureCache.get(type);
  const SIZE = 512,
    c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d")!,
    cx = SIZE / 2,
    cy = SIZE / 2;
  if (type === "blue_giant") {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, SIZE / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.03, "rgba(235,248,255,1)");
    g.addColorStop(0.09, "rgba(140,210,255,0.92)");
    g.addColorStop(0.2, "rgba(70,140,255,0.55)");
    g.addColorStop(0.45, "rgba(30,70,220,0.18)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      for (let w = -1.5; w <= 1.5; w += 0.75) {
        const wa = a + w * 0.025,
          lg = ctx.createLinearGradient(
            cx,
            cy,
            cx + Math.cos(wa) * 250,
            cy + Math.sin(wa) * 250,
          );
        lg.addColorStop(0, "rgba(180,220,255,0.6)");
        lg.addColorStop(0.3, "rgba(100,180,255,0.2)");
        lg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(wa) * 250, cy + Math.sin(wa) * 250);
        ctx.stroke();
      }
    }
  } else if (type === "white_star") {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, SIZE / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.05, "rgba(245,248,255,0.98)");
    g.addColorStop(0.14, "rgba(210,225,255,0.7)");
    g.addColorStop(0.3, "rgba(180,205,255,0.25)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI;
      [-1, 0, 1].forEach((w) => {
        const wa = a + w * 0.03,
          lg = ctx.createLinearGradient(
            cx,
            cy,
            cx + Math.cos(wa) * 256,
            cy + Math.sin(wa) * 256,
          );
        lg.addColorStop(0, "rgba(255,255,255,0.7)");
        lg.addColorStop(0.2, "rgba(200,220,255,0.25)");
        lg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.strokeStyle = lg;
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
    const g = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, SIZE / 2);
    g.addColorStop(0, "rgba(255,255,230,1)");
    g.addColorStop(0.04, "rgba(255,248,180,1)");
    g.addColorStop(0.1, "rgba(255,210,80,0.95)");
    g.addColorStop(0.22, "rgba(255,160,30,0.65)");
    g.addColorStop(0.42, "rgba(220,90,10,0.28)");
    g.addColorStop(0.7, "rgba(160,40,5,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2,
        r = 72 + (i % 3) * 30,
        lg = ctx.createLinearGradient(
          cx,
          cy,
          cx + Math.cos(a) * r,
          cy + Math.sin(a) * r,
        );
      lg.addColorStop(0, "rgba(255,190,40,0.4)");
      lg.addColorStop(0.6, "rgba(255,100,10,0.12)");
      lg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.strokeStyle = lg;
      ctx.lineWidth = 3 + (i % 4) * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }
  } else {
    const g = ctx.createRadialGradient(cx + 10, cy - 5, 0, cx, cy, SIZE / 2);
    g.addColorStop(0, "rgba(255,240,200,1)");
    g.addColorStop(0.03, "rgba(255,180,100,1)");
    g.addColorStop(0.09, "rgba(255,100,40,0.9)");
    g.addColorStop(0.2, "rgba(210,50,15,0.55)");
    g.addColorStop(0.42, "rgba(160,20,5,0.22)");
    g.addColorStop(0.7, "rgba(100,10,2,0.06)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2,
        r = 100 + (i % 3) * 40,
        lg = ctx.createLinearGradient(
          cx,
          cy,
          cx + Math.cos(a) * r,
          cy + Math.sin(a) * r,
        );
      lg.addColorStop(0, "rgba(255,100,30,0.35)");
      lg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.strokeStyle = lg;
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
  const SIZE = 512,
    c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d")!;
  const cols: Record<string, string[]> = {
    blue_giant: ["#0a1a4a", "#1a3080", "#0a60cc", "#60aaff"],
    white_star: ["#c8d8f0", "#dde8ff", "#e8f0ff", "#ffffff"],
    sun_like: ["#8b3000", "#cc6600", "#ff9900", "#ffcc44"],
    red_giant: ["#4a0800", "#8b1500", "#cc3300", "#ff6622"],
  };
  const [c1, , c3, c4] = cols[type] || cols.sun_like;
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * SIZE,
      y = Math.random() * SIZE,
      r = 2 + Math.random() * 18,
      g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, (Math.random() > 0.5 ? c4 : c1) + "55");
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * SIZE,
      y = Math.random() * SIZE,
      r = 8 + Math.random() * 35;
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
  const ctx = c.getContext("2d")!,
    g = ctx.createLinearGradient(0, 0, 512, 0);
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

// ─── NEBULA ───────────────────────────────────────────────────────────────────
function NebulaCloud() {
  const meshes = useMemo(() => {
    const cl = [],
      cs = ["#1a0533", "#001830", "#0a0020", "#200010", "#001520"];
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2 + 0.4,
        r = 55 + Math.random() * 85;
      cl.push({
        x: Math.cos(a) * r * (0.8 + Math.random() * 0.5),
        y: (Math.random() - 0.5) * 18,
        z: Math.sin(a) * r * (0.8 + Math.random() * 0.5),
        scale: 35 + Math.random() * 65,
        color: cs[i % cs.length],
        opacity: 0.04 + Math.random() * 0.08,
      });
    }
    return cl;
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

// ─── SPECIAL STAR ─────────────────────────────────────────────────────────────
interface SpecialStarProps {
  id: DomainId;
  position: THREE.Vector3;
  color: string;
  onClick: (id: DomainId, position: THREE.Vector3) => void;
  isSelected: boolean;
  key?: React.Key;
}

function SpecialStar({
  id,
  position,
  color,
  onClick,
  isSelected,
}: SpecialStarProps) {
  const data = DOMAIN_DATA[id];
  const [hovered, setHovered] = useState(false);
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null); // ← scaled on mobile focus
  const coreRef = useRef<THREE.Mesh>(null);
  const glowSpr = useRef<THREE.Sprite>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);

  const starTex = useMemo(() => getStarTexture(data.type), [data.type]);
  const surfTex = useMemo(() => getSurfaceTexture(data.type), [data.type]);
  const ringTex = useMemo(() => getRingTexture(), []);
  const threeColor = useMemo(() => new THREE.Color(color), [color]);
  const emissiveColor = useMemo(
    () => new THREE.Color(data.emissive),
    [data.emissive],
  );

  const R = data.radius,
    hasRing = data.type === "red_giant",
    hasMoon = data.type === "sun_like";
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // ── MOBILE FOCUS SCALE ──────────────────────────────────────────────────
    // On mobile when this star is selected the camera flies close, which makes
    // the star fill the screen.  We scale the visual group down smoothly as the
    // camera approaches so the planet always looks like a distant sun you're
    // orbiting — not a wall of light.
    // Range: full size at ≥ 60 world-units, 0.32× at ≤ 18 world-units.
    if (groupRef.current) {
      if (isMobile && isSelected) {
        const dist = camera.position.distanceTo(position);
        const t01 = Math.min(1, Math.max(0, (dist - 18) / 42)); // [18,60] → [0,1]
        groupRef.current.scale.setScalar(0.32 + t01 * 0.68);
      } else {
        groupRef.current.scale.setScalar(1);
      }
    }

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
      (coronaRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.18 + 0.06 * Math.sin(t * 1.1);
    }
    if (ringRef.current)
      ringRef.current.rotation.x = Math.PI * 0.42 + Math.sin(t * 0.18) * 0.04;
    if (orbitRef.current) orbitRef.current.rotation.y = t * 0.11;
  });

  const active = hovered || isSelected;
  return (
    <group position={position}>
      {/* inner group is what gets scaled */}
      <group ref={groupRef}>
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
            {[1.6, 1.9, 2.25, 2.6].map((ri, i) => (
              <mesh key={i}>
                <ringGeometry args={[R * ri, R * (ri + 0.22), 120]} />
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
      </group>

      {/* Label sits outside groupRef so its screen size stays constant */}
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
            transition: "opacity 0.35s ease,transform 0.35s ease",
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

// ─── GALAXY BUILDER ───────────────────────────────────────────────────────────
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
  const pos = new Float32Array(count * 3),
    cols = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3,
      r = Math.pow(rng(), 0.55) * PARAMETERS.radius * radiusScale;
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
    const t = r / (PARAMETERS.radius * radiusScale),
      roll = rng();
    let col = new THREE.Color();
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

function SpiralGalaxy() {
  const lRefs = useRef<Array<{ current: THREE.Points<any, any> | null }>>(
    GALAXY_LAYERS.map(() => ({ current: null })),
  );
  const dustRef = useRef<THREE.Points<any, any>>(null),
    coreRef = useRef<THREE.Points<any, any>>(null);
  const ld = useMemo(() => GALAXY_LAYERS.map((c) => buildGalaxyLayer(c)), []);
  const { dustPos, dustCol } = useMemo(() => {
    const D = 22000,
      dp = new Float32Array(D * 3),
      dc = new Float32Array(D * 3);
    for (let i = 0; i < D; i++) {
      const i3 = i * 3,
        r = 10 + Math.random() * PARAMETERS.radius * 0.9,
        a =
          r * PARAMETERS.spin +
          (((i % PARAMETERS.branches) + 0.5) / PARAMETERS.branches) *
            Math.PI *
            2,
        sp = r * 0.07;
      dp[i3] = Math.cos(a) * r + (Math.random() - 0.5) * sp;
      dp[i3 + 1] = (Math.random() - 0.5) * 2;
      dp[i3 + 2] = Math.sin(a) * r + (Math.random() - 0.5) * sp;
      const dc2 = new THREE.Color("#1a0800").lerp(
        new THREE.Color("#080200"),
        r / PARAMETERS.radius,
      );
      dc[i3] = dc2.r;
      dc[i3 + 1] = dc2.g;
      dc[i3 + 2] = dc2.b;
    }
    return { dustPos: dp, dustCol: dc };
  }, []);
  const { corePos, coreCols } = useMemo(() => {
    const CN = 10000,
      cp = new Float32Array(CN * 3),
      cc = new Float32Array(CN * 3);
    for (let i = 0; i < CN; i++) {
      const ph = Math.acos(2 * Math.random() - 1),
        th = Math.random() * Math.PI * 2,
        r = Math.pow(Math.random(), 2.2) * 9;
      cp[i * 3] = Math.sin(ph) * Math.cos(th) * r;
      cp[i * 3 + 1] = Math.cos(ph) * r * 0.45;
      cp[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r;
      const w = new THREE.Color().setHSL(0.09, 0.5, 0.7 + Math.random() * 0.3);
      cc[i * 3] = w.r;
      cc[i * 3 + 1] = w.g;
      cc[i * 3 + 2] = w.b;
    }
    return { corePos: cp, coreCols: cc };
  }, []);
  useFrame((_, d) => {
    GALAXY_LAYERS.forEach((c, i) => {
      const r = lRefs.current[i]?.current;
      if (r) r.rotation.y += d * c.speed;
    });
    if (dustRef.current) dustRef.current.rotation.y += d * 0.013;
    if (coreRef.current) coreRef.current.rotation.y += d * 0.01;
  });
  return (
    <>
      {GALAXY_LAYERS.map((c, i) => (
        <points
          key={i}
          ref={(el) => {
            lRefs.current[i].current = el;
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[ld[i].pos, 3]}
            />
            <bufferAttribute attach="attributes-color" args={[ld[i].cols, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={c.size}
            sizeAttenuation
            depthWrite={false}
            vertexColors
            blending={THREE.AdditiveBlending}
            transparent
            opacity={c.opacity}
          />
        </points>
      ))}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPos, 3]} />
          <bufferAttribute attach="attributes-color" args={[dustCol, 3]} />
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
          <bufferAttribute attach="attributes-position" args={[corePos, 3]} />
          <bufferAttribute attach="attributes-color" args={[coreCols, 3]} />
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
  viewMode: ViewMode;
  focusTarget: THREE.Vector3 | null;
  onArrived: () => void;
  onInterrupt: () => void;
  resetSignal: number;
  zoomDelta: number;
  onZoomConsumed: () => void;
  isMobile: boolean;
}
function CameraRig({
  targetPosition,
  viewMode,
  focusTarget,
  onArrived,
  onInterrupt,
  resetSignal,
  zoomDelta,
  onZoomConsumed,
  isMobile,
}: CameraRigProps) {
  const { camera } = useThree();
  const ctrlRef = useRef<OrbitControlsImpl>(null);
  const arriving = useRef(false);
  const vmRef = useRef<ViewMode>(viewMode);

  useEffect(() => {
    if (targetPosition) arriving.current = true;
  }, [targetPosition]);
  useEffect(() => {
    vmRef.current = viewMode;
    if (!ctrlRef.current) return;
    const c = ctrlRef.current;
    if (viewMode === "top") {
      arriving.current = false;
      camera.position.set(0, 280, 1);
      c.target.set(0, 0, 0);
      c.minPolarAngle = 0;
      c.maxPolarAngle = Math.PI * 0.2;
      c.update();
    } else if (viewMode === "orbit") {
      c.minPolarAngle = 0;
      c.maxPolarAngle = Math.PI;
      if (vmRef.current === "top") {
        camera.position.set(80, 55, 150);
        c.target.set(0, 0, 0);
        c.update();
      }
    } else if (viewMode === "focus") {
      c.minPolarAngle = 0;
      c.maxPolarAngle = Math.PI;
      if (focusTarget) {
        c.target.copy(focusTarget);
        c.update();
      }
    }
  }, [viewMode, camera, focusTarget]);
  useEffect(() => {
    if (viewMode === "focus" && focusTarget && ctrlRef.current) {
      ctrlRef.current.target.lerp(focusTarget, 0.08);
      ctrlRef.current.update();
    }
  }, [focusTarget, viewMode]);
  useEffect(() => {
    if (!resetSignal) return;
    arriving.current = false;
    camera.position.set(80, 55, 150);
    if (ctrlRef.current) {
      ctrlRef.current.target.set(0, 0, 0);
      ctrlRef.current.minPolarAngle = 0;
      ctrlRef.current.maxPolarAngle = Math.PI;
      ctrlRef.current.update();
    }
  }, [resetSignal, camera]);
  useEffect(() => {
    if (!zoomDelta) return;
    const t = ctrlRef.current?.target ?? new THREE.Vector3();
    const d = new THREE.Vector3().subVectors(camera.position, t).normalize();
    camera.position.addScaledVector(d, zoomDelta * 20);
    onZoomConsumed();
  }, [zoomDelta, camera, onZoomConsumed]);
  useFrame((_, delta) => {
    if (targetPosition && arriving.current && ctrlRef.current) {
      // On mobile the bottom sheet covers ~78 vh, so we push the camera higher
      // (larger Y) and slightly closer (smaller Z) so the star appears in the
      // upper half of the screen above the info card.
      const des = targetPosition
        .clone()
        .add(
          isMobile
            ? new THREE.Vector3(4, 38, 18)
            : new THREE.Vector3(10, 6, 22),
        );
      camera.position.lerp(des, 3.5 * delta);
      ctrlRef.current.target.lerp(targetPosition, 3.5 * delta);
      ctrlRef.current.update();
      if (camera.position.distanceTo(des) < 0.4) {
        arriving.current = false;
        onArrived();
        if (vmRef.current === "focus" && ctrlRef.current) {
          ctrlRef.current.target.copy(targetPosition);
          ctrlRef.current.update();
        }
      }
    }
  });
  return (
    <OrbitControls
      ref={ctrlRef}
      enablePan={viewMode !== "focus"}
      enableZoom
      minDistance={5}
      maxDistance={420}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      onStart={() => {
        if (vmRef.current === "orbit" || vmRef.current === "focus") {
          arriving.current = false;
          onInterrupt();
        }
      }}
    />
  );
}

// ─── CORNER DECORATIONS ───────────────────────────────────────────────────────
// NOTE: Scanlines component has been removed — it was the source of the
// "high sharpness" banding artifact (repeating-linear-gradient overlay).
type CornerPos = "tl" | "tr" | "bl" | "br";
function CornerDecor({ pos }: { pos: CornerPos; key?: React.Key }) {
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

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
interface TopBarProps {
  isMobile: boolean;
  viewMode: ViewMode;
  onViewMode: (m: ViewMode) => void;
  hasSelection: boolean;
}
function TopBar({ isMobile, viewMode, onViewMode, hasSelection }: TopBarProps) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  const ts = `${p(time.getUTCHours())}:${p(time.getUTCMinutes())}:${p(time.getUTCSeconds())}`;
  const modes = [
    {
      key: "orbit" as ViewMode,
      label: "ORBIT",
      icon: "⊙",
      tip: "Free rotation",
    },
    {
      key: "top" as ViewMode,
      label: "TOP",
      icon: "⊕",
      tip: "Top-down map view",
    },
    {
      key: "focus" as ViewMode,
      label: "FOCUS",
      icon: "◎",
      tip: "Lock orbit on selected star",
      disabled: !hasSelection,
    },
  ];
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: isMobile ? "11px 14px" : "10px 20px",
        paddingTop: isMobile ? "calc(11px + env(safe-area-inset-top))" : "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(rgba(0,0,4,0.9) 0%,transparent 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 3,
            height: 22,
            borderRadius: 2,
            background: "#4fffaa",
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: isMobile ? 11 : 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "0.16em",
            }}
          >
            MILKY WAY
          </div>
          {!isMobile && (
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 7.5,
                color: "#4fffaa",
                letterSpacing: "0.18em",
                marginTop: 2,
                opacity: 0.7,
              }}
            >
              OBSERVATORY
            </div>
          )}
        </div>
        {!isMobile && (
          <div
            style={{
              marginLeft: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: "3px 10px",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#4fffaa",
                boxShadow: "0 0 6px #4fffaa",
                animation: "blink 2s ease infinite",
              }}
            />
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 8,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.12em",
              }}
            >
              {TOTAL_PARTICLES.toLocaleString()} LIVE
            </span>
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        {modes.map(({ key, label, icon, tip, disabled }) => {
          const isA = viewMode === key;
          return (
            <button
              key={key}
              onClick={() => !disabled && onViewMode(key)}
              title={tip}
              style={{
                padding: isMobile ? "5px 10px" : "6px 14px",
                fontFamily: "'Space Mono',monospace",
                fontSize: isMobile ? 8 : 8.5,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: disabled
                  ? "rgba(255,255,255,0.18)"
                  : isA
                    ? "#fff"
                    : "rgba(255,255,255,0.38)",
                background: isA ? "rgba(255,255,255,0.13)" : "transparent",
                border: "none",
                borderRight: "1px solid rgba(255,255,255,0.07)",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.18s ease",
                outline: "none",
                display: "flex",
                alignItems: "center",
                gap: 5,
                opacity: disabled ? 0.45 : 1,
              }}
            >
              {isA && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#4fffaa",
                    boxShadow: "0 0 6px #4fffaa",
                    flexShrink: 0,
                  }}
                />
              )}
              {!isA && <span style={{ opacity: 0.5 }}>{icon}</span>}
              {!isMobile && label}
              {isMobile && (isA ? label : icon)}
            </button>
          );
        })}
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: isMobile ? 9 : 10,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.14em",
          }}
        >
          {ts} UTC
        </div>
        {!isMobile && (
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 7.5,
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
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(transparent,rgba(0,0,4,0.65) 100%)",
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", gap: 18 }}>
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

// ─── MINI-MAP ─────────────────────────────────────────────────────────────────
interface MiniMapProps {
  selectedId: DomainId | null;
  onSelect: (id: DomainId, p: THREE.Vector3) => void;
}
function MiniMap({ selectedId, onSelect }: MiniMapProps) {
  const W = 120,
    H = 80,
    sc = 0.42,
    cx = W / 2,
    cy = H / 2;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 42,
        right: 18,
        zIndex: 15,
        width: W,
        borderRadius: 6,
        overflow: "hidden",
        background: "rgba(3,3,10,0.88)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          padding: "4px 8px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#4fffaa",
            boxShadow: "0 0 4px #4fffaa",
          }}
        />
        <span
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 7,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "1.5px",
          }}
        >
          GALAXY MAP
        </span>
      </div>
      <div style={{ position: "relative", width: W, height: H }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <ellipse
            cx={cx}
            cy={cy}
            rx={42}
            ry={14}
            fill="none"
            stroke="#ffe8c0"
            strokeWidth={0.4}
            strokeOpacity={0.25}
            strokeDasharray="2,3"
          />
          <ellipse
            cx={cx}
            cy={cy}
            rx={24}
            ry={8}
            fill="none"
            stroke="#ffe8c0"
            strokeWidth={0.4}
            strokeOpacity={0.18}
          />
          <circle cx={cx} cy={cy} r={3.5} fill="#ffe8c0" fillOpacity={0.35} />
          <circle cx={cx} cy={cy} r={1.5} fill="#fffde0" fillOpacity={0.7} />
          {SPECIAL_NODES.map((n) => {
            const mx = cx + n.position.x * sc,
              my = cy + n.position.z * sc,
              iS = selectedId === n.id;
            return (
              <g
                key={n.id}
                onClick={() => onSelect(n.id, n.position)}
                style={{ cursor: "pointer" }}
              >
                {iS && (
                  <circle
                    cx={mx}
                    cy={my}
                    r={6}
                    fill={n.color}
                    fillOpacity={0.15}
                  />
                )}
                <circle
                  cx={mx}
                  cy={my}
                  r={iS ? 3.5 : 2.5}
                  fill={n.color}
                  fillOpacity={iS ? 1 : 0.75}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── CAMERA CONTROLS ──────────────────────────────────────────────────────────
interface CameraControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}
function CameraControls({ onZoomIn, onZoomOut, onReset }: CameraControlsProps) {
  const b: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 5,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.15s",
  };
  return (
    <div
      style={{
        position: "absolute",
        bottom: 42,
        left: 18,
        zIndex: 15,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <button onClick={onZoomIn} style={b} title="Zoom in">
        +
      </button>
      <button onClick={onZoomOut} style={b} title="Zoom out">
        −
      </button>
      <button
        onClick={onReset}
        style={{ ...b, fontSize: 11 }}
        title="Reset camera"
      >
        ↺
      </button>
    </div>
  );
}

// ─── DESKTOP CATALOG ──────────────────────────────────────────────────────────
interface DesktopStarCatalogProps {
  nodes: StarNode[];
  selectedId: DomainId | null;
  onSelect: (id: DomainId, p: THREE.Vector3) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  search: string;
  onSearch: (v: string) => void;
}
function DesktopStarCatalog({
  nodes,
  selectedId,
  onSelect,
  collapsed,
  onToggleCollapse,
  search,
  onSearch,
}: DesktopStarCatalogProps) {
  const filtered = nodes.filter((n) =>
    DOMAIN_DATA[n.id].title.toLowerCase().includes(search.toLowerCase()),
  );
  if (collapsed)
    return (
      <button
        onClick={onToggleCollapse}
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 15,
          width: 32,
          height: 32,
          borderRadius: 6,
          background: "rgba(4,4,14,0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.55)",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        title="Expand catalog"
      >
        ≡
      </button>
    );
  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 15,
        width: 220,
        background: "rgba(4,4,12,0.82)",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 7.5,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.2em",
          }}
        >
          STAR CATALOG
        </span>
        <button
          onClick={onToggleCollapse}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            fontSize: 14,
            cursor: "pointer",
            padding: "0 2px",
            lineHeight: 1,
          }}
          title="Collapse"
        >
          ‹
        </button>
      </div>
      <div
        style={{
          padding: "7px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <input
          type="text"
          placeholder="/ search domains"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 5,
            padding: "5px 8px",
            fontFamily: "'Space Mono',monospace",
            fontSize: 8.5,
            color: "rgba(255,255,255,0.65)",
            outline: "none",
            letterSpacing: "0.05em",
          }}
        />
      </div>
      <div style={{ overflowY: "auto", maxHeight: 340 }}>
        {filtered.map((node, i) => {
          const data = DOMAIN_DATA[node.id],
            isSel = selectedId === node.id,
            barW = Math.min(
              100,
              (parseFloat(data.temp.replace(/,/g, "").replace(" K", "")) /
                45000) *
                100,
            );
          return (
            <button
              key={node.id}
              onClick={() => onSelect(node.id, node.position)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                background: isSel ? `${node.color}14` : "transparent",
                borderLeft: `2.5px solid ${isSel ? node.color : "transparent"}`,
                borderRight: "none",
                borderTop:
                  i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)",
                borderBottom: "none",
                cursor: "pointer",
                transition: "all 0.18s ease",
                outline: "none",
                animation: `fadeInLeft 0.4s ease ${i * 0.07}s both`,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: `radial-gradient(circle,#fff 0%,${node.color} 42%,${node.color}00 100%)`,
                  boxShadow: `0 0 7px 1.5px ${node.color}88`,
                }}
              />
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: isSel ? node.color : "rgba(255,255,255,0.82)",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {data.title}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 7,
                    color: "rgba(255,255,255,0.26)",
                    marginTop: 2,
                    letterSpacing: "0.08em",
                  }}
                >
                  {data.spectralClass.split(" ")[0]} · {data.distance}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    height: 2,
                    borderRadius: 1,
                    background: "rgba(255,255,255,0.07)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barW}%`,
                      borderRadius: 1,
                      background: node.color,
                      opacity: 0.6,
                    }}
                  />
                </div>
              </div>
              {isSel && (
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: node.color,
                    boxShadow: `0 0 6px ${node.color}`,
                    animation: "blink 1.5s infinite",
                    flexShrink: 0,
                  }}
                />
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div
            style={{
              padding: "14px 12px",
              fontFamily: "'Space Mono',monospace",
              fontSize: 8,
              color: "rgba(255,255,255,0.22)",
              textAlign: "center",
            }}
          >
            No matches
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DESKTOP DETAIL PANEL ─────────────────────────────────────────────────────
interface DesktopDetailPanelProps {
  nodeId: DomainId;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}
function DesktopDetailPanel({
  nodeId,
  onClose,
  onPrev,
  onNext,
}: DesktopDetailPanelProps) {
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
        width: 310,
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
          background: `linear-gradient(135deg,${data.color}18,rgba(4,4,14,0.96))`,
          borderRight: `1px solid ${data.color}33`,
          borderLeft: `1px solid ${data.color}33`,
          backdropFilter: "blur(24px)",
          padding: "12px 16px 10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: `${data.color}18`,
              border: `1px solid ${data.color}33`,
              borderRadius: 20,
              padding: "2px 9px",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: data.color,
                boxShadow: `0 0 5px ${data.color}`,
              }}
            />
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 7.5,
                color: data.color,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {data.spectralClass}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 4,
              color: "rgba(255,255,255,0.4)",
              width: 26,
              height: 26,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: 21,
              color: "#fff",
              textShadow: `0 0 24px ${data.color}99`,
              letterSpacing: "0.03em",
            }}
          >
            {data.title}
          </h2>
          <div
            style={{
              width: 1,
              height: 14,
              background: "rgba(255,255,255,0.15)",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 8.5,
              color: "rgba(255,255,255,0.38)",
              letterSpacing: "0.08em",
            }}
          >
            {data.subtitle}
          </div>
        </div>
      </div>
      <div
        style={{
          background: "rgba(4,4,14,0.94)",
          backdropFilter: "blur(24px)",
          borderLeft: `1px solid ${data.color}33`,
          borderRight: `1px solid ${data.color}33`,
          padding: "10px 16px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {[
          { label: "Distance", value: data.distance },
          { label: "Magnitude", value: data.magnitude },
          { label: "Temperature", value: data.temp },
          { label: "Class", value: data.spectralClass.split("-")[0] },
        ].map(({ label, value }) => (
          <div key={label}>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 6.5,
                color: "rgba(255,255,255,0.24)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 12,
                color: data.color,
                fontWeight: 700,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          background: "rgba(4,4,14,0.94)",
          backdropFilter: "blur(24px)",
          borderLeft: `1px solid ${data.color}33`,
          borderRight: `1px solid ${data.color}33`,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.03)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'Space Mono',monospace",
            fontSize: 9.5,
            lineHeight: 1.9,
            color: "rgba(255,255,255,0.58)",
            letterSpacing: "0.01em",
          }}
        >
          {data.description}
        </p>
      </div>
      <div
        style={{
          background: "rgba(4,4,14,0.94)",
          backdropFilter: "blur(24px)",
          borderLeft: `1px solid ${data.color}33`,
          borderRight: `1px solid ${data.color}33`,
          padding: "10px 16px 12px",
        }}
      >
        <div
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 7,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 9,
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
                fontSize: 8.5,
                color: data.color,
                background: `${data.color}10`,
                border: `1px solid ${data.color}28`,
                borderRadius: 3,
                padding: "3px 8px",
                letterSpacing: "0.06em",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          background: "rgba(4,4,14,0.94)",
          backdropFilter: "blur(24px)",
          borderLeft: `1px solid ${data.color}33`,
          borderRight: `1px solid ${data.color}33`,
          borderBottom: `1px solid ${data.color}44`,
          borderRadius: "0 0 6px 6px",
          padding: "8px 16px",
          display: "flex",
          gap: 6,
        }}
      >
        <button
          onClick={onPrev}
          style={{
            flex: 1,
            padding: "6px 0",
            fontFamily: "'Space Mono',monospace",
            fontSize: 8.5,
            color: "rgba(255,255,255,0.45)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 4,
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          ‹ PREV
        </button>
        <button
          onClick={onNext}
          style={{
            flex: 1,
            padding: "6px 0",
            fontFamily: "'Space Mono',monospace",
            fontSize: 8.5,
            color: "rgba(255,255,255,0.45)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 4,
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          NEXT ›
        </button>
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

// ─── MOBILE DETAIL SHEET ──────────────────────────────────────────────────────
interface MobileDetailSheetProps {
  nodeId: DomainId;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}
function MobileDetailSheet({
  nodeId,
  onClose,
  onPrev,
  onNext,
}: MobileDetailSheetProps) {
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
        maxHeight: "78vh",
        transform: vis ? "translateY(0)" : "translateY(105%)",
        transition: "transform 0.44s cubic-bezier(0.22,1,0.36,1)",
        borderRadius: "24px 24px 0 0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: `0 -8px 60px ${data.color}18,0 -2px 0 ${data.color}44`,
      }}
    >
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg,transparent 0%,${data.color} 40%,${data.color} 60%,transparent 100%)`,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          flexShrink: 0,
          background: `linear-gradient(160deg,${data.color}26 0%,rgba(5,5,18,0.97) 52%)`,
          backdropFilter: "blur(32px)",
          padding: "10px 18px 14px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 10,
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
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: `${data.color}18`,
                border: `1px solid ${data.color}33`,
                borderRadius: 20,
                padding: "3px 10px",
                marginBottom: 8,
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
                  letterSpacing: "0.16em",
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
                fontSize: 26,
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
                margin: "5px 0 0",
                fontFamily: "'Space Mono',monospace",
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
              }}
            >
              {data.subtitle}
            </p>
          </div>
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
      <div
        style={{
          overflowY: "auto",
          flexGrow: 1,
          background: "rgba(4,4,16,0.97)",
          backdropFilter: "blur(28px)",
          WebkitOverflowScrolling: "touch" as const,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            padding: "14px 18px 12px",
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
                  fontSize: 7.5,
                  color: "rgba(255,255,255,0.28)",
                  letterSpacing: "0.14em",
                  marginBottom: 5,
                  textTransform: "uppercase",
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 12,
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
            padding: "16px 20px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "'Space Mono',monospace",
              fontSize: 11,
              lineHeight: 2,
              color: "rgba(255,255,255,0.58)",
              letterSpacing: "0.01em",
            }}
          >
            {data.description}
          </p>
        </div>
        <div style={{ padding: "14px 20px" }}>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 7.5,
              color: "rgba(255,255,255,0.22)",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            KEY CONCEPTS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {data.concepts.map((c) => (
              <span
                key={c}
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 10.5,
                  color: data.color,
                  background: `${data.color}14`,
                  border: `1px solid ${data.color}30`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  letterSpacing: "0.06em",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "0 20px",
            paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
          }}
        >
          <button
            onClick={onPrev}
            style={{
              flex: 1,
              padding: "13px 0",
              fontFamily: "'Space Mono',monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.55)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            ‹ PREV
          </button>
          <button
            onClick={onNext}
            style={{
              flex: 1,
              padding: "13px 0",
              fontFamily: "'Space Mono',monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.55)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            NEXT ›
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MOBILE BOTTOM NAV ────────────────────────────────────────────────────────
interface MobileBottomNavProps {
  nodes: StarNode[];
  selectedId: DomainId | null;
  onSelect: (id: DomainId, p: THREE.Vector3) => void;
  panelOpen: boolean;
  viewMode: ViewMode;
  onViewMode: (m: ViewMode) => void;
}
function MobileBottomNav({
  nodes,
  selectedId,
  onSelect,
  panelOpen,
  viewMode,
  onViewMode,
}: MobileBottomNavProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 16,
        opacity: panelOpen ? 0 : 1,
        pointerEvents: panelOpen ? "none" : "auto",
        transition: "opacity 0.25s ease",
        background: "linear-gradient(transparent,rgba(0,0,10,0.95) 35%)",
        paddingBottom: "calc(10px + env(safe-area-inset-bottom))",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          scrollbarWidth: "none" as React.CSSProperties["scrollbarWidth"],
          WebkitOverflowScrolling: "touch" as const,
          padding: "10px 12px 6px",
        }}
        className="dock-scroll"
      >
        {nodes.map((node) => {
          const data = DOMAIN_DATA[node.id],
            isSel = selectedId === node.id;
          return (
            <button
              key={node.id}
              onClick={() => onSelect(node.id, node.position)}
              style={{
                flexShrink: 0,
                background: isSel ? `${node.color}22` : "rgba(8,8,24,0.7)",
                border: `1px solid ${isSel ? node.color + "66" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 12,
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                backdropFilter: "blur(16px)",
                transition: "all 0.2s ease",
                outline: "none",
                minHeight: 42,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: `radial-gradient(circle,#fff 0%,${node.color} 45%,transparent 100%)`,
                  boxShadow: `0 0 7px 1.5px ${node.color}66`,
                }}
              />
              <span
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  color: isSel ? node.color : "rgba(255,255,255,0.7)",
                  letterSpacing: "0.1em",
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
      <div
        style={{
          display: "flex",
          margin: "0 12px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {(["orbit", "top", "focus"] as ViewMode[]).map((m) => {
          const isA = viewMode === m,
            icons: Record<ViewMode, string> = {
              orbit: "⊙ ORBIT",
              top: "⊕ TOP",
              focus: "◎ FOCUS",
            },
            dis = m === "focus" && !selectedId;
          return (
            <button
              key={m}
              onClick={() => !dis && onViewMode(m)}
              style={{
                flex: 1,
                padding: "9px 0",
                fontFamily: "'Space Mono',monospace",
                fontSize: 8.5,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: dis
                  ? "rgba(255,255,255,0.2)"
                  : isA
                    ? "#fff"
                    : "rgba(255,255,255,0.38)",
                background: isA ? "rgba(255,255,255,0.11)" : "transparent",
                border: "none",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                cursor: dis ? "not-allowed" : "pointer",
                transition: "all 0.18s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {isA && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#4fffaa",
                    boxShadow: "0 0 5px #4fffaa",
                  }}
                />
              )}
              {icons[m]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── TRAVEL NOTIF ─────────────────────────────────────────────────────────────
interface TravelNotifProps {
  traveling: boolean;
  destination: DomainId | null;
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

// ─── COSMIC LOADER ────────────────────────────────────────────────────────────
// A full-screen loading experience that plays while Three.js boots and the
// galaxy particles are being generated. Three phases of status text, a
// procedural spinning galaxy SVG, and a smooth fade-out once ready.
const LOAD_PHASES = [
  { label: "INITIALISING STELLAR CORE", sub: "Igniting 162,000 particles" },
  { label: "WEAVING SPIRAL ARMS", sub: "Calibrating 5-branch rotation" },
  { label: "PLACING DOMAIN STARS", sub: "Mapping 7 knowledge domains" },
  { label: "TUNING BLOOM & NEBULAE", sub: "Rendering quantum dust clouds" },
  { label: "OBSERVATORY ONLINE", sub: "Universe ready — entering now" },
];

function CosmicLoader({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  // total loading "simulation" duration in ms
  const TOTAL_MS = 3400;

  useEffect(() => {
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(1, elapsed / TOTAL_MS);
      setProgress(pct);
      // phase changes at 20 / 40 / 65 / 85 / 100 %
      const thresholds = [0, 0.2, 0.4, 0.65, 0.85];
      let p = 0;
      for (let i = thresholds.length - 1; i >= 0; i--) {
        if (pct >= thresholds[i]) {
          p = i;
          break;
        }
      }
      setPhase(p);
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // small pause at 100%, then fade out
        setTimeout(() => {
          setFading(true);
          setTimeout(() => {
            setGone(true);
            onDone();
          }, 700);
        }, 340);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onDone]);

  if (gone) return null;

  const pct = progress;
  const info = LOAD_PHASES[phase];

  // ── spiral arms drawn as SVG arcs ──────────────────────────────────────────
  const arms = 5;
  const armPaths = Array.from({ length: arms }, (_, armIdx) => {
    const baseAngle = (armIdx / arms) * Math.PI * 2;
    const pts: string[] = [];
    const steps = 80;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const r = 8 + t * 88;
      const a = baseAngle + t * Math.PI * 2.6;
      const x = 110 + Math.cos(a) * r;
      const y = 110 + Math.sin(a) * r;
      pts.push(
        s === 0
          ? `M${x.toFixed(1)},${y.toFixed(1)}`
          : `L${x.toFixed(1)},${y.toFixed(1)}`,
      );
    }
    return pts.join(" ");
  });

  // particle scatter around the spiral — computed once via useMemo
  const dots = useMemo(() => {
    const out = [];
    for (let i = 0; i < 120; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 98;
      out.push({
        x: 110 + Math.cos(a) * r,
        y: 110 + Math.sin(a) * r,
        r: 0.4 + Math.random() * 1.4,
        op: 0.2 + Math.random() * 0.6,
        col: [
          "#ffe8c0",
          "#aaaaff",
          "#5bc8ff",
          "#e060ff",
          "#40e080",
          "#ffd060",
          "#00eeff",
        ][i % 7],
      });
    }
    return out;
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000002",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fading ? 0 : 1,
        transition: fading ? "opacity 0.7s ease" : "none",
        overflow: "hidden",
      }}
    >
      {/* ── Ambient nebula glow ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {[
          { cx: "20%", cy: "30%", c: "#1a0533", r: "35%" },
          { cx: "78%", cy: "65%", c: "#001830", r: "30%" },
          { cx: "55%", cy: "18%", c: "#0a0020", r: "25%" },
        ].map((n, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: n.cx,
              top: n.cy,
              width: n.r,
              paddingBottom: n.r,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${n.c} 0%, transparent 70%)`,
              transform: "translate(-50%,-50%)",
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* ── Spinning galaxy SVG ── */}
      <div
        style={{
          position: "relative",
          width: 220,
          height: 220,
          animation: "loaderSpin 8s linear infinite",
        }}
      >
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          style={{ overflow: "visible" }}
        >
          {/* background field stars */}
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill={d.col}
              opacity={d.op * (0.5 + pct * 0.5)}
            />
          ))}
          {/* core glow */}
          <circle
            cx="110"
            cy="110"
            r="18"
            fill="#ffe8c0"
            opacity={0.04 + pct * 0.08}
          />
          <circle
            cx="110"
            cy="110"
            r="9"
            fill="#fff8e0"
            opacity={0.12 + pct * 0.18}
          />
          <circle
            cx="110"
            cy="110"
            r="4"
            fill="#ffffff"
            opacity={0.55 + pct * 0.35}
          />
          {/* spiral arms — each arm reveals as progress grows */}
          {armPaths.map((d, i) => {
            const reveal = Math.min(1, Math.max(0, (pct - i * 0.12) / 0.55));
            const armColors = [
              "#5bc8ff",
              "#ffd060",
              "#e060ff",
              "#40e080",
              "#ff8855",
            ];
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={armColors[i]}
                strokeWidth={1.1}
                strokeOpacity={reveal * 0.6}
                strokeDasharray="4 3"
                style={{ filter: `blur(${(1 - reveal) * 0.8}px)` }}
              />
            );
          })}
        </svg>
      </div>

      {/* ── Title ── */}
      <div
        style={{
          marginTop: 32,
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: "#ffffff",
          letterSpacing: "0.18em",
          textShadow: "0 0 40px rgba(79,255,170,0.45)",
          opacity: 0.95,
        }}
      >
        MILKY WAY
      </div>
      <div
        style={{
          marginTop: 4,
          fontFamily: "'Space Mono', monospace",
          fontSize: 8.5,
          color: "#4fffaa",
          letterSpacing: "0.32em",
          opacity: 0.7,
        }}
      >
        OBSERVATORY
      </div>

      {/* ── Progress bar ── */}
      <div
        style={{
          marginTop: 28,
          width: 260,
          height: 2,
          background: "rgba(255,255,255,0.07)",
          borderRadius: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.round(pct * 100)}%`,
            background: "linear-gradient(90deg, #4fffaa, #00eeff)",
            borderRadius: 1,
            transition: "width 0.12s linear",
            boxShadow: "0 0 8px #4fffaa88",
          }}
        />
      </div>

      {/* ── Status text ── */}
      <div style={{ marginTop: 16, textAlign: "center", minHeight: 40 }}>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9.5,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            transition: "opacity 0.3s ease",
          }}
        >
          {info.label}
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: "'Space Mono', monospace",
            fontSize: 8,
            color: "rgba(255,255,255,0.32)",
            letterSpacing: "0.12em",
          }}
        >
          {info.sub}
        </div>
      </div>

      {/* ── Percentage ── */}
      <div
        style={{
          marginTop: 14,
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          color: "#4fffaa",
          letterSpacing: "0.12em",
          opacity: 0.65,
        }}
      >
        {Math.round(pct * 100)}%
      </div>

      {/* ── Corner decorations (reuse same HUD aesthetic) ── */}
      {(["tl", "tr", "bl", "br"] as CornerPos[]).map((p) => (
        <CornerDecor key={p} pos={p} />
      ))}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        @keyframes loaderSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function GalaxyScene() {
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<DomainId | null>(null);
  const [travelTarget, setTravelTarget] = useState<THREE.Vector3 | null>(null);
  const [traveling, setTraveling] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("orbit");
  const [catalogCollapsed, setCatalogCollapsed] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [zoomDelta, setZoomDelta] = useState(0);
  const isMobile = useIsMobile();
  const handleLoaded = useCallback(() => setLoaded(true), []);

  const focusTarget = useMemo(() => {
    if (!selectedId) return null;
    return SPECIAL_NODES.find((n) => n.id === selectedId)?.position ?? null;
  }, [selectedId]);
  const handleSelect = useCallback((id: DomainId, position: THREE.Vector3) => {
    setSelectedId(id);
    setTravelTarget(position);
    setTraveling(true);
  }, []);
  const handleClose = useCallback(() => {
    setSelectedId(null);
    setTravelTarget(null);
  }, []);
  const handlePrev = useCallback(() => {
    if (!selectedId) return;
    const idx = DOMAIN_IDS.indexOf(selectedId),
      prevId = DOMAIN_IDS[(idx - 1 + DOMAIN_IDS.length) % DOMAIN_IDS.length],
      node = SPECIAL_NODES.find((n) => n.id === prevId)!;
    handleSelect(prevId, node.position);
  }, [selectedId, handleSelect]);
  const handleNext = useCallback(() => {
    if (!selectedId) return;
    const idx = DOMAIN_IDS.indexOf(selectedId),
      nextId = DOMAIN_IDS[(idx + 1) % DOMAIN_IDS.length],
      node = SPECIAL_NODES.find((n) => n.id === nextId)!;
    handleSelect(nextId, node.position);
  }, [selectedId, handleSelect]);
  const handleViewMode = useCallback(
    (m: ViewMode) => {
      if (m === "focus" && !selectedId) return;
      setViewMode(m);
    },
    [selectedId],
  );
  useEffect(() => {
    if (!selectedId && viewMode === "focus") setViewMode("orbit");
  }, [selectedId, viewMode]);

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
      {/* Loading screen — stays on top until animation completes */}
      {!loaded && <CosmicLoader onDone={handleLoaded} />}

      {/* Main scene fades in once loader is done */}
      <div
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.8s ease",
          width: "100%",
          height: "100%",
          position: "relative",
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
        input::placeholder{color:rgba(255,255,255,0.22)}
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
            viewMode={viewMode}
            focusTarget={focusTarget}
            onArrived={() => setTraveling(false)}
            onInterrupt={() => {
              setTravelTarget(null);
              setTraveling(false);
            }}
            resetSignal={resetSignal}
            zoomDelta={zoomDelta}
            onZoomConsumed={() => setZoomDelta(0)}
            isMobile={isMobile}
          />
          <EffectComposer
            children={
              <Bloom
                luminanceThreshold={0.01}
                luminanceSmoothing={0.88}
                intensity={isMobile ? 1.1 : 1.4}
                radius={0.88}
              />
            }
          />
        </Canvas>

        {/* Scanlines component intentionally removed — was causing sub-pixel sharpness banding */}
        <CornerDecor pos="tl" />
        <CornerDecor pos="tr" />
        <CornerDecor pos="bl" />
        <CornerDecor pos="br" />
        <TopBar
          isMobile={isMobile}
          viewMode={viewMode}
          onViewMode={handleViewMode}
          hasSelection={!!selectedId}
        />
        {!isMobile && <BottomHints />}
        {!isMobile && (
          <DesktopStarCatalog
            nodes={SPECIAL_NODES}
            selectedId={selectedId}
            onSelect={handleSelect}
            collapsed={catalogCollapsed}
            onToggleCollapse={() => setCatalogCollapsed((c) => !c)}
            search={catalogSearch}
            onSearch={setCatalogSearch}
          />
        )}
        {!isMobile && selectedId && (
          <DesktopDetailPanel
            nodeId={selectedId}
            onClose={handleClose}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
        {!isMobile && (
          <MiniMap selectedId={selectedId} onSelect={handleSelect} />
        )}
        {!isMobile && (
          <CameraControls
            onZoomIn={() => setZoomDelta(-1)}
            onZoomOut={() => setZoomDelta(1)}
            onReset={() => setResetSignal((s) => s + 1)}
          />
        )}
        {isMobile && (
          <MobileBottomNav
            nodes={SPECIAL_NODES}
            selectedId={selectedId}
            onSelect={handleSelect}
            panelOpen={!!selectedId}
            viewMode={viewMode}
            onViewMode={handleViewMode}
          />
        )}
        {isMobile && selectedId && (
          <MobileDetailSheet
            nodeId={selectedId}
            onClose={handleClose}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
        <TravelNotif
          traveling={traveling}
          destination={selectedId}
          isMobile={isMobile}
        />
      </div>
      {/* end fade-in wrapper */}
    </div>
  );
}
