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
            message: "I couldn't find specific information about that. Could you please rephrase your question or ask about admissions, campus locations, courses, or general university information?",
          },
          sources: []
        };
      }

      // IMPROVED: Only show map if it's truly a location query
      const isLocationQuery = this.isLocationQuestion(userMessage);
      
      console.log(`\n📝 Query: "${userMessage}"`);
      console.log(`📍 Is location query: ${isLocationQuery}`);
      
      const mapDoc = isLocationQuery ? relevantDocs.find(doc => doc.content.includes("<iframe")) : null;

      if (mapDoc && isLocationQuery) {
        console.log(`✅ Showing map for: ${mapDoc.metadata.title}`);
        
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

      console.log(`💬 Using AI text response`);

      // If no map OR not a location query, use AI to generate response
      const context = relevantDocs
        .map((doc, idx) => `[SOURCE ${idx + 1}]\nTitle: ${doc.metadata.title}\nCategory: ${doc.metadata.category}\nContent: ${doc.content}`)
        .join("\n\n");

      const systemPrompt = this.getStrictSystemPrompt(category, context);

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.3,
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

  // NEW: Better detection for location queries
  isLocationQuestion(query) {
    const queryLower = query.toLowerCase();
    
    // Strong location indicators
    const locationKeywords = [
      'where is', 'where can i find', 'location of', 'how do i get to',
      'directions to', 'find the', 'show me the', 'map of',
      'where\'s', 'how to reach', 'how to get to', 'show me'
    ];
    
    // Check for strong location indicators first
    const hasStrongIndicator = locationKeywords.some(keyword => queryLower.includes(keyword));
    
    if (hasStrongIndicator) {
      return true;
    }
    
    // If asking "what is" or "how does" about a place, it's informational, not locational
    const informationalPhrases = [
      'what is', 'what are', 'what does',
      'how does', 'how do i apply', 'how do i register',
      'how can i', 'tell me about', 'explain',
      'what certificates', 'what programs', 'what faculties',
      'what student services', 'how to apply', 'how to register'
    ];
    
    const isInformational = informationalPhrases.some(phrase => queryLower.includes(phrase));
    
    if (isInformational) {
      return false;
    }
    
    return false;
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