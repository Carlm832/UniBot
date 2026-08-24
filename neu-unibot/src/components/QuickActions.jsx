export default function QuickActions({ onActionClick }) {
  const actions = [
    {
      icon: "📝",
      label: "Admissions",
      category: "admissions",
      accent: "bg-[#a81c1c]",
      iconBg: "bg-red-50 dark:bg-red-900/20",
      description: "Fees, applications & requirements",
    },
    {
      icon: "🗺️",
      label: "Campus Map",
      category: "campus-navigation",
      accent: "bg-amber-600",
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      description: "Buildings, offices & directions",
    },
    {
      icon: "🎯",
      label: "Student Life",
      category: "general",
      accent: "bg-[#002b5c]",
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      description: "Services, clubs & campus life",
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onActionClick(action.category)}
          className="group relative card rounded-xl p-5 flex items-center gap-4 text-left hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 overflow-hidden"
        >
          {/* Left color accent bar */}
          <div className={`absolute left-0 top-0 h-full w-1 ${action.accent} rounded-l-xl transition-all duration-200 group-hover:w-1.5`} />

          {/* Icon */}
          <div className={`w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
            {action.icon}
          </div>

          {/* Text */}
          <div>
            <span className="block text-sm font-bold text-[var(--text-primary)] mb-0.5">
              {action.label}
            </span>
            <span className="block text-xs text-[var(--text-muted)] font-medium">
              {action.description}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}