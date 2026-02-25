"use client";

import { BannerHero } from "./banners/BannerHero";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative w-full min-h-screen flex flex-col items-start justify-center overflow-hidden">
            {/* Background Pixel Art Scene */}
            <div className="absolute inset-0 z-0">
                <BannerHero />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/50 pointer-events-none" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 section-container w-full flex flex-col items-start justify-center min-h-screen py-32">
                <div className="max-w-2xl space-y-8">

                    {/* Main Heading */}
                    <h1
                        className="font-pixel text-white leading-loose text-3xl md:text-4xl lg:text-5xl"
                        style={{ fontFamily: "var(--font-pixel), monospace" }}
                    >
                        Start Your{" "}
                        <br />
                        <span className="text-yellow-400">Coding</span>
                        <br />
                        <span className="text-yellow-400">Adventure</span>
                    </h1>

                    {/* Subtitle */}
                    <p
                        className="font-pixel text-gray-200 text-xs md:text-sm leading-loose max-w-lg"
                        style={{ fontFamily: "var(--font-pixel), monospace" }}
                    >
                        Beginner friendly coding courses
                        <br />
                        and projects
                    </p>

                    {/* CTA Button */}
                    <div className="pt-4">
                        <Link href="/sign-in" className="btn-pixel text-sm">
                            GET STARTED
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
