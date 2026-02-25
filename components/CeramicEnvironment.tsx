"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { getCoinPath } from "../utils/curve";

export function CeramicEnvironment() {
    const curve = useMemo(() => getCoinPath(), []);

    return (
        <group position={[0, -2, 0]}>
            {/* The Main Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial
                    color="#eeeeee"
                    roughness={0.5}
                    metalness={0.1}
                />
            </mesh>

            {/* The "Serpentine" Track - Massive Tube */}
            <mesh position={[0, 0, 0]} receiveShadow castShadow>
                <tubeGeometry args={[curve, 200, 2, 32, true]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    roughness={0.2}
                    metalness={0.1}
                    clearcoat={0.5}
                    clearcoatRoughness={0.1}
                />
            </mesh>
        </group>
    );
}
