import * as React from "react";
import { useState, useEffect } from "react";
import { DomainId, DOMAIN_DATA } from "../constants";

export interface MobileDetailSheetProps {
  nodeId: DomainId;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function MobileDetailSheet({
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
        // Using ~78vh so that it covers the bottom portion without completely obscuring the planet above
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
