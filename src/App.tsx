/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SMOOTH SCROLL — READ BEFORE ADDING SECTIONS OR PAGES
 * See: /SMOOTH_SCROLL.md and /CINEMATIC_TEXT.md for full architecture.
 *
 * TL;DR for AI models:
 *  - New sections → add inside the <div ref={containerRef}> below. Auto-smooth. ✅
 *  - New pages    → wrap with <RootLayout> from @/components/RootLayout. ✅
 *  - Headings     → wrap with <CinematicText as="h2"> for cinematic parallax. ✅
 *  - NEVER use scroll-smooth CSS, useSpring on scrollYProgress, or nested providers. ❌
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { SmoothScrollProvider } from "./components/SmoothScrollProvider";
import { CinematicText } from "./components/CinematicText";
import { KineticHeroText } from "./components/KineticHeroText";
import { useTransition } from "./components/TransitionProvider";
import { WaveMenu } from "./components/WaveMenu";
import globeImg from "./holographic_globe.png";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { SciFiGlobe } from "./components/SciFiGlobe";
import { cn } from "@/lib/utils";
import { RecentWork } from "./components/RecentWork";
import HexIcon from "./components/HexIcon";
import { Principles } from "./components/Principles";
import { Alliance } from "./components/Alliance";
import { Milestones } from "./components/Milestones";
import { Testimonials } from "./components/Testimonials";
import { Footer } from "./components/Footer";
import { Layout } from "./components/layout/Layout";

const MESSAGES = [
  "FEED AND FUEL GROWTH",
  "TURN VISION INTO VALUE",
  "UNLOCK POTENTIAL"
];

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#2F4156] flex items-center justify-center p-12"
    >
      <div className="w-full max-w-[120px]">
        <svg viewBox="0 0 200 40" className="w-full h-auto overflow-visible">
          <motion.path
            d="M0,20 Q10,15 20,25 T40,15 T60,25 T80,10 T100,30 T120,10 T140,25 T160,15 T180,25 T200,20"
            fill="none"
            stroke="#567C8D"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="400"
            animate={{
              strokeDashoffset: [400, 0, -400]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </svg>
      </div>
    </motion.div>
  );
};

// Global Transition logic moved to TransitionProvider.tsx

export default function App() {
  const { isTransitioning, isLoading, triggerLogoTransition, triggerPageTransition, heroKey } = useTransition();
  const [msgIndex, setMsgIndex] = useState(0);
  const [isWaveOpen, setIsWaveOpen] = useState(false);
  const [showStickyBrandText, setShowStickyBrandText] = useState(true);
  const navigate = useNavigate();
  const waveRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLogoClick = () => {
    if (isTransitioning) return;
    triggerLogoTransition();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setShowStickyBrandText(scrollTop < 50);
  };

  // Parallax Scroll logic for sections
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax transforms for the About section text
  const textY = useTransform(scrollYProgress, [0.3, 0.6], [100, -100]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <SmoothScrollProvider containerRef={containerRef} ease={0.09}>
      {/* LOADING SCREEN & OVERLAYS */}
      <>
        <div 
          onScroll={(e) => (e.currentTarget.scrollTop = 0)}
          className={`h-screen bg-white p-2 md:p-3 lg:p-4 font-sans select-none transition-colors duration-700 ${isWaveOpen ? "wave-open" : ""}`}
        >
          {/* Main Container Wrapper - FIXED HEIGHT */}
          <div 
            onScroll={(e) => (e.currentTarget.scrollTop = 0)}
            className="relative w-full h-full rounded-[16px] md:rounded-[28px] lg:rounded-[40px] overflow-hidden bg-[#2F4156] flex flex-col border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
          >
            <WaveMenu isOpen={isWaveOpen} onClose={() => setIsWaveOpen(false)} />

            {/* INTERNAL SCROLLABLE AREA */}
            <div 
              ref={containerRef} 
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto overflow-x-visible relative scrollbar-hide"
            >

              {/* STICKY ICONS LAYER */}
              <div className="sticky top-0 left-0 right-0 z-[200] h-0 overflow-visible pointer-events-none">
                <div className="px-6 md:px-12 lg:px-16 py-8 md:py-12 flex justify-between items-start">
                  {/* Logo (Left) */}
                  <motion.button
                    animate={{ opacity: (isWaveOpen || isTransitioning) ? 0 : 1 }}
                    className="flex items-center gap-3 pointer-events-auto cursor-pointer bg-transparent border-none p-0 outline-none"
                    onClick={handleLogoClick}
                  >
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                      <img src="/crestora_logo.png" alt="Crestora Studios" className="w-full h-full object-contain" />
                    </div>
                    <AnimatePresence>
                      {showStickyBrandText && (
                        <motion.span
                          initial={{ opacity: 0, width: 0, x: -10 }}
                          animate={{ opacity: 0.9, width: "auto", x: 0 }}
                          exit={{ opacity: 0, width: 0, x: -10 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="text-[10px] font-display font-black tracking-[0.25em] uppercase text-white leading-none whitespace-nowrap md:hidden overflow-hidden"
                        >
                          Crestora Studios
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Settings Icon (Right) */}
                  <button
                    onClick={() => setIsWaveOpen(!isWaveOpen)}
                    className="relative z-[100] flex gap-3 md:gap-4 h-14 md:h-20 items-center cursor-pointer group pointer-events-auto"
                  >
                    <div className="flex flex-col items-center h-10 md:h-14 w-px bg-white/30 relative">
                      <motion.div
                        animate={{ y: isWaveOpen ? 24 : 0, opacity: isWaveOpen ? 0 : 1 }}
                        className="absolute top-0 w-2.5 md:w-3.5 h-2.5 md:h-3.5 border-2 border-white/60 rounded-full bg-[#2F4156] -translate-x-1/2 left-1/2"
                      />
                    </div>
                    <div className="flex flex-col items-center h-6 md:h-10 w-px bg-white/50 relative">
                      <motion.div
                        animate={{ opacity: isWaveOpen ? 0 : 1 }}
                        className="absolute inset-0 bg-white/80"
                      />
                    </div>
                    <div className="flex flex-col items-center h-10 md:h-14 w-px bg-white/30 relative">
                      <motion.div
                        animate={{ y: isWaveOpen ? -24 : 0, opacity: isWaveOpen ? 0 : 1 }}
                        className="absolute bottom-0 w-2.5 md:w-3.5 h-2.5 md:h-3.5 border-2 border-white/60 rounded-full bg-[#2F4156] -translate-x-1/2 left-1/2"
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION 1: HERO */}
              <section className="h-full relative flex flex-col overflow-visible shrink-0">
                {/* Main Content Area with Parallax */}
                <motion.div
                  animate={{
                    y: isWaveOpen ? 60 : 0,
                    opacity: isWaveOpen ? 0 : 1,
                    scale: isWaveOpen ? 0.98 : 1
                  }}
                  style={{ pointerEvents: isWaveOpen ? "none" : "auto" }}
                  transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                    delay: isWaveOpen ? 0 : 0.4
                  }}
                  className="flex-1 flex flex-col z-10"
                >
                  {/* Hero Header (Brand Name only - scrolls with hero) */}
                  <Layout className="pt-8 md:pt-12 pb-6 hidden md:flex items-center pointer-events-auto">
                    <div className="w-10 h-10 md:w-14 md:h-14 opacity-0 shrink-0" />
                    <button onClick={() => triggerLogoTransition()} className="ml-3 md:ml-5 hover:opacity-80 transition-opacity flex items-center gap-2">
                      <span className="text-[9px] md:text-xs font-display font-black tracking-[0.2em] md:tracking-[0.3em] uppercase text-white/90 leading-none">
                        Crestora Studios
                      </span>
                    </button>
                  </Layout>

                  {/* Main Hero Content */}
                  <main className="flex-1 relative flex flex-col justify-center pt-0 -mt-12 md:mt-0 pointer-events-none">
                    {/* Hexagonal Molecular Structure Background */}
                    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                      <motion.div
                        animate={{ x: [-10, 10, -10], y: [-10, 10, -10] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-5%] opacity-15 md:opacity-30 translate-z-0 will-change-transform"
                      >
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <pattern id="fullHexGrid" width="50" height="86" patternUnits="userSpaceOnUse" patternTransform="scale(1.2) rotate(15)">
                              <path d="M25 0 L50 14.4 L50 43.1 L25 57.5 L0 43.1 L0 14.4 Z"
                                fill="none"
                                stroke="white"
                                strokeOpacity="0.1"
                                strokeWidth="0.5" />
                            </pattern>
                            <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#567C8D" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#fullHexGrid)" />
                          <rect width="100%" height="100%" fill="url(#bgGlow)" />
                        </svg>
                      </motion.div>
                    </div>

                    {/* Rotating Holographic 3D Globe */}
                    <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] md:w-[36vw] md:h-[36vw] lg:w-[30vw] lg:h-[30vw] z-10 opacity-60 mix-blend-screen pointer-events-none [mask-image:radial-gradient(circle_at_center,white_55%,transparent_75%)]">
                      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                        <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={50} />
                        <ambientLight intensity={0.3} />
                        <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
                        <SciFiGlobe />
                      </Canvas>
                    </div>

                    {/* Typography Grid Overlay */}
                    <Layout className="relative z-20 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 px-6 md:px-32 lg:px-40">
                      <div className="md:col-span-12 lg:col-span-7 flex items-center justify-center md:justify-start">
                        <KineticHeroText
                          key={`creative-${heroKey}`}
                          as="h1"
                          className="font-display text-[18vw] md:text-[15vw] lg:text-[12vw] leading-[0.75] tracking-[-0.06em] uppercase text-white pointer-events-auto hover:text-[#567C8D] transition-colors duration-500 font-black"
                          delay={0.2}
                        >
                          CREATIVE
                        </KineticHeroText>
                      </div>
                      <div className="md:col-span-12 lg:col-start-8 lg:col-span-5 flex flex-col items-center md:items-end text-center md:text-right">
                        <KineticHeroText
                          key={`web-${heroKey}`}
                          as="span"
                          className="font-display text-[18vw] md:text-[15vw] lg:text-[12vw] leading-[0.75] tracking-[-0.06em] uppercase text-[#567C8D] pointer-events-auto hover:text-white transition-colors duration-500 font-black"
                          delay={0.4}
                        >
                          WEB
                        </KineticHeroText>
                        <KineticHeroText
                          key={`studio-${heroKey}`}
                          as="span"
                          className="font-display text-[18vw] md:text-[15vw] lg:text-[12vw] leading-[0.75] tracking-[-0.06em] uppercase text-white pointer-events-auto hover:text-[#567C8D] transition-colors duration-500 font-black"
                          delay={0.6}
                        >
                          STUDIO
                        </KineticHeroText>
                      </div>
                    </Layout>
                  </main>

                  {/* Footer Area inside Hero */}
                  <Layout className="grid grid-cols-12 gap-4 md:gap-8 pt-0 pb-4 md:py-12 -mt-12 md:mt-0 items-center md:items-end px-6 md:px-32 lg:px-40">
                    <div className="hidden md:flex md:col-span-12 lg:col-span-4 items-center justify-center md:justify-start md:items-end pointer-events-none md:h-[220px]">
                      <span className="text-[10px] md:text-xs font-black tracking-[0.4em] uppercase text-white/30 whitespace-nowrap">
                        [ SCROLL ]
                      </span>
                    </div>
                    <div className="col-span-12 md:col-start-6 md:col-span-10 lg:col-start-7 lg:col-span-6 space-y-4 md:space-y-6 flex flex-col items-center md:items-start lg:items-end w-full">
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => triggerPageTransition("/work/mavren")}
                        className="group cursor-pointer flex items-center gap-3 md:gap-8 border border-white/20 rounded-xl w-full px-4 md:px-8 py-5 bg-white/[0.02] backdrop-blur-xl hover:bg-white/5 transition-all duration-300 pointer-events-auto overflow-hidden min-h-[64px]"
                      >
                        <span className="text-[8px] sm:text-[9px] md:text-xs font-black tracking-[0.2em] md:tracking-[0.25em] uppercase text-white/90 whitespace-nowrap shrink-0">LATEST PROJECT</span>
                        <div className="flex-1 h-[0.5px] bg-white/20 relative min-w-[10px] sm:min-w-[20px]">
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 text-lg md:text-xl font-light">→</span>
                        </div>
                        <span className="text-[8px] sm:text-[9px] md:text-xs font-black tracking-[0.2em] md:tracking-[0.25em] uppercase text-white whitespace-nowrap shrink-0">MAVREN</span>
                      </motion.div>
                      <p className="text-[10px] md:text-[12px] lg:text-[13px] leading-[1.6] text-white/50 font-black tracking-tighter uppercase text-center md:text-left lg:text-right max-w-full md:max-w-[450px] lg:max-w-[500px]">
                        WE SPECIALIZE IN CREATING MEANINGFUL DIGITAL <br className="hidden md:block" />
                        EXPERIENCES INFUSED WITH EMOTION, DRIVEN BY <br className="hidden md:block" />
                        INNOVATION, EVOKING A SENSE OF AWE AND WONDER.
                      </p>
                    </div>
                  </Layout>
                </motion.div>
              </section>

              {/* SECTION 2: ABOUT */}
              <section className="min-h-screen bg-[#2F4156] relative py-32 overflow-hidden shrink-0 transform-gpu translate-z-0">
                <Layout className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 items-start h-full">
                  {/* Background red ambient glow */}
                  <motion.div
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#567C8D]/10 blur-[120px] rounded-full pointer-events-none will-change-opacity transform-gpu translate-z-0"
                  />

                  {/* Left Side: About Label (Col 1-2) */}
                  <div className="md:col-span-2 flex items-start pt-2 md:sticky md:top-40 z-20">
                    <div className="flex items-center gap-3">
                      <HexIcon className="w-3.5 h-3.5" fill="#567C8D" />
                      <span className="text-white text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase whitespace-nowrap">ABOUT</span>
                    </div>
                  </div>

                  {/* Middle: Description (Col 3-5) */}
                  <div className="md:col-span-3 space-y-6 md:sticky md:top-40 z-20 pr-4">
                    <p className="text-white text-[13px] md:text-[15px] lg:text-[17px] font-display font-black tracking-[-0.04em] leading-[1.3] uppercase opacity-90">
                      WITH A DECADE OF<br />
                      EXPERIENCE UNDER OUR<br />
                      BELTS, Crestora Studios HAS<br />
                      BECOME A WORLD -<br />
                      RENOWNED STUDIO
                    </p>
                  </div>

                  {/* Right Side: Animated Headline (Col 6-12) */}
                  <div className="md:col-span-7 flex flex-col z-20">
                    {[
                      "DELIVERING",
                      "INNOVATIVE DESIGN",
                      "AND DEVELOPMENT",
                      "WITH IMPACTFUL",
                      "DIGITAL MARKETING",
                      "CAMPAIGNS THAT",
                      "CATAPULT BRANDS",
                      "FORWARD."
                    ].map((line, i) => (
                      <div key={i} className="overflow-hidden">
                        <CinematicText
                          as="h2"
                          className={cn(
                            "text-4xl md:text-5xl lg:text-[4.5vw] leading-[1.05] uppercase transition-colors duration-500 cursor-default flex flex-wrap",
                            ["INNOVATIVE DESIGN", "DIGITAL MARKETING", "FORWARD."].includes(line)
                              ? "text-[#567C8D] hover:text-white"
                              : "text-white hover:text-[#567C8D]"
                          )}
                          intensity={0.75}
                        >
                          {line}
                        </CinematicText>
                      </div>
                    ))}

                    {/* Navigation Links (ABOUT US & SERVICES) */}
                    <div className="mt-16 md:mt-24 flex gap-12 md:gap-20 items-center justify-start pointer-events-auto">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ delay: 1, duration: 0.8 }}
                        whileHover={{ y: -2 }}
                        className="group cursor-pointer"
                        onClick={() => navigate("/studio")}
                      >
                        <span className="text-white font-display font-black text-[10px] md:text-xs tracking-[-0.02em] uppercase">ABOUT US</span>
                        <div className="h-px bg-white/30 w-full mt-3 group-hover:bg-white transition-all duration-300" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ delay: 1.1, duration: 0.8 }}
                        whileHover={{ y: -2 }}
                        className="group cursor-pointer"
                        onClick={() => navigate("/services")}
                      >
                        <span className="text-white font-display font-black text-[10px] md:text-xs tracking-[-0.02em] uppercase">SERVICES</span>
                        <div className="h-px bg-white/30 w-full mt-3 group-hover:bg-white transition-all duration-300" />
                      </motion.div>
                    </div>
                  </div>
                </Layout>
              </section>

              {/* SECTION 3: RECENT WORK */}
              <RecentWork containerRef={containerRef} />
              <div className="h-16 md:h-20 shrink-0" />

              {/* SECTION 4: PRINCIPLES */}
              <Principles containerRef={containerRef} />
              <div className="h-[60vh] shrink-0" />

              {/* SECTION 5: ALLIANCE */}
              <Alliance containerRef={containerRef} />
              <div className="h-32 md:h-48 shrink-0" />

              {/* SECTION 6: MILESTONES */}
              <Milestones containerRef={containerRef} />

              {/* SECTION 7: TESTIMONIALS */}
              <Testimonials />

              {/* SECTION 8: FOOTER */}
              <Footer />

              {/* Background Grain/Noise Texture Layer */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
             </div>
          </div>
        </div>
      </>
    </SmoothScrollProvider>
  );
}
