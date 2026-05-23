import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { Layout } from "./layout/Layout";
import { cn } from "@/lib/utils";

// Using the generated images
import poster1 from "../startup_vision_poster_1_1778146868528.png";
import poster2 from "../startup_vision_poster_2_1778146890024.png";
import poster3 from "../startup_vision_poster_3_1778146908631.png";
import poster4 from "../milestone_experiment_poster_1778151180900.png";
import poster5 from "../milestone_breakthrough_poster_1778151205392.png";
import poster6 from "../milestone_philosophy_poster_1778151338167.png";
import poster7 from "../milestone_innovation_poster_new_1778151643049.png";

const MILESTONES = [
  {
    id: 1,
    title: "FLUID INTERFACES",
    subtitle: "CONCEPT POSTER",
    image: poster1,
    rotation: -8,
    xOffset: "-34vw", // Start from V
    driftX: 40,
    delay: 0.1
  },
  {
    id: 2,
    title: "THE NEW STUDIO",
    subtitle: "DESIGN MOCKUP",
    image: poster2,
    rotation: 5,
    xOffset: "7vw", // Start from 2nd I
    driftX: -30,
    delay: 0.2
  },
  {
    id: 3,
    title: "IMPACT 2028",
    subtitle: "FUTURE GOALS",
    image: poster3,
    rotation: -4,
    xOffset: "-7vw", // Start from S
    driftX: 20,
    delay: 0.3
  },
  {
    id: 4,
    title: "DIGITAL BLUEPRINT",
    subtitle: "INNOVATION",
    image: poster7,
    rotation: 6,
    xOffset: "35vw", // Start from N
    driftX: -40,
    delay: 0.4
  },
  {
    id: 5,
    title: "EMOTION FIRST",
    subtitle: "PHILOSOPHY",
    image: poster6,
    rotation: -5,
    xOffset: "-21vw", // Start from 1st I
    driftX: 30,
    delay: 0.5
  },
  {
    id: 6,
    title: "FUTURE BOUND",
    subtitle: "EXPERIMENTS",
    image: poster4,
    rotation: 4,
    xOffset: "-14vw", // Between S and 1st I
    driftX: 25,
    delay: 0.6
  },
  {
    id: 7,
    title: "BEYOND LIMITS",
    subtitle: "BREAKTHROUGH",
    image: poster5,
    rotation: -7,
    xOffset: "21vw", // Between 2nd I and N
    driftX: -25,
    delay: 0.7
  }
];

const BACKGROUND_WORD = "VISION";

interface RisingLetterProps {
  char: string;
  index: number;
  progress: any;
}

const RisingLetter: React.FC<RisingLetterProps & { zIndex: number }> = ({ char, index, progress, zIndex }) => {
  // Letters rise slowly and settle by 0.5
  const start = 0.0 + (index * 0.05);
  const end = 0.5; // Deliberate, slower arrival

  const y = useTransform(progress, [start, end], ["120vh", "0vh"]);
  const opacity = useTransform(progress, [start, end], [0, 1]);

  // "Headline color method": Three letters in red, others in soft black
  const isRed = [0, 2, 4].includes(index); // V, S, O

  return (
    <motion.span
      style={{ y, opacity, zIndex }}
      className={cn(
        "relative text-[25vw] md:text-[22vw] font-display font-black leading-none tracking-[-0.04em] transition-colors duration-500 cursor-default pointer-events-auto",
        isRed
          ? "text-[#567C8D] hover:text-white"
          : "text-white hover:text-[#567C8D]"
      )}
    >
      {char}
    </motion.span>
  );
};

export const Milestones = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start 400%", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 25,
    restDelta: 0.001
  });

  // Line animation synchronized with the last card's exit
  const lineWidth = useTransform(smoothProgress, [0.7, 0.85], ["0%", "100%"]);
  const lineOpacity = useTransform(smoothProgress, [0.7, 0.75], [0, 1]);

  // Intertwined Layering: Some letters are in front, some are behind
  return (
    <section ref={sectionRef} className="relative h-[300vh] bg-[#2F4156]">
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center">

        {/* MERGED INTERTWINED STACK */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

          {/* Letters with alternating Z-Indices */}
          <div className="flex gap-[1vw] md:gap-[2vw] select-none relative">
            {BACKGROUND_WORD.split("").map((char, index) => {
              const zIndex = (index % 2 === 0) ? 10 : 30;
              return (
                <RisingLetter
                  key={index}
                  char={char}
                  index={index}
                  progress={smoothProgress}
                  zIndex={zIndex}
                />
              );
            })}

            {/* EXPANDING WHITE LINE - Below Letters */}
            <motion.div
              style={{ width: lineWidth, opacity: lineOpacity }}
              className="absolute left-1/2 -translate-x-1/2 bottom-[-2vw] h-[2px] bg-white z-40"
            />
          </div>

          {/* Cards at mid-level Z-Index (z-20) */}
          <div className="absolute inset-0 flex items-center justify-center">
            {MILESTONES.map((item, index) => (
              <MilestoneCard
                key={item.id}
                item={item}
                progress={smoothProgress}
                index={index}
                zIndex={20}
              />
            ))}
          </div>
        </div>

        {/* DECORATIVE ELEMENTS */}
        <div className="absolute bottom-12 left-12 md:left-20 z-40">
          <div className="flex flex-col gap-2">
            <span className="text-[#567C8D] text-[10px] font-black tracking-[0.5em] uppercase">MOMENTUM</span>
            <div className="w-12 h-[1px] bg-white/20" />
            <span className="text-white/30 text-[10px] font-black tracking-[0.2em] uppercase">05 / MILESTONES</span>
          </div>
        </div>
      </div>
    </section>
  );
};

interface MilestoneCardProps {
  item: typeof MILESTONES[0];
  progress: any;
  index: number;
  zIndex?: number;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ item, progress, index, zIndex = 20 }) => {
  // Slower crossing: Cards move with the name and stay on screen longer
  const start = 0.0 + item.delay * 0.4;
  const duration = 0.7; // Even longer duration for slower movement
  const mid = start + duration / 2;
  const end = start + duration;

  const y = useTransform(progress, [start, mid, end], ["120vh", "0vh", "-120vh"]);
  const opacity = useTransform(progress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
  const rotation = useTransform(progress, [start, end], [item.rotation, -item.rotation * 2]);
  const scale = useTransform(progress, [start, mid, end], [0.7, 1, 0.7]);

  // Adding horizontal drift for different directions
  const driftX = useTransform(progress, [start, end], [0, (item as any).driftX || 0]);
  const combinedX = useTransform(
    [driftX],
    ([dx]) => `calc(${item.xOffset} + ${dx}px)`
  );

  return (
    <motion.div
      style={{
        y,
        opacity,
        rotate: rotation,
        scale,
        x: combinedX,
        zIndex,
        willChange: "transform, opacity"
      }}
      className="absolute flex-shrink-0 group pointer-events-auto"
    >
      <div className="relative w-[32vw] md:w-[18vw] lg:w-[12vw] aspect-[1/1.4] bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-none overflow-hidden shadow-2xl transition-all duration-700 group-hover:border-[#567C8D]/30">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 md:p-6 flex flex-col justify-end">
          <motion.span
            className="text-[#567C8D] text-[8px] md:text-[10px] font-black tracking-[0.3em] uppercase mb-1"
          >
            {item.subtitle}
          </motion.span>
          <h3 className="text-white text-base md:text-lg lg:text-xl font-display font-black leading-tight tracking-[-0.04em] uppercase">
            {item.title}
          </h3>
        </div>

        {/* Decorative Detail */}
        <div className="absolute top-4 right-4">
          <div className="w-1 h-1 rounded-full bg-[#567C8D]" />
        </div>
      </div>
    </motion.div>
  );
};
