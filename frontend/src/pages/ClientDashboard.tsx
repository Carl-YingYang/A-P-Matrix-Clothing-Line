import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MessageSquare, Lock, Clock, CheckCircle, ChevronRight, FileText, Loader2, AlertTriangle, Phone, Building, Wallet, Image as ImageIcon, Repeat, Copy, Check, ClipboardCopy, CheckSquare } from 'lucide-react';
import ClientChat from '../components/ClientChat'; 

interface OrderData { id: string; service: string; quantity: number; status: string; date_submitted: string; budget: string; company: string; phone: string; details: string; reference_image?: string | null; rejection_reason?: string | null; production_stage?: string | null; }

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'messages'>('orders');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0); 
  const [copiedId, setCopiedId] = useState<string | null>(null); 
  const [copiedFull, setCopiedFull] = useState<string | null>(null); 
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const userEmail = localStorage.getItem('user_email') || '';
  const userName = localStorage.getItem('user_name') || 'Client'; 

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/client/orders/${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) setOrders(data);
        else setOrders([]);
      } else setOrders([]);
    } catch (error) { setOrders([]); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (!userEmail) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/messages/unread/${userEmail}`);
        if (res.ok) setUnreadCount((await res.json()).unread_count);
      } catch(e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000); 
    return () => clearInterval(interval);
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) { window.location.href = '/login'; return; }
    fetchOrders();
  }, [userEmail]);

  const activeOrders = Array.isArray(orders) ? orders.filter(o => !['Pending Payment', 'Done', 'Refunded', 'Rejected'].includes(o.status)) : [];
  const hasActiveOrder = activeOrders.length > 0;

  useEffect(() => {
    if (activeOrders.length > 0 && !selectedChatId) {
      setSelectedChatId(activeOrders[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.length]); 

  const toggleOrder = (orderId: string) => setExpandedOrder(expandedOrder === orderId ? null : orderId);
  const handleReorder = (order?: OrderData) => navigate('/contact', { state: { reorderData: order } });

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    const cleanId = String(id).startsWith('REQ-') ? id : `REQ-${id}`;
    navigator.clipboard.writeText(cleanId); 
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyFullDetails = (order: OrderData) => {
    const cleanId = String(order.id).startsWith('REQ-') ? order.id : `REQ-${order.id}`;
    const payload = { id: cleanId, service: order.service, quantity: order.quantity, budget: order.budget, company: order.company === "N/A" || !order.company ? "Personal Order" : order.company, phone: order.phone, date: order.date_submitted, details: order.details };
    const textToCopy = `[TECH_PACK]${JSON.stringify(payload)}[/TECH_PACK]`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedFull(order.id);
    setTimeout(() => setCopiedFull(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] pt-24 pb-20 font-sans text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">My Portal</h1>
          <p className="text-sm text-zinc-400">Welcome back, <span className="text-zinc-200 font-medium">{userEmail}</span></p>
        </div>

        <div className="flex items-center gap-6 mb-8 border-b border-zinc-800">
          <button onClick={() => setActiveTab('orders')} className={`pb-4 text-[11px] uppercase tracking-[0.15em] font-bold flex items-center gap-2 transition-colors relative ${activeTab === 'orders' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Package size={16} /> My Orders
            {activeTab === 'orders' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-t-full"></span>}
          </button>
          <button onClick={() => setActiveTab('messages')} className={`pb-4 text-[11px] uppercase tracking-[0.15em] font-bold flex items-center gap-2 transition-colors relative ${activeTab === 'messages' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <div className="relative">
               <MessageSquare size={16} />
               {unreadCount > 0 && activeTab !== 'messages' && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce">{unreadCount}</span>}
            </div>
            Messages
            {!hasActiveOrder && <Lock size={12} className="text-zinc-600 ml-1" />}
            {activeTab === 'messages' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-t-full"></span>}
          </button>
        </div>

        {/* TAB: ORDERS */}
        {activeTab === 'orders' && (
          <div className="grid gap-4 animate-in fade-in duration-300">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-blue-500"><Loader2 size={32} className="animate-spin mb-4" /><p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Syncing database...</p></div>
            ) : orders.length > 0 ? (
              orders.map((order) => {
                let displayStatus = order.status;
                let statusColor = "text-blue-400";
                let statusIcon = <Clock size={14} className="text-blue-500 animate-pulse"/>;

                if (order.status === 'Accepted') {
                  displayStatus = order.production_stage ? `Production: ${order.production_stage}` : 'In Production Queue';
                  statusColor = "text-emerald-400"; statusIcon = <CheckCircle size={14} className="text-emerald-500"/>;
                } else if (['Pending Payment', 'Awaiting Downpayment'].includes(order.status)) {
                  statusColor = "text-amber-400"; statusIcon = <AlertTriangle size={14} className="text-amber-500"/>;
                } else if (['Refunded', 'Rejected'].includes(order.status)) {
                  statusColor = "text-red-400"; statusIcon = <AlertTriangle size={14} className="text-red-500"/>;
                } else if (order.status === 'Done') {
                  statusColor = "text-emerald-500"; statusIcon = <CheckCircle size={14} className="text-emerald-500"/>;
                }

                const cleanId = String(order.id).startsWith('REQ-') ? order.id : `REQ-${order.id}`;

                return (
                  <div key={order.id} className={`bg-[#0c0c0e] border rounded-2xl flex flex-col transition-all duration-300 group overflow-hidden ${expandedOrder === order.id ? 'border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.05)]' : 'border-zinc-800 hover:border-zinc-700 cursor-pointer'}`}>
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer" onClick={() => toggleOrder(order.id)}>
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 transition-colors ${expandedOrder === order.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-[#050505] border-zinc-800'}`}><FileText size={20} className={expandedOrder === order.id ? 'text-blue-400' : 'text-zinc-400 group-hover:text-zinc-300'} /></div>
                        <div>
                          <h3 className="text-base font-bold text-white mb-1">{order.service}</h3>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-zinc-500">{order.quantity} pieces • Ref: {cleanId}</p>
                            <button onClick={(e) => handleCopyId(e, order.id)} className={`p-1.5 rounded transition-all ${copiedId === order.id ? 'bg-emerald-900/30 text-emerald-500' : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800 border border-zinc-800'}`} title="Copy ID">
                              {copiedId === order.id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 md:gap-12 justify-between md:justify-end border-t md:border-t-0 border-zinc-800/50 pt-4 md:pt-0">
                        <div><p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Status</p><div className="flex items-center gap-2">{statusIcon}<span className={`text-xs font-bold tracking-wide ${statusColor}`}>{displayStatus}</span></div></div>
                        <div><p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Submitted</p><p className="text-xs font-medium text-zinc-300">{order.date_submitted}</p></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedOrder === order.id ? 'bg-blue-600 text-white rotate-90' : 'bg-zinc-900 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-white'}`}><ChevronRight size={16} /></div>
                      </div>
                    </div>

                    {expandedOrder === order.id && (
                      <div className="px-6 pb-6 pt-2 border-t border-zinc-800/50 bg-[#08080a] animate-in slide-in-from-top-2 fade-in duration-200">
                        {(order.status === 'Refunded' || order.status === 'Rejected') && order.rejection_reason && (
                          <div className="mt-4 bg-red-950/20 border border-red-900/50 p-4 rounded-xl flex items-start gap-3">
                            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                            <div><p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">Reason for Cancellation / Refund</p><p className="text-sm text-red-200 leading-relaxed">{order.rejection_reason}</p></div>
                          </div>
                        )}

                        <div className="grid md:grid-cols-4 gap-8 mt-4">
                          <div className="space-y-5 flex flex-col justify-between">
                            <div className="space-y-4">
                              <div><p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-1.5 flex items-center gap-1.5"><Wallet size={12}/> Declared Budget</p><p className="text-sm font-medium text-zinc-200">{order.budget}</p></div>
                              <div><p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-1.5 flex items-center gap-1.5"><Building size={12}/> Company / Brand</p><p className="text-sm font-medium text-zinc-200">{order.company === "N/A" || !order.company ? "Personal Order" : order.company}</p></div>
                              <div><p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-1.5 flex items-center gap-1.5"><Phone size={12}/> Contact Phone</p><p className="text-sm font-medium text-zinc-200">{order.phone}</p></div>
                            </div>

                            {/* 💡 INALIS KO NA YUNG CLOSE BUTTON DITO - SA ADMIN NA DAPAT YON 💡 */}
                            
                            <button onClick={() => handleReorder(order)} className="mt-4 w-full bg-white text-black py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                              <Repeat size={14} /> Re-order
                            </button>
                          </div>

                          <div className="md:col-span-2 bg-[#050505] p-5 rounded-xl border border-zinc-800/50 flex flex-col relative group/copybox">
                             <div className="flex justify-between items-center mb-3 border-b border-zinc-800/50 pb-2">
                               <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Full Tech Pack Details</p>
                               <button onClick={() => handleCopyFullDetails(order)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border shadow-lg ${copiedFull === order.id ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' : 'bg-blue-600 text-white hover:bg-blue-500 border-blue-500 active:scale-95'}`}>
                                 {copiedFull === order.id ? <><Check size={14}/> Copied All Info</> : <><ClipboardCopy size={14}/> Copy All Info</>}
                               </button>
                             </div>
                             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar"><p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono">{order.details}</p></div>
                          </div>

                          <div className="flex flex-col">
                             <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-3 border-b border-zinc-800/50 pb-2">Image Prototype</p>
                             <div className="flex-1 bg-[#050505] rounded-xl border border-zinc-800/50 flex items-center justify-center overflow-hidden relative group">
                               {order.reference_image ? (
                                 <><img src={order.reference_image} alt="Client Prototype" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <a href={order.reference_image} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-white border border-white/30 px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-colors">View Full</a>
                                   </div></>
                               ) : (
                                 <div className="flex flex-col items-center justify-center text-zinc-700 p-6 text-center"><ImageIcon size={32} className="mb-2 opacity-50" /><p className="text-[10px] font-bold uppercase tracking-widest">No Photo</p></div>
                               )}
                             </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-[#0c0c0e]/50">
                <Package size={48} className="mx-auto text-zinc-700 mb-4" />
                <h3 className="text-lg font-serif text-white mb-2">No Active Orders</h3>
                <p className="text-sm text-zinc-500 mb-6">You haven't requested a quotation yet.</p>
                <button onClick={() => handleReorder()} className="inline-block bg-white text-black px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors">Start an Inquiry</button>
              </div>
            )}
          </div>
        )}

        {/* TAB: MESSAGES (MULTI-CHAT SUPPORT) */}
        {activeTab === 'messages' && (
          <div className="animate-in fade-in duration-300 flex flex-col gap-4">
            {!hasActiveOrder ? (
              <div className="text-center py-24 border border-zinc-800 rounded-3xl bg-[#0c0c0e]">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6"><Lock size={24} className="text-zinc-600" /></div>
                <h3 className="text-lg font-serif text-white mb-2">Direct Messaging Locked</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">Priority communication with our production team is exclusively available for clients with active orders.</p>
              </div>
            ) : (
              <>
                {activeOrders.length > 1 && (
                   <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                     {activeOrders.map(o => {
                       const cleanId = String(o.id).replace('REQ-', '');
                       return (
                         <button 
                           key={o.id} onClick={() => setSelectedChatId(o.id)} 
                           className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedChatId === o.id ? 'bg-blue-600 text-white border-blue-500 shadow-md' : 'bg-[#0c0c0e] text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-900'}`}
                         >
                           {o.service} (REQ-{cleanId})
                         </button>
                       )
                     })}
                   </div>
                )}
                
                {selectedChatId && (
                  <ClientChat orderId={parseInt(String(selectedChatId).replace('REQ-', ''))} userEmail={userEmail} userName={userName} />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;