import { useState, useEffect, useRef } from 'react';
import { Search, Send, Loader2, MessageSquare, Clock, Copy, Check, Calendar, CreditCard, Trash2, CheckCircle2, Reply, X, Pencil, Package, ExternalLink } from 'lucide-react';
import { useDialog } from '../components/DialogProvider';

interface Conversation { order_id: number; client_name: string; client_email: string; last_message: string; last_time: string; unread: number; invoice_id?: string; }
interface Message { id: number; sender_name: string; sender_email: string; text: string; created_at: string; is_mine: boolean; is_read?: boolean; }

const Inbox = () => {
  const { showConfirm, showAlert } = useDialog();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const ADMIN_EMAIL = "admin@apmatrix.ph"; 

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
           const active = data.filter((i: any) => i.status !== 'New' && i.status !== 'Pending Payment' && i.status !== 'Refunded' && i.status !== 'Rejected');
           const formatted = active.map((i: any) => ({
             order_id: i.id, client_name: i.full_name || 'Unknown Client', client_email: i.email || 'No Email', last_message: "Click to open chat", last_time: "", unread: 0, invoice_id: i.invoice_id
           }));
           setConversations(formatted);
        }
      }
    } catch(e) { } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchConversations(); }, []);

  const fetchMessages = async (orderId: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/messages/${orderId}?user_email=${ADMIN_EMAIL}`);
      if (res.ok) {
          const data = await res.json();
          if(Array.isArray(data)) setMessages(data);
      }
    } catch(e) { }
  };

  useEffect(() => {
    if (!activeChat) return;
    fetchMessages(activeChat.order_id);
    const interval = setInterval(() => fetchMessages(activeChat.order_id), 3000); 
    return () => clearInterval(interval);
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    let textToSend = textOverride || newMessage.trim();
    if (!textToSend || !activeChat || isSending) return;

    setIsSending(true);
    try {
      if (editingMsgId && !textOverride) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/v1/messages/${editingMsgId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_email: ADMIN_EMAIL, new_text: textToSend })
        });
      } else {
        if (replyTo && !textOverride) textToSend = `┌── Replying to ${replyTo.sender_name}\n│ ${replyTo.text.replace(/\n/g, ' ')}\n└──\n${textToSend}`;
        
        await fetch(`${import.meta.env.VITE_API_URL}/api/v1/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: activeChat.order_id, sender_email: ADMIN_EMAIL, sender_name: "A&P Admin", message_text: textToSend })
        });
      }
      setNewMessage(""); setReplyTo(null); setEditingMsgId(null); await fetchMessages(activeChat.order_id);
    } catch (e) { } finally { setIsSending(false); }
  };

  const handleEditInit = (msg: Message) => {
    setEditingMsgId(msg.id); setReplyTo(null);
    setNewMessage(msg.text.replace(' (Edited)', '').replace(/\[TECH_PACK\][\s\S]*?\[\/TECH_PACK\]/, '[TECHPACK DATA]')); 
  };

  const handleDelete = async (msgId: number) => {
    const ok = await showConfirm("Unsend Message", "Are you sure you want to unsend this message for everyone?");
    if (!ok) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/v1/messages/${msgId}?user_email=${ADMIN_EMAIL}`, { method: 'DELETE' });
      await fetchMessages(activeChat!.order_id);
    } catch (e) { showAlert("Error", "Failed to delete message."); }
  };

  const handleCopyId = () => {
    if(!activeChat) return;
    navigator.clipboard.writeText(`REQ-${activeChat.order_id}`);
    setCopiedId('ref');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyMessage = (id: number, text: string) => {
    const cleanText = text.replace(/^┌── Replying to .*?\n│ .*?\n└──\n/, '').replace(' (Edited)', '');
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 💡 IMPROVED GRAMMAR SA AUTO-MESSAGES 💡
  const sendQuickLink = (type: 'calendly' | 'payment') => {
    if (type === 'calendly') handleSend(undefined, "Hello! Let's arrange a quick meeting to finalize the details of your project. Please select a time that works best for you using this link: https://calendly.com/carlmickynieva/a-p-design-consultation");
    else if (type === 'payment' && activeChat?.invoice_id) handleSend(undefined, `Good news, your quotation is ready! To proceed to production, please secure your downpayment via our official PayMongo portal here: https://paymongo.page/l/${activeChat.invoice_id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const renderTextWithLinks = (text: string, isMine: boolean) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        let label = "Open Link";
        let colorClass = isMine ? "bg-white/10 hover:bg-white/20 text-white" : "bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border-blue-500/30";
        if (part.includes('paymongo')) { label = "💳 Proceed to Secure Payment"; colorClass = isMine ? "bg-white/20 hover:bg-white/30 text-white border-white/20" : "bg-emerald-500/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border-emerald-500/30"; }
        if (part.includes('calendly')) { label = "📅 Book Consultation Schedule"; colorClass = isMine ? "bg-white/20 hover:bg-white/30 text-white border-white/20" : "bg-purple-500/10 hover:bg-purple-600 text-purple-500 hover:text-white border-purple-500/30"; }

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
             
             <div className={`rounded-xl border p-4 text-left w-full shadow-sm ${isMine ? 'bg-black/20 border-white/20 text-white' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200'}`}>
               <div className={`flex items-center justify-between mb-3 border-b pb-2 ${isMine ? 'border-white/10' : 'border-gray-200 dark:border-zinc-700/50'}`}>
                 <div className="flex items-center gap-2">
                   <Package size={16} className={isMine ? "text-blue-300" : "text-blue-500"} />
                   <span className="text-[11px] font-bold uppercase tracking-widest">Order Details</span>
                 </div>
                 <span className="text-[10px] font-mono opacity-70">{String(data.id).replace('REQ-', '')}</span>
               </div>
               
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <div><p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">Service</p><p className="text-xs font-bold leading-tight">{data.service} <span className="opacity-70 font-normal">({data.quantity} pcs)</span></p></div>
                 <div><p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">Budget</p><p className="text-xs font-bold text-emerald-500 dark:text-emerald-400">{data.budget}</p></div>
                 <div><p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">Company</p><p className="text-xs font-bold truncate">{data.company}</p></div>
                 <div><p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">Phone</p><p className="text-xs font-bold">{data.phone}</p></div>
               </div>

               <details className={`cursor-pointer rounded-lg border ${isMine ? 'bg-black/10 border-white/10' : 'bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-zinc-700'} p-2.5 transition-all`}>
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
    <div className="h-[calc(100vh-100px)] flex bg-white dark:bg-[#0c0c0e] rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm animate-in fade-in duration-300">
      <div className="w-1/3 min-w-[280px] border-r border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#050505] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Messages</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search client..." className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? ( <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500"/></div> ) : conversations.length === 0 ? ( <div className="p-8 text-center text-xs text-gray-500 dark:text-zinc-500">No active projects found.</div> ) : (
            conversations.map(conv => (
              <div key={conv.order_id} onClick={() => setActiveChat(conv)} className={`p-4 border-b border-gray-100 dark:border-zinc-800/50 cursor-pointer transition-colors ${activeChat?.order_id === conv.order_id ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : 'hover:bg-gray-100 dark:hover:bg-zinc-900 border-l-4 border-l-transparent'}`}>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{conv.client_name}</p>
                  <p className="text-[10px] text-gray-500 font-mono">REQ-{conv.order_id}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-[#0c0c0e]">
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] flex justify-between items-center shadow-sm z-10 shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{activeChat.client_name}</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{activeChat.client_email}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => sendQuickLink('calendly')} className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Send Calendly Link"><Calendar size={18} /></button>
                <button onClick={() => sendQuickLink('payment')} className="p-2 text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Send Payment Link"><CreditCard size={18} /></button>
                <div className="h-6 w-px bg-gray-200 dark:bg-zinc-800 mx-1"></div>
                <button onClick={handleCopyId} className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors">
                  {copiedId === 'ref' ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>} REQ-{activeChat.order_id}
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-gray-50/50 dark:bg-black/20 scroll-smooth">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-xs text-gray-400"><MessageSquare size={32} className="mb-3 opacity-20"/><p>No messages yet. Send an update to the client!</p></div>
              ) : (
                messages.map((msg) => {
                  const isUnsent = msg.text === "[Message unsent]";

                  return (
                    <div key={msg.id} className="flex flex-col w-full group">
                      <p className={`text-[9px] text-gray-500 dark:text-zinc-500 font-bold mb-1 mx-1 ${msg.is_mine ? 'self-end' : 'self-start'}`}>{msg.is_mine ? 'You (Admin)' : msg.sender_name} • {msg.created_at}</p>
                      
                      <div className={`flex items-end gap-2 ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                        {!msg.is_mine && (
                          <>
                            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm max-w-[85%]">
                              {renderMessageText(msg.text, false)}
                            </div>
                            {!isUnsent && (
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all mb-1 shrink-0">
                                <button onClick={() => setReplyTo(msg)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" title="Reply"><Reply size={14} /></button>
                                <button onClick={() => handleCopyMessage(msg.id, msg.text)} className="p-1.5 text-gray-400 hover:text-emerald-500 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" title="Copy">{copiedId === msg.id ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}</button>
                              </div>
                            )}
                          </>
                        )}

                        {msg.is_mine && (
                          <>
                            {!isUnsent && (
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all mb-1 shrink-0">
                                <button onClick={() => handleEditInit(msg)} className="p-1.5 text-gray-400 hover:text-amber-500 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" title="Edit"><Pencil size={14} /></button>
                                <button onClick={() => setReplyTo(msg)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" title="Reply"><Reply size={14} /></button>
                                <button onClick={() => handleCopyMessage(msg.id, msg.text)} className="p-1.5 text-gray-400 hover:text-emerald-500 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" title="Copy">{copiedId === msg.id ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}</button>
                                <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" title="Unsend"><Trash2 size={14} /></button>
                              </div>
                            )}
                            <div className={`px-4 py-3 text-sm shadow-sm max-w-[85%] ${isUnsent ? 'bg-transparent border border-gray-300 dark:border-zinc-700 text-gray-500 italic rounded-2xl px-5' : 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'}`}>
                              {renderMessageText(msg.text, true)}
                            </div>
                          </>
                        )}
                      </div>

                      {msg.id === lastMyMsgId && msg.is_read && (
                        <p className="text-[9px] text-gray-400 dark:text-zinc-500 mt-1 self-end flex items-center gap-1 font-medium animate-in fade-in"><CheckCircle2 size={10} className="text-emerald-500"/> Seen</p>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex flex-col bg-white dark:bg-[#0c0c0e] border-t border-gray-200 dark:border-zinc-800 shrink-0">
              {(replyTo || editingMsgId) && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800/50 flex items-center justify-between animate-in slide-in-from-bottom-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${editingMsgId ? 'text-amber-500 dark:text-amber-400' : 'text-blue-500 dark:text-blue-400'}`}>
                      {editingMsgId ? <><Pencil size={10}/> Editing Message</> : <><Reply size={10}/> Replying to {replyTo?.sender_name}</>}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400 truncate pr-4">{editingMsgId ? "Modifying your previous message..." : replyTo?.text.replace(/^┌── Replying to .*?\n│ .*?\n└──\n/, '').replace(/\[TECH_PACK\][\s\S]*?\[\/TECH_PACK\]/g, '[Tech Pack]')}</span>
                  </div>
                  <button onClick={() => { setReplyTo(null); setEditingMsgId(null); setNewMessage(""); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"><X size={14} /></button>
                </div>
              )}
              <form onSubmit={handleSend} className="p-4 md:p-5 flex gap-3">
                <input 
                  type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder={editingMsgId ? "Type edited message..." : replyTo ? "Type your reply..." : "Type your message to the client... (Press Enter to send)"} 
                  className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                />
                <button type="submit" disabled={!newMessage.trim() || isSending} className={`px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center min-w-[100px] ${!newMessage.trim() || isSending ? 'bg-blue-100 text-blue-400 dark:bg-blue-900/30 dark:text-blue-500/50 cursor-not-allowed' : editingMsgId ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/20'}`}>
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : editingMsgId ? <Check size={18} /> : <Send size={18} />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Inbox;