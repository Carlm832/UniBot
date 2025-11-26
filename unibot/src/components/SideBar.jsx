import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const Sidebar = ({ onTopicSelect }) => {
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const topics = [
    { name: "Location", prompt: "Where would you like to go?" },
    { name: "Admissions", prompt: "Which faculty or program do you want info about?" },
    { name: "Campus Info", prompt: "What campus info do you need?" },
  ];

  const handleTopicClick = (topic, idx) => {
    setSelectedIndex(idx); // Highlight selected topic
    setTopicsOpen(false);  // Close dropdown
    onTopicSelect(topic);  // Send topic to ChatWindow
  };

  return (
    <div className="w-64 bg-maroon text-white flex flex-col shadow-lg h-full">
      {/* Header */}
      <div className="p-6 border-b border-maroon-light">
        <h1 className="text-2xl font-bold text-center tracking-wide">🎓 UniBot</h1>
        <p className="text-sm text-center text-gray-200 mt-1">Your Campus Assistant</p>
      </div>

      {/* Topics Dropdown */}
      <nav className="flex-1 p-4">
        <button
          className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-maroon-light/20 hover:text-gray-100 transition justify-between"
          onClick={() => setTopicsOpen(!topicsOpen)}
        >
          <span>Topics</span>
          {topicsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${topicsOpen ? "max-h-64 mt-2" : "max-h-0"}`}>
          {topics.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => handleTopicClick(topic, idx)}
              className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-100 hover:bg-maroon-light/30 transition mt-1 text-left
                ${selectedIndex === idx ? "bg-maroon-light/50 font-semibold" : ""}`}
            >
              {topic.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 text-center text-sm border-t border-maroon-light">
        © {new Date().getFullYear()} Near East UniBot
      </div>
    </div>
  );
};

export default Sidebar;
