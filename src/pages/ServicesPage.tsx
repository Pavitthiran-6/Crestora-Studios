"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Footer } from "../components/Footer";
import { SmoothScrollProvider } from "../components/SmoothScrollProvider";
import { useTransition } from "../components/TransitionProvider";
import { WaveMenu } from "../components/WaveMenu";
import { CinematicText } from "../components/CinematicText";
import { cn } from "@/lib/utils";
import HexIcon from "../components/HexIcon";

/* --- ASSET IMPORTS (Generated) --- */
import valaclavaImg from "../assets/projects/valaclava_project_hero_1778243074252.png";
import oceanImg from "../assets/projects/ocean_agency_hero_1778243090443.png";
import yogiImg from "../assets/projects/hoboken_yogi_hero_1778243105729.png";
import mdImg from "../assets/projects/modern_md_hero_1778243119932.png";

const ROTATING_TITLES = [
  "RESULTS-DRIVEN",
  "COMPELLING",
  "GOAL-ORIENTED",
  "CREATIVE"
];

const SERVICES = [
  "Website development",
  "Mobile applications",
  "Logo design",
  "Poster design",
  "Video editing",
  "Motion graphics",
  "SEO",
  "3D animation",
  "Digital marketing",
  "Website and app maintenance",
  "Cyber security solutions"
];



const PROCESS_STEPS = [
  {
    id: "01",
    title: "PROJECT STRATEGY",
    desc: "Fusing creative vision with technical scoping. We define the blueprint for custom website development, mobile applications, marketing programs, and security protocols, aligning your brand goals with clear execution paths."
  },
  {
    id: "02",
    title: "DESIGN & MOTION",
    desc: "Fusing visual aesthetics with kinetic flow. We craft bespoke logo design, print posters, and UI layouts, then bring them to life with dynamic motion graphics, professional video editing, and immersive 3D animation."
  },
  {
    id: "03",
    title: "SMOOTH DEVELOPMENT",
    desc: "Building robust, high-performance systems. We engineer responsive web applications and hybrid mobile apps, utilizing modern code standards to guarantee fast page rendering speeds, security, and smooth device transitions."
  },
  {
    id: "04",
    title: "POWERFUL MARKETING",
    desc: "Scaling brand presence and conversion rates. We execute targeted digital marketing campaigns and surgical search engine optimization (SEO) frameworks to drive high-intent organic traffic and maximize marketing ROI."
  },
  {
    id: "05",
    title: "ONGOING SUPPORT",
    desc: "Protecting system health proactively. Through our website and app maintenance protocols, we manage server diagnostics, data backups, and code checkups, ensuring your platform retains peak operational health."
  },
  {
    id: "06",
    title: "FUTURE EVOLUTION",
    desc: "Hardening infrastructure for tomorrow's scale. We deploy robust cyber security solutions including mock penetration testing, access locks, and threat monitoring, preparing your digital architecture for future growth."
  },
  {
    id: "07",
    title: "SCALABLE GROWTH",
    desc: "Fostering long-term market leadership. We continually refine our design, coding, marketing, and security operations, utilizing data analytics to scale your brand and achieve sustainable business growth."
  }
];

const RESULTS = [
  { name: "VALACLAVA", metric: "+126%", label: "ENGAGEMENT", img: valaclavaImg },
  { name: "OCEAN AGENCY", metric: "+224%", label: "SESSIONS", img: oceanImg },
  { name: "HOBOKEN YOGI", metric: "+62%", label: "CONVERSIONS", img: yogiImg },
  { name: "MODERN MD", metric: "120 sec", label: "AVG. VISIT DUR.", img: mdImg }
];

export default function ServicesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isTransitioning, triggerLogoTransition, triggerPageTransition } = useTransition();
  const [isWaveOpen, setIsWaveOpen] = useState(false);

  return (
    <SmoothScrollProvider containerRef={containerRef} ease={0.09}>
      <div 
        onScroll={(e) => (e.currentTarget.scrollTop = 0)}
        className="h-screen bg-white p-2 md:p-3 lg:p-4 font-sans select-none transition-colors duration-700"
      >
        <div 
          onScroll={(e) => (e.currentTarget.scrollTop = 0)}
          className="relative w-full h-full rounded-[16px] md:rounded-[28px] lg:rounded-[40px] overflow-hidden bg-[#2F4156] flex flex-col border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
        >
          {/* WAVE MENU OVERLAY */}
          <WaveMenu isOpen={isWaveOpen} onClose={() => setIsWaveOpen(false)} />
          <div ref={containerRef} className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide">

            {/* HEADER LAYER */}
            <div className="sticky top-0 left-0 right-0 z-[200] h-0 overflow-visible pointer-events-none">
              <div className="px-6 md:px-12 lg:px-16 py-8 md:py-12 flex justify-between items-start">
                {/* Logo (Left) */}
                <button onClick={() => triggerLogoTransition()} className="pointer-events-auto group">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                    <img src="/crestora_logo.png" alt="Crestora Studios" className="w-full h-full object-contain" />
                  </div>
                </button>

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

            {/* 1. HERO SECTION */}
            <ServicesHero />

            {/* 2. WHAT WE DO */}
            <WhatWeDo />

            {/* 3. WORKFLOW */}
            <WorkflowSection />

            {/* 4. RESULTS DRIVEN */}
            <ResultsDriven />

            {/* FOOTER */}
            <Footer />
          </div>
        </div>
      </div>
    </SmoothScrollProvider>
  );
}

/* --- SECTION 1: SERVICES HERO --- */

function ServicesHero() {
  const { triggerLogoTransition, triggerPageTransition } = useTransition();
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const rotateHero = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % ROTATING_TITLES.length);
      setIsAnimating(false);
    }, 600);
  };

  useEffect(() => {
    // Only auto-rotate on mobile (screen width < 768px)
    if (typeof window === "undefined") return;
    
    const checkMobile = () => window.innerWidth < 768;
    if (!checkMobile()) return;

    const interval = setInterval(() => {
      if (isAnimating) return;
      setIsAnimating(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ROTATING_TITLES.length);
        setIsAnimating(false);
      }, 600);
    }, 1800);

    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <>
      {/* DESKTOP VIEWPORT: 100% UNCHANGED */}
      <section className="hidden md:flex h-screen relative flex-col justify-center overflow-hidden">
        <div className="absolute top-[10%] left-20 md:left-32 lg:left-40 z-10 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => triggerLogoTransition()}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
          >
            <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 leading-none">Crestora Studios</span>
          </button>
          <HexIcon className="w-2.5 h-2.5" fill="#567C8D" />
          <span
            onClick={() => triggerPageTransition("/services")}
            className="text-[10px] font-black tracking-[0.3em] uppercase text-[#567C8D] hover:text-white transition-colors cursor-pointer"
          >
            SERVICES
          </span>
        </div>

        <Layout className="relative h-full flex flex-col justify-center">
          <div className="w-full flex flex-col pt-20">
            <div className="flex flex-col w-full">
              <div className="overflow-hidden h-[10vw] md:h-[8.5vw] flex justify-start">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={index}
                    className="text-[10vw] md:text-[8.5vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-[#567C8D] flex overflow-hidden"
                  >
                    {ROTATING_TITLES[index].split("").map((char, i) => (
                      <motion.span
                        key={`${index}-${i}`}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{
                          duration: 0.5,
                          ease: [0.16, 1, 0.3, 1],
                          delay: i * 0.02
                        }}
                        className="inline-block"
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </motion.h1>
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-6 md:gap-10 pl-[5vw] md:pl-[10vw]">
                <div className="relative group shrink-0">
                  <div className="absolute inset-0 bg-[#567C8D]/20 rounded-full animate-ping" />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={rotateHero}
                    className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#567C8D] flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(239,59,93,0.3)]"
                  >
                    <RotateCcw className={`text-white w-6 h-6 md:w-10 md:h-10 transition-transform duration-700 ${isAnimating ? "rotate-180" : "group-hover:rotate-45"}`} />
                  </motion.button>
                </div>

                <div className="overflow-hidden h-[10vw] md:h-[8.5vw]">
                  <h1 className="text-[10vw] md:text-[8.5vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-white">
                    SOLUTIONS
                  </h1>
                </div>
              </div>

              <div className="overflow-hidden h-[10vw] md:h-[8.5vw] flex justify-center">
                <h1 className="text-[10vw] md:text-[8.5vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-white">
                  THAT HELP YOUR
                </h1>
              </div>

              <div className="overflow-hidden h-[10vw] md:h-[8.5vw] flex justify-end">
                <h1 className="text-[10vw] md:text-[8.5vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-white">
                  BUSINESS
                </h1>
              </div>
            </div>
          </div>
        </Layout>
      </section>

      {/* MOBILE VIEWPORT: PREMIUM STUDIO-STYLE HERO */}
      <section className="flex md:hidden relative h-auto min-h-[80vh] flex-col justify-center overflow-hidden shrink-0 pb-12">
        {/* Hex Grid Background (Imported from StudioPage) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="heroHexGrid" width="50" height="86" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                <path d="M25 0 L50 14.4 L50 43.1 L25 57.5 L0 43.1 L0 14.4 Z" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroHexGrid)" />
          </svg>
        </div>

        {/* Breadcrumb Nav (Studio Style: Left aligned and premium gap) */}
        <div className="absolute top-[10%] left-8 sm:left-12 z-20 flex items-center gap-4 pointer-events-auto">
          <button
            onClick={() => triggerLogoTransition()}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
          >
            <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 leading-none">Crestora Studios</span>
          </button>
          <HexIcon className="w-2.5 h-2.5 translate-y-[0.5px]" fill="#567C8D" />
          <span
            onClick={() => triggerPageTransition("/services")}
            className="text-[10px] font-black tracking-[0.4em] uppercase text-[#567C8D] hover:text-white transition-colors cursor-pointer leading-none"
          >
            SERVICES
          </span>
        </div>

        <Layout className="relative z-10 h-full flex flex-col">
          <div className="w-full flex flex-col pt-28">
            <div className="flex flex-col w-full">
              {/* Row 1: Rotating Title (Studio style: scale-y-[1.5] and dynamic size to fit) */}
              <div className="overflow-hidden h-[23vw] flex items-center justify-start">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={index}
                    className={cn(
                      "font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-[#567C8D] flex overflow-hidden scale-y-[1.5] origin-center",
                      ROTATING_TITLES[index] === "RESULTS-DRIVEN" ? "text-[9.5vw]" :
                      ROTATING_TITLES[index] === "GOAL-ORIENTED" ? "text-[10vw]" :
                      ROTATING_TITLES[index] === "COMPELLING" ? "text-[13vw]" :
                      "text-[14vw]"
                    )}
                  >
                    {ROTATING_TITLES[index].split("").map((char, i) => (
                      <motion.span
                        key={`${index}-${i}`}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{
                          duration: 0.35,
                          ease: [0.16, 1, 0.3, 1],
                          delay: i * 0.015
                        }}
                        className="inline-block"
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </motion.h1>
                </AnimatePresence>
              </div>

              {/* Row 2: Static Word & Button (WEBSITES - pl-[5vw], scale-y-[1.5]) */}
              <div className="flex items-center gap-4 pl-[5vw]">
                <div className="relative group shrink-0 pointer-events-auto">
                  <div className="absolute inset-0 bg-[#567C8D]/20 rounded-full animate-ping" />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={rotateHero}
                    className="w-12 h-12 rounded-full bg-[#567C8D] flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(239,59,93,0.3)]"
                  >
                    <RotateCcw className={`text-white w-5 h-5 transition-transform duration-700 ${isAnimating ? "rotate-180" : "group-hover:rotate-45"}`} />
                  </motion.button>
                </div>

                <div className="overflow-hidden h-[23vw] flex items-center">
                  <h1 className="text-[14vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-white whitespace-nowrap scale-y-[1.5] origin-center">
                    SOLUTIONS
                  </h1>
                </div>
              </div>

              {/* Row 3: Static Word (THAT HELP YOUR - justify-center, text-[10.5vw] to fit on mobile perfectly, scale-y-[1.5]) */}
              <div className="overflow-hidden h-[23vw] flex items-center justify-center">
                <h1 className="text-[10.5vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-white whitespace-nowrap scale-y-[1.5] origin-center">
                  THAT HELP YOUR
                </h1>
              </div>

              {/* Row 4: Static Word (BUSINESS - justify-end, scale-y-[1.5]) */}
              <div className="overflow-hidden h-[23vw] flex items-center justify-end">
                <h1 className="text-[14vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-white whitespace-nowrap scale-y-[1.5] origin-center">
                  BUSINESS
                </h1>
              </div>
            </div>
          </div>
        </Layout>

        {/* Background grain hint */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </section>
    </>
  );
}

/* --- SECTION 2: WHAT WE DO --- */

function WhatWeDo() {
  const { triggerLogoTransition, triggerPageTransition } = useTransition();
  return (
    <section className="min-h-screen py-32 md:py-48 border-t border-white/5 bg-[#2F4156]">
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
          <div className="md:col-span-5 flex flex-col items-start gap-8">
            <CinematicText className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">WHAT WE DO</CinematicText>
            <CinematicText as="h2" className="text-5xl md:text-6xl font-display font-black tracking-[-0.04em] uppercase leading-[0.95] text-white">
              <span className="whitespace-nowrap">WE DESIGN,</span><br />
              <span className="whitespace-nowrap">BUILD & SCALE</span><br />
              <span className="text-[#567C8D] whitespace-nowrap">YOUR VISION.</span>
            </CinematicText>
            <p className="text-lg md:text-xl font-display font-black tracking-[-0.02em] leading-relaxed opacity-40 uppercase">
              Crestora is a creative technology and digital solutions company helping businesses build, grow, and scale their brand in the digital world. We specialize in website development, mobile applications, logo design, poster design, video editing, motion graphics, SEO, 3D animation including (3D advertising), digital marketing, website and app maintenance, and cyber security solutions. By combining creativity, technology, and strategy, we deliver impactful digital experiences that drive business growth and strengthen brand presence.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0 }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                  delayChildren: 0.1
                }
              }
            }}
            className="md:col-span-7 flex flex-col pt-12"
          >
            {SERVICES.map((service) => (
              <motion.div
                key={service}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 1.2,
                      ease: [0.16, 1, 0.3, 1]
                    }
                  }
                }}
                className="group flex flex-col"
              >
                <div className="w-full h-px bg-white/10 group-hover:bg-[#567C8D] transition-colors duration-500 scale-x-0 group-hover:scale-x-100 origin-left" />
                <div className="w-full h-px bg-white/5" />
                <div className="py-6 md:py-8 flex items-center justify-between cursor-pointer group" onClick={() => {
                  const slug = service.toLowerCase().replace(/ /g, "-");
                  triggerPageTransition(`/${slug}`);
                }}>
                  <h3 className="text-2xl md:text-5xl font-display font-black tracking-[-0.04em] uppercase transition-all duration-300 group-hover:translate-x-4 group-hover:text-white">
                    {service}
                  </h3>
                  <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-[-10px]" />
                </div>
              </motion.div>
            ))}
            <div className="w-full h-px bg-white/5" />
          </motion.div>
        </div>
      </Layout>
    </section>
  );
}

/* --- SECTION 3: WORKFLOW SECTION --- */

function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="bg-[#2F4156] py-24 md:py-32 overflow-hidden">
      <Layout>
        <div className="mb-20">
          <CinematicText className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 mb-6">THE BUZZ PROCESS</CinematicText>
          <div className="flex items-baseline gap-4">
            <CinematicText as="h2" className="text-5xl md:text-8xl font-display font-black tracking-[-0.04em] uppercase leading-none text-white">
              HOW WE <span className="text-[#567C8D]">WORK</span>
            </CinematicText>
            <HexIcon className="w-[3vw] h-[3vw]" fill="#567C8D" />
          </div>
        </div>

        {/* DESKTOP ACCORDION LAYOUT (100% UNCHANGED) */}
        <div className="hidden md:flex h-[650px] w-full overflow-visible pb-8 rounded-[32px] overflow-hidden border border-white/5">
          {PROCESS_STEPS.map((step, idx) => {
            const isExpanded = activeStep === idx;
            return (
              <motion.div
                key={step.id}
                onClick={() => setActiveStep(idx)}
                onMouseEnter={() => setActiveStep(idx)}
                initial={false}
                animate={{
                  flex: isExpanded ? 12 : 1,
                  scaleY: isExpanded ? 0.98 : 1,
                  scaleX: isExpanded ? 1.01 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                  mass: 1.2
                }}
                className={cn(
                  "relative h-full cursor-pointer overflow-hidden transition-colors duration-500",
                  isExpanded ? "bg-[#f3f4f6]" : "bg-[#f3f4f6]/95 hover:bg-white"
                )}
                style={{
                  boxShadow: "-20px 0 40px rgba(0,0,0,0.15)"
                }}
              >
                {/* Number & Dot Indicator - Always Visible */}
                <div className={cn(
                  "absolute top-8 flex items-center gap-3 z-20 transition-all duration-500",
                  isExpanded ? "left-12" : "left-1/2 -translate-x-1/2"
                )}>
                  <HexIcon className="w-3 h-3" fill="#567C8D" />
                  <span className="text-[10px] md:text-xs font-display font-black tracking-widest text-[#2F4156]/40">
                    {step.id}
                  </span>
                </div>

                {/* Vertical Identifier (Collapsed State) - Centered Vertically */}
                <AnimatePresence>
                  {!isExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <h3 className="rotate-[-90deg] whitespace-nowrap text-xl md:text-2xl font-display font-black tracking-[-0.04em] uppercase text-[#2F4156] opacity-80">
                        {step.title}
                      </h3>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded Content */}
                <AnimatePresence mode="wait">
                  {isExpanded && (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: isExpanded ? 0.3 : 0,
                        ease: "easeOut"
                      }}
                      className="absolute inset-0 p-10 md:p-16 lg:p-20 flex flex-col justify-center overflow-hidden"
                    >
                      {/* Fluid but Stable Container */}
                      <div className="w-full max-w-[75vw] md:max-w-[60vw] lg:max-w-[45vw] shrink-0">
                        <h3 className="text-3xl md:text-5xl lg:text-[5vw] font-display font-black tracking-[-0.04em] uppercase text-[#2F4156] leading-[0.9] mb-6 md:mb-8">
                          {step.title.split(" & ").map((part, i) => (
                            <React.Fragment key={i}>
                              {part}
                              {i === 0 && step.title.includes(" & ") && <><br />& </>}
                            </React.Fragment>
                          ))}
                        </h3>
                        <p className="text-sm md:text-lg lg:text-xl text-[#2F4156]/80 font-medium leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
              </motion.div>
            );
          })}
        </div>

        {/* MOBILE ACCORDION LAYOUT (PREMIUM VERTICAL EXPANSION) */}
        <div className="flex md:hidden flex-col gap-4 w-full">
          {PROCESS_STEPS.map((step, idx) => {
            const isExpanded = activeStep === idx;
            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "rounded-[20px] overflow-hidden border transition-all duration-500 cursor-pointer pointer-events-auto",
                  isExpanded
                    ? "bg-[#f3f4f6] border-[#f3f4f6] shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
              >
                {/* Header portion */}
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <HexIcon className="w-3.5 h-3.5" fill="#567C8D" />
                    <span className={cn(
                      "text-[10px] font-black tracking-widest",
                      isExpanded ? "text-[#2F4156]/40" : "text-white/40"
                    )}>
                      {step.id}
                    </span>
                    <h3 className={cn(
                      "text-base font-display font-black tracking-tight uppercase transition-colors duration-300",
                      isExpanded ? "text-[#2F4156]" : "text-white"
                    )}>
                      {step.title}
                    </h3>
                  </div>

                  {/* Arrow Indicator */}
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "w-6 h-6 flex items-center justify-center rounded-full border text-xs font-bold transition-colors",
                      isExpanded ? "border-[#2F4156]/10 text-[#2F4156]" : "border-white/10 text-white"
                    )}
                  >
                    →
                  </motion.div>
                </div>

                {/* Description portion with smooth height collapse/expand */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 pb-8 pt-2 border-t border-black/5">
                        <p className="text-sm text-[#2F4156]/80 font-medium leading-relaxed uppercase">
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Layout>
    </section>
  );
}

/* --- SECTION 4: RESULTS DRIVEN --- */

function ResultsDriven() {
  return (
    <section className="min-h-screen pt-32 pb-56 md:py-32 bg-[#2F4156] flex flex-col items-center text-center">
      <Layout>
        <div className="max-w-4xl mb-32 mx-auto">
          <CinematicText className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 block mb-6">RESULTS DRIVEN</CinematicText>
          <CinematicText as="h2" className="text-5xl md:text-8xl lg:text-[7vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.85] mb-12 text-white">
            CREATING IMPACT,<br />
            <span className="text-[#567C8D]">DELIVERING RESULTS.</span>
          </CinematicText>
          <p className="text-sm md:text-xl font-display font-black tracking-[-0.02em] uppercase opacity-40 max-w-3xl mx-auto leading-relaxed text-white">
            We don't just create digital products—we build complete brand experiences. Through design, development, marketing, animation, and technology, we help businesses connect with their audience, stand out from competitors, and achieve sustainable growth.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {RESULTS.map((res, i) => (
            <ResultCard key={res.name} res={res} delay={i * 0.1} />
          ))}
        </div>
      </Layout>
    </section>
  );
}

function ResultCard({ res, delay }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 150 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: delay * 1.5, // Increased stagger for "one by one" feel
        ease: [0.16, 1, 0.3, 1]
      }}
      viewport={{ once: false, margin: "-50px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group cursor-pointer"
    >
      <motion.div
        style={{ y: yParallax }}
        animate={{
          height: isHovered ? "510px" : "480px",
          translateY: isHovered ? 24 : 0,
          scaleY: isHovered ? 0.94 : 1,
          scaleX: isHovered ? 1.04 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 12,
          mass: 1.2
        }}
        className="w-full bg-white/5 rounded-[30px] overflow-hidden flex flex-col relative"
      >
        {/* Project Image */}
        <div className="flex-1 overflow-hidden">
          <motion.img
            src={res.img}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          />
        </div>

        {/* Content Area */}
        <div className="p-8 flex flex-col items-start text-left bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 h-1/2 justify-end">
          <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 mb-2">{res.name}</span>
          <div className="flex flex-col gap-1 items-start">
            <span className="text-3xl md:text-5xl font-display font-black tracking-[-0.04em] text-[#567C8D] leading-none">{res.metric}</span>
            <span className="text-[10px] font-black tracking-[0.2em] opacity-40">{res.label}</span>
          </div>
          <div className="text-left">
            <h3 className="text-2xl md:text-3xl font-display font-black tracking-[-0.04em] uppercase leading-none">{res.name}</h3>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
