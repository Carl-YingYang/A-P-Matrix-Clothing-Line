import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, LayoutDashboard, MessageSquare, ChevronDown, User } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile Menu
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Desktop Profile Dropdown
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isAuthenticated = !!localStorage.getItem('access_token');
  const userEmail = localStorage.getItem('user_email') || '';
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Isara ang dropdown kapag pumindot sa labas ng dropdown box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate('/login');
  };

  const navItems = ['Home', 'Gallery', 'Services'];
  const getPath = (item: string) => item === 'Home' ? '/' : `/${item.toLowerCase()}`;

  return (
    <nav className={`fixed w-full z-[999] transition-all duration-500 ${scrolled ? 'bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* LOGO SECTION */}
          <Link to="/" className="flex flex-col leading-none group shrink-0" onClick={() => setIsOpen(false)}>
            <span className="text-xl md:text-2xl font-serif font-black tracking-widest text-white group-hover:opacity-70 transition-opacity">
              A&P <span className="font-light italic opacity-80">Clothing</span>
            </span>
            <span className="text-[7px] md:text-[8px] text-zinc-500 font-bold tracking-[0.5em] mt-1.5 uppercase">
              Bulacan • Philippines
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link 
                  key={item} 
                  to={getPath(item)}
                  className={`text-[10px] font-bold uppercase tracking-[0.25em] transition-all hover:text-white ${location.pathname === getPath(item) ? 'text-white' : 'text-zinc-500'}`}
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* AUTH / PROFILE ACTION */}
            <div className="flex items-center gap-6 pl-6 border-l border-white/10">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-[0_0_15px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform">
                      {userInitial}
                    </div>
                    <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>

                  {/* PROFESSIONAL DROPDOWN PANEL */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-4 w-64 bg-[#0c0c0e] border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200 z-[1000]">
                      <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mb-1">Authenticated</p>
                        <p className="text-[11px] text-zinc-200 truncate font-medium">{userEmail}</p>
                      </div>
                      
                      <div className="p-2">
                        <Link 
                          to="/client/dashboard" 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <LayoutDashboard size={16} strokeWidth={1.5} /> Portal Dashboard
                        </Link>
                        <Link 
                          to="/client/dashboard" // In-update ko to dashboard since Messages is a tab there
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <MessageSquare size={16} strokeWidth={1.5} /> Direct Messages
                        </Link>
                      </div>

                      <div className="p-2 border-t border-white/5">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <LogOut size={16} /> Sign Out Securely
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
                >
                  <LogIn size={14} /> Login
                </Link>
              )}

              <Link 
                to="/contact" 
                className="bg-white text-black px-7 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:invert transition-all active:scale-95"
              >
                Get Quote
              </Link>
            </div>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden flex items-center gap-4">
            {isAuthenticated && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                {userInitial}
              </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 focus:outline-none">
              <div className="w-6 flex flex-col gap-1.5">
                <span className={`h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : 'w-full'}`}></span>
                <span className={`h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : 'w-2/3'}`}></span>
                <span className={`h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : 'w-full'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU PANEL */}
      {isOpen && (
        <div className="md:hidden bg-[#09090b] fixed inset-0 z-[998] pt-24 animate-in slide-in-from-right duration-300">
          <div className="px-8 flex flex-col h-full pb-12">
            <div className="space-y-6 flex-1">
              {navItems.map((item) => (
                <Link 
                  key={item} 
                  to={getPath(item)} 
                  onClick={() => setIsOpen(false)} 
                  className={`block text-2xl font-serif tracking-tight ${location.pathname === getPath(item) ? 'text-white' : 'text-zinc-600'}`}
                >
                  {item}
                </Link>
              ))}
              
              {isAuthenticated && (
                <>
                  <div className="h-px bg-white/10 my-4 w-12"></div>
                  <Link to="/client/dashboard" onClick={() => setIsOpen(false)} className="block text-lg font-bold uppercase tracking-widest text-zinc-400">Portal Dashboard</Link>
                  <Link to="/client/dashboard" onClick={() => setIsOpen(false)} className="block text-lg font-bold uppercase tracking-widest text-zinc-400">Messages</Link>
                </>
              )}
            </div>

            <div className="space-y-4 pt-10">
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="w-full py-5 text-red-500 font-black uppercase tracking-widest border border-red-500/20 rounded-xl"
                >
                  Log Out Session
                </button>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)} 
                  className="block w-full py-5 text-center text-white font-black uppercase tracking-widest border border-white/10 rounded-xl"
                >
                  Sign In
                </Link>
              )}
              <Link 
                to="/contact" 
                onClick={() => setIsOpen(false)} 
                className="block w-full bg-white text-black py-5 text-center font-black uppercase tracking-widest rounded-xl"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;