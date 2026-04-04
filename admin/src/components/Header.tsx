import { useState, useEffect } from 'react';
import { Search, Sun, Moon, UserCircle, Menu, Camera, X, Save, CheckCircle2, LogOut, Lock, KeyRound, EyeOff, Eye, AlertCircle, ShieldCheck, Settings } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useDialog } from './DialogProvider';
import NotificationBell from './NotificationBell'; 

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { theme, toggleTheme } = useTheme();
  const { showConfirm, showAlert } = useDialog(); 
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security'>('profile');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Profile State
  const [profile, setProfile] = useState({ fullName: 'Admin User', email: 'admin@system.com', branch: 'Guiguinto, Bulacan' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Security State
  const [securityUser, setSecurityUser] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [passError, setPassError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const setRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/settings`);
        if (setRes.ok) {
          const data = await setRes.json();
          setProfile({ fullName: data.full_name || 'Admin User', email: data.email || 'admin@system.com', branch: 'Guiguinto, Bulacan' });
        }
      } catch (error) { console.error("Settings fetch error"); }

      const storedAvatar = localStorage.getItem('ap_matrix_avatar');
      if (storedAvatar) setAvatarPreview(storedAvatar);

      const savedUser = localStorage.getItem('ap_matrix_admin_user') || 'admin';
      setSecurityUser(savedUser);
    };
    fetchSettings();
  }, []);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      await showAlert("Search Feature", `Searching database for: "${searchQuery}"`);
      setSearchQuery(''); 
    }
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm("Sign Out", "Are you sure you want to log out of the admin panel?");
    if (confirmed) {
      localStorage.removeItem('ap_matrix_auth'); 
      window.location.reload(); 
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: profile.fullName, email: profile.email })
      });
      if (avatarPreview) localStorage.setItem('ap_matrix_avatar', avatarPreview);
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => { setIsSaved(false); setShowSettingsModal(false); }, 1500);
      }
    } catch (error) {
      await showAlert("Error", "Failed to save settings.");
    } finally { setIsSaving(false); }
  };

  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    const actualPass = localStorage.getItem('ap_matrix_admin_pass') || 'Teodoro@27';

    if (passwords.current !== actualPass) {
      return setPassError("Current password is incorrect. Authorization denied.");
    }

    if (passwords.new) {
      if (passwords.new !== passwords.confirm) {
        return setPassError("New passwords do not match.");
      }
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
      if (!strongRegex.test(passwords.new)) {
        return setPassError("Password must be 8+ chars, include an uppercase letter, a number, and a special character (!@#$).");
      }
    }

    setIsSaving(true);
    setIsSaved(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      localStorage.setItem('ap_matrix_admin_user', securityUser);
      if (passwords.new) {
        localStorage.setItem('ap_matrix_admin_pass', passwords.new);
      }

      setIsSaved(true);
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => { setIsSaved(false); setShowSettingsModal(false); }, 1500);
      await showAlert("Security Alert", "Your security credentials have been successfully updated.");
    } catch (error) {
      setPassError("Failed to update credentials. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name || name.trim() === '') return 'A';
    const names = name.trim().split(' ');
    if (names.length >= 2) return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <>
      <header className="h-16 md:h-20 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-900 flex items-center justify-between px-3 md:px-6 sticky top-0 z-40 gap-2 md:gap-4">
        
        {/* RESPONSIVE LEFT SIDE */}
        <div className="flex items-center gap-2 md:gap-4 w-auto lg:w-1/4 shrink-0">
          <button onClick={toggleSidebar} className="p-1.5 md:p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
            <Menu size={20} strokeWidth={1.5} className="md:w-[22px] md:h-[22px]" />
          </button>
          <div className="hidden sm:flex flex-col leading-none truncate overflow-hidden">
            <span className="text-lg md:text-2xl font-serif font-black tracking-widest text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              A&P <span className="font-light text-blue-600">Clothing</span>
            </span>
            <span className="hidden md:block text-[8px] md:text-[9px] text-gray-400 dark:text-zinc-500 font-bold tracking-[0.4em] mt-1.5 uppercase">
              Guiguinto, Bulacan
            </span>
          </div>
        </div>

        {/* RESPONSIVE SEARCH BAR */}
        <div className="flex-1 max-w-2xl flex justify-center">
          <div className="flex items-center bg-gray-100 dark:bg-zinc-900/50 px-3 py-1.5 md:px-4 md:py-3 rounded-full w-full border border-transparent focus-within:border-blue-500 dark:focus-within:border-zinc-700 transition-all focus-within:bg-white dark:focus-within:bg-[#0c0c0e]">
            <Search size={16} className="text-gray-500 dark:text-zinc-400 shrink-0 md:w-[18px] md:h-[18px]" />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none ml-2 md:ml-3 w-full text-xs md:text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-500 font-medium" 
            />
          </div>
        </div>

        {/* RESPONSIVE RIGHT SIDE */}
        <div className="w-auto lg:w-1/4 flex items-center justify-end gap-1 md:gap-3 shrink-0">
          <button onClick={toggleTheme} className="p-1.5 md:p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
            {theme === 'light' ? <Moon size={18} className="md:w-5 md:h-5" /> : <Sun size={18} className="md:w-5 md:h-5" />}
          </button>

          <div className="scale-90 md:scale-100"><NotificationBell /></div>

          <div className="relative pl-1.5 md:pl-4 border-l border-gray-200 dark:border-zinc-800 ml-0.5 md:ml-1">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px] md:text-sm shadow-md border-2 border-white dark:border-zinc-900 overflow-hidden shrink-0">
                {avatarPreview ? <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" /> : getInitials(profile.fullName)}
              </div>
            </button>
            
            {/* PROFILE MENU DROPDOWN */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-64 md:w-72 bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-zinc-800 shadow-2xl rounded-3xl overflow-hidden origin-top-right animate-in fade-in zoom-in duration-200 z-50">
                <div className="p-5 md:p-6 text-center border-b border-gray-100 dark:border-zinc-800">
                  <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg md:text-xl overflow-hidden mb-3">
                    {avatarPreview ? <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" /> : getInitials(profile.fullName)}
                  </div>
                  <p className="text-base md:text-lg font-bold text-gray-900 dark:text-white truncate">{profile.fullName}</p>
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-zinc-400 truncate">{profile.email}</p>
                </div>
                <div className="p-2">
                  <button onClick={() => { setShowSettingsModal(true); setSettingsTab('profile'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900/50 flex items-center gap-3"><UserCircle size={16} className="text-gray-400 md:w-[18px] md:h-[18px]" /> Manage Account</button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 mt-1"><LogOut size={16} className="md:w-[18px] md:h-[18px]" /> Sign out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================================================= */}
      {/* ENTERPRISE SETTINGS MODAL */}
      {/* ======================================================================================= */}
      {showSettingsModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
          onClick={() => setShowSettingsModal(false)}
        >
           <div 
             className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden zoom-in-95 animate-in duration-200 flex flex-col max-h-[90vh]"
             onClick={(e) => e.stopPropagation()} 
           >
            
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#09090b] shrink-0">
              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings size={18} className="text-blue-500 md:w-5 md:h-5"/> Account Settings
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-200 dark:bg-zinc-800 p-1.5 rounded-full transition-colors"><X size={16} className="md:w-[18px] md:h-[18px]" /></button>
            </div>

            {/* RESPONSIVE TAB NAVIGATION */}
            <div className="flex border-b border-gray-100 dark:border-zinc-800 shrink-0">
              <button onClick={() => setSettingsTab('profile')} className={`flex-1 py-2.5 md:py-3 text-xs md:text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 md:gap-2 ${settingsTab === 'profile' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-300'}`}>
                <UserCircle size={14} className="md:w-4 md:h-4"/> General Profile
              </button>
              <button onClick={() => setSettingsTab('security')} className={`flex-1 py-2.5 md:py-3 text-xs md:text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 md:gap-2 ${settingsTab === 'security' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-300'}`}>
                <ShieldCheck size={14} className="md:w-4 md:h-4"/> Security & Access
              </button>
            </div>

            <div className="overflow-y-auto p-4 md:p-6 hide-scrollbar">
              
              {/* TAB 1: PROFILE TAB */}
              {settingsTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-5 md:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-100 dark:bg-zinc-800 border-4 border-white dark:border-[#0c0c0e] shadow-lg flex items-center justify-center text-blue-600 font-bold text-2xl md:text-3xl overflow-hidden shrink-0">
                        {avatarPreview ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" /> : getInitials(profile.fullName)}
                      </div>
                      <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera size={20} className="text-white md:w-6 md:h-6" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <div><label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5">Full Name</label><input type="text" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} required className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" /></div>
                    <div><label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5">Email Address</label><input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} required className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" /></div>
                  </div>
                  <div className="pt-3 md:pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                    <button type="submit" disabled={isSaving || isSaved} className={`w-full md:w-auto px-6 py-3 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${isSaved ? 'bg-emerald-500' : isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                      {isSaved ? <><CheckCircle2 size={16}/> Saved!</> : <><Save size={16}/> {isSaving ? 'Saving...' : 'Save Profile'}</>}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: SECURITY & PASSWORD TAB */}
              {settingsTab === 'security' && (
                <form onSubmit={handleSecurityUpdate} className="space-y-4 md:space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                  
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-3 md:p-4 rounded-xl flex items-start gap-2 md:gap-3">
                    <KeyRound size={16} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5 md:w-5 md:h-5" />
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-amber-900 dark:text-amber-400">Security Requirements</p>
                      <p className="text-[9px] md:text-[11px] text-amber-700 dark:text-amber-500/80 mt-1 leading-relaxed">Current password is required to save changes. Passwords must be 8+ chars (1 uppercase, 1 number, 1 special character).</p>
                    </div>
                  </div>

                  {passError && (
                    <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] md:text-xs font-bold p-3 rounded-lg flex items-center gap-2 border border-red-200 dark:border-red-900/50 animate-in shake">
                      <AlertCircle size={14} className="shrink-0" /> {passError}
                    </div>
                  )}

                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5">Admin Username</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                          <UserCircle size={14} className="text-gray-400 md:w-4 md:h-4" />
                        </div>
                        <input 
                          type="text" required value={securityUser} onChange={(e) => setSecurityUser(e.target.value)} 
                          className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl pl-9 md:pl-11 pr-4 py-2.5 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" 
                        />
                      </div>
                    </div>

                    <hr className="border-gray-100 dark:border-zinc-800 my-2" />

                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5">Current Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input 
                          type={showPass.current ? "text" : "password"} 
                          required value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} 
                          className="w-full bg-white dark:bg-[#0c0c0e] border border-gray-300 dark:border-zinc-700 rounded-xl pl-3 md:pl-4 pr-10 py-2.5 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors shadow-sm" 
                          placeholder="Required to save changes"
                        />
                        <button type="button" onClick={() => setShowPass({...showPass, current: !showPass.current})} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 outline-none">
                          {showPass.current ? <EyeOff size={14} className="md:w-4 md:h-4"/> : <Eye size={14} className="md:w-4 md:h-4"/>}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5">New Password (Optional)</label>
                      <div className="relative">
                        <input 
                          type={showPass.new ? "text" : "password"} 
                          value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} 
                          className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl pl-3 md:pl-4 pr-10 py-2.5 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" 
                          placeholder="Leave blank to keep current"
                        />
                        <button type="button" onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 outline-none">
                          {showPass.new ? <EyeOff size={14} className="md:w-4 md:h-4"/> : <Eye size={14} className="md:w-4 md:h-4"/>}
                        </button>
                      </div>
                    </div>

                    {passwords.new && (
                      <div className="animate-in slide-in-from-top-2 duration-200">
                        <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5">Confirm New Password</label>
                        <div className="relative">
                          <input 
                            type={showPass.confirm ? "text" : "password"} 
                            required value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} 
                            className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl pl-3 md:pl-4 pr-10 py-2.5 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" 
                          />
                          <button type="button" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 outline-none">
                            {showPass.confirm ? <EyeOff size={14} className="md:w-4 md:h-4"/> : <Eye size={14} className="md:w-4 md:h-4"/>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 md:pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                    <button type="submit" disabled={isSaving || isSaved} className={`w-full md:w-auto px-6 py-3 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${isSaved ? 'bg-emerald-500' : isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                      {isSaved ? <><CheckCircle2 size={16}/> Secured!</> : <><ShieldCheck size={16}/> {isSaving ? 'Authenticating...' : 'Save Security Updates'}</>}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;