import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import CoursesSection from "../components/CoursesSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <HeroSection />
      <CoursesSection />
    </main>
  );
}
