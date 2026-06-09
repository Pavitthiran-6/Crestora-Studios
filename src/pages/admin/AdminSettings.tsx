import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { 
  Settings, 
  User, 
  Shield, 
  Monitor, 
  Globe, 
  Palette, 
  Database,
  Save,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cmsService } from "../../lib/cms-service";

const SETTING_SECTIONS = [
  { id: "profile", label: "Studio Identity", icon: User, desc: "Manage your studio branding and profile." },
  { id: "security", label: "Kernel Guard", icon: Shield, desc: "Authentication and encryption protocols." },
  { id: "interface", label: "UI Ecosystem", icon: Palette, desc: "Customize the cinematic OS aesthetic." },
  { id: "global", label: "Regional Sync", icon: Globe, desc: "Domain, CDN, and global edge settings." },
  { id: "data", label: "Vault Storage", icon: Database, desc: "Manage project database and media buckets." },
];

export default function AdminSettings() {
  const [studioName, setStudioName] = React.useState("Crestora Studios");
  const [studioEmail, setStudioEmail] = React.useState("crestorastudios@gmail.com");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await cmsService.getSettings();
        if (settings.studio_name) setStudioName(settings.studio_name);
        if (settings.studio_email) setStudioEmail(settings.studio_email);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        cmsService.updateSetting("studio_name", studioName),
        cmsService.updateSetting("studio_email", studioEmail)
      ]);
      alert("Studio protocols updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-16">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1f2547] border border-black/15 flex items-center justify-center p-3 rounded-2xl shadow-xl shrink-0">
              <img src="/crestora_logo.png" alt="Crestora Studios Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40 mb-2 block">[ CONFIGURATION ]</span>
              <h1 className="font-display text-[8vw] sm:text-[5vw] leading-[0.8] tracking-[-0.06em] uppercase font-black">
                SETTINGS
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Navigation Sidebar for Settings */}
          <div className="lg:col-span-4 space-y-4">
            {SETTING_SECTIONS.map((section) => (
              <button
                key={section.id}
                className="w-full text-left p-8 border border-black/5 hover:border-black transition-all group relative overflow-hidden"
              >
                <div className="flex items-center gap-6 relative z-10">
                  <div className="p-3 bg-black/5 group-hover:bg-black group-hover:text-white transition-colors">
                    <section.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight uppercase group-hover:text-[#ef4444] transition-colors">{section.label}</h3>
                    <p className="text-[10px] font-medium opacity-40 uppercase tracking-tighter">{section.desc}</p>
                  </div>
                </div>
                <motion.div 
                  className="absolute bottom-0 left-0 h-[2px] bg-black w-0 group-hover:w-full transition-all duration-700"
                />
              </button>
            ))}
          </div>

          {/* Settings Content Area */}
          <div className="lg:col-span-8 bg-white border border-black/5 p-12 lg:p-20 space-y-16">
            <section className="space-y-12">
              <div>
                <h2 className="font-display text-4xl font-black uppercase tracking-tighter mb-2">Studio Identity</h2>
                <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-30">Basic configuration for the creative operating system.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4 md:col-span-2">
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">STUDIO NAME</label>
                  <input 
                    type="text" 
                    value={studioName} 
                    onChange={(e) => setStudioName(e.target.value)}
                    className="w-full bg-transparent border-b border-black/10 py-4 px-0 text-2xl font-display uppercase outline-none focus:border-black transition-colors" 
                  />
                </div>
                <div className="space-y-4 md:col-span-2">
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">STUDIO EMAIL ID</label>
                  <input 
                    type="email" 
                    value={studioEmail} 
                    onChange={(e) => setStudioEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-black/10 py-4 px-0 text-lg font-display uppercase outline-none focus:border-black transition-colors" 
                  />
                </div>
                <div className="space-y-4 md:col-span-2">
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">STUDIO LOGO</label>
                  <div className="flex items-center gap-6 p-6 bg-black/[0.02] border border-black/5 rounded-xl w-full sm:w-fit mt-2">
                    <div className="w-16 h-16 bg-[#1f2547] border border-black/10 flex items-center justify-center p-3 rounded-xl shadow-lg shrink-0">
                      <img src="/crestora_logo.png" alt="Crestora Studios Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-tight">Crestora Studios Brand Mark</h4>
                      <p className="text-[9px] font-black uppercase opacity-40 tracking-wider mt-1 block">crestora_logo.png</p>
                      <span className="inline-block mt-3 px-2.5 py-1 bg-green-500/10 text-green-600 text-[8px] font-black tracking-widest uppercase rounded-full">
                        ACTIVE BRAND ASSET
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 md:col-span-2">
                  <div className="h-px bg-black/5 w-full my-8" />
                  <h3 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40 mb-8 block">[ SECURITY PROTOCOL ]</h3>
                </div>
                <div className="space-y-4 md:col-span-2">
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">OLD PASSWORD</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-transparent border-b border-black/10 py-3 text-lg font-display uppercase outline-none focus:border-black transition-colors" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">NEW PASSWORD</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-transparent border-b border-black/10 py-3 text-lg font-display uppercase outline-none focus:border-black transition-colors" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">CONFIRM NEW PASSWORD</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-transparent border-b border-black/10 py-3 text-lg font-display uppercase outline-none focus:border-black transition-colors" />
                </div>
                
                <div className="md:col-span-2 pt-12">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-16 bg-black text-white text-[10px] font-black tracking-[0.15em] sm:tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:bg-[#ef4444] transition-colors shadow-2xl disabled:opacity-50 whitespace-nowrap px-4"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">INITIALIZING...</span>
                    ) : (
                      <span className="flex flex-row items-center justify-center gap-3">
                        <Save className="w-4 h-4 shrink-0" />
                        <span>SAVE PROTOCOLS</span>
                      </span>
                    )}
                  </motion.button>
                </div>

                <div className="md:col-span-2 mt-8 p-6 bg-black/[0.02] border border-black/5">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-3 h-3 text-[#ef4444]" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-60">PASSWORD RULES</span>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12">
                    {[
                      "MINIMUM 8 CHARACTERS",
                      "AT LEAST 1 SPECIAL SYMBOL",
                      "UPPER & LOWER CASE LETTERS",
                      "AT LEAST 1 NUMBER"
                    ].map((rule) => (
                      <li key={rule} className="flex items-center gap-3 text-[9px] font-black tracking-widest opacity-30 uppercase">
                        <div className="w-1 h-1 bg-black rounded-full" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
