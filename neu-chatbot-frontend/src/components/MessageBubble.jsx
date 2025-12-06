import MapCard from "./MapCard";

export default function MessageBubble({ sender, text, timestamp, type, data }){
  // Detect URLs and make them clickable
  const formatText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const lines = text.split("\n");

    return lines.map((line, lineIdx) => {
      const parts = line.split(urlRegex).map((part, idx) => {
        if (urlRegex.test(part)) {
          return (
            <a
              key={`${lineIdx}-${idx}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 break-all"
            >
              {part}
            </a>
          );
        }
        return <span key={`${lineIdx}-${idx}`}>{part}</span>;
      });

      return (
        <span key={lineIdx}>
          {parts}
          {lineIdx < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  const isUser = sender === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} my-1`}>
      
      {/* BOT AVATAR */}
      {!isUser && (
        <div className="mr-2 flex-shrink-0 animate-fadeIn">
          <span className="bg-gradient-to-br from-red-700 to-red-900 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-md">
            🎓
          </span>
        </div>
      )}

      {/* MESSAGE BUBBLE */}
      <div
        className={`
          px-4 py-2 rounded-xl max-w-xs md:max-w-md break-words relative shadow-md
          ${isUser ? "rounded-br-none" : "rounded-bl-none"}

          /* Slide animations */
          ${isUser ? "animate-slideRight" : "animate-slideLeft"}

          /* Light mode gradients */
          ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
              : "bg-gradient-to-br from-red-600 to-red-800 text-white"
          }

          /* Dark mode gradients */
          ${
            isUser
              ? "dark:from-blue-300 dark:to-blue-500 dark:text-black"
              : "dark:from-red-300 dark:to-red-500 dark:text-black"
          }
        `}
      >
        <div className="whitespace-pre-wrap">{formatText(text)}</div>

        {timestamp && (
          <div
            className={`text-xs mt-1 text-right opacity-70 ${
              isUser ? "text-gray-200 dark:text-gray-800" : "text-gray-200 dark:text-gray-800"
            }`}
          >
            {timestamp}
          </div>
        )}
      </div>

      {/* USER AVATAR */}
      {isUser && (
        <div className="ml-2 flex-shrink-0 animate-fadeIn">
          <span className="bg-gradient-to-br from-blue-500 to-blue-700 text-white dark:from-blue-300 dark:to-blue-500 dark:text-black rounded-full w-9 h-9 flex items-center justify-center shadow-md">
            👤
          </span>
        </div>
      )}
    </div>
  );
}
