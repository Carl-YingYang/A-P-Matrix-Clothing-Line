import { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff, Mail } from 'lucide-react';

const LoginOverlay = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  
  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('ap_matrix_auth');
    if (authStatus !== 'true') {
      setIsAuthenticated(false);
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'unset';
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const savedUser = localStorage.getItem('ap_matrix_admin_user') || 'admin';
    const savedPass = localStorage.getItem('ap_matrix_admin_pass') || 'Teodoro@27';

    if (username === savedUser && password === savedPass) {
      setError("");
      setIsLoading(true); 
      
      setTimeout(() => {
        setIsFadingOut(true); 
        setTimeout(() => {
          localStorage.setItem('ap_matrix_auth', 'true');
          setIsAuthenticated(true);
          document.body.style.overflow = 'unset';
        }, 500); 
      }, 400); 

    } else {
      setError("Invalid credentials. Access denied.");
      setPassword("");
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/settings/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail })
      });

      const data = await res.json();

      if (res.ok) {
        setRecoverySuccess(true);
      } else {
        setError(data.detail || "Failed to process recovery request.");
      }
    } catch (err) {
      setError("Network Error: Cannot connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-500 ease-in-out px-4 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      <div className={`bg-[#0c0c0e] border border-zinc-800 w-full max-w-md rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 md:p-10 flex flex-col items-center relative overflow-hidden transition-all duration-500 ease-in-out ${isFadingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#050505] border border-zinc-800 flex items-center justify-center mb-4 md:mb-6 shadow-inner relative z-10">
          <User size={32} className="text-zinc-600 md:w-10 md:h-10" />
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-white text-center relative z-10 px-2">Welcome to A&P Clothing Line</h1>
        <p className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-2 mb-6 md:mb-8 text-center relative z-10">
          {isForgotPassword ? 'Password Recovery' : 'Admin Panel'}
        </p>

        {isForgotPassword ? (
          <form onSubmit={handleRecovery} className="w-full space-y-4 md:space-y-5 relative z-10 animate-in fade-in zoom-in-95 duration-300">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-2.5 md:p-3 rounded-lg flex items-center justify-center gap-2 text-red-500 text-[11px] md:text-xs font-bold">
                <AlertCircle size={14} className="shrink-0" /> {error}
              </div>
            )}
            
            {recoverySuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 md:p-5 rounded-xl text-center space-y-2">
                <h3 className="text-emerald-500 font-bold text-xs md:text-sm">Recovery Email Sent!</h3>
                <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed">
                  We have sent your secure credentials to <strong className="break-all">{recoveryEmail}</strong>. Please check your inbox.
                </p>
                <button type="button" onClick={() => {setIsForgotPassword(false); setRecoverySuccess(false); setRecoveryEmail("");}} className="text-white hover:text-blue-400 text-xs font-bold underline mt-4 block w-full transition-colors">
                  Return to Login
                </button>
              </div>
            ) : (
              <>
                <p className="text-[11px] md:text-xs text-zinc-400 text-center px-2 md:px-4 leading-relaxed">Enter your registered admin email to receive a secure recovery email containing your credentials.</p>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 md:pl-4 flex items-center pointer-events-none">
                    <Mail size={14} className="text-zinc-500 group-focus-within:text-blue-500 transition-colors md:w-4 md:h-4" />
                  </div>
                  <input 
                    type="email" required disabled={isLoading} value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-xl pl-9 md:pl-11 pr-4 py-3 md:py-3.5 text-xs md:text-sm text-white outline-none focus:border-blue-500 transition-all shadow-sm disabled:opacity-50"
                    placeholder="Admin Email Address"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-3.5 rounded-xl text-xs md:text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]">
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Send Recovery Link'}
                </button>
                <button type="button" onClick={() => {setIsForgotPassword(false); setError("");}} className="w-full text-zinc-500 hover:text-white text-[11px] md:text-xs font-bold py-2 transition-colors outline-none">
                  Cancel
                </button>
              </>
            )}
          </form>
        ) : (
          
          /* LOGIN FLOW */
          <form onSubmit={handleLogin} className="w-full space-y-4 md:space-y-5 relative z-10 animate-in fade-in zoom-in-95 duration-300">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-2.5 md:p-3 rounded-lg flex items-center justify-center gap-2 text-red-500 text-[11px] md:text-xs font-bold animate-in shake">
                <AlertCircle size={14} className="shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-3 md:space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 md:pl-4 flex items-center pointer-events-none">
                  <User size={14} className="text-zinc-500 group-focus-within:text-blue-500 transition-colors md:w-4 md:h-4" />
                </div>
                <input 
                  type="text" required disabled={isLoading || isFadingOut} value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl pl-9 md:pl-11 pr-4 py-3 md:py-3.5 text-xs md:text-sm text-white outline-none focus:border-blue-500 transition-all shadow-sm disabled:opacity-50"
                  placeholder="Username" autoComplete="off"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 md:pl-4 flex items-center pointer-events-none">
                  <Lock size={14} className="text-zinc-500 group-focus-within:text-blue-500 transition-colors md:w-4 md:h-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required disabled={isLoading || isFadingOut} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl pl-9 md:pl-11 pr-10 md:pr-12 py-3 md:py-3.5 text-xs md:text-sm text-white outline-none focus:border-blue-500 transition-all shadow-sm disabled:opacity-50"
                  placeholder="Password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center text-zinc-500 hover:text-white transition-colors outline-none"
                >
                  {showPassword ? <EyeOff size={14} className="md:w-4 md:h-4" /> : <Eye size={14} className="md:w-4 md:h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => {setIsForgotPassword(true); setError("");}} className="text-[10px] md:text-xs font-medium text-zinc-500 hover:text-blue-400 transition-colors outline-none">
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit" disabled={isLoading || isFadingOut}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 md:py-3.5 rounded-xl text-xs md:text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Authenticate <ArrowRight size={14} className="md:w-4 md:h-4" /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginOverlay;