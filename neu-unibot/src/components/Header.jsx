export default function Header({ showBack, onBack }) {
  return (
    <header className="sticky top-0 z-50 glass shadow-2xl transition-all duration-300">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBack && (
              <button
                onClick={onBack}
                className="group flex items-center gap-2 text-white bg-gradient-to-r from-[#a81c1c] to-[#7a1212] px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span className="text-xs font-bold uppercase tracking-wider">Home</span>
              </button>
            )}

            <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-inner">
              <span className="text-lg">🎓</span>
            </div>

            <div>
              <h1 className="text-sm md:text-base font-extrabold text-[#a81c1c] dark:text-white leading-none tracking-tight">
                UniBot <span className="hidden md:inline text-gray-400">Assistant</span>
              </h1>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mt-1">
                Near East University
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Status</span>
                <span className="text-[9px] font-bold text-green-500 uppercase tracking-tighter">Verified Link</span>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
}
