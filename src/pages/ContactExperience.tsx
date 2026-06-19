"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MoveLeft, X, ArrowRight } from "lucide-react";
import { useTransition } from "../components/TransitionProvider";
import HexIcon from "../components/HexIcon";
import { cmsService } from "../lib/cms-service";
import { cn } from "../lib/utils";

type ContactStep = "intro" | "projectType" | "budget" | "hearAbout" | "form" | "success";

interface SelectionData {
  path: string;
  projectType: string;
  budget: string;
  hearAbout: string;
}

export const ContactExperience: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { triggerLogoTransition } = useTransition();
  const [step, setStep] = useState<ContactStep>("intro");
  const [selections, setSelections] = useState<SelectionData>({
    path: "",
    projectType: "",
    budget: "",
    hearAbout: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = (next: ContactStep) => setStep(next);
  const prevStep = (prev: ContactStep) => setStep(prev);

  if (!isOpen) return null;

  const progress = step === "intro" ? 1 : step === "projectType" ? 2 : step === "budget" ? 3 : step === "hearAbout" ? 4 : 5;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onScroll={(e) => {
        if (!window.matchMedia("(max-width: 767px)").matches) {
          e.currentTarget.scrollTop = 0;
        }
      }}
      className="fixed inset-0 z-[5000] bg-white p-1.5 sm:p-2 md:p-3 lg:p-4 font-sans select-none overflow-hidden"
    >
      <div 
        onScroll={(e) => {
          if (!window.matchMedia("(max-width: 767px)").matches) {
            e.currentTarget.scrollTop = 0;
          }
        }}
        className="relative w-full h-full rounded-[12px] md:rounded-[28px] lg:rounded-[40px] overflow-y-auto md:overflow-hidden bg-[#2F4156] flex flex-col border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-5 sm:p-8 md:p-12 lg:p-16 text-[#f4f4f4] selection:bg-[#567C8D] selection:text-white"
      >
        {/* TOP LAYER: LOGO + TAGS + DECO */}
        <div className="flex justify-between items-start z-10 shrink-0">
          {/* Logo with Red Circle - Clickable (Global Transition) */}
          <button
            onClick={() => triggerLogoTransition()}
            className="flex items-center gap-4 group"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              <img src="/crestora_logo.png" alt="Crestora Studios" className="w-full h-full object-contain" />
            </div>
          </button>

          {/* Selected Tags Capsules */}
          <div className="flex flex-wrap gap-1.5 justify-end max-w-[60%] sm:max-w-none">
            <AnimatePresence>
              {step !== "success" && [selections.projectType, selections.budget, selections.hearAbout].map((tag, i) => tag && (
                <motion.div
                  key={`${tag}-${i}`}
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  className="px-3.5 sm:px-5 py-1.5 sm:py-3 rounded-full bg-white/5 border border-white/10 text-[8px] sm:text-[9px] md:text-[10px] font-display font-black tracking-[0.2em] uppercase text-white/40 whitespace-nowrap flex items-center gap-2 sm:gap-3"
                >
                  <HexIcon className="w-2 sm:w-2.5 h-2 sm:h-2.5" fill="#567C8D" />
                  {tag}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Close Button */}
          <div className="flex items-center gap-8 shrink-0">
            <button onClick={onClose} className="opacity-40 hover:opacity-100 transition-opacity">
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>
        </div>

        {/* MIDDLE LAYER: CENTERED CONTENT */}
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <AnimatePresence mode="wait">
            {step === "intro" && (
              <StepContent
                key="intro"
                title={<>HOW CAN WE <span className="text-[#567C8D]">HELP?</span></>}
                options={["START A PROJECT", "JOIN OUR TEAM", "DROP US A LINE"]}
                onSelect={(val) => {
                  if (val === "START A PROJECT") {
                    setSelections(s => ({ ...s, path: val }));
                    nextStep("projectType");
                  } else {
                    window.location.href = "mailto:pavitthiran66@gmail.com";
                  }
                }}
              />
            )}
            {step === "projectType" && (
              <StepContent
                key="projectType"
                title={<>WHAT TYPE OF <span className="text-[#567C8D]">PROJECT?</span></>}
                options={[
                  "WEB & APP DEVELOPMENT",
                  "BRANDING & DESIGN",
                  "VIDEO & ANIMATION",
                  "DIGITAL MARKETING",
                  "CYBER SECURITY & SUPPORT"
                ]}
                onSelect={(val) => { setSelections(s => ({ ...s, projectType: val })); nextStep("budget"); }}
                showDots={true}
              />
            )}
            {step === "budget" && (
              <StepContent
                key="budget"
                title={<>BUDGET <span className="text-[#567C8D]">RANGE</span></>}
                options={["15K–30K", "30K–50K", "50K–75K", "75K–100K", "100K+"]}
                onSelect={(val) => { setSelections(s => ({ ...s, budget: val })); nextStep("hearAbout"); }}
                showDots={true}
              />
            )}
            {step === "hearAbout" && (
              <StepContent
                key="hearAbout"
                title={<>HOW DID YOU <span className="text-[#567C8D]">HEAR ABOUT US?</span></>}
                options={["AWWWARDS", "FRIEND REFERRAL", "WE DID A PROJECT", "GOOGLE", "ARTICLE"]}
                onSelect={(val) => { setSelections(s => ({ ...s, hearAbout: val })); nextStep("form"); }}
                showDots={true}
              />
            )}
            {step === "form" && (
              <StepFinalForm
                isSubmitting={isSubmitting}
                onSelect={async (formData) => {
                  setIsSubmitting(true);
                  try {
                    await cmsService.submitMessage({
                      name: `${formData.firstName} ${formData.lastName}`,
                      email: formData.email,
                      subject: `New Inquiry: ${selections.projectType}`,
                      message: `${formData.message}\n\nBudget: ${selections.budget}\nSource: ${selections.hearAbout}`
                    });
                    nextStep("success");
                  } catch (err) {
                    console.error("Failed to submit message:", err);
                    alert("Something went wrong. Please try again.");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                selections={selections}
              />
            )}
            {step === "success" && (
              <StepSuccess onClose={onClose} />
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM LAYER: BACK + PROGRESS */}
        <div className="flex justify-between items-center z-10 h-16 sm:h-24 shrink-0 mt-6 md:mt-0">
          {step !== "intro" && step !== "success" ? (
            <button
              onClick={() => {
                if (step === "projectType") {
                  setSelections(s => ({ ...s, path: "" }));
                  prevStep("intro");
                } else if (step === "budget") {
                  setSelections(s => ({ ...s, projectType: "" }));
                  prevStep("projectType");
                } else if (step === "hearAbout") {
                  setSelections(s => ({ ...s, budget: "" }));
                  prevStep("budget");
                } else if (step === "form") {
                  setSelections(s => ({ ...s, hearAbout: "" }));
                  prevStep("hearAbout");
                }
              }}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors group shrink-0"
            >
              <MoveLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 opacity-40 group-hover:opacity-100 transition-opacity" />
            </button>
          ) : <div className="w-12 sm:w-16 md:w-20" />}

          {/* PROGRESS INDICATOR */}
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-sm md:max-w-md mx-auto px-4 sm:px-0">
            <div className="flex justify-between items-center w-full px-1">
              <span className="text-[9px] sm:text-[10px] md:text-xs font-black tracking-[0.2em] opacity-40">01</span>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-black tracking-[0.2em] opacity-40">05</span>
            </div>
            <div className="w-full h-0.5 bg-white/10 relative">
              <HexIcon className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3" fill="#567C8D" />
              <motion.div
                initial={{ width: "20%" }}
                animate={{ width: `${(progress / 5) * 100}%` }}
                className="absolute h-full bg-[#567C8D] left-0 top-0 transition-all duration-500"
              />
              <HexIcon className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3" fill="#2F4156" />
            </div>
          </div>

          <div className="w-12 sm:w-20 hidden md:block" />
        </div>
      </div>
    </motion.div>
  );
};

/* --- SHARED STEP COMPONENT (CAPSULE STYLE) --- */
const StepContent: React.FC<{ title: React.ReactNode; options: string[]; onSelect: (val: string) => void; showDots?: boolean }> = ({ title, options, onSelect, showDots }) => {
  const shouldSplit = options.length > 5;
  const splitIndex = shouldSplit ? 5 : options.length;
  const row1 = options.slice(0, splitIndex);
  const row2 = shouldSplit ? options.slice(splitIndex) : [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-5xl flex flex-col items-center py-6 md:py-0"
    >
      <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[7vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.8] mb-6 sm:mb-12 md:mb-20">
        {title}
      </h1>

      <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 w-full">
        {/* Row 1 */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {row1.map((opt, i) => (
            <motion.button
              key={opt}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(opt)}
              className="px-6 sm:px-10 md:px-14 py-4 sm:py-6 md:py-8 hexa-box bg-white/5 border border-white/10 flex items-center gap-3 sm:gap-4 group transition-colors duration-300"
            >
              {(showDots || opt === "START A PROJECT") && (
                <HexIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="#567C8D" />
              )}
              <span className="text-[9px] sm:text-[10px] md:text-xs font-display font-black tracking-[0.2em] uppercase whitespace-nowrap">{opt}</span>
            </motion.button>
          ))}
        </div>

        {/* Row 2 */}
        {shouldSplit && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {row2.map((opt, i) => (
              <motion.button
                key={opt}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (row1.length + i) * 0.05 }}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(opt)}
                className="px-6 sm:px-10 md:px-14 py-4 sm:py-6 md:py-8 hexa-box bg-white/5 border border-white/10 flex items-center gap-3 sm:gap-4 group transition-colors duration-300"
              >
                {(showDots || opt === "START A PROJECT") && (
                  <HexIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="#567C8D" />
                )}
                <span className="text-[9px] sm:text-[10px] md:text-xs font-display font-black tracking-[0.2em] uppercase whitespace-nowrap">{opt}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StepFinalForm: React.FC<{ selections: SelectionData; onSelect: (formData: any) => void; isSubmitting: boolean }> = ({ selections, onSelect, isSubmitting }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "REQUIRED FIELD";
    if (!formData.email.trim()) newErrors.email = "REQUIRED FIELD";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "INVALID EMAIL";
    if (!formData.message.trim()) newErrors.message = "REQUIRED FIELD";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSelect(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 md:gap-24 text-left py-6 md:py-0"
    >
      <div className="flex flex-col justify-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[5.5vw] font-display font-black tracking-[-0.04em] uppercase leading-[0.85] mb-4 sm:mb-8">
          READY TO <br className="hidden sm:block" /> CREATE <br className="hidden sm:block" /> <span className="text-[#567C8D]">MAGIC?</span>
        </h1>
        <p className="text-[10px] sm:text-xs md:text-sm font-display font-black tracking-[0.3em] uppercase opacity-30">Crestora Studios — PROJECT INTAKE</p>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput 
            label="FIRST NAME" 
            placeholder="JOHN" 
            value={formData.firstName}
            error={errors.firstName}
            onChange={(val) => {
              setFormData(f => ({ ...f, firstName: val }));
              if (errors.firstName) setErrors(prev => ({ ...prev, firstName: "" }));
            }}
          />
          <FloatingInput 
            label="LAST NAME (OPTIONAL)" 
            placeholder="DOE" 
            value={formData.lastName}
            onChange={(val) => setFormData(f => ({ ...f, lastName: val }))}
          />
        </div>
        <FloatingInput 
          label="EMAIL" 
          placeholder="HELLO@EXAMPLE.COM" 
          value={formData.email}
          error={errors.email}
          onChange={(val) => {
            setFormData(f => ({ ...f, email: val }));
            if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
          }}
        />
        <FloatingInput 
          label="TELL US ABOUT THE DREAM" 
          placeholder="MY VISION IS..." 
          textarea 
          value={formData.message}
          error={errors.message}
          onChange={(val) => {
            setFormData(f => ({ ...f, message: val }));
            if (errors.message) setErrors(prev => ({ ...prev, message: "" }));
          }}
        />

        <div className="pt-4 sm:pt-8">
          <motion.button
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={`w-full h-14 sm:h-16 md:h-20 rounded-full flex items-center justify-center gap-4 text-[9px] sm:text-[10px] md:text-xs font-display font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase transition-all ${
              isSubmitting ? "bg-white/10 cursor-not-allowed" : "bg-[#567C8D] hover:bg-[#567C8D]"
            }`}
          >
            {isSubmitting ? (
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-3"
              >
                <span>TRANSMITTING MAGIC...</span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <HexIcon className="w-4 h-4" fill="#567C8D" />
                </motion.div>
              </motion.div>
            ) : (
              <>SEND MAGIC <ArrowRight className="w-5 h-5" /></>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const StepSuccess: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-10"
  >
    <div className="w-20 h-20 rounded-full border border-[#567C8D]/30 flex items-center justify-center relative">
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", damping: 12 }}
      >
        <HexIcon className="w-10 h-10" fill="#567C8D" />
      </motion.div>
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full border border-[#567C8D]"
      />
    </div>

    <div className="space-y-4">
      <p className="text-[10px] font-black tracking-[0.6em] uppercase text-[#567C8D] opacity-80">SUCCESSFULLY DISPATCHED</p>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-[-0.04em] uppercase leading-[0.9]">
        MESSAGE <br /> <span className="text-[#567C8D]">RECEIVED.</span>
      </h1>
      <p className="text-xs font-medium uppercase opacity-40 max-w-xs mx-auto leading-relaxed tracking-wide">
        OUR TEAM IS ANALYZING YOUR VISION. <br /> EXPECT MAGIC SOON.
      </p>
    </div>

    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: "#567C8D", color: "#fff" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClose}
      className="px-10 py-5 rounded-full border border-white/10 text-white text-[10px] font-black tracking-[0.4em] uppercase transition-all duration-300"
    >
      BACK TO STUDIO
    </motion.button>
  </motion.div>
);

const FloatingInput: React.FC<{ label: string; placeholder: string; textarea?: boolean; value: string; error?: string; onChange: (val: string) => void }> = ({ label, placeholder, textarea, value, error, onChange }) => (
  <div className="relative group w-full">
    <div className="flex justify-between items-center mb-1">
      <span className={cn(
        "block text-[10px] font-display font-black tracking-[0.3em] uppercase transition-colors",
        error ? "text-[#567C8D]" : "text-[#567C8D]"
      )}>
        {label}
      </span>
      {error && (
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[9px] font-black tracking-widest text-[#567C8D] uppercase"
        >
          {error}
        </motion.span>
      )}
    </div>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full bg-transparent border-b py-3 text-base md:text-lg font-display font-black tracking-tight uppercase focus:outline-none placeholder:text-white/20 text-white min-h-[80px] md:min-h-[100px] transition-colors",
          error ? "border-[#567C8D]/50" : "border-white/20 focus:border-[#567C8D]"
        )}
        placeholder={placeholder}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full bg-transparent border-b py-3 text-base md:text-lg font-display font-black tracking-tight uppercase focus:outline-none placeholder:text-white/20 text-white transition-colors",
          error ? "border-[#567C8D]/50" : "border-white/20 focus:border-[#567C8D]"
        )}
        placeholder={placeholder}
      />
    )}
    <div className={cn(
      "absolute left-0 -bottom-px h-[1px] transition-all duration-500",
      error ? "bg-[#567C8D] w-full" : "bg-[#567C8D] w-0 group-focus-within:w-full"
    )} />
  </div>
);
