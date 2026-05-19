import { useState, useRef, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useParams, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EarthGlobe } from "../components/EarthGlobe";
import { Layout } from "../components/layout/Layout";
import { Footer } from "../components/Footer";
import { SmoothScrollProvider } from "../components/SmoothScrollProvider";
import { useTransition } from "../components/TransitionProvider";
import { CinematicText } from "../components/CinematicText";
import { WaveMenu } from "../components/WaveMenu";
import HexIcon from "../components/HexIcon";
import { cmsService } from "../lib/cms-service";
import { Project } from "../types/project";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const HeroSection = ({ title }: { title: string }) => {
  const container = useRef<HTMLDivElement>(null);
  const { triggerPageTransition } = useTransition();
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"]
  });

  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const globeOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={container} className="relative h-full shrink-0 overflow-hidden bg-[#f5f5f3] flex flex-col">
      {/* Mobile-only tags at the top left corner of the hero section */}
      <div className="md:hidden pl-6 pt-24 pb-2 z-20 flex items-center gap-1.5 text-[8px] font-black tracking-[0.2em] uppercase pointer-events-auto">
        <span className="text-[#050505]/40 leading-none">W2C Studios</span>
        <HexIcon className="w-1.5 h-1.5 translate-y-[0.5px]" fill="#ef4444" />
        <button onClick={() => triggerPageTransition("/work")} className="text-[#ef4444] uppercase leading-none cursor-pointer">WORK</button>
        <HexIcon className="w-1.5 h-1.5 translate-y-[0.5px]" fill="#ef4444" />
        <span className="text-[#050505] leading-none truncate max-w-[100px]">{title}</span>
      </div>

      <div className="relative flex-1 w-full flex flex-col items-center justify-center -top-16 md:-top-16">
        <motion.div 
          style={{ opacity: globeOpacity }} 
          className="absolute z-0 w-[130vw] h-[130vw] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:inset-0 md:w-full md:h-full md:translate-x-0 md:translate-y-0 pointer-events-none md:pointer-events-auto"
        >
          <Canvas dpr={[1, 2]} performance={{ min: 0.5 }} gl={{ antialias: true, alpha: true }}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <EarthGlobe />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </motion.div>

        <motion.div
          style={{ scale: titleScale }}
          className="relative z-10 text-center px-4"
        >
          <CinematicText
            as="h1"
            className="text-[18vw] md:text-[15vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] text-[#050505] mix-blend-multiply"
            intensity={1.2}
          >
            {title}
          </CinematicText>
        </motion.div>
      </div>
    </section>
  );
};

const ProjectIntroSection = ({ project }: { project: Project }) => {
  return (
    <section className="py-24 md:py-40 bg-[#f5f5f3] border-t border-[#050505]/5">
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
          <div className="md:col-span-4 flex flex-col gap-10">
            <div className="flex items-center gap-3">
              <HexIcon className="w-2.5 h-2.5" fill="#050505" />
              <span className="text-[10px] font-black tracking-[0.4em] text-[#050505] uppercase">SERVICES</span>
            </div>
            <div className="space-y-6">
              {(project.services.length > 0 ? project.services : [{id: '1', label: project.category}]).map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="group flex items-center justify-between border-b border-[#050505]/10 pb-4 cursor-default"
                >
                  <span className="text-xl md:text-2xl font-display font-black text-[#050505] uppercase tracking-tighter group-hover:text-[#ef4444] transition-colors">
                    {service.label}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-[#050505]/20 group-hover:bg-[#ef4444] transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col gap-12">
            <div className="flex items-center gap-3">
              <HexIcon className="w-2.5 h-2.5" fill="rgba(5, 5, 5, 0.2)" />
              <span className="text-[10px] font-display font-black tracking-[0.4em] text-[#050505]/40 uppercase">THE PROJECT</span>
            </div>
            <CinematicText
              as="p"
              className="text-4xl md:text-6xl lg:text-[5vw] font-display font-black text-[#050505] leading-[0.95] tracking-[-0.04em] uppercase"
              intensity={0.8}
            >
              {project.description || "WE CRAFTED A BOLD IDENTITY FOR THIS PROJECT."}
            </CinematicText>
            <div className="h-px w-full bg-[#050505]/10 mt-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {project.metrics.map((metric) => (
                <div key={metric.id} className="flex flex-col gap-4">
                  <span className="text-[10px] font-display font-black tracking-[0.4em] text-[#050505]/40 uppercase">{metric.title}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl md:text-9xl font-display font-black text-[#050505]">{metric.number}</span>
                    <span className="text-3xl font-display font-black text-[#ef4444]">{metric.symbol}</span>
                  </div>
                  <p className="text-xs font-sans font-medium tracking-tight text-[#050505]/60 uppercase leading-relaxed max-w-[240px]">
                    {metric.description}
                  </p>
                </div>
              ))}
              {project.metrics.length === 0 && (
                <div className="flex flex-col gap-4 opacity-20">
                  <span className="text-[10px] font-display font-black tracking-[0.4em] text-[#050505]/40 uppercase">METRIC</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl md:text-9xl font-display font-black text-[#050505]">--</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </section>
  );
};

const ImageCompositionSection = ({ project }: { project: Project }) => {
  const [imageSet, setImageSet] = useState(0);
  const imagePairs = useMemo(() => [
    { left: project.shuffleImage1 || project.coverImage, right: project.shuffleImage2 || project.coverImage },
    { left: project.shuffleImage2 || project.coverImage, right: project.shuffleImage1 || project.coverImage }
  ], [project]);

  const handleNext = () => setImageSet((prev) => (prev + 1) % imagePairs.length);

  return (
    <section className="pt-24 md:pt-40 pb-20 bg-[#f5f5f3]">
      <Layout className="relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#050505]/10 flex items-center justify-between px-4">
          <div className="w-2 h-2 border border-[#050505]/20 rotate-45 bg-[#f5f5f3]" />
          <div className="w-2 h-2 border border-[#050505]/20 rotate-45 bg-[#f5f5f3]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 pt-20">
          <div className="md:col-span-5 relative">
            <motion.div
              key={`left-${imageSet}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[20px] overflow-hidden aspect-[3/4] md:aspect-[4/5] bg-gray-200"
            >
              <img 
                src={getOptimizedImageUrl(imagePairs[imageSet].left, 800)} 
                alt="Editorial Left" 
                loading="lazy" 
                className="w-full h-full object-cover scale-110" 
              />
            </motion.div>
            <div className="absolute left-1/2 -bottom-16 -translate-x-1/2 md:top-20 md:left-auto md:bottom-auto md:-right-24 md:translate-x-0 z-20">
              <button
                onClick={handleNext}
                className="w-32 h-32 md:w-48 md:h-48 bg-[#4b2e83] rounded-full flex items-center justify-center group hover:scale-110 transition-transform cursor-pointer active:scale-95 shadow-2xl"
              >
                <span className="text-white text-xs font-display font-black tracking-[0.4em] uppercase group-hover:tracking-[0.6em] transition-all">SHUFFLE</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-7 mt-20 md:mt-40 space-y-24">
            <motion.div
              key={`right-${imageSet}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[20px] overflow-hidden aspect-[4/3] md:aspect-[16/18] bg-gray-300"
            >
              <img 
                src={getOptimizedImageUrl(imagePairs[imageSet].right, 1000)} 
                alt="Editorial Right" 
                loading="lazy" 
                className="w-full h-full object-cover scale-110" 
              />
            </motion.div>
            <div className="space-y-16">
              <CinematicText as="h2" className="text-[8vw] md:text-[6vw] font-display font-black text-[#050505] leading-[0.85] uppercase tracking-[-0.04em]" intensity={0.9}>
                {project.universalTitle || "FUSING TECH WITH HUMANITY"}
              </CinematicText>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-4 flex items-center gap-4">
                  <div className="w-2.5 h-2.5 bg-[#050505] rounded-full" />
                  <span className="text-[10px] font-display font-black tracking-[0.4em] text-[#050505] uppercase">{project.missionLabel || "MISSION"}</span>
                </div>
                <div className="md:col-span-8">
                  <p className="text-base md:text-lg font-sans font-medium text-[#050505]/70 leading-relaxed uppercase">
                    {project.heroSubtitle || "WE PROVIDE SECURE SOLUTIONS GLOBALLY THROUGH CUTTING EDGE DESIGN."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </section>
  );
};

const DeviceShowcaseSection = ({ project }: { project: Project }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <section ref={containerRef} className="relative min-h-[700vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <img 
          src={getOptimizedImageUrl(project.coverImage, 1200)} 
          alt="Background" 
          loading="lazy" 
          className="w-full h-full object-contain md:object-cover opacity-30 grayscale" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="absolute inset-0 z-10">
        <Layout>
          <div className="h-screen flex flex-col items-center justify-center text-center">
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <CinematicText as="h2" className="text-[16vw] md:text-[12vw] lg:text-[10vw] font-display font-black text-white leading-[0.8] uppercase tracking-[-0.05em]" intensity={1.5}>
                UNIVERSAL<br />{project.title}
              </CinematicText>
            </motion.div>
          </div>

          <div className="h-screen flex items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="w-[95vw] md:w-full max-w-6xl md:max-w-7xl lg:max-w-[85vw] aspect-[4/3] md:aspect-video rounded-[32px] overflow-hidden bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl relative group transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
              {project.videoUrl ? (
                <video
                  src={project.videoUrl}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <>
                  <img 
                    src={getOptimizedImageUrl(project.coverImage, 1200)} 
                    alt="Video Preview" 
                    loading="lazy" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl scale-100 group-hover:scale-110 transition-transform">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-black border-b-[10px] border-b-transparent ml-1" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          <div className="h-[40vh]" />

          {/* Mobile Previews Grid */}
          <div className="h-screen flex items-center justify-start px-10 md:px-40">
            <motion.div initial={{ opacity: 0, x: -200, y: 100, rotate: -5, scale: 0.9 }} whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="w-[320px] md:w-[380px] aspect-[9/18] rounded-2xl md:rounded-[48px] bg-[#050505] border-0 md:border-[8px] border-[#1a1a1a] shadow-2xl overflow-hidden relative transform-gpu">
              <img 
                src={getOptimizedImageUrl(project.mobileViews[0]?.url || project.shuffleImage1 || project.coverImage, 600)} 
                alt="Mobile View 1" 
                loading="lazy" 
                className="w-full h-full object-cover" 
              />
            </motion.div>
          </div>

          <div className="h-screen flex items-center justify-end px-10 md:px-40">
            <motion.div initial={{ opacity: 0, x: 200, y: 100, rotate: 5, scale: 0.9 }} whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="w-[280px] md:w-[320px] aspect-[9/18] rounded-2xl md:rounded-[48px] bg-[#050505] border-0 md:border-[8px] border-[#1a1a1a] shadow-2xl overflow-hidden relative transform-gpu mt-40">
              <img 
                src={getOptimizedImageUrl(project.mobileViews[1]?.url || project.coverImage, 600)} 
                alt="Mobile View 2" 
                loading="lazy" 
                className="w-full h-full object-cover" 
              />
            </motion.div>
          </div>

          <div className="h-screen flex items-center justify-start px-10 md:px-40">
            <motion.div initial={{ opacity: 0, x: -200, y: 100, rotate: -5, scale: 0.9 }} whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="w-[320px] md:w-[380px] aspect-[9/18] rounded-2xl md:rounded-[48px] bg-[#050505] border-0 md:border-[8px] border-[#1a1a1a] shadow-2xl overflow-hidden relative transform-gpu">
              <img 
                src={getOptimizedImageUrl(project.mobileViews[2]?.url || project.coverImage, 600)} 
                alt="Mobile View 3" 
                loading="lazy" 
                className="w-full h-full object-cover" 
              />
            </motion.div>
          </div>
        </Layout>
      </div>
    </section>
  );
};

const VisionMilestonesSection = ({ project }: { project: Project }) => {
  return (
    <section className="pt-40 pb-40 bg-[#f5f5f3] relative z-10">
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20 items-start">
          <div className="md:col-span-6 relative md:sticky top-auto md:top-40">
            <CinematicText as="h2" className="text-6xl md:text-8xl font-display font-black text-[#050505] leading-[0.85] uppercase tracking-[-0.05em]" intensity={0.9}>
              VISION &<br />MILESTONES
            </CinematicText>
          </div>
          <div className="md:col-span-6 space-y-0">
            {project.milestones.map((m, i) => (
              <motion.div key={m.id} className="group relative py-10 border-b border-[#050505]/10 flex items-center justify-between cursor-pointer overflow-hidden transform-gpu">
                <div className="flex items-center gap-8 group-hover:translate-x-6 transition-transform duration-500 ease-out">
                  <span className="text-[10px] font-display font-black text-[#050505]/40 tracking-widest">{m.year}</span>
                  <span className="text-xl md:text-2xl font-display font-black text-[#050505] uppercase tracking-tight group-hover:tracking-[0.05em] transition-all duration-500">{m.title}</span>
                </div>
                <span className="text-[10px] font-display font-black text-[#050505]/40 uppercase tracking-[0.4em] group-hover:opacity-100 transition-opacity">{m.category}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Layout>
    </section>
  );
};

export default function WorkDetailsPage() {
  const { id } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWaveOpen, setIsWaveOpen] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [nextProject, setNextProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { triggerLogoTransition, triggerPageTransition } = useTransition();
  const { scrollY } = useScroll({ container: isLoading ? undefined : containerRef });
  const navigate = useNavigate();

  const navOpacity = useTransform(scrollY, [0, 150], [1, 0]);
  const navY = useTransform(scrollY, [0, 150], [0, -20]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        let p = await cmsService.getProjectBySlug(id);
        
        // Fetch all projects
        const all = await cmsService.getProjects();
        
        // Robust fallback: if project not found by slug directly, search by title or slug variants in all projects
        if (!p && all.length > 0) {
          const found = all.find(proj => 
            proj.slug?.toLowerCase() === id.toLowerCase() || 
            proj.title?.toLowerCase() === id.toLowerCase() ||
            proj.title?.toLowerCase().replace(/ /g, '-') === id.toLowerCase() ||
            proj.title?.toLowerCase().replace(/ /g, '_') === id.toLowerCase()
          );
          
          if (found) {
            // Fetch full project details by ID (including services, metrics, mobileViews, milestones)
            p = await cmsService.getProjectById(found.id);
          }
        }
        
        setProject(p);
        
        // Fetch all to find "next" project
        const next = all.find(proj => proj.slug !== (p?.slug || id)) || p;
        setNextProject(next);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f5f5f3]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f5f5f3]">
        <CinematicText as="h1" className="text-4xl font-display font-black uppercase tracking-tighter">PROJECT NOT FOUND</CinematicText>
      </div>
    );
  }

  return (
    <SmoothScrollProvider containerRef={containerRef} ease={0.07}>
      <div
        onScroll={(e) => (e.currentTarget.scrollTop = 0)}
        className="h-screen bg-black p-2 md:p-3 lg:p-4 font-sans select-none overflow-hidden"
      >
        <div
          onScroll={(e) => (e.currentTarget.scrollTop = 0)}
          className="relative w-full h-full rounded-[16px] md:rounded-[28px] lg:rounded-[40px] overflow-hidden bg-[#f5f5f3] flex flex-col border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
        >
          <WaveMenu isOpen={isWaveOpen} onClose={() => setIsWaveOpen(false)} bgColor="#1f2547" textColor="#ffffff" closeBtnColor="#050505" />
          <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden md:overflow-x-visible relative scrollbar-hide flex flex-col touch-pan-y [webkit-overflow-scrolling:touch]">
            <div className="sticky top-4 md:top-8 left-0 right-0 z-[100] px-4 md:px-20 py-4 md:py-10 flex justify-between items-center h-0 overflow-visible pointer-events-none">
              <div className="flex items-center">
                <button onClick={() => triggerLogoTransition()} className="pointer-events-auto group">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                    <img src="/W2C Studios.png" alt="W2C Studios" className="w-full h-full object-contain p-1" />
                  </div>
                </button>
                <motion.div 
                  style={{ opacity: navOpacity, y: navY }} 
                  className="ml-8 hidden md:flex items-center gap-4 text-[10px] font-black tracking-[0.4em] uppercase pointer-events-auto"
                >
                  <span className="text-[#050505]/40 uppercase leading-none">W2C Studios</span>
                  <HexIcon className="w-2.5 h-2.5" fill="rgba(5, 5, 5, 0.4)" />
                  <button onClick={() => triggerPageTransition("/work")} className="text-[#050505]/40 hover:text-[#050505] transition-colors cursor-pointer uppercase">WORK</button>
                  <HexIcon className="w-2.5 h-2.5" fill="rgba(5, 5, 5, 0.4)" />
                  <span className="text-[#050505] uppercase">{project.title}</span>
                </motion.div>
              </div>
              <div className="flex items-center gap-10">
                <motion.div style={{ opacity: navOpacity, y: navY }} className="text-[10px] font-black tracking-[0.3em] text-[#050505] uppercase pointer-events-auto hidden md:block">
                  {project.heroDate || "OCT 2023"}
                </motion.div>
                <button onClick={() => setIsWaveOpen(!isWaveOpen)} className="relative z-[100] flex gap-3 md:gap-4 h-14 md:h-20 items-center cursor-pointer group pointer-events-auto"><div className="flex flex-col items-center h-10 md:h-14 w-px bg-[#050505]/20 relative"><div className="absolute top-0 w-2.5 md:w-3.5 h-2.5 md:h-3.5 border-2 border-[#050505]/40 rounded-full bg-[#f5f5f3] -translate-x-1/2 left-1/2" /></div><div className="flex flex-col items-center h-6 md:h-10 w-px bg-[#050505]/40 relative" /><div className="flex flex-col items-center h-10 md:h-14 w-px bg-[#050505]/20 relative"><div className="absolute bottom-0 w-2.5 md:w-3.5 h-2.5 md:h-3.5 border-2 border-[#050505]/40 rounded-full bg-[#f5f5f3] -translate-x-1/2 left-1/2" /></div></button>
              </div>
            </div>
            <HeroSection title={project.title} />
            <ProjectIntroSection project={project} />
            <ImageCompositionSection project={project} />
            <DeviceShowcaseSection project={project} />
            <VisualStyleSection />
            <VisionMilestonesSection project={project} />
            
            {/* Next Project Section */}
            {nextProject && (
              <section className="py-40 md:py-60 bg-[#f5f5f3] group border-t border-[#050505]/10 relative z-10">
                <Layout>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-20 items-center">
                    <div className="md:col-span-7 space-y-8">
                      <div className="flex items-center gap-4"><div className="w-8 h-px bg-[#050505]/40" /><span className="text-[10px] font-display font-black tracking-[0.4em] text-[#050505]/40 uppercase">NEXT PROJECT</span></div>
                      <CinematicText as="h2" className="text-7xl md:text-[10vw] font-display font-black text-[#050505] uppercase leading-[0.8] tracking-[-0.05em] group-hover:translate-x-10 transition-transform duration-700" intensity={1.0}>
                        {nextProject.title ? nextProject.title.split(' ')[0] : "NEXT"}<br />{nextProject.title ? nextProject.title.split(' ').slice(1).join(' ') : "PROJECT"}
                      </CinematicText>
                      <div onClick={() => triggerPageTransition(`/work/${nextProject.slug}`)} className="flex items-center gap-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 translate-x-0 md:translate-x-10 md:group-hover:translate-x-14 transition-transform cursor-pointer w-fit">
                        <span className="text-xs font-display font-black tracking-widest text-[#050505]">VIEW CASE STUDY</span>
                        <div className="w-10 h-10 rounded-full border border-[#050505]/20 flex items-center justify-center group-hover:bg-[#050505] group-hover:text-white transition-colors"><span className="text-xl">→</span></div>
                      </div>
                    </div>
                    <div className="md:col-span-5 relative">
                      <motion.div className="aspect-video md:aspect-[4/5] rounded-[32px] overflow-hidden bg-gray-200 grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-2xl">
                        <img 
                          src={getOptimizedImageUrl(nextProject.coverImage, 800)} 
                          alt="Next Project" 
                          loading="lazy" 
                          className="w-full h-full object-cover" 
                        />
                      </motion.div>
                    </div>
                  </div>
                </Layout>
              </section>
            )}

            <Footer isLight={true} />
            <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          </div>
        </div>
      </div>
    </SmoothScrollProvider>
  );
}

const VisualStyleSection = () => {
  return (
    <section className="py-40 md:py-60 bg-[#f5f5f3] relative z-10 border-t border-[#050505]/5">
      <Layout>
        <div className="flex flex-col items-center text-center space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-[1px] bg-[#050505]/20" />
            <span className="text-[10px] font-display font-black tracking-[0.5em] text-[#050505]/40 uppercase">VISUAL LANGUAGE</span>
            <div className="w-12 h-[1px] bg-[#050505]/20" />
          </div>
          <CinematicText as="h2" className="text-[10vw] md:text-[8vw] font-display font-black text-[#050505] leading-[0.8] uppercase tracking-[-0.06em]" intensity={0.8}>
            BOLD. RAW.<br /><span className="text-[#050505]/30">ESSENTIAL.</span>
          </CinematicText>
        </div>
      </Layout>
    </section>
  );
};
