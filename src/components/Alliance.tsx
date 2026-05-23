import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { Layout } from "./layout/Layout";
import { CinematicText } from "./CinematicText";
import HexIcon from "./HexIcon";

const partners = [
  { name: "ModernMD", sub: "URGENT CARE", stat: "20K+", label: "SIGN UPS", client: "ModernMD Urgent Care" },
  { name: "OCEAN BLUE", sub: "LOGISTICS", stat: "45%", label: "REVENUE INCREASE", client: "Ocean Blue Logistics" },
  { name: "wework", sub: "GLOBAL", stat: "15+", label: "DESIGN AWARDS", client: "WeWork Global" },
  { name: "SKYLINE", sub: "DYNAMICS", stat: "12M+", label: "USER REACH", client: "Skyline Dynamics" },
  { name: "SELENE", sub: "AVIATION", stat: "20K+", label: "SIGN UPS", client: "ModernMD Urgent Care" },
  { name: "SLING SHOT", sub: "INTERGALACTIC", stat: "45%", label: "REVENUE INCREASE", client: "Ocean Blue Logistics" },
  { name: "HELIAS", sub: "100% PURE OILS", stat: "15+", label: "DESIGN AWARDS", client: "WeWork Global" },
  { name: "AWESTRUCK", sub: "CREATIVE", stat: "12M+", label: "USER REACH", client: "Skyline Dynamics" },
];

export const Alliance = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const topRowRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);
  const [sectionHeight, setSectionHeight] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start start", "end end"]
  });

  // Specifically track the section entering the screen for the initial reveal
  const { scrollYProgress: enterProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start 100%", "start 0%"]
  });

  // Smooth out the scroll progress for cinematic feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 20,
    restDelta: 0.001
  });

  const smoothEnterProgress = useSpring(enterProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const calculateRange = () => {
      if (topRowRef.current && sectionRef.current) {
        const rowWidth = topRowRef.current.scrollWidth;
        const containerWidth = sectionRef.current.clientWidth;
        
        if (isMobile) {
          const transformDistance = Math.max(0, rowWidth - containerWidth);
          setScrollRange(transformDistance);
          const vh = window.innerHeight;
          // Generate a premium scroll duration of 2.5 times the viewport height
          const stickyHeight = Math.max(vh * 2.5, vh + transformDistance + 200);
          setSectionHeight(stickyHeight);
        } else {
          const transformDistance = Math.max(0, rowWidth - containerWidth + 24);
          setScrollRange(transformDistance);
          setSectionHeight(null);
        }
      }
    };

    // Use requestAnimationFrame to ensure layout is complete before measuring
    const rafId = requestAnimationFrame(() => {
      calculateRange();
      requestAnimationFrame(calculateRange);
    });

    // ResizeObserver ensures accurate measurements when cards/elements reflow or resize
    const ro = new ResizeObserver(calculateRange);
    if (topRowRef.current) ro.observe(topRowRef.current);
    if (sectionRef.current) ro.observe(sectionRef.current);

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleMediaChange = () => {
      setIsMobile(mediaQuery.matches);
      calculateRange();
    };
    handleMediaChange();
    mediaQuery.addEventListener("change", handleMediaChange);

    window.addEventListener("resize", calculateRange);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("resize", calculateRange);
    };
  }, [isMobile]);

  const xTop = useTransform(
    smoothProgress,
    isMobile ? [0, 1] : [0, 0.2, 1],
    isMobile
      ? ["0px", `-${scrollRange}px`]
      : ["20vw", "0vw", `-${scrollRange * 2.5}px`]
  );
  
  const xBottom = useTransform(
    smoothProgress,
    isMobile ? [0, 1] : [0, 0.2, 1],
    isMobile
      ? [`-${scrollRange}px`, "0px"]
      : ["-20vw", "0vw", `${scrollRange * 2.8}px`]
  );
  
  // Reveal content as it enters the screen
  const textProgress = useTransform(smoothEnterProgress, [0, 1], [0, 0.5]);

  const upperRow = partners.slice(0, 4);
  const lowerRow = partners.slice(4, 8);

  return (
    <section 
      ref={sectionRef} 
      className="bg-[#2F4156] relative h-[250vh] alliance-section"
      style={isMobile && sectionHeight ? { height: `${sectionHeight}px` } : undefined}
    >
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center py-8 md:py-12">
        <div className="w-full h-full flex flex-col justify-center">

          <Layout className="relative z-10 mb-8 md:mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Left Column: Label and Description */}
            <div className="lg:col-span-5 flex flex-col justify-between pt-4">
              <div className="flex flex-col gap-12">
                {/* Label */}
                <div className="flex items-center gap-3">
                  <HexIcon className="w-3.5 h-3.5" fill="#567C8D" />
                  <span className="text-white text-[10px] md:text-xs font-black tracking-[0.3em] uppercase whitespace-nowrap">
                    CREATIVE ALLIANCE
                  </span>
                </div>

                {/* Paragraph */}
                <p className="text-white/60 text-sm md:text-base lg:text-lg leading-relaxed max-w-md font-medium">
                  At Graphoria, we craft immersive digital experiences designed to elevate brands and engage audiences. Through innovative design, strategic thinking, and seamless technology, we empower our partners to achieve greatness and redefine the boundaries of their industries.
                </p>
              </div>
            </div>

            {/* Right Column: Main Heading */}
            <div className="lg:col-span-7">
              <h2 className="text-white text-[10vw] lg:text-[6.5vw] font-black leading-[0.85] tracking-tighter uppercase relative cursor-default">
                <CinematicText as="span" className="hover:text-[#567C8D] transition-colors duration-500" progress={textProgress}>BUILD THE</CinematicText><br />
                <CinematicText as="span" className="text-[#567C8D] hover:text-white transition-colors duration-500" progress={textProgress}>GRAPHORIA</CinematicText><br />
                <div className="flex items-baseline gap-4">
                  <CinematicText as="span" className="hover:text-[#567C8D] transition-colors duration-500" progress={textProgress}>EXPERIENCE</CinematicText>
                  {/* Red Hexagon Accent */}
                  <HexIcon className="w-[2.5vw] h-[2.5vw]" fill="#567C8D" />
                </div>
              </h2>
            </div>
          </div>
        </Layout>

        {/* Partners Animated Tracks */}
        <div className="alliance-row-container flex flex-col gap-4 relative w-full translate-z-0 will-change-transform overflow-hidden shrink-0">
          {/* Upper Row: RIGHT -> LEFT */}
          <motion.div 
            ref={topRowRef}
            style={{ x: xTop }}
            className="alliance-row flex gap-4 px-[10vw]"
          >
            {upperRow.map((partner, i) => (
              <PartnerCard key={partner.name + i} partner={partner} i={i} />
            ))}
          </motion.div>

          {/* Lower Row: LEFT -> RIGHT */}
          <motion.div 
            ref={bottomRowRef}
            style={{ x: xBottom }}
            className="alliance-row flex gap-4 px-[10vw]"
          >
            {lowerRow.map((partner, i) => (
              <PartnerCard key={partner.name + i} partner={partner} i={i + 4} />
            ))}
          </motion.div>
        </div>
      </div>
      </div>
    </section>
  );
};

interface PartnerProps {
  partner: typeof partners[0];
  i: number;
  key?: React.Key;
}

const PartnerCard = ({ partner, i }: PartnerProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: (i % 4) * 0.1 }}
    whileHover="hover"
    className="alliance-card w-[45vw] md:w-[26vw] lg:w-[18vw] shrink-0 aspect-video bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col items-center justify-center p-4 md:p-6 relative group cursor-crosshair overflow-hidden transform-gpu translate-z-0 transition-transform duration-300 hover:scale-[1.02]"
  >
    <span className="text-white text-xs md:text-base lg:text-xl font-display font-black tracking-[-0.04em] uppercase opacity-80 group-hover:opacity-100 transition-opacity text-center px-4">
      {partner.name}
    </span>
    <span className="text-white text-[8px] md:text-[10px] font-display font-black tracking-[0.2em] uppercase opacity-30 mt-1">
      {partner.sub}
    </span>

    {/* Hover Stat Overlay */}
    <motion.div
      variants={{
        hover: { opacity: 1, scale: 1, y: 0 }
      }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
    >
      <div className="w-32 h-32 md:w-40 md:h-40 flex flex-col items-center justify-center text-white relative">
        <HexIcon className="absolute inset-0 w-full h-full drop-shadow-[0_20px_40px_rgba(86,124,141,0.3)]" fill="#567C8D" />
        <div className="relative z-10 flex flex-col items-center justify-center p-4">
          <span className="text-xl md:text-4xl font-display font-black tracking-[-0.04em]">{partner.stat}</span>
          <span className="text-[8px] md:text-[10px] font-display font-black tracking-[0.2em] uppercase text-center leading-tight mt-1 px-4">
            {partner.label}
          </span>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

