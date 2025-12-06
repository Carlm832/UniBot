export default function QuickActions({ onActionClick }) {
  const actions = [
    {
      icon: '📝',
      label: 'Admissions',
      category: 'admissions',
      prompt: 'Tell me about admission requirements and the application process',
    },
    {
      icon: '📋',
      label: 'Registration',
      category: 'admissions',
      prompt: 'How do I register and get my student residence permit?',
    },
    {
      icon: '🗺️',
      label: 'Campus Map',
      category: 'campus-navigation',
      prompt: 'Where is the International Students Office and Grand Library?',
    },
    {
      icon: '🎯',
      label: 'Student Life',
      category: 'general',
      prompt: 'What student services, clubs and activities are available?',
    },
    {
      icon: '📚',
      label: 'Academics',
      category: 'courses',
      prompt: 'What faculties and programs does NEU offer?',
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-4">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onActionClick(action.category, action.prompt)}
          className="
            bg-white dark:bg-gray-800 
            shadow-md hover:shadow-xl 
            border border-gray-200 dark:border-gray-700
            rounded-2xl p-4 
            transition-all duration-200 
            flex flex-col items-center justify-center
            hover:-translate-y-1
          "
        >
          <div className="
            w-12 h-12 
            rounded-full 
            bg-red-100 dark:bg-gray-700 
            flex items-center justify-center
            text-2xl
            mb-2
          ">
            {action.icon}
          </div>

          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 text-center">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
