import AIAssistant from '../components/AIAssistant';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Briefcase, Clock, Users, DollarSign, ArrowUpRight, Sparkles, PackageOpen, AlertTriangle, CreditCard, ChevronRight, Info, X, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState('Yearly');
  const [isLoading, setIsLoading] = useState(true);
  
  // Dedicated Full-Screen AI State
  const [isAIFullScreenOpen, setIsAIFullScreenOpen] = useState(false);

  // Modal State for Data Evaluation
  const [drillDown, setDrillDown] = useState<{ isOpen: boolean, title: string, data: any[], type: string }>({
    isOpen: false, title: '', data: [], type: ''
  });

  const [stats, setStats] = useState({
    total_projects: 0, job_list: [],
    total_clients: 0, client_list: [],
    expected_revenue: 0, revenue_list: [],
    production_days_left: 0, workload_list: [],
    progress_data: [], chart_data: [],
    alerts: { low_stock: 0, pending_inquiries: 0, unpaid_invoices: 0 }
  });

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) { console.error("Failed to load dashboard data:", error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); 
    return () => clearInterval(interval);
  }, []);

  const openDrillDown = (title: string, data: any[], type: string) => {
    setDrillDown({ isOpen: true, title, data, type });
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-blue-500 text-sm md:text-base font-bold animate-pulse">Syncing Matrix Data...</div>;
  }

  return (
    <div className="space-y-5 md:space-y-6 animate-in fade-in duration-500 relative pb-10">
      
      {/* PAGE HEADER WITH DEDICATED AI LAUNCH BUTTON */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">System Overview</h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 mt-0.5">A&P Clothing Line - Live Production Matrix</p>
        </div>
        
        {/* PREMIUM AI COMMAND CENTER BUTTON */}
        <button 
          onClick={() => setIsAIFullScreenOpen(true)}
          className="w-full sm:w-auto relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs md:text-sm font-medium rounded-xl group bg-gradient-to-br from-indigo-500 to-blue-600 hover:text-white dark:text-white focus:ring-2 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all active:scale-95"
        >
          <span className="relative w-full sm:w-auto px-4 py-2.5 md:px-5 md:py-2.5 transition-all ease-in duration-75 bg-white dark:bg-[#0c0c0e] rounded-[10px] group-hover:bg-opacity-0 flex items-center justify-center gap-2 text-gray-900 dark:text-white group-hover:text-white font-bold">
            <Sparkles size={16} className="text-indigo-500 group-hover:text-white transition-colors" />
            Launch Matrix AI
          </span>
        </button>
      </div>

      {/* 4 CLICKABLE STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div onClick={() => openDrillDown("Total Gross Revenue Breakdown", stats.revenue_list, 'revenue')} className="bg-white dark:bg-[#0c0c0e] p-5 md:p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-zinc-800 transition-all hover:border-emerald-500 hover:shadow-lg cursor-pointer group">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <p className="text-gray-500 dark:text-zinc-400 text-xs md:text-sm font-medium flex items-center gap-1.5">
              Total Gross Revenue <Info size={14} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
            </p>
            <div className="p-1.5 md:p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-110 transition-transform"><DollarSign size={18} className="md:w-5 md:h-5" /></div>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-1.5 md:mb-2 truncate">₱{stats.expected_revenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
          <p className="text-[10px] md:text-xs font-bold flex items-center text-emerald-500"><ArrowUpRight size={14} className="mr-1"/> Click to view list</p>
        </div>

        <div onClick={() => openDrillDown("All Job Orders List", stats.job_list, 'jobs')} className="bg-white dark:bg-[#0c0c0e] p-5 md:p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-zinc-800 transition-all hover:border-blue-500 hover:shadow-lg cursor-pointer group">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <p className="text-gray-500 dark:text-zinc-400 text-xs md:text-sm font-medium flex items-center gap-1.5">
              Total Job Orders <Info size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
            </p>
            <div className="p-1.5 md:p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform"><Briefcase size={18} className="md:w-5 md:h-5" /></div>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-1.5 md:mb-2">{stats.total_projects}</h3>
          <p className="text-[10px] md:text-xs font-bold flex items-center text-blue-500"><ArrowUpRight size={14} className="mr-1"/> Click to view list</p>
        </div>

        <div onClick={() => openDrillDown("Pending Workload Deadlines", stats.workload_list, 'workload')} className="bg-white dark:bg-[#0c0c0e] p-5 md:p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-zinc-800 transition-all hover:border-purple-500 hover:shadow-lg cursor-pointer group">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <p className="text-gray-500 dark:text-zinc-400 text-xs md:text-sm font-medium flex items-center gap-1.5">
              Production Workload <Info size={14} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
            </p>
            <div className="p-1.5 md:p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform"><Clock size={18} className="md:w-5 md:h-5" /></div>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-1.5 md:mb-2">{stats.production_days_left.toLocaleString()} <span className="text-sm md:text-base font-bold text-gray-400">Days</span></h3>
          <p className="text-[10px] md:text-xs font-bold flex items-center text-purple-500">Total days left on active queue</p>
        </div>

        <div onClick={() => openDrillDown("Unique Registered Clients", stats.client_list, 'clients')} className="bg-white dark:bg-[#0c0c0e] p-5 md:p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-zinc-800 transition-all hover:border-orange-500 hover:shadow-lg cursor-pointer group">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <p className="text-gray-500 dark:text-zinc-400 text-xs md:text-sm font-medium flex items-center gap-1.5">
              Unique Clients <Info size={14} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
            </p>
            <div className="p-1.5 md:p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg group-hover:scale-110 transition-transform"><Users size={18} className="md:w-5 md:h-5" /></div>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-1.5 md:mb-2">{stats.total_clients}</h3>
          <p className="text-[10px] md:text-xs font-bold flex items-center text-orange-500"><ArrowUpRight size={14} className="mr-1"/> Click to view list</p>
        </div>
      </div>

      {/* ROW 2: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* BAR CHART */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0e] p-4 md:p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">Monthly Production Volume</h3>
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-zinc-500 mt-0.5 md:mt-1">Number of active jobs due per month</p>
            </div>
          </div>
          <div className="h-64 md:h-72 w-full -ml-4 md:ml-0"> {/* Slight negative margin on mobile to fit Y-axis better */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800/50" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} md:fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} md:fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #2a2a2b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', backgroundColor: '#161618', color: '#fff', fontWeight: 'bold' }} 
                  formatter={(value: any) => [`${value} Job Orders`, 'Volume Due']}
                  labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#4f46e5" 
                  radius={[6, 6, 6, 6]} 
                  barSize={24} // Thinner bar for mobile
                  animationDuration={1500} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white dark:bg-[#0c0c0e] p-4 md:p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-zinc-800 flex flex-col">
          <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-4 md:mb-6">Job Queue Health</h3>
          {stats.total_projects === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs md:text-sm font-bold text-gray-400 py-10">No active jobs.</div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
               <div className="h-32 md:h-40 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.progress_data} innerRadius={45} outerRadius={60} paddingAngle={5} dataKey="value" animationDuration={800}>
                        {stats.progress_data.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{stats.total_projects}</span>
                    <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-y-2 md:gap-y-3 w-full mt-4 md:mt-6 px-2 md:px-4">
                 {stats.progress_data.map((item: any) => (
                   <div 
                      key={item.name} 
                      onClick={() => openDrillDown(`Evaluation for: ${item.name} Phase`, item.list, 'health')}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors group"
                    >
                     <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-inner shrink-0" style={{ backgroundColor: item.color }}></div>
                       <span className="font-bold text-xs md:text-sm text-gray-600 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{item.name}</span>
                     </div>
                     <span className="font-black text-gray-900 dark:text-white text-xs md:text-sm bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{item.count}</span>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* ROW 3: WIDE ACTIONABLE ALERTS */}
      <div className="bg-white dark:bg-[#0c0c0e] p-4 md:p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-zinc-800">
        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-4 md:mb-6">Needs Attention</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          
          <Link to="/inventory" className="flex items-center justify-between p-4 md:p-5 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors group shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-red-100 dark:bg-red-900/50 p-2.5 md:p-3 rounded-full shrink-0"><AlertTriangle size={18} className="text-red-600 dark:text-red-400 md:w-5 md:h-5" /></div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-bold text-red-900 dark:text-red-300 truncate">Low Stock Items</p>
                <p className="text-[10px] md:text-xs font-medium text-red-700 dark:text-red-400/80 mt-0.5 truncate">{stats.alerts.low_stock} materials running out</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-red-400 group-hover:translate-x-1 transition-transform shrink-0 md:w-[18px] md:h-[18px]" />
          </Link>

          <Link to="/inquiries" className="flex items-center justify-between p-4 md:p-5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors group shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2.5 md:p-3 rounded-full shrink-0"><PackageOpen size={18} className="text-amber-600 dark:text-amber-400 md:w-5 md:h-5" /></div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-bold text-amber-900 dark:text-amber-300 truncate">Pending Inquiries</p>
                <p className="text-[10px] md:text-xs font-medium text-amber-700 dark:text-amber-400/80 mt-0.5 truncate">{stats.alerts.pending_inquiries} clients waiting</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 md:w-[18px] md:h-[18px]" />
          </Link>

          <Link to="/invoices" className="flex items-center justify-between p-4 md:p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2.5 md:p-3 rounded-full shrink-0"><CreditCard size={18} className="text-blue-600 dark:text-blue-400 md:w-5 md:h-5" /></div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-bold text-blue-900 dark:text-blue-300 truncate">Unpaid Invoices</p>
                <p className="text-[10px] md:text-xs font-medium text-blue-700 dark:text-blue-400/80 mt-0.5 truncate">{stats.alerts.unpaid_invoices} awaiting payment</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform shrink-0 md:w-[18px] md:h-[18px]" />
          </Link>

        </div>
      </div>

      {/* ================================================================================= */}
      {/* DATA EVALUATION DRILL-DOWN MODAL */}
      {/* ================================================================================= */}
      {drillDown.isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
          onClick={() => setDrillDown({ isOpen: false, title: '', data: [], type: '' })}
        >
          <div 
            className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden zoom-in-95 animate-in duration-200 flex flex-col max-h-[80vh] md:max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 md:p-5 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-[#09090b] shrink-0">
              <div>
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Database size={14} className="text-blue-500 md:w-4 md:h-4" /> Data Summary
                </h3>
                <p className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-zinc-400 mt-0.5 uppercase tracking-widest">{drillDown.title}</p>
              </div>
              <button onClick={() => setDrillDown({ isOpen: false, title: '', data: [], type: '' })} className="text-gray-400 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-colors p-1.5 rounded-full"><X size={16} className="md:w-[18px] md:h-[18px]"/></button>
            </div>

            <div className="overflow-y-auto flex-1 p-3 md:p-4 bg-white dark:bg-[#0c0c0e]">
              {drillDown.data.length === 0 ? (
                <div className="text-center py-8 md:py-10 text-gray-400 font-medium text-xs md:text-sm">No recorded data for this metric yet.</div>
              ) : (
                <ul className="space-y-2">
                  {drillDown.data.map((item: any, idx: number) => (
                    <li key={idx} className="bg-gray-50 dark:bg-[#09090b] border border-gray-100 dark:border-zinc-800/80 p-3 md:p-3.5 rounded-xl flex justify-between items-center hover:bg-gray-100 dark:hover:bg-zinc-900/50 transition-colors">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-xs md:text-sm text-gray-900 dark:text-white truncate">
                          {drillDown.type === 'clients' ? item.name : item.client || `Job #${item.id}`}
                        </p>
                        <p className="text-[9px] md:text-[10px] font-medium text-gray-500 dark:text-zinc-400 mt-0.5 uppercase tracking-wide truncate">
                          {drillDown.type === 'revenue' && `Deadline: ${item.date}`}
                          {drillDown.type === 'jobs' && `Status: ${item.stage}`}
                          {drillDown.type === 'workload' && `Target: ${item.deadline}`}
                          {drillDown.type === 'clients' && `${item.email}`}
                          {drillDown.type === 'health' && `System ID: #${item.id}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {drillDown.type === 'revenue' && <span className="font-black text-xs md:text-sm text-emerald-600 dark:text-emerald-400">₱{item.amount.toLocaleString()}</span>}
                        {drillDown.type === 'workload' && <span className={`font-black text-[9px] md:text-[10px] uppercase tracking-widest px-1.5 md:px-2 py-1 rounded ${item.days_left <= 7 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>{item.days_left} Days Left</span>}
                        {drillDown.type === 'clients' && <span className="font-bold text-[10px] md:text-xs text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30 px-2 py-1 rounded">{item.count} Req</span>}
                        {(drillDown.type === 'jobs' || drillDown.type === 'health') && <Link to="/queue" className="text-[9px] md:text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">Go to Job</Link>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================= */}
      {/* IMMERSIVE FULL-SCREEN AI COMMAND CENTER */}
      {/* ================================================================================= */}
      {isAIFullScreenOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 p-2 md:p-10"
          onClick={() => setIsAIFullScreenOpen(false)}
        >
          <div 
            className="w-full max-w-5xl h-full bg-[#161618] border border-[#2a2a2b] shadow-2xl rounded-xl md:rounded-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* AI CHAT BODY */}
            <div className="flex-1 overflow-hidden">
              <AIAssistant onClose={() => setIsAIFullScreenOpen(false)} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;