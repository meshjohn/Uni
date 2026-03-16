import * as React from "react";
import { StarNode, DomainId, DOMAIN_DATA } from "../constants";

export interface DesktopStarCatalogProps {
  nodes: StarNode[];
  selectedId: DomainId | null;
  onSelect: (id: DomainId, p: any) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  search: string;
  onSearch: (v: string) => void;
}

export function DesktopStarCatalog({
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
