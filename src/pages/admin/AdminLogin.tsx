import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useTransition } from "../../components/TransitionProvider";

import { supabase } from "../../lib/supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { triggerLogoTransition, triggerPageTransition } = useTransition();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const userEmail = data.user.email?.toLowerCase();
        if (!userEmail) {
          await supabase.auth.signOut();
          throw new Error("Access denied. Invalid user identity.");
        }

        const allowedEmails = [
          'crestorastudios@gmail.com',
          'pavitthiran66@gmail.com'
        ];

        if (!allowedEmails.includes(userEmail)) {
          await supabase.auth.signOut();
          throw new Error("UNAUTHORIZED: Access restricted to administrators only.");
        }

        triggerPageTransition("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your credentials.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-hidden relative">
      {/* Cinematic Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Floating Blur Lights */}
      <motion.div 
        animate={{ 
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-black/5 blur-[120px] rounded-full pointer-events-none"
      />
      
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Side: Massive Typography */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-[10px] md:text-xs font-black tracking-[0.5em] uppercase opacity-40 mb-6 block">
                [ SECURE ACCESS ]
              </span>
              <h1 className="font-display text-[15vw] lg:text-[10vw] leading-[0.8] tracking-[-0.06em] uppercase font-black mb-8">
                ADMIN<br />ACCESS
              </h1>
              <p className="text-sm md:text-base font-medium tracking-tight max-w-[400px] opacity-60 uppercase">
                Authorized Studio Management Portal. Please enter your credentials to access the creative operating system.
              </p>
            </motion.div>
          </div>

          {/* Right Side: Minimal Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col w-full max-w-[450px] ml-auto"
          >
            <form onSubmit={handleLogin} className="space-y-12">
              <div className="space-y-8">
                {/* Email Input */}
                <div className="group relative">
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40 mb-4 block group-focus-within:opacity-100 transition-opacity">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-b border-black/10 py-4 text-xl md:text-2xl font-display outline-none focus:border-black transition-colors placeholder:opacity-20"
                      placeholder="studio@Crestora Studios.com"
                    />
                    <motion.div 
                      className="absolute bottom-0 left-0 h-[2px] bg-black"
                      initial={{ width: 0 }}
                      whileFocus={{ width: "100%" }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group relative">
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40 mb-4 block group-focus-within:opacity-100 transition-opacity">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-b border-black/10 py-4 text-xl md:text-2xl font-display outline-none focus:border-black transition-colors placeholder:opacity-20"
                      placeholder="••••••••"
                    />
                    <motion.div 
                      className="absolute bottom-0 left-0 h-[2px] bg-black"
                      initial={{ width: 0 }}
                      whileFocus={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[10px] font-black uppercase tracking-widest"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full h-20 bg-black text-white flex items-center justify-center gap-4 overflow-hidden transition-all duration-500 disabled:opacity-50"
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span className="text-xs font-black tracking-[0.3em] uppercase">INITIALIZING...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="static"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center gap-4"
                    >
                      <span className="text-xs font-black tracking-[0.3em] uppercase">ENTER STUDIO</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Magnetic Hover Effect Background */}
                <motion.div 
                  className="absolute inset-0 bg-white mix-blend-difference opacity-0 group-hover:opacity-10 transition-opacity"
                />
              </motion.button>
            </form>

            <div className="mt-12 flex justify-between items-center text-[10px] font-black tracking-[0.2em] uppercase opacity-30">
              <span>© 2026 Crestora Studios</span>
              <a href="#" className="hover:opacity-100 transition-opacity underline decoration-dotted underline-offset-4">FORGOT CREDENTIALS?</a>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Line Animation */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
        className="absolute bottom-12 left-0 right-0 h-px bg-black/10 origin-left mx-6 md:mx-12"
      />
    </div>
  );
}
