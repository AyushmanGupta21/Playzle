"use client";
import { motion } from "framer-motion";

export function BannerCss() {
    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 180"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Original Image as Background */}
            <image href="/banner_css.png" width="400" height="180" preserveAspectRatio="xMidYMid slice" />

            {/* SVG Animated Overlays */}
            {/* Falling Leaves (Pixelated Squares) */}
            {[...Array(25)].map((_, i) => (
                <motion.rect
                    key={i}
                    x={0} y={0} width="4" height="4"
                    fill={i % 2 === 0 ? "#f59e0b" : "#dc2626"}
                    initial={{ x: 200 + Math.random() * 150, y: 30 + Math.random() * 50, opacity: 1 }}
                    animate={{ x: 150 + Math.random() * 150, y: 180, opacity: 0 }}
                    transition={{ duration: 3 + Math.random() * 5, repeat: Infinity, ease: "linear", delay: Math.random() * 3 }}
                    style={{ shapeRendering: "crispEdges" }}
                />
            ))}

            {/* Sun/Light pulse in the background tree */}
            <motion.circle
                cx="290" cy="70" r="60" fill="#fef08a"
                style={{ mixBlendMode: "overlay" }}
                initial={{ opacity: 0.1 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
        </svg>
    );
}
