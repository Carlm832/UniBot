// Bug fix: activeCategory was accepted as a prop but never used inside this
// component, so the selected tab was never visually highlighted.
export default function QuickActionsCompact({ onActionClick, activeCategory }) {
  const actions = [
    { icon: "📝", label: "Admissions",  category: "admissions"         },
    { icon: "🗺️", label: "Campus",      category: "campus-navigation"  },
    { icon: "ℹ️",  label: "Services",   category: "general"            },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {actions.map((action, idx) => {
        const isActive = activeCategory === action.category;
        return (
          <button
            key={idx}
            onClick={() => onActionClick(action.category)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
              border transition-all duration-150 hover:scale-105 active:scale-95
              ${isActive
                ? "bg-[#a81c1c] text-white border-[#a81c1c] shadow-sm"
                : "card text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              }
            `}
          >
            <span className="text-base leading-none">{action.icon}</span>
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}