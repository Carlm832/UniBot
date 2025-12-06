const aiService = require('../services/aiService');
const vectorService = require('../services/vectorService');
const navigationService = require('../services/navigationService');
const db = require('../../data/database.json');

class ChatController {
  async sendMessage(req, res) {
    try {
      const { message, category = "general" } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Ensure vector service is initialized
      if (!vectorService.collection) {
        await vectorService.initialize();
      }

      // ⭐ 1. Try NAVIGATION LOOKUP before AI
      const location = navigationService.findLocation(message, db);

      if (location) {
        // If the building has coordinates → return map card
        if (location.coordinates) {
          const mapCard = navigationService.buildMapCard(location);

          return res.json({
            success: true,
            data: mapCard
          });
        }

        // If it exists but no coordinates → return description text
        return res.json({
          success: true,
          data: {
            type: "text",
            message: location.description
          }
        });
      }

      // ⭐ 2. If NOT navigation → fallback to AI
      const result = await aiService.generateResponse(message, category);

      res.json({
        success: true,
        data: {
          type: "text",
          message: result.response,
          category: category,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error("Error in sendMessage:", error);

      res.status(500).json({
        success: false,
        error: "Failed to generate response",
        message: error.message
      });
    }
  }

  async searchKnowledge(req, res) {
    try {
      const { query, limit = 5 } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      if (!vectorService.collection) {
        await vectorService.initialize();
      }

      const results = await vectorService.search(query, limit);

      res.json({
        success: true,
        data: {
          results: results,
          count: results.length
        }
      });

    } catch (error) {
      console.error("Error in searchKnowledge:", error);
      res.status(500).json({
        success: false,
        error: "Failed to search knowledge base",
        message: error.message
      });
    }
  }
}

module.exports = new ChatController();
