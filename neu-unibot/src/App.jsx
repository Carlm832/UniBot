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
    window.history.pushState({ page: "chat" }, "", "#chat");
  };

  const goHome = () => {
    setView("home");
    setSelectedCategory("general");
    window.history.pushState({ page: "home" }, "", "#home");
  };

  return (
    <div className="relative h-screen flex flex-col overflow-hidden page-bg transition-colors duration-300">
      <Header showBack={view === "chat"} onBack={goHome} />

      <main className="flex-1 overflow-y-auto">
        {/* HOME SCREEN */}
        {view === "home" && (
          <div className="container mx-auto px-4 py-12 md:py-20 text-center animate-fadeIn">
            <div className="max-w-4xl mx-auto">

              {/* Logo Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-[#a81c1c] rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300 cursor-default">
                  <span className="text-4xl">🎓</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-[#a81c1c] via-[#d63232] to-[#7a1212] bg-clip-text text-transparent">
                  Near East University
                </span>
                <br />
                <span className="text-[var(--text-primary)] text-3xl md:text-5xl">
                  Campus Assistant
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-xl mx-auto mb-12 leading-relaxed font-medium">
                Your intelligent companion for student life,{" "}
                <span className="text-[#a81c1c] font-bold">simplified.</span>
              </p>

              {/* Quick Actions Grid */}
              <div className="max-w-5xl mx-auto mb-10 animate-slideUp" style={{ animationDelay: "150ms" }}>
                <div className="card rounded-2xl p-8 md:p-10">
                  <p className="text-xs text-[var(--text-muted)] mb-7 font-bold uppercase tracking-widest">
                    Quick Topics
                  </p>
                  <QuickActions onActionClick={goToChat} />
                </div>
              </div>

              {/* Search / Chat CTA */}
              <div className="max-w-3xl mx-auto mb-14 animate-slideUp" style={{ animationDelay: "300ms" }}>
                <div
                  className="relative cursor-text group"
                  onClick={() => goToChat("general")}
                >
                  <div className="relative flex items-center card rounded-2xl p-2 hover:shadow-md transition-shadow duration-200">
                    <input
                      readOnly
                      placeholder="Ask me anything about NEU..."
                      className="w-full px-5 py-4 bg-transparent text-lg text-[var(--text-secondary)] focus:outline-none cursor-text font-medium"
                    />
                    <div className="flex-shrink-0 mr-1">
                      <button className="btn-crimson px-5 py-3 text-sm whitespace-nowrap">
                        ⚡ Ask AI
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Cards */}
              <div
                className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 animate-slideUp"
                style={{ animationDelay: "450ms" }}
              >
                <div className="feature-card p-6 rounded-2xl text-left">
                  <div className="w-11 h-11 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-2xl mb-4">
                    🚀
                  </div>
                  <h3 className="text-base font-bold mb-1.5 text-[var(--text-primary)]">
                    Smart Engine
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Instant, context-aware answers to all your university queries.
                  </p>
                </div>

                <div className="feature-card p-6 rounded-2xl text-left">
                  <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-2xl mb-4">
                    📍
                  </div>
                  <h3 className="text-base font-bold mb-1.5 text-[var(--text-primary)]">
                    Live Maps
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Interactive directions to every building, faculty, and dorm.
                  </p>
                </div>

                <div className="feature-card p-6 rounded-2xl text-left">
                  <div className="w-11 h-11 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-2xl mb-4">
                    ✨
                  </div>
                  <h3 className="text-base font-bold mb-1.5 text-[var(--text-primary)]">
                    Reliable Info
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Verified data synced directly from the university database.
                  </p>
                </div>
              </div>

              <p className="mt-16 text-xs text-[var(--text-muted)] font-semibold tracking-widest uppercase">
                Powered by Advanced Neural AI • Near East University 2026
              </p>
            </div>
          </div>
        )}

        {/* CHAT SCREEN */}
        {view === "chat" && (
          <div className="h-full animate-fadeIn">
            <ChatInterface initialCategory={selectedCategory} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
