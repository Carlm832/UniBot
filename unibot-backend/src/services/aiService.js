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

      if (relevantDocs.length === 0) {
        return {
          response: {
            type: "text",
            message: "I couldn't find specific information about that. Could you rephrase or ask about:\n• Campus locations and buildings\n• Admissions and fees\n• Faculties and departments\n• Student services\n• Dining and accommodation",
          },
          sources: []
        };
      }

      // Check if ANY relevant document has map data
      const mapDoc = relevantDocs.find(doc => 
        doc.content.includes("<iframe") || 
        (doc.metadata.coordinates && this.isLocationCategory(doc.metadata.category))
      );

      // Enhanced location keyword detection
      const locationKeywords = [
        'where', 'location', 'find', 'map', 'directions', 'navigate', 'address',
        'office', 'building', 'library', 'faculty', 'department', 'hall',
        'bank', 'atm', 'restaurant', 'dining', 'eat', 'food', 'cafe', 'coffee',
        'dormitory', 'dorm', 'accommodation', 'residence', 'housing',
        'gym', 'pool', 'swimming', 'sports', 'stadium', 'court',
        'museum', 'gallery', 'center', 'centre',
        'hospital', 'clinic', 'medical', 'health',
        'pharmacy', 'post', 'laundry', 'shop', 'shopping', 'supermarket', 'store'
      ];
      const isLocationQuery = locationKeywords.some(kw => 
        userMessage.toLowerCase().includes(kw)
      );

      // Return map response if location query AND map data exists
      if (isLocationQuery && mapDoc) {
        // Extract description (everything before iframe)
        let description = mapDoc.content;
        let embedUrl = null;
        
        if (mapDoc.content.includes("<iframe")) {
          const parts = mapDoc.content.split("<iframe");
          description = parts[0].trim();
          
          // Extract iframe src
          const iframeMatch = mapDoc.content.match(/<iframe[^>]*src="([^"]*)"/);
          embedUrl = iframeMatch ? iframeMatch[1] : null;
        }

        // Get coordinates from metadata
        const coords = mapDoc.metadata.coordinates || null;
        
        // Create proper Google Maps URL
        let mapsUrl = null;
        if (coords) {
          const [lng, lat] = coords.split(',').map(c => c.trim());
          mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        }

        // Add additional info if available
        if (mapDoc.metadata.workingHours) {
          description += `\n\nWorking Hours: ${mapDoc.metadata.workingHours}`;
        }
        
        if (mapDoc.metadata.location) {
          description += `\nLocation: ${mapDoc.metadata.location}`;
        }
        
        if (mapDoc.metadata.contact) {
          if (mapDoc.metadata.contact.email) {
            description += `\nEmail: ${mapDoc.metadata.contact.email}`;
          }
          if (mapDoc.metadata.contact.phone) {
            description += `\nPhone: ${mapDoc.metadata.contact.phone}`;
          }
        }

        console.log('🗺️  Returning MAP response for:', mapDoc.metadata.title);

        return {
          response: {
            type: "map",
            message: description,
            title: mapDoc.metadata.title || "Location",
            embedUrl,
            mapsUrl,
            coordinates: coords,
          },
          sources: relevantDocs.map(doc => doc.metadata)
        };
      }

      // For non-map queries, use AI
      const context = relevantDocs
        .map((doc, idx) => {
          // Remove iframe HTML from context sent to AI
          const cleanContent = doc.content.split('<iframe')[0].trim();
          return `[SOURCE ${idx + 1}]\nTitle: ${doc.metadata.title}\nCategory: ${doc.metadata.category}\nContent: ${cleanContent}\n`;
        })
        .join("\n");

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

  isLocationCategory(category) {
    const locationCategories = [
      'academic-buildings',
      'accommodation',
      'dining',
      'sports-recreation',
      'cultural-events',
      'banking',
      'shopping',
      'healthcare'
    ];
    return locationCategories.includes(category);
  }

  getStrictSystemPrompt(category, context) {
    return `You are an AI assistant for Near East University (NEU) in Northern Cyprus.

🚨 CRITICAL RULES:
1. ONLY use information from the CONTEXT below
2. NEVER make up, invent, or assume information
3. If information isn't in the context, say "I don't have that information. Please contact [relevant office]"
4. Always refer to the university as "Near East University" or "NEU"
5. Be helpful, friendly, and professional
6. Keep responses concise (2-4 sentences)
7. Use bullet points for lists
8. For contact information, always include available phone numbers, emails, and websites
9. For locations, mention building names and any available details

CONTEXT (Your ONLY source of truth):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${context}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUERY CATEGORY: ${category}

For location queries, note that map data is handled separately - focus on describing the location clearly and include working hours, contact info, and building location if available.`;
  }
}

module.exports = new AIService();