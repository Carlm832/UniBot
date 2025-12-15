import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import QuickActionsCompact from "./QuickActionsCompact";

const API_URL = "https://unibot-backend-xzfj.onrender.com/api/chat";

// Suggested questions per category
const SUGGESTED_QUESTIONS = {
  admissions: [
    "What are the admission requirements?",
    "How do I apply to NEU?",
    "What certificates are accepted?",
    "Tell me about tuition fees",
    "How do I get a student residence permit?",
  ],
  "campus-navigation": [
    "Where is the International Students Office?",
    "Where is the Grand Library?",
    "Show me the dormitories location",
    "Where can I find restaurants on campus?",
    "Where is the Post Office?",
  ],
  courses: [
    "What faculties does NEU have?",
    "Tell me about the Faculty of Engineering",
    "What programs are available in AI and Informatics?",
    "Show me the Faculty of Medicine",
    "What is the Faculty of Law?",
  ],
  general: [
    "What student services are available?",
    "How can I contact the university?",
    "Tell me about psychological counseling",
    "What clubs and activities are there?",
    "Where can I submit petitions?",
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

  /* ---------------- Backend health ---------------- */

  useEffect(() => {
    const timeout = setTimeout(() => {
      checkBackendHealth();

      const interval = setInterval(checkBackendHealth, 30000);

      return () => clearInterval(interval);
    }, 5000); // let Render wake fully

    return () => clearTimeout(timeout);
  }, []);


  const checkBackendHealth = async () => {
    try {
      const res = await fetch(
        "https://unibot-backend-xzfj.onrender.com/health",
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Bad response");

      const { status } = await res.json();
      setIsOnline(status === "ok");
    } catch (err) {
      console.warn("Health check failed:", err);
      // IMPORTANT: do NOT immediately set offline
    }
  };



  /* ---------------- Auto scroll ---------------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ---------------- ONE source of truth for suggestions ---------------- */

  useEffect(() => {
    if (!selectedCategory) return;
    if (lastSuggestionCategory === selectedCategory) return;

    showCategorySuggestions(selectedCategory);
    setLastSuggestionCategory(selectedCategory);
  }, [selectedCategory]);

  const showCategorySuggestions = (category) => {
    const suggestions =
      SUGGESTED_QUESTIONS[category] || SUGGESTED_QUESTIONS.general;

    const labels = {
      admissions: "Admissions",
      "campus-navigation": "Campus Navigation",
      courses: "Academics",
      general: "General Info",
    };

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        type: "suggestions",
        category,
        suggestions,
        text: `Here are some questions about ${labels[category]}:`,
        timestamp: formatTime(),
      },
    ]);
  };

  /* ---------------- Send message ---------------- */

  const sendMessage = async (text, category = selectedCategory) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        type: "text",
        text: trimmed,
        timestamp: formatTime(),
      },
    ]);

    setInput("");
    setIsTyping(true);
    setLastSuggestionCategory(null); // allow future category suggestions

    try {
      const res = await fetch(`${API_URL}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, category }),
      });

      const data = await res.json();
      if (!data.success) throw new Error("Backend error");

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          type: data.data.type || "text",
          text:
            data.data.type === "text" && typeof data.data.message === "string"
              ? data.data.message
              : "",
          data: data.data.type === "map" ? data.data : undefined,
          timestamp: formatTime(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          type: "text",
          text: "❌ Unable to reach the server. Make sure the backend is running.",
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  /* ---------------- Handlers ---------------- */

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) sendMessage(input);
  };

  const handleQuickAction = (category) => {
    setSelectedCategory(category);
  };

  const handleSuggestionClick = (question) => {
    sendMessage(question, selectedCategory);
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "bot",
        type: "text",
        text: "Chat cleared! How can I help you today?",
        timestamp: formatTime(),
      },
    ]);
    setLastSuggestionCategory(null);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">

      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-red-700 to-red-900 dark:from-gray-800 dark:to-gray-900 text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
              🤖
            </div>
            <div>
              <h2 className="font-bold">NEU UniBot</h2>
              <span className="text-xs opacity-80">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="text-sm bg-red-800/60 px-3 py-1 rounded-lg hover:bg-red-800"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-3">
        <QuickActionsCompact onActionClick={handleQuickAction} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
        {messages.map((msg, i) =>
          msg.type === "suggestions" ? (
            <div key={i} className="flex gap-2">
              <div className="w-8 h-8 bg-red-700 text-white rounded-full flex items-center justify-center">
                🎓
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border max-w-2xl">
                <p className="font-medium mb-3">{msg.text}</p>
                {msg.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s)}
                    className="block w-full text-left px-4 py-2 mb-2 rounded-lg bg-red-50 dark:bg-gray-700 hover:bg-red-100"
                  >
                    💬 {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <MessageBubble key={i} {...msg} />
          )
        )}

        {isTyping && (
          <div className="text-sm text-gray-500 animate-pulse">
            UniBot is typing…
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here…"
            className="flex-1 px-4 py-3 rounded-xl border dark:bg-gray-800"
            disabled={!isOnline}
          />
          <button
            type="submit"
            disabled={!input.trim() || !isOnline}
            className="bg-red-700 text-white px-6 py-3 rounded-xl"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
