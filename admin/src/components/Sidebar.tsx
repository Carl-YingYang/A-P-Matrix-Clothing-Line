import { useState, useEffect } from 'react';
import { useDialog } from './DialogProvider';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Layers, Database, Briefcase, LogOut, FileText, MessageSquare } from 'lucide-react'; 

const Sidebar = ({ isCollapsed, toggleSidebar }: { isCollapsed: boolean, toggleSidebar?: () => void }) => {
  const location = useLocation();
  const { showConfirm } = useDialog();
  const iconStyle = { size: 20, strokeWidth: 1.5 };
  
  const [unreadCount, setUnreadCount] = useState(0);
  const ADMIN_EMAIL = "admin@apmatrix.ph";

  // Check for unread messages specifically for the Admin
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/messages/unread/${ADMIN_EMAIL}`);
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unread_count);
        }
      } catch(e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000); 
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutGrid {...iconStyle} /> },
    { name: 'Job Queue', path: '/queue', icon: <Layers {...iconStyle} /> }, 
    { name: 'Inventory', path: '/inventory', icon: <Database {...iconStyle} /> }, 
    { name: 'Clients', path: '/inquiries', icon: <Briefcase {...iconStyle} /> }, 
    { name: 'Invoices', path: '/invoices', icon: <FileText {...iconStyle} /> }, 
    { name: 'Messages', path: '/inbox', icon: <MessageSquare {...iconStyle} />, badge: unreadCount }, // 💡 BAGONG TAB
  ];

  const handleLogout = async () => {
    const confirmed = await showConfirm("Sign Out", "Are you sure you want to log out of the admin panel?");
    if (confirmed) {
      localStorage.removeItem('ap_matrix_auth'); 
      window.location.reload(); 
    }
  };

  return (
    <>
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in" 
          onClick={toggleSidebar} 
        ></div>
      )}

      <aside 
        className={`bg-white dark:bg-[#09090b] border-r border-gray-200 dark:border-zinc-900 flex flex-col justify-between h-full shadow-2xl md:shadow-[2px_0_8px_-3px_rgba(0,0,0,0.05)] z-50 transition-all duration-300 ease-in-out fixed md:relative ${
          isCollapsed ? '-translate-x-full md:translate-x-0 md:w-[76px]' : 'translate-x-0 w-64'
        }`}
      >
        <div className="flex flex-col h-full pt-6">
          <nav className="px-3 space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            
            <p className={`px-3 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4 transition-all duration-200 ${isCollapsed ? 'opacity-0 md:opacity-100 md:text-center' : 'opacity-100'}`}>
              {isCollapsed ? 'Menu' : 'Main Menu'}
            </p>
            
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.name} to={item.path} title={isCollapsed ? item.name : ""} 
                  onClick={() => {
                    if (window.innerWidth < 768 && !isCollapsed && toggleSidebar) toggleSidebar();
                  }}
                  className={`flex justify-between items-center rounded-xl text-sm font-medium transition-all duration-200 group ${isCollapsed ? 'md:justify-center py-3.5 px-4 md:px-0' : 'px-4 py-3'} ${isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-200 shrink-0 relative`}>
                      {item.icon}
                      {/* Notification Badge if collapsed */}
                      {isCollapsed && item.badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-[#09090b]"></span>
                      )}
                    </div>
                    <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'block md:hidden ml-3' : 'block'}`}>
                      {item.name}
                    </span>
                  </div>
                  
                  {/* Notification Badge if expanded */}
                  {!isCollapsed && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-gray-100 dark:border-zinc-900/50 bg-white dark:bg-[#09090b]">
          <button onClick={handleLogout} title={isCollapsed ? "Logout" : ""} className={`flex items-center w-full rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors group ${isCollapsed ? 'justify-start md:justify-center py-3.5 px-4 md:px-0' : 'gap-3 px-4 py-3 text-left'}`}>
            <div className="group-hover:scale-110 transition-transform duration-200 shrink-0">
              <LogOut size={20} strokeWidth={1.5} />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'block md:hidden ml-3' : 'block'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;