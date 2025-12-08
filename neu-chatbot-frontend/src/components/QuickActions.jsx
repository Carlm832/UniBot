export default function QuickActions({ onActionClick }) {
  const actions = [
    {
      icon: "📝",
      label: "Admissions",
      category: "admissions",
      prompt: "Tell me about admission requirements and the application process",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: "📋",
      label: "Registration",
      category: "admissions",
      prompt: "How do I register and get my student residence permit?",
      color: "from-green-500 to-green-600",
    },
    {
      icon: "🗺️",
      label: "Campus Map",
      category: "campus-navigation",
      prompt: "Where is the International Students Office and Grand Library?",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: "🎯",
      label: "Student Life",
      category: "general",
      prompt: "What student services, clubs and activities are available?",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: "📚",
      label: "Academics",
      category: "courses",
      prompt: "What faculties and programs does NEU offer?",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-3">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onActionClick(action.category)}
          className={`
            bg-gradient-to-r ${action.color}
            text-white rounded-xl p-4
            flex flex-col items-center justify-center space-y-1
            shadow-md hover:shadow-xl
            hover:-translate-y-1 active:scale-95
            transition-all duration-200
          `}
        >
          <span className="text-2xl">{action.icon}</span>
          <span className="text-xs font-semibold text-center leading-tight">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
