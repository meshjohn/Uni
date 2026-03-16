import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { CornerDecor } from "./CornerDecor";

const LOAD_PHASES = [
  { label: "INITIALISING STELLAR CORE", sub: "Igniting 162,000 particles" },
  { label: "WEAVING SPIRAL ARMS", sub: "Calibrating 5-branch rotation" },
  { label: "PLACING DOMAIN STARS", sub: "Mapping 7 knowledge domains" },
  { label: "TUNING BLOOM & NEBULAE", sub: "Rendering quantum dust clouds" },
  { label: "OBSERVATORY ONLINE", sub: "Universe ready — entering now" },
];

export function CosmicLoader({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const TOTAL_MS = 3400;

  useEffect(() => {
    setMounted(true);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(1, elapsed / TOTAL_MS);
      setProgress(pct);
      const thresholds = [0, 0.2, 0.4, 0.65, 0.85];
      let p = 0;
      for (let i = thresholds.length - 1; i >= 0; i--) {
        if (pct >= thresholds[i]) {
          p = i;
          break;
        }
      }
      setPhase(p);
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setFading(true);
          setTimeout(() => {
            setGone(true);
            onDone();
          }, 700);
        }, 340);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onDone]);

  if (gone) return null;

  const pct = progress;
  const info = LOAD_PHASES[phase];

  const arms = 5;
  const armPaths = Array.from({ length: arms }, (_, armIdx) => {
    const baseAngle = (armIdx / arms) * Math.PI * 2;
    const pts: string[] = [];
    const steps = 80;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const r = 8 + t * 88;
      const a = baseAngle + t * Math.PI * 2.6;
      const x = 110 + Math.cos(a) * r;
      const y = 110 + Math.sin(a) * r;
      pts.push(
        s === 0
          ? `M${x.toFixed(1)},${y.toFixed(1)}`
          : `L${x.toFixed(1)},${y.toFixed(1)}`,
      );
    }
    return pts.join(" ");
  });

  const dots = useMemo(() => {
    const out = [];
    for (let i = 0; i < 120; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 98;
      out.push({
        x: 110 + Math.cos(a) * r,
        y: 110 + Math.sin(a) * r,
        r: 0.4 + Math.random() * 1.4,
        op: 0.2 + Math.random() * 0.6,
        col: [
          "#ffe8c0",
          "#aaaaff",
          "#5bc8ff",
          "#e060ff",
          "#40e080",
          "#ffd060",
          "#00eeff",
        ][i % 7],
      });
    }
    return out;
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000002",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fading ? 0 : 1,
        transition: fading ? "opacity 0.7s ease" : "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {[
          { cx: "20%", cy: "30%", c: "#1a0533", r: "35%" },
          { cx: "78%", cy: "65%", c: "#001830", r: "30%" },
          { cx: "55%", cy: "18%", c: "#0a0020", r: "25%" },
        ].map((n, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: n.cx,
              top: n.cy,
              width: n.r,
              paddingBottom: n.r,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${n.c} 0%, transparent 70%)`,
              transform: "translate(-50%,-50%)",
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "relative",
          width: 220,
          height: 220,
          animation: "loaderSpin 8s linear infinite",
        }}
      >
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          style={{ overflow: "visible" }}
        >
          {mounted && dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill={d.col}
              opacity={d.op * (0.5 + pct * 0.5)}
            />
          ))}
          <circle
            cx="110"
            cy="110"
            r="18"
            fill="#ffe8c0"
            opacity={0.04 + pct * 0.08}
          />
          <circle
            cx="110"
            cy="110"
            r="9"
            fill="#fff8e0"
            opacity={0.12 + pct * 0.18}
          />
          <circle
            cx="110"
            cy="110"
            r="4"
            fill="#ffffff"
            opacity={0.55 + pct * 0.35}
          />
          {armPaths.map((d, i) => {
            const reveal = Math.min(1, Math.max(0, (pct - i * 0.12) / 0.55));
            const armColors = [
              "#5bc8ff",
              "#ffd060",
              "#e060ff",
              "#40e080",
              "#ff8855",
            ];
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={armColors[i]}
                strokeWidth={1.1}
                strokeOpacity={reveal * 0.6}
                strokeDasharray="4 3"
                style={{ filter: `blur(${(1 - reveal) * 0.8}px)` }}
              />
            );
          })}
        </svg>
      </div>

      <div
        style={{
          marginTop: 32,
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: "#ffffff",
          letterSpacing: "0.18em",
          textShadow: "0 0 40px rgba(79,255,170,0.45)",
          opacity: 0.95,
        }}
      >
        MILKY WAY
      </div>
      <div
        style={{
          marginTop: 4,
          fontFamily: "'Space Mono', monospace",
          fontSize: 8.5,
          color: "#4fffaa",
          letterSpacing: "0.32em",
          opacity: 0.7,
        }}
      >
        OBSERVATORY
      </div>

      <div
        style={{
          marginTop: 28,
          width: 260,
          height: 2,
          background: "rgba(255,255,255,0.07)",
          borderRadius: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.round(pct * 100)}%`,
            background: "linear-gradient(90deg, #4fffaa, #00eeff)",
            borderRadius: 1,
            transition: "width 0.12s linear",
            boxShadow: "0 0 8px #4fffaa88",
          }}
        />
      </div>

      <div style={{ marginTop: 16, textAlign: "center", minHeight: 40 }}>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9.5,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            transition: "opacity 0.3s ease",
          }}
        >
          {info.label}
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: "'Space Mono', monospace",
            fontSize: 8,
            color: "rgba(255,255,255,0.32)",
            letterSpacing: "0.12em",
          }}
        >
          {info.sub}
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          color: "#4fffaa",
          letterSpacing: "0.12em",
          opacity: 0.65,
        }}
      >
        {Math.round(pct * 100)}%
      </div>

      {(["tl", "tr", "bl", "br"] as const).map((p) => (
        <CornerDecor key={p} pos={p} />
      ))}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        @keyframes loaderSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
