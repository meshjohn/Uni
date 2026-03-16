import * as React from "react";
import * as THREE from "three";
import { DomainId, SPECIAL_NODES } from "../constants";

export interface MiniMapProps {
  selectedId: DomainId | null;
  onSelect: (id: DomainId, p: THREE.Vector3) => void;
}

export function MiniMap({ selectedId, onSelect }: MiniMapProps) {
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
