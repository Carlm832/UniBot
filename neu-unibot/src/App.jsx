import { useState, useEffect } from "react";
import ChatInterface from "./components/ChatInterface";
import QuickActions from "./components/QuickActions";
import DarkToggle from "./components/DarkToggle";
import Header from "./components/Header";
import "./App.css";

function App() {
  const [view, setView] = useState("home"); 
  const [selectedCategory, setSelectedCategory] = useState("general");

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      setView("home");
      setSelectedCategory("general");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const goToChat = (category = "general") => {
    setSelectedCategory(category);
    setView("chat");

    // Push state for browser back functionality
    window.history.pushState({ page: "chat" }, "", "#chat");
  };

  const goHome = () => {
    setView("home");
    setSelectedCategory("general");
    window.history.pushState({ page: "home" }, "", "#home");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden transition-colors duration-500">
      
      {/* Premium Mesh Background */}
      <div className="mesh-gradient" />

      {/* Dark Mode Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <div className="glass p-1 rounded-2xl shadow-xl">
          <DarkToggle />
        </div>
      </div>

      <Header showBack={view === "chat"} onBack={goHome} />

      {/* HOME SCREEN */}
      {view === "home" && (
        <main className="container mx-auto px-4 py-16 md:py-24 text-center">
          
          <div className="max-w-5xl mx-auto animate-fadeIn">
            {/* Premium Icon Surround */}
            <div className="flex justify-center mb-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-[#a81c1c] to-[#7a1212] rounded-3xl flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-500 cursor-default">
                  <span className="text-5xl drop-shadow-lg">🎓</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-[#a81c1c] via-[#d63232] to-[#7a1212] bg-clip-text text-transparent">
                Near East University
              </span>
              <br />
              <span className="text-gray-900 dark:text-white drop-shadow-sm">
                Campus Assistant
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
              Your intelligent companion for student life, 
              <span className="text-[#a81c1c] dark:text-red-400 font-bold"> simplified.</span>
            </p>

            {/* Quick Actions Grid */}
            <div className="max-w-5xl mx-auto mb-20 animate-slideUp" style={{ animationDelay: '200ms' }}>
              <div className="glass rounded-[2rem] p-8 md:p-12">
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 font-bold uppercase tracking-widest">
                  Quick Topics
                </p>
                <QuickActions onActionClick={goToChat} />
              </div>
            </div>

            {/* Search Input Upgrade */}
            <div className="max-w-3xl mx-auto mb-24 animate-slideUp" style={{ animationDelay: '400ms' }}>
              <div className="relative cursor-text group" onClick={() => goToChat("general")}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/50 to-red-900/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative flex items-center">
                  <input
                    readOnly
                    placeholder="Ask me anything about NEU..."
                    className="w-full p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl text-xl text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-800 focus:outline-none transition-all duration-300"
                  />
                  <div className="absolute right-4 p-3 bg-[#a81c1c] rounded-xl text-white shadow-lg">
                    <span>⚡ Ask AI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Stat-like features */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 animate-slideUp" style={{ animationDelay: '600ms' }}>
              <div className="glass p-8 rounded-[2rem] hover:scale-[1.02] transition-transform duration-300">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">🚀</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Smart Engine</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  Instant, context-aware answers to all your university queries.
                </p>
              </div>

              <div className="glass p-8 rounded-[2rem] hover:scale-[1.02] transition-transform duration-300 border-red-200/50 dark:border-red-900/50">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">📍</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Live Maps</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  Interactive directions to every building, faculty, and dorm.
                </p>
              </div>

              <div className="glass p-8 rounded-[2rem] hover:scale-[1.02] transition-transform duration-300">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">✨</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Reliable Info</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  Verified data synced directly from the university database.
                </p>
              </div>
            </div>

            <p className="mt-20 text-sm text-gray-400 dark:text-gray-600 font-medium tracking-wide">
              POWERED BY ADVANCED NEURAL AI • NEAR EAST UNIVERSITY 2026
            </p>
          </div>

        </main>
      )}

      {/* CHAT SCREEN - FULL PAGE */}
      {view === "chat" && (
        <div className="animate-fadeIn">
          <ChatInterface initialCategory={selectedCategory} />
        </div>
      )}
    </div>
  );
}

export default App;
