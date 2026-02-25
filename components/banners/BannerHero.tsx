"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function BannerHero() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Base AI-generated Pixel Art Image */}
            <image href="/hero_bg.png" width="1600" height="900" preserveAspectRatio="xMidYMid slice" />

            {mounted && (
                <>
                    {/* Subtle Screen Scanlines (CRT effect) */}
                    <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
                        <rect width="4" height="2" fill="black" opacity="0.1" />
                        <rect y="2" width="4" height="2" fill="black" opacity="0.05" />
                    </pattern>
                    <rect width="1600" height="900" fill="url(#scanlines)" style={{ pointerEvents: "none" }} />

                    {/* Ambient Floating Dust Motes */}
                    {[...Array(40)].map((_, i) => (
                        <motion.rect
                            key={`dust-${i}`}
                            x={Math.random() * 1600}
                            y={Math.random() * 900}
                            width={2 + Math.random() * 3}
                            height={2 + Math.random() * 3}
                            fill="#38bdf8"
                            initial={{ opacity: 0, y: 0 }}
                            animate={{
                                opacity: [0, 0.4 + Math.random() * 0.4, 0],
                                y: -50 - Math.random() * 50,
                                x: (Math.random() - 0.5) * 50
                            }}
                            transition={{
                                duration: 5 + Math.random() * 8,
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 5
                            }}
                            style={{ mixBlendMode: "screen", filter: "blur(1px)" }}
                        />
                    ))}

                    {/* Abstract Floating Binary/Data blocks (giving a coding/matrix vibe) */}
                    {[...Array(15)].map((_, i) => (
                        <motion.text
                            key={`binary-${i}`}
                            x={Math.random() * 1600}
                            y={Math.random() * 900}
                            fill="#fbbf24"
                            fontSize={10 + Math.random() * 14}
                            fontFamily="monospace"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: [0, 0.5, 0], y: 100 + Math.random() * 100 }}
                            transition={{
                                duration: 6 + Math.random() * 6,
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 10
                            }}
                            style={{ mixBlendMode: "overlay", opacity: 0.3 }}
                        >
                            {Math.random() > 0.5 ? "1" : "0"}
                        </motion.text>
                    ))}

                    {/* Giant Ambient Pulses simulating City Neon Lights and screen glow */}
                    <motion.circle
                        cx="400" cy="450" r="300" fill="#a855f7"
                        initial={{ opacity: 0.05 }}
                        animate={{ opacity: 0.15 }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        style={{ filter: "blur(60px)", mixBlendMode: "screen" }}
                    />
                    <motion.circle
                        cx="1200" cy="500" r="250" fill="#ec4899"
                        initial={{ opacity: 0.05 }}
                        animate={{ opacity: 0.2 }}
                        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
                        style={{ filter: "blur(60px)", mixBlendMode: "screen" }}
                    />

                    {/* Glitch/Scan Laser sweeping down slowly */}
                    <motion.rect
                        width="1600" height="4" fill="#38bdf8"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 910, opacity: [0, 0.4, 0.4, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        style={{ filter: "blur(2px)", mixBlendMode: "screen" }}
                    />
                    <motion.rect
                        width="1600" height="1" fill="#ffffff"
                        initial={{ y: -8 }}
                        animate={{ y: 912 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        style={{ opacity: 0.5, mixBlendMode: "overlay" }}
                    />
                </>
            )}
        </svg>
    );
}
