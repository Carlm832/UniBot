const fs = require('fs');
const path = require('path');

class VectorService {
  constructor() {
    this.documents = [];
    // Adjusted for backend/data structure
    this.dataPath = path.join(__dirname, '../../data/vector_store.json');
  }

  async initialize() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
        this.documents = data.documents || [];
        console.log(`Loaded ${this.documents.length} documents from storage`);
      } else {
        console.log('No existing vector store found, starting fresh');
      }
      console.log('Vector service initialized');
    } catch (error) {
      console.error('Error initializing vector service:', error);
      throw error;
    }
  }

  // IMPROVED: Much better search algorithm for location queries
  async search(query, nResults = 5) {
    try {
      if (this.documents.length === 0) {
        console.log('No documents in vector store');
        return [];
      }

      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
      
      // Detect if this is a location query
      const locationKeywords = ['where', 'location', 'find', 'map', 'office', 'building', 'library', 'faculty', 'department'];
      const isLocationQuery = locationKeywords.some(kw => queryLower.includes(kw));
      
      const scoredDocs = this.documents.map((doc, idx) => {
        const contentLower = doc.content.toLowerCase();
        const titleLower = doc.metadata?.title?.toLowerCase() || '';
        let score = 0;
        
        // EXACT TITLE MATCH (highest priority) - this fixes accuracy!
        if (titleLower === queryLower) {
          score += 1000;
        }
        
        // Title contains exact phrase
        if (titleLower.includes(queryLower)) {
          score += 500;
        }
        
        // Content contains exact phrase
        if (contentLower.includes(queryLower)) {
          score += 100;
        }
        
        // BOOST location-related documents if it's a location query
        if (isLocationQuery) {
          if (doc.metadata?.category === 'campus-navigation') {
            score += 50;
          }
          if (doc.metadata?.coordinates) {
            score += 30; // Boost docs that have coordinates
          }
        }
        
        // Word-by-word matching in title (high priority)
        queryWords.forEach(word => {
          if (titleLower.includes(word)) {
            score += 20;
          }
        });
        
        // Word-by-word matching in content
        queryWords.forEach(word => {
          // Use word boundaries for more accurate matching
          const regex = new RegExp(`\\b${word}\\b`, 'g');
          const matches = (contentLower.match(regex) || []).length;
          score += matches * 3;
        });
        
        // Category match
        if (doc.metadata?.category) {
          queryWords.forEach(word => {
            if (doc.metadata.category.includes(word)) {
              score += 10;
            }
          });
        }
        
        // Penalize very short matches for long queries
        if (queryWords.length > 3 && score < 50) {
          score *= 0.5;
        }
        
        return { index: idx, score };
      });

      // Sort by score and filter
      const results = scoredDocs
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, nResults);

      // Logging for debugging
      console.log(`\n🔍 Search for "${query}": Found ${results.length} results`);
      if (results.length > 0) {
        console.log(`   Top result: "${this.documents[results[0].index].metadata.title}" (score: ${results[0].score})`);
        console.log(`   Category: ${this.documents[results[0].index].metadata.category}`);
      } else {
        console.log(`   ⚠️ No matching documents found`);
      }

      return results.map(result => ({
        content: this.documents[result.index].content,
        metadata: this.documents[result.index].metadata,
        score: result.score,
      }));
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  async addDocuments(documents) {
    try {
      console.log(`Processing ${documents.length} documents...`);
      
      documents.forEach((doc, i) => {
        this.documents.push({
          id: `doc_${Date.now()}_${i}`,
          content: doc.content,
          metadata: doc.metadata,
        });
      });

      this.save();
      
      console.log(`✅ Successfully added ${documents.length} documents to vector store`);
    } catch (error) {
      console.error('Error adding documents:', error);
      throw error;
    }
  }

  save() {
    try {
      const data = {
        documents: this.documents,
      };
      
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
      console.log('Vector store saved to file');
    } catch (error) {
      console.error('Error saving vector store:', error);
      throw error;
    }
  }

  async clearCollection() {
    try {
      this.documents = [];
      
      if (fs.existsSync(this.dataPath)) {
        fs.unlinkSync(this.dataPath);
      }
      
      console.log('Vector store cleared');
    } catch (error) {
      console.error('Error clearing vector store:', error);
      throw error;
    }
  }
}

module.exports = new VectorService();