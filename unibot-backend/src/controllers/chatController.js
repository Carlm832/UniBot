const aiService = require('../services/aiService');
const vectorService = require('../services/vectorService');
const db = require('../../data/university-info.json');

class ChatController {
  async sendMessage(req, res) {
    try {
      let { message, category = 'general' } = req.body;

      // ============ CATEGORY MAPPING ============
      // Map frontend-friendly categories to backend categories
      const categoryMap = {
        'campus-navigation': 'academic-buildings',
      };
      
      // Store original category for response
      const originalCategory = category;
      
      // Apply mapping if exists
      if (categoryMap[category]) {
        category = categoryMap[category];
      }

      // ============ INPUT VALIDATION ============
      
      if (!message) {
        return res.status(400).json({ 
          success: false,
          error: 'Message is required' 
        });
      }

      if (typeof message !== 'string') {
        return res.status(400).json({ 
          success: false,
          error: 'Message must be a string' 
        });
      }

      if (message.trim().length === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Message cannot be empty' 
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({ 
          success: false,
          error: 'Message is too long. Maximum 1000 characters allowed.' 
        });
      }

      const validCategories = [
        'general', 
        'admissions', 
        'faculties',
        'academic-buildings',
        'accommodation',
        'dining',
        'sports-recreation',
        'cultural-events',
        'banking',
        'shopping',
        'healthcare',
        'student-services',
        'academic-resources'
      ];
      
      if (!validCategories.includes(category)) {
        return res.status(400).json({ 
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
        });
      }

      // ============ END INPUT VALIDATION ============

      // Ensure vector service is initialized
      if (vectorService.documents.length === 0) {
        await vectorService.initialize();
      }

      const result = await aiService.generateResponse(message, category);

      // Format response properly based on type
      const responseData = {
        type: result.response.type || "text",
        message: result.response.message || result.response,
        category: originalCategory, // Return original category to frontend
        timestamp: new Date().toISOString(),
      };

      // Add map-specific fields if it's a map response
      if (result.response.type === "map") {
        responseData.title = result.response.title;
        responseData.embedUrl = result.response.embedUrl;
        responseData.mapsUrl = result.response.mapsUrl;
        responseData.coordinates = result.response.coordinates;
      }

      res.json({
        success: true,
        data: responseData
      });

    } catch (error) {
      console.error('Error in sendMessage:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to generate response',
        message: error.message 
      });
    }
  }

  async searchKnowledge(req, res) {
    try {
      const { query, limit = 5 } = req.body;

      // ============ INPUT VALIDATION ============
      
      if (!query) {
        return res.status(400).json({ 
          success: false,
          error: 'Query is required' 
        });
      }

      if (typeof query !== 'string') {
        return res.status(400).json({ 
          success: false,
          error: 'Query must be a string' 
        });
      }

      if (query.trim().length === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Query cannot be empty' 
        });
      }

      // Validate limit
      if (typeof limit !== 'number' || limit < 1 || limit > 20) {
        return res.status(400).json({ 
          success: false,
          error: 'Limit must be a number between 1 and 20' 
        });
      }

      // ============ END INPUT VALIDATION ============

      if (vectorService.documents.length === 0) {
        await vectorService.initialize();
      }

      const results = await vectorService.search(query, limit);

      res.json({
        success: true,
        data: {
          results: results,
          count: results.length,
        }
      });

    } catch (error) {
      console.error('Error in searchKnowledge:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to search knowledge base',
        message: error.message 
      });
    }
  }

  // New endpoint to get all categories
  async getCategories(req, res) {
    try {
      const categories = [
        { id: 'general', name: 'General Information', icon: 'info' },
        { id: 'admissions', name: 'Admissions', icon: 'school' },
        { id: 'campus-navigation', name: 'Campus Navigation', icon: 'map' }, // Added campus-navigation
        { id: 'faculties', name: 'Faculties & Programs', icon: 'academic' },
        { id: 'academic-buildings', name: 'Academic Buildings', icon: 'building' },
        { id: 'accommodation', name: 'Accommodation', icon: 'home' },
        { id: 'dining', name: 'Dining', icon: 'restaurant' },
        { id: 'sports-recreation', name: 'Sports & Recreation', icon: 'sports' },
        { id: 'cultural-events', name: 'Cultural & Events', icon: 'event' },
        { id: 'banking', name: 'Banking', icon: 'bank' },
        { id: 'shopping', name: 'Shopping', icon: 'shopping' },
        { id: 'healthcare', name: 'Healthcare', icon: 'health' },
        { id: 'student-services', name: 'Student Services', icon: 'services' },
        { id: 'academic-resources', name: 'Academic Resources', icon: 'library' }
      ];

      res.json({
        success: true,
        data: categories
      });

    } catch (error) {
      console.error('Error in getCategories:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get categories',
        message: error.message 
      });
    }
  }
}

module.exports = new ChatController();