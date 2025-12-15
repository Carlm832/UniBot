export default function Header({ showBack, onBack }) {
  return (
    <header className="bg-red-800 dark:bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* LEFT SIDE */}
          <div className="flex items-center space-x-3">
            {showBack && (
              <button
                onClick={onBack}
                className="text-white bg-red-700 dark:bg-gray-700 px-3 py-1 rounded-lg hover:bg-red-600 dark:hover:bg-gray-600"
              >
                ← Home
              </button>
            )}

            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-2xl">🎓</span>
            </div>

            <div>
              <h1 className="text-xl font-bold text-white dark:text-red-300">
                NEU Campus Assistant
              </h1>
              <p className="text-xs text-red-100 dark:text-gray-400">
                Near East University
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
