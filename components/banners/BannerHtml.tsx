"use client";
import { motion } from "framer-motion";

export function BannerHtml() {
    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 180"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Original Image as Background */}
            <image href="/banner_html.png" width="400" height="180" preserveAspectRatio="xMidYMid slice" />

            {/* SVG Animated Overlays */}
            {/* Glowing Fireflies */}
            {[...Array(20)].map((_, i) => (
                <motion.rect
                    key={i}
                    x={100 + Math.random() * 200}
                    y={60 + Math.random() * 100}
                    width="3"
                    height="3"
                    fill="#a3e635"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: [0, -20, 0], x: [0, 15, -15, 0] }}
                    transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ mixBlendMode: "screen", filter: "blur(0.5px)" }}
                />
            ))}

            {/* Subtle Moon Overlay pulse */}
            <motion.circle
                cx="320" cy="40" r="30" fill="#fef08a"
                style={{ mixBlendMode: "overlay" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
        </svg>
    );
}
