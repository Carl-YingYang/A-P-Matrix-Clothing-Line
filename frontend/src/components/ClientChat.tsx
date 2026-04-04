import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Trash2, CheckCircle2, Copy, Check, Reply, X, Pencil, Package, ExternalLink } from 'lucide-react';

interface ClientChatProps { orderId: number; userEmail: string; userName: string; }
interface Message { id: number; sender_name: string; sender_email: string; text: string; created_at: string; is_mine: boolean; is_read?: boolean; }

const ClientChat = ({ orderId, userEmail, userName }: ClientChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/messages/${orderId}?user_email=${userEmail}`);
      if (res.ok) {
        const data = await res.json();
        if(Array.isArray(data)) setMessages(data);
      }
    } catch (e) { }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
  }, [orderId, userEmail]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      if (editingMsgId) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/v1/messages/${editingMsgId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_email: userEmail, new_text: newMessage.trim() })
        });
      } else {
        let finalMessage = newMessage.trim();
        if (replyTo) finalMessage = `┌── Replying to ${replyTo.sender_name}\n│ ${replyTo.text.replace(/\n/g, ' ')}\n└──\n${finalMessage}`;

        await fetch(`${import.meta.env.VITE_API_URL}/api/v1/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId, sender_email: userEmail, sender_name: userName, message_text: finalMessage })
        });
      }
      setNewMessage(""); setReplyTo(null); setEditingMsgId(null); await fetchMessages();
    } catch (e) { } finally { setIsSending(false); }
  };

  const handleEditInit = (msg: Message) => {
    setEditingMsgId(msg.id); setReplyTo(null);
    setNewMessage(msg.text.replace(' (Edited)', '').replace(/\[TECH_PACK\][\s\S]*?\[\/TECH_PACK\]/, '[TECHPACK DATA]')); 
  };

  const handleDelete = async (msgId: number) => {
    if(!window.confirm("Unsend this message for everyone?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/v1/messages/${msgId}?user_email=${userEmail}`, { method: 'DELETE' });
      await fetchMessages();
    } catch (e) { }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(`REQ-${orderId}`);
    setCopiedId('ref');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyMessage = (id: number, text: string) => {
    const cleanText = text.replace(/^┌── Replying to .*?\n│ .*?\n└──\n/, '').replace(' (Edited)', '');
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  // 💡 NEW: TEXT LINK PARSER PARA MAGING BUTTON ANG MGA LINKS 💡
  const renderTextWithLinks = (text: string, isMine: boolean) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        let label = "Open Link";
        let colorClass = isMine ? "bg-white/10 hover:bg-white/20 text-white" : "bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border-blue-500/30";
        if (part.includes('paymongo')) { label = "💳 Proceed to Secure Payment"; colorClass = isMine ? "bg-white/20 hover:bg-white/30 text-white" : "bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/30"; }
        if (part.includes('calendly')) { label = "📅 Book Consultation Schedule"; colorClass = isMine ? "bg-white/20 hover:bg-white/30 text-white" : "bg-purple-500/10 hover:bg-purple-600 text-purple-400 hover:text-white border-purple-500/30"; }

        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={`mt-2 mb-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold transition-all shadow-sm no-underline max-w-fit ${colorClass}`}>
            {label} <ExternalLink size={12}/>
          </a>
        );
      }
      return <span key={i} className="whitespace-pre-wrap break-words leading-relaxed">{part}</span>;
    });
  };

  const renderMessageText = (text: string, isMine: boolean) => {
    if (text === "[Message unsent]") return <span className="italic opacity-70">Message unsent</span>;

    let content = text;
    const isEdited = content.endsWith(" (Edited)");
    if (isEdited) content = content.replace(" (Edited)", "");

    let replyBlock = null;
    const replyRegex = /^┌── Replying to (.*?)\n│ (.*?)\n└──\n([\s\S]*)$/;
    const replyMatch = content.match(replyRegex);
    if (replyMatch) {
       replyBlock = (
         <div className={`text-[10px] pl-2.5 py-1.5 border-l-2 rounded-r-md mb-2 ${isMine ? 'bg-black/20 border-white/50 text-white/80' : 'bg-black/10 border-gray-400 text-gray-500'}`}>
            <span className="font-bold">{replyMatch[1]}</span><br/>
            <span className="line-clamp-1 italic">{replyMatch[2].replace(/\[TECH_PACK\][\s\S]*?\[\/TECH_PACK\]/g, '[Tech Pack Attached]')}</span>
         </div>
       );
       content = replyMatch[3];
    }

    const jsonRegex = /\[TECH_PACK\]([\s\S]*?)\[\/TECH_PACK\]/;
    const jsonMatch = content.match(jsonRegex);
    
    let finalUI;
    if (jsonMatch) {
       try {
         const data = JSON.parse(jsonMatch[1].trim());
         const parts = content.split(jsonMatch[0]);
         
         finalUI = (
           <div className="flex flex-col gap-2 w-full max-w-[300px] md:max-w-md">
             {parts[0].trim() && renderTextWithLinks(parts[0], isMine)}
             
             <div className={`rounded-xl border p-4 text-left w-full shadow-inner ${isMine ? 'bg-black/20 border-white/20 text-white' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200'}`}>
               <div className={`flex items-center justify-between mb-3 border-b pb-2 ${isMine ? 'border-white/10' : 'border-zinc-300 dark:border-zinc-700/50'}`}>
                 <div className="flex items-center gap-2">
                   <Package size={16} className={isMine ? "text-blue-300" : "text-blue-500"} />
                   <span className="text-[11px] font-bold uppercase tracking-widest">Order Details</span>
                 </div>
                 <span className="text-[10px] font-mono opacity-70">{String(data.id).replace('REQ-', '')}</span>
               </div>
               
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <div><p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">Service</p><p className="text-xs font-bold leading-tight">{data.service} <span className="opacity-70 font-normal">({data.quantity} pcs)</span></p></div>
                 <div><p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">Budget</p><p className="text-xs font-bold text-emerald-400">{data.budget}</p></div>
                 <div><p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">Company</p><p className="text-xs font-bold truncate">{data.company}</p></div>
                 <div><p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">Phone</p><p className="text-xs font-bold">{data.phone}</p></div>
               </div>

               <details className={`cursor-pointer rounded-lg border ${isMine ? 'bg-black/10 border-white/10' : 'bg-black/5 dark:bg-black/20 border-gray-200 dark:border-zinc-700'} p-2.5 transition-all`}>
                  <summary className="text-[10px] font-bold uppercase tracking-widest flex items-center outline-none select-none hover:opacity-80">📋 View Specifications</summary>
                  <div className={`mt-2 text-[10px] font-mono whitespace-pre-wrap opacity-90 border-t pt-2 ${isMine ? 'border-white/10' : 'border-gray-200 dark:border-zinc-700'}`}>{data.details}</div>
               </details>
             </div>

             {parts[2].trim() && renderTextWithLinks(parts[2], isMine)}
           </div>
         );
       } catch (e) {
         finalUI = renderTextWithLinks(content.replace(/\[TECH_PACK\]|\[\/TECH_PACK\]/g, ''), isMine);
       }
    } else {
       finalUI = renderTextWithLinks(content, isMine);
    }

    return (
      <div className="flex flex-col">
        {replyBlock}
        {finalUI}
        {isEdited && <span className="text-[9px] opacity-60 mt-1 self-end italic font-medium tracking-wide">Edited</span>}
      </div>
    );
  };

  const myMessages = messages.filter(m => m.is_mine);
  const lastMyMsgId = myMessages.length > 0 ? myMessages[myMessages.length - 1].id : null;

  return (
    <div className="border border-zinc-800/80 rounded-3xl bg-[#0c0c0e] h-[500px] flex flex-col overflow-hidden animate-in fade-in duration-300 shadow-2xl relative">
      <div className="p-5 border-b border-zinc-800/80 bg-[#050505] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">Production Team Line</p>
        </div>
        <button onClick={handleCopyId} className="flex items-center gap-1.5 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-md border border-zinc-800 text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95" title="Copy Order ID">
          {copiedId === 'ref' ? <Check size={12} className="text-emerald-500"/> : <Copy size={12}/>} REQ-{orderId}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-gradient-to-b from-[#0c0c0e] to-black scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-xs font-medium text-zinc-600"><Send size={32} className="mb-3 opacity-20"/><p>Send a message to start the conversation.</p></div>
        ) : (
          messages.map((msg) => {
            const isUnsent = msg.text === "[Message unsent]";

            return (
              <div key={msg.id} className="flex flex-col w-full group">
                <p className={`text-[9px] text-zinc-500 font-bold mb-1 mx-1 ${msg.is_mine ? 'self-end' : 'self-start'}`}>{msg.is_mine ? 'You' : msg.sender_name} • {msg.created_at}</p>
                
                <div className={`flex items-end gap-2 ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                  {!msg.is_mine && (
                    <>
                      <div className="bg-zinc-800/80 border border-zinc-700/50 text-zinc-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm max-w-[85%]">
                        {renderMessageText(msg.text, false)}
                      </div>
                      {!isUnsent && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all mb-1 shrink-0">
                          <button onClick={() => setReplyTo(msg)} className="p-1.5 text-zinc-500 hover:text-blue-400 rounded-full hover:bg-zinc-800 transition-colors" title="Reply"><Reply size={14} /></button>
                          <button onClick={() => handleCopyMessage(msg.id, msg.text)} className="p-1.5 text-zinc-500 hover:text-emerald-400 rounded-full hover:bg-zinc-800 transition-colors" title="Copy">{copiedId === msg.id ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}</button>
                        </div>
                      )}
                    </>
                  )}

                  {msg.is_mine && (
                    <>
                      {!isUnsent && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all mb-1 shrink-0">
                          <button onClick={() => handleEditInit(msg)} className="p-1.5 text-zinc-500 hover:text-amber-400 rounded-full hover:bg-zinc-800 transition-colors" title="Edit"><Pencil size={14} /></button>
                          <button onClick={() => setReplyTo(msg)} className="p-1.5 text-zinc-500 hover:text-blue-400 rounded-full hover:bg-zinc-800 transition-colors" title="Reply"><Reply size={14} /></button>
                          <button onClick={() => handleCopyMessage(msg.id, msg.text)} className="p-1.5 text-zinc-500 hover:text-emerald-400 rounded-full hover:bg-zinc-800 transition-colors" title="Copy">{copiedId === msg.id ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}</button>
                          <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-zinc-500 hover:text-red-500 rounded-full hover:bg-zinc-800 transition-colors" title="Unsend"><Trash2 size={14} /></button>
                        </div>
                      )}
                      <div className={`px-4 py-3 text-sm shadow-sm max-w-[85%] ${isUnsent ? 'bg-transparent border border-zinc-800 text-zinc-500 italic rounded-2xl px-5' : 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'}`}>
                        {renderMessageText(msg.text, true)}
                      </div>
                    </>
                  )}
                </div>

                {msg.id === lastMyMsgId && msg.is_read && (
                  <p className="text-[9px] text-zinc-400 mt-1 self-end flex items-center gap-1 font-medium animate-in fade-in"><CheckCircle2 size={10} className="text-emerald-500"/> Seen</p>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col bg-[#050505] border-t border-zinc-800/80 shrink-0">
        {(replyTo || editingMsgId) && (
          <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/50 flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex flex-col overflow-hidden">
              <span className={`text-[10px] font-bold flex items-center gap-1 ${editingMsgId ? 'text-amber-400' : 'text-blue-400'}`}>
                {editingMsgId ? <><Pencil size={10}/> Editing Message</> : <><Reply size={10}/> Replying to {replyTo?.sender_name}</>}
              </span>
              <span className="text-xs text-zinc-400 truncate pr-4">{editingMsgId ? "Modifying your previous message..." : replyTo?.text.replace(/^┌── Replying to .*?\n│ .*?\n└──\n/, '').replace(/\[TECH_PACK\][\s\S]*?\[\/TECH_PACK\]/g, '[Tech Pack]')}</span>
            </div>
            <button onClick={() => { setReplyTo(null); setEditingMsgId(null); setNewMessage(""); }} className="p-1.5 text-zinc-500 hover:text-red-400 rounded-full hover:bg-zinc-800 transition-colors"><X size={14} /></button>
          </div>
        )}

        <form onSubmit={handleSend} className="p-4 md:p-5 flex gap-3">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={editingMsgId ? "Type edited message..." : replyTo ? "Type your reply..." : "Type your message... (Press Enter to send)"} 
            className="flex-1 bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner" 
          />
          <button type="submit" disabled={!newMessage.trim() || isSending} className={`px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center min-w-[100px] ${!newMessage.trim() || isSending ? 'bg-blue-900/30 text-blue-400/30 cursor-not-allowed border border-blue-900/50' : editingMsgId ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-md shadow-amber-500/20' : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-500/20'}`}>
            {isSending ? <Loader2 size={16} className="animate-spin" /> : editingMsgId ? <Check size={16} /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientChat;