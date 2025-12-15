import { useEffect, useState } from "react";

export default function DarkToggle() {
  // Load saved preference OR detect system default
  const getInitialMode = () => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [dark, setDark] = useState(getInitialMode);

  // Apply theme & save preference
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="
        group
        relative
        w-10 h-10 
        flex items-center justify-center 
        rounded-full
        cursor-pointer
        transition-all

        /* Light mode background */
        bg-gradient-to-br from-red-600 to-red-800 text-white

        /* Dark mode background */
        dark:from-gray-700 dark:to-gray-900 dark:text-yellow-300

        shadow-md hover:shadow-red-500/40 dark:hover:shadow-yellow-500/30
        hover:scale-110 active:scale-95
      "
    >
      {/* Icon */}
      <span
        className="
          text-xl transition-transform duration-300 
          group-hover:rotate-180
        "
      >
        {dark ? "🌙" : "☀️"}
      </span>

      {/* Glow ring effect */}
      <span
        className="
          absolute inset-0 rounded-full pointer-events-none
          opacity-0 group-hover:opacity-40
          bg-gradient-to-br from-red-400 to-red-700
          dark:from-yellow-300 dark:to-yellow-500
          blur-xl transition-opacity
        "
      ></span>
    </button>
  );
}
