import { useState } from "react";
import ChatInterface from "./components/ChatInterface";
import Header from "./components/Header";
import QuickActions from "./components/QuickActions";
import "./App.css";

function App() {
  const [view, setView] = useState("home"); // "home" or "chat"

  const goToChat = () => setView("chat");
  const goHome = () => setView("home");

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <Header showBack={view === "chat"} onBack={goHome} />

      {/* HOME SCREEN */}
      {view === "home" && (
        <main className="container mx-auto px-4 py-12 text-center">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-3xl text-white">🎓</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-red-300 mb-4">
            Welcome to NEU Campus Assistant
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            How can I help you today? Choose a topic or type your question below.
          </p>

          {/* Quick Actions */}
          <div className="max-w-4xl mx-auto mb-12">
            <QuickActions
              onActionClick={() => goToChat()}
            />
          </div>

          {/* Simple Input Box (optional) */}
          <div className="max-w-3xl mx-auto">
            <input
              onFocus={goToChat}
              placeholder="Type your message..."
              className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-red-600 outline-none"
            />
          </div>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
            Available 24/7 to assist you with campus information
          </p>

        </main>
      )}

      {/* CHAT SCREEN */}
      {view === "chat" && (
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <ChatInterface />
        </div>
      )}
    </div>
  );
}

export default App;
