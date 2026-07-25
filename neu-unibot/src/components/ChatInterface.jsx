import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import QuickActionsCompact from "./QuickActionsCompact";

// Use environment variable for API URL, or default to relative path
const API_URL = import.meta.env.VITE_API_URL || "/api/chat";

const SUGGESTED_QUESTIONS = {
  admissions: [
    "How do I apply to NEU?",
    "What are the admission requirements?",
    "Tell me about tuition fees",
    "How do I get a student residence permit?",
  ],
  "campus-navigation": [
    "Where is the International Students Office?",
    "Show me the Grand Library location",
    "Find the Near East Bank on campus",
    "Where is the Post Office?",
  ],
  general: [
    "What student services are available?",
    "How can I contact the university?",
    "Tell me about NEU",
    "What faculties does NEU have?",
  ],
};

export default function ChatInterface({ initialCategory = "general" }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      type: "text",
      text: "Hi there! 👋 I'm your NEU UniBot assistant. How can I help you today?",
      timestamp: formatTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [lastSuggestionCategory, setLastSuggestionCategory] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  const messagesEndRef = useRef(null);

  function formatTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    try {
      const baseUrl = API_URL.replace(/\/api\/chat.*/, "");
      const res = await fetch(`${baseUrl}/health`, { cache: "no-store" });
      setIsOnline(res.ok);
    } catch {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!selectedCategory) return;
    if (lastSuggestionCategory === selectedCategory) return;
    showCategorySuggestions(selectedCategory);
    setLastSuggestionCategory(selectedCategory);
  }, [selectedCategory]);

  const showCategorySuggestions = (category) => {
    const suggestions = SUGGESTED_QUESTIONS[category] || SUGGESTED_QUESTIONS.general;
    const labels = {
      admissions: "Admissions",
      "campus-navigation": "Campus Navigation",
      general: "General Info",
    };

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        type: "suggestions",
        category,
        suggestions,
        text: `Explore ${labels[category]}:`,
        timestamp: formatTime(),
      },
    ]);
  };

  const sendMessage = async (text, category = selectedCategory) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", type: "text", text: trimmed, timestamp: formatTime() },
    ]);

    setInput("");
    setIsTyping(true);
    setLastSuggestionCategory(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const res = await fetch(`${API_URL}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, category }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          type: data.data.type || "text",
          text: data.data.type === "text" ? data.data.message : "",
          data: data.data.type === "map" ? data.data : undefined,
          timestamp: formatTime(),
        },
      ]);
    } catch (error) {
       console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      
      {/* Category Tabs Section */}
      <div className="flex-shrink-0 z-10 px-4 py-2 mt-2">
        <div className="max-w-4xl mx-auto glass rounded-2xl p-2 flex items-center justify-between shadow-lg">
          <div className="overflow-x-auto flex-1 mr-4">
             <QuickActionsCompact onActionClick={setSelectedCategory} activeCategory={selectedCategory} />
          </div>
          <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${isOnline ? "text-white bg-green-600 shadow-sm" : "text-white bg-[#a81c1c] shadow-sm"}`}>
            {isOnline ? "System Online" : "Connecting..."}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((msg, i) =>
            msg.type === "suggestions" ? (
              <div key={i} className="animate-fadeIn">
                <div className="glass rounded-[2rem] p-6 border-white/10 max-w-2xl">
                  <p className="font-bold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2">
                    <span className="text-xl">✨</span> {msg.text}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {msg.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(s)}
                        className="px-4 py-3 rounded-2xl bg-white/40 dark:bg-gray-800/40 hover:bg-[#a81c1c] dark:hover:bg-[#a81c1c] text-gray-700 dark:text-gray-300 hover:text-white text-xs font-bold transition-all border border-black/5 dark:border-white/5 text-left active:scale-95"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <MessageBubble key={i} {...msg} />
            )
          )}

          {isTyping && (
            <div className="flex items-center gap-4 px-4 py-2 animate-fadeIn">
              <div className="flex gap-1.5 p-3 glass rounded-2xl">
                <div className="w-1.5 h-1.5 bg-[#a81c1c] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-[#a81c1c] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-[#a81c1c] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UniBot is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Modern Floating Input Area */}
      <div className="flex-shrink-0 p-4 md:p-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) sendMessage(input); }} className="relative group animate-slideUp">
            <div className="relative glass rounded-[2.5rem] p-2 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about NEU..."
                className="flex-1 px-6 py-3 bg-transparent text-gray-800 dark:text-white focus:outline-none placeholder-gray-400 font-semibold text-sm md:text-base"
                disabled={!isOnline}
              />
              <button
                type="submit"
                disabled={!input.trim() || !isOnline}
                className="bg-[#a81c1c] text-white px-6 md:px-10 py-3 rounded-[2rem] font-extrabold text-[10px] md:text-sm tracking-widest shadow-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 uppercase"
              >
                Send 🚀
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}