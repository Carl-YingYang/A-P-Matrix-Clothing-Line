import { useState, useEffect } from 'react';
import { Plus, X, AlertCircle, Eye, Pin, Clock, Scissors, ClipboardList, Save, CreditCard, UploadCloud, Trash2, Image as ImageIcon } from 'lucide-react';
import { useDialog } from '../components/DialogProvider';

interface Job {
  id: number;
  client_name: string;
  order_type: string;
  quantity: number;
  stage: string;
  deadline: string;
  reference_image?: string;
  details?: string;
  estimated_time?: string;
  amount?: number;
  pinned?: boolean; 
}

const JobQueue = () => {
  const { showAlert } = useDialog(); 

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState('All');
  
  // Modals & Tabs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<'specs' | 'timeline'>('specs');
  const [viewImageModal, setViewImageModal] = useState<string | null>(null);
  
  // Forms
  const [isUrgent, setIsUrgent] = useState(false);
  const [baseAmount, setBaseAmount] = useState(""); 
  const [sizeBreakdown, setSizeBreakdown] = useState([{ size: '', qty: '' }]);
  const [newJob, setNewJob] = useState({
    client_name: '', order_type: 'Bulk Uniforms', quantity: '', deadline: '', details: '', reference_image: ''
  });

  // Edit Timeline State
  const [editStage, setEditStage] = useState("");
  const [editEstimate, setEditEstimate] = useState("");

  const today = new Date();
  const normalMinDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];
  const urgentMinDate = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0];
  const currentMinDate = isUrgent ? urgentMinDate : normalMinDate;

  const finalAmount = isUrgent && baseAmount ? Number(baseAmount) * 1.10 : Number(baseAmount);
  const totalSizeQty = sizeBreakdown.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jobs`);
      if (res.ok) setJobs(await res.json());
    } catch (error) { console.error("Failed to fetch jobs"); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleTogglePin = (id: number) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, pinned: !job.pinned } : job));
  };

  const handleOpenJob = (job: Job) => {
    setSelectedJob(job);
    setEditStage(job.stage);
    setEditEstimate(job.estimated_time || "Standard (3-4 Weeks)");
    setActiveTab('specs');
  };

  // 💡 FIX: AUTO-SYNC "DONE" STATUS TO INQUIRY TABLE 💡
  const handleUpdateTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      // 1. Update Job Stage
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jobs/${selectedJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: editStage, estimated_time: editEstimate })
      });
      
      if (res.ok) {
        // 2. Kapag minark as "Done", sabihan din ang Inquiry system!
        if (editStage === 'Done') {
           try {
             await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries/${selectedJob.id}/complete`, {
               method: 'PATCH',
             });
           } catch(e) { console.error("Sync to inquiry failed", e); }
        }

        await fetchJobs();
        setSelectedJob(null);
        await showAlert("Updated", "Production timeline and status successfully updated.");
      } else {
        await showAlert("Error", "Failed to update timeline.");
      }
    } catch (error) {
      await showAlert("Network Error", "Please check your connection.");
    }
  };

  const handleAddSize = () => setSizeBreakdown([...sizeBreakdown, { size: '', qty: '' }]);
  const handleRemoveSize = (index: number) => setSizeBreakdown(sizeBreakdown.filter((_, i) => i !== index));
  const handleSizeChange = (index: number, field: 'size' | 'qty', value: string) => {
    const newSizes = [...sizeBreakdown];
    newSizes[index][field] = value;
    setSizeBreakdown(newSizes);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewJob({...newJob, reference_image: reader.result as string});
      reader.readAsDataURL(file);
    }
  };

  const blockInvalidChars = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', 'e', '+'].includes(e.key)) e.preventDefault();
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sizesText = sizeBreakdown.filter(s => s.size && s.qty).map(s => `${s.size}: ${s.qty} pcs`).join(' | ');
    const finalDetails = `[SIZE BREAKDOWN]\n${sizesText || 'Standard Sizing'}\n\n[INSTRUCTIONS]\n${newJob.details}`;
    const finalQuantity = totalSizeQty > 0 ? totalSizeQty : Number(newJob.quantity);

    if (finalQuantity <= 0) {
      return await showAlert("Invalid Quantity", "Total quantity must be at least 1.");
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: newJob.client_name,
          order_type: isUrgent ? `[URGENT] ${newJob.order_type}` : newJob.order_type,
          quantity: finalQuantity,
          deadline: newJob.deadline,
          details: finalDetails,
          amount: finalAmount > 0 ? finalAmount : null,
          reference_image: newJob.reference_image || null
        })
      });
      
      if (res.ok) {
        await fetchJobs();
        setIsModalOpen(false);
        setNewJob({ client_name: '', order_type: 'Bulk Uniforms', quantity: '', deadline: '', details: '', reference_image: '' });
        setBaseAmount("");
        setSizeBreakdown([{ size: '', qty: '' }]);
        setIsUrgent(false);
        await showAlert("Success", "New job has been successfully created.");
      }
    } catch (error) { await showAlert("Error", "Server connection failed."); }
  };

  const displayedJobs = jobs
    .filter(job => {
      if (filter === 'All') return true;
      if (filter === 'Active') return job.stage === 'Cutting' || job.stage === 'Sewing';
      if (filter === 'QC') return job.stage === 'QC';
      if (filter === 'Done') return job.stage === 'Done';
      if (filter === 'Urgent') return job.order_type.includes('URGENT');
      return true;
    })
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));

  return (
    <div className="space-y-5 md:space-y-6 animate-in fade-in duration-500 relative">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Production Queue</h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Manage active floor operations and deadlines.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="flex overflow-x-auto hide-scrollbar bg-gray-100 dark:bg-[#0c0c0e] p-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 w-full sm:w-auto">
            {['All', 'Active', 'QC', 'Done', 'Urgent'].map(tab => (
              <button key={tab} onClick={() => setFilter(tab)}
                className={`flex-1 px-3 md:px-4 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  filter === tab ? (tab === 'Urgent' ? 'bg-red-500 text-white shadow-sm' : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm') : 'text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-200/50 dark:hover:bg-zinc-900/50'
                }`}>
                {tab}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
          >
            <Plus size={16} className="md:w-[18px] md:h-[18px]" /> Manual Entry
          </button>
        </div>
      </div>

      {/* RESPONSIVE JOBS TABLE */}
      <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-zinc-800 rounded-xl md:rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-[#09090b] border-b border-gray-200 dark:border-zinc-800 text-[10px] md:text-[11px] uppercase tracking-wider text-gray-500 dark:text-zinc-500 font-semibold">
                <th className="px-4 md:px-5 py-4 w-10 md:w-12 text-center"></th> 
                <th className="px-4 md:px-5 py-4">Job ID</th>
                <th className="px-4 md:px-5 py-4">Client / Project</th>
                <th className="px-4 md:px-5 py-4">Volume</th>
                <th className="px-4 md:px-5 py-4">Production Stage</th>
                <th className="px-4 md:px-5 py-4 text-right">View / Action</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm">
              {displayedJobs.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 md:py-12 text-center text-gray-400 dark:text-zinc-600 font-medium">No jobs found.</td></tr>
              ) : (
              displayedJobs.map((job) => (
                <tr key={job.id} className={`border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors group ${job.pinned ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                  <td className="px-4 md:px-5 py-4 md:py-5 text-center">
                    <button onClick={() => handleTogglePin(job.id)} className={`transition-colors p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 ${job.pinned ? 'text-amber-500 drop-shadow-md' : 'text-gray-300 hover:text-amber-400 dark:text-zinc-600'}`}>
                      <Pin size={16} className={job.pinned ? 'fill-current' : ''} />
                    </button>
                  </td>
                  <td className="px-4 md:px-5 py-4 md:py-5 font-mono text-gray-500 dark:text-zinc-400 text-[11px] md:text-xs">JOB-{job.id}</td>
                  <td className="px-4 md:px-5 py-4 md:py-5">
                    <p className="font-bold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-[200px]">{job.client_name}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${job.order_type.includes('URGENT') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      {job.order_type}
                    </span>
                  </td>
                  <td className="px-4 md:px-5 py-4 md:py-5 font-mono text-gray-600 dark:text-zinc-300 text-[11px] md:text-xs">{job.quantity} pcs</td>
                  <td className="px-4 md:px-5 py-4 md:py-5">
                    <span className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold shadow-sm uppercase tracking-wide whitespace-nowrap ${
                        job.stage === 'Done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                        job.stage === 'QC' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {job.stage}
                    </span>
                  </td>
                  <td className="px-4 md:px-5 py-4 md:py-5 text-right">
                    <button 
                      onClick={() => handleOpenJob(job)} 
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black text-[10px] md:text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 md:gap-2 shadow-md active:scale-95"
                    >
                      <Eye size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Open Details</span><span className="sm:hidden">Open</span>
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= COMMAND CENTER MODAL (JOB DETAILS) ================= */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-2 md:p-4">
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden zoom-in-95 animate-in duration-200 flex flex-col max-h-[90vh] md:max-h-[85vh]">
            
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#09090b] shrink-0">
              <div className="flex justify-between items-start md:items-center mb-4">
                <div className="pr-4">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-snug">JOB-{selectedJob.id}: {selectedJob.client_name}</h3>
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-zinc-400 mt-1">Target Deadline: <span className="font-bold text-blue-500">{selectedJob.deadline}</span></p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 bg-gray-200 dark:bg-zinc-800 p-1.5 md:p-2 rounded-full shrink-0 transition-colors"><X size={18} className="md:w-5 md:h-5"/></button>
              </div>

              {/* Responsive Tabs */}
              <div className="flex overflow-x-auto hide-scrollbar gap-1 md:gap-2">
                <button onClick={() => setActiveTab('specs')} className={`px-3 py-2 md:px-4 md:py-2.5 text-[10px] md:text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'specs' ? 'bg-white dark:bg-[#0c0c0e] text-gray-900 dark:text-white border-t border-l border-r border-gray-200 dark:border-zinc-800 -mb-[1px] relative z-10' : 'text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-300'}`}>
                  <ClipboardList size={14} className="md:w-4 md:h-4"/> Specifications
                </button>
                <button onClick={() => setActiveTab('timeline')} className={`px-3 py-2 md:px-4 md:py-2.5 text-[10px] md:text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'timeline' ? 'bg-white dark:bg-[#0c0c0e] text-blue-600 dark:text-blue-400 border-t border-l border-r border-gray-200 dark:border-zinc-800 -mb-[1px] relative z-10' : 'text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-300'}`}>
                  <Clock size={14} className="md:w-4 md:h-4"/> Timeline
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* TAB 1: SPECIFICATIONS */}
              {activeTab === 'specs' && (
                <div className="space-y-5 md:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  {/* Financial Status Box */}
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3 md:p-4 rounded-xl flex items-start gap-3 md:gap-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 md:p-2.5 rounded-full shrink-0">
                      <CreditCard size={18} className="text-emerald-600 dark:text-emerald-400 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-emerald-800 dark:text-emerald-500/70 uppercase tracking-widest mb-0.5 md:mb-1">Financial Status</p>
                        <p className="text-xs md:text-sm font-bold text-emerald-900 dark:text-emerald-400">
                          {selectedJob.amount ? "Verified (Invoiced)" : "Manual Entry (No Invoice)"}
                        </p>
                      </div>
                      {selectedJob.amount && (
                        <div>
                          <p className="text-[9px] md:text-[10px] font-bold text-emerald-800 dark:text-emerald-500/70 uppercase tracking-widest mb-0.5 md:mb-1">Total Project Cost</p>
                          <p className="text-sm md:text-base font-black text-emerald-700 dark:text-emerald-300">₱{selectedJob.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 bg-gray-50 dark:bg-[#050505] p-4 md:p-5 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <div><p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Order Type</p><p className={`text-xs md:text-sm font-bold ${selectedJob.order_type.includes('URGENT') ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{selectedJob.order_type}</p></div>
                    <div><p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Quantity</p><p className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400">{selectedJob.quantity} pieces</p></div>
                  </div>
                  
                  <div>
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Scissors size={12}/> Sizes & Tailoring Instructions</p>
                    <div className="bg-amber-50/50 dark:bg-amber-950/10 p-4 md:p-5 rounded-xl border border-amber-100 dark:border-amber-900/30 text-xs md:text-sm text-gray-800 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono">
                      {selectedJob.details || "No specific sizing or tailoring details provided. Proceed with standard sizing."}
                    </div>
                  </div>

                  {selectedJob.reference_image && (
                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Design Reference</p>
                      <div className="bg-gray-50 dark:bg-[#050505] p-2 rounded-xl border border-gray-100 dark:border-zinc-800 flex justify-center relative group cursor-pointer" onClick={() => setViewImageModal(selectedJob.reference_image!)}>
                        <img src={selectedJob.reference_image} alt="Reference" className="max-h-48 md:max-h-60 object-contain rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-white text-[10px] md:text-xs font-bold gap-1.5 md:gap-2">
                          <Eye size={16} className="md:w-4 md:h-4"/> Click to Enlarge
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TIMELINE UPDATE */}
              {activeTab === 'timeline' && (
                <form onSubmit={handleUpdateTimeline} className="space-y-5 md:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-4 md:p-5 rounded-xl">
                    <h4 className="text-xs md:text-sm font-bold text-blue-800 dark:text-blue-400 mb-1">Update Progress</h4>
                    <p className="text-[10px] md:text-xs text-blue-600 dark:text-blue-300/70 leading-relaxed">Adjust the production stage and update the estimated time so the admin/client is aware of delays or speed-ups.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">Current Production Stage</label>
                    <select 
                      value={editStage} 
                      onChange={(e) => setEditStage(e.target.value)}
                      className="w-full bg-white dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 shadow-sm transition-colors"
                    >
                      <option value="Cutting">Cutting Phase (Fabric Prep)</option>
                      <option value="Sewing">Sewing Phase (Assembly)</option>
                      <option value="QC">QC Phase (Quality Control & Checking)</option>
                      <option value="Done">Done (Ready for Release/Delivery)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">Estimated Time of Completion (Range)</label>
                    <input 
                      type="text" required value={editEstimate} onChange={(e) => setEditEstimate(e.target.value)}
                      className="w-full bg-white dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-blue-500 shadow-sm transition-colors"
                      placeholder="e.g., 2-3 Weeks, or Oct 15 - Oct 20"
                    />
                  </div>

                  <div className="pt-3 md:pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                    <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 md:px-6 md:py-3 rounded-xl text-xs md:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95">
                      <Save size={16} className="md:w-[18px] md:h-[18px]"/> Save Updates
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* FULL SCREEN IMAGE VIEWER */}
      {viewImageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200 p-2 md:p-4" onClick={() => setViewImageModal(null)}>
          <div className="relative w-full max-w-4xl max-h-[95vh] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewImageModal(null)} className="absolute top-2 right-2 md:top-4 md:right-4 text-white/50 hover:text-white transition-colors bg-black/50 hover:bg-black/70 rounded-full p-2 z-10 backdrop-blur-sm">
              <X size={20} className="md:w-6 md:h-6" />
            </button>
            <img src={viewImageModal} alt="Production Reference" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-zinc-800" />
            <p className="text-white/50 text-[10px] md:text-xs tracking-widest mt-3 md:mt-4 uppercase">Design Prototype / Reference</p>
          </div>
        </div>
      )}

      {/* MANUAL ENTRY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-2 md:p-4">
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800 w-full max-w-lg max-h-[90vh] md:max-h-[85vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden zoom-in-95 animate-in duration-200 flex flex-col">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#09090b] shrink-0">
              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Manual Job Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors bg-gray-200 dark:bg-zinc-800 p-1.5 md:p-2 rounded-full"><X size={16} className="md:w-[18px] md:h-[18px]"/></button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 md:p-6 custom-scrollbar">
              <form id="newJobForm" onSubmit={handleAddJob} className="space-y-5 md:space-y-6">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">Client Name / Reference</label>
                  <input type="text" required value={newJob.client_name} onChange={(e) => setNewJob({...newJob, client_name: e.target.value})} className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" placeholder="e.g. LGU Batch 1" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">Order Type</label>
                    <select value={newJob.order_type} onChange={(e) => setNewJob({...newJob, order_type: e.target.value})} className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors">
                      <option>Bulk Uniforms</option>
                      <option>Bespoke Suit</option>
                      <option>Subcontract</option>
                      <option>School Patches</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">Total Quantity</label>
                    <input 
                      type="number" required min="1" onKeyDown={blockInvalidChars} 
                      value={totalSizeQty > 0 ? totalSizeQty : newJob.quantity} 
                      readOnly={totalSizeQty > 0}
                      onChange={(e) => { if(totalSizeQty === 0) setNewJob({...newJob, quantity: e.target.value}) }} 
                      className={`w-full border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors ${totalSizeQty > 0 ? 'bg-gray-100 dark:bg-zinc-800/50 cursor-not-allowed' : 'bg-gray-50 dark:bg-[#050505]'}`} 
                      placeholder="0" 
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#09090b] p-3 md:p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400">Size Breakdown (Optional)</label>
                    <button type="button" onClick={handleAddSize} className="text-[9px] md:text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 md:px-2 md:py-1 rounded font-bold hover:bg-blue-200 transition-colors">+ Add Size</button>
                  </div>
                  <div className="space-y-2 md:space-y-2.5">
                    {sizeBreakdown.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input type="text" placeholder="Size (e.g. Small)" value={item.size} onChange={(e) => handleSizeChange(index, 'size', e.target.value)} className="flex-1 bg-white dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-lg px-2.5 md:px-3 py-2 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" />
                        <input type="number" min="1" onKeyDown={blockInvalidChars} placeholder="Qty" value={item.qty} onChange={(e) => handleSizeChange(index, 'qty', e.target.value)} className="w-16 sm:w-20 md:w-24 bg-white dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-lg px-2 md:px-3 py-2 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" />
                        {sizeBreakdown.length > 1 && (
                          <button type="button" onClick={() => handleRemoveSize(index)} className="text-red-400 hover:text-red-600 p-1 md:p-2 transition-colors"><Trash2 size={16} className="md:w-[18px] md:h-[18px]" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  {totalSizeQty > 0 && <p className="text-[9px] md:text-[10px] font-bold text-emerald-600 dark:text-emerald-500 mt-2 text-right">Auto-computed Total: {totalSizeQty} pcs</p>}
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">Tailoring Instructions</label>
                  <textarea rows={2} required value={newJob.details} onChange={(e) => setNewJob({...newJob, details: e.target.value})} className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors resize-none" placeholder="e.g. Dark blue thread. V-neck style." />
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">Reference Image (Optional)</label>
                  {newJob.reference_image ? (
                    <div className="relative w-full h-24 md:h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-black shadow-inner">
                      <img src={newJob.reference_image} alt="Uploaded Preview" className="h-full w-full object-contain" />
                      <button type="button" onClick={() => setNewJob({...newJob, reference_image: ''})} className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1 md:p-1.5 rounded-full shadow-md backdrop-blur-sm transition-colors">
                        <X size={14} strokeWidth={3} className="md:w-4 md:h-4"/>
                      </button>
                    </div>
                  ) : (
                    <div className="relative group cursor-pointer w-full h-20 md:h-24 border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#050505] transition-colors">
                      <div className="text-center">
                        <ImageIcon size={20} className="mx-auto text-gray-400 mb-1 md:w-6 md:h-6 group-hover:scale-110 transition-transform"/>
                        <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-zinc-400">Click to upload image</p>
                      </div>
                      <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">Base Project Cost</label>
                    <div className="relative">
                      <span className="absolute left-3 md:left-4 top-2.5 md:top-3 text-gray-500 font-bold text-sm">₱</span>
                      <input 
                        type="number" min="0" onKeyDown={blockInvalidChars} value={baseAmount} onChange={(e) => setBaseAmount(e.target.value)} 
                        className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl pl-8 md:pl-9 pr-4 py-2.5 md:py-3 text-sm md:text-base font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl px-3 py-2.5 md:px-4 md:py-3 flex justify-between items-center">
                      <span className="text-[9px] md:text-[10px] font-bold text-emerald-800 dark:text-emerald-500 uppercase tracking-widest">Final Price</span>
                      <span className="text-xs md:text-sm font-black text-emerald-600 dark:text-emerald-400">₱{finalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50/50 dark:bg-red-950/10 p-3 md:p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                     <label className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400">Production Deadline</label>
                     <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer">
                        <input type="checkbox" checked={isUrgent} onChange={() => setIsUrgent(!isUrgent)} className="w-3.5 h-3.5 md:w-4 md:h-4 accent-red-600 rounded cursor-pointer" />
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-500">Urgent (+10%)</span>
                     </label>
                  </div>
                  <input 
                    type="date" required min={currentMinDate} value={newJob.deadline} onChange={(e) => setNewJob({...newJob, deadline: e.target.value})} 
                    className="w-full bg-white dark:bg-[#050505] dark:[color-scheme:dark] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" 
                  />
                  <p className="text-[9px] md:text-[10px] font-medium text-gray-500 dark:text-zinc-500 mt-1.5 md:mt-2 flex items-center gap-1">
                    <AlertCircle size={12}/> {isUrgent ? "Minimum 7 days allowance required." : "Minimum 1 month production standard."}
                  </p>
                </div>
              </form>
            </div>

            <div className="p-4 md:p-5 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#09090b] flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-4 py-2.5 md:py-2.5 text-xs md:text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
              <button type="submit" form="newJobForm" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-3 md:py-2.5 text-xs md:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center">Add to Queue</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default JobQueue;