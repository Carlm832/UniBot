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

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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
  // React-state toast (replaces imperative DOM manipulation — Bug #6 fix)
  const [toast, setToast] = useState(null);

  const messagesEndRef = useRef(null);

  // ── Health check ───────────────────────────────────────────────────────────
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

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Category suggestions ───────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedCategory) return;
    if (lastSuggestionCategory === selectedCategory) return;
    showCategorySuggestions(selectedCategory);
    setLastSuggestionCategory(selectedCategory);
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Show toast helper ──────────────────────────────────────────────────────
  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 2500);
  };

  // ── Send message ───────────────────────────────────────────────────────────
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

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

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

      // Bug fix #3: Was silently swallowed — now shows an error message bubble
      const isTimeout = error.name === "AbortError";
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          type: "error",
          text: isTimeout
            ? "⏱️ The request timed out. The server may be busy — please try again."
            : "⚠️ Something went wrong connecting to UniBot. Please check your connection and try again.",
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--surface-2)" }}>

      {/* React-managed toast (Bug #6 fix — was DOM-manipulated imperatively) */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] animate-fadeIn">
          <div className="card rounded-xl px-5 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-lg">
            {toast}
          </div>
        </div>
      )}

      {/* ── Category Tab Bar ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 py-3">
        <div className="max-w-4xl mx-auto card rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="overflow-x-auto flex-1">
            <QuickActionsCompact
              onActionClick={setSelectedCategory}
              activeCategory={selectedCategory}
            />
          </div>
          {/* Online/offline status badge */}
          <div
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
              isOnline
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-[#a81c1c] dark:text-red-400 border border-red-200 dark:border-red-800"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-[#a81c1c]"}`} />
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, i) =>
            msg.type === "suggestions" ? (
              <div key={i} className="animate-fadeIn">
                <div className="card rounded-2xl p-5 max-w-2xl">
                  <p className="font-bold text-[var(--text-primary)] mb-4 text-sm flex items-center gap-2">
                    <span className="text-lg">✨</span> {msg.text}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {msg.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(s)}
                        className="px-4 py-3 rounded-xl surface text-[var(--text-secondary)] hover:bg-[#a81c1c] hover:text-white hover:border-[#a81c1c] text-xs font-semibold transition-all duration-150 text-left active:scale-95"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <MessageBubble key={i} {...msg} onCopy={showToast} />
            )
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <div className="w-9 h-9 bg-[#a81c1c] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-base">🎓</span>
              </div>
              <div className="card rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 150, 300].map((delay, i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-[#a81c1c] rounded-full animate-pulse-dot"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                Thinking…
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input Area ───────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 p-4 md:p-5 pb-6">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) sendMessage(input);
            }}
            className="animate-slideUp"
          >
            <div className="card rounded-2xl p-2 flex gap-2 focus-within:border-[var(--border-strong)] transition-colors duration-150">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isOnline ? "Ask anything about NEU…" : "Reconnecting to server…"}
                className="flex-1 px-4 py-3 bg-transparent text-[var(--text-primary)] focus:outline-none placeholder-[var(--text-muted)] font-medium text-sm md:text-base disabled:opacity-60"
                disabled={!isOnline}
              />
              <button
                type="submit"
                disabled={!input.trim() || !isOnline}
                className="btn-crimson px-6 md:px-10 py-3 rounded-xl text-xs md:text-sm tracking-widest uppercase"
              >
                Send 🚀
              </button>
            </div>
            {!isOnline && (
              <p className="text-xs text-[#a81c1c] font-semibold mt-2 px-2">
                ⚠️ Cannot reach the server. Check your connection or try again shortly.
              </p>
            )}
          </form>
        </div>
      </div>

    </div>
  );
}