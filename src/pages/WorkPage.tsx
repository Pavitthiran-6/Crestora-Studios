import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Layout } from "../components/layout/Layout";
import { Footer } from "../components/Footer";
import { SmoothScrollProvider } from "../components/SmoothScrollProvider";
import { useTransition } from "../components/TransitionProvider";
import { WaveMenu } from "../components/WaveMenu";
import { CinematicText } from "../components/CinematicText";
import CircularGallery from "../components/CircularGallery";
import HexIcon from "../components/HexIcon";
import { cmsService } from "../lib/cms-service";
import { Project } from "../types/project";

export default function WorkPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { triggerLogoTransition, triggerPageTransition } = useTransition();
  const [isWaveOpen, setIsWaveOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const all = await cmsService.getProjects();
        setProjects(all.filter(p => p.status !== 'Archived'));
      } catch (err) {
        console.error("Supabase Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
    window.addEventListener('cms-update', fetchProjects);
    return () => window.removeEventListener('cms-update', fetchProjects);
  }, []);

  const galleryItems = useMemo(() => {
    return projects.map(p => ({
      image: p.coverImage,
      text: p.title,
      slug: p.slug
    }));
  }, [projects]);

  return (
    <div 
      onScroll={(e) => (e.currentTarget.scrollTop = 0)}
      className="h-screen bg-[#ef4444] p-2 md:p-3 lg:p-4 font-sans select-none overflow-hidden"
    >
      <div 
        onScroll={(e) => (e.currentTarget.scrollTop = 0)}
        className="relative w-full h-full rounded-[16px] md:rounded-[28px] lg:rounded-[40px] overflow-hidden bg-[#1f2547] flex flex-col border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
      >
        <WaveMenu isOpen={isWaveOpen} onClose={() => setIsWaveOpen(false)} />
        <div className="h-full relative overflow-hidden flex flex-col justify-center">
          <div className="sticky top-0 left-0 right-0 z-[200] h-0 overflow-visible pointer-events-none">
            <div className="px-6 md:px-12 lg:px-16 py-8 md:py-12 flex justify-between items-start">
              <div className="flex items-center gap-8 pointer-events-auto">
                <button onClick={() => triggerLogoTransition()} className="group">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                    <img src="/W2C Studios.png" alt="W2C Studios" className="w-full h-full object-contain" />
                  </div>
                </button>
                <div className="hidden md:flex items-center gap-4 pointer-events-auto">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 leading-none">W2C Studios</span>
                  <HexIcon className="w-2.5 h-2.5 translate-y-[0.5px]" fill="#ef4444" />
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#ef4444] leading-none">WORK</span>
                </div>
              </div>
              <button onClick={() => setIsWaveOpen(!isWaveOpen)} className="relative z-[100] flex gap-3 md:gap-4 h-14 md:h-20 items-center cursor-pointer group pointer-events-auto">
                <div className="flex flex-col items-center h-10 md:h-14 w-px bg-white/30 relative">
                  <motion.div animate={{ y: isWaveOpen ? 24 : 0, opacity: isWaveOpen ? 0 : 1 }} className="absolute top-0 w-2.5 md:w-3.5 h-2.5 md:h-3.5 border-2 border-white/60 rounded-full bg-[#1f2547] -translate-x-1/2 left-1/2" />
                </div>
                <div className="flex flex-col items-center h-6 md:h-10 w-px bg-white/50 relative">
                  <motion.div animate={{ opacity: isWaveOpen ? 0 : 1 }} className="absolute inset-0 bg-white/80" />
                </div>
                <div className="flex flex-col items-center h-10 md:h-14 w-px bg-white/30 relative">
                  <motion.div animate={{ y: isWaveOpen ? -24 : 0, opacity: isWaveOpen ? 0 : 1 }} className="absolute bottom-0 w-2.5 md:w-3.5 h-2.5 md:h-3.5 border-2 border-white/60 rounded-full bg-[#1f2547] -translate-x-1/2 left-1/2" />
                </div>
              </button>
            </div>
          </div>
          {/* Desktop View (Completely Untouched) */}
          <section className="hidden md:flex h-screen relative flex-col justify-center overflow-hidden pt-20">
            <Layout className="flex flex-col gap-8 h-full relative">
              <div className="z-10 flex flex-col items-center text-center pointer-events-none">
                <CinematicText as="h1" className="text-[12vw] md:text-[8vw] font-display font-black tracking-[-0.06em] leading-[0.8] uppercase text-white" intensity={1.2}>
                  SELECTED <span className="text-[#ef4444]">PROJECTS</span>
                </CinematicText>
              </div>
              <div className="absolute inset-0 w-full h-full flex items-center justify-center pt-24">
                <div className="w-full h-[70vh] relative">
                  {galleryItems.length > 0 && (
                    <CircularGallery
                      items={galleryItems}
                      bend={3}
                      textColor="#ffffff"
                      borderRadius={0.05}
                      font='900 80px "Big Shoulders Display", sans-serif'
                      scrollEase={0.08}
                      scrollSpeed={3}
                      onClick={(title: string) => {
                        const p = projects.find(proj => proj.title === title);
                        if (p) triggerPageTransition(`/work/${p.slug}`);
                      }}
                    />
                  )}
                </div>
              </div>
            </Layout>
          </section>

          {/* Mobile View: Vertical Scroll Stack */}
          <div ref={containerRef} className="md:hidden flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pt-24 pb-16">
            <Layout className="flex flex-col gap-8 relative">
              <div className="z-10 flex flex-col items-center text-center pointer-events-none">
                <CinematicText as="h1" className="text-[12vw] md:text-[8vw] font-display font-black tracking-[-0.06em] leading-[0.8] uppercase text-white" intensity={1.2}>
                  SELECTED <span className="text-[#ef4444]">PROJECTS</span>
                </CinematicText>
              </div>

              {/* Minimal Typographic Project List */}
              <div className="flex flex-col w-full px-4 mt-6 pb-12 divide-y divide-white/10">
                {projects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    onClick={() => triggerPageTransition(`/work/${project.slug}`)}
                    className="py-6 flex items-center justify-between gap-4 pointer-events-auto cursor-pointer active:opacity-60 transition-opacity"
                  >
                    <div className="flex items-start gap-4">
                      {/* Number Index */}
                      <span className="text-[10px] font-black text-white/30 tracking-widest mt-1.5 font-mono">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      
                      {/* Title & Category info */}
                      <div className="flex flex-col">
                        <span className="text-white font-display font-black text-2xl uppercase tracking-tight leading-none">
                          {project.title}
                        </span>
                        <span className="text-[9px] font-black tracking-[0.2em] text-[#ef4444] uppercase mt-2">
                          {project.category || 'Creative Project'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Compact Image Thumbnail on Right */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/5 shrink-0 bg-[#151933]">
                      <img 
                        src={project.coverImage} 
                        alt={project.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Layout>
          </div>
        </div>
      </div>
    </div>  );
}
