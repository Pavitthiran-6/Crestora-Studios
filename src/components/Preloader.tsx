import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#2F4156]"
        >
          {/* Wave Animation */}
          <div className="flex items-end gap-1.5 h-16 mb-8">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-[#567C8D] rounded-full"
                animate={{
                  height: ["20%", "100%", "20%"]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Blueprint Label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] font-display font-black tracking-[0.4em] uppercase text-white/40">
              Initializing
            </span>
            <span className="text-xl font-display font-black tracking-[-0.04em] uppercase text-white">
              W2C <span className="text-[#567C8D]">Studios</span>
            </span>
          </motion.div>

          {/* Scanning Line Parallax */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-[#567C8D]/5 to-transparent h-[10vh] w-full"
            animate={{ top: ["-10%", "110%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
