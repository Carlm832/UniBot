// Bug fix #5: The original code used a regex with the `g` flag AND called both
// `.test()` and `.split()` on the same regex instance. A `g`-flagged regex
// maintains a `lastIndex` cursor, so alternating `.test()` and `.split()` calls
// cause it to miss every other URL match. Fix: use a fresh regex literal in each
// call instead of sharing a single instance.

// Bug fix #6: The copy toast was created via imperative DOM manipulation
// (`document.createElement`), which bypassed React, ignored dark-mode CSS vars,
// and leaked DOM nodes if the component unmounted during the timeout.
// Fix: `onCopy` callback lets ChatInterface manage toast state in React.

export default function MessageBubble({ sender, type, text, data, timestamp, onCopy }) {
  const isUser = sender === "user";
  const isError = type === "error";

  const formatText = (rawText) => {
    if (!rawText) return "";

    // Use a non-global regex for .split() and a separate one for .test()
    // so lastIndex state never bleeds between the two calls.
    const URL_SPLIT = /(https?:\/\/[^\s]+)/;
    const URL_TEST  = /^https?:\/\//;

    return rawText.split("\n").map((line, lineIdx, allLines) => (
      <span key={lineIdx}>
        {line.split(URL_SPLIT).map((part, idx) =>
          URL_TEST.test(part) ? (
            <a
              key={`${lineIdx}-${idx}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a81c1c] dark:text-red-400 font-bold hover:underline decoration-2 underline-offset-4 transition-colors"
            >
              {part}
            </a>
          ) : (
            <span key={`${lineIdx}-${idx}`}>{part}</span>
          )
        )}
        {lineIdx < allLines.length - 1 && <br />}
      </span>
    ));
  };

  const handleCopy = (valueToCopy) => {
    navigator.clipboard.writeText(valueToCopy).then(() => {
      onCopy?.("📋 Copied to clipboard!");
    });
  };

  // ── MAP MESSAGE ────────────────────────────────────────────────────────────
  if (type === "map" && data) {
    return (
      <div className="flex justify-start animate-fadeIn">
        {/* Bot avatar */}
        <div className="flex flex-col items-center mr-3 mt-1 flex-shrink-0">
          <div className="w-9 h-9 bg-[#a81c1c] rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-base">📍</span>
          </div>
        </div>

        <div className="max-w-xl flex-1">
          <div className="card rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
            {/* Card header */}
            <div className="bg-[#a81c1c] px-5 py-4">
              <h3 className="text-white font-extrabold text-base tracking-tight uppercase">
                {data.title || "Location Found"}
              </h3>
            </div>

            {/* Description */}
            {(data.message || data.description) && (
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-medium">
                  {formatText(data.message || data.description)}
                </p>
              </div>
            )}

            {/* Map iframe */}
            {data.embedUrl && (
              <div className="relative h-64 m-3 rounded-xl overflow-hidden">
                <iframe
                  src={data.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Campus Map"
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Actions */}
            <div className="p-3 flex gap-2 surface border-t border-[var(--border)]">
              <a
                href={data.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-crimson flex-1 text-xs uppercase tracking-widest"
              >
                <span>🚀</span> Open in Maps
              </a>
              <button
                onClick={() => handleCopy(data.coordinates || data.title || "")}
                className="btn-ghost px-4"
                title="Copy details"
              >
                📋
              </button>
            </div>
          </div>

          <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] mt-2 px-1 block">
            {timestamp} • Database Source
          </span>
        </div>
      </div>
    );
  }

  // ── TEXT / ERROR MESSAGE ───────────────────────────────────────────────────
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}>

      {/* Bot avatar (left) */}
      {!isUser && (
        <div className="flex flex-col items-center mr-3 mt-1 flex-shrink-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isError ? "bg-amber-100 dark:bg-amber-900/30" : "bg-[#a81c1c]"}`}>
            <span className="text-base">{isError ? "⚠️" : "🎓"}</span>
          </div>
        </div>
      )}

      <div className="max-w-[85%] md:max-w-2xl">
        <div
          className={`relative px-5 py-4 rounded-2xl text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap ${
            isUser
              ? "bg-[#a81c1c] text-white rounded-br-sm shadow-sm"
              : isError
              ? "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-bl-sm"
              : "card text-[var(--text-primary)] rounded-bl-sm"
          }`}
        >
          {formatText(text)}
        </div>
        <span
          className={`text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] mt-1.5 px-1 block ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {timestamp} {isUser ? "• Sent" : isError ? "• Error" : "• UniBot"}
        </span>
      </div>

      {/* User avatar (right) */}
      {isUser && (
        <div className="flex flex-col items-center ml-3 mt-1 flex-shrink-0">
          <div className="w-9 h-9 card rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-base">👤</span>
          </div>
        </div>
      )}

    </div>
  );
}