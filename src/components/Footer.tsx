import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Layout } from "./layout/Layout";
import { useTransition } from "./TransitionProvider";

const SERVICES = [
  { label: "WEBSITE DEVELOPMENT", href: "/website-development" },
  { label: "MOBILE APPLICATIONS", href: "/mobile-applications" },
  { label: "LOGO DESIGN", href: "/logo-design" },
  { label: "POSTER DESIGN", href: "/poster-design" },
  { label: "VIDEO EDITING", href: "/video-editing" },
  { label: "MOTION GRAPHICS", href: "/motion-graphics" },
  { label: "SEO", href: "/seo" },
  { label: "3D ANIMATION", href: "/3d-animation" },
  { label: "DIGITAL MARKETING", href: "/digital-marketing" },
  { label: "WEBSITE AND APP MAINTENANCE", href: "/website-and-app-maintenance" },
  { label: "CYBER SECURITY SOLUTIONS", href: "/cyber-security-solutions" },
];

const SOCIALS = [
  { label: "Linkedin", href: "https://linkedin.com" },
  { label: "Instagram", href: "https://www.instagram.com/crestorastudios/" },
  { label: "Twitter", href: "https://twitter.com" },
  { label: "Behance", href: "https://behance.net" },
  { label: "Dribbble", href: "https://dribbble.com" },
];

const RedHex = ({ size = "md", fill = "#567C8D" }: { size?: "sm" | "md" | "lg", fill?: string }) => {
  const s =
    size === "sm" ? "w-2 h-2" : size === "lg" ? "w-5 h-5" : "w-3 h-3 md:w-4 md:h-4";
  return (
    <svg viewBox="0 0 24 24" className={`${s} shrink-0 transition-colors duration-200`} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l9.5 5.5v11L12 24l-9.5-5.5v-11z" fill={fill} />
    </svg>
  );
};

const BlueprintLine = ({ isLight }: { isLight?: boolean }) => (
  <div className={`w-full h-px ${isLight ? 'bg-[#050505]/10' : 'bg-white/10'} relative my-5`}>
    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border ${isLight ? 'border-[#050505]/20 bg-[#f5f5f3]' : 'border-white/20 bg-[#2F4156]'}`} />
    <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border ${isLight ? 'border-[#050505]/20 bg-[#f5f5f3]' : 'border-white/20 bg-[#2F4156]'}`} />
  </div>
);

export const Footer = ({ isLight = false }: { isLight?: boolean }) => {
  const { triggerPageTransition, triggerLogoTransition } = useTransition();
  const [email, setEmail] = useState("");

  const textColor = isLight ? "text-[#050505]" : "text-white";
  const subTextColor = isLight ? "text-[#050505]/40" : "text-white/40";
  const borderColor = isLight ? "border-[#050505]/10" : "border-white/10";
  const hoverColor = isLight ? "#8b5cf6" : "#567C8D"; // Violet for light mode, Red for dark
  const bgStyle = isLight 
    ? { background: "#f5f5f3" } 
    : { background: "linear-gradient(160deg, #181c3a 0%, #2F4156 50%, #2F4156 100%)" };

  return (
    <footer className={`min-h-screen flex flex-col justify-between relative overflow-hidden ${textColor} font-sans py-8 md:py-10`}
      style={bgStyle}
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="fGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={isLight ? "black" : "white"} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fGrid)" />
        </svg>
      </div>

      {/* Red ambient glow top-right */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#567C8D]/5 blur-[120px] rounded-full pointer-events-none" />

      <Layout className="flex flex-col flex-1 justify-between gap-0 relative z-10">

        {/* ── ROW 1: LET'S TALK ── */}
        <div className="flex justify-center items-center">
          <motion.div
            className="flex items-center gap-2 md:gap-4 cursor-pointer group"
            whileHover={{ scale: 1.01, color: hoverColor }}
            whileTap={{ scale: 0.98 }}
            onClick={() => triggerPageTransition("/contact")}
          >
            <h2 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-[-0.04em] uppercase leading-none transition-colors duration-75`}>
              LET'S TALK
            </h2>
            <RedHex size="md" fill={hoverColor} />
          </motion.div>
        </div>

        {/* ── DIVIDER ── */}
        <BlueprintLine isLight={isLight} />

        {/* ── ROW 2: STUDIO | Services List | SERVICES ── */}
        <div className="grid grid-cols-12 gap-4 items-start footer-links-row">
          {/* STUDIO */}
          <div className="col-span-4 flex flex-col items-start">
            <motion.div
              onClick={() => triggerPageTransition("/studio")}
              className="flex items-center gap-2 md:gap-3 mb-3 cursor-pointer group"
              whileHover={{ x: 4, color: hoverColor }}
              whileTap={{ x: 2 }}
            >
              <h3 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-[-0.04em] uppercase leading-none transition-colors duration-75`}>
                STUDIO
              </h3>
              <RedHex size="sm" fill={hoverColor} />
            </motion.div>
            <p className={`${textColor} text-[11px] md:text-[13px] font-display font-black tracking-[-0.02em] uppercase leading-relaxed`}>
              81 PROSPECT ST, SUITE 9069,<br />
              BROOKLYN, NY 11201
            </p>
          </div>

          {/* Services List */}
          <div className="col-start-5 col-span-4 flex flex-col gap-[3px] pt-1">
            {SERVICES.map((s) => (
              <motion.span
                key={s.label}
                onClick={() => triggerPageTransition(s.href)}
                whileHover={{ x: 4, color: hoverColor }}
                transition={{ duration: 0.1 }}
                className={`${textColor} text-[11px] md:text-[13px] font-display font-black tracking-[-0.02em] uppercase cursor-pointer leading-snug block transition-all`}
              >
                {s.label}
              </motion.span>
            ))}
          </div>

          {/* SERVICES big word */}
          <div className="col-start-9 col-span-4 flex items-center justify-end gap-2 md:gap-3 self-end">
            <motion.div
              onClick={() => triggerPageTransition("/services")}
              className="flex items-center gap-2 group cursor-pointer"
              whileHover={{ x: -4, color: hoverColor }}
              whileTap={{ x: -2 }}
            >
              <h3 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-[-0.04em] uppercase leading-none text-right transition-colors duration-75`}>
                SERVICES
              </h3>
              <RedHex size="sm" fill={hoverColor} />
            </motion.div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <BlueprintLine isLight={isLight} />

        {/* ── ROW 3: WORK big word ── */}
        <motion.div
          onClick={() => triggerPageTransition("/work")}
          className="flex items-center gap-3 md:gap-5 cursor-pointer group w-fit"
          whileHover={{ x: 6, color: hoverColor }}
          whileTap={{ x: 3 }}
        >
          <h2 className={`text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-[-0.04em] uppercase leading-none transition-colors duration-75`}>
            WORK
          </h2>
          <RedHex size="lg" fill={hoverColor} />
        </motion.div>

        {/* ── ROW 4: Newsletter / Copyright / Socials ── */}
        <div className="grid grid-cols-12 items-end gap-6 pt-4 border-t border-white/5">
          {/* Newsletter */}
          <div className="col-span-4">
            <span className={`text-[8px] font-black tracking-[0.25em] uppercase block mb-3 ${textColor}`}>
              NEWSLETTER
            </span>
            <div className={`relative border-b ${borderColor} group focus-within:border-[#567C8D] transition-colors`}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                className="w-full bg-transparent py-2.5 text-[11px] md:text-[13px] font-display font-black tracking-[-0.02em] uppercase focus:outline-none placeholder:text-white/60"
              />
              <motion.button
                whileHover={{ x: 3, color: hoverColor }}
                className={`absolute right-0 top-1/2 -translate-y-1/2 ${textColor}`}
                onClick={() => { if (email) alert(`Subscribed: ${email}`); }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Copyright */}
          <div className="col-start-5 col-span-4 flex flex-col items-center gap-4">
            <img 
              src="/crestora_logo.png" alt="Crestora Studios" className="h-8 md:h-10 opacity-100 transition-opacity cursor-pointer" 
              onClick={() => triggerLogoTransition()}
            />
            <span className={`${textColor} text-[11px] font-black tracking-tight opacity-80`}>
              ©2026 Crestora Studios
            </span>
          </div>

          {/* Socials */}
          <div className="col-start-9 col-span-4 flex justify-end flex-wrap gap-3 md:gap-5">
            {SOCIALS.map((s) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, color: hoverColor }}
                transition={{ duration: 0.1 }}
                className={`${textColor} text-[11px] md:text-[12px] font-black tracking-tight uppercase cursor-pointer transition-all`}
              >
                {s.label}
              </motion.a>
            ))}
          </div>
        </div>

      </Layout>
    </footer>
  );
};
