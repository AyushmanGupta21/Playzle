"use client";

import Link from "next/link";
import Image from "next/image";

interface CourseCardProps {
    title: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advance";
    bannerImage?: string;
    bannerComponent?: React.ReactNode;
    href?: string;
}

export default function CourseCard({
    title,
    description,
    difficulty,
    bannerImage,
    bannerComponent,
    href = "/sign-in",
}: CourseCardProps) {
    const difficultyColor =
        difficulty === "Beginner"
            ? "#4ade80"
            : difficulty === "Intermediate"
                ? "#facc15"
                : "#f87171";

    return (
        <Link href={href} className="no-underline">
            <div className="course-card group">
                {/* Banner Image */}
                <div className="relative w-full h-[180px] overflow-hidden bg-zinc-900 border-b border-[#222]">
                    {bannerComponent ? (
                        <div className="w-full h-full group-hover:scale-105 transition-transform duration-500 will-change-transform">
                            {bannerComponent}
                        </div>
                    ) : bannerImage ? (
                        <Image
                            src={bannerImage}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
                        />
                    ) : null}
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                    <h3
                        className="text-white font-bold text-base leading-snug"
                        style={{ fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700 }}
                    >
                        {title}
                    </h3>
                    <p
                        className="text-gray-400 text-sm leading-relaxed line-clamp-2"
                        style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "0.85rem" }}
                    >
                        {description}
                    </p>

                    {/* Difficulty Tag */}
                    <div className="pt-1">
                        <span className="difficulty-tag">
                            {/* Bar chart icon */}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="20" x2="18" y2="10" />
                                <line x1="12" y1="20" x2="12" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                            <span style={{ color: difficultyColor }}>{difficulty}</span>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
