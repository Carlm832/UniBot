const vectorService = require("./vectorService");

class AIService {
  constructor() {}

  async generateResponse(userMessage, category = "general") {
    try {
      // Ensure vector store is ready
      if (!vectorService.documents || vectorService.documents.length === 0) {
        await vectorService.initialize();
      }

      // Search vector store
      const relevantDocs = await vectorService.search(userMessage, 5);

      // ===============================
      // 🗺️ MAP-AWARE RESPONSE (DATA-DRIVEN)
      // ===============================
      const mapDoc = relevantDocs.find(doc =>
        doc.metadata?.category === "campus-navigation" &&
        (doc.metadata.coordinates || doc.metadata.embedUrl)
      );

      if (mapDoc) {
        const coords = mapDoc.metadata.coordinates;
        const embedUrl = mapDoc.metadata.embedUrl;

        let mapsUrl = null;
        if (coords) {
          const [lng, lat] = coords.split(",").map(v => v.trim());
          mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        }

        return {
          response: {
            type: "map",
            title: mapDoc.metadata.title,
            message: mapDoc.content,
            embedUrl,
            mapsUrl,
            coordinates: coords
          },
          sources: relevantDocs.map(d => d.metadata)
        };
      }

      // ===============================
      // 💬 NORMAL TEXT RESPONSE
      // ===============================
      if (relevantDocs.length > 0) {
        const combinedText = relevantDocs
          .map(doc => doc.content)
          .join("\n\n");

        return {
          response: {
            type: "text",
            message: combinedText
          },
          sources: relevantDocs.map(d => d.metadata)
        };
      }

      // ===============================
      // 🤷 FALLBACK
      // ===============================
      return {
        response: {
          type: "text",
          message:
            "I'm not sure about that yet, but I can help with admissions, academics, or campus locations."
        },
        sources: []
      };

    } catch (error) {
      console.error("❌ AIService error:", error);
      throw error;
    }
  }
}

module.exports = new AIService();
