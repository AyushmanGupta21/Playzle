"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { Lights } from "./Lights";
import { CeramicEnvironment } from "./CeramicEnvironment";
import { GoldCoin } from "./GoldCoin";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";

export default function Scene() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                shadows
                gl={{ antialias: true, alpha: false, toneMappingExposure: 1.1 }}
                className="w-full h-full bg-[#f0f0f0]"
            >
                <PerspectiveCamera makeDefault position={[0, 15, 15]} fov={30} />
                <OrbitControls target={[0, 0, 0]} enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} />

                <Suspense fallback={null}>
                    <color attach="background" args={['#e0e0e0']} />
                    <fog attach="fog" args={['#e0e0e0', 10, 50]} />

                    <Lights />
                    <CeramicEnvironment />
                    <GoldCoin />

                    <EffectComposer>
                        <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.9} height={300} intensity={0.5} />
                        <Noise opacity={0.05} />
                        <Vignette eskil={false} offset={0.1} darkness={0.5} />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </div>
    );
}
