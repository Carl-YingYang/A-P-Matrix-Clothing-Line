import { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, Info, Loader2 } from 'lucide-react';

type DialogOptions = {
  title: string;
  message: string;
  type: 'alert' | 'confirm';
  confirmText?: string;
  cancelText?: string;
};

type DialogContextType = {
  showAlert: (title: string, message: string) => Promise<void>;
  showConfirm: (title: string, message: string) => Promise<boolean>;
  showLoading: (message: string) => void;
  hideLoading: () => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useDialog must be used within DialogProvider");
  return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);
  
  // LOADING STATE
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');

  const showAlert = (title: string, message: string) => {
    return new Promise<void>((resolve) => {
      setOptions({ title, message, type: 'alert', confirmText: 'Okay' });
      setResolvePromise(() => () => resolve());
      setIsOpen(true);
    });
  };

  const showConfirm = (title: string, message: string) => {
    return new Promise<boolean>((resolve) => {
      setOptions({ title, message, type: 'confirm', confirmText: 'Confirm', cancelText: 'Cancel' });
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  };

  const showLoading = (message: string = "Processing...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(false);
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm, showLoading, hideLoading }}>
      {children}
      
      {/* ======================================================================= */}
      {/* 🔥 GLOBAL LOADING UI 🔥 */}
      {/* ======================================================================= */}
      {isLoading && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center gap-4 zoom-in-95 animate-in duration-200 min-w-[200px] sm:min-w-[250px] max-w-[90vw]">
            <Loader2 size={40} className="text-blue-600 animate-spin" />
            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white animate-pulse text-center px-2">
              {loadingMessage}
            </p>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 🔥 GLOBAL MODAL UI (CONFIRM / ALERT) 🔥 */}
      {/* ======================================================================= */}
      {isOpen && options && !isLoading && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800 w-full max-w-sm rounded-3xl shadow-2xl p-5 sm:p-6 zoom-in-95 animate-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 ${options.type === 'confirm' ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-500'}`}>
                {options.type === 'confirm' ? <AlertTriangle size={28} className="sm:w-8 sm:h-8" /> : <Info size={28} className="sm:w-8 sm:h-8" />}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">{options.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mb-6 sm:mb-8 whitespace-pre-wrap">{options.message}</p>
            </div>
            
            <div className="flex gap-3 w-full">
              {options.type === 'confirm' && (
                <button onClick={handleCancel} className="flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-zinc-300 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                  {options.cancelText}
                </button>
              )}
              <button 
                onClick={handleConfirm} 
                className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold text-white transition-colors shadow-md ${options.type === 'confirm' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};