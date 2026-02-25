"use client";
import { motion } from "framer-motion";

export function BannerReact() {
    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 180"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Original Image as Background */}
            <image href="/banner_react.png" width="400" height="180" preserveAspectRatio="xMidYMid slice" />

            {/* Animated SVG Overlays */}
            {/* Sun glow effect */}
            <motion.circle
                cx="200" cy="50" r="30" fill="#facc15"
                style={{ mixBlendMode: "overlay" }}
                initial={{ opacity: 0.2, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1.2 }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />

            {/* Animated Clouds */}
            <motion.g
                initial={{ x: -100 }}
                animate={{ x: 500 }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            >
                <path d="M40 40 h30 v10 h20 v10 h-70 v-10 h20 z" fill="white" opacity="0.4" style={{ shapeRendering: "crispEdges" }} />
            </motion.g>

            <motion.g
                initial={{ x: -250 }}
                animate={{ x: 500 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
                <path d="M140 70 h40 v10 h30 v10 h-100 v-10 h30 z" fill="white" opacity="0.3" style={{ shapeRendering: "crispEdges" }} />
            </motion.g>

            <motion.g
                initial={{ x: -50 }}
                animate={{ x: 500 }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            >
                <path d="M0 60 h20 v10 h15 v5 h-50 v-5 h15 z" fill="white" opacity="0.5" style={{ shapeRendering: "crispEdges" }} />
            </motion.g>
        </svg>
    );
}
