require('dotenv').config();
const fs = require('fs');
const path = require('path');
const vectorService = require('../services/vectorService');

async function loadUniversityData() {
  try {
    console.log('Starting data load process...');
    
    // Initialize vector service
    await vectorService.initialize();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await vectorService.clearCollection();
    
    // Read university data file
    const dataPath = path.join(__dirname, '../../data/university-info.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('Error: university-info.json not found in data/ folder');
      console.log('Please create data/university-info.json with your university information');
      process.exit(1);
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const universityData = JSON.parse(rawData);
    
    // Process and prepare documents
    const documents = [];
    
    // Process different categories
    if (universityData.campusNavigation) {
      universityData.campusNavigation.forEach(item => {
        documents.push({
          content: `${item.title}: ${item.description}`,
          metadata: {
            category: 'campus-navigation',
            type: item.type || 'location',
            title: item.title,
          }
        });
      });
    }
    
    if (universityData.admissions) {
      universityData.admissions.forEach(item => {
        documents.push({
          content: `${item.title}: ${item.description}`,
          metadata: {
            category: 'admissions',
            type: item.type || 'requirement',
            title: item.title,
          }
        });
      });
    }
    
    if (universityData.courses) {
      universityData.courses.forEach(course => {
        const content = `${course.code} - ${course.name}: ${course.description}. Prerequisites: ${course.prerequisites || 'None'}. Credits: ${course.credits}`;
        documents.push({
          content: content,
          metadata: {
            category: 'courses',
            code: course.code,
            department: course.department,
            title: course.name,
          }
        });
      });
    }
    
    if (universityData.generalInfo) {
      universityData.generalInfo.forEach(item => {
        documents.push({
          content: `${item.question}: ${item.answer}`,
          metadata: {
            category: 'general',
            type: 'faq',
            title: item.question,
          }
        });
      });
    }
    
    // Add documents to vector database
    console.log(`Processing ${documents.length} documents...`);
    await vectorService.addDocuments(documents);
    
    console.log('✅ Data loading completed successfully!');
    console.log(`Total documents loaded: ${documents.length}`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error loading data:', error);
    process.exit(1);
  }
}

// Run the script
loadUniversityData();