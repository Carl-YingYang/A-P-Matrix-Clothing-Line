import { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowUp, Copy, RefreshCw, X, Check } from 'lucide-react';

interface Message {
  role: 'ai' | 'user';
  content: string;
  date?: string;
}

const SUGGESTED_PROMPTS = [
  "What items are currently low on stock?",
  "Give me a summary of our active jobs.",
  "Are there any unpaid invoices?",
  "Show me pending client inquiries."
];

const AIAssistant = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      content: 'Hi, I am A&P Matrix AI. I can help you organize tasks, check inventory, or review active jobs. How can I assist you today?',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'Connection to AI failed. Please verify API key.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Network error. AI is offline.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRetry = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content;
    if (lastUserMessage) sendMessage(lastUserMessage);
  };

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
    <div className="flex flex-col h-full w-full bg-[#161618] text-gray-300 font-sans">
      
      {/* HEADER - Responsive Padding */}
      <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 border-b border-[#2a2a2b] shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-500" />
          <span className="text-xs md:text-sm font-semibold text-gray-200">Matrix AI Assistant</span>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 hover:bg-[#262629] rounded-full transition-colors group"
          title="Close AI Assistant"
        >
          <X size={18} className="text-gray-500 group-hover:text-gray-300" />
        </button>
      </div>

      {/* MESSAGES AREA - Responsive Padding and Spacing */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-10 space-y-6 md:space-y-10 custom-scrollbar scroll-smooth">
        <div className="max-w-4xl mx-auto w-full space-y-6 md:space-y-10">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {msg.date && <div className="w-full text-center text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-4 md:mb-6">{msg.date}</div>}
              
              {msg.role === 'user' ? (
                // USER BUBBLE: 90% width on mobile, 80% on desktop
                <div className="bg-[#262629] text-gray-100 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl rounded-tr-none shadow-lg max-w-[90%] md:max-w-[80%] text-sm md:text-base leading-relaxed border border-[#333336]">
                  {msg.content}
                </div>
              ) : (
                // AI BUBBLE
                <div className="flex items-start gap-3 md:gap-4 w-full">
                  <div className="mt-1 p-1.5 bg-[#262629] rounded-lg shrink-0">
                    <Sparkles size={14} className="text-blue-500 md:w-4 md:h-4" />
                  </div>
                  <div className="flex-1 space-y-3 md:space-y-4">
                    <div className="text-sm md:text-[15px] leading-relaxed text-gray-200 whitespace-pre-wrap">
                      {formatText(msg.content)}
                    </div>
                    
                    {/* FUNCTIONAL ACTIONS */}
                    <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                      <button 
                        onClick={() => handleCopy(msg.content, idx)} 
                        className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                      >
                        {copiedIndex === idx ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} 
                        {copiedIndex === idx ? 'Copied' : 'Copy'}
                      </button>
                      <button 
                        onClick={handleRetry} 
                        className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                      >
                        <RefreshCw size={12} /> Try again
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* LOADING INDICATOR */}
          {isLoading && (
            <div className="flex items-start gap-3 md:gap-4 animate-pulse">
              <div className="mt-1 p-1.5 bg-[#262629] rounded-lg shrink-0"><Sparkles size={14} className="text-blue-500" /></div>
              <div className="text-xs md:text-sm text-gray-500 font-medium mt-1">Analyzing database records...</div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-2 md:h-4" />
        </div>
      </div>

      {/* INPUT AREA - Responsive padding and button sizes */}
      <div className="p-4 md:p-6 border-t border-[#2a2a2b] bg-[#161618]">
        <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
          
          {/* SUGGESTIONS */}
          {messages.length <= 2 && !isLoading && (
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <button 
                  key={i} 
                  onClick={() => sendMessage(p)} 
                  className="text-[10px] md:text-[11px] bg-[#1c1c1f] border border-[#2a2a2b] hover:border-blue-500/50 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full transition-all text-gray-400 hover:text-white text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          
          {/* INPUT FORM */}
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="relative group">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              disabled={isLoading}
              placeholder="Ask AI anything..." 
              className="w-full bg-[#1c1c1f] border border-[#333336] rounded-2xl pl-4 md:pl-5 pr-12 md:pr-14 py-3 md:py-4 text-xs md:text-sm text-white outline-none focus:border-blue-600 transition-all placeholder-gray-600 disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading} 
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-30 disabled:grayscale"
            >
              <ArrowUp size={16} strokeWidth={3} className="md:w-[18px] md:h-[18px]" />
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};

export default AIAssistant;