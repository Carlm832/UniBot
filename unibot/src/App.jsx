import { useState } from "react";
import Sidebar from "./components/SideBar";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [selectedTopic, setSelectedTopic] = useState(null);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onTopicSelect={setSelectedTopic} />
      <div className="flex-1 p-4">
        <ChatWindow selectedTopic={selectedTopic} />
      </div>
    </div>
  );
}
