import * as React from "react";

export type CornerPos = "tl" | "tr" | "bl" | "br";

export function CornerDecor({ pos }: { pos: CornerPos; key?: React.Key }) {
  const base: React.CSSProperties = {
    position: "absolute",
    width: 32,
    height: 32,
    pointerEvents: "none",
    zIndex: 5,
  };
  const v = {
    tl: {
      top: 10,
      left: 10,
      borderTop: "1px solid rgba(255,255,255,0.16)",
      borderLeft: "1px solid rgba(255,255,255,0.16)",
    },
    tr: {
      top: 10,
      right: 10,
      borderTop: "1px solid rgba(255,255,255,0.16)",
      borderRight: "1px solid rgba(255,255,255,0.16)",
    },
    bl: {
      bottom: 10,
      left: 10,
      borderBottom: "1px solid rgba(255,255,255,0.16)",
      borderLeft: "1px solid rgba(255,255,255,0.16)",
    },
    br: {
      bottom: 10,
      right: 10,
      borderBottom: "1px solid rgba(255,255,255,0.16)",
      borderRight: "1px solid rgba(255,255,255,0.16)",
    },
  };
  return <div style={{ ...base, ...v[pos] }} />;
}
