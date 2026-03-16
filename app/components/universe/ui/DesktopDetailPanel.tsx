import * as React from "react";
import { useState, useEffect } from "react";
import { DomainId, DOMAIN_DATA } from "../constants"

export interface DesktopDetailPanelProps {
  nodeId: DomainId;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function DesktopDetailPanel({
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
