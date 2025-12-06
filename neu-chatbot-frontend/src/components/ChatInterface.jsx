import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const API_URL = "http://localhost:5000/api/chat";

export default function ChatInterface({ startMessage }) {
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
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [isOnline, setIsOnline] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  function formatTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Backend health check
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch("http://localhost:5000/health");
      const { status } = await response.json();
      setIsOnline(status === "ok");
    } catch (err) {
      console.error("Backend offline:", err);
      setIsOnline(false);
    }
  };

  // Auto scroll only if near bottom
  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 80;

    if (isNearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Handle Home screen QuickActions
  useEffect(() => {
    if (startMessage) {
      const { category, prompt } = startMessage;
      setSelectedCategory(category);
      sendMessage(prompt, category);
    }
  }, [startMessage]);

  // Send message to backend
  const sendMessage = async (text, category = selectedCategory) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = {
      sender: "user",
      type: "text",
      text: trimmed,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, category }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Failed to get response");

      let botMessage;

      if (data.data.type === "map") {
        botMessage = {
          sender: "bot",
          type: "map",
          data: {
            title: data.data.title,
            description: data.data.description,
            embedUrl: data.data.embedUrl,
            mapsUrl: data.data.mapsUrl,
          },
          timestamp: formatTime(),
        };
      } else {
        botMessage = {
          sender: "bot",
          type: "text",
          text: data.data.message,
          timestamp: formatTime(),
        };
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          type: "text",
          text:
            "❌ Sorry, I couldn't process your request. Make sure the backend is running on http://localhost:5000",
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

  const clearChat = () => {
    setMessages([
      {
        sender: "bot",
        type: "text",
        text: "Chat cleared! How can I help you today?",
        timestamp: formatTime(),
      },
    ]);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transition-all">

      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white px-6 py-4">
        <div className="flex items-center justify-between">

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>

            <div>
              <h2 className="text-lg font-bold">NEU UniBot</h2>
              <div className="flex items-center space-x-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <span className="text-red-100">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="text-white hover:bg-red-800 px-3 py-1 rounded-lg text-sm transition"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="
          h-96 md:h-[500px]
          overflow-y-auto 
          p-4 space-y-4 
          bg-gray-50 dark:bg-gray-800 
          overflow-anchor-none
        "
      >
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            sender={msg.sender}
            type={msg.type}
            text={msg.text}
            data={msg.data}
            timestamp={msg.timestamp}
          />
        ))}

        {isTyping && (
          <div className="flex items-start space-x-2 animate-fadeIn">
            <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🎓</span>
            </div>

            <div className="bg-gray-200 rounded-2xl px-4 py-3 dark:bg-gray-700">
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-4 bg-white dark:bg-gray-900"
      >
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="
              flex-1 border border-gray-300 dark:border-gray-700 
              rounded-xl px-4 py-3 
              bg-white dark:bg-gray-800 
              text-gray-800 dark:text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-red-700
            "
            disabled={!isOnline}
          />

          <button
            type="submit"
            disabled={!input.trim() || !isOnline}
            className="
              bg-red-700 text-white px-6 py-3 rounded-xl font-semibold 
              hover:bg-red-800 
              disabled:bg-gray-300 disabled:cursor-not-allowed 
              transition-colors
            "
          >
            Send
          </button>
        </div>

        {!isOnline && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-2">
            ⚠️ Backend is offline. Start the server:
            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ml-1">
              npm run dev
            </code>
          </p>
        )}
      </form>
    </div>
  );
}
