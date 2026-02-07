import { useEffect, useRef, useState } from 'react';
import api from '../services/api';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);
    try {
      const context = messages
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
      const res = await api.sendChatMessage(trimmed, context);
      const reply = (res as any)?.data?.reply || 'Sorry, I could not respond.';
      const botMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (e: any) {
      // Surface actual backend error message for debugging
      const errMsg = (e && e.message) ? String(e.message) : 'There was an error sending your message.';
      const botMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: errMsg };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-md">
      <div ref={listRef} className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-3 min-h-full justify-end">
          {messages.map(m => (
            <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block px-3 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-sm text-gray-500">Ask about balances, transactions, goals, budgeting tips, or how to use payments.</div>
          )}
        </div>
      </div>
      <div className="p-2 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 focus:outline-none"
          placeholder="Type your question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" onClick={handleSend} disabled={isSending}>
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}


