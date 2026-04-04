import { useState, useEffect } from 'react';
import { Search, RefreshCw, CheckCircle, Clock, X, FileText, Download } from 'lucide-react';
import { useDialog } from '../components/DialogProvider';

const Invoices = () => {
  const { showConfirm, showAlert, showLoading, hideLoading } = useDialog();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries`);
      if (res.ok) {
        const data = await res.json();
        const invoiceData = data.filter((item: any) => item.quoted_amount !== null);
        setInvoices(invoiceData);
      }
    } catch (error) { 
      console.error("Error fetching invoices"); 
    }
  };

  const handleSyncAll = async (isManual = false) => {
    if (isManual) showLoading("Syncing all PayMongo invoices..."); 
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const invoiceData = data.filter((item: any) => item.quoted_amount !== null);
      
      const unpaid = invoiceData.filter((inv: any) => inv.status === 'Awaiting Downpayment');
      
      if (unpaid.length === 0) {
        hideLoading();
        if (isManual) await showAlert("Sync Complete", "All invoices are up to date.");
        return;
      }

      let newPaymentsFound = 0;

      for (const inv of unpaid) {
        const syncRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries/${inv.id}/auto-sync`, { method: 'POST' });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.status === 'paid') {
            newPaymentsFound++;
          }
        }
      }

      hideLoading(); 
      if (newPaymentsFound > 0) {
        if (isManual) await showAlert("Sync Complete 🎉", `Verified ${newPaymentsFound} new payment(s)!`);
        window.dispatchEvent(new Event('matrix_system_update'));
      } else {
        if (isManual) await showAlert("Sync Complete", "No new payments found.");
      }

      fetchInvoices();
    } catch (error) {
      hideLoading();
      if (isManual) await showAlert("Sync Error", "Failed to connect to PayMongo.");
    }
  };

  useEffect(() => {
    fetchInvoices(); 
    const interval = setInterval(() => {
      handleSyncAll(false); 
    }, 600000); 

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSyncPayMongo = async (id: number) => {
    showLoading("Verifying payment status..."); 
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries/${id}/auto-sync`, { method: 'POST' });
      const data = await res.json();
      
      hideLoading(); 
      if (res.ok) {
        if (data.status === 'paid') {
          await showAlert("Payment Verified! 🎉", data.message);
          fetchInvoices(); 
          if (selectedInvoice && selectedInvoice.id === id) {
            setSelectedInvoice({...selectedInvoice, status: 'Accepted', payment_date: new Date()});
          }
          window.dispatchEvent(new Event('matrix_system_update'));
        } else {
          await showAlert("Status: Unpaid", "Client hasn't completed the payment yet.");
        }
      } else {
        await showAlert("Error", data.detail || "Failed to sync.");
      }
    } catch (error) {
      hideLoading();
      await showAlert("Error", "Network connection failed.");
    }
  };

  const handleRefund = async (id: number) => {
    const confirmed = await showConfirm(
      "Process Refund", 
      "Are you sure you want to refund this payment? This will mark the invoice as Refunded and cancel the order."
    );
    if (!confirmed) return;

    showLoading("Processing secure refund..."); 
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries/${id}/refund`, { method: 'POST' });
      hideLoading(); 
      if (res.ok) {
        await showAlert("Refund Successful", "The payment has been refunded.");
        fetchInvoices(); 
        setSelectedInvoice(null); 
        window.dispatchEvent(new Event('matrix_system_update'));
      }
    } catch (error) { 
      hideLoading();
      await showAlert("Error", "Network connection failed."); 
    }
  };

  const displayedInvoices = invoices.filter(inv => {
    const matchesSearch = inv.full_name.toLowerCase().includes(search.toLowerCase()) || inv.id.toString().includes(search);
    if (filter === 'All') return matchesSearch;
    if (filter === 'Paid') return matchesSearch && inv.status === 'Accepted';
    if (filter === 'Unpaid') return matchesSearch && inv.status === 'Awaiting Downpayment';
    if (filter === 'Refunded') return matchesSearch && inv.status === 'Refunded';
    return matchesSearch;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-5 md:space-y-6 animate-in fade-in duration-500 relative">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Invoices & Payments</h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 mt-0.5 md:mt-1">Track payments, sync with PayMongo, and view receipts.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* SEARCH BAR */}
          <div className="flex items-center bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 md:px-4 py-2.5 md:py-2 w-full sm:w-64 transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 shadow-sm">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input 
              type="text" placeholder="Search client..." value={search} onChange={(e) => setSearch(e.target.value)} 
              className="w-full bg-transparent border-none outline-none text-xs md:text-sm ml-2 text-gray-900 dark:text-white placeholder-gray-500" 
            />
          </div>

          {/* SYNC ALL BUTTON */}
          <button 
            onClick={() => handleSyncAll(true)} 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <RefreshCw size={14} className="md:w-4 md:h-4"/> Sync PayMongo
          </button>

          {/* FILTER BUTTONS */}
          <div className="flex overflow-x-auto hide-scrollbar bg-gray-100 dark:bg-[#0c0c0e] p-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 w-full sm:w-auto">
            {['All', 'Unpaid', 'Paid', 'Refunded'].map(tab => (
              <button 
                key={tab} onClick={() => setFilter(tab)}
                className={`flex-1 px-3 md:px-4 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  filter === tab 
                  ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-200/50 dark:hover:bg-zinc-900/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESPONSIVE TABLE CARD */}
      <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-zinc-800 rounded-xl md:rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-[#09090b] border-b border-gray-200 dark:border-zinc-800 text-[10px] md:text-[11px] uppercase tracking-wider text-gray-500 dark:text-zinc-500 font-semibold">
                <th className="px-4 md:px-6 py-4">Invoice ID</th>
                <th className="px-4 md:px-6 py-4">Client</th>
                <th className="px-4 md:px-6 py-4">Amount (50%)</th>
                <th className="px-4 md:px-6 py-4">Date Issued</th>
                <th className="px-4 md:px-6 py-4">Status</th>
                <th className="px-4 md:px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm">
              {displayedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 md:py-12 text-center text-gray-400 dark:text-zinc-600 font-medium">
                    No invoices found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayedInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-4 md:px-6 py-4 md:py-5 font-mono text-gray-500 dark:text-zinc-400 text-[11px] md:text-xs">
                      #{inv.invoice_id || `REQ-${inv.id}PM`}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-5 font-bold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-xs">
                      {inv.full_name}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-5 font-bold text-emerald-600 dark:text-emerald-400">
                      ₱{(inv.quoted_amount / 2).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-5 text-gray-500 dark:text-zinc-400 text-[11px] md:text-xs">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 md:gap-1.5 w-max border ${
                            inv.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                            inv.status === 'Refunded' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                        }`}>
                          {inv.status === 'Accepted' ? <CheckCircle size={12}/> : inv.status === 'Refunded' ? <RefreshCw size={12}/> : <Clock size={12}/>}
                          {inv.status === 'Accepted' ? 'Paid' : inv.status === 'Refunded' ? 'Refunded' : 'Unpaid'}
                        </span>
                        
                        {inv.status === 'Awaiting Downpayment' && (
                          <button 
                            onClick={() => handleSyncPayMongo(inv.id)} 
                            className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-95" 
                            title="Sync this invoice"
                          >
                            <RefreshCw size={12} className="md:w-3.5 md:h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-5 text-right">
                      <button 
                        onClick={() => setSelectedInvoice(inv)} 
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black text-[10px] md:text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5 md:gap-2 shadow-md active:scale-95"
                      >
                        <FileText size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">View Details</span><span className="sm:hidden">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= RECEIPT / DETAILS MODAL ================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-md max-h-[90vh] md:max-h-[85vh] flex flex-col rounded-2xl md:rounded-3xl relative shadow-2xl animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setSelectedInvoice(null)} 
              className="absolute top-3 right-3 md:top-4 md:right-4 text-white/50 hover:text-white transition-colors bg-black/30 hover:bg-black/50 rounded-full p-1.5 md:p-2 z-50 backdrop-blur-sm"
            >
              <X size={16} className="md:w-[18px] md:h-[18px]" />
            </button>

            <div className="bg-white dark:bg-[#0c0c0e] w-full rounded-2xl md:rounded-3xl overflow-hidden font-sans border border-gray-200 dark:border-zinc-800 flex flex-col max-h-full">
              
              {/* Receipt Header */}
              <div className="bg-gray-900 dark:bg-[#161618] p-6 md:p-8 text-white relative shrink-0">
                {selectedInvoice.status === 'Awaiting Downpayment' && (
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
                )}
                {selectedInvoice.status === 'Accepted' && (
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                )}
                {selectedInvoice.status === 'Refunded' && (
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
                )}
                
                <span className="bg-white/10 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2.5 md:px-3 py-1 rounded-full mb-4 md:mb-6 inline-block backdrop-blur-sm border border-white/5">
                  {selectedInvoice.status === 'Accepted' ? 'Verified Receipt' : selectedInvoice.status === 'Refunded' ? 'Refunded' : 'Pending Payment'}
                </span>
                
                <p className="text-xs md:text-sm text-gray-400 mb-0.5 md:mb-1 font-medium">Billed by</p>
                <h2 className="text-lg md:text-xl font-bold tracking-wide">A&P Clothing Line</h2>
                <p className="mt-1 md:mt-2 text-[10px] md:text-xs text-gray-500 font-mono">INV-{selectedInvoice.invoice_id || `REQ-${selectedInvoice.id}PM`}</p>
              </div>

              {/* Receipt Content (Scrollable) */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex justify-between items-end mb-6 md:mb-8">
                  <div className="pr-4">
                    <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-bold mb-1">Billed to</p>
                    <p className="text-sm md:text-base text-gray-900 dark:text-white font-black truncate max-w-[150px] sm:max-w-[200px]">{selectedInvoice.full_name}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-zinc-500 mt-0.5 truncate max-w-[150px] sm:max-w-[200px]">{selectedInvoice.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-bold mb-1">Amount Due</p>
                    <p className={`text-xl md:text-2xl font-black ${selectedInvoice.status === 'Accepted' ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                      ₱{(selectedInvoice.quoted_amount / 2).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 md:space-y-4 border-t border-b border-gray-100 dark:border-zinc-800 py-5 md:py-6 mb-6">
                  <div className="flex justify-between items-start text-xs md:text-sm gap-4">
                    <span className="text-gray-500 dark:text-zinc-400 font-medium shrink-0">Description</span>
                    <span className="text-gray-900 dark:text-white font-bold text-right leading-snug">
                      50% Downpayment for {selectedInvoice.service}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs md:text-sm gap-4">
                    <span className="text-gray-500 dark:text-zinc-400 font-medium shrink-0">Date Issued</span>
                    <span className="text-gray-900 dark:text-white font-bold text-right">
                      {new Date(selectedInvoice.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs md:text-sm gap-4">
                    <span className="text-gray-500 dark:text-zinc-400 font-medium shrink-0">Payment Method</span>
                    <span className="text-gray-900 dark:text-white font-bold text-right">
                      {selectedInvoice.payment_method || 'PayMongo Checkout'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 md:gap-3">
                  {selectedInvoice.status === 'Awaiting Downpayment' && (
                    <button 
                      onClick={() => handleSyncPayMongo(selectedInvoice.id)} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <RefreshCw size={14} className="md:w-4 md:h-4"/> Verify PayMongo Status
                    </button>
                  )}

                  {selectedInvoice.status === 'Accepted' && (
                    <div className="flex gap-2 md:gap-3">
                      <button 
                        onClick={() => window.print()} 
                        className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-colors flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Download size={14} className="md:w-4 md:h-4"/> Download PDF
                      </button>
                      <button 
                        onClick={() => handleRefund(selectedInvoice.id)} 
                        className="bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-colors flex items-center justify-center active:scale-95 shrink-0"
                        title="Process Refund"
                      >
                        <RefreshCw size={14} className="md:w-4 md:h-4"/>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="bg-gray-50 dark:bg-[#161618] p-3 md:p-4 text-center border-t border-gray-200 dark:border-zinc-800 shrink-0">
                <p className="text-[9px] md:text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                  Secured by PayMongo
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;