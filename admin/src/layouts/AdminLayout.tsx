import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ThemeProvider } from '../components/ThemeProvider';
import { DialogProvider } from '../components/DialogProvider'; 

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Safe mode initialization para hindi mag-error si React sa unang load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarCollapsed(window.innerWidth < 768);
      
      const handleResize = () => {
        setIsSidebarCollapsed(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <ThemeProvider>
      <DialogProvider>
        <div className="flex h-screen font-sans overflow-hidden bg-[#f4f7fe] dark:bg-[#050505] transition-colors duration-300">
          
          <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
          
          <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
            <Header toggleSidebar={toggleSidebar} />
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto pb-20 md:pb-0">
                 <Outlet />
              </div>
            </div>
          </main>

        </div>
      </DialogProvider>
    </ThemeProvider>
  );
};

export default AdminLayout;