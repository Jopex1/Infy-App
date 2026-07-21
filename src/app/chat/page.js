"use client";
import { useState } from 'react';
import { Send, Bot, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your AI Virtual Doctor. How can I help you and your baby today?", sender: 'doctor' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now(), text: input, sender: 'user' }]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "I understand. Please remember that I am an AI assistant. For serious medical concerns, always consult a human pediatrician.", 
        sender: 'doctor' 
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <Link href="/" className="mr-4 text-primary">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">AI Doctor</h1>
            <p className="text-xs text-green-500 flex items-center gap-1">
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
            <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-primary text-white rounded-tr-sm' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
            }`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="fixed bottom-[64px] left-0 w-full bg-white border-t p-4 flex items-center gap-2 z-10">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..." 
          className="flex-1 bg-gray-100 text-gray-900 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
        <button 
          onClick={handleSend}
          className="w-10 h-10 shrink-0 bg-primary text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
