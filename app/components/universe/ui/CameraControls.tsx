import * as React from "react";

export interface CameraControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function CameraControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: CameraControlsProps) {
  const b: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 5,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.15s",
  };
  return (
    <div
      style={{
        position: "absolute",
        bottom: 42,
        left: 18,
        zIndex: 15,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <button onClick={onZoomIn} style={b} title="Zoom in">
        +
      </button>
      <button onClick={onZoomOut} style={b} title="Zoom out">
        −
      </button>
      <button
        onClick={onReset}
        style={{ ...b, fontSize: 11 }}
        title="Reset camera"
      >
        ↺
      </button>
    </div>
  );
}
