import DarkToggle from "./DarkToggle";

export default function Header({ showBack, onBack }) {
  return (
    <header className="sticky top-0 z-[100] card border-x-0 border-t-0 border-b border-[var(--border)] transition-colors duration-300">
      <div className="container mx-auto px-5 py-3">
        <div className="flex items-center justify-between">

          {/* Left: back button + branding */}
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={onBack}
                className="group flex items-center gap-1.5 btn-ghost text-xs px-3 py-2"
              >
                <span className="group-hover:-translate-x-0.5 transition-transform text-sm">←</span>
                <span className="font-bold uppercase tracking-wider">Home</span>
              </button>
            )}

            {/* Logo */}
            <div className="w-9 h-9 bg-[#a81c1c] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-lg">🎓</span>
            </div>

            <div>
              <h1 className="text-sm md:text-base font-extrabold text-[#a81c1c] leading-none tracking-tight">
                UniBot{" "}
                <span className="hidden md:inline text-[var(--text-muted)] font-semibold">
                  Assistant
                </span>
              </h1>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mt-0.5">
                Near East University
              </span>
            </div>
          </div>

          {/* Right: status + toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                System Status
              </span>
              <span className="text-[9px] font-bold text-green-500 uppercase tracking-tighter">
                Verified Link
              </span>
            </div>
            <DarkToggle />
          </div>

        </div>
      </div>
    </header>
  );
}
