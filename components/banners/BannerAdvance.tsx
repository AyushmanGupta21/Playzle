"use client";
import { motion } from "framer-motion";

export function BannerAdvance() {
    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 180"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Original Image as Background */}
            <image href="/banner_react_advance.png" width="400" height="180" preserveAspectRatio="xMidYMid slice" />

            {/* SVG Animated Overlays */}

            {/* Screen Glow */}
            <motion.rect
                x="150" y="40" width="100" height="80" fill="#34d399"
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ pointerEvents: "none", mixBlendMode: "overlay", filter: "blur(10px)" }}
            />

            {/* City Light Pulses / Floating Dust inside room */}
            {[...Array(8)].map((_, i) => (
                <motion.circle
                    key={i}
                    cx={200 + Math.random() * 150}
                    cy={50 + Math.random() * 100}
                    r="1.5"
                    fill="cyan"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 0.8, 0], y: -20 }}
                    transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                    style={{ mixBlendMode: "screen", filter: "blur(0.5px)" }}
                />
            ))}

            {/* Lava Lamp Subtle Pulse (assuming it sits somewhere right of desk) */}
            <motion.ellipse
                cx="320" cy="120" rx="15" ry="30" fill="#ef4444"
                style={{ mixBlendMode: "screen" }}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
        </svg>
    );
}
