import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue } from "motion/react";
import { Layout } from "./layout/Layout";
import { CinematicText } from "./CinematicText";
import HexIcon from "./HexIcon";

// Specific Graphoria Branding Content
// Default fallback data (preserving original Graphoria branding)
const INITIAL_TESTIMONIALS = [
  {
    id: 1,
    name: "Arjun Menon",
    role: "Founder / Novagrid",
    text: "The level of cinematic detail W2C Studios brings to the table is unmatched. They didn't just build a site; they built an experience.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Sarah Blake",
    role: "Creative Director / Fluxify",
    text: "The balance between visual design and scalable development was exceptional. Every interaction felt intentional and refined.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop"
  }
];

const STATS = [
  { label: "Startup Collaborations", value: "18+" },
  { label: "Client Retention", value: "92%" },
  { label: "Creative Launches", value: "24" }
];

import { cmsService } from "../lib/cms-service";

export const Testimonials = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [activeReviews, setActiveReviews] = useState<any[]>([]);
  const x = useMotionValue(0);

  const fetchReviews = async () => {
    try {
      const data = await cmsService.getReviews();
      const formatted = data
        .filter((r: any) => r.isActive)
        .sort((a: any, b: any) => (a.reviewIndex || 0) - (b.reviewIndex || 0))
        .map((r: any) => ({
          id: r.id,
          name: r.name,
          role: r.company,
          text: r.content,
          avatar: r.avatarUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100"
        }));
      
      if (formatted.length > 0) {
        setActiveReviews(formatted);
      } else {
        setActiveReviews(INITIAL_TESTIMONIALS);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
    window.addEventListener('cms-update', fetchReviews);
    return () => window.removeEventListener('cms-update', fetchReviews);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    const updateConstraints = () => {
      const trackWidth = track.scrollWidth;
      const visibleWidth = container.offsetWidth;
      setDragConstraints({ 
        left: Math.min(0, -(trackWidth - visibleWidth)), 
        right: 0 
      });
    };

    const observer = new ResizeObserver(updateConstraints);
    observer.observe(track);
    observer.observe(container);

    updateConstraints();
    const timer = setTimeout(updateConstraints, 1000);
    
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [activeReviews]);

  return (
    <section className="bg-[#2F4156] py-32 md:py-48 relative overflow-hidden">
      {/* Background Decorative Ambient */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] bg-[#567C8D]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-0 w-[40vw] h-[40vw] bg-[#567C8D]/5 blur-[120px] rounded-full" />
      </div>

      <Layout className="relative z-10">
        {/* TOP AREA: Header and Stats (STRICTLY UNCHANGED) */}
        <div ref={containerRef} className="flex flex-col md:grid md:grid-cols-12 gap-12 md:gap-8 items-start mb-24 md:mb-32">
          {/* Left Side: Title */}
          <div className="md:col-span-6 space-y-8">
            <div className="flex items-center gap-3">
              <HexIcon className="w-2.5 h-2.5" fill="#567C8D" />
              <span className="text-white/40 text-[10px] md:text-xs font-black tracking-[0.4em] uppercase">CLIENT TRUST</span>
            </div>
            <h2 className="text-white text-5xl md:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter uppercase cursor-default">
              <CinematicText as="span" className="hover:text-[#567C8D] transition-colors duration-500" intensity={1.0}>REAL</CinematicText>
              <br />
              <CinematicText as="span" className="text-[#567C8D] hover:text-white transition-colors duration-500" intensity={1.0}>PARTNERS.</CinematicText>
              <br />
              <CinematicText as="span" className="hover:text-[#567C8D] transition-colors duration-500" intensity={1.0}>REAL</CinematicText>
              <br />
              <div className="flex flex-row items-baseline">
                <CinematicText as="span" className="hover:text-[#567C8D] transition-colors duration-500" intensity={1.0}>RESULTS</CinematicText>
                <CinematicText as="span" className="hover:text-[#567C8D] transition-colors duration-500" intensity={1.0}>.</CinematicText>
              </div>
            </h2>
          </div>

          {/* Right Side: Circular Stats */}
          <div className="md:col-span-6 grid grid-cols-2 md:flex md:flex-nowrap gap-6 md:gap-4 lg:gap-8 justify-items-center justify-center md:justify-end w-full pt-12 md:pt-24">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className={`w-32 h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 flex flex-col items-center justify-center relative group ${
                  i === 2 ? "col-span-2 md:col-span-1" : "col-span-1"
                }`}
              >
                <HexIcon className="absolute inset-0 w-full h-full opacity-10 group-hover:opacity-30 transition-opacity duration-500" fill="white" />
                <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-2xl md:text-3xl lg:text-4xl font-display font-black tracking-[-0.04em] text-white group-hover:text-[#567C8D] transition-colors">
                    {stat.value}
                  </span>
                  <span className="text-[8px] md:text-[9px] lg:text-[10px] font-display font-black tracking-[0.15em] uppercase text-white/40 mt-1 leading-tight px-2">
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* BOTTOM AREA: HORIZONTAL REVIEW STRIP (DYNAMIC) */}
        <div className="relative mt-12 md:mt-0">
          <div className="flex items-center gap-4 mb-8 opacity-40">
             <span className="text-[9px] font-black tracking-[0.4em] uppercase text-white/60">FOUNDER FEEDBACK</span>
             <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="overflow-visible cursor-grab active:cursor-grabbing">
            <motion.div
              ref={trackRef}
              drag="x"
              dragConstraints={dragConstraints}
              style={{ x }}
              dragElastic={0.1}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              className="flex gap-6 md:gap-8 w-max"
            >
              {activeReviews.map((t, i) => (
                <ReviewCard key={t.id} data={t as any} index={i} />
              ))}
              {/* Spacer for proper end alignment */}
              <div className="min-w-[10vw] shrink-0 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </Layout>
    </section>
  );
};

const ReviewCard: React.FC<{ data: { name: string; role: string; text: string; avatar: string }, index: number }> = ({ data, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 + (index * 0.1), duration: 0.8 }}
      whileHover={{ y: -5 }}
      className="w-[85vw] md:w-[460px] min-h-[300px] md:h-[340px] bg-[#232b5c] border border-white/5 p-8 md:p-10 rounded-[32px] relative group transition-all duration-500 hover:border-white/10 shadow-2xl flex flex-col shrink-0"
    >
      {/* Top Label: Red Dot + Name/Company */}
      <div className="flex items-center gap-3 mb-10 shrink-0">
        <HexIcon className="w-3.5 h-3.5" fill="#567C8D" />
        <span className="text-white font-display font-black text-[10px] md:text-xs tracking-[-0.02em] uppercase opacity-80">
          {data.name} / {data.role}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center gap-8">
        <div className="flex gap-6 items-start">
          <div className="w-16 h-16 md:w-20 md:h-20 border border-white/10 overflow-hidden shrink-0 bg-white/5 rounded-full">
            <img 
              src={data.avatar} 
              alt={data.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div className="flex-1">
            <p className="text-white/70 text-base md:text-lg font-display font-black leading-[1.6] tracking-[-0.02em] uppercase">
              "{data.text}"
            </p>
          </div>
        </div>
      </div>

      {/* Subtle Blueprint Accent */}
      <div className="absolute bottom-10 right-10 opacity-10 group-hover:opacity-30 transition-opacity shrink-0">
        <span className="text-[10px] font-black tracking-widest uppercase text-white">00{index + 1}</span>
      </div>
    </motion.div>
  );
};
