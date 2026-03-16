import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ViewMode } from "../constants";

export interface CameraRigProps {
  targetPosition: THREE.Vector3 | null;
  viewMode: ViewMode;
  focusTarget: THREE.Vector3 | null;
  onArrived: () => void;
  onInterrupt: () => void;
  resetSignal: number;
  zoomDelta: number;
  onZoomConsumed: () => void;
  isMobile: boolean;
}

export function CameraRig({
  targetPosition,
  viewMode,
  focusTarget,
  onArrived,
  onInterrupt,
  resetSignal,
  zoomDelta,
  onZoomConsumed,
  isMobile,
}: CameraRigProps) {
  const { camera } = useThree();
  const ctrlRef = useRef<OrbitControlsImpl>(null);
  const arriving = useRef(false);
  const vmRef = useRef<ViewMode>(viewMode);

  useEffect(() => {
    if (targetPosition) arriving.current = true;
  }, [targetPosition]);

  useEffect(() => {
    vmRef.current = viewMode;
    if (!ctrlRef.current) return;
    const c = ctrlRef.current;
    if (viewMode === "top") {
      arriving.current = false;
      camera.position.set(0, 280, 1);
      c.target.set(0, 0, 0);
      c.minPolarAngle = 0;
      c.maxPolarAngle = Math.PI * 0.2;
      c.update();
    } else if (viewMode === "orbit") {
      c.minPolarAngle = 0;
      c.maxPolarAngle = Math.PI;
      if (vmRef.current === "top") {
        camera.position.set(80, 55, 150);
        c.target.set(0, 0, 0);
        c.update();
      }
    } else if (viewMode === "focus") {
      c.minPolarAngle = 0;
      c.maxPolarAngle = Math.PI;
      if (focusTarget) {
        const ft = focusTarget.clone();
        if (isMobile) ft.y -= 12;
        c.target.copy(ft);
        c.update();
      }
    }
  }, [viewMode, camera, focusTarget, isMobile]);

  useEffect(() => {
    if (viewMode === "focus" && focusTarget && ctrlRef.current) {
      const ft = focusTarget.clone();
      if (isMobile) ft.y -= 12;
      ctrlRef.current.target.lerp(ft, 0.08);
      ctrlRef.current.update();
    }
  }, [focusTarget, viewMode, isMobile]);

  useEffect(() => {
    if (!resetSignal) return;
    arriving.current = false;
    camera.position.set(80, 55, 150);
    if (ctrlRef.current) {
      ctrlRef.current.target.set(0, 0, 0);
      ctrlRef.current.minPolarAngle = 0;
      ctrlRef.current.maxPolarAngle = Math.PI;
      ctrlRef.current.update();
    }
  }, [resetSignal, camera]);

  useEffect(() => {
    if (!zoomDelta) return;
    const t = ctrlRef.current?.target ?? new THREE.Vector3();
    const d = new THREE.Vector3().subVectors(camera.position, t).normalize();
    camera.position.addScaledVector(d, zoomDelta * 20);
    onZoomConsumed();
  }, [zoomDelta, camera, onZoomConsumed]);

  useFrame((_, delta) => {
    if (targetPosition && arriving.current && ctrlRef.current) {
      const tPos = targetPosition.clone();
      if (isMobile) tPos.y -= 12;

      const des = tPos
        .clone()
        .add(
          isMobile
            ? new THREE.Vector3(4, 38, 18)
            : new THREE.Vector3(10, 6, 22),
        );
      camera.position.lerp(des, 3.5 * delta);
      ctrlRef.current.target.lerp(tPos, 3.5 * delta);
      ctrlRef.current.update();
      if (camera.position.distanceTo(des) < 0.4) {
        arriving.current = false;
        onArrived();
        if (vmRef.current === "focus" && ctrlRef.current) {
          ctrlRef.current.target.copy(tPos);
          ctrlRef.current.update();
        }
      }
    }
  });
  return (
    <OrbitControls
      ref={ctrlRef}
      enablePan={viewMode !== "focus"}
      enableZoom
      minDistance={5}
      maxDistance={420}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      onStart={() => {
        if (vmRef.current === "orbit" || vmRef.current === "focus") {
          arriving.current = false;
          onInterrupt();
        }
      }}
    />
  );
}
