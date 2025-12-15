export default function QuickActionsCompact({ onActionClick }) {
  const actions = [
    {
      icon: "📝",
      label: "Admissions",
      category: "admissions",
    },
    {
      icon: "🗺️",
      label: "Map",
      category: "campus-navigation",
    },
    {
      icon: "🎯",
      label: "Services",
      category: "general",
    },
  ];

  return (
    <div className="flex justify-between md:justify-center gap-2">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onActionClick(action.category)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <span className="text-lg">{action.icon}</span>
          <span className="hidden md:inline">{action.label}</span>
        </button>
      ))}
    </div>
  );
}