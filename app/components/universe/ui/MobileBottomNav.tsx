import * as React from "react";
import * as THREE from "three";
import { StarNode, DomainId, DOMAIN_DATA, ViewMode } from "../constants";

export interface MobileBottomNavProps {
  nodes: StarNode[];
  selectedId: DomainId | null;
  onSelect: (id: DomainId, p: THREE.Vector3) => void;
  panelOpen: boolean;
  viewMode: ViewMode;
  onViewMode: (m: ViewMode) => void;
}

export function MobileBottomNav({
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
