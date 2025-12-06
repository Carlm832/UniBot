const Groq = require('groq-sdk');
const vectorService = require('./vectorService');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class AIService {
  async generateResponse(userMessage, category = 'general') {
    try {
      // Search for relevant context from vector database
      const relevantDocs = await vectorService.search(userMessage, 5);
      
      // Build context from retrieved documents
      const context = relevantDocs
        .map(doc => doc.content)
        .join('\n\n');

      // Create system prompt based on category
      const systemPrompt = this.getSystemPrompt(category, context);

      // Generate response using Groq (Free & Fast!)
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // Fast and high quality
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return {
        response: completion.choices[0].message.content,
        sources: relevantDocs.map(doc => doc.metadata),
      };
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  getSystemPrompt(category, context) {
    const basePrompt = `You are a helpful university chatbot assistant for Near East University (NEU). Your role is to help students with information about the university.

Use the following context to answer the student's question. If the context doesn't contain relevant information, politely say so and provide general guidance.

Context:
${context}

Guidelines:
- Be friendly, helpful, and concise
- Provide accurate information based on the context
- If you're unsure, admit it and suggest who the student should contact
- Use bullet points for lists when appropriate
- Keep responses clear and easy to understand`;

    const categoryPrompts = {
      'campus-navigation': `${basePrompt}\n\nFocus on: Building locations, directions, parking, campus facilities, and getting around campus.`,
      'admissions': `${basePrompt}\n\nFocus on: Admission requirements, application process, deadlines, scholarships, and enrollment information.`,
      'courses': `${basePrompt}\n\nFocus on: Course information, prerequisites, schedules, registration, and academic programs.`,
      'general': basePrompt,
    };

    return categoryPrompts[category] || basePrompt;
  }
}

module.exports = new AIService();