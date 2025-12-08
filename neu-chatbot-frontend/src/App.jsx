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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">

      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <DarkToggle />
      </div>

      <Header showBack={view === "chat"} onBack={goHome} />

      {/* HOME SCREEN */}
      {view === "home" && (
        <main className="container mx-auto px-4 py-12 text-center animate-fadeIn">

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 dark:from-red-500 dark:to-red-700 rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
              <span className="text-4xl text-white">🎓</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-700 to-red-900 dark:from-red-400 dark:to-red-600 bg-clip-text text-transparent">
              Welcome to NEU
            </span>
            <br />
            <span className="text-gray-900 dark:text-gray-100">
              Campus Assistant
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            Your 24/7 intelligent assistant for Near East University.
            <br />
            Get instant answers about campus, courses, and student life.
          </p>

          {/* Quick Actions Grid */}
          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">
              Choose a topic:
            </p>
            <QuickActions onActionClick={goToChat} />
          </div>

          {/* Search Input */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <input
                onFocus={() => goToChat("general")}
                placeholder="🔍 Type your question or click a topic above..."
                className="w-full p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 
                hover:border-red-300 dark:hover:border-red-600 focus:border-red-600 dark:focus:border-red-500 
                focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30 outline-none transition-all duration-300 text-center md:text-left"
              />
            </div>
          </div>

          {/* Features */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Instant Answers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get accurate responses powered by AI.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="text-4xl mb-3">🗺️</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Interactive Maps</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visual directions to any campus location.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="text-4xl mb-3">🌙</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Always Available</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Here to help day or night.
              </p>
            </div>
          </div>

          <p className="mt-12 text-sm text-gray-500 dark:text-gray-500">
            💡 Try asking “Where is the library?” or “Tell me about admissions”
          </p>

        </main>
      )}

      {/* CHAT SCREEN - FULL PAGE */}
      {view === "chat" && (
        <ChatInterface initialCategory={selectedCategory} />
      )}
    </div>
  );
}

export default App;
