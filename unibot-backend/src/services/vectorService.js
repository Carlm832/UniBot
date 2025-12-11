const fs = require('fs');
const path = require('path');

class VectorService {
  constructor() {
    this.documents = [];
    this.dataPath = path.join(__dirname, '../../data/vector_store.json');
  }

  async initialize() {
    try {
      // Load existing data if available
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

  // Simple keyword-based search (no embeddings needed!)
  async search(query, nResults = 5) {
    try {
      if (this.documents.length === 0) {
        console.log('No documents in vector store');
        return [];
      }

      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
      
      const scoredDocs = this.documents.map((doc, idx) => {
        const contentLower = doc.content.toLowerCase();
        const titleLower = doc.metadata?.title?.toLowerCase() || '';
        let score = 0;
        
        // Exact phrase match (highest priority)
        if (contentLower.includes(queryLower)) {
          score += 50;
        }
        
        // Title matches (high priority)
        queryWords.forEach(word => {
          if (titleLower.includes(word)) {
            score += 10;
          }
        });
        
        // Content keyword matches
        queryWords.forEach(word => {
          const matches = (contentLower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
          score += matches * 2;
        });
        
        // Category match boost
        if (doc.metadata?.category) {
          queryWords.forEach(word => {
            if (doc.metadata.category.includes(word)) {
              score += 5;
            }
          });
        }
        
        return { index: idx, score };
      });

      const results = scoredDocs
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, nResults);

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

      // Save to file
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