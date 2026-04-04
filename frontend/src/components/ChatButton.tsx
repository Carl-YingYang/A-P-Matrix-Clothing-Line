import { useState, useEffect, useRef } from 'react';

type Message = {
  id: number;
  text: string;
  sender: 'bot' | 'user';
};

const ChatButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "System Online. Welcome to A&P Clothing Line.", sender: 'bot' },
    { id: 2, text: "HQ: Brooklyn Heights, Tuktukan Subdivision, Guiguinto, Bulacan.", sender: 'bot' },
    { id: 3, text: "I am the A&P Support AI. Do you have any questions about our tailoring services or minimum orders?", sender: 'bot' }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        if (window.scrollY <= 300) setIsOpen(false); 
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // ==========================================
  // REAL AI CONNECTION LOGIC
  // ==========================================
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/ai/client-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { id: Date.now(), text: data.reply, sender: 'bot' }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now(), text: "I'm having trouble connecting to the server. Please try again later.", sender: 'bot' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Network connection error. Please check your internet.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para ma-format ang bold text ng AI
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* ================= CHAT WINDOW ================= */}
      <div 
        className={`fixed bottom-20 md:bottom-24 right-4 md:right-6 w-[calc(100vw-32px)] md:w-80 bg-[#09090b] border border-zinc-800 shadow-2xl rounded-xl md:rounded-sm flex flex-col transition-all duration-300 origin-bottom-right z-50 ${
          isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Chat Header */}
        <div className="bg-[#0c0c0e] border-b border-zinc-800 p-4 rounded-t-xl md:rounded-t-sm flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <h3 className="text-white font-serif tracking-wider text-sm md:text-base">A&P Support</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-full hover:bg-zinc-800">
            <svg className="w-5 h-5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="h-[60vh] md:h-80 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#050505]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[85%] p-3.5 md:p-3 text-[13px] md:text-xs font-light leading-relaxed rounded-lg md:rounded-sm shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-white text-black rounded-tr-sm md:rounded-tr-none' 
                  : 'bg-[#0c0c0e] text-zinc-300 border border-zinc-800 rounded-tl-sm md:rounded-tl-none'
              }`}>
                {formatText(msg.text)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
               <div className="max-w-[85%] p-3.5 md:p-3 text-[13px] md:text-xs font-light bg-[#0c0c0e] text-zinc-500 border border-zinc-800 rounded-lg md:rounded-sm rounded-tl-sm md:rounded-tl-none flex items-center gap-1.5 h-11 md:h-auto">
                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Chat Input Area */}
        <form onSubmit={handleSendMessage} className="p-2.5 md:p-3 border-t border-zinc-800 bg-[#0c0c0e] rounded-b-xl md:rounded-b-sm flex items-center gap-2 shrink-0">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Type your message..." 
            className="flex-1 bg-transparent text-white text-[13px] md:text-xs outline-none px-3 py-2 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || isLoading} 
            className="text-white bg-blue-600 hover:bg-blue-700 disabled:bg-transparent disabled:text-zinc-600 p-2 md:p-1.5 rounded-lg md:rounded transition-colors flex items-center justify-center shrink-0"
          >
            <svg className="w-4 h-4 md:w-4 md:h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </form>
      </div>

      {/* ================= FLOATING BUTTON ================= */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex items-center justify-center w-14 h-14 md:w-14 md:h-14 bg-white border border-zinc-800 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-zinc-200 transition-all duration-300 transform ${isOpen ? 'rotate-12 scale-110 shadow-none' : 'hover:scale-110 hover:-translate-y-1'} rounded-full md:rounded-full group ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {!isOpen && (
          <span className="absolute right-16 md:right-16 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] md:text-[10px] font-bold uppercase tracking-widest px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm rounded-md hidden sm:block">
            Live Support
          </span>
        )}

        {isOpen ? (
           <svg className="w-6 h-6 md:w-6 md:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        ) : (
           <svg className="w-6 h-6 md:w-6 md:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>
    </>
  );
};

export default ChatButton;