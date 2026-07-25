export default function QuickActions({ onActionClick }) {
  const actions = [
    {
      icon: "📝",
      label: "Admissions",
      category: "admissions",
      color: "bg-[#a81c1c]",
    },
    {
      icon: "🗺️",
      label: "Campus Map",
      category: "campus-navigation",
      color: "bg-[#d4af37]",
    },
    {
      icon: "🎯",
      label: "Student Life",
      category: "general",
      color: "bg-[#002b5c]",
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onActionClick(action.category)}
          className={`${action.color} text-white rounded-xl p-6 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md border border-[#E5E5E5] hover:-translate-y-1 active:scale-95 transition-all duration-200`}
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