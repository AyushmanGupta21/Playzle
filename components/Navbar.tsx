"use client";

import Link from "next/link";
import { Crown } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur-sm">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 no-underline">
                <div className="relative">
                    <Crown
                        size={28}
                        className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                        fill="#facc15"
                    />
                </div>
                <span
                    className="font-pixel text-white text-sm tracking-wide"
                    style={{ fontFamily: "var(--font-pixel), monospace" }}
                >
                    CodeBox
                </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
                {["Courses", "Projects", "Pricing", "Contact Us"].map((link) => (
                    <Link
                        key={link}
                        href={link === "Courses" ? "/courses" : "#"}
                        className="text-white text-sm hover:text-yellow-400 transition-colors duration-200 no-underline"
                        style={{ fontFamily: "Arial, sans-serif", fontSize: "0.9rem" }}
                    >
                        {link}
                    </Link>
                ))}
            </div>

            {/* Signup Button */}
            <a href="/sign-in" className="btn-pixel text-xs">
                Signup
            </a>
        </nav>
    );
}
