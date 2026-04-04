import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, X, AlertOctagon, Calendar, CreditCard, Send, FileText, Lock, AlertCircle, ShieldCheck, Clock, ArrowDownWideNarrow, RefreshCw } from 'lucide-react';
import { useDialog } from '../components/DialogProvider'; 

const Inquiries = () => {
  const { showConfirm, showAlert, showLoading, hideLoading } = useDialog(); 

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [filter, setFilter] = useState('All'); 
  const [sortBy, setSortBy] = useState('Newest'); 

  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'schedule' | 'quote'>('details');
  
  const [meetingLink, setMeetingLink] = useState("https://calendly.com/carlmickynieva/a-p-design-consultation");
  const [quoteRawAmount, setQuoteRawAmount] = useState(""); 
  const [quoteDisplayAmount, setQuoteDisplayAmount] = useState(""); 
  const [quoteDescription, setQuoteDescription] = useState(""); 
  const [quoteAuth, setQuoteAuth] = useState(""); 
  
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });
  const [rejectReasonType, setRejectReasonType] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [confirmKeyword, setConfirmKeyword] = useState("");

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries`);
      if (res.ok) setInquiries(await res.json());
    } catch (error) { console.error("Error fetching inquiries", error); }
  };

  const handleSyncAll = async (isManual = false) => {
    if (isManual) showLoading("Checking PayMongo for new payments...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      const pendingCommitments = data.filter((inv: any) => inv.status === 'Pending Payment');
      const pendingDPs = data.filter((inv: any) => inv.status === 'Awaiting Downpayment');
      
      if (pendingCommitments.length === 0 && pendingDPs.length === 0) {
        hideLoading();
        if (isManual) await showAlert("Sync Complete", "All inquiries are up to date. No pending payments found.");
        return;
      }

      let newPaymentsFound = 0;

      for (const inv of pendingCommitments) {
        try {
          const syncRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries/${inv.id}/sync-commitment`, { method: 'POST' });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.status === 'paid') newPaymentsFound++;
          }
        } catch(e) {}
      }

      for (const inv of pendingDPs) {
        try {
          const syncRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries/${inv.id}/auto-sync`, { method: 'POST' });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.status === 'paid') newPaymentsFound++;
          }
        } catch(e) {}
      }

      hideLoading();
      if (newPaymentsFound > 0) {
        if (isManual) await showAlert("Sync Complete 🎉", `Successfully verified ${newPaymentsFound} new payment(s)!`);
        fetchInquiries(); 
      } else {
        if (isManual) await showAlert("Sync Complete", "No new payments detected in PayMongo.");
      }
    } catch (error) {
      hideLoading();
      if (isManual) await showAlert("Sync Error", "Failed to connect to PayMongo servers.");
    }
  };

  useEffect(() => { 
    fetchInquiries(); 
    
    const interval = setInterval(() => {
      handleSyncAll(false); 
    }, 600000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string, reason?: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejection_reason: reason || null }) 
      });
      if (res.ok) {
        await fetchInquiries(); 
        if (selectedInquiry && selectedInquiry.id === id) {
          const updated = await res.json();
          setSelectedInquiry(updated);
        }
      }
    } catch (error) { console.error("Failed to update status", error); }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');

    setQuoteRawAmount(val); 

    if (val) {
      const numberParts = val.split('.');
      numberParts[0] = numberParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setQuoteDisplayAmount(numberParts.join('.')); 
    } else {
      setQuoteDisplayAmount("");
    }
  };

  const handleSendSchedule = async (id: number) => {
    if (!meetingLink) return await showAlert("Missing Link", "Please enter a valid meeting link.");
    
    showLoading("Sending meeting schedule to client's email...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries/${id}/send-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_link: meetingLink })
      });
      
      hideLoading();
      
      if (res.ok) {
        await showAlert("Success", "Meeting link successfully sent to client's email!");
        await fetchInquiries(); 
        setSelectedInquiry(null); 
      } else { 
        await showAlert("Error", "Failed to send email. Ensure backend is running."); 
      }
    } catch (error) { 
      hideLoading();
      console.error(error); 
    }
  };

  const handleSendQuote = async (id: number) => {
    const numericAmount = Number(quoteRawAmount);
    
    if(!numericAmount || numericAmount < 1000) return await showAlert("Invalid Amount", "Minimum order value is ₱1,000.");
    if(!quoteDescription.trim()) return await showAlert("Missing Breakdown", "Please provide a breakdown or description.");
    if(quoteAuth !== 'admin') return await showAlert("Unauthorized", "Please type 'admin' to authorize this quotation.");
    
    showLoading("Generating official quotation and sending secure PayMongo link...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries/${id}/send-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numericAmount, description: quoteDescription })
      });
      
      hideLoading();

      if (res.ok) {
        const downpayment = numericAmount / 2;
        await showAlert(
          "Quotation Sent", 
          `Quotation & Payment Link sent successfully!\n\nTotal: ₱${numericAmount.toLocaleString()}\nDownpayment Required: ₱${downpayment.toLocaleString()}`
        );
        await fetchInquiries();
        setSelectedInquiry(null); 
        setQuoteRawAmount(""); setQuoteDisplayAmount(""); setQuoteDescription(""); setQuoteAuth("");
      } else {
        const errorData = await res.json();
        await showAlert("Error", errorData.detail || "Failed to send quotation.");
      }
    } catch (error) { 
      hideLoading();
      console.error(error); 
    }
  };

  const handleAcceptToProduction = async (req: any) => {
    const confirmed = await showConfirm(
      "Confirm Payment Receipt", 
      "Are you sure you have verified the payment in your PayMongo Dashboard? This will send an official e-Receipt to the client and move the job to production."
    );
    if (!confirmed) return;

    showLoading("Creating job and sending official receipt...");
    try {
      const defaultDeadline = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0];
      const createJobRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: req.full_name,
          order_type: req.service,
          quantity: req.quantity,
          deadline: defaultDeadline,
          reference_image: req.reference_image || null,
          details: req.details
        })
      });
      
      if (createJobRes.ok) {
        await handleUpdateStatus(req.id, 'Accepted');
        hideLoading();
        await showAlert("Success", "Payment verified! The job is now in the Production Queue and an official receipt has been sent to the client.");
      } else {
        hideLoading();
        await showAlert("Error", "Failed to create job in production.");
      }
    } catch (error) { 
      hideLoading();
      console.error(error); 
    }
  };

  const submitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectModal.id === null || confirmKeyword !== 'admin') return;
    const finalReason = rejectReasonType === 'Other' ? customReason : rejectReasonType;
    if (!finalReason) return await showAlert("Missing Data", "Please provide a reason for rejection.");

    showLoading("Processing rejection and issuing refund via PayMongo...");
    try {
      await handleUpdateStatus(rejectModal.id, 'Rejected', finalReason);
      await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries/${rejectModal.id}/refund`, {
        method: 'POST'
      });

      hideLoading();
      setRejectModal({ isOpen: false, id: null });
      setRejectReasonType(""); setCustomReason(""); setConfirmKeyword("");
      await showAlert("Rejected & Refunded", "The project has been rejected. The ₱1,000 commitment fee has been scheduled for refund via PayMongo.");
    } catch (error) {
      hideLoading();
      console.error(error);
    }
  };

  const getBudgetVal = (budgetStr: string) => {
    if (!budgetStr) return 0;
    if (budgetStr.includes('Above')) return 100000;
    if (budgetStr.includes('Below')) return 9999;
    const match = budgetStr.match(/\d+/g);
    if (match) return parseInt(match.join(''));
    return 0;
  };

  const displayedInquiries = inquiries.filter(inq => {
    if (filter === 'All') return true;
    return inq.status === filter;
  }).sort((a, b) => {
    if (sortBy === 'Budget') {
      return getBudgetVal(b.budget) - getBudgetVal(a.budget);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-10">
      
      {/* PAGE HEADER & FILTERS - Redesigned for Breathing Room */}
      <div className="flex flex-col gap-6">
        
        {/* Top Row: Title and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Client Inquiries</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1.5">Review, negotiate, and convert leads to production.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
            {/* SYNC BUTTON */}
            <button 
              onClick={() => handleSyncAll(true)} 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
            >
              <RefreshCw size={16}/> Sync Payments
            </button>

            {/* SORTING DROPDOWN */}
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <ArrowDownWideNarrow size={16} className="text-gray-500" />
              </div>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800/80 text-gray-700 dark:text-zinc-300 text-sm font-bold rounded-xl pl-11 pr-5 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
              >
                <option value="Newest">Sort by Newest</option>
                <option value="Budget">Sort by Budget (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Row: Filter Pills */}
        <div className="flex flex-row overflow-x-auto hide-scrollbar gap-3 w-full pb-2">
          {['All', 'New', 'Pending Payment', 'Active Inquiry', 'In Discussion', 'Awaiting Downpayment', 'Accepted', 'Rejected'].map(status => (
            <button key={status} onClick={() => setFilter(status)}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap border ${
                filter === status 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-black border-transparent shadow-md' 
                  : 'bg-white dark:bg-[#0c0c0e] text-gray-500 dark:text-zinc-500 border-gray-200 dark:border-zinc-800/80 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-700'
              }`}>
              {status === 'Awaiting Downpayment' ? 'Awaiting DP' : status === 'Pending Payment' ? 'Unpaid Fee' : status}
            </button>
          ))}
        </div>
      </div>

      {/* RESPONSIVE TABLE WRAPPER - More padding and cleaner borders */}
      <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-[#09090b] border-b border-gray-100 dark:border-zinc-800/80 text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-zinc-500">
                <th className="px-6 py-5 font-bold">Request ID</th>
                <th className="px-6 py-5 font-bold">Client Details</th>
                <th className="px-6 py-5 font-bold">Service & Budget</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
                {displayedInquiries.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400 dark:text-zinc-600 font-medium">No inquiries found.</td></tr>
              ) : (
              displayedInquiries.map((req) => (
                <tr key={req.id} className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                  <td className="px-6 py-6 font-mono text-gray-500 dark:text-zinc-400 font-medium text-xs">REQ-{req.id}</td>
                  <td className="px-6 py-6">
                    <p className="font-bold text-gray-900 dark:text-white truncate max-w-[180px]">{req.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 truncate max-w-[180px]">{req.company !== 'N/A' ? req.company : 'Individual Client'}</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className="font-semibold text-gray-700 dark:text-zinc-300 block truncate max-w-[180px]">{req.service}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mt-1 block">{req.budget}</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap tracking-wide ${
                      req.status === 'New' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30' :
                      req.status === 'In Discussion' || req.status === 'Active Inquiry' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/10 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30' :
                      req.status === 'Awaiting Downpayment' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30' :
                      req.status === 'Pending Payment' ? 'bg-gray-100 text-gray-700 dark:bg-zinc-800/50 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700/50' :
                      req.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' :
                      'bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400 border border-red-200 dark:border-red-900/30'
                    }`}>
                      {req.status === 'Awaiting Downpayment' ? 'Awaiting DP' : req.status === 'Pending Payment' ? 'Unpaid Fee' : req.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedInquiry(req); setActiveTab('details'); }} 
                        className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm active:scale-95"
                      >
                        <Eye size={16} /> 
                        <span className="hidden sm:inline">View / Action</span>
                        <span className="sm:hidden">View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMMAND CENTER MODAL - Made larger and more spacious */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 p-4 md:p-6">
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800/80 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden zoom-in-95 animate-in duration-200 flex flex-col max-h-[90vh]">
            
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-[#09090b] shrink-0">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Inquiry: REQ-{selectedInquiry.id}</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1.5 font-medium">Current Status: <span className="font-bold text-blue-500 dark:text-blue-400">{selectedInquiry.status}</span></p>
                </div>
                <button onClick={() => setSelectedInquiry(null)} className="text-gray-400 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white bg-gray-200/50 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 p-2.5 rounded-full transition-colors shrink-0"><X size={20} /></button>
              </div>

              {/* RESPONSIVE TABS - Cleaner look */}
              <div className="flex overflow-x-auto hide-scrollbar gap-2">
                <button onClick={() => setActiveTab('details')} className={`px-5 py-3 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap ${activeTab === 'details' ? 'bg-white dark:bg-[#0c0c0e] text-gray-900 dark:text-white border-t border-l border-r border-gray-200 dark:border-zinc-800/80 -mb-[1px] relative z-10' : 'text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-white/50 dark:hover:bg-zinc-900/50'}`}>
                  Client Details
                </button>
                <button onClick={() => setActiveTab('schedule')} className={`px-5 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'schedule' ? 'bg-white dark:bg-[#0c0c0e] text-blue-600 dark:text-blue-400 border-t border-l border-r border-gray-200 dark:border-zinc-800/80 -mb-[1px] relative z-10' : 'text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-white/50 dark:hover:bg-zinc-900/50'}`}>
                  <Calendar size={16} /> Schedule
                </button>
                <button onClick={() => setActiveTab('quote')} className={`px-5 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'quote' ? 'bg-white dark:bg-[#0c0c0e] text-emerald-600 dark:text-emerald-400 border-t border-l border-r border-gray-200 dark:border-zinc-800/80 -mb-[1px] relative z-10' : 'text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-white/50 dark:hover:bg-zinc-900/50'}`}>
                  <CreditCard size={16} /> Quote & Pay
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* TAB 1: DETAILS */}
              {activeTab === 'details' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {selectedInquiry.status === 'Rejected' && selectedInquiry.rejection_reason && (
                    <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-start gap-4">
                      <div className="bg-red-100 dark:bg-red-900/50 p-2.5 rounded-full shrink-0">
                         <AlertOctagon size={20} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-widest mb-1.5">Reason for Rejection</p>
                        <p className="text-sm font-medium text-red-900 dark:text-red-300 leading-relaxed">{selectedInquiry.rejection_reason}</p>
                      </div>
                    </div>
                  )}

                  {/* 3-COLUMN GRID FOR BETTER SPREAD */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-gray-50/50 dark:bg-[#050505] p-6 rounded-2xl border border-gray-100 dark:border-zinc-800/80">
                    <div><p className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Client Name</p><p className="text-sm font-bold text-gray-900 dark:text-white">{selectedInquiry.full_name}</p></div>
                    <div><p className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Company</p><p className="text-sm font-bold text-gray-900 dark:text-white">{selectedInquiry.company}</p></div>
                    <div><p className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Email</p><p className="text-sm font-bold text-gray-900 dark:text-white break-all">{selectedInquiry.email}</p></div>
                    <div><p className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Phone</p><p className="text-sm font-bold text-gray-900 dark:text-white">{selectedInquiry.phone}</p></div>
                    <div><p className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Service</p><p className="text-sm font-bold text-gray-900 dark:text-white">{selectedInquiry.service}</p></div>
                    <div><p className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Volume & Budget</p><p className="text-sm font-bold text-emerald-600 dark:text-emerald-500">{selectedInquiry.quantity} pcs ({selectedInquiry.budget})</p></div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-3">Project Specifications</p>
                    <div className="bg-gray-50 dark:bg-[#050505] p-5 rounded-2xl border border-gray-100 dark:border-zinc-800/80 text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono">
                      {selectedInquiry.details}
                    </div>
                  </div>

                  {selectedInquiry.reference_image && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-3">Design Reference</p>
                      <div className="bg-gray-50 dark:bg-[#050505] p-3 rounded-2xl border border-gray-100 dark:border-zinc-800/80 flex justify-center overflow-hidden">
                        <img src={selectedInquiry.reference_image} alt="Reference" className="max-h-72 w-full object-contain rounded-xl" />
                      </div>
                    </div>
                  )}

                  {/* ACTION FOOTER */}
                  {(selectedInquiry.status === 'New' || selectedInquiry.status === 'In Discussion' || selectedInquiry.status === 'Pending Payment' || selectedInquiry.status === 'Active Inquiry') && (
                    <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                      <button onClick={() => setRejectModal({ isOpen: true, id: selectedInquiry.id })} className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-bold transition-colors flex items-center gap-2 px-5 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl">
                        <XCircle size={18} /> Reject Project
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-6 rounded-2xl">
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-400 mb-2">Automated Booking Link</h4>
                    <p className="text-xs text-blue-800 dark:text-blue-300/70 leading-relaxed">Send your Calendly link so the client can pick a time that works for both of you.</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-3">Your Booking Link (Calendly / Zoom)</label>
                    <input type="url" readOnly value={meetingLink} className="w-full bg-gray-100 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-5 py-4 text-sm text-gray-500 dark:text-zinc-500 outline-none cursor-not-allowed" />
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                    <button onClick={() => handleSendSchedule(selectedInquiry.id)} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                      <Send size={18} /> Send Invite via Email
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: QUOTATION & PAYMENT */}
              {activeTab === 'quote' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  {/* ====== SCENARIO 0: PENDING PAYMENT ====== */}
                  {selectedInquiry.status === 'Pending Payment' && (
                    <div className="text-center py-16 px-6 bg-gray-50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-zinc-800/80">
                      <div className="bg-amber-100 dark:bg-amber-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock size={32} className="text-amber-600 dark:text-amber-500" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Awaiting ₱1,000 Commitment Fee</h4>
                      <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed mb-8">
                        The system checks for payments automatically. You can manually verify if the client has informed you they paid.
                      </p>
                      <button 
                        onClick={async () => {
                          showLoading("Checking PayMongo servers...");
                          try {
                            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries/${selectedInquiry.id}/sync-commitment`, { method: 'POST' });
                            const data = await res.json();
                            hideLoading();
                            if (res.ok && data.status === 'paid') {
                              await showAlert("Verified! 🎉", "Commitment fee paid! You can now generate their quotation.");
                              fetchInquiries();
                              setSelectedInquiry({...selectedInquiry, status: 'Active Inquiry'});
                            } else {
                              await showAlert("Still Unpaid", "The client has not completed the checkout process yet.");
                            }
                          } catch (e) { hideLoading(); await showAlert("Error", "Network issue."); }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 inline-flex items-center gap-2"
                      >
                        <RefreshCw size={18} /> Verify via PayMongo
                      </button>
                    </div>
                  )}

                  {/* ====== SCENARIO 1: AWAITING DOWNPAYMENT ====== */}
                  {selectedInquiry.status === 'Awaiting Downpayment' && (
                    <div className="bg-white dark:bg-[#050505] border border-gray-200 dark:border-zinc-800/80 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                      <div className="bg-gray-50 dark:bg-[#09090b] p-6 md:p-8 border-b border-gray-100 dark:border-zinc-800/80 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                          <div>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
                              <FileText size={20} className="text-amber-500"/> Official Quotation
                            </h4>
                            <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1.5">Ref: REQ-{selectedInquiry.id}</p>
                          </div>
                          <span className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                            Awaiting Payment
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6 md:p-8 space-y-6 relative z-10">
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-5 rounded-2xl flex items-start gap-4">
                          <div className="bg-blue-100 dark:bg-blue-900/50 p-2.5 rounded-full shrink-0">
                            <AlertCircle size={20} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1.5">Action Required: Verify Payment</h5>
                            <p className="text-xs text-blue-800 dark:text-blue-400/80 leading-relaxed">
                              Please check your <strong>PayMongo Dashboard</strong> to confirm if the downpayment of <strong className="font-black text-blue-600 dark:text-blue-300 text-sm">₱{selectedInquiry.quoted_amount ? (Number(selectedInquiry.quoted_amount) / 2).toLocaleString() : "TBD"}</strong> has been received. If yes, click the button below.
                            </p>
                          </div>
                        </div>

                        <div className="border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 bg-white dark:bg-[#0c0c0e]">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Cost Breakdown</p>
                          <div className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono">
                            {selectedInquiry.quote_description || "Breakdown details have been emailed to the client."}
                          </div>
                          <hr className="my-6 border-dashed border-gray-200 dark:border-zinc-800/80" />
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-bold text-gray-500 dark:text-zinc-400">Total Project Cost</span>
                              <span className="font-black text-gray-900 dark:text-white text-base">₱{selectedInquiry.quoted_amount ? Number(selectedInquiry.quoted_amount).toLocaleString() : "TBD"}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-gray-100 dark:border-zinc-800/80">
                              <span className="font-bold text-emerald-700 dark:text-emerald-500 text-sm">Required Downpayment (50%)</span>
                              <span className="font-black text-emerald-600 dark:text-emerald-400 text-xl">₱{selectedInquiry.quoted_amount ? (Number(selectedInquiry.quoted_amount) / 2).toLocaleString() : "TBD"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-[#09090b] p-6 md:p-8 border-t border-gray-100 dark:border-zinc-800/80">
                        <button onClick={() => handleAcceptToProduction(selectedInquiry)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                          <CheckCircle size={20} className="shrink-0"/> <span>I Confirm Payment Received: Move to Production</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ====== SCENARIO 2: ACCEPTED (DIGITAL RECEIPT UI) ====== */}
                  {selectedInquiry.status === 'Accepted' && (
                    <div className="border border-gray-200 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-xl bg-white dark:bg-[#0c0c0e]">
                      <div className="bg-[#111827] text-white p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-bl-full pointer-events-none"></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-6">
                            <span className="bg-white text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                              <ShieldCheck size={14}/> Verified Receipt
                            </span>
                            <CheckCircle size={32} className="text-emerald-400" />
                          </div>
                          <h4 className="text-2xl font-black text-white">Receipt from A&P Clothing</h4>
                          <p className="text-xs text-gray-400 font-mono mt-1.5 tracking-widest uppercase">Invoice #REQ-{selectedInquiry.id}PM</p>
                        </div>
                      </div>

                      <div className="p-8 space-y-8">
                        <div className="text-center bg-gray-50 dark:bg-[#09090b] p-8 rounded-2xl border border-gray-100 dark:border-zinc-800/80">
                          <p className="text-xs text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-widest mb-2">Amount Paid (50% DP)</p>
                          <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                            ₱{selectedInquiry.quoted_amount ? (Number(selectedInquiry.quoted_amount) / 2).toLocaleString() : "0.00"}
                          </p>
                        </div>

                        <hr className="border-dashed border-gray-200 dark:border-zinc-800/80" />

                        <div className="space-y-6">
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-widest mb-1.5">Transaction description</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">50% Downpayment for {selectedInquiry.service} (REQ-{selectedInquiry.id})</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/50 dark:bg-[#050505] p-6 rounded-2xl border border-gray-100 dark:border-zinc-800/50">
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-widest mb-1.5">Billed to</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedInquiry.full_name}</p>
                              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 truncate">{selectedInquiry.email}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-widest mb-1.5">Payment method</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><CreditCard size={16} className="text-emerald-500"/> PayMongo Link</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-5 rounded-xl text-center">
                          <p className="text-xs font-bold text-blue-800 dark:text-blue-300">This job is now active in the Job Queue.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ====== SCENARIO 3: NEW OR ACTIVE / FORM VIEW ====== */}
                  {(selectedInquiry.status === 'New' || selectedInquiry.status === 'Active Inquiry' || selectedInquiry.status === 'In Discussion') && !selectedInquiry.quoted_amount && (
                    <>
                      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 p-5 rounded-2xl">
                        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 mb-1.5">Generate Quotation & Invoice</h4>
                        <p className="text-xs text-emerald-800 dark:text-emerald-300/70 leading-relaxed">Provide a cost breakdown. The system will auto-calculate the 50% downpayment required to start production.</p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
                            <FileText size={16} /> Cost Breakdown / Description <span className="text-red-500">*</span>
                          </label>
                          <textarea 
                            rows={4} required value={quoteDescription} onChange={(e) => setQuoteDescription(e.target.value)}
                            placeholder="E.g. Fabric Cost: ₱15,000&#10;Labor & Customization: ₱10,000"
                            className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800/80 rounded-xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed transition-all shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-3">Total Project Cost (Min. ₱1,000) <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <span className="absolute left-4 top-3.5 text-gray-500 font-bold text-base">₱</span>
                            <input 
                              type="text" required value={quoteDisplayAmount} onChange={handleAmountChange} 
                              className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800/80 rounded-xl pl-10 pr-4 py-3.5 text-lg font-bold text-gray-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm" placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 p-5 rounded-2xl mt-6">
                          <label className="block text-[10px] font-bold text-red-800 dark:text-red-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Lock size={14}/> Admin Authorization</label>
                          <input 
                            type="password" placeholder="Type 'admin' to authorize" value={quoteAuth} onChange={(e) => setQuoteAuth(e.target.value)}
                            className="w-full bg-white dark:bg-[#050505] border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                        <button 
                          onClick={() => handleSendQuote(selectedInquiry.id)} 
                          disabled={quoteAuth !== 'admin' || Number(quoteRawAmount) < 1000}
                          className={`w-full md:w-auto px-8 py-3.5 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${quoteAuth === 'admin' && Number(quoteRawAmount) >= 1000 ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' : 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'}`}
                        >
                          <CreditCard size={18} /> Send Quotation
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* STRICT REJECT MODAL - More Space */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800/80 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden zoom-in-95 animate-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-[#09090b]">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-500">Reject Inquiry</h3>
              <button onClick={() => { setRejectModal({isOpen: false, id: null}); setConfirmKeyword(""); setRejectReasonType(""); }} className="text-gray-400 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={submitReject} className="p-6 space-y-6">
              <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-100 dark:border-red-900/30">
                 <label className="block text-[10px] font-bold text-red-800 dark:text-red-400 uppercase tracking-widest mb-3">Type "admin" to authorize rejection</label>
                 <input type="text" required value={confirmKeyword} onChange={(e) => setConfirmKeyword(e.target.value)} className="w-full bg-white dark:bg-[#050505] border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-sm" placeholder="admin"/>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-3">Reason for rejection</label>
                <select required value={rejectReasonType} onChange={(e) => setRejectReasonType(e.target.value)} className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800/80 rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-sm cursor-pointer">
                  <option value="" disabled hidden>Select a reason...</option>
                  <option value="Production Capacity Full">Production capacity is currently full.</option>
                  <option value="Technical Difficulty">Design is too technically difficult/complex.</option>
                  <option value="Pricing Mismatch">Budget/Pricing mismatch.</option>
                  <option value="Timeline Too Short">Requested timeline is unrealistic.</option>
                  <option value="Other">Other (Type custom reason)...</option>
                </select>
              </div>

              {rejectReasonType === 'Other' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <textarea required value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Please specify the exact reason for rejection..." className="w-full h-28 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none shadow-sm"/>
                </div>
              )}

              <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100 dark:border-zinc-800/80">
                <button type="button" onClick={() => { setRejectModal({isOpen: false, id: null}); setConfirmKeyword(""); }} className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={confirmKeyword !== 'admin'} className={`w-full sm:w-auto px-8 py-3 text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.98] ${confirmKeyword === 'admin' ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20' : 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'}`}>Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;