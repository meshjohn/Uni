import * as React from "react";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PARAMETERS, GALAXY_LAYERS } from "../constants";

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

export function SpiralGalaxy() {
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
