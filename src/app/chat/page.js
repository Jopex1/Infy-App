"use client";
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Trash2, Loader2, Clock, User, ShieldAlert, Paperclip, Mic, Smile, Activity, Baby, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const STORAGE_KEY = "infy_chat_sessions";
const WELCOME = { id: 1, text: "Hello! I am your Infy AI Doctor. How can I help you and your baby today?", sender: 'doctor', time: new Date().toISOString() };

function formatAiReply(text) {
  if (!text) return "";
  return text.replace(/\*\*/g, "").replace(/\*/g, "");
}

function getDayLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupSessionsByDay(sessions) {
  const groups = {};
  sessions.forEach(session => {
    const label = getDayLabel(session.date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(session);
  });
  return groups;
}

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("ai"); // "ai" | "expert"
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pendingVideoRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSessions(JSON.parse(stored));

    const videoData = localStorage.getItem("infy_ai_video");
    if (videoData) {
      const video = JSON.parse(videoData);
      localStorage.removeItem("infy_ai_video");
      pendingVideoRef.current = video;
    }
  }, []);

  useEffect(() => {
    if (!pendingVideoRef.current) return;
    const video = pendingVideoRef.current;
    pendingVideoRef.current = null;

    const userMsg = {
      id: Date.now(),
      text: `I'd like to learn about this video: ${video.link}\n\nTitle: ${video.title}`,
      sender: "user",
      time: new Date().toISOString(),
    };

    const initialMessages = [WELCOME, userMsg];
    setMessages(initialMessages);
    sendToAi(initialMessages, userMsg.text);
  }, []);

  useEffect(() => {
    if (activeTab === "ai") {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, activeTab]);

  const saveSession = (msgs) => {
    const session = {
      id: activeSession || Date.now().toString(),
      date: new Date().toISOString(),
      preview: msgs.find(m => m.sender === 'user')?.text.substring(0, 35) + (msgs.find(m => m.sender === 'user')?.text.length > 35 ? "..." : "") || "New Consultation",
      messages: msgs,
    };
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== session.id);
      const updated = [session, ...filtered];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setActiveSession(session.id);
  };

  const loadSession = (session) => {
    setActiveSession(session.id);
    setMessages(session.messages);
    setShowHistory(false);
  };

  const startNewChat = () => {
    setActiveSession(null);
    setMessages([WELCOME]);
    setShowHistory(false);
  };

  const deleteSession = (id, e) => {
    e.stopPropagation();
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    if (activeSession === id) startNewChat();
  };

  const clearAll = () => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
    startNewChat();
  };

  const sendToAi = async (currentMessages, textToSend) => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI service unavailable");
      }
      const replyText = formatAiReply(data.reply || "How else can I assist?");
      const reply = { id: Date.now() + 1, text: replyText, sender: "doctor", time: new Date().toISOString() };
      const finalMessages = [...currentMessages, reply];
      setMessages(finalMessages);
      saveSession(finalMessages);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        text: err.message || "I'm having trouble connecting right now. Please try again.",
        sender: "doctor",
        time: new Date().toISOString(),
      };
      setMessages((prev) => {
        const updated = [...prev, errMsg];
        saveSession(updated);
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (overrideText) => {
    const textToSend = typeof overrideText === "string" ? overrideText : input;
    if (!textToSend.trim() || loading) return;
    const userMsg = { id: Date.now(), text: textToSend, sender: "user", time: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    await sendToAi(updatedMessages, textToSend);
  };

  const handleMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      alert("Media upload functionality will be integrated with the backend soon.");
    }
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const grouped = groupSessionsByDay(sessions);

  return (
    <div className="flex flex-col h-[calc(100dvh-72px)] overflow-hidden bg-gray-50 animate-in fade-in duration-300 relative" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
      
      {/* Chat Pattern Background */}
      <div className="fixed inset-0 z-0 pointer-events-none chat-pattern-bg" style={{
        backgroundImage: "url('/chat-pattern.svg')",
        backgroundSize: '200px 200px',
        backgroundRepeat: 'repeat'
      }}></div>

      {/* Tabs Container */}
      <div className="fixed left-0 right-0 max-w-md mx-auto z-20 bg-gray-50 pt-3 pb-1" style={{ top: 'calc(4.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="mx-4 bg-white p-2 rounded-full flex items-center justify-between border border-gray-200 shadow-sm">
          <div className="flex flex-1 items-center gap-1">
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 flex items-center justify-center gap-2 py-1 px-1.5 rounded-full transition-all duration-200 ${
                activeTab === "ai"
                  ? "bg-green-50/50 border border-[#027027] shadow-sm"
                  : "bg-transparent border border-transparent"
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${activeTab === 'ai' ? 'bg-[#027027]' : 'bg-transparent text-gray-500'}`}>
                <Bot size={16} />
              </div>
              <div className="text-left leading-tight overflow-hidden">
                <p className={`font-bold text-sm truncate ${activeTab === 'ai' ? 'text-[#027027]' : 'text-gray-600'}`}>Infy AI Doc</p>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab("expert")}
              className={`flex-1 flex items-center justify-center gap-2 py-1 px-1.5 rounded-full transition-all duration-200 ${
                activeTab === "expert"
                  ? "bg-green-50/50 border border-[#027027] shadow-sm"
                  : "bg-transparent border border-transparent"
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activeTab === 'expert' ? 'bg-[#027027] text-white' : 'bg-transparent text-gray-500'}`}>
                <Stethoscope size={16} />
              </div>
              <div className="text-left leading-tight overflow-hidden">
                <p className={`font-bold text-sm truncate ${activeTab === 'expert' ? 'text-[#027027]' : 'text-gray-600'}`}>Medical Expert</p>
              </div>
            </button>
          </div>
          
          {activeTab === "ai" && (
            <button onClick={() => setShowHistory(true)} className="text-[#027027] p-2.5 ml-1 active:scale-95 transition">
              <Clock size={20} />
            </button>
          )}
        </div>
      </div>


      {activeTab === "ai" ? (
        <>
          {/* Sidebar Drawer */}
          {showHistory && (
            <>
              {/* Overlay */}
              <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowHistory(false)} />
              
              {/* Drawer Container */}
              <div className="fixed inset-y-0 right-0 z-40 w-4/5 max-w-xs bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10" style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top,0px))' }}>
                  <span className="font-bold text-gray-700 text-sm">Recent Chats</span>
                  <button onClick={() => setShowHistory(false)} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 bg-gray-100 rounded-full active:scale-95 transition">
                    Close
                  </button>
                </div>
                
                <div className="p-4 border-b border-gray-100 space-y-2">
                  <button onClick={startNewChat} className="w-full border border-[#027027] text-[#027027] hover:bg-green-50 font-bold py-2.5 rounded-xl text-sm active:scale-95 transition">
                    + New Conversation
                  </button>
                  <button onClick={clearAll} className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-bold py-2.5 rounded-xl text-sm active:scale-95 transition">
                    Clear All History
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {sessions.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No conversations yet.</p>}
                  {Object.entries(grouped).map(([dayLabel, daySessions]) => (
                    <div key={dayLabel}>
                      <div className="px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wide">{dayLabel}</div>
                      {daySessions.map(session => (
                        <div key={session.id} onClick={() => loadSession(session)}
                          className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-green-50 transition ${activeSession === session.id ? 'bg-green-50 border-l-2 border-l-[#027027]' : ''}`}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{session.preview}</p>
                            <p className="text-xs text-gray-400">{new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <button onClick={(e) => deleteSession(session.id, e)} className="ml-3 text-gray-300 hover:text-red-400 transition active:scale-90 p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 space-y-4 pb-[160px] relative z-10" style={{ paddingTop: '152px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-start gap-2'}`}>
                {msg.sender === 'doctor' && (
                  <div className="w-10 h-10 rounded-full bg-[#027027] flex items-center justify-center text-white shrink-0 relative mt-1">
                    <Bot size={22} />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#027027] border-2 border-white rounded-full"></div>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl p-3.5 shadow-sm text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#027027] text-white rounded-tr-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm chat-ai-response'
                }`}>
                  {msg.sender === 'user' ? (
                    <p>{msg.text}</p>
                  ) : (
                    <div
                      className="chat-ai-response prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatAiReply(msg.text) }}
                    />
                  )}
                  {msg.time && <p className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-green-200' : 'text-gray-400'}`}>
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#027027]/20 rounded-2xl rounded-tl-sm p-3.5 shadow-sm flex items-center gap-2 text-xs text-[#027027] dark:text-green-300 dark:border-green-800/40">
                  <Loader2 size={16} className="animate-spin text-[#027027]" />
                  <span>Infy AI Doctor is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>


          {/* Prompts and Input Wrapper */}
          <div className="fixed left-0 right-0 bg-gray-50 flex flex-col gap-2 z-10 max-w-md mx-auto px-4 py-3" style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
            {/* Prompts */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#027027] bg-white text-[#027027] text-xs font-semibold whitespace-nowrap shadow-sm active:bg-green-50" onClick={() => handleSend("Baby has fever")}>
                <Smile size={16} />
                Baby has fever
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#027027] bg-white text-[#027027] text-xs font-semibold whitespace-nowrap shadow-sm active:bg-green-50" onClick={() => handleSend("Diaper rash-help")}>
                <Baby size={16} />
                Diaper rash-help
              </button>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-full p-1.5 shadow-sm">
                <button type="button" onClick={handleMediaClick} className="w-8 h-8 rounded-full bg-[#027027] text-white flex items-center justify-center shrink-0">
                  <Paperclip size={16} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message.."
                  disabled={loading}
                  className="flex-1 bg-transparent text-gray-900 px-3 outline-none text-sm disabled:opacity-50"
                />
                <button type="button" onClick={startRecording} className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition ${isRecording ? 'text-red-500 animate-pulse' : 'text-[#027027]'}`}>
                  <Mic size={18} />
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-11 h-11 shrink-0 bg-[#027027] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto overscroll-y-contain p-6 space-y-6 pb-[100px] relative z-10" style={{ paddingTop: '152px' }}>
          <div className="bg-[#027027]/5 border border-[#027027]/10 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#027027] shrink-0">
                <User size={24} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg leading-tight">Consult a Pediatrician</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Have a specific question that requires human medical expertise? Send a message directly to our licensed pediatric consultants. We'll get back to you within 24 hours.
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const subject = encodeURIComponent(e.target.subject.value);
            const message = encodeURIComponent(e.target.message.value);
            window.location.href = `mailto:infysupport5@gmail.com?subject=${subject}&body=${message}`;
          }} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Subject</label>
              <input required name="subject" type="text" placeholder="e.g., Baby's teething fever help"
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#027027] text-sm text-gray-800" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Your Message</label>
              <textarea required name="message" rows={6} placeholder="Describe your baby's symptoms or questions in detail..."
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#027027] text-sm text-gray-800 resize-none" />
            </div>
            <button type="submit" className="w-full bg-[#027027] text-white font-bold py-3.5 rounded-2xl shadow-md active:scale-95 transition">
              Compose Email to Doctor
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
