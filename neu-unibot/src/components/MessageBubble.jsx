export default function MessageBubble({ sender, type, text, data, timestamp }) {
  const isUser = sender === "user";

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
              className="text-[#a81c1c] dark:text-red-400 font-bold hover:underline decoration-2 transition-all underline-offset-4"
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
      <div className="flex justify-start animate-fadeIn">
        <div className="flex flex-col items-center mr-3 mt-2">
          <div className="w-10 h-10 glass rounded-2xl flex items-center justify-center shadow-lg border-white/40">
            <span className="text-xl">📍</span>
          </div>
          <div className="w-0.5 h-full bg-gradient-to-b from-red-500/20 to-transparent mt-2"></div>
        </div>

        <div className="max-w-xl flex-1">
          <div className="glass rounded-[2rem] overflow-hidden shadow-2xl border-white/20 dark:border-white/5 group hover:scale-[1.01] transition-all duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#a81c1c] to-[#7a1212] p-5">
              <h3 className="text-white font-extrabold text-lg tracking-tight uppercase flex items-center gap-2">
                {data.title || "Location Found"}
              </h3>
            </div>

            {/* Content segment */}
            {(data.message || data.description) && (
              <div className="px-6 py-5">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium">
                  {formatText(data.message || data.description)}
                </p>
              </div>
            )}

            {/* Map Frame */}
            {data.embedUrl && (
              <div className="relative h-72 m-2 rounded-2xl overflow-hidden shadow-inner grayscale-[0.2] hover:grayscale-0 transition-all duration-1000">
                <iframe
                  src={data.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Campus Map"
                  className="w-full h-full"
                ></iframe>
              </div>
            )}

            {/* Actions */}
            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 flex gap-2">
              <a
                href={data.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-premium bg-[#1a56db] text-white flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-700"
              >
                <span>🚀</span> Open Navigator
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(data.coordinates || data.title);
                  const toast = document.createElement('div');
                  toast.className = 'fixed top-10 left-1/2 -translate-x-1/2 glass p-4 rounded-2xl text-sm font-bold shadow-2xl z-[999] animate-fadeIn';
                  toast.innerHTML = '📋 Copied to clipboard!';
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 2000);
                }}
                className="p-4 glass rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Copy Details"
              >
                📋
              </button>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-2 px-2 block">
            {timestamp} • DATABASE SOURCE
          </span>
        </div>
      </div>
    );
  }

  // TEXT MESSAGE RENDERING
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}>
      {!isUser && (
        <div className="flex flex-col items-center mr-3 mt-2">
          <div className="w-10 h-10 glass rounded-2xl flex items-center justify-center shadow-lg border-white/40">
            <span className="text-xl">🎓</span>
          </div>
          <div className="w-0.5 h-full bg-gradient-to-b from-gray-200 dark:from-gray-800 to-transparent mt-2"></div>
        </div>
      )}

      <div className={`max-w-[85%] md:max-w-2xl group`}>
        <div className={`relative px-6 py-4 rounded-[2rem] shadow-xl ${
            isUser 
              ? "bg-gradient-to-br from-[#a81c1c] to-[#7a1212] text-white rounded-br-none" 
              : "glass text-gray-800 dark:text-gray-100 border-white/20 dark:border-white/5 rounded-bl-none"
          }`}>
          <div className="text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">
            {formatText(text)}
          </div>
        </div>
        <span className={`text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-2 px-2 block ${isUser ? "text-right" : "text-left"}`}>
          {timestamp} {isUser ? "• SENT" : "• UNIBOT"}
        </span>
      </div>

      {isUser && (
        <div className="flex flex-col items-center ml-3 mt-2">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-xl">👤</span>
          </div>
        </div>
      )}
    </div>
  );
}