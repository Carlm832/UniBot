const Groq = require('groq-sdk');
const vectorService = require('./vectorService');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class AIService {
  async generateResponse(userMessage, category = 'general') {
    try {
      // Search vector DB with better relevance
      const relevantDocs = await vectorService.search(userMessage, 5);

      if (relevantDocs.length === 0) {
        return {
          response: {
            type: "text",
            message: "I couldn't find specific information about that in my knowledge base. Could you please rephrase your question or ask about:\n• Admissions and requirements\n• Campus locations and navigation\n• Academic programs and courses\n• Student services and general information",
          },
          sources: []
        };
      }

      // Check if any document contains a map iframe (for location queries)
      const mapDoc = relevantDocs.find(doc => doc.content.includes("<iframe"));

      if (mapDoc) {
        // Extract description (everything before iframe)
        const [description] = mapDoc.content.split("<iframe");

        // Extract iframe src
        const iframeMatch = mapDoc.content.match(/<iframe[^>]*src="([^"]*)"/);
        const embedUrl = iframeMatch ? iframeMatch[1] : null;

        // Get coordinates from metadata
        const coords = mapDoc.metadata.coordinates || null;
        
        // Create proper Google Maps URL
        let mapsUrl = null;
        if (coords) {
          const [lng, lat] = coords.split(',').map(c => c.trim());
          mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        }

        return {
          response: {
            type: "map",
            message: description.trim(),
            title: mapDoc.metadata.title || "Location",
            embedUrl,
            mapsUrl,
            coordinates: coords,
          },
          sources: relevantDocs.map(doc => doc.metadata)
        };
      }

      // For non-map queries, use AI with STRICT instructions
      const context = relevantDocs
        .map((doc, idx) => `[SOURCE ${idx + 1}]\nTitle: ${doc.metadata.title}\nCategory: ${doc.metadata.category}\nContent: ${doc.content}\n`)
        .join("\n");

      const systemPrompt = this.getStrictSystemPrompt(category, context);

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.3, // REDUCED from 0.7 for more consistent, factual responses
        max_tokens: 500,
      });

      return {
        response: {
          type: "text",
          message: completion.choices[0].message.content,
        },
        sources: relevantDocs.map(doc => doc.metadata),
      };

    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }

  getStrictSystemPrompt(category, context) {
    const prompt = `You are an AI assistant for Near East University (NEU).

🚨 CRITICAL RULES - NEVER VIOLATE THESE:
1. ONLY use information from the CONTEXT provided below
2. NEVER make up, invent, or assume any information
3. NEVER mention other universities or institutions
4. If information is not in the context, say "I don't have that specific information in my knowledge base"
5. Always refer to the university as "Near East University" or "NEU" - NEVER change the name
6. Quote or paraphrase directly from the context - do NOT add your own knowledge
7. If asked about something not in the context, politely say you don't have that information and suggest contacting the relevant office

CONTEXT (This is your ONLY source of truth):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${context}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUERY CATEGORY: ${category}

RESPONSE GUIDELINES:
- Be helpful, friendly, and professional
- Keep responses concise (2-4 sentences when possible)
- Use bullet points for lists
- If the context has partial information, share what you know and acknowledge what's missing
- End with "Would you like to know anything else?" only if you successfully answered the question

Remember: You are specifically for Near East University. Do not reference or compare to other institutions.`;

    return prompt;
  }
}

module.exports = new AIService();