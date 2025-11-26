export default function MessageBubble({ sender, text, timestamp }) {
  // Function to detect URLs in text and make them clickable
  const formatText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, idx) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 hover:text-blue-800"
          >
            {part}
          </a>
        );
      } else {
        return part;
      }
    });
  };

  return (
    <div className={`flex ${sender === "user" ? "justify-end" : "justify-start"} transition-all`}>
      {/* Optional avatar */}
      {sender === "bot" && (
        <div className="mr-2 flex-shrink-0">
          <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
            B
          </span>
        </div>
      )}

      <div
        className={`px-4 py-2 rounded-xl max-w-xs break-words shadow-sm relative ${
          sender === "user"
            ? "bg-maroon text-white rounded-br-none animate-fadeIn"
            : "bg-gray-200 text-gray-900 rounded-bl-none animate-fadeIn"
        }`}
      >
        {formatText(text)}
        {/* Timestamp */}
        {timestamp && (
          <div className="text-xs text-black-500 mt-1 text-right">{timestamp}</div>
        )}
      </div>

      {/* Optional avatar for user */}
      {sender === "user" && (
        <div className="ml-2 flex-shrink-0">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
            U
          </span>
        </div>
      )}
    </div>
  );
}
