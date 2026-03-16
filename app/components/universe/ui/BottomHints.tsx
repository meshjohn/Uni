import * as React from "react";
import { PARAMETERS } from "../constants";

export function BottomHints() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(transparent,rgba(0,0,4,0.65) 100%)",
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", gap: 18 }}>
        {[
          ["DRAG", "Rotate"],
          ["SCROLL", "Zoom"],
          ["CLICK", "Navigate"],
        ].map(([k, d]) => (
          <div
            key={k}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 8,
                color: "rgba(255,255,255,0.45)",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 3,
                padding: "2px 6px",
                letterSpacing: "0.12em",
              }}
            >
              {k}
            </span>
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 8,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.08em",
              }}
            >
              {d}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: 8,
          color: "rgba(255,255,255,0.14)",
          letterSpacing: "0.1em",
        }}
      >
        Ω={PARAMETERS.spin} · ε={PARAMETERS.randomness} · n=
        {PARAMETERS.branches}
      </div>
    </div>
  );
}
