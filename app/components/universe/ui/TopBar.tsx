import * as React from "react";
import { useState, useEffect } from "react";
import { ViewMode, TOTAL_PARTICLES } from "../constants";

export interface TopBarProps {
  isMobile: boolean;
  viewMode: ViewMode;
  onViewMode: (m: ViewMode) => void;
  hasSelection: boolean;
}

export function TopBar({
  isMobile,
  viewMode,
  onViewMode,
  hasSelection,
}: TopBarProps) {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  const ts = time ? `${p(time.getUTCHours())}:${p(time.getUTCMinutes())}:${p(time.getUTCSeconds())}` : "--:--:--";
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
