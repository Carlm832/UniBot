export default function MapCard({ title, description, embedUrl, mapsUrl }) {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 space-y-3 animate-fadeIn">

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>

      {/* Map iframe */}
      <div className="w-full h-64 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>

      {/* Button */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full text-center bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white py-2 rounded-lg font-medium transition"
      >
        Open in Google Maps
      </a>
    </div>
  );
}
