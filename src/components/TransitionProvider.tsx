"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import { Pencil } from "lucide-react";

interface TransitionContextType {
  isTransitioning: boolean;
  isLoading: boolean;
  triggerLogoTransition: () => void;
  triggerPageTransition: (path: string) => void;
  heroKey: number;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) throw new Error("useTransition must be used within a TransitionProvider");
  return context;
};

export const TransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [heroKey, setHeroKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => setIsLoading(false), 800);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  const triggerLogoTransition = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Peak of the splash (impact)
    setTimeout(() => {
      if (location.pathname !== "/") {
        navigate("/");
      }
      setHeroKey(prev => prev + 1);
      
      // Scroll top if on home page
      const container = document.querySelector(".overflow-y-auto");
      if (container) {
        container.scrollTo({ top: 0, behavior: 'instant' });
      }
    }, 600);

    // End of transition
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1400);
  };

  const triggerPageTransition = (path: string) => {
    if (isTransitioning) return;
    
    // Don't navigate if we are already there
    if (location.pathname === path) {
      setIsTransitioning(false);
      return;
    }

    setIsTransitioning(true);
    
    const isAdminPath = location.pathname.startsWith("/admin");

    setTimeout(() => {
      // Clear all scroll positions before navigating
      window.scrollTo(0, 0);
      const containers = document.querySelectorAll(".overflow-y-auto, .overflow-y-scroll, .scrollbar-hide");
      containers.forEach(container => {
        container.scrollTo({ top: 0, behavior: 'instant' });
      });

      navigate(path);
      setHeroKey(prev => prev + 1);
    }, 600);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1400);
  };

  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <TransitionContext.Provider value={{ isTransitioning, isLoading, triggerLogoTransition, triggerPageTransition, heroKey }}>
      <div className="relative w-full h-full">
        {/* Main Content: Hidden during transition to ensure a clean reveal */}
        <motion.div
          className="w-full h-full"
        >
          {children}
        </motion.div>
        
        {/* Global Floating Contact Button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: (isTransitioning || location.pathname === "/contact" || isAdminPath) ? 0 : 1, 
            x: (isTransitioning || location.pathname === "/contact" || isAdminPath) ? 20 : 0 
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/contact")}
          className="fixed bottom-8 md:bottom-12 right-6 md:right-16 z-[150] w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.1)] pointer-events-auto cursor-pointer"
          style={{ backgroundColor: location.pathname.startsWith("/work/") ? "#050505" : "#567C8D" }}
        >
          <Pencil className="text-white w-5 h-5 md:w-7 md:h-7" />
        </motion.button>
      </div>

      {/* Global Geometric Shutter Transition */}
      <GeometricShutterTransition isActive={isTransitioning} />
    </TransitionContext.Provider>
  );
};

/* --- ALTERNATIVE: GEOMETRIC SHUTTER TRANSITION --- */
const GeometricShutterTransition = ({ isActive }: { isActive: boolean }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 1.2 }}
          className="fixed inset-0 z-[9000] pointer-events-none overflow-hidden"
        >
          {/* White Cover: Solid background that obscures everything until the end */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white z-0"
          />

          {/* Top-Right Panel (Red) */}
          <motion.div
            initial={{ x: "120%", y: "-120%", skewX: -20 }}
            animate={{ x: "-120%", y: "120%" }}
            exit={{ x: "-220%", y: "220%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-[#567C8D] z-20 origin-center scale-150"
          />

          {/* Bottom-Left Panel (Dark Blue) */}
          <motion.div
            initial={{ x: "-120%", y: "120%", skewX: -20 }}
            animate={{ x: "120%", y: "-120%" }}
            exit={{ x: "220%", y: "-220%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="absolute inset-0 bg-[#2F4156] z-10 origin-center scale-150"
          />

          {/* Central Logo Flash */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.1, 1, 1.5],
            }}
            transition={{ duration: 1.2, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center z-30"
          >
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center overflow-hidden">
              {/* Old Logo (SVG) - Fades out and shrinks */}
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="w-24 h-24 fill-[#567C8D]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9zm0-16.5c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5zm.75 12c-1.24 0-2.25-1.01-2.25-2.25v-4.5c0-.41.34-.75.75-.75s.75.34.75.75v4.5c0 .41.34.75.75.75h.75c.41 0 .75.34.75.75s-.34.75-.75.75h-1.5z" />
                </svg>
              </motion.div>

              {/* New Logo (Image) - Fades in and grows with a flip */}
              <motion.div
                initial={{ opacity: 0, scale: 1.2, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <img src="/W2C Studios.png" alt="W2C Studios" className="w-full h-full object-contain p-4" />
              </motion.div>
            </div>
          </motion.div>

          {/* Particle Burst on Exit */}
          <div className="absolute inset-0 z-40">
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: "50%", y: "50%" }}
                      animate={{ 
                        scale: [0, 1.5, 0],
                        x: `${50 + (Math.random() - 0.5) * 100}%`,
                        y: `${50 + (Math.random() - 0.5) * 100}%`
                      }}
                      transition={{ duration: 1, delay: 0.6 + Math.random() * 0.4 }}
                      className={`absolute w-3 h-3 rounded-full blur-[2px] ${i % 2 === 0 ? "bg-white" : "bg-[#567C8D]"}`}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
