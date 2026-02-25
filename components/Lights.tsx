"use client";

import { Environment, Float } from "@react-three/drei";

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} color="#ffffff" />

      {/* Top-Left: Deep Electric Purple (#7000FF) - Key Light */}
      <spotLight
        position={[-10, 10, 10]}
        angle={0.8}
        penumbra={1}
        intensity={800}
        color="#5000FF"
        castShadow
        shadow-bias={-0.0001}
      />

      {/* Soft Purple Fill instead of RectAreaLight to ensure compatibility */}
      <pointLight
        position={[-10, 5, 5]}
        intensity={200}
        distance={50}
        decay={2}
        color="#7000FF"
      />

      {/* Bottom-Right: Vibrant Magenta (#FF00E5) */}
      <spotLight
        position={[10, 0, 10]}
        angle={1}
        penumbra={1}
        intensity={600}
        color="#FF00E5"
        castShadow
        shadow-bias={-0.0001}
      />

      {/* Environment for Reflections (The Gold needs this) */}
      <Environment preset="studio" blur={1} />
    </>
  );
}
