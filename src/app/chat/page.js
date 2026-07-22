"use client";
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your Infy AI Doctor. How can I help you and your baby today?", sender: 'doctor' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: data.reply || "Thank you for your message. How else can I assist?", sender: 'doctor' }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: "I'm having trouble connecting right now. Please check your internet connection and try again.", sender: 'doctor' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 pb-safe">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <Link href="/" className="mr-4 text-[#027027]">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#027027]/10 rounded-full flex items-center justify-center text-[#027027]">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Infy AI Doctor</h1>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              Online
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[140px]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-[#027027] text-white rounded-tr-sm' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
            }`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-3.5 shadow-sm flex items-center gap-2 text-xs text-gray-500">
              <Loader2 size={16} className="animate-spin text-[#027027]" />
              <span>Infy AI Doctor is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="fixed bottom-[72px] left-0 right-0 bg-white border-t p-3 flex items-center gap-2 z-10 max-w-md mx-auto">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Infy Doctor a question..." 
          disabled={loading}
          className="flex-1 bg-gray-100 text-gray-900 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#027027]/50 text-sm disabled:opacity-50"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="w-10 h-10 shrink-0 bg-[#027027] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

