export default function MessageBubble({ sender, type, text, data, timestamp }) {
  const isUser = sender === "user";

  // Format text with hyperlinks
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
        {lineIdx < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  // MAP MESSAGE RENDERING
  if (type === "map" && data) {
    return (
      <div className="flex justify-start animate-slideLeft">
        {/* Bot avatar */}
        <div className="w-8 h-8 bg-red-700 dark:bg-red-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
          <span className="text-white text-sm">🗺️</span>
        </div>

        {/* Map Card */}
        <div className="max-w-2xl">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none shadow-lg overflow-hidden">
            
            {/* Location Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-800 dark:from-red-600 dark:to-red-700 text-white px-4 py-3">
              <h3 className="font-bold text-lg flex items-center">
                <span className="mr-2">📍</span>
                {data.title || "Location"}
              </h3>
            </div>

            {/* Description */}
            {(data.message || data.description) && (
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {data.message || data.description}
                </p>
              </div>
            )}

            {/* Embedded Google Map */}
            {data.embedUrl && (
              <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700">
                <iframe
                  src={data.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                  className="w-full h-full"
                ></iframe>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex gap-2">
              {data.mapsUrl && (
                <a
                  href={data.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                >
                  <span>🗺️</span>
                  <span>Open in Google Maps</span>
                </a>
              )}

              {data.coordinates && (
                <button
                  onClick={() => {
                    const [lng, lat] = data.coordinates.split(',').map(c => c.trim());
                    navigator.clipboard.writeText(`${lat}, ${lng}`);
                    
                    // Show a temporary toast notification
                    const toast = document.createElement('div');
                    toast.textContent = '✓ Coordinates copied!';
                    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fadeIn';
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 2000);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95"
                  title="Copy coordinates"
                >
                  📋
                </button>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <span className="text-xs text-gray-500 mt-1 px-1 block">
            {timestamp}
          </span>
        </div>
      </div>
    );
  }

  // STANDARD TEXT MESSAGE
  return (
    <div
      className={`flex ${
        isUser ? "justify-end animate-slideRight" : "justify-start animate-slideLeft"
      }`}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div className="w-8 h-8 bg-red-700 dark:bg-red-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
          <span className="text-white text-sm">🎓</span>
        </div>
      )}

      {/* Message Bubble */}
      <div className="max-w-2xl">
        <div
          className={`px-4 py-3 rounded-2xl shadow-md ${
            isUser
              ? "bg-red-700 dark:bg-red-600 text-white rounded-br-none"
              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none"
          }`}
        >
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {formatText(text)}
          </div>
        </div>

        {/* Timestamp */}
        <span
          className={`text-xs text-gray-500 mt-1 px-1 block ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {timestamp}
        </span>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center ml-2 flex-shrink-0 shadow-md">
          <span className="text-white text-sm">👤</span>
        </div>
      )}
    </div>
  );
}