const Groq = require('groq-sdk');
const vectorService = require('./vectorService');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class AIService {
  async generateResponse(userMessage, category = 'general') {
    try {
      // Search vector DB
      const relevantDocs = await vectorService.search(userMessage, 5);

      // Check if any document contains a map iframe
      const mapDoc = relevantDocs.find(doc => doc.content.includes("<iframe"));

      if (mapDoc) {
        // Extract map info
        const [description] = mapDoc.content.split("<iframe");

        const iframeMatch = mapDoc.content.match(/<iframe[^>]*src="([^"]*)"/);
        const embedUrl = iframeMatch ? iframeMatch[1] : null;

        const coords = mapDoc.metadata.coordinates || null;
        const mapsUrl = coords
          ? `https://www.google.com/maps?q=${coords}`
          : embedUrl;

        if (mapDoc) {
          const [description] = mapDoc.content.split("<iframe");
          const iframeMatch = mapDoc.content.match(/<iframe[^>]*src="([^"]*)"/);
          const embedUrl = iframeMatch ? iframeMatch[1] : null;
          const coords = mapDoc.metadata.coordinates || null;
          const mapsUrl = coords ? `https://www.google.com/maps?q=${coords}` : embedUrl;

          return {
            response: {
              type: "map",
              message: description.trim(), // Add this!
              title: mapDoc.metadata.title || "Location",
              embedUrl,
              mapsUrl,
              coordinates: coords,
            },
            sources: relevantDocs.map(doc => doc.metadata)
          };
        }

        // For text responses, wrap in object for consistency
        return {
          response: {
            type: "text",
            message: completion.choices[0].message.content,
          },
          sources: relevantDocs.map(doc => doc.metadata),
        };
      }

      // If no map, use the AI normally
      const context = relevantDocs.map(doc => doc.content).join("\n\n");
      const systemPrompt = this.getSystemPrompt(category, context);

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return {
        response: completion.choices[0].message.content,
        sources: relevantDocs.map(doc => doc.metadata),
      };

    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }

  getSystemPrompt(category, context) {
    const basePrompt = `You are a helpful university assistant for NEU.
Use the following context:

${context}

Rules:
- If the answer contains location info, but *no iframe was returned*, tell the user what building it is in and its working hours.
- If no relevant info is found, say so politely.
- Keep answers very clear and helpful.`;

    return basePrompt;
  }
}

module.exports = new AIService();
