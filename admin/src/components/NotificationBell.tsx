import { useState, useEffect } from 'react';
import { Bell, AlertCircle, UserCircle, CheckCheck, CreditCard, Layers, Database, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const STORAGE_KEY = 'ap_matrix_notifs_final'; 

  const fetchData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/notifications`);
      if (res.ok) {
        const data = await res.json();
        
        const savedRead = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        const formattedNotifs = data.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          link: n.link,
          type: n.type,
          isCritical: n.title.includes("CRITICAL"),
          isRead: savedRead.includes(n.id),
          dateStr: new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
        }));

        setNotifications(formattedNotifs);
      }
    } catch (error) { 
      console.error("Failed to fetch global notifications."); 
    }
  };

  useEffect(() => {
    fetchData(); // Initial load
    const interval = setInterval(fetchData, 8000); // 8-second backup sync
    
    // GLOBAL LISTENER PARA SA INSTANT REFRESH
    const handleInstantUpdate = () => fetchData();
    window.addEventListener('matrix_system_update', handleInstantUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('matrix_system_update', handleInstantUpdate);
    };
  }, []);

  const markAsRead = (id: number) => {
    const savedRead = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!savedRead.includes(id)) {
      const updated = [...savedRead, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
    setShowNotifs(false); 
  };

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayCount = unreadCount > 9 ? '9+' : unreadCount;

  const getIconAndBg = (type: string, isCritical: boolean) => {
    if (isCritical) return { icon: <AlertCircle size={14} className="text-red-600 md:w-4 md:h-4" />, bg: 'bg-red-100 dark:bg-red-900/30' };
    switch (type) {
      case 'inquiry': return { icon: <UserCircle size={14} className="text-blue-600 md:w-4 md:h-4" />, bg: 'bg-blue-100 dark:bg-blue-900/30' };
      case 'payment': return { icon: <CreditCard size={14} className="text-emerald-600 md:w-4 md:h-4" />, bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
      case 'job': return { icon: <Layers size={14} className="text-purple-600 md:w-4 md:h-4" />, bg: 'bg-purple-100 dark:bg-purple-900/30' };
      case 'inventory': return { icon: <Database size={14} className="text-amber-600 md:w-4 md:h-4" />, bg: 'bg-amber-100 dark:bg-amber-900/30' };
      case 'system': return { icon: <Settings size={14} className="text-gray-600 md:w-4 md:h-4" />, bg: 'bg-gray-100 dark:bg-zinc-800' };
      default: return { icon: <Bell size={14} className="text-gray-600 md:w-4 md:h-4" />, bg: 'bg-gray-100 dark:bg-gray-800' };
    }
  };

  return (
    <div className="relative z-[60]">
      <button onClick={() => setShowNotifs(!showNotifs)} className="p-1.5 md:p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors relative shadow-sm">
        <Bell size={18} className="md:w-5 md:h-5" />
        {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1.5 min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] bg-red-500 rounded-full border-2 border-white dark:border-[#09090b] flex items-center justify-center text-[8px] md:text-[9px] font-black text-white px-1 shadow-sm animate-pulse">{displayCount}</span>}
      </button>
      
      {showNotifs && (
        <>
          {/* 🔥 INVISIBLE OVERLAY (Gumagana na ngayon sa Mobile at Desktop) 🔥 */}
          <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)}></div>
          
          <div className="absolute right-[-60px] sm:right-0 mt-3 w-[300px] sm:w-80 md:w-96 bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-zinc-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden origin-top-right animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh] z-50">
            <div className="p-3 md:p-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-[#09090b] flex justify-between items-center shrink-0 backdrop-blur-md sticky top-0">
              <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                System Events
                {unreadCount > 0 && <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-black">{unreadCount} New</span>}
              </h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[9px] md:text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-all active:scale-95">
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 bg-white dark:bg-[#0c0c0e]">
              {notifications.length === 0 ? (
                <div className="p-8 md:p-10 text-center text-gray-400 dark:text-zinc-600 flex flex-col items-center justify-center">
                  <div className="bg-gray-50 dark:bg-zinc-900 p-3 md:p-4 rounded-full mb-3">
                    <Bell size={20} className="opacity-50 md:w-6 md:h-6" />
                  </div>
                  <p className="text-xs md:text-sm font-medium">You're all caught up!</p>
                  <p className="text-[10px] md:text-xs opacity-60 mt-1">No recent system events.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const { icon, bg } = getIconAndBg(notif.type, notif.isCritical);

                  return (
                    <Link 
                      key={notif.id} to={notif.link} onClick={() => markAsRead(notif.id)} 
                      className={`flex items-start gap-2.5 md:gap-3 p-3 md:p-4 border-b border-gray-50 dark:border-zinc-800/50 transition cursor-pointer group ${
                        notif.isRead ? 'bg-transparent opacity-60 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-zinc-900/50' : 'bg-blue-50/30 dark:bg-blue-900/10 hover:bg-blue-50/60 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      <div className={`p-1.5 md:p-2 rounded-full mt-0.5 ${bg} shadow-sm group-hover:scale-105 transition-transform shrink-0`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5 gap-2">
                          <p className={`text-[11px] md:text-xs font-bold truncate ${notif.isRead ? 'text-gray-600 dark:text-zinc-400' : 'text-gray-900 dark:text-white'}`}>{notif.title}</p>
                          <span className="text-[8px] md:text-[9px] font-bold text-gray-400 dark:text-zinc-500 whitespace-nowrap shrink-0 pt-0.5">{notif.dateStr}</span>
                        </div>
                        <p className={`text-xs md:text-sm leading-snug mt-1 ${notif.isRead ? 'text-gray-500 dark:text-zinc-500 font-medium' : 'text-gray-700 dark:text-zinc-300 font-medium'}`}>{notif.message}</p>
                      </div>
                      {!notif.isRead && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 mt-2 shrink-0 animate-pulse"></div>}
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;