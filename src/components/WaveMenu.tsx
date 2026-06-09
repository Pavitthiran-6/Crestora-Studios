import React, { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useTransition } from "./TransitionProvider";
import HexIcon from "./HexIcon";

interface WaveMenuProps {
  isOpen: boolean;
  onClose: () => void;
  bgColor?: string;
  textColor?: string;
  closeBtnColor?: string;
}

export const WaveMenu: React.FC<WaveMenuProps> = ({ 
  isOpen, 
  onClose, 
  bgColor = "#ffffff",
  textColor = "#2F4156",
  closeBtnColor = "#567C8D"
}) => {
  const navigate = useNavigate();
  const waveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && waveRef.current && !waveRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const { triggerLogoTransition, triggerPageTransition } = useTransition();
  const socialLinks: Record<string, string> = {
    LINKEDIN: "https://linkedin.com",
    INSTAGRAM: "https://www.instagram.com/crestorastudios/",
    TWITTER: "https://twitter.com",
    BEHANCE: "https://behance.net",
    DRIBBBLE: "https://dribbble.com",
  };
  const navItems = [
    { label: "WORK", path: "/work" },
    { label: "SERVICES", path: "/services" },
    { label: "STUDIO", path: "/studio" },
    { label: "CONTACT", path: "/contact" }
  ];

  return (
    <motion.div
      ref={waveRef}
      initial={false}
      animate={{ y: isOpen ? "0%" : "100%" }}
      transition={{ type: "spring", stiffness: 35, damping: 10, mass: 1.2, restDelta: 0.001 }}
      className="absolute inset-0 z-[1000] flex flex-col pointer-events-none"
    >
      <div className="relative w-full h-[240px] -mb-1">
        <svg viewBox="0 0 1440 240" className="w-full h-full" preserveAspectRatio="none">
          <motion.path
            d={isOpen
              ? "M0,0 C240,-60 480,100 720,0 C960,-60 1200,100 1440,0 V240 H0 Z"
              : "M0,240 C240,240 480,240 720,240 C960,240 1200,240 1440,240 V240 H0 Z"}
            animate={{
              d: isOpen
                ? "M0,0 C240,-60 480,100 720,0 C960,-60 1200,100 1440,0 V240 H0 Z"
                : "M0,240 C240,240 480,240 720,240 C960,240 1200,240 1440,240 V240 H0 Z"
            }}
            transition={{ type: "spring", stiffness: 40, damping: 12, mass: 2 }}
            fill={bgColor}
          />
          <motion.path
            d={isOpen
              ? "M0,20 C360,-40 720,80 1080,20 C1440,-40 1800,80 2160,20 V240 H0 Z"
              : "M0,240 C360,240 720,240 1080,240 C1440,240 1800,240 2160,240 V240 H0 Z"}
            animate={{
              x: [0, -60, 0],
              d: isOpen
                ? "M0,20 C360,-40 720,80 1080,20 C1440,-40 1800,80 2160,20 V240 H0 Z"
                : "M0,240 C360,240 720,240 1080,240 C1440,240 1800,240 2160,240 V240 H0 Z"
            }}
            transition={{ x: { duration: 8, repeat: Infinity, ease: "linear" }, d: { type: "spring", stiffness: 30, damping: 10, mass: 2.5 } }}
            fill={bgColor}
            opacity="0.3"
          />
        </svg>
      </div>
      <div className={`flex-1 pointer-events-auto px-6 md:px-16 py-8 md:py-12 flex flex-col justify-between -mt-10`} style={{ backgroundColor: bgColor }}>
        <motion.div animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }} transition={{ delay: 0.6, duration: 1 }} className="flex justify-between items-center w-full">
          <button 
            onClick={() => {
              onClose();
              triggerLogoTransition();
            }}
            className="w-10 h-10 md:w-14 md:h-14 bg-transparent flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shrink-0"
          >
             <img src="/crestora_logo.png" alt="Crestora Studios Logo" className="w-full h-full object-contain" />
          </button>
          <nav className="flex items-center gap-3 md:gap-6 lg:gap-8 flex-1 justify-center min-w-0">
            {navItems.map((item, index) => (
              <div key={item.label} className="flex items-center gap-3 md:gap-6 lg:gap-8">
                <motion.span 
                  onClick={() => {
                    onClose();
                    triggerPageTransition(item.path);
                  }}
                  whileHover={{ color: "#567C8D" }}
                  whileTap={{ color: "#567C8D", scale: 0.95 }}
                  className="text-xl md:text-3xl lg:text-[4.5vw] font-display font-black tracking-tighter cursor-pointer whitespace-nowrap uppercase flex items-baseline gap-1"
                  style={{ color: textColor }}
                >
                  {item.label}<HexIcon className="w-[1vw] h-[1vw]" fill="#567C8D" />
                </motion.span>
                {index < navItems.length - 1 && <HexIcon className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 lg:w-3.5 lg:h-3.5" fill="#567C8D" />}
              </div>
            ))}
          </nav>
          <button onClick={onClose} className="relative flex gap-2 md:gap-3 h-10 md:h-12 items-center cursor-pointer group">
            <div className={`flex flex-col items-center h-8 md:h-10 w-px relative`} style={{ backgroundColor: textColor + '33' }}>
               <motion.div animate={{ y: isOpen ? 20 : 0 }} className="absolute top-0 -translate-x-1/2 left-1/2">
                 <HexIcon className="w-1.5 md:w-2 h-1.5 md:h-2" fill="white" />
               </motion.div>
            </div>
            <div className={`flex flex-col items-center h-8 md:h-10 w-px relative`} style={{ backgroundColor: textColor + '66' }}>
               <motion.div animate={{ y: isOpen ? -20 : 0 }} className="absolute bottom-0 -translate-x-1/2 left-1/2">
                 <HexIcon className="w-1.5 md:w-2 h-1.5 md:h-2 shadow-[0_0_10px_#567C8D]" fill="#567C8D" />
               </motion.div>
            </div>
            <div className={`flex flex-col items-center h-8 md:h-10 w-px relative`} style={{ backgroundColor: textColor + '33' }} />
          </button>
        </motion.div>
        <motion.div animate={{ opacity: isOpen ? 1 : 0 }} transition={{ delay: 0.8, duration: 0.8 }} className="flex justify-center gap-6 md:gap-12 pb-4">
          {["LINKEDIN", "INSTAGRAM", "TWITTER", "BEHANCE", "DRIBBBLE"].map((link) => (
            <motion.a 
              key={link} 
              href={socialLinks[link]}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ color: "#567C8D" }}
              whileTap={{ color: "#567C8D", scale: 0.9 }}
              className="text-[7px] md:text-[9px] font-black tracking-[0.3em] cursor-pointer uppercase no-underline" 
              style={{ color: textColor }}
            >
              {link}
            </motion.a>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
