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
        w-10 h-10 
        flex items-center justify-center 
        rounded-full
        cursor-pointer
        transition-all
        bg-[#F5F5F5] dark:bg-gray-800 text-gray-800 dark:text-yellow-300
        border border-[#E5E5E5] dark:border-gray-700
        shadow-sm hover:shadow-md
        hover:scale-110 active:scale-95
      "
    >
      <span
        className="
          text-xl transition-transform duration-300 
          group-hover:rotate-180
        "
      >
        {dark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
