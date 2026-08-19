import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Download, Check, FileText, Lock, Shield, FileSignature, User, Mail, Briefcase, IndianRupee, Phone, CheckCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabase";
import { useTransition } from "../components/TransitionProvider";
import { cn } from "../lib/utils";

// Exactly 11 universal agency contract points as specified in the prompt
const CONTRACT_TERMS = [
  {
    id: "01",
    title: "1. Project Scope & Deliverables",
    badge: "Agreed Project Scope",
    content: "Crestora Studios will provide the creative, development, marketing, technical, or other digital services described in the approved project proposal. Deliverables will be provided in appropriate industry-standard formats. Any work outside the agreed scope will be treated as additional work and quoted separately."
  },
  {
    id: "02",
    title: "2. Payment Terms",
    badge: "50% Advance Payment",
    content: "A 50% non-refundable advance payment is required before any work begins. Project work will commence upon receipt of the advance payment and acceptance of this agreement. The remaining 50% balance is due upon project completion and final approval, prior to final deployment, source-code transfer, or delivery of final project files, where applicable. Any additional work outside the agreed scope will be quoted or billed separately."
  },
  {
    id: "03",
    title: "3. Revisions & Additional Work",
    badge: "2 Revision Rounds",
    content: "The project includes up to two (2) rounds of revisions based on the approved project scope. Additional revisions, feature requests, modifications, or work outside the agreed scope will be billed separately at ₹1,500 per hour or quoted as a separate project, at Crestora Studios' discretion."
  },
  {
    id: "04",
    title: "4. Timeline & Milestones",
    badge: "Project Schedule",
    content: "Project work will commence upon receipt of the required advance payment, accepted agreement, and necessary client materials. Estimated completion dates and milestones will be discussed and agreed during the project kickoff phase. Delays caused by client feedback, approvals, missing materials, or third-party dependencies may extend the project timeline."
  },
  {
    id: "05",
    title: "5. Client Responsibilities",
    badge: "Required Information & Cooperation",
    content: "The Client agrees to provide all required content, images, branding materials, product or business information, credentials, approvals, and feedback in a timely manner. The Client is responsible for ensuring that supplied materials are accurate and legally usable. Delays in providing required materials or approvals may affect project timelines."
  },
  {
    id: "06",
    title: "6. Ownership & Intellectual Property",
    badge: "Ownership After Full Payment",
    content: "Ownership of the final custom deliverables will transfer to the Client only after full payment has been received. Until full payment is received, all unpaid project materials remain under Crestora Studios' ownership and control. Crestora Studios retains ownership of its pre-existing code, reusable components, templates, tools, workflows, processes, and proprietary techniques unless otherwise agreed in writing."
  },
  {
    id: "07",
    title: "7. Third-Party Services & Costs",
    badge: "External Services",
    content: "Hosting, domains, APIs, software subscriptions, plugins, cloud services, advertising costs, stock assets, platform fees, app-store fees, and other third-party services are the Client's responsibility unless specifically included in the approved project proposal. Crestora Studios may assist with setup or integration where applicable, but ongoing third-party charges remain the Client's responsibility."
  },
  {
    id: "08",
    title: "8. Support & Maintenance",
    badge: "30 Days Post-Delivery Support",
    content: "Crestora Studios provides up to thirty (30) days of post-delivery support for bugs or functional issues related to the originally approved scope. This support does not include new features, redesigns, content changes, additional modifications, or ongoing maintenance. Such work may be billed separately under Crestora Studios' standard rates or a separate maintenance agreement."
  },
  {
    id: "09",
    title: "9. Cancellation & Termination",
    badge: "7 Days Written Notice",
    content: "Either party may terminate this agreement with seven (7) days written notice. The 50% advance payment is non-refundable. If the Client cancels the project after work has commenced, the Client remains responsible for payment for all work completed up to the termination date, along with any approved third-party costs or outstanding amounts."
  },
  {
    id: "10",
    title: "10. Confidentiality, Liability & Security",
    badge: "Protection & Limitations",
    content: "Both parties agree to keep confidential project, business, technical, financial, customer, and credential information private. Crestora Studios will apply reasonable professional practices but cannot guarantee uninterrupted operation, complete cybersecurity protection, or the availability of third-party services. Crestora Studios shall not be liable for indirect, incidental, special, or consequential losses, and its total liability shall not exceed the total amount paid by the Client for the specific project, to the maximum extent permitted by law."
  },
  {
    id: "11",
    title: "11. Portfolio Rights & Electronic Acceptance",
    badge: "Digital Agreement",
    content: "Limited Portfolio Use: Crestora Studios may showcase completed website projects in its portfolio, website, case studies, and marketing materials. For videos, posters, motion graphics, logos, and other creative deliverables, Crestora may use only limited excerpts, screenshots, short previews, or visual glimpses to showcase its work. Full deliverables must not be publicly reproduced or distributed without the Client's permission. This agreement is accepted electronically when the Client checks the agreement checkbox and enters their name as an electronic signature."
  }
];

export default function ContractPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { triggerLogoTransition } = useTransition();

  // Contract identity states
  const [reference, setReference] = useState("");
  const [contractDate, setContractDate] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [downloadSignedUrl, setDownloadSignedUrl] = useState<string>("");
  const [closeCountdown, setCloseCountdown] = useState<number | null>(null);
  const [isClosedAttempted, setIsClosedAttempted] = useState(false);

  // Form states - EXACTLY 6 fields
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    projectName: "",
    budget: "",
    clientPhone: "",
    electronicSignature: ""
  });

  const [agreeCheckbox, setAgreeCheckbox] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Setup unique reference and load contract details
  useEffect(() => {
    const initContract = async () => {
      let ref = searchParams.get("ref");
      if (!ref) {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        ref = `CR-2026-${randNum}`;
        setSearchParams({ ref });
      }
      setReference(ref);

      const today = new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      setContractDate(today);

      try {
        const { data, error } = await supabase
          .from("contracts")
          .select("*")
          .eq("contract_reference", ref)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setFormData({
            clientName: data.client_name || "",
            clientEmail: data.client_email || "",
            projectName: data.project_name || "",
            budget: String(data.budget || ""),
            clientPhone: data.client_phone || "",
            electronicSignature: data.electronic_signature || ""
          });
          const finalized = data.contract_status === "Finalized";
          setIsFinalized(finalized);
          setAcceptedAt(data.accepted_at);
          if (data.created_at) {
            const cDate = new Date(data.created_at).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric"
            });
            setContractDate(cDate);
          }
          setAgreeCheckbox(finalized);

          // If finalized, fetch signed PDF URL
          if (finalized) {
            try {
              const { data: edgeData, error: edgeErr } = await supabase.functions.invoke("contract-handler", {
                body: { action: "get_contract", reference: ref }
              });
              if (!edgeErr && edgeData?.signedUrl) {
                setDownloadSignedUrl(edgeData.signedUrl);
              } else if (data.pdf_storage_path) {
                const pathOnly = data.pdf_storage_path.replace("contracts/", "");
                const { data: signData } = await supabase.storage
                  .from("contracts")
                  .createSignedUrl(pathOnly, 60 * 60 * 24);
                if (signData?.signedUrl) {
                  setDownloadSignedUrl(signData.signedUrl);
                }
              }
            } catch (err) {
              console.warn("Failed fetching signed URL on load:", err);
            }
          }
        } else {
          const localData = localStorage.getItem(`contract_${ref}`);
          if (localData) {
            const parsed = JSON.parse(localData);
            setFormData(parsed.formData);
            setIsFinalized(parsed.isFinalized);
            setAcceptedAt(parsed.acceptedAt);
            setContractDate(parsed.contractDate);
            setAgreeCheckbox(parsed.isFinalized);
          }
        }
      } catch (err) {
        console.warn("Supabase fetch failed, trying localStorage:", err);
        const localData = localStorage.getItem(`contract_${ref}`);
        if (localData) {
          const parsed = JSON.parse(localData);
          setFormData(parsed.formData);
          setIsFinalized(parsed.isFinalized);
          setAcceptedAt(parsed.acceptedAt);
          setContractDate(parsed.contractDate);
          setAgreeCheckbox(parsed.isFinalized);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initContract();
  }, [searchParams, setSearchParams]);

  // Timer countdown hook for automatic window closure
  useEffect(() => {
    if (closeCountdown === null) return;
    if (closeCountdown === 0) {
      setIsClosedAttempted(true);
      window.close();
      return;
    }
    const timer = setTimeout(() => {
      setCloseCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [closeCountdown]);

  // Form validator
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.clientName.trim()) {
      errors.clientName = "Client Name is required.";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.clientEmail.trim()) {
      errors.clientEmail = "Email Address is required.";
    } else if (!emailRegex.test(formData.clientEmail)) {
      errors.clientEmail = "Please enter a valid email address.";
    }
    
    if (!formData.projectName.trim()) {
      errors.projectName = "Project Name is required.";
    }
    
    const budgetVal = Number(formData.budget);
    if (!formData.budget.trim()) {
      errors.budget = "Project Budget is required.";
    } else if (isNaN(budgetVal) || budgetVal <= 0) {
      errors.budget = "Please enter a valid positive budget amount.";
    }
    
    if (!formData.clientPhone.trim()) {
      errors.clientPhone = "Client Phone is required.";
    }
    
    if (!formData.electronicSignature.trim()) {
      errors.electronicSignature = "Electronic Signature name is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = 
    formData.clientName.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail) &&
    formData.projectName.trim() !== "" &&
    formData.budget.trim() !== "" &&
    Number(formData.budget) > 0 &&
    formData.clientPhone.trim() !== "" &&
    formData.electronicSignature.trim() !== "" &&
    agreeCheckbox;

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (isFinalized) return;
    
    // Restrict Budget and Phone to digits only
    let sanitizedValue = value;
    if (field === "budget" || field === "clientPhone") {
      sanitizedValue = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleOpenFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFinalized) return;
    if (validateForm() && agreeCheckbox) {
      setShowFinalizeModal(true);
    }
  };

  const handleConfirmFinalize = async () => {
    if (isFinalized) return;
    setIsSubmitting(true);
    const timestamp = new Date().toISOString();

    try {
      // 1. Generate PDF dynamically as FINALized
      const doc = generatePDFDoc(true);
      const pdfBase64 = doc.output("datauristring").split(",")[1];

      // 2. Invoke secure Edge Function on Supabase
      const { data, error } = await supabase.functions.invoke("contract-handler", {
        body: {
          action: "finalize",
          contract_reference: reference,
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          client_phone: formData.clientPhone,
          project_name: formData.projectName,
          budget: Number(formData.budget),
          electronic_signature: formData.electronicSignature,
          pdf_base64: pdfBase64
        }
      });

      if (error) throw new Error(error.message || "Failed calling edge function");

      if (data?.success) {
        setDownloadSignedUrl(data.signedUrl);
        setIsFinalized(true);
        setAcceptedAt(timestamp);
        setCloseCountdown(5);
      } else {
        throw new Error(data?.error || "Unknown finalization error");
      }
    } catch (err: any) {
      console.warn("Edge Function finalization failed, attempting client-side fallback...", err);
      
      // FALLBACK TO CLIENT-SIDE DIRECT DB INSERT & STORAGE UPLOAD
      try {
        const doc = generatePDFDoc(true);
        const pdfBlob = doc.output("blob");
        const pdfPath = `${reference}/final-contract.pdf`;

        // 1. Upload to Supabase Storage directly
        const { error: uploadErr } = await supabase.storage
          .from("contracts")
          .upload(pdfPath, pdfBlob, {
            contentType: "application/pdf",
            upsert: true
          });
        
        if (uploadErr) throw uploadErr;

        // 2. Insert into Contracts table directly
        const dbPayload = {
          contract_reference: reference,
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          client_phone: formData.clientPhone,
          project_name: formData.projectName,
          budget: Number(formData.budget),
          electronic_signature: formData.electronicSignature,
          contract_status: "Finalized",
          pdf_storage_path: `contracts/${pdfPath}`,
          accepted_at: timestamp,
          updated_at: timestamp
        };

        const { error: dbErr } = await supabase
          .from("contracts")
          .upsert(dbPayload, { onConflict: "contract_reference" });

        if (dbErr) throw dbErr;

        setIsFinalized(true);
        setAcceptedAt(timestamp);
        setCloseCountdown(5);
      } catch (fallbackErr: any) {
        console.error("Critical: Direct fallback failed as well:", fallbackErr);
        alert(`Error finalizing contract: ${fallbackErr.message || fallbackErr}`);
        setIsSubmitting(false);
        return;
      }
    }

    const localPayload = {
      formData,
      isFinalized: true,
      acceptedAt: timestamp,
      contractDate,
      reference
    };
    localStorage.setItem(`contract_${reference}`, JSON.stringify(localPayload));

    setShowFinalizeModal(false);
    setIsSubmitting(false);
  };

  const generatePDFDoc = (finalStatus?: boolean) => {
    const activeFinalized = finalStatus !== undefined ? finalStatus : isFinalized;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const margin = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - (margin * 2);
    let y = 25;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 25) {
        doc.addPage();
        y = 25;
        // Page footer
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Crestora Studios Service Contract — Ref: ${reference}`, margin, pageHeight - 12);
        doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 15, pageHeight - 12);
        doc.setTextColor(60, 60, 60);
        return true;
      }
      return false;
    };

    // Draw header branding
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(47, 65, 86); // Navy blue dark #2F4156
    doc.text("CRESTORA STUDIOS", margin, y);
    y += 7;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(86, 124, 141); // Slate teal #567C8D
    doc.text("Creative Technology & Digital Studio", margin, y);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Email: crestorastudios@gmail.com", pageWidth - margin - 55, y - 5);
    y += 6;

    // Divider Line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Title and status
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(47, 65, 86);
    doc.text("SERVICE CONTRACT", margin, y);
    
    y += 8;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${contractDate}`, margin, y);
    doc.text(`Reference: ${reference}`, pageWidth - margin - 60, y);
    y += 12;

    // Information blocks grid
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(47, 65, 86);
    doc.text("SERVICE PROVIDER", margin, y);
    doc.text("CLIENT DETAILS", margin + 85, y);
    y += 5;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    // Left side provider
    doc.text("Crestora Studios", margin, y);
    doc.text("Chennai, India", margin, y + 4.5);
    doc.text("Email: crestorastudios@gmail.com", margin, y + 9);

    // Right side client
    doc.text(`Name: ${formData.clientName || "—"}`, margin + 85, y);
    doc.text(`Email: ${formData.clientEmail || "—"}`, margin + 85, y + 4.5);
    doc.text(`Phone: ${formData.clientPhone || "—"}`, margin + 85, y + 9);
    y += 18;

    // Project metadata block
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, y, contentWidth, 24, "F");
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(47, 65, 86);
    doc.text("PROJECT OVERVIEW", margin + 5, y + 6);
    doc.text("TOTAL BUDGET (INR)", margin + 110, y + 6);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(86, 124, 141);
    doc.text(formData.projectName || "—", margin + 5, y + 12);
    doc.text(formData.budget ? `INR ${Number(formData.budget).toLocaleString("en-IN")}` : "—", margin + 110, y + 12);
    y += 28;

    // Contract clauses list
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(47, 65, 86);
    doc.text("TERMS AND CONDITIONS", margin, y);
    y += 8;

    CONTRACT_TERMS.forEach((term) => {
      // 1. Draw Title & Badge - checkPageBreak(18) prevents orphaned headers at the bottom of pages
      checkPageBreak(18);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(47, 65, 86);
      doc.text(term.title, margin, y);
      
      // Draw a beautiful rounded rectangle badge on the right side of the page matching the frontend!
      const badgeText = term.badge.toUpperCase();
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(6.5);
      const textWidth = doc.getTextWidth(badgeText);
      const badgeWidth = textWidth + 6;
      const badgeHeight = 5;
      const badgeX = pageWidth - margin - badgeWidth;

      doc.setFillColor(241, 245, 249); // bg-slate-50 or #f1f5f9
      doc.setDrawColor(203, 213, 225); // border-slate-200 or #cbd5e1
      doc.setLineWidth(0.2);
      doc.roundedRect(badgeX, y - 4, badgeWidth, badgeHeight, 1.2, 1.2, "FD");

      doc.setTextColor(86, 124, 141); // text-[#567C8D]
      doc.text(badgeText, badgeX + 3, y - 0.5);
      y += 5.2;

      // 2. Draw content paragraph
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);

      // Replace Indian Rupee symbol with 'INR' to prevent splitting bugs in jsPDF
      const cleanContent = term.content.replace(/₹/g, "INR ");
      const lines = doc.splitTextToSize(cleanContent, contentWidth);
      lines.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin, y);
        y += 4.8;
      });
      y += 4.5; // spacing between clauses
    });

    y += 4;
    checkPageBreak(50);

    // Bottom-align signatures box to page content bottom boundary (pageHeight - margin - boxHeight)
    y = Math.max(y, pageHeight - margin - 48);

    // Draw electronic acceptance signatures box matching the frontend exactly
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 48, 2, 2, "FD");

    // Title in brand Slate Teal
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(86, 124, 141);
    doc.text("ELECTRONIC ACCEPTANCE", margin + 6, y + 6);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `I, ${formData.clientName || "[Client Name]"}, confirm that I have reviewed and agreed to the terms and conditions of this Crestora Studios service agreement.`,
      margin + 6,
      y + 12,
      { maxWidth: contentWidth - 12 }
    );

    // accepted signature left (Pavitthiran R A)
    doc.setFont("Times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(47, 65, 86);
    doc.text("Pavitthiran R A", margin + 6, y + 28);

    doc.setDrawColor(203, 213, 225); // Slate-300 lines
    doc.setLineWidth(0.3);
    doc.line(margin + 6, y + 30, margin + 56, y + 30);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate-400 labels
    doc.text("AUTHORIZED", margin + 6, y + 34);

    // accepted signature right (client name)
    doc.setFont("Times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(47, 65, 86);
    doc.text(formData.electronicSignature || "—", margin + 85, y + 28);

    doc.line(margin + 85, y + 30, margin + 135, y + 30);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate-400 labels
    doc.text("CLIENT SIGN", margin + 85, y + 34);
    
    // Acknowledgement notice in PDF - Center Aligned
    doc.setFont("Times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    const quoteText = `"By engaging Crestora's services, the client acknowledges that they have read, understood, and agreed to these terms and conditions."`;
    doc.text(quoteText, pageWidth / 2, y + 42, { align: "center" });

    return doc;
  };

  const handleDownloadPDF = () => {
    if (isFinalized && downloadSignedUrl) {
      const a = document.createElement("a");
      a.href = downloadSignedUrl;
      a.target = "_blank";
      a.download = `Crestora_Contract_${reference}_Final.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    const doc = generatePDFDoc();
    const fileSuffix = isFinalized ? "Final" : "Draft";
    doc.save(`Crestora_Contract_${reference}_${fileSuffix}.pdf`);
  };

  return (
    <div 
      className="min-h-screen lg:h-screen bg-white p-2 md:p-3 lg:p-4 font-sans select-none flex flex-col overflow-hidden"
    >
      <AnimatePresence>
        {closeCountdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#2F4156] flex flex-col items-center justify-center p-6 text-center select-text"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="max-w-md space-y-8"
            >
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg text-emerald-400">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black tracking-[0.4em] text-[#567C8D] uppercase block">
                  CONTRACT FINALIZED
                </span>
                <h2 className="text-3xl font-display font-black text-white uppercase tracking-wider">
                  Thank You!
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto font-sans">
                  The agreement has been electronically signed and stored securely. A confirmation email has been dispatched.
                </p>
              </div>

              {/* Countdown circle or final close notice */}
              {!isClosedAttempted ? (
                <>
                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                    <div className="absolute inset-0 border-4 border-[#567C8D] rounded-full animate-pulse" />
                    <span className="text-4xl font-display font-black text-white">
                      {closeCountdown}
                    </span>
                  </div>

                  <div className="space-y-4 pt-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                      CLOSING WINDOW AUTOMATICALLY...
                    </p>
                    <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-normal">
                      If the browser tab does not close automatically, you can safely close it now.
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-4 pt-6">
                  <p className="text-sm text-emerald-400 font-black uppercase tracking-wider leading-relaxed max-w-sm mx-auto">
                    The contract has been finalized and saved.
                  </p>
                  <p className="text-xs text-slate-300 max-w-[300px] mx-auto leading-normal font-sans">
                    You may now close this browser tab.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div 
        className="relative w-full flex-1 rounded-[16px] md:rounded-[28px] lg:rounded-[40px] overflow-y-auto lg:overflow-hidden bg-[#2F4156] flex flex-col border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-[#e5e7eb]"
      >
        <div className="h-full relative flex flex-col overflow-y-auto lg:overflow-hidden">
          
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-10 h-10 border-4 border-[#567C8D] border-t-transparent rounded-full animate-spin"></div>
              <span className="mt-4 text-xs font-display font-black tracking-[0.2em] text-white/55">RETRIEVING CONTRACT DATABASE...</span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative">
              
              {/* LEFT SIDE: EDITABLE FORM CARD */}
              <div className="w-full lg:w-[45%] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col h-auto lg:h-full overflow-y-auto custom-scrollbar-light p-6 md:p-8 shrink-0 bg-[#2b3b4f]/40">
                
                {/* Centered Agency Header Block matching screenshot */}
                <div className="flex flex-col items-center text-center mt-2 mb-8 shrink-0">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-black/25 mb-4 shadow-inner">
                    <img src="/crestora_logo.png" alt="Crestora Studios" className="w-12 h-12 object-contain" />
                  </div>
                  <span className="block text-[10px] md:text-xs font-black tracking-[0.2em] text-[#567C8D] uppercase mb-1">
                    PROJECT AGREEMENT & SERVICE CONTRACT
                  </span>
                  <a href="mailto:crestorastudios@gmail.com" className="text-[10px] md:text-xs text-white/40 hover:text-[#567C8D] transition-colors border-b border-[#567C8D]/20 pb-0.5 mb-5 font-medium">
                    crestorastudios@gmail.com
                  </a>
                  <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-wide leading-tight uppercase max-w-[280px]">
                    Crestora Studios
                  </h1>
                </div>

                <form onSubmit={handleOpenFinalize} className="w-full flex flex-col flex-1">
                  
                  {/* SINGLE PARENT CARD DIV containing all fields */}
                  <div className="bg-[#181d29]/60 border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl mb-6">
                    
                    {/* Card Header matching screenshot */}
                    <div className="flex items-start justify-between gap-3 text-white pb-5 border-b border-white/5 mb-6">
                      <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-[#567C8D]" />
                        <div className="flex flex-col">
                          <span className="text-3xl font-display font-black tracking-wider uppercase leading-none">
                            CONTRACT
                          </span>
                          <span className="text-3xl font-display font-black tracking-wider uppercase leading-none mt-1">
                            DETAILS
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] md:text-xs text-white/50 leading-relaxed font-sans mb-6">
                      {isFinalized 
                        ? "This contract has been electronically signed and locked. You can view details or export it as a PDF." 
                        : "Fill in the information below to generate your project contract."}
                    </p>

                    {/* 2-Column Grid for Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                      
                      {/* Field 1: Client Name */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] md:text-xs font-black tracking-wider text-white/70 uppercase">
                          <User className="w-3.5 h-3.5 text-[#567C8D]" />
                          <span>CLIENT NAME</span>
                        </label>
                        <input
                          type="text"
                          disabled={isFinalized}
                          value={formData.clientName}
                          onChange={(e) => handleInputChange("clientName", e.target.value)}
                          placeholder="e.g. John Doe"
                          className={cn(
                            "w-full px-4 py-3 bg-black/25 border border-white/10 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:border-[#567C8D] focus:ring-1 focus:ring-[#567C8D]/25 transition-all",
                            isFinalized && "opacity-55 cursor-not-allowed",
                            formErrors.clientName && "border-red-500/70"
                          )}
                        />
                        {formErrors.clientName && (
                          <span className="text-[10px] text-red-400 font-medium block mt-0.5">{formErrors.clientName}</span>
                        )}
                      </div>

                      {/* Field 2: Email Address */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] md:text-xs font-black tracking-wider text-white/70 uppercase">
                          <Mail className="w-3.5 h-3.5 text-[#567C8D]" />
                          <span>EMAIL ADDRESS</span>
                        </label>
                        <input
                          type="email"
                          disabled={isFinalized}
                          value={formData.clientEmail}
                          onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                          placeholder="e.g. john@company.com"
                          className={cn(
                            "w-full px-4 py-3 bg-black/25 border border-white/10 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:border-[#567C8D] focus:ring-1 focus:ring-[#567C8D]/25 transition-all",
                            isFinalized && "opacity-55 cursor-not-allowed",
                            formErrors.clientEmail && "border-red-500/70"
                          )}
                        />
                        {formErrors.clientEmail && (
                          <span className="text-[10px] text-red-400 font-medium block mt-0.5">{formErrors.clientEmail}</span>
                        )}
                      </div>

                      {/* Field 3: Project Name */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] md:text-xs font-black tracking-wider text-white/70 uppercase">
                          <Briefcase className="w-3.5 h-3.5 text-[#567C8D]" />
                          <span>PROJECT NAME</span>
                        </label>
                        <input
                          type="text"
                          disabled={isFinalized}
                          value={formData.projectName}
                          onChange={(e) => handleInputChange("projectName", e.target.value)}
                          placeholder="e.g. Brand Identity System"
                          className={cn(
                            "w-full px-4 py-3 bg-black/25 border border-white/10 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:border-[#567C8D] focus:ring-1 focus:ring-[#567C8D]/25 transition-all",
                            isFinalized && "opacity-55 cursor-not-allowed",
                            formErrors.projectName && "border-red-500/70"
                          )}
                        />
                        {formErrors.projectName && (
                          <span className="text-[10px] text-red-400 font-medium block mt-0.5">{formErrors.projectName}</span>
                        )}
                      </div>

                      {/* Field 4: Budget (INR) */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] md:text-xs font-black tracking-wider text-white/70 uppercase">
                          <IndianRupee className="w-3.5 h-3.5 text-[#567C8D]" />
                          <span>BUDGET (INR)</span>
                        </label>
                        <input
                          type="text"
                          disabled={isFinalized}
                          value={formData.budget}
                          onChange={(e) => handleInputChange("budget", e.target.value)}
                          placeholder="e.g. 50000"
                          className={cn(
                            "w-full px-4 py-3 bg-black/25 border border-white/10 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:border-[#567C8D] focus:ring-1 focus:ring-[#567C8D]/25 transition-all",
                            isFinalized && "opacity-55 cursor-not-allowed",
                            formErrors.budget && "border-red-500/70"
                          )}
                        />
                        {formErrors.budget && (
                          <span className="text-[10px] text-red-400 font-medium block mt-0.5">{formErrors.budget}</span>
                        )}
                      </div>

                      {/* Field 5: Client Phone */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] md:text-xs font-black tracking-wider text-white/70 uppercase">
                          <Phone className="w-3.5 h-3.5 text-[#567C8D]" />
                          <span>CLIENT PHONE</span>
                        </label>
                        <input
                          type="text"
                          disabled={isFinalized}
                          value={formData.clientPhone}
                          onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                          placeholder="e.g. +91 00000 00000"
                          className={cn(
                            "w-full px-4 py-3 bg-black/25 border border-white/10 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:border-[#567C8D] focus:ring-1 focus:ring-[#567C8D]/25 transition-all",
                            isFinalized && "opacity-55 cursor-not-allowed",
                            formErrors.clientPhone && "border-red-500/70"
                          )}
                        />
                        {formErrors.clientPhone && (
                          <span className="text-[10px] text-red-400 font-medium block mt-0.5">{formErrors.clientPhone}</span>
                        )}
                      </div>

                      {/* Field 6: Electronic Signature */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-black tracking-wider text-white/70 uppercase">
                          <FileSignature className="w-3.5 h-3.5 text-[#567C8D]" />
                          <span>DIGITAL SIGNATURE</span>
                        </div>
                        <input
                          type="text"
                          disabled={isFinalized}
                          value={formData.electronicSignature}
                          onChange={(e) => handleInputChange("electronicSignature", e.target.value)}
                          placeholder="e.g. John Doe"
                          style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
                          className={cn(
                            "w-full px-4 py-3 bg-black/25 border text-lg text-white font-bold italic focus:outline-none transition-all rounded-[14px]",
                            isFinalized 
                              ? "opacity-55 cursor-not-allowed border-white/10" 
                              : "border-[#567C8D] focus:border-[#567C8D] focus:ring-2 focus:ring-[#567C8D]/20",
                            formErrors.electronicSignature && "border-red-500/70"
                          )}
                        />
                        {formErrors.electronicSignature && (
                          <span className="text-[10px] text-red-400 font-medium block mt-0.5">{formErrors.electronicSignature}</span>
                        )}
                      </div>

                    </div>

                    {/* Checkbox */}
                    <div className="pt-2 mb-6">
                      <label className={cn(
                        "flex items-start gap-3 cursor-pointer",
                        isFinalized && "opacity-60 cursor-not-allowed"
                      )}>
                        <input
                          type="checkbox"
                          disabled={isFinalized}
                          checked={agreeCheckbox}
                          onChange={(e) => !isFinalized && setAgreeCheckbox(e.target.checked)}
                          className="mt-0.5 w-4 h-4 bg-black/30 border border-white/10 rounded focus:ring-0 text-[#567C8D] accent-[#567C8D]"
                        />
                        <span className="text-[11px] md:text-xs text-white/70 leading-snug">
                          I agree to the terms and conditions outlined in the contract below.
                        </span>
                      </label>
                    </div>

                    {/* Desktop Actions Section */}
                    <div className="pt-4 pb-2 space-y-3 shrink-0 hidden lg:block border-t border-white/5">
                      <div className="flex gap-4">
                        {isFinalized ? (
                          <button
                            type="button"
                            onClick={handleDownloadPDF}
                            className="flex-1 py-4 bg-[#567C8D] hover:bg-[#6c9ab0] text-white rounded-xl text-xs md:text-sm font-display font-black tracking-widest uppercase transition-all duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            Download Final Contract
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={handleDownloadPDF}
                              className="flex-1 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl text-xs md:text-sm font-display font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                              Download Draft
                            </button>

                            <button
                              type="submit"
                              disabled={!isFormValid}
                              className={cn(
                                "flex-1 py-4 rounded-xl text-xs md:text-sm font-display font-black tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer",
                                isFormValid
                                  ? "bg-[#567C8D] hover:bg-[#6c9ab0] text-white"
                                  : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed"
                              )}
                            >
                              <Check className="w-4 h-4" />
                              Submit & Finalize
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                </form>
              </div>

              {/* RIGHT SIDE: LIVE CONTRACT PREVIEW */}
              <div className="flex-1 h-auto lg:h-full overflow-y-auto custom-scrollbar p-6 md:p-10 bg-black/20 select-text">
                
                {/* Header matching screenshot */}
                <div className="flex items-center justify-between mb-4 max-w-[750px] mx-auto">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#567C8D]" />
                    <h3 className="text-lg font-display font-black tracking-tight text-white uppercase">Live Preview</h3>
                  </div>
                </div>

                <div className="max-w-[750px] mx-auto bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 md:p-12 relative overflow-hidden text-slate-800">
                  


                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                      <h2 className="text-3xl font-display font-black tracking-widest text-slate-900 leading-none">CRESTORA STUDIOS</h2>
                      <span className="text-[10px] text-[#567C8D] font-black uppercase tracking-[0.2em] block mt-1.5">Creative Technology & Digital Studio</span>
                    </div>
                    <div className="text-left sm:text-right text-[11px] text-slate-500 space-y-1">
                      <div>Date: <span className="text-slate-800 font-bold">{contractDate}</span></div>
                      <div>Ref: <span className="text-[#567C8D] font-bold">{reference}</span></div>
                    </div>
                  </div>

                  <hr className="border-slate-200 mb-8" />

                  {/* Contract Intro title */}
                  <div className="mb-8">
                    <h3 className="text-lg md:text-xl font-display font-black tracking-wider uppercase text-slate-900">Crestora Studios — Service Agreement</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed font-sans">
                      This digital service contract is entered into on <span className="text-slate-900 font-bold">{contractDate}</span> by and between the Service Provider, **Crestora Studios**, and the undersigned Client.
                    </p>
                  </div>

                  {/* Details block Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs">
                    
                    {/* Left: Provider */}
                    <div className="space-y-1">
                      <h4 className="font-display font-black tracking-wider text-slate-400 uppercase text-[9px]">Service Provider</h4>
                      <div className="font-bold text-slate-900 text-sm">Crestora Studios</div>
                      <div className="text-slate-500 font-medium">Chennai, India</div>
                      <div className="text-slate-500 font-medium">Email: crestorastudios@gmail.com</div>
                    </div>

                    {/* Right: Client */}
                    <div className="space-y-1">
                      <h4 className="font-display font-black tracking-wider text-slate-400 uppercase text-[9px]">Client</h4>
                      <div className="font-bold text-slate-900 text-sm">{formData.clientName || "[Client Name]"}</div>
                      <div className="text-slate-500 font-medium">{formData.clientEmail || "[Client Email]"}</div>
                      <div className="text-slate-500 font-medium">{formData.clientPhone || "[Client Phone]"}</div>
                    </div>
                  </div>

                  {/* Project Overview block matching mockup screenshot */}
                  <div className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest block mb-1">Project Overview</span>
                    <h4 className="text-lg font-bold text-slate-900 font-display mb-4">
                      {formData.projectName || "[Project Name]"}
                    </h4>
                    <div className="flex justify-between items-center border-t border-slate-200/60 pt-3">
                      <span className="text-xs text-slate-500 font-medium">Total Budget:</span>
                      <span className="text-sm font-black text-slate-900 font-display">
                        ₹{formData.budget ? Number(formData.budget).toLocaleString("en-IN") : "0"}
                      </span>
                    </div>
                  </div>



                  {/* Complete Contract text clauses */}
                  <div className="space-y-6 mb-10 text-xs text-slate-700 leading-relaxed font-sans">
                    <h4 className="text-sm font-display font-black tracking-widest text-slate-900 uppercase border-b border-slate-200 pb-2">Terms and Conditions</h4>
                    
                    {CONTRACT_TERMS.map((term) => (
                      <div key={term.id} className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="font-bold text-slate-800 font-display text-sm tracking-wide">{term.title}</h5>
                          {term.badge && (
                            <span className="text-[8px] font-sans font-bold tracking-widest text-[#567C8D] bg-[#567C8D]/10 border border-[#567C8D]/20 px-1.5 py-0.5 rounded-sm uppercase">
                              {term.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 whitespace-pre-line leading-relaxed">{term.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Signatures block matching screenshot */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
                    <h4 className="font-display font-black tracking-widest text-[#567C8D] uppercase text-[10px]">Electronic Acceptance</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      I, <span className="text-slate-900 font-bold">{formData.clientName || "[Client Name]"}</span>, confirm that I have reviewed and agreed to the terms and conditions of this Crestora Studios service agreement.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-0 sm:gap-x-8 pt-4 text-xs">
                      <div className="flex flex-col">
                        <span 
                          style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
                          className="text-2xl font-bold italic text-slate-900 tracking-wide leading-none min-h-[30px]"
                        >
                          Pavitthiran R A
                        </span>
                        <div className="w-full h-px bg-slate-300 my-1.5"></div>
                        <span className="text-[8px] font-sans font-bold tracking-widest text-slate-400 uppercase">
                          AUTHORIZED
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span 
                          style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
                          className="text-2xl font-bold italic text-slate-900 tracking-wide leading-none min-h-[30px]"
                        >
                          {formData.electronicSignature || "—"}
                        </span>
                        <div className="w-full h-px bg-slate-300 my-1.5"></div>
                        <span className="text-[8px] font-sans font-bold tracking-widest text-slate-400 uppercase">
                          CLIENT SIGN
                        </span>
                      </div>
                    </div>
                    
                    {/* Centered quote matching mockup screenshot */}
                    <div className="pt-4 text-center">
                      <p className="text-[10px] italic text-slate-400 max-w-[85%] mx-auto leading-relaxed">
                        "By engaging Crestora's services, the client acknowledges that they have read, understood, and agreed to these terms and conditions."
                      </p>
                    </div>
                  </div>

                </div>

                {/* Mobile / Tablet Actions Section stacked beneath preview card */}
                <div className="pt-6 space-y-3 shrink-0 block lg:hidden max-w-[750px] mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {isFinalized ? (
                      <button
                        type="button"
                        onClick={handleDownloadPDF}
                        className="flex-1 py-4 bg-[#567C8D] hover:bg-[#6c9ab0] text-white rounded-xl text-xs font-display font-black tracking-widest uppercase transition-all duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download Final Contract
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleDownloadPDF}
                          className="flex-1 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl text-xs font-display font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          Download Draft PDF
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenFinalize}
                          disabled={!isFormValid}
                          className={cn(
                            "flex-1 py-4 rounded-xl text-xs font-display font-black tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer",
                            isFormValid
                              ? "bg-[#567C8D] hover:bg-[#6c9ab0] text-white"
                              : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed"
                          )}
                        >
                          <Check className="w-4 h-4" />
                          Submit & Finalize
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* CONFIRM FINALIZE OVERLAY MODAL */}
      <AnimatePresence>
        {showFinalizeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#2b3b4f] border border-white/10 rounded-2xl w-full max-w-[450px] overflow-hidden shadow-2xl p-6 text-left"
            >
              <div className="flex items-center gap-3 text-amber-400 mb-4">
                <Shield className="w-8 h-8" />
                <h3 className="text-lg md:text-xl font-display font-black tracking-wider uppercase text-white">Finalize Contract</h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed mb-6 font-sans">
                You are about to electronically accept this agreement. After finalization, the contract details will be locked. No further modifications can be made.
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowFinalizeModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs md:text-sm font-display font-black tracking-widest uppercase transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmFinalize}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#567C8D] hover:bg-[#6c9ab0] text-white rounded-xl text-xs md:text-sm font-display font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Confirm & Finalize"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
