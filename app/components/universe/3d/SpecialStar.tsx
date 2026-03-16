import * as React from "react";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { DOMAIN_DATA, DomainId } from "../constants";
import { getStarTexture, getSurfaceTexture, getRingTexture } from "../textures";
import { useIsMobile } from "../hooks";

export interface SpecialStarProps {
  id: DomainId;
  position: THREE.Vector3;
  color: string;
  onClick: (id: DomainId, position: THREE.Vector3) => void;
  isSelected: boolean;
  key?: React.Key;
}

export function SpecialStar({
  id,
  position,
  color,
  onClick,
  isSelected,
}: SpecialStarProps) {
  const data = DOMAIN_DATA[id];
  const [hovered, setHovered] = useState(false);
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
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
