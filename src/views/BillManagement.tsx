import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Receipt,
  FileText,
  Upload,
  Check,
  AlertCircle,
  Search,
  FileDown,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PageHeader from "../components/shared/PageHeader";
import StatusBadge from "../components/shared/StatusBadge";

// Fake types for Service Requests
interface ServiceRequest {
  id: string;
  request_id: string;
  customer_name: string;
  service_type: string;
  status: string; // expecting 'availed', 'no_show', etc.
  bill_status?:
    | "unbilled"
    | "partner_uploaded"
    | "billed"
    | "waiver_requested"
    | "waiver_approved"
    | "waiver_rejected";
  partner_bill_url?: string;
  created_at?: any;
}

export default function BillManagement() {
  const [activeTab, setActiveTab] = useState("Pending Bills");
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);

  useEffect(() => {
    // Listen to service requests
    const q = query(collection(db, "serviceRequests"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: ServiceRequest[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as ServiceRequest);
      });
      setRequests(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Filter requests that are eligible for billing according to requirements:
  // "executed once the service status shows service is availed/ No show"
  const eligibleRequests = requests.filter(
    (req) =>
      (req.status === "availed" || req.status === "no_show") &&
      (req.request_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Pending Bills are eligible but unbilled or partner_uploaded
  const pendingBills = eligibleRequests.filter(
    (req) =>
      !req.bill_status ||
      req.bill_status === "unbilled" ||
      req.bill_status === "partner_uploaded",
  );

  // Waivers
  const waiverApprovals = requests.filter(
    (req) =>
      (req.bill_status === "waiver_requested" ||
        req.bill_status === "waiver_approved") &&
      (req.request_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleUploadPartnerBill = async (reqId: string) => {
    // Simulate upload delay
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, "serviceRequests", reqId), {
          bill_status: "billed", // "bill should be generated automatically after submitting / uploading scan copy"
          partner_bill_url: "dummy_url_to_scan.pdf",
          updatedAt: serverTimestamp(),
        });
        alert(
          "Partner bill uploaded! Customer bill generated automatically based on partner bill values.",
        );
        setShowUploadModal(false);
        setSelectedRequest(null);
      } catch (err) {
        console.error(err);
        alert("Failed to upload bill.");
      }
    }, 1500);
  };

  const handleRequestWaiver = async (reqId: string, reason: string) => {
    try {
      await updateDoc(doc(db, "serviceRequests", reqId), {
        bill_status: "waiver_requested",
        waiver_reason: reason,
        updatedAt: serverTimestamp(),
      });
      alert("Charge waiver requested successfully. Pending approval.");
      setShowWaiverModal(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
      alert("Failed to request waiver.");
    }
  };

  const handleApproveWaiver = async (reqId: string) => {
    try {
      await updateDoc(doc(db, "serviceRequests", reqId), {
        bill_status: "waiver_approved",
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const currentData =
    activeTab === "Pending Bills" ? pendingBills : waiverApprovals;

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-1">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-900">
            Restricted Console
          </h3>
          <p className="text-xs text-amber-800 font-medium opacity-80 mt-1">
            This module is restricted to{" "}
            <strong>BDT, Head of Priority, and Head of Proposition</strong>. You
            can process bills only when a service shows{" "}
            <span className="font-bold underline">Availed</span> or{" "}
            <span className="font-bold underline">No Show</span>.
          </p>
        </div>
      </div>

      <PageHeader
        title="Bill Management"
        description="Process partner bills, generate customer charges, and manage waiver approvals."
        actions={
          <button className="flex items-center gap-2 bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1E293B] transition-all shadow-sm">
            <FileSpreadsheet size={18} />
            Export Monthly Ledger
          </button>
        }
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[24px] border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {["Pending Bills", "Waiver Approvals"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                activeTab === tab
                  ? "bg-[#F8FAFC] border-[#E2E8F0] shadow-sm text-[#0F172A]"
                  : "border-transparent text-[#64748B] hover:bg-white/50 hover:text-[#0F172A]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative md:max-w-xs w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            size={18}
          />
          <input
            type="text"
            placeholder="Search request ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-[#F8FAFC] border border-transparent rounded-xl focus:border-[#D4AF37] focus:bg-white transition-all text-sm font-medium outline-none"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest whitespace-nowrap">
                  Service Details
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest whitespace-nowrap">
                  Service Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest whitespace-nowrap">
                  Billing Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest text-right whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="inline-flex flex-col items-center justify-center text-[#94A3B8]">
                      <Receipt size={40} className="mb-4 opacity-20" />
                      <p className="text-sm font-medium">
                        No records found for "{activeTab}".
                      </p>
                      <p className="text-xs mt-1">
                        Make sure service requests are marked as Availed or No
                        Show.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8FAFC]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#0F172A]">
                          {req.request_id}
                        </span>
                        <span className="text-xs text-[#64748B] uppercase tracking-wider">
                          {req.customer_name || "Unknown"} - {req.service_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={
                          req.status === "availed" ? "active" : "inactive"
                        }
                      >
                        {req.status?.replace("_", " ")}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={
                          req.bill_status === "billed"
                            ? "active"
                            : req.bill_status === "waiver_requested"
                              ? "pending"
                              : req.bill_status === "waiver_approved"
                                ? "active"
                                : "inactive"
                        }
                      >
                        {req.bill_status?.replace("_", " ") || "Unbilled"}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {activeTab === "Pending Bills" ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setShowUploadModal(true);
                            }}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 ml-auto"
                          >
                            <Upload size={14} /> Upload Partner Bill
                          </button>
                          {(!req.bill_status ||
                            req.bill_status === "unbilled") && (
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setShowWaiverModal(true);
                              }}
                              className="px-4 py-2 mt-2 bg-amber-100 text-amber-800 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all shadow-sm flex items-center gap-2 ml-auto"
                            >
                              Request Charge Waiver
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {req.bill_status === "waiver_requested" && (
                            <button
                              onClick={() => handleApproveWaiver(req.id)}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 ml-auto hover:bg-green-200"
                            >
                              <Check size={14} /> Approve Waiver
                            </button>
                          )}
                          {req.bill_status === "waiver_approved" && (
                            <span className="text-xs font-bold text-green-600 mr-2 flex items-center gap-1 justify-end">
                              <Check size={14} /> Approved
                            </span>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Partner Bill Modal */}
      <AnimatePresence>
        {showUploadModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-6 text-[#0F172A] border border-[#E2E8F0]">
                <FileDown size={32} />
              </div>

              <h2 className="text-xl font-bold text-[#0F172A] mb-2">
                Upload Partner Bill
              </h2>
              <p className="text-sm text-[#64748B] mb-6">
                Uploading the partner bill scan for{" "}
                <strong className="text-[#0F172A]">
                  {selectedRequest.request_id}
                </strong>{" "}
                will automatically generate the customer bill.
                <br />
                <br />
                <span className="text-xs italic bg-slate-50 p-2 rounded block">
                  VAT & Tax logic and parameter settings will be applied later.
                </span>
              </p>

              <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-8 text-center hover:border-[#D4AF37] transition-colors cursor-pointer group mb-6">
                <Upload className="mx-auto mb-3 text-[#94A3B8] group-hover:text-[#D4AF37] transition-colors" />
                <p className="text-sm font-bold text-[#0F172A]">
                  Click to select a scanned output
                </p>
                <p className="text-xs text-[#64748B] mt-1">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 bg-white text-[#0F172A] border border-[#E2E8F0] rounded-xl font-bold text-sm hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUploadPartnerBill(selectedRequest.id)}
                  className="flex-1 px-4 py-3 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:bg-[#1E293B] shadow-lg shadow-[#0F172A]/10 transition-colors"
                >
                  Upload & Generate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Request Waiver Modal */}
      <AnimatePresence>
        {showWaiverModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-600 border border-amber-100">
                <AlertCircle size={32} />
              </div>

              <h2 className="text-xl font-bold text-[#0F172A] mb-2">
                Request Charge Waiver
              </h2>
              <p className="text-sm text-[#64748B] mb-6">
                Request a fee waiver for{" "}
                <strong className="text-[#0F172A]">
                  {selectedRequest.request_id}
                </strong>
                . This requires approval from the appropriate level.
              </p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                    Reason for Waiver
                  </label>
                  <textarea
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-sm focus:border-[#D4AF37] focus:bg-white transition-all block outline-none resize-none min-h-[100px]"
                    placeholder="Enter justification for waving charges..."
                    id="waiverReasonInput"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowWaiverModal(false)}
                  className="flex-1 px-4 py-3 bg-white text-[#0F172A] border border-[#E2E8F0] rounded-xl font-bold text-sm hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const reason =
                      (
                        document.getElementById(
                          "waiverReasonInput",
                        ) as HTMLTextAreaElement
                      )?.value || "No reason provided";
                    handleRequestWaiver(selectedRequest.id, reason);
                  }}
                  className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
