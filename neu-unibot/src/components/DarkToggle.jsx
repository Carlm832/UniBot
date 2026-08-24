import { useEffect, useState } from "react";

export default function DarkToggle() {
  const getInitialMode = () => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  };

  const [dark, setDark] = useState(getInitialMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="
        w-9 h-9
        flex items-center justify-center
        rounded-xl cursor-pointer
        card
        text-[var(--text-secondary)]
        hover:border-[var(--border-strong)]
        hover:scale-105 active:scale-95
        transition-all duration-150
      "
    >
      <span className="text-lg leading-none">
        {dark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
