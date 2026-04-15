const fs = require('fs');
const path = require('path');

class SearchService {
    constructor() {
        this.documents = [];
        this.possiblePaths = [
            path.join(process.cwd(), 'unibot-backend', 'data', 'vector_store.json'),
            path.join(process.cwd(), 'data', 'vector_store.json'),
            path.resolve(__dirname, '../../data/vector_store.json'),
            path.resolve(__dirname, '../data/vector_store.json'),
            path.resolve(__dirname, '../../../data/vector_store.json'),
            '/var/task/unibot-backend/data/vector_store.json',
            '/var/task/data/vector_store.json'
        ];
        this.dataPath = this.possiblePaths[0]; // Primary fallback
    }

    async initialize() {
        try {
            console.log('--- 🔍 Search Service Diagnostics ---');
            console.log(`Working Dir: ${process.cwd()}`);
            console.log(`Dirname: ${__dirname}`);

            const foundPath = this.possiblePaths.find(p => fs.existsSync(p));
            
            if (foundPath) {
                this.dataPath = foundPath;
                const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
                this.documents = data.documents || [];
                console.log(`✅ Loaded ${this.documents.length} docs from: ${this.dataPath}`);
            } else {
                console.log('⚠️  No search store found in any candidate path:');
                this.possiblePaths.forEach(p => console.log(`   - ${p}`));
            }
            console.log('-----------------------------------');
        } catch (error) {
            console.error('❌ Error initializing search service:', error);
            throw error;
        }
    }

    async search(query, nResults = 5) {
        try {
            // Runtime retry if store is empty (common on serverless cold starts)
            if (this.documents.length === 0) {
                console.log('🔄 Attemping runtime search store initialization...');
                await this.initialize();
            }

            if (this.documents.length === 0) {
                console.log('⚠️  Search store remains empty after initialization');
                return [];
            }

            const queryLower = query.toLowerCase().trim();
            const stopwords = ['the', 'is', 'at', 'on', 'in', 'to', 'for', 'of', 'and', 'a', 'an', 'where', 'what', 'how', 'show', 'tell', 'me', 'about'];
            const queryWords = queryLower.split(/\s+/).filter(w => w.length >= 2 && !stopwords.includes(w));
            
            // If all words were stopwords, fallback to all words >= 2
            const effectiveWords = queryWords.length > 0 ? queryWords : queryLower.split(/\s+/).filter(w => w.length >= 2);

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
                    score += 300; // Increased from 200
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
                let uniqueMatches = 0;
                effectiveWords.forEach(word => {
                    const regex = new RegExp(`\\b${word}\\b`, 'gi');
                    const titleMatches = (titleLower.match(regex) || []).length;
                    const contentMatches = (contentLower.match(regex) || []).length;

                    if (titleMatches > 0 || contentMatches > 0) {
                        uniqueMatches++;
                        score += titleMatches * 150;
                        score += contentMatches * 20;
                    } else {
                        // Fallback: Partial match (no word boundary)
                        if (titleLower.includes(word) || contentLower.includes(word)) {
                            uniqueMatches += 0.5; // Partial unique match
                            score += 50; 
                        }
                    }
                });

                // Multi-word bonus: Huge boost if multiple unique query words match
                if (uniqueMatches > 1) {
                    score += (uniqueMatches * 500); 
                }

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
                console.log(`   🥇 Top: "${results[0].doc.metadata.title}" (score: ${results[0].score.toFixed(1)})`);
                console.log(`      Matches: ${effectiveWords.filter(w => results[0].doc.content.toLowerCase().includes(w)).join(', ')}`);
            } else {
                console.log(`   ⚠️  No matches found for query words: ${effectiveWords.join(', ')}`);
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
            console.log('💾 Search store saved');
        } catch (error) {
            console.error('❌ Error saving search store:', error);
            throw error;
        }
    }

    async clearCollection() {
        try {
            this.documents = [];
            if (fs.existsSync(this.dataPath)) {
                fs.unlinkSync(this.dataPath);
            }
            console.log('🗑️  Search store cleared');
        } catch (error) {
            console.error('❌ Error clearing search store:', error);
            throw error;
        }
    }
}

module.exports = new SearchService();
