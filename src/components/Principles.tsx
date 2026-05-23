"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { Layout } from "./layout/Layout";
import { cn } from "@/lib/utils";
import { CinematicText } from "./CinematicText";
import HexIcon from "./HexIcon";

const principles = [
  {
    rule: "RULE NO.1",
    title: "DISCIPLINE",
    description: "At our core, we execute with precision and consistency. Every detail matters, and every decision is intentional."
  },
  {
    rule: "RULE NO.2",
    title: "TRUST",
    description: "Strong partnerships are built through honesty, transparency, and reliable execution from start to finish."
  },
  {
    rule: "RULE NO.3",
    title: "PASSION",
    description: "We create with energy, curiosity, and obsession for meaningful digital experiences."
  },
  {
    rule: "RULE NO.4",
    title: "DEVOTION",
    description: "We stay committed to quality until every interaction feels refined and impactful."
  },
  {
    rule: "RULE NO.5",
    title: "PROMISE",
    description: "We aim to deliver work that exceeds expectations and creates long-term value for every client."
  }
];

interface WaveLetterProps {
  char: string;
  index: number;
  progress: import("motion/react").MotionValue<number>;
  globalProgress: import("motion/react").MotionValue<number>;
}

const WaveLetter: React.FC<WaveLetterProps> = ({
  char,
  index,
  progress,
  globalProgress
}) => {
  // Stagger the animation across the enter progress
  const startEnter = index * 0.05;
  const endEnter = startEnter + 0.5;

  // Step 3: Letters disappear one by one (0.85 - 1.0)
  // Alternating directions: even indices go Up, odd go Down
  const direction = index % 2 === 0 ? -1 : 1; 
  const exitDuration = 0.12; 
  const staggerAmount = 0.015;
  const startExit = 0.85 + (index * staggerAmount);
  const endExit = Math.min(1.0, startExit + exitDuration);

  const enterY = useTransform(progress, [startEnter, endEnter], [600, 0]);
  const exitY = useTransform(globalProgress, [startExit, endExit], [0, 800 * direction]);
  const opacity = useTransform(progress, [startEnter, endEnter], [0, 1]);
  const exitOpacity = useTransform(globalProgress, [startExit, endExit], [1, 0]);

  // Combine transforms
  const y = useTransform([enterY, exitY], ([ey, ex]) => Number(ey) + Number(ex));
  const combinedOpacity = useTransform([opacity, exitOpacity], ([oa, ob]) => Number(oa) * Number(ob));

  return (
    <motion.span
      style={{ y, opacity: combinedOpacity, willChange: "transform, opacity" }}
      className="inline-block translate-z-0"
    >
      {char}
    </motion.span>
  );
};

export const Principles = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxScroll, setMaxScroll] = useState(0);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    container: containerRef,
    offset: ["start start", "end end"]
  });

  // Specifically track the section entering the screen for the text wave
  const { scrollYProgress: enterProgress } = useScroll({
    target: targetRef,
    container: containerRef,
    offset: ["start 100%", "start 0%"]
  });

  const smoothEnterProgress = useSpring(enterProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Background word fill progress - synchronized with horizontal movement
  const fillClipPath = useTransform(smoothProgress, [0, 0.7], ["inset(0 0 0 100%)", "inset(0 0 0 0%)"]);

  useEffect(() => {
    const computeMaxScroll = () => {
      if (trackRef.current) {
        setMaxScroll(trackRef.current.scrollWidth);
      }
    };

    // Use RAF to guarantee layout is complete before measuring — critical on mobile
    // where scrollWidth can be 0 on synchronous first render.
    const rafId = requestAnimationFrame(() => {
      computeMaxScroll();
      // Second RAF pass for browsers that need two frames to finish flex layout
      requestAnimationFrame(computeMaxScroll);
    });

    // ResizeObserver keeps maxScroll accurate when cards reflow (orientation changes etc.)
    const ro = new ResizeObserver(computeMaxScroll);
    if (trackRef.current) ro.observe(trackRef.current);

    window.addEventListener("resize", computeMaxScroll);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", computeMaxScroll);
    };
  }, []);

  // Step 1 & 2: Horizontal scroll + Exit to Left (0.0 to 0.85)
  // We move the track until it's fully off-screen to the left
  const x = useTransform(smoothProgress, [0, 0.85], [0, -maxScroll]);

  return (
    <section ref={targetRef} className="relative h-[600vh] bg-[#2F4156]">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-clip">

        {/* Background Typography - Constrained between logo and settings icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <Layout className="flex justify-center">
            <div className="relative">
              {/* Base Word (Subtle White) */}
              <h2 className="text-[14vw] md:text-[15vw] font-display font-black uppercase tracking-[-0.04em] text-white/10 leading-none text-center whitespace-nowrap hover:text-[#567C8D] transition-colors duration-500 cursor-default pointer-events-auto">
                {"PRINCIPLES".split("").map((char, i) => (
                  <WaveLetter key={i} char={char} index={i} progress={smoothEnterProgress} globalProgress={smoothProgress} />
                ))}
              </h2>
              {/* Overlapping Word (Red Fill) */}
              <motion.div
                style={{ clipPath: fillClipPath, willChange: "clip-path" }}
                className="absolute top-0 left-0 w-full h-full flex justify-center items-center translate-z-0"
              >
                <h2 className="text-[14vw] md:text-[15vw] font-display font-black uppercase tracking-[-0.04em] text-[#567C8D] leading-none text-center whitespace-nowrap hover:text-white transition-colors duration-500 cursor-default pointer-events-auto">
                  {"PRINCIPLES".split("").map((char, i) => (
                    <WaveLetter key={i} char={char} index={i} progress={smoothEnterProgress} globalProgress={smoothProgress} />
                  ))}
                </h2>
              </motion.div>
            </div>
          </Layout>
        </div>

        {/* Card Track - Full width so cards enter from the absolute edge of the screen */}
        <div className="relative z-10 w-full">
          <div className="py-20 flex items-center translate-z-0">
            <motion.div
              ref={trackRef}
              style={{ x, willChange: "transform" }}
              className="flex flex-row gap-8 md:gap-16 items-center"
            >
              {/* Spacer to push initial cards off-screen to the right */}
              <div className="flex-shrink-0 w-[100vw]" />

              {principles.map((p, index) => {
                // Alternating pattern:
                // Card 1 (index 0) -> center
                // Card 2 (index 1) -> shifted upward
                // Card 3 (index 2) -> shifted downward
                // Card 4 (index 3) -> shifted upward
                // Card 5 (index 4) -> shifted downward
                let shiftClass = "translate-y-0";
                if (index === 1 || index === 3) shiftClass = "-translate-y-12 md:-translate-y-20";
                if (index === 2 || index === 4) shiftClass = "translate-y-12 md:translate-y-20";

                return (
                  <div
                    key={p.title}
                    className={cn(
                      "principle-card flex-shrink-0 w-[80vw] md:w-[400px] h-[400px] md:h-[500px] rounded-[24px] bg-[#2F4156] p-8 md:p-12 flex flex-col gap-6 shadow-2xl border border-white/5 transition-transform duration-500 transform-gpu will-change-transform",
                      shiftClass
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <HexIcon className="w-3.5 h-3.5 drop-shadow-[0_0_8px_rgba(86,124,141,0.5)]" fill="#567C8D" />
                      <span className="text-white/50 text-[10px] md:text-xs font-black tracking-[0.4em] uppercase">
                        {p.rule}
                      </span>
                    </div>

                    <h3 className="text-white text-4xl md:text-6xl font-display font-black tracking-[-0.04em] uppercase leading-none mt-4 hover:text-[#567C8D] transition-colors duration-500 cursor-default">
                      {p.title}
                    </h3>

                    <p className="text-white/70 text-base md:text-lg leading-relaxed mt-4 font-medium">
                      {p.description}
                    </p>
                  </div>
                );
              })}

              {/* Small padding at the end */}
              <div className="flex-shrink-0 w-[10vw] md:w-[20vw]" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
