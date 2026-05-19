import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layout } from "../components/layout/Layout";
import { WaveMenu } from "../components/WaveMenu";
import { useTransition } from "../components/TransitionProvider";
import { SmoothScrollProvider } from "../components/SmoothScrollProvider";
import { CinematicText } from "../components/CinematicText";
import HexIcon from "../components/HexIcon";
import ProfileCard from "../components/ProfileCard/ProfileCard";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// --- Images ---
const IMAGES = {
  studio: "/studio_creative_space_1778599072690.png",
  team1: "/team_member_1_1778599096940.png",
  team2: "/team_member_2_1778599116765.png",
  abbas: "/muhamed_abbas.jpg",
  azeez: "/abdul_azeez.png",
  pavit: "/pavitthiran.jpg",
  palani: "/palaniappan.jpg",
};

// --- Components ---

const ROTATING_STUDIO_TITLES = [
  "MINDS",
  "METTLE"
];

const ROTATING_BLENDED_TITLES = [
  "BLENDED",
  "CRAFTED"
];

const HeroSection = () => {
  const container = useRef<HTMLDivElement>(null);
  const { triggerLogoTransition, triggerPageTransition } = useTransition();
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const rotateHero = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % ROTATING_STUDIO_TITLES.length);
      setIsAnimating(false);
    }, 600);
  };

  useEffect(() => {
    // Speed up auto-rotate to 1.8 seconds
    const interval = setInterval(rotateHero, 1800);
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <section ref={container} className="relative h-auto min-h-[80vh] md:h-full flex flex-col justify-center overflow-hidden shrink-0 pb-12 md:pb-0">
      {/* Hex Grid Background */}
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

      {/* Breadcrumb Nav */}
      <div className="absolute top-[10%] left-8 sm:left-12 md:left-32 lg:left-40 z-20 flex items-center gap-4 pointer-events-auto">
        <button
          onClick={() => triggerLogoTransition()}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
        >
          <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 leading-none">W2C Studios</span>
        </button>
        <HexIcon className="w-2.5 h-2.5 translate-y-[0.5px]" fill="#ef4444" />
        <span
          onClick={() => triggerPageTransition("/studio")}
          className="text-[10px] font-black tracking-[0.4em] uppercase text-[#ef4444] hover:text-white transition-colors cursor-pointer leading-none"
        >
          STUDIO
        </span>
      </div>

      <Layout className="relative z-10 h-full flex flex-col">
        <div className="w-full flex flex-col pt-28 md:pt-30">
          <div className="flex flex-col w-full">
            {/* Row 1: Rotating Title */}
            <div className="overflow-hidden h-[12vw] md:h-[9vw] flex items-center justify-start">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={index}
                  className="text-[12vw] md:text-[9vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-[#ef4444] flex overflow-hidden scale-y-100 md:scale-y-100 origin-center"
                >
                  {ROTATING_STUDIO_TITLES[index].split("").map((char, i) => (
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

            {/* Row 2: Static Word */}
            <div className="flex items-center gap-6 md:gap-10 pl-0 md:pl-[10vw]">
              <div className="overflow-hidden h-[12vw] md:h-[9vw] flex items-center">
                <h1 className="text-[12vw] md:text-[9vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-white whitespace-nowrap scale-y-100 md:scale-y-100 origin-center">
                  AND MAGIC
                </h1>
              </div>
            </div>

            {/* Row 3: Rotating Title (Right-to-Left Blend) */}
            <div className="overflow-hidden h-[12vw] md:h-[9vw] flex items-center justify-start md:justify-center">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={`blended-${index}`}
                  className="text-[12vw] md:text-[9vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-[#ef4444] flex overflow-hidden scale-y-100 md:scale-y-100 origin-center"
                >
                  {ROTATING_BLENDED_TITLES[index].split("").map((char, i) => (
                    <motion.span
                      key={`${index}-${i}`}
                      initial={{ x: "100%", opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: "-100%", opacity: 0 }}
                      transition={{
                        duration: 0.45,
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

            {/* Row 4: Static Word */}
            <div className="overflow-hidden h-[12vw] md:h-[9vw] flex items-center justify-start md:justify-end">
              <h1 className="text-[12vw] md:text-[9vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-white whitespace-nowrap scale-y-100 md:scale-y-100 origin-center">
                IN HARMONY
              </h1>
            </div>

            {/* Mobile-only Intro Paragraph & scroll indicator to fill empty space */}
            <div className="mt-12 md:hidden flex flex-col gap-6 max-w-[280px]">
              <p className="text-white/50 text-[10px] font-black tracking-[0.1em] uppercase leading-relaxed">
                W2C Studios is a brutalist creative agency crafting high-fidelity design, motion, and digital architectures.
              </p>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="w-1.5 h-1.5 bg-[#ef4444] rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
                <span className="text-white/30 text-[8px] font-black tracking-[0.25em] uppercase">
                  SCROLL TO DISCOVER
                </span>
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {/* Background grain hint */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </section>
  );
};

const CreativeStudioSection = () => {
  const container = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(imgRef.current,
        { scale: 1.2, y: 100 },
        {
          scale: 1,
          y: -100,
          scrollTrigger: {
            trigger: container.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        }
      );
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="pt-10 pb-20 md:py-40 bg-[#1f2547]">
      <Layout className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-center">
        <div className="md:col-span-5 space-y-8 order-2 md:order-1">
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-[#ef4444]" />
            <span className="text-[#ef4444] text-xs font-black tracking-[0.3em] uppercase">The Studio</span>
          </div>
          <CinematicText as="h2" intensity={-0.8} className="text-4xl md:text-6xl font-black uppercase leading-[1] text-white">
            WE DESIGN,{"\n"}BUILD & SCALE{"\n"}YOUR <span className="text-[#ef4444]">VISION.</span>
          </CinematicText>
          <p className="text-white/50 text-base md:text-xl leading-relaxed max-w-md font-medium uppercase">
            AT W2C Studios, WE CRAFT IMMERSIVE DIGITAL ECOSYSTEMS THAT MERGE DESIGN, STORYTELLING, MOTION, AND ENGINEERING INTO MEMORABLE BRAND EXPERIENCES.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 150, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            mass: 1
          }}
          className="md:col-span-7 overflow-hidden rounded-[20px] md:rounded-[40px] aspect-[3/4] md:aspect-[4/5] bg-[#1f2547] relative order-1 md:order-2"
        >
          <img
            ref={imgRef}
            src={IMAGES.studio}
            alt="Studio"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f2547] via-transparent to-transparent opacity-40" />
        </motion.div>
      </Layout>
    </section>
  );
};

const TeamGridSection = () => {
  return (
    <section className="py-20 md:py-40 bg-[#1f2547]">
      <Layout className="max-w-[1800px] px-12 md:px-20 lg:px-24">
        <div className="flex flex-col items-center gap-8 mb-24 text-center">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
            <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">LEADERSHIP TEAM</span>
            <div className="w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
          </div>
          <div className="w-full">
            <CinematicText as="h2" intensity={-0.8} className="text-5xl md:text-8xl font-black uppercase leading-[0.9] tracking-tight text-white max-w-5xl mx-auto">
              WE ARE THE <span className="text-[#ef4444]">FOUNDERS</span>{"\n"}OF THIS <span className="text-[#ef4444]">COMPANY</span>
            </CinematicText>
          </div>
        </div>

        {/* Mobile View: Horizontal Scroll */}
        <div className="md:hidden flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x snap-mandatory -mx-12 px-16">
          {[
            {
              name: "Muhamed Abbas",
              title: "Creative Operations Lead",
              handle: "m_abbas",
              status: "Management • Video • Design",
              contactText: "Production Scope",
              avatarUrl: IMAGES.abbas,
            },
            {
              name: "Palaniappan",
              title: "UI Developer",
              handle: "palani_design",
              status: "Technical Associate",
              contactText: "Design Audit",
              avatarUrl: IMAGES.palani,
            },
            {
              name: "Pavitthiran",
              title: "Developer",
              handle: "pavitthiran_tech",
              status: "Full-Stack Developer",
              contactText: "Tech Stack",
              avatarUrl: IMAGES.pavit,
            },
            {
              name: "Abdul Azeez",
              title: "Product Engineering Lead",
              handle: "azeez_management",
              status: "Management & Frontend",
              contactText: "Project Strategy",
              avatarUrl: IMAGES.azeez,
            },
          ].map((profile, i) => (
            <div
              key={`mobile-${profile.name}`}
              className="min-w-[240px] w-[240px] shrink-0 snap-center"
            >
              <ProfileCard
                {...profile}
                behindGlowEnabled
                behindGlowColor="rgba(239, 68, 68, 0.35)"
                behindGlowSize="70%"
                innerGradient="linear-gradient(165deg, rgba(255,255,255,0.08) 0%, rgba(10,12,24,0.6) 100%)"
              />
            </div>
          ))}
        </div>

        {/* Desktop View: Grid (Completely Untouched) */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {[
            {
              name: "Muhamed Abbas",
              title: "Creative Operations Lead",
              handle: "m_abbas",
              status: "Management • Video • Design",
              contactText: "Production Scope",
              avatarUrl: IMAGES.abbas,
            },
            {
              name: "Palaniappan",
              title: "UI Developer",
              handle: "palani_design",
              status: "Technical Associate",
              contactText: "Design Audit",
              avatarUrl: IMAGES.palani,
            },
            {
              name: "Pavitthiran",
              title: "Developer",
              handle: "pavitthiran_tech",
              status: "Full-Stack Developer",
              contactText: "Tech Stack",
              avatarUrl: IMAGES.pavit,
            },
            {
              name: "Abdul Azeez",
              title: "Product Engineering Lead",
              handle: "azeez_management",
              status: "Management & Frontend",
              contactText: "Project Strategy",
              avatarUrl: IMAGES.azeez,
            },
          ].map((profile, i) => (
            <motion.div
              key={`desktop-${profile.name}`}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <ProfileCard
                {...profile}
                behindGlowEnabled
                behindGlowColor="rgba(239, 68, 68, 0.35)"
                behindGlowSize="70%"
                innerGradient="linear-gradient(165deg, rgba(255,255,255,0.08) 0%, rgba(10,12,24,0.6) 100%)"
              />
            </motion.div>
          ))}
        </div>
      </Layout>
    </section>
  );
};

const ManifestoSection = () => {
  return (
    <section className="py-20 md:py-40 bg-[#1f2547] border-y border-white/5">
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-20 items-start">
          <div className="md:col-span-9 flex flex-col items-end justify-center text-right">
            <CinematicText as="h2" intensity={-0.8} className="text-[7vw] md:text-[6vw] font-black uppercase leading-[1.1] text-white tracking-[-0.01em]">
              <span className="block md:whitespace-nowrap">WE OBSESSIVELY <span className="text-[#ef4444]">CREATE</span></span>
              <span className="block md:whitespace-nowrap">LEARN AND GROW</span>
              <span className="block md:whitespace-nowrap text-[#ef4444]">COMPANIES AS</span>
              <span className="block md:whitespace-nowrap">A <span className="text-[#ef4444]">TEAM</span></span>
            </CinematicText>
          </div>

          <div className="md:col-span-3 space-y-40">
            <div className="flex items-center justify-between w-full">
              <div className="flex-1 h-[1px] bg-white/10" />
              <div className="flex items-center gap-3 px-6">
                <div className="w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
                <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase whitespace-nowrap">MANIFESTO</span>
              </div>
            </div>

            <div className="space-y-14">
              <div className="flex items-center gap-4 py-4">
                <div className="w-2.5 h-2.5 border border-white/20 rotate-45" />
                <div className="flex-1 h-[1px] bg-white/20" />
                <div className="w-2.5 h-2.5 border border-white/20 rotate-45" />
              </div>
              <p className="text-white/60 text-base md:text-lg leading-relaxed font-medium">
                We are a force that ignites the spark of creative potential and propels transformative change. Our manifesto is fueled by a relentless passion, boundless imagination, and unwavering dedication.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </section>
  );
};

const JourneyRow = ({ year, milestone, delay }: { year: string; milestone: string; delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="group py-10 border-b border-white/5 flex items-center justify-between transition-colors px-4"
    >
      <div className="flex items-center gap-8">
        <span className="text-white/30 font-black text-xs tracking-widest">{year}</span>
        <span className="text-white font-black uppercase text-xl md:text-2xl tracking-tight group-hover:text-[#ef4444] transition-colors">{milestone}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-1.5 bg-[#ef4444] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
        <div className="w-8 h-[1px] bg-white/10 group-hover:w-16 group-hover:bg-[#ef4444] transition-all duration-500" />
      </div>
    </motion.div>
  );
};

const VisionJourneySection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(headlineRef.current, {
        y: -100,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="pt-24 pb-10 md:py-60 bg-[#1f2547] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#232b5c] blur-[100px] rounded-full" />
      </div>

      {/* Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-0 items-start">
          {/* Left Side: Headline */}
          <div className="md:col-span-7 md:sticky md:top-40 flex flex-col items-end">
            <div className="space-y-4 mb-12 w-full max-w-4xl">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 border border-[#ef4444] rotate-45 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#ef4444]" />
                </div>
                <span className="text-[#ef4444] text-[10px] font-black tracking-[0.5em] uppercase">Vision & Journey</span>
              </div>
            </div>

            <CinematicText as="h2" intensity={-0.8} className="text-[10vw] md:text-[8.5vw] font-black uppercase leading-[1.15] md:leading-[0.8] text-white tracking-[-0.05em] select-none w-full text-left">
              STARTING{"\n"}
              <span className="text-[#ef4444]">SMALL.</span>{"\n"}
              <span className="text-[#ef4444]">THINKING</span>{"\n"}
              MASSIVE.
            </CinematicText>
          </div>

          {/* Right Side: Content */}
          <div className="md:col-span-5 space-y-32">
            {/* Top Manifesto Paragraph */}
            <div className="space-y-8">
              <div className="w-12 h-[1px] bg-[#ef4444]" />
              <p className="text-white/80 text-xl md:text-2xl font-medium leading-relaxed italic">
                "We are at the beginning of a long journey — crafting meaningful digital experiences with obsession, precision, and ambition."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-[#ef4444] rounded-full animate-ping" />
                <span className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase">Built for Excellence</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-t border-white/5 pt-10">
              <JourneyRow year="2026" milestone="Studio Founded" delay={0.1} />
              <JourneyRow year="2026" milestone="First Client Project" delay={0.2} />
              <JourneyRow year="2026" milestone="Building Digital Experiences" delay={0.3} />
              <JourneyRow year="2026" milestone="Expanding Creative Services" delay={0.4} />
              <JourneyRow year="2026" milestone="Launching Global Vision" delay={0.5} />
            </div>

          </div>
        </div>
      </Layout>
    </section>
  );
};

const CircleSection = () => {
  const container = useRef<HTMLDivElement>(null);
  const circle1 = useRef<HTMLDivElement>(null);
  const circle2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Auto-rotation for Circle 1 (Clockwise)
      gsap.to(circle1.current, {
        rotate: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
      });

      // Auto-rotation for Circle 2 (Counter-Clockwise)
      gsap.to(circle2.current, {
        rotate: -360,
        duration: 15,
        repeat: -1,
        ease: "none"
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="h-[60vh] md:h-screen bg-[#1f2547] relative flex items-center justify-center overflow-hidden">
      <div ref={circle1} className="absolute w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] border border-[#ef4444]/20 rounded-full flex items-center justify-center">
        <div className="w-[10px] h-[10px] bg-[#ef4444] rounded-full absolute top-0 left-1/2 -translate-x-1/2 blur-[2px]" />
      </div>
      <div ref={circle2} className="absolute w-[60vw] h-[60vw] md:w-[35vw] md:h-[35vw] border border-[#ef4444]/30 rounded-full">
        <div className="w-[6px] h-[6px] bg-[#ef4444]/50 rounded-full absolute bottom-0 left-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="text-[15vw] md:text-[10vw] font-black text-white select-none uppercase tracking-tighter">
          EST. 20<span className="text-[#ef4444]">26</span>
        </div>
      </div>
    </section>
  );
};

const CreditsSection = () => {
  return (
    <section className="py-24 bg-[#1f2547] border-t border-white/5 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50%] h-[100%] bg-[#ef4444]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Layout>
        <div className="flex flex-col items-center justify-center text-center space-y-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-1 h-1 bg-[#ef4444] rounded-full" />
            <p className="text-white/50 text-[10px] font-black tracking-[0.5em] uppercase">Inspiration & Credits</p>
            <div className="w-1 h-1 bg-[#ef4444] rounded-full" />
          </div>
          
          <a 
            href="https://buzzworthystudio.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2 transition-all duration-500"
          >
            <span className="text-white/80 text-sm font-medium tracking-wide group-hover:text-white transition-colors">This experience was inspired by the craft of</span>
            <span className="text-2xl md:text-5xl font-black text-white group-hover:text-[#ef4444] transition-all duration-500 tracking-tighter uppercase">
              Buzzworthy Studio
            </span>
            <div className="w-0 group-hover:w-full h-[1px] bg-[#ef4444] transition-all duration-700" />
          </a>
          
          <p className="text-white/30 text-[9px] font-black tracking-[0.2em] uppercase pt-10">
            © 2026 W2C Studios — DESIGNED FOR THE BOLD
          </p>
        </div>
      </Layout>
    </section>
  );
};

export default function StudioPage() {
  const [isWaveOpen, setIsWaveOpen] = useState(false);
  const { triggerLogoTransition, triggerPageTransition } = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <SmoothScrollProvider containerRef={containerRef} ease={0.09}>
      <div 
        onScroll={(e) => (e.currentTarget.scrollTop = 0)}
        className="h-screen bg-[#ef4444] p-2 md:p-3 lg:p-4 font-display tracking-tight select-none overflow-hidden"
      >
        <div 
          onScroll={(e) => (e.currentTarget.scrollTop = 0)}
          className="relative w-full h-full rounded-[16px] md:rounded-[28px] lg:rounded-[40px] overflow-hidden bg-[#1f2547] flex flex-col border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
        >
          <WaveMenu isOpen={isWaveOpen} onClose={() => setIsWaveOpen(false)} />

          {/* Sticky Header Overlay */}
          <div className="sticky top-0 left-0 right-0 z-[200] h-0 overflow-visible pointer-events-none">
            <div className="px-6 md:px-12 lg:px-16 py-8 md:py-12 flex justify-between items-start">
              <button onClick={() => triggerLogoTransition()} className="pointer-events-auto group">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                  <img src="/W2C Studios.png" alt="W2C Studios" className="w-full h-full object-contain" />
                </div>
              </button>

              <button
                onClick={() => setIsWaveOpen(!isWaveOpen)}
                className="relative z-[100] flex gap-3 md:gap-4 h-14 md:h-20 items-center cursor-pointer group pointer-events-auto"
              >
                <div className="flex flex-col items-center h-10 md:h-14 w-px bg-white/30 relative">
                  <motion.div
                    animate={{ y: isWaveOpen ? 24 : 0, opacity: isWaveOpen ? 0 : 1 }}
                    className="absolute top-0 w-2.5 md:w-3.5 h-2.5 md:h-3.5 border-2 border-white/60 rounded-full bg-[#1f2547] -translate-x-1/2 left-1/2"
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
                    className="absolute bottom-0 w-2.5 md:w-3.5 h-2.5 md:h-3.5 border-2 border-white/60 rounded-full bg-[#1f2547] -translate-x-1/2 left-1/2"
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <HeroSection />
            <CreativeStudioSection />
            <TeamGridSection />
            <ManifestoSection />
            <VisionJourneySection />
            <CircleSection />
            <CreditsSection />
          </div>
        </div>
      </div>
    </SmoothScrollProvider>
  );
}
