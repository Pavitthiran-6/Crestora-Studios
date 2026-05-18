import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  Image as ImageIcon,
  Link as LinkIcon,
  Tag,
  X,
  Zap,
  Globe,
  Layout as LayoutIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "../../types/project";
import { useNavigate } from "react-router-dom";
import { ProjectEditorEngine } from "../../components/admin/ProjectEditorEngine";
import { SmoothScrollProvider } from "../../components/SmoothScrollProvider";
import { MediaUploader } from "../../components/admin/MediaUploader";
import { cmsService } from "../../lib/cms-service";

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProjectData, setNewProjectData] = useState({ title: "", slug: "", coverImage: "", category: "Branding" });
  const navigate = useNavigate();
  const editorRootRef = useRef<HTMLDivElement>(null);
  const creationModalRef = useRef<HTMLDivElement>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const all = await cmsService.getProjects();
      setProjects(all as any);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    window.addEventListener('cms-update', fetchProjects);
    return () => window.removeEventListener('cms-update', fetchProjects);
  }, []);

  // Prevent background scrolling when any modal is open
  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    const isAnyOpen = isEditorOpen || isModalOpen;
    
    if (isAnyOpen && scrollContainer) {
      scrollContainer.style.overflow = 'hidden';
    } else if (scrollContainer) {
      scrollContainer.style.overflow = '';
    }
    
    return () => {
      if (scrollContainer) scrollContainer.style.overflow = '';
    };
  }, [isEditorOpen, isModalOpen]);

  // NATIVE EVENT BLOCKER: Essential for allowing native scroll inside modals
  // Since the parent <main> has a native addEventListener for smooth scrolling that calls preventDefault(),
  // we MUST intercept the native event before it bubbles to <main> and stop propagation.
  // This allows the browser to natively scroll the modal contents (like the sidebar).
  useEffect(() => {
    const blocker = (e: WheelEvent | TouchEvent) => {
      e.stopPropagation();
    };
    
    const creationEl = creationModalRef.current;
    const editorEl = editorRootRef.current;

    if (isModalOpen && creationEl) {
      creationEl.addEventListener('wheel', blocker, { passive: true });
      creationEl.addEventListener('touchmove', blocker, { passive: true });
    }

    if (isEditorOpen && editorEl) {
      editorEl.addEventListener('wheel', blocker, { passive: true });
      editorEl.addEventListener('touchmove', blocker, { passive: true });
    }
    
    return () => {
      if (creationEl) {
        creationEl.removeEventListener('wheel', blocker);
        creationEl.removeEventListener('touchmove', blocker);
      }
      if (editorEl) {
        editorEl.removeEventListener('wheel', blocker);
        editorEl.removeEventListener('touchmove', blocker);
      }
    };
  }, [isEditorOpen, isModalOpen]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const handleCreateCore = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    const slug = newProjectData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    const newProject: any = {
      slug,
      title: newProjectData.title,
      cover_image: newProjectData.coverImage,
      category: newProjectData.category,
      status: 'Draft',
    };

    try {
      await cmsService.saveProject(newProject);
      const all = await cmsService.getProjects();
      const created = all.find(p => p.slug === slug);
      
      setIsModalOpen(false);
      setNewProjectData({ title: "", slug: "", coverImage: "", category: "Branding" });
      
      if (created) {
        setEditingProjectId(created.id);
        setIsEditorOpen(true);
      }
      window.dispatchEvent(new Event('cms-update'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (id: string) => {
    setEditingProjectId(id);
    setIsEditorOpen(true);
  };

  const toggleStatus = async (project: Project) => {
    const nextStatus: Record<string, Project['status']> = {
      'Draft': 'Published',
      'Published': 'Archived',
      'Archived': 'Draft'
    };
    try {
      await cmsService.saveProject({ status: nextStatus[project.status] }, project.id);
      window.dispatchEvent(new Event('cms-update'));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-12"
          >
            <div className="w-full max-w-sm space-y-8 text-center">
              <div className="relative flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border border-black/5 rounded-full flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Zap className="w-8 h-8 text-[#ef4444]" />
                  </motion.div>
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-t-2 border-[#ef4444] rounded-full animate-spin" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black tracking-[0.6em] uppercase opacity-40">Archive Access</p>
                <h2 className="text-4xl font-display font-black tracking-tighter uppercase">RETRIEVING DATA...</h2>
              </div>
              <div className="w-full h-px bg-black/5 relative overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-[#ef4444] w-1/3"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-16"
          >
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-0">
          <div>
            <span className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40 mb-4 block">[ PORTFOLIO MANAGEMENT ]</span>
            <h1 className="font-display text-[8vw] leading-[0.8] tracking-[-0.06em] uppercase font-black">
              PROJECTS
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 transition-opacity" />
              <input
                type="text"
                placeholder="SEARCH ARCHIVE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border border-black/5 px-12 h-14 text-[10px] font-black tracking-[0.2em] uppercase focus:border-black outline-none transition-all w-[300px]"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="px-8 h-14 bg-black text-white text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-3"
            >
              <Plus className="w-4 h-4" />
              CREATE PROJECT
            </motion.button>
          </div>
        </div>

        {/* Project List Table View */}
        <section className="hidden md:block bg-white border border-black/10 overflow-hidden mx-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-[#fafafa]">
                <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase opacity-70">Project Details</th>
                <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase opacity-70">Status</th>
                <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase opacity-70">Category</th>
                <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase opacity-70">Last Sync</th>
                <th className="px-8 py-6 text-right text-[10px] font-black tracking-[0.2em] uppercase opacity-70">Control</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project, i) => (
                <motion.tr
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="group border-b border-black/5 hover:bg-[#fafafa] transition-colors cursor-pointer"
                >
                  <td className="px-8 py-8" onClick={() => handleEdit(project.id)}>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-24 bg-black/5 overflow-hidden relative">
                        <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-base font-black tracking-tighter uppercase block group-hover:text-[#ef4444] transition-colors">{project.title}</span>
                        <div className="flex items-center gap-2 opacity-30 text-[9px] font-black tracking-[0.2em]">
                          <LinkIcon className="w-3 h-3" />
                          <span>/{project.slug}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleStatus(project); }}
                      className={cn(
                        "text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full border transition-all",
                        project.status === "Published" ? "border-green-500 text-green-500 bg-green-50/50" :
                        project.status === "Draft" ? "border-yellow-500 text-yellow-500 bg-yellow-50/50" :
                        "border-black/20 text-black/40"
                      )}
                    >
                      {project.status}
                    </button>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3 opacity-50" />
                      <span className="text-[10px] font-black tracking-[0.1em] uppercase opacity-70">{project.category}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-[10px] font-medium opacity-70 uppercase">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "#000", color: "#fff" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); handleEdit(project.id); }}
                        className="w-10 h-10 border border-black/5 flex items-center justify-center transition-all rounded-full group/btn"
                      >
                        <Edit3 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "#ef4444", color: "#fff" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm("ARCHIVE THIS WORK?")) {
                            await cmsService.deleteProject(project.id);
                            window.dispatchEvent(new Event('cms-update'));
                          }
                        }}
                        className="w-10 h-10 border border-black/5 flex items-center justify-center transition-all rounded-full group/btn"
                      >
                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Mobile View: Card List (Hidden on desktop) */}
        <div className="space-y-4 md:hidden mx-0">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="bg-white border border-black/10 p-6 flex flex-col gap-4 relative cursor-pointer"
              onClick={() => handleEdit(project.id)}
            >
              <div className="flex gap-4 items-start">
                {/* Cover Image */}
                <div className="w-20 h-24 bg-black/5 overflow-hidden relative shrink-0">
                  <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#ef4444] uppercase block">
                    {project.category}
                  </span>
                  <h3 className="text-lg font-black tracking-tighter uppercase truncate">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-1 opacity-40 text-[9px] font-black tracking-[0.15em]">
                    <LinkIcon className="w-3 h-3" />
                    <span>/{project.slug}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-black/5 w-full" />

              {/* Footer controls & status */}
              <div className="flex items-center justify-between mt-1">
                {/* Status Badge */}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleStatus(project); }}
                  className={cn(
                    "text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border transition-all",
                    project.status === "Published" ? "border-green-500 text-green-500 bg-green-50/50" :
                    project.status === "Draft" ? "border-yellow-500 text-yellow-500 bg-yellow-50/50" :
                    "border-black/20 text-black/40"
                  )}
                >
                  {project.status}
                </button>

                {/* Action buttons (Always visible on mobile!) */}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(project.id)}
                    className="w-10 h-10 border border-black/10 flex items-center justify-center rounded-full bg-black text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={async () => {
                      if (confirm("ARCHIVE THIS WORK?")) {
                        await cmsService.deleteProject(project.id);
                        window.dispatchEvent(new Event('cms-update'));
                      }
                    }}
                    className="w-10 h-10 border border-black/10 flex items-center justify-center rounded-full bg-[#ef4444] text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-32 px-0">
          {[
            { label: "PUBLISHED", val: projects.filter(p => p.status === 'Published').length },
            { label: "DRAFTS", val: projects.filter(p => p.status === 'Draft').length },
            { label: "ARCHIVED", val: projects.filter(p => p.status === 'Archived').length }
          ].map((s) => (
            <div key={s.label} className="p-10 border border-black/10 bg-white flex flex-col items-center">
              <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-50 mb-4">{s.label}</span>
              <span className="font-display text-5xl font-black">{s.val}</span>
            </div>
          ))}
        </div>

        {/* STEP 1 MODAL: CREATE PROJECT CORE */}
        <AnimatePresence>
          {isModalOpen && (
            <div ref={creationModalRef} className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 overflow-hidden">
              {/* TRUE FIXED BACKDROP */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/95 backdrop-blur-3xl cursor-crosshair"
              />
              
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-[92vw] md:w-[88vw] max-w-[1450px] h-[92vh] lg:h-[88vh] bg-white rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col lg:flex-row overflow-hidden z-10"
              >
                {/* LEFT: CINEMATIC PREVIEW (35%) */}
                <div className="lg:w-[35%] bg-[#171c44] flex flex-col items-center justify-center relative p-8 lg:p-12 overflow-hidden border-r border-white/5 shrink-0 hidden lg:flex">
                  <div className="absolute inset-0 opacity-40 pointer-events-none">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_60%_40%,#ef44440a_0%,transparent_60%)]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay opacity-30" />
                  </div>
                  
                  <div className="absolute top-8 left-8 text-[9px] font-black tracking-[0.4em] uppercase text-white/30 z-10 flex items-center gap-4">
                    <LayoutIcon className="w-3 h-3" />
                    [ PREVIEW ENGINE ]
                  </div>

                  <div className="relative z-10 w-full max-w-[300px] aspect-[4/5] bg-white/5 rounded-[24px] border border-white/10 overflow-hidden flex flex-col group">
                    {newProjectData.coverImage ? (
                      <img src={newProjectData.coverImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt="Preview" />
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                        <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">NO ASSET LOADED</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#171c44] to-transparent">
                      <p className="text-2xl font-display font-black text-white uppercase truncate">{newProjectData.title || "PROJECT NAME"}</p>
                      <p className="text-[10px] font-black text-[#ef4444] tracking-[0.2em] uppercase mt-2">INITIALIZING...</p>
                    </div>
                  </div>
                </div>

                {/* RIGHT: FORM ENGINE (65%) */}
                <div className="lg:w-[65%] w-full bg-white flex flex-col relative overflow-hidden">
                  <div className="px-8 md:px-12 lg:px-[56px] pt-8 md:pt-12 lg:pt-[56px] pb-6 shrink-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black tracking-[0.5em] uppercase opacity-30 block mb-2">[ PHASE 01 ]</span>
                        <h2 className="font-display text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] leading-none">Initialize Project</h2>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 group shrink-0"
                      >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                      </button>
                    </div>
                  </div>

                  {/* SCROLLABLE INNER AREA */}
                  <div className="flex-1 overflow-y-auto px-8 md:px-12 lg:px-[56px] pb-12 custom-scrollbar">
                    <form onSubmit={handleCreateCore} className="space-y-12">
                      <div className="space-y-4 group">
                        <label className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 group-focus-within:opacity-100 transition-opacity">Project Title</label>
                        <input
                          required
                          type="text"
                          value={newProjectData.title}
                          onChange={(e) => {
                            const title = e.target.value;
                            setNewProjectData({ 
                              ...newProjectData, 
                              title: title,
                              // Auto-generate slug if it's a new project
                              slug: slugify(title)
                            });
                          }}
                          className="w-full bg-transparent border-b border-black/10 py-4 text-3xl font-display uppercase outline-none focus:border-black transition-all"
                          placeholder="ENTER PROJECT NAME..."
                        />
                      </div>

                      <div className="space-y-4 group">
                        <label className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 group-focus-within:opacity-100 transition-opacity">Project URL Slug (Auto-generated, editable)</label>
                        <input
                          required
                          type="text"
                          value={newProjectData.slug}
                          onChange={(e) => setNewProjectData({ 
                            ...newProjectData, 
                            slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                          })}
                          className="w-full bg-transparent border-b border-black/10 py-4 text-2xl font-display outline-none focus:border-black transition-all"
                          placeholder="ENTER PROJECT URL SLUG..."
                        />
                      </div>

                      <MediaUploader 
                        label="Cover Image Protocol" 
                        value={newProjectData.coverImage} 
                        onChange={(v) => setNewProjectData({ ...newProjectData, coverImage: v })} 
                      />

                      <div className="pt-8">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full h-20 bg-black text-white flex items-center justify-center gap-4 group rounded-xl shadow-2xl"
                        >
                          <span className="text-xs font-black tracking-[0.3em] uppercase">START FULL EDITOR</span>
                          <Zap className="w-5 h-5 group-hover:scale-125 transition-transform fill-white" />
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FULL EDITOR MODAL (POPUP PAGE STYLE) */}
        <AnimatePresence>
          {isEditorOpen && editingProjectId && (
            <div ref={editorRootRef} className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-8 overflow-hidden">
              {/* TRUE FIXED BACKDROP */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditorOpen(false)}
                className="absolute inset-0 bg-black/95 backdrop-blur-3xl cursor-crosshair"
              />
              
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-[92vw] md:w-[88vw] max-w-[1450px] h-[92vh] lg:h-[88vh] bg-white rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] z-10 overflow-hidden"
              >
                <ProjectEditorEngine 
                  projectId={editingProjectId} 
                  onClose={() => setIsEditorOpen(false)} 
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
