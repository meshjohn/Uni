import * as React from "react";
import * as THREE from "three";
import { useMemo } from "react";

export function NebulaCloud() {
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
