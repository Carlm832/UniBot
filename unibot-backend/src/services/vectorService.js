const fs = require('fs');
const path = require('path');

class VectorService {
  constructor() {
    this.documents = [];
    this.dataPath = path.join(__dirname, '../../data/vector_store.json');
  }

  async initialize() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
        this.documents = data.documents || [];
        console.log(`✅ Loaded ${this.documents.length} documents from storage`);
      } else {
        console.log('⚠️  No existing vector store found, starting fresh');
      }
      console.log('🚀 Vector service initialized');
    } catch (error) {
      console.error('❌ Error initializing vector service:', error);
      throw error;
    }
  }

  async search(query, nResults = 5) {
    try {
      if (this.documents.length === 0) {
        console.log('⚠️  No documents in vector store');
        return [];
      }

      const queryLower = query.toLowerCase().trim();
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
      
      // Enhanced location keyword detection
      const locationKeywords = [
        'where', 'location', 'find', 'map', 'directions', 'navigate',
        'office', 'building', 'library', 'faculty', 'department',
        'bank', 'restaurant', 'dining', 'eat', 'food', 'cafe',
        'dormitory', 'dorm', 'accommodation', 'gym', 'pool',
        'museum', 'hospital', 'pharmacy', 'post', 'laundry',
        'supermarket', 'shop', 'shopping', 'atm'
      ];
      const isLocationQuery = locationKeywords.some(kw => queryLower.includes(kw));
      
      const scoredDocs = this.documents.map((doc, idx) => {
        const contentLower = doc.content.toLowerCase();
        const titleLower = doc.metadata?.title?.toLowerCase() || '';
        const categoryLower = doc.metadata?.category?.toLowerCase() || '';
        const typeLower = doc.metadata?.type?.toLowerCase() || '';
        let score = 0;
        
        // EXACT TITLE MATCH (highest priority)
        if (titleLower === queryLower) {
          score += 1000;
        }
        
        // Title contains exact query phrase
        if (titleLower.includes(queryLower)) {
          score += 500;
        }
        
        // Fuzzy title matching (handles typos)
        queryWords.forEach(word => {
          if (titleLower.includes(word)) {
            score += 100;
          }
          if (this.similarityMatch(titleLower, word)) {
            score += 50;
          }
        });
        
        // Content contains exact phrase
        if (contentLower.includes(queryLower)) {
          score += 200;
        }
        
        // BOOST location documents for location queries
        if (isLocationQuery) {
          if (doc.metadata?.coordinates) {
            score += 300;
          }
          if (doc.content.includes('<iframe')) {
            score += 250;
          }
          if (doc.metadata?.mapEmbed) {
            score += 200;
          }
          // Boost specific location types
          if (['office', 'library', 'building', 'dining', 'accommodation', 
               'banking', 'shopping', 'sports', 'venue', 'museum', 'service'].includes(typeLower)) {
            score += 150;
          }
        }
        
        // Word-by-word matching
        queryWords.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'g');
          const titleMatches = (titleLower.match(regex) || []).length;
          const contentMatches = (contentLower.match(regex) || []).length;
          
          score += titleMatches * 50;
          score += contentMatches * 10;
        });
        
        // Category and type matching
        if (categoryLower) {
          queryWords.forEach(word => {
            if (categoryLower.includes(word)) {
              score += 30;
            }
          });
        }
        
        if (typeLower) {
          queryWords.forEach(word => {
            if (typeLower.includes(word)) {
              score += 25;
            }
          });
        }
        
        // Penalize irrelevant short matches
        if (queryWords.length > 3 && score < 50) {
          score *= 0.3;
        }
        
        return { index: idx, score, doc };
      });

      const results = scoredDocs
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, nResults);

      console.log(`\n🔍 Search: "${query}"`);
      console.log(`   Query type: ${isLocationQuery ? 'LOCATION' : 'GENERAL'}`);
      console.log(`   Results: ${results.length}`);
      
      if (results.length > 0) {
        console.log(`   🥇 Top: "${results[0].doc.metadata.title}" (score: ${results[0].score})`);
        console.log(`      Category: ${results[0].doc.metadata.category}`);
        console.log(`      Type: ${results[0].doc.metadata.type}`);
        console.log(`      Has coords: ${!!results[0].doc.metadata.coordinates}`);
        console.log(`      Has map: ${results[0].doc.content.includes('<iframe')}`);
      } else {
        console.log(`   ⚠️  No matches found`);
      }

      return results.map(result => ({
        content: this.documents[result.index].content,
        metadata: this.documents[result.index].metadata,
        score: result.score,
      }));
      
    } catch (error) {
      console.error('❌ Error searching documents:', error);
      throw error;
    }
  }

  similarityMatch(text, word) {
    const words = text.split(/\s+/);
    for (let w of words) {
      if (this.levenshteinDistance(w, word) <= 2) {
        return true;
      }
    }
    return false;
  }

  levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  async addDocuments(documents) {
    try {
      console.log(`📦 Processing ${documents.length} documents...`);
      
      documents.forEach((doc, i) => {
        this.documents.push({
          id: `doc_${Date.now()}_${i}`,
          content: doc.content,
          metadata: doc.metadata,
        });
      });

      this.save();
      
      console.log(`✅ Successfully added ${documents.length} documents`);
    } catch (error) {
      console.error('❌ Error adding documents:', error);
      throw error;
    }
  }

  save() {
    try {
      const data = { documents: this.documents };
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
      console.log('💾 Vector store saved');
    } catch (error) {
      console.error('❌ Error saving vector store:', error);
      throw error;
    }
  }

  async clearCollection() {
    try {
      this.documents = [];
      if (fs.existsSync(this.dataPath)) {
        fs.unlinkSync(this.dataPath);
      }
      console.log('🗑️  Vector store cleared');
    } catch (error) {
      console.error('❌ Error clearing vector store:', error);
      throw error;
    }
  }
}

module.exports = new VectorService();