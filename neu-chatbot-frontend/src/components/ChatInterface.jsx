import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import QuickActionsCompact from "./QuickActionsCompact";

const API_URL = "http://localhost:5000/api/chat";

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

export default function ChatInterface({ initialCategory = "general", onBack }) {
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
  const [isOnline, setIsOnline] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);

  function formatTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Backend health check
  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch("http://localhost:5000/health");
      const { status } = await response.json();
      setIsOnline(status === "ok");
    } catch {
      setIsOnline(false);
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Show suggestions ONCE if entering with a category
  useEffect(() => {
    if (initialCategory !== "general" && messages.length === 1) {
      showCategorySuggestions(initialCategory);
    }
    // eslint-disable-next-line
  }, []);

  const showCategorySuggestions = (category) => {
    const suggestions =
      SUGGESTED_QUESTIONS[category] || SUGGESTED_QUESTIONS.general;

    const categories = {
      admissions: "Admissions",
      "campus-navigation": "Campus Navigation",
      courses: "Academics",
      general: "General Info",
    };

    const botMsg = {
      sender: "bot",
      type: "suggestions",
      category,
      suggestions,
      text: `Here are some questions about ${categories[category]}:`,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  // Send message
  const sendMessage = async (text, category = selectedCategory) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = {
      sender: "user",
      type: "text",
      text: trimmed,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      const res = await fetch(`${API_URL}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, category }),
      });

      const data = await res.json();
      if (!data.success) throw new Error("Backend error");

      const botMsg = {
        sender: "bot",
        type: data.data.type,
        text: data.data.type === "text" ? data.data.message : "",
        data: data.data.type === "map" ? data.data : undefined,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          type: "text",
          text: "❌ Unable to reach the server. Please check backend.",
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) sendMessage(input);
  };

  const handleQuickAction = (category) => {
    setSelectedCategory(category);
    showCategorySuggestions(category);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion, selectedCategory);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-gray-900">

      {/* Floating Back Button */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-[90px] left-4 z-40
                  bg-white dark:bg-gray-800 
                  text-gray-700 dark:text-gray-200
                  border border-gray-300 dark:border-gray-700 
                  shadow-lg rounded-full p-3 
                  hover:bg-gray-100 dark:hover:bg-gray-700 
                  active:scale-95 transition"
      >
        ←
      </button>

      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-red-700 to-red-900 dark:from-gray-800 dark:to-gray-900 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🤖</span>
            </div>

            <div>
              <h2 className="text-lg font-bold">NEU UniBot</h2>
              <div className="flex items-center space-x-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"
                  }`}
                ></div>
                <span className="text-red-100 dark:text-gray-300">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3">
        <QuickActionsCompact onActionClick={handleQuickAction} />
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
        {messages.map((msg, i) =>
          msg.type === "suggestions" ? (
            <div key={i} className="flex justify-start animate-slideLeft">
              <div className="w-8 h-8 bg-red-700 dark:bg-red-600 rounded-full flex items-center justify-center mr-2 shadow-md">
                <span className="text-white text-sm">🎓</span>
              </div>

              <div className="max-w-2xl">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none shadow-md p-4">
                  <p className="mb-3 font-medium">{msg.text}</p>
                  <div className="flex flex-col gap-2">
                    {msg.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(s)}
                        className="text-left px-4 py-2 bg-red-50 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors border border-red-200 dark:border-gray-600"
                      >
                        💬 {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <MessageBubble
              key={i}
              sender={msg.sender}
              type={msg.type}
              text={msg.text}
              data={msg.data}
              timestamp={msg.timestamp}
            />
          )
        )}

        {isTyping && (
          <div className="flex items-start space-x-2 animate-fadeIn">
            <div className="w-8 h-8 bg-red-700 dark:bg-red-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm">🎓</span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-700 dark:focus:ring-red-500 transition-all"
            disabled={!isOnline}
          />

          <button
            type="submit"
            disabled={!input.trim() || !isOnline}
            className="bg-red-700 dark:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-800 dark:hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            Send
          </button>
        </div>

        {!isOnline && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-2 animate-pulse">
            ⚠️ Backend offline. Run:
            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ml-1">
              npm run dev
            </code>
          </p>
        )}
      </form>
    </div>
  );
}
