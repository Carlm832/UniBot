export default function MessageBubble({ sender, type, text, data, timestamp }) {
  const isUser = sender === "user";

  // Format text with hyperlinks (kept from your original)
  const formatText = (text) => {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split("\n").map((line, lineIdx) => (
      <span key={lineIdx}>
        {line.split(urlRegex).map((part, idx) =>
          urlRegex.test(part) ? (
            <a
              key={`${lineIdx}-${idx}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 break-all font-medium transition-colors"
            >
              {part}
            </a>
          ) : (
            <span key={`${lineIdx}-${idx}`}>{part}</span>
          )
        )}
        {lineIdx < text.length - 1 && <br />}
      </span>
    ));
  };

  // ⭐ Dedicated map message rendering
  if (type === "map" && data) {
    return (
      <div className="flex justify-start animate-slideLeft">
        {/* Bot avatar */}
        <div className="w-8 h-8 bg-red-700 dark:bg-red-600 rounded-full flex items-center justify-center mr-2 shadow-md">
          <span className="text-white text-sm">🗺️</span>
        </div>

        {/* Map Bubble */}
        <div className="max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none shadow-lg p-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
            📍 {data.title}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">
            {data.description}
          </p>

          <iframe
            src={data.embedUrl}
            width="100%"
            height="300"
            className="rounded-xl shadow-md"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>

          {data.mapsUrl && (
            <a
              href={data.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 dark:text-blue-400 underline mt-3 text-sm font-medium"
            >
              🔗 Open in Google Maps
            </a>
          )}

          <span className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">
            {timestamp}
          </span>
        </div>
      </div>
    );
  }

  // ⭐ Standard text message bubble
  return (
    <div
      className={`flex ${
        isUser ? "justify-end animate-slideRight" : "justify-start animate-slideLeft"
      }`}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div className="w-8 h-8 bg-red-700 dark:bg-red-600 rounded-full flex items-center justify-center mr-2 shadow-md">
          <span className="text-white text-sm">🎓</span>
        </div>
      )}

      {/* Bubble */}
      <div className="max-w-lg">
        <div
          className={`px-4 py-3 rounded-2xl shadow-md ${
            isUser
              ? "bg-red-700 dark:bg-red-600 text-white rounded-br-none"
              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none"
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {formatText(text)}
          </div>
        </div>

        {/* Timestamp */}
        <span
          className={`text-xs text-gray-500 dark:text-gray-500 mt-1 block ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {timestamp}
        </span>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center ml-2 shadow-md">
          <span className="text-white text-sm">👤</span>
        </div>
      )}
    </div>
  );
}
