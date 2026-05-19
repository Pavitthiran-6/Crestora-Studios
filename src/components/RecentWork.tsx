import React, { useRef, useState, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import ReactLenis from "lenis/react";
import { Layout } from "./layout/Layout";
import { useTransition } from "./TransitionProvider";
import { CinematicText } from "./CinematicText";
import { cmsService } from "../lib/cms-service";
import { Project } from "../types/project";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";

// Local SVGs to avoid any external icon dependency crashes
const HexIcon = ({ className = "", fill = "#ef4444" }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l9.5 5.5v11L12 24l-9.5-5.5v-11z" fill={fill} />
  </svg>
);

const ArrowIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const StickyCard_001 = ({
  i,
  project,
  progress,
  range,
  targetScale,
  isMobile,
  isLast,
}: {
  i: number;
  project: Project;
  progress: any;
  range: [number, number];
  targetScale: number;
  isMobile: boolean;
  isLast: boolean;
}) => {
  const container = useRef<HTMLDivElement>(null);
  const scale = useTransform(progress, range, [1, targetScale]);
  const { triggerPageTransition } = useTransition();

  const handleCardClick = () => {
    if (!project.slug) return;
    
    // Normalize target path: if it starts with slash, check if it already has /work/ prefix
    let targetPath = project.slug;
    if (targetPath.startsWith('/')) {
      if (!targetPath.startsWith('/work/')) {
        targetPath = `/work${targetPath}`;
      }
    } else {
      if (targetPath.startsWith('work/')) {
        targetPath = `/${targetPath}`;
      } else {
        targetPath = `/work/${targetPath}`;
      }
    }
    
    triggerPageTransition(targetPath);
  };

  return (
    <div
      ref={container}
      className="sticky top-0 flex items-center justify-center recent-work-sticky-parent w-full px-2 md:px-0 pointer-events-none"
    >
      <motion.div
        style={{
          scale,
          top: isMobile 
            ? `calc(8vh + ${i * 12 + 80}px)` 
            : `calc(-5vh + ${i * 20 + 150}px)`,
        }}
        className="relative w-full max-w-[600px] flex flex-col items-center justify-center pointer-events-none"
      >
        <div
          onClick={handleCardClick}
          className="rounded-3xl md:rounded-4xl relative -top-1/6 md:-top-1/4 flex h-[350px] sm:h-[380px] md:h-[400px] w-full origin-top flex-col overflow-hidden cursor-pointer recent-work-card pointer-events-auto"
        >
          <img 
            src={getOptimizedImageUrl(project.coverImage, 800)} 
            alt={project.title} 
            loading="lazy" 
            className="h-full w-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
            <div className="flex flex-wrap gap-2 relative top-auto left-auto mb-2 md:mb-4">
              {project.services.length > 0 ? project.services.map((service, index) => (
                <span
                  key={index}
                  className="text-[8px] md:text-[10px] font-black tracking-[0.2em] text-white/50 border border-white/10 px-2 py-1 rounded-sm uppercase backdrop-blur-sm"
                >
                  {service.label}
                </span>
              )) : (
                <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] text-[#ef4444] border border-[#ef4444]/20 px-2 py-1 rounded-sm uppercase backdrop-blur-sm">
                  {project.category}
                </span>
              )}
            </div>
            <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-display font-black uppercase leading-tight tracking-tighter">
              <span className="text-[#ef4444]">{project.title.split(' ')[0]}</span>
              {project.title.split(' ').length > 1 ? ` ${project.title.split(' ').slice(1).join(' ')}` : ''}
            </h3>
          </div>
        </div>

        {/* Mobile Progress Line placed directly below the last card container */}
        {isMobile && isLast && (
          <div className="w-48 h-px bg-white/10 overflow-hidden z-50 mt-12 shrink-0">
            <motion.div
              style={{ scaleX: progress }}
              className="h-full bg-[#ef4444] origin-left"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

const Skiper16 = ({ projects, scrollYProgress, isMobile }: { projects: Project[], scrollYProgress: any, isMobile: boolean }) => {
  return (
    <div className="relative w-full mx-auto flex flex-col items-center justify-center pt-[4vh] md:pt-[10vh] recent-work-track">
      {projects.map((project, i) => {
        const targetScale = Math.max(
          0.6,
          1 - (projects.length - i - 1) * 0.1,
        );
        return (
          <StickyCard_001
            key={project.id}
            i={i}
            project={project}
            progress={scrollYProgress}
            range={[i * 0.15, 1]}
            targetScale={targetScale}
            isMobile={isMobile}
            isLast={i === projects.length - 1}
          />
        );
      })}
    </div>
  );
};

export const RecentWork = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { triggerPageTransition } = useTransition();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const fetchHomeCards = async () => {
      try {
        const cards = await cmsService.getHomeCards();
        // Filter active cards and sort by order (if not already sorted)
        const activeCards = cards.filter((c: any) => c.is_active);

        // Map HomeCards to the expected Project format for the UI
        const mappedProjects = activeCards.map((c: any) => ({
          id: c.id,
          title: c.title,
          coverImage: c.image_url,
          slug: c.slug || '',
          category: (c.tags || 'PROJECT').toUpperCase() === 'BRADING' ? 'BRANDING' : (c.tags || 'PROJECT'),
          services: c.tags ? c.tags.split(',').map((t: string) => {
            const cleanT = t.trim();
            return { label: cleanT.toUpperCase() === 'BRADING' ? 'BRANDING' : cleanT };
          }) : []
        }));

        setProjects(mappedProjects as any);
      } catch (err) {
        console.error("Failed to fetch home cards from Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeCards();
    window.addEventListener('cms-update', fetchHomeCards);
    return () => window.removeEventListener('cms-update', fetchHomeCards);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#1f2547] h-[190vh] md:h-[350vh] recent-work-section"
    >
      <Layout className="relative h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 h-full items-start">

          {/* Left Column: Fixed Title Area */}
          <div className="lg:col-span-5 h-full pt-32 hidden lg:block">
            <div className="sticky top-40 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <HexIcon className="w-3.5 h-3.5" fill="#ef4444" />
                <span className="text-white text-[10px] md:text-xs font-black tracking-[0.3em] uppercase whitespace-nowrap opacity-60">SELECTED PROJECTS</span>
              </div>
              <h2 className="text-white text-5xl md:text-7xl lg:text-8xl font-display font-black leading-[0.85] tracking-tighter uppercase cursor-default">
                <CinematicText as="span" className="text-[#ef4444] hover:text-white transition-colors duration-500" intensity={1.0}>RECENT</CinematicText>
                <br />
                <CinematicText as="span" className="hover:text-[#ef4444] transition-colors duration-500" intensity={1.0}>WORK.</CinematicText>
              </h2>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => triggerPageTransition("/work")}
                className="group flex items-center gap-6 cursor-pointer mt-12 w-fit"
              >
                <div className="w-14 h-14 rounded-full bg-[#ef4444] flex items-center justify-center shadow-[0_20px_50px_rgba(239,68,68,0.3)] group-hover:shadow-[0_25px_60px_rgba(239,68,68,0.5)] transition-all duration-500">
                  <ArrowIcon className="w-7 h-7 text-white" />
                </div>
                <span className="text-white text-[10px] md:text-xs font-black tracking-[0.4em] uppercase opacity-40 group-hover:opacity-100 transition-opacity">
                  EXPLORE ALL
                </span>
              </motion.button>
            </div>
          </div>

          {/* Right Column: Stacking Cards */}
          <div className="col-span-1 lg:col-span-7 relative h-full flex flex-col items-center justify-start pb-24 md:pb-0">
            <div className="lg:hidden pt-12 mb-6">
              <h2 className="text-white text-6xl font-display font-black uppercase leading-tight tracking-tighter">
                RECENT<br /><span className="text-[#ef4444]">WORK.</span>
              </h2>
            </div>

            <Skiper16 projects={projects} scrollYProgress={scrollYProgress} isMobile={isMobile} />
          </div>
        </div>
      </Layout>

      {/* Desktop Progress Line */}
      <div className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-px bg-white/10 overflow-hidden z-50">
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="h-full bg-[#ef4444] origin-left"
        />
      </div>
    </section>
  );
};
