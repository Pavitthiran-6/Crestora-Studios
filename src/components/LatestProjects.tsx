import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Layout } from "./layout/Layout";
import { useTransition } from "./TransitionProvider";
import { CinematicText } from "./CinematicText";
import { cmsService } from "../lib/cms-service";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";
import { cn } from "../lib/utils";
import HexIcon from "./HexIcon";

function ProjectCard({ project, index }: { project: any; index: number }) {
  const ref = useRef(null);
  const { triggerPageTransition } = useTransition();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, index % 2 === 0 ? -100 : -50]);

  const handleCardClick = () => {
    if (!project.slug) return;
    
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
    <motion.div
      ref={ref}
      style={{ y }}
      onClick={handleCardClick}
      className={cn(
        "relative flex flex-col group cursor-pointer",
        index === 1 ? "md:mt-32" : ""
      )}
    >
      <div className="aspect-[4/5] rounded-[32px] overflow-hidden mb-8 relative">
        <motion.img
          src={getOptimizedImageUrl(project.coverImage, 800)}
          alt={project.name}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute bottom-10 left-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 translate-y-0 md:translate-y-4 md:group-hover:translate-y-0">
          <span className="text-xs font-black tracking-[0.3em] uppercase text-[#567C8D] mb-2 block">{project.id}</span>
          <div className="relative inline-block">
            <h4 className="text-3xl font-display font-black tracking-[-0.02em] uppercase text-white">{project.name}</h4>
            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#567C8D] scale-x-100 md:scale-x-0 md:group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </div>
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/60 block mt-2">{project.category}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function LatestProjects() {
  const { triggerPageTransition } = useTransition();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchHomeCards = async () => {
      try {
        const cards = await cmsService.getHomeCards();
        const activeCards = cards.filter((c: any) => c.is_active);

        const mappedProjects = activeCards.map((c: any, index: number) => ({
          id: String(index + 1).padStart(2, '0'),
          name: c.title,
          coverImage: c.image_url,
          slug: c.slug || '',
          category: (c.tags || 'PROJECT').toUpperCase() === 'BRADING' ? 'BRANDING' : (c.tags || 'PROJECT'),
        }));

        setProjects(mappedProjects);
      } catch (err) {
        console.error("Failed to fetch home cards from Supabase:", err);
      }
    };

    fetchHomeCards();
    window.addEventListener('cms-update', fetchHomeCards);
    return () => window.removeEventListener('cms-update', fetchHomeCards);
  }, []);

  return (
    <section className="py-32 md:py-48 bg-[#2F4156]">
      <Layout>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Left Side Title */}
          <div className="lg:col-span-4 lg:sticky lg:top-40 h-fit space-y-6">
            <div className="flex items-center gap-3">
              <HexIcon className="w-3 h-3" fill="#567C8D" />
              <CinematicText className="text-[10px] font-black tracking-[0.3em] uppercase text-white">PORTFOLIO</CinematicText>
            </div>
            <CinematicText as="h2" className="text-6xl md:text-8xl font-display font-black tracking-[-0.04em] uppercase leading-[0.85] text-white">
              LATEST<br />
              <span className="text-[#567C8D]">PROJECTS<span className="text-white">.</span></span>
            </CinematicText>
          </div>

          {/* Right Side Editorial Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 pt-0 lg:pt-24">
            {projects.map((proj, i) => (
              <ProjectCard key={proj.id} project={proj} index={i} />
            ))}
          </div>
        </div>

        <div className="mt-32 flex justify-center">
          <motion.button
            whileHover={{ y: -5 }}
            onClick={() => triggerPageTransition("/work")}
            className="group flex flex-col items-center gap-4 cursor-pointer"
          >
            <span className="text-xs font-black tracking-[0.4em] uppercase text-white/40 group-hover:text-white transition-colors">VIEW ALL WORK</span>
            <div className="w-12 h-[1px] bg-white/20 relative overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 bg-[#567C8D]"
              />
            </div>
          </motion.button>
        </div>
      </Layout>
    </section>
  );
}
