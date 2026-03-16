import * as THREE from "three";

const textureCache = new Map();

export function getStarTexture(type: string) {
  if (textureCache.has(type)) return textureCache.get(type);
  const SIZE = 512,
    c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d")!,
    cx = SIZE / 2,
    cy = SIZE / 2;
  if (type === "blue_giant") {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, SIZE / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.03, "rgba(235,248,255,1)");
    g.addColorStop(0.09, "rgba(140,210,255,0.92)");
    g.addColorStop(0.2, "rgba(70,140,255,0.55)");
    g.addColorStop(0.45, "rgba(30,70,220,0.18)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      for (let w = -1.5; w <= 1.5; w += 0.75) {
        const wa = a + w * 0.025,
          lg = ctx.createLinearGradient(
            cx,
            cy,
            cx + Math.cos(wa) * 250,
            cy + Math.sin(wa) * 250,
          );
        lg.addColorStop(0, "rgba(180,220,255,0.6)");
        lg.addColorStop(0.3, "rgba(100,180,255,0.2)");
        lg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(wa) * 250, cy + Math.sin(wa) * 250);
        ctx.stroke();
      }
    }
  } else if (type === "white_star") {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, SIZE / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.05, "rgba(245,248,255,0.98)");
    g.addColorStop(0.14, "rgba(210,225,255,0.7)");
    g.addColorStop(0.3, "rgba(180,205,255,0.25)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI;
      [-1, 0, 1].forEach((w) => {
        const wa = a + w * 0.03,
          lg = ctx.createLinearGradient(
            cx,
            cy,
            cx + Math.cos(wa) * 256,
            cy + Math.sin(wa) * 256,
          );
        lg.addColorStop(0, "rgba(255,255,255,0.7)");
        lg.addColorStop(0.2, "rgba(200,220,255,0.25)");
        lg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(wa) * 256, cy + Math.sin(wa) * 256);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - Math.cos(wa) * 256, cy - Math.sin(wa) * 256);
        ctx.stroke();
      });
    }
  } else if (type === "sun_like") {
    const g = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, SIZE / 2);
    g.addColorStop(0, "rgba(255,255,230,1)");
    g.addColorStop(0.04, "rgba(255,248,180,1)");
    g.addColorStop(0.1, "rgba(255,210,80,0.95)");
    g.addColorStop(0.22, "rgba(255,160,30,0.65)");
    g.addColorStop(0.42, "rgba(220,90,10,0.28)");
    g.addColorStop(0.7, "rgba(160,40,5,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2,
        r = 72 + (i % 3) * 30,
        lg = ctx.createLinearGradient(
          cx,
          cy,
          cx + Math.cos(a) * r,
          cy + Math.sin(a) * r,
        );
      lg.addColorStop(0, "rgba(255,190,40,0.4)");
      lg.addColorStop(0.6, "rgba(255,100,10,0.12)");
      lg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.strokeStyle = lg;
      ctx.lineWidth = 3 + (i % 4) * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }
  } else {
    const g = ctx.createRadialGradient(cx + 10, cy - 5, 0, cx, cy, SIZE / 2);
    g.addColorStop(0, "rgba(255,240,200,1)");
    g.addColorStop(0.03, "rgba(255,180,100,1)");
    g.addColorStop(0.09, "rgba(255,100,40,0.9)");
    g.addColorStop(0.2, "rgba(210,50,15,0.55)");
    g.addColorStop(0.42, "rgba(160,20,5,0.22)");
    g.addColorStop(0.7, "rgba(100,10,2,0.06)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2,
        r = 100 + (i % 3) * 40,
        lg = ctx.createLinearGradient(
          cx,
          cy,
          cx + Math.cos(a) * r,
          cy + Math.sin(a) * r,
        );
      lg.addColorStop(0, "rgba(255,100,30,0.35)");
      lg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.strokeStyle = lg;
      ctx.lineWidth = 8 + (i % 3) * 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  textureCache.set(type, tex);
  return tex;
}

export function getSurfaceTexture(type: string) {
  const key = type + "_surface";
  if (textureCache.has(key)) return textureCache.get(key);
  const SIZE = 512,
    c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d")!;
  const cols: Record<string, string[]> = {
    blue_giant: ["#0a1a4a", "#1a3080", "#0a60cc", "#60aaff"],
    white_star: ["#c8d8f0", "#dde8ff", "#e8f0ff", "#ffffff"],
    sun_like: ["#8b3000", "#cc6600", "#ff9900", "#ffcc44"],
    red_giant: ["#4a0800", "#8b1500", "#cc3300", "#ff6622"],
  };
  const [c1, , c3, c4] = cols[type] || cols.sun_like;
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * SIZE,
      y = Math.random() * SIZE,
      r = 2 + Math.random() * 18,
      g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, (Math.random() > 0.5 ? c4 : c1) + "55");
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * SIZE,
      y = Math.random() * SIZE,
      r = 8 + Math.random() * 35;
    ctx.strokeStyle = c3 + "33";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  textureCache.set(key, tex);
  return tex;
}

export function getRingTexture() {
  if (textureCache.has("ring")) return textureCache.get("ring");
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 1;
  const ctx = c.getContext("2d")!,
    g = ctx.createLinearGradient(0, 0, 512, 0);
  g.addColorStop(0, "rgba(255,100,40,0)");
  g.addColorStop(0.08, "rgba(255,120,50,0.55)");
  g.addColorStop(0.18, "rgba(255,160,80,0.35)");
  g.addColorStop(0.28, "rgba(200,80,30,0.6)");
  g.addColorStop(0.42, "rgba(255,110,50,0.22)");
  g.addColorStop(0.55, "rgba(220,90,40,0.48)");
  g.addColorStop(0.7, "rgba(180,70,30,0.18)");
  g.addColorStop(0.85, "rgba(240,100,50,0.32)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 1);
  const tex = new THREE.CanvasTexture(c);
  textureCache.set("ring", tex);
  return tex;
}
