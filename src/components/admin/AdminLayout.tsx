import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  MessageSquare, 
  BarChart3, 
  Sparkles,
  Search,
  Bell,
  Power,
  Monitor,
  Layers,
  Star,
  Terminal,
  Menu,
  X
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useTransition } from "../TransitionProvider";
import { cn } from "@/lib/utils";
import { SmoothScrollProvider } from "../SmoothScrollProvider";
import { cmsService } from "../../lib/cms-service";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/admin/projects" },
  { icon: Layers, label: "Home Cards", path: "/admin/home-cards" },
  { icon: Bell, label: "Messages", path: "/admin/notifications" },
  { icon: Terminal, label: "System Logs", path: "/admin/system-logs" },
  { icon: Star, label: "Reviews", path: "/admin/reviews" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerLogoTransition } = useTransition();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [studioName, setStudioName] = useState("Crestora Studios");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messages, settings] = await Promise.all([
          cmsService.getMessages(),
          cmsService.getSettings()
        ]);
        const unread = messages.filter((m: any) => m.status === 'unread').length;
        setUnreadCount(unread);
        if (settings.studio_name) setStudioName(settings.studio_name.toUpperCase());
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    // Refresh every 30 seconds for live-ish updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div 
      onScroll={(e) => (e.currentTarget.scrollTop = 0)}
      className="h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex overflow-hidden relative"
    >
      {/* Cinematic Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-[9999]" />

      {/* Sidebar Drawer Backdrop Overlay (Mobile/Tablet only) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Premium Static/Collapsible Navigation */}
      <motion.nav 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "bg-black text-white flex flex-col py-10 z-[100] shrink-0 overflow-hidden transition-transform duration-300",
          "fixed inset-y-0 left-0 w-64 md:w-72 -translate-x-full lg:relative lg:translate-x-0 lg:flex",
          isSidebarOpen && "translate-x-0"
        )}
      >
        {/* Admin Branding & View Site */}
        <div className="px-8 mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center cursor-pointer group overflow-hidden transition-all" onClick={() => triggerLogoTransition()}>
                <img src="/crestora_logo.png" alt="Crestora Studios" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] uppercase leading-tight">{studioName}</p>
                <p className="text-[8px] font-medium opacity-40 uppercase tracking-widest">CONTROL CENTER</p>
              </div>
            </div>
            
            {/* Mobile/Tablet Close Button */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 -mr-2 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            onClick={() => window.open("/", "_blank")}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group"
          >
            <Monitor className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
            <span className="text-[9px] font-black tracking-[0.2em] uppercase text-white/60 group-hover:text-white">PREVIEW SITE</span>
          </button>
        </div>

        {/* Navigation Items (Premium Density) */}
        <div className="flex-1 px-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={cn(
                  "group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 outline-none",
                  isActive ? "bg-white/20 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-500",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className="text-[10px] font-black tracking-[0.15em] uppercase">
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div 
                    layoutId="activeDot"
                    className="ml-auto w-1.5 h-1.5 bg-[#ef4444] rounded-full shadow-[0_0_10px_#ef4444]"
                  />
                )}
                
                {!isActive && item.label === "Messages" && unreadCount > 0 && (
                  <div className="ml-auto w-2 h-2 bg-[#ef4444] rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto px-4 pt-8 border-t border-white/5">
          <button 
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-white/30 hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-all duration-300 group"
          >
            <Power className="w-5 h-5" />
            <span className="text-[10px] font-black tracking-[0.15em] uppercase">
              LOGOUT SYSTEM
            </span>
          </button>
        </div>
      </motion.nav>

      {/* Main Content Area */}
      <SmoothScrollProvider containerRef={scrollContainerRef} ease={0.09}>
        <main 
          ref={scrollContainerRef}
          className="flex-1 h-full overflow-y-auto scrollbar-hide relative bg-[#fafafa]"
        >
          {/* Header Overlay */}
          <div className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/10 px-6 md:px-16 h-24 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile/Tablet Hamburger Toggle */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-3 -ml-3 hover:bg-black/5 rounded-full transition-colors shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-70 whitespace-nowrap hidden sm:inline-block">
                SYSTEM STATUS: <span className="text-green-600 opacity-100">OPERATIONAL</span>
              </span>
            </div>

            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase opacity-60">
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                LIVE DATA STREAMING
              </div>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => navigate("/admin/notifications")}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors relative group/bell"
                >
                  <Bell className="w-5 h-5 group-hover/bell:scale-110 transition-transform" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ef4444] rounded-full border-2 border-white animate-bounce" />
                  )}
                </button>
                <div className="flex items-center gap-4 border-l border-black/10 pl-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black tracking-[0.1em] uppercase leading-tight">Pavitthiran R A</p>
                    <p className="text-[9px] font-medium opacity-40 uppercase">Studio Admin</p>
                  </div>
                  <div className="w-10 h-10 bg-black/5 border border-black/10 rounded-full flex items-center justify-center overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Pavitthiran" alt="User" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div className="p-8 md:p-16 lg:p-24 max-w-[1800px] mx-auto">
            {children}
          </div>

          {/* Global Footer Decoration */}
          <div className="px-8 md:px-16 lg:px-24 pb-12 opacity-20">
            <div className="h-px bg-black w-full mb-8" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.5em] uppercase text-center md:text-left">
              <span>Crestora Studios OS v2.0.4</span>
              <span>EST. 2026</span>
            </div>
          </div>
        </main>
      </SmoothScrollProvider>
    </div>
  );
}
