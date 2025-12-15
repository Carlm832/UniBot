export default function QuickActions({ onActionClick }) {
  const actions = [
    {
      icon: "📝",
      label: "Admissions",
      category: "admissions",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: "🗺️",
      label: "Campus Map",
      category: "campus-navigation",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: "🎯",
      label: "Student Life",
      category: "general",
      color: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onActionClick(action.category)}
          className={`bg-gradient-to-r ${action.color} text-white rounded-xl p-6 flex flex-col items-center justify-center space-y-2 shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-200`}
        >
          <span className="text-4xl">{action.icon}</span>
          <span className="text-base font-semibold text-center">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}