const fs = require('fs');
const path = require('path');
const vectorService = require('../services/searchService');

async function importExtraData() {
  try {
    const dbPath = path.join(process.cwd(), 'temp_db');
    if (!fs.existsSync(dbPath)) {
      console.error('❌ temp_db folder not found. Please clone the repository first.');
      return;
    }

    await vectorService.initialize();
    const files = fs.readdirSync(dbPath).filter(f => !f.startsWith('.'));
    const documents = [];

    console.log(`📂 Found ${files.length} files in Unibot-database`);

    for (const file of files) {
      const content = fs.readFileSync(path.join(dbPath, file), 'utf8');
      
      if (file.startsWith('faculty_')) {
        // Parse Faculty File
        const titleMatch = content.match(/^# (.*)/);
        const title = titleMatch ? titleMatch[1] : file.replace('faculty_', '').replace('_', ' ');
        
        const websiteMatch = content.match(/\*\*Website:\*\* \[.*?\]\((.*?)\)/);
        const website = websiteMatch ? websiteMatch[1] : null;

        const locationMatch = content.match(/\*\*Location:\*\* (.*)/);
        const location = locationMatch ? locationMatch[1].trim() : null;

        const iframeMatch = content.match(/<iframe.*?>.*?<\/iframe>/s);
        const iframe = iframeMatch ? iframeMatch[0] : null;

        const departments = [...content.matchAll(/^- (.*)/gm)].map(m => m[1].trim());

        let cleanContent = `${title}: Academic faculty at Near East University.`;
        if (location) cleanContent += `\nLocation: ${location}`;
        if (departments.length > 0) cleanContent += `\nDepartments: ${departments.join(', ')}`;
        if (website) cleanContent += `\nWebsite: ${website}`;
        if (iframe) cleanContent += `\n\n${iframe}`;

        documents.push({
          content: cleanContent,
          metadata: {
            category: 'faculties',
            type: 'faculty',
            title: title,
            website: website,
            location: location,
            source: 'unibot-database'
          }
        });
      } else if (file === 'additional_Info') {
        // Parse Additional Info (multi-item)
        const sections = content.split('---');
        for (const section of sections) {
          const trimmed = section.trim();
          if (!trimmed) continue;

          // Try to extract a title (first line)
          const lines = trimmed.split('\n');
          const title = lines[0].replace(/#|[\*\*_]/g, '').trim();
          
          let category = 'general';
          if (title.toLowerCase().includes('dormitory') || title.toLowerCase().includes('guest house')) {
            category = 'accommodation';
          } else if (title.toLowerCase().includes('post office')) {
            category = 'academic-buildings';
          } else if (title.toLowerCase().includes('restaurant') || title.toLowerCase().includes('cafe')) {
            category = 'dining';
          } else if (title.toLowerCase().includes('museum') || title.toLowerCase().includes('park') || title.toLowerCase().includes('center')) {
            category = 'cultural-events';
          }

          documents.push({
            content: trimmed,
            metadata: {
              category: category,
              type: 'info',
              title: title,
              source: 'unibot-database'
            }
          });
        }
      } else if (file === 'institution_info') {
          // General Info
          documents.push({
              content: content.trim(),
              metadata: {
                  category: 'general',
                  type: 'university-info',
                  title: 'NEU General Information',
                  source: 'unibot-database'
              }
          });
      }
    }

    console.log(`\n📦 Parsed ${documents.length} documents from Unibot-database`);
    
    // Add to vector service (this appends/updates)
    await vectorService.addDocuments(documents);
    
    console.log('✅ Successfully integrated extra data!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error importing extra data:', error);
    process.exit(1);
  }
}

importExtraData();
