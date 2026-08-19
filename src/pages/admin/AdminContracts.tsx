import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  X, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  IndianRupee, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Trash2
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { cn } from "@/lib/utils";

export default function AdminContracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "FINALIZED" | "DRAFT">("ALL");
  
  // Selected contract for detail viewing
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [isSignLoading, setIsSignLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // 1. Delete from Supabase Storage if path exists
      if (deleteTarget.pdf_storage_path) {
        const pathOnly = deleteTarget.pdf_storage_path.replace("contracts/", "");
        const { error: storageErr } = await supabase.storage
          .from("contracts")
          .remove([pathOnly]);

        if (storageErr) {
          console.warn("Storage PDF deletion failed/skipped:", storageErr);
        }
      }

      // 2. Delete from Supabase Database
      const { error: dbErr } = await supabase
        .from("contracts")
        .delete()
        .eq("id", deleteTarget.id);

      if (dbErr) throw dbErr;

      // Close drawer if it was showing the deleted contract
      if (selectedContract && selectedContract.id === deleteTarget.id) {
        setSelectedContract(null);
      }

      // 3. Reset states & refresh list
      setDeleteTarget(null);
      await fetchContracts();
    } catch (err: any) {
      console.error("Error deleting contract:", err);
      alert(`Failed to delete contract: ${err.message || err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (err) {
      console.error("Error fetching contracts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Fetch signed URL for preview when a contract is selected
  useEffect(() => {
    if (!selectedContract) {
      setSignedUrl("");
      return;
    }

    const loadSignedUrl = async () => {
      if (selectedContract.contract_status !== "Finalized" || !selectedContract.pdf_storage_path) {
        setSignedUrl("");
        return;
      }

      setIsSignLoading(true);
      try {
        // First try to fetch from Edge Function to ensure secure backend-side signing
        const { data, error } = await supabase.functions.invoke("contract-handler", {
          body: { action: "get_contract", reference: selectedContract.contract_reference }
        });

        if (!error && data?.signedUrl) {
          setSignedUrl(data.signedUrl);
        } else {
          // Fallback to client-side signed URL generation using RLS permissions
          const pathOnly = selectedContract.pdf_storage_path.replace("contracts/", "");
          const { data: signData, error: signErr } = await supabase.storage
            .from("contracts")
            .createSignedUrl(pathOnly, 60 * 60); // 1 hour

          if (signErr) throw signErr;
          setSignedUrl(signData?.signedUrl || "");
        }
      } catch (err) {
        console.error("Failed to generate signed PDF URL:", err);
      } finally {
        setIsSignLoading(false);
      }
    };

    loadSignedUrl();
  }, [selectedContract]);

  const handleDownload = async (contract: any) => {
    if (!contract.pdf_storage_path) return;
    try {
      let downloadUrl = "";
      
      // 1. Get signed url
      const { data, error } = await supabase.functions.invoke("contract-handler", {
        body: { action: "get_contract", reference: contract.contract_reference }
      });

      if (!error && data?.signedUrl) {
        downloadUrl = data.signedUrl;
      } else {
        // Fallback
        const pathOnly = contract.pdf_storage_path.replace("contracts/", "");
        const { data: signData } = await supabase.storage
          .from("contracts")
          .createSignedUrl(pathOnly, 60 * 5); // 5 minutes
        downloadUrl = signData?.signedUrl || "";
      }

      if (downloadUrl) {
        // Trigger browser download link
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.target = "_blank";
        a.download = `Crestora_Contract_${contract.contract_reference}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Error downloading contract:", err);
    }
  };

  // Filtered List
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch = 
      c.contract_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.project_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "FINALIZED") return matchesSearch && c.contract_status === "Finalized";
    if (statusFilter === "DRAFT") return matchesSearch && c.contract_status !== "Finalized";
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Header Block */}
        <div>
          <span className="text-[10px] font-black tracking-[0.4em] text-black/45 block mb-4">
            [ SECURE SYSTEM ]
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
            Contracts Database
          </h1>
          <p className="mt-4 text-xs md:text-sm text-slate-500 max-w-[600px] uppercase font-medium">
            Review, track, and securely download legally accepted service agreements and project client briefs.
          </p>
        </div>

        {/* Toolbar Grid */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-stretch">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH REFERENCE, CLIENT, OR PROJECT..."
              className="w-full pl-12 pr-6 py-4 bg-white border border-black/10 rounded-xl text-[10px] font-black tracking-widest uppercase outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Filters toggle */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-black/5 text-[9px] font-black tracking-widest uppercase">
            {(["ALL", "FINALIZED", "DRAFT"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={cn(
                  "px-5 py-2.5 rounded-lg transition-all cursor-pointer",
                  statusFilter === opt
                    ? "bg-white text-black shadow-sm"
                    : "text-slate-500 hover:text-black"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Database Table Card */}
        <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              <span className="mt-4 text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">STREAMING DATABASE...</span>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="py-20 text-center">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-4" />
              <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">NO CONTRACT RECORDS FOUND</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/10 bg-slate-50/50 text-[9px] font-black tracking-widest uppercase text-slate-400">
                    <th className="py-5 px-6">Reference</th>
                    <th className="py-5 px-6">Client Name</th>
                    <th className="py-5 px-6">Project Name</th>
                    <th className="py-5 px-6">Budget</th>
                    <th className="py-5 px-6">Status</th>
                    <th className="py-5 px-6">Accepted Date</th>
                    <th className="py-5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[11px] font-medium text-slate-700">
                  {filteredContracts.map((contract) => {
                    const isFinal = contract.contract_status === "Finalized";
                    const formattedBudget = contract.budget 
                      ? `₹${Number(contract.budget).toLocaleString("en-IN")}`
                      : "—";
                    const formattedDate = contract.accepted_at 
                      ? new Date(contract.accepted_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })
                      : contract.created_at
                      ? new Date(contract.created_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })
                      : "—";

                    return (
                      <tr 
                        key={contract.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-5 px-6 font-display font-black tracking-wider text-black">
                          {contract.contract_reference}
                        </td>
                        <td className="py-5 px-6">
                          <div className="font-bold text-slate-900">{contract.client_name}</div>
                          <div className="text-[10px] text-slate-400">{contract.client_email}</div>
                        </td>
                        <td className="py-5 px-6 font-semibold">
                          {contract.project_name}
                        </td>
                        <td className="py-5 px-6 font-bold text-slate-900">
                          {formattedBudget}
                        </td>
                        <td className="py-5 px-6">
                          <span className={cn(
                            "px-2.5 py-1 rounded text-[8px] font-black tracking-wider uppercase inline-flex items-center gap-1.5",
                            isFinal 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          )}>
                            {isFinal ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                            {contract.contract_status?.toUpperCase() || "DRAFT"}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-slate-500 font-semibold">
                          {formattedDate}
                        </td>
                        <td className="py-5 px-6 text-right space-x-1.5">
                          <button
                            onClick={() => setSelectedContract(contract)}
                            className="p-2 hover:bg-black/5 rounded-lg text-slate-500 hover:text-black transition-all cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isFinal && (
                            <button
                              onClick={() => handleDownload(contract)}
                              className="p-2 hover:bg-black/5 rounded-lg text-slate-500 hover:text-[#567C8D] transition-all cursor-pointer"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteTarget(contract)}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-all cursor-pointer"
                            title="Delete Contract"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out detail drawer */}
      <AnimatePresence>
        {selectedContract && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContract(null)}
              className="fixed inset-0 z-[6000] bg-black"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[7000] w-full max-w-4xl bg-white shadow-2xl flex flex-col h-full border-l border-black/10 select-text"
            >
              {/* Drawer Header */}
              <div className="p-8 border-b border-black/10 flex justify-between items-center bg-slate-50">
                <div>
                  <span className="text-[9px] font-black tracking-[0.2em] text-[#567C8D] uppercase block mb-1">
                    SERVICE AGREEMENT DETAIL
                  </span>
                  <h2 className="text-2xl font-display font-black text-black uppercase">
                    Ref: {selectedContract.contract_reference}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="p-2.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar-light">
                {/* Meta details cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Client Details */}
                  <div className="border border-black/5 rounded-xl p-5 space-y-4">
                    <span className="text-[8px] font-sans font-bold tracking-widest text-slate-400 uppercase block">Client Information</span>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs">
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Name</p>
                          <p className="font-bold text-slate-800 mt-1">{selectedContract.client_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Email Address</p>
                          <p className="font-semibold text-slate-800 mt-1">{selectedContract.client_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Phone Number</p>
                          <p className="font-semibold text-slate-800 mt-1">{selectedContract.client_phone || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Project Details */}
                  <div className="border border-black/5 rounded-xl p-5 space-y-4">
                    <span className="text-[8px] font-sans font-bold tracking-widest text-slate-400 uppercase block">Project Information</span>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs">
                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Project Title</p>
                          <p className="font-bold text-slate-800 mt-1">{selectedContract.project_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <IndianRupee className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Total Budget</p>
                          <p className="font-bold text-slate-800 mt-1">₹{Number(selectedContract.budget).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Acceptance Date</p>
                          <p className="font-semibold text-slate-800 mt-1">
                            {selectedContract.accepted_at 
                              ? new Date(selectedContract.accepted_at).toLocaleString("en-IN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "Draft — Not Signed"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature box */}
                <div className="border border-black/5 rounded-xl p-5 bg-slate-50 flex flex-wrap gap-4 justify-between items-center">
                  <div>
                    <span className="text-[8px] font-sans font-bold tracking-widest text-slate-400 uppercase block mb-1">
                      CLIENT DIGITAL SIGNATURE
                    </span>
                    <span 
                      style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
                      className="text-2xl font-bold italic text-slate-800"
                    >
                      {selectedContract.electronic_signature || "—"}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteTarget(selectedContract)}
                      className="px-6 py-3.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer border border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                    {selectedContract.contract_status === "Finalized" && (
                      <button
                        onClick={() => handleDownload(selectedContract)}
                        className="px-6 py-3.5 bg-black text-white hover:bg-slate-900 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                      </button>
                    )}
                  </div>
                </div>

                {/* PDF PREVIEW WINDOW */}
                {selectedContract.contract_status === "Finalized" && (
                  <div className="space-y-4">
                    <span className="text-[8px] font-sans font-bold tracking-widest text-slate-400 uppercase block">
                      Contract PDF Preview
                    </span>
                    {isSignLoading ? (
                      <div className="w-full h-[600px] border border-black/5 rounded-xl bg-slate-50 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        <span className="mt-4 text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">RETRIEVING SIGNED DOCUMENT...</span>
                      </div>
                    ) : signedUrl ? (
                      <div className="relative group rounded-xl overflow-hidden border border-black/10">
                        <iframe 
                          src={`${signedUrl}#toolbar=0`}
                          className="w-full h-[600px]"
                          title="Finalized Contract PDF"
                        />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={signedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-black/80 hover:bg-black text-white text-[9px] font-black tracking-widest uppercase px-4 py-2 rounded-lg flex items-center gap-1.5 backdrop-blur-sm"
                          >
                            Open in New Tab <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-[150px] border border-dashed border-black/10 rounded-xl flex flex-col items-center justify-center text-slate-400">
                        <FileText className="w-8 h-8 mb-2" />
                        <span className="text-[9px] font-black tracking-[0.2em] uppercase">PREVIEW UNAVAILABLE</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 z-[8000] bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9000] w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-black/10 select-text"
            >
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <Trash2 className="w-6 h-6" />
                <h3 className="text-lg font-display font-black tracking-wider uppercase text-black">
                  Delete Contract
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
                Are you sure you want to permanently delete contract reference <strong className="text-black font-black">{deleteTarget.contract_reference}</strong>? 
                This action will delete the database record and permanently remove the signed PDF from Supabase Storage. This cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 border border-black/10 hover:bg-black/5 text-black rounded-xl text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
