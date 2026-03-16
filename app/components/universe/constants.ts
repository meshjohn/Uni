import * as THREE from "three";

export type ViewMode = "orbit" | "top" | "focus";

export const PARAMETERS = {
  count: 160000,
  size: 0.013,
  radius: 130,
  branches: 5,
  spin: 1.3,
  randomness: 0.24,
  randomnessPower: 3.1,
  thicknessScale: 0.28,
};

export const GALAXY_LAYERS = [
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

export const TOTAL_PARTICLES = GALAXY_LAYERS.reduce((s, l) => s + l.count, 0);

export const DOMAIN_DATA = {
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

export type DomainId = keyof typeof DOMAIN_DATA;

export interface StarNode {
  id: DomainId;
  position: THREE.Vector3;
  color: string;
}

export const SPECIAL_NODES: StarNode[] = [
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

export const DOMAIN_IDS = SPECIAL_NODES.map((n) => n.id);
