import * as React from "react";
import { useState, useEffect } from "react";
import { DomainId, DOMAIN_DATA } from "../constants";

export interface TravelNotifProps {
  traveling: boolean;
  destination: DomainId | null;
  isMobile: boolean;
}

export function TravelNotif({
  traveling,
  destination,
  isMobile,
}: TravelNotifProps) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (traveling) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(t);
    }
  }, [traveling]);
  const data = destination ? DOMAIN_DATA[destination] : null;
  if (!show || !data) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 25,
        textAlign: "center",
        pointerEvents: "none",
        animation: "fadeOut 3s ease forwards",
      }}
    >
      <div
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: 8,
          color: data.color,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          marginBottom: 10,
          opacity: 0.8,
        }}
      >
        NAVIGATING TO
      </div>
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 800,
          fontSize: isMobile ? 26 : 30,
          color: "#fff",
          textShadow: `0 0 40px ${data.color},0 0 80px ${data.color}55`,
          letterSpacing: "0.06em",
        }}
      >
        {data.title}
      </div>
      <div
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: 8,
          color: "rgba(255,255,255,0.28)",
          letterSpacing: "0.18em",
          marginTop: 8,
        }}
      >
        {data.spectralClass.toUpperCase()} · {data.temp}
      </div>
    </div>
  );
}
