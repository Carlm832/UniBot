import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ selectedTopic }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi there! I'm UniBot 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Send user input to backend
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: "user", text }]);
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, topic: selectedTopic?.name }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: "bot", text: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "bot", text: "Oops! I couldn’t reach the server." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Send topic prompt automatically when a topic is selected
  useEffect(() => {
    if (selectedTopic) {
      setMessages(prev => [...prev, { sender: "bot", text: selectedTopic.prompt }]);
    }
  }, [selectedTopic]);

  // Handle input submission
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage(input);
    setInput("");
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-maroon text-white px-6 py-3 font-semibold text-lg flex items-center justify-between">
        <span>🎓 UniBot Chat</span>
        <span className="text-sm opacity-80">Online</span>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-maroon-light">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            sender={msg.sender}
            text={msg.text}
            timestamp={msg.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          />
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-gray-600 text-sm px-2 animate-pulse">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
            <span>UniBot is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 flex justify-center bg-maroon-light">
        <div className="flex gap-2 w-full max-w-xl">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-maroon shadow-lg bg-white"
          />
          <button
            type="submit"
            className="bg-maroon text-white px-4 py-2 rounded-xl hover:bg-red-900 transition-colors shadow-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
