import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = "469163347190-1ab8un5jc9aog8l1qifdio088m6s409h.apps.googleusercontent.com";

const ClientLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setStatus(null);
    
    try {
      // DITO YUNG MALI KANINA! INAYOS KO NA PAPUNTANG /auth/google-login
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse['credential'] })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_role', data.user.role); 
        localStorage.setItem('user_email', data.user.email);
        
        setStatus({ type: 'success', message: 'Authentication verified! Securing connection...' });
        
        setTimeout(() => {
          window.location.href = '/client/dashboard';
        }, 1500);

      } else {
        setStatus({ type: 'error', message: data.detail || 'Authentication rejected by server.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Server unreachable. Please check your connection.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setStatus({ type: 'error', message: 'Google sign-in interrupted. Try again.' });
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 font-sans text-white relative overflow-hidden">
        
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-zinc-800/50 w-full max-w-md p-10 rounded-3xl shadow-2xl relative z-10 flex flex-col items-center">
          
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-600 to-transparent opacity-50"></div>
          
          <div className="text-center mb-10 flex flex-col items-center">
             <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-800 to-[#050505] border border-zinc-700/50 flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck size={28} className="text-zinc-300"/>
             </div>
             <h1 className="text-3xl font-serif text-white mb-2 tracking-wide">Client Portal</h1>
             <p className="text-zinc-500 text-[11px] uppercase tracking-[0.1em] max-w-[250px] leading-relaxed">Secure Access via Google SSO</p>
          </div>

          {status && (
            <div className={`w-full p-4 rounded-xl mb-8 flex items-center gap-3 text-sm border backdrop-blur-sm animate-in fade-in zoom-in-95 ${
              status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {status.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              <p className="font-medium">{status.message}</p>
            </div>
          )}

          {isLoading ? (
              <div className="flex flex-col items-center gap-4 mb-8 text-blue-400 h-[40px] justify-center">
                  <Loader2 size={24} className="animate-spin" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Establishing Secure Session...</span>
              </div>
          ) : (
             <div className="w-full h-[40px] mb-8 flex justify-center items-center">
               <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  type="standard"
                  theme="filled_black" 
                  size="large"
                  text="signin_with"
                  shape="pill"
                  width="300"
              />
             </div>
          )}
          
          <div className="pt-8 w-full border-t border-zinc-800/50 text-center">
              <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] font-sans font-bold flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                End-to-End Encrypted
              </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default ClientLogin;