"use client";

import Link from "next/link";
import CourseCard from "./CourseCard";

import { BannerReact } from "./banners/BannerReact";
import { BannerHtml } from "./banners/BannerHtml";
import { BannerCss } from "./banners/BannerCss";
import { BannerAdvance } from "./banners/BannerAdvance";

const COURSES = [
    {
        title: "React Beginner",
        description:
            "Learn the fundamentals of React, including components, props, state, and building your first interactive applications.",
        difficulty: "Beginner" as const,
        bannerComponent: <BannerReact />,
    },
    {
        title: "HTML Beginner",
        description:
            "Understand the basics of web structure using HTML tags, elements, and semantic layouts.",
        difficulty: "Beginner" as const,
        bannerComponent: <BannerHtml />,
    },
    {
        title: "CSS Beginner",
        description:
            "Master styling essentials like selectors, colors, layout, flexbox, and responsive design.",
        difficulty: "Beginner" as const,
        bannerComponent: <BannerCss />,
    },
    {
        title: "React Advance",
        description:
            "Master advanced React concepts, patterns, and real-world architecture. Build high-performance applications.",
        difficulty: "Advance" as const,
        bannerComponent: <BannerAdvance />,
    },
];

export default function CoursesSection() {
    return (
        <section className="py-20 bg-[#0a0a0a]">
            <div className="section-container">
                {/* Section Heading */}
                <div className="text-center mb-14 space-y-5">
                    <h2
                        className="text-white text-lg md:text-2xl leading-relaxed"
                        style={{ fontFamily: "var(--font-pixel), monospace" }}
                    >
                        Popular Course to Explore
                    </h2>
                    <p
                        className="text-gray-400 text-sm max-w-xl mx-auto leading-loose"
                        style={{ fontFamily: "Arial, sans-serif" }}
                    >
                        Learn Coding with interactive courses, Practical handson with real
                        life example!
                    </p>
                </div>

                {/* Course Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {COURSES.map((course) => (
                        <CourseCard key={course.title} {...course} />
                    ))}
                </div>

                {/* Explore More Button */}
                <div className="flex justify-center mt-14">
                    <Link href="/sign-in" className="btn-pixel text-xs">
                        Explore More Courses
                    </Link>
                </div>
            </div>
        </section>
    );
}
