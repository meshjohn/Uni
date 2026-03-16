"use client";

import * as React from "react";
import { useState, useCallback, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

import { useIsMobile } from "./universe/hooks";
import { ViewMode, DomainId, SPECIAL_NODES, DOMAIN_IDS } from "./universe/constants";
import { NebulaCloud } from "./universe/3d/NebulaCloud";
import { SpecialStar } from "./universe/3d/SpecialStar";
import { SpiralGalaxy } from "./universe/3d/SpiralGalaxy";
import { CameraRig } from "./universe/3d/CameraRig";

import { CornerDecor } from "./universe/ui/CornerDecor";
import { TopBar } from "./universe/ui/TopBar";
import { BottomHints } from "./universe/ui/BottomHints";
import { MiniMap } from "./universe/ui/MiniMap";
import { CameraControls } from "./universe/ui/CameraControls";
import { DesktopStarCatalog } from "./universe/ui/DesktopStarCatalog";
import { DesktopDetailPanel } from "./universe/ui/DesktopDetailPanel";
import { MobileDetailSheet } from "./universe/ui/MobileDetailSheet";
import { MobileBottomNav } from "./universe/ui/MobileBottomNav";
import { TravelNotif } from "./universe/ui/TravelNotif";
import { CosmicLoader } from "./universe/ui/CosmicLoader";

export default function GalaxyScene() {
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<DomainId | null>(null);
  const [travelTarget, setTravelTarget] = useState<THREE.Vector3 | null>(null);
  const [traveling, setTraveling] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("orbit");
  const [catalogCollapsed, setCatalogCollapsed] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [zoomDelta, setZoomDelta] = useState(0);
  const isMobile = useIsMobile();
  const handleLoaded = useCallback(() => setLoaded(true), []);

  const focusTarget = useMemo(() => {
    if (!selectedId) return null;
    return SPECIAL_NODES.find((n) => n.id === selectedId)?.position ?? null;
  }, [selectedId]);
  const handleSelect = useCallback((id: DomainId, position: THREE.Vector3) => {
    setSelectedId(id);
    setTravelTarget(position);
    setTraveling(true);
  }, []);
  const handleClose = useCallback(() => {
    setSelectedId(null);
    setTravelTarget(null);
  }, []);
  const handlePrev = useCallback(() => {
    if (!selectedId) return;
    const idx = DOMAIN_IDS.indexOf(selectedId),
      prevId = DOMAIN_IDS[(idx - 1 + DOMAIN_IDS.length) % DOMAIN_IDS.length],
      node = SPECIAL_NODES.find((n) => n.id === prevId)!;
    handleSelect(prevId, node.position);
  }, [selectedId, handleSelect]);
  const handleNext = useCallback(() => {
    if (!selectedId) return;
    const idx = DOMAIN_IDS.indexOf(selectedId),
      nextId = DOMAIN_IDS[(idx + 1) % DOMAIN_IDS.length],
      node = SPECIAL_NODES.find((n) => n.id === nextId)!;
    handleSelect(nextId, node.position);
  }, [selectedId, handleSelect]);
  const handleViewMode = useCallback(
    (m: ViewMode) => {
      if (m === "focus" && !selectedId) return;
      setViewMode(m);
    },
    [selectedId],
  );
  useEffect(() => {
    if (!selectedId && viewMode === "focus") setViewMode("orbit");
  }, [selectedId, viewMode]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000002",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Loading screen — stays on top until animation completes */}
      {!loaded && <CosmicLoader onDone={handleLoaded} />}

      {/* Main scene fades in once loader is done */}
      <div
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.8s ease",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        html,body{margin:0;overscroll-behavior:none;touch-action:none}
        @keyframes fadeInLeft{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes fadeOut{0%{opacity:0}8%{opacity:1}75%{opacity:1}100%{opacity:0}}
        button{outline:none;-webkit-appearance:none;border:none;background:none;padding:0;font:inherit}
        button:active{filter:brightness(1.35)}
        .dock-scroll::-webkit-scrollbar{display:none}
        input::placeholder{color:rgba(255,255,255,0.22)}
      `}</style>

        <Canvas
          camera={{
            position: [80, 55, 150],
            fov: isMobile ? 68 : 58,
            near: 0.5,
            far: 900,
          }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.72,
          }}
          dpr={[1, isMobile ? 1.5 : 2]}
          onPointerMissed={() => {
            setSelectedId(null);
            setTravelTarget(null);
          }}
          style={{ position: "absolute", inset: 0, touchAction: "none" }}
        >
          <color attach="background" args={["#000002"]} />
          <ambientLight intensity={0.03} />
          <NebulaCloud />
          <SpiralGalaxy />
          {SPECIAL_NODES.map((node) => (
            <SpecialStar
              key={node.id}
              {...node}
              onClick={handleSelect}
              isSelected={selectedId === node.id}
            />
          ))}
          <Stars
            radius={340}
            depth={90}
            count={isMobile ? 3000 : 6000}
            factor={4.5}
            saturation={0.1}
            fade
            speed={0.35}
          />
          <CameraRig
            targetPosition={travelTarget}
            viewMode={viewMode}
            focusTarget={focusTarget}
            onArrived={() => setTraveling(false)}
            onInterrupt={() => {
              setTravelTarget(null);
              setTraveling(false);
            }}
            resetSignal={resetSignal}
            zoomDelta={zoomDelta}
            onZoomConsumed={() => setZoomDelta(0)}
            isMobile={isMobile}
          />
          <EffectComposer
            children={
              <Bloom
                luminanceThreshold={0.01}
                luminanceSmoothing={0.88}
                intensity={isMobile ? 1.1 : 1.4}
                radius={0.88}
              />
            }
          />
        </Canvas>

        {/* Scanlines component intentionally removed — was causing sub-pixel sharpness banding */}
        <CornerDecor pos="tl" />
        <CornerDecor pos="tr" />
        <CornerDecor pos="bl" />
        <CornerDecor pos="br" />
        <TopBar
          isMobile={isMobile}
          viewMode={viewMode}
          onViewMode={handleViewMode}
          hasSelection={!!selectedId}
        />
        {!isMobile && <BottomHints />}
        {!isMobile && (
          <DesktopStarCatalog
            nodes={SPECIAL_NODES}
            selectedId={selectedId}
            onSelect={handleSelect}
            collapsed={catalogCollapsed}
            onToggleCollapse={() => setCatalogCollapsed((c) => !c)}
            search={catalogSearch}
            onSearch={setCatalogSearch}
          />
        )}
        {!isMobile && selectedId && (
          <DesktopDetailPanel
            nodeId={selectedId}
            onClose={handleClose}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
        {!isMobile && (
          <MiniMap selectedId={selectedId} onSelect={handleSelect} />
        )}
        {!isMobile && (
          <CameraControls
            onZoomIn={() => setZoomDelta(-1)}
            onZoomOut={() => setZoomDelta(1)}
            onReset={() => setResetSignal((s) => s + 1)}
          />
        )}
        {isMobile && (
          <MobileBottomNav
            nodes={SPECIAL_NODES}
            selectedId={selectedId}
            onSelect={handleSelect}
            panelOpen={!!selectedId}
            viewMode={viewMode}
            onViewMode={handleViewMode}
          />
        )}
        {isMobile && selectedId && (
          <MobileDetailSheet
            nodeId={selectedId}
            onClose={handleClose}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
        <TravelNotif
          traveling={traveling}
          destination={selectedId}
          isMobile={isMobile}
        />
      </div>
      {/* end fade-in wrapper */}
    </div>
  );
}
