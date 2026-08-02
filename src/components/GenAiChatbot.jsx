/*
 * File Path: src/components/GenAiChatbot.jsx
 * Description: GenAI Chatbot widget component providing live AI assistance for health club queries, workout advice, and portal navigation.
 * Props: role ('admin' | 'member' | 'trainer').
 * Backend Integration: Calls chatbot-service API or genaiService fallback.
 */
import { Bot, Send } from 'lucide-react';
import { useState } from 'react';
import { useGenAiChatbot } from '../controllers/useGenAiChatbot.js';

export default function GenAiChatbot({ role }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const chat = useGenAiChatbot(role);

  const submit = (event) => {
    event.preventDefault();
    chat.sendMessage(text);
    setText('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-20">
      {open && (
        <div className="mb-3 flex h-[430px] w-[min(360px,calc(100vw-40px))] flex-col rounded-xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 font-bold text-ink-900">
            <Bot size={18} /> HealthClub Buddy
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {chat.messages.map((message, index) => (
              <div key={message.id || index} className={`rounded-lg px-3 py-2 text-sm ${message.sender === 'user' ? 'ml-8 bg-teal-700 text-white' : 'mr-8 bg-slate-100 text-slate-700'}`}>
                {message.text}
              </div>
            ))}
            {chat.isLoading && <div className="mr-8 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500">Thinking...</div>}
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t border-slate-200 p-3">
            <input className="field" value={text} onChange={(event) => setText(event.target.value)} placeholder="Ask about plans, classes, attendance..." />
            <button type="submit" className="btn-primary px-3" aria-label="Send"><Send size={17} /></button>
          </form>
        </div>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} className="btn-primary rounded-full px-5 py-3 shadow-lg">
        <Bot size={18} /> HealthClub Buddy
      </button>
    </div>
  );
}
