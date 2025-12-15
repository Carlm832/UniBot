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
    // Adjusted for backend/data structure
    const dataPath = path.join(__dirname, '../data/university-info.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('Error: university-info.json not found in data/ folder');
      console.log('Please create data/university-info.json with your university information');
      process.exit(1);
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const universityData = JSON.parse(rawData);
    
    // Process and prepare documents
    const documents = [];
    
    // Process campus navigation with coordinates
    if (universityData.campusNavigation) {
      universityData.campusNavigation.forEach(item => {
        documents.push({
          content: `${item.title}: ${item.description}`,
          metadata: {
            category: 'campus-navigation',
            type: item.type || 'location',
            title: item.title,
            coordinates: item.coordinates || null, // IMPORTANT: Include coordinates
          }
        });
      });
      console.log(`Loaded ${universityData.campusNavigation.length} campus navigation items`);
    }
    
    // Process admissions
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
      console.log(`Loaded ${universityData.admissions.length} admission items`);
    }
    
    // Process courses with coordinates
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
            coordinates: course.coordinates || null, // IMPORTANT: Include coordinates
          }
        });
      });
      console.log(`Loaded ${universityData.courses.length} courses`);
    }
    
    // Process general info
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
      console.log(`Loaded ${universityData.generalInfo.length} general info items`);
    }
    
    // Add documents to vector database
    console.log(`\nProcessing ${documents.length} total documents...`);
    await vectorService.addDocuments(documents);
    
    // Summary
    console.log('\n✅ Data loading completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📚 Total documents loaded: ${documents.length}`);
    console.log(`📍 Campus locations: ${universityData.campusNavigation?.length || 0}`);
    console.log(`📝 Admission items: ${universityData.admissions?.length || 0}`);
    console.log(`🎓 Courses: ${universityData.courses?.length || 0}`);
    console.log(`ℹ️  General info: ${universityData.generalInfo?.length || 0}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error loading data:', error);
    process.exit(1);
  }
}

// Run the script
loadUniversityData();