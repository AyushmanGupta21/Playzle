"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCoinPath } from "../utils/curve";

export function GoldCoin() {
    const meshRef = useRef<THREE.Group>(null);
    const coinRef = useRef<THREE.Mesh>(null);

    // Define the path: Circle -> S-Curve -> Winding Path
    const curve = useMemo(() => getCoinPath(), []);

    const progress = useRef(0);
    const speed = 0.002; // Adjust for smoothness

    useFrame((state, delta) => {
        if (!meshRef.current || !coinRef.current) return;

        // Advance progress
        progress.current = (progress.current + speed) % 1;

        // Get position on curve
        const position = curve.getPointAt(progress.current);
        const tangent = curve.getTangentAt(progress.current).normalize();

        // Smoothly interpolate position
        meshRef.current.position.copy(position);
        meshRef.current.position.y += 2.2; // Sit on top of the tube (Tube rad 2 + Coin rad 1 - intersection)

        // Orientation: Look along the path
        // We construct a lookAt matrix but want to maintain "up" as Y for now
        // But for a rolling coin, the axis of rotation is perpendicular to the motion.

        // 1. Align the Group to the path direction (Tangent)
        // Tangent is X-Z plane direction mainly.
        // We want the coin's "forward" edge to face the tangent.
        // Using lookAt directly might flip it, let's use a dummy object logic if needed, 
        // but calculating rotation from tangent is cleaner.

        const up = new THREE.Vector3(0, 1, 0);
        const axis = new THREE.Vector3().crossVectors(up, tangent).normalize(); // The axle of the wheel

        // Bank/Lean calculation based on curvature (simplified as centrifugal force proxy)
        // We'll lean *into* the turn. 
        // If tangent is turning left, lean left.
        // We can estimate turn by comparing tangent to next tangent or just use a slight noise/sine for "leanness" visual
        const leanFactor = Math.sin(state.clock.elapsedTime * 2) * 0.1;

        // Apply rotation to the GROUP mostly for the Path alignment
        // Actually, simple lookAt is enough for the group, then we rotate the coin mesh locally.
        const lookAtPos = curve.getPointAt((progress.current + 0.01) % 1);
        meshRef.current.lookAt(lookAtPos);

        // Apply Rolling animation to the COIN MESH (Internal rotation)
        // Rolling speed = speed / radius roughly
        // Coin radius is approx 1. So it rotates 2PI per circumference.
        // Distance travelled approx... just rotate constantly based on speed.
        coinRef.current.rotation.x -= 0.1; // Rolling forward relative to group

        // Apply Lean to the COIN MESH (Z rotation relative to group)
        // Centrifugal lean: 
        coinRef.current.rotation.z = -leanFactor; // Tilt side-to-side

    });

    return (
        <group ref={meshRef} position={[0, 1, 0]}>
            {/* The Coin Mesh - Rotated so cylinder flat side is the face */}
            {/* Cylinder args: [radiusTop, radiusBottom, height, radialSegments] */}
            {/* We want a standing coin, so we rotate cylinder 90deg on Z originally? 
           Cylinder default is upright (Y is height). 
           We want it rolling like a wheel. So Height axis should be horizontal.
           Rotate Z 90deg maps Y-height to X-horizontal.
       */}
            <mesh ref={coinRef} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                {/* Chamfered Cylinder for better light catching */}
                <cylinderGeometry args={[1, 1, 0.15, 64]} />
                <meshStandardMaterial
                    color="#FFD700"
                    metalness={1}
                    roughness={0.05}
                    envMapIntensity={2.5}
                />
            </mesh>
        </group>
    );
}
