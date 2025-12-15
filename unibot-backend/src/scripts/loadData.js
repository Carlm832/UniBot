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
    
    // 1. University Info
    if (universityData.universityInfo) {
      const info = universityData.universityInfo;
      documents.push({
        content: `${info.name} (${info.abbreviation}) was established in ${info.established} and is located in ${info.location}.
Contact: Phone: ${info.mainContact.phone.join(', ')}, Email: ${info.mainContact.email}, WhatsApp: ${info.mainContact.whatsapp}
Website: ${info.mainContact.website}
Address: ${info.mainContact.address}`,
        metadata: {
          category: 'university-info',
          type: 'main',
          title: info.name,
        }
      });
    }
    
    // 2. Admissions - Process each section
    if (universityData.admissions) {
      const adm = universityData.admissions;
      
      if (adm.applicationProcess) {
        documents.push({
          content: `${adm.applicationProcess.title}: ${adm.applicationProcess.description}
Website: ${adm.applicationProcess.website}
Steps: ${adm.applicationProcess.steps.join(', ')}`,
          metadata: {
            category: 'admissions',
            type: 'application-process',
            title: adm.applicationProcess.title,
          }
        });
      }
      
      if (adm.requirements?.internationalExams) {
        documents.push({
          content: `${adm.requirements.internationalExams.title}: ${adm.requirements.internationalExams.description}
Accepted Certificates: ${adm.requirements.internationalExams.certificates.join(', ')}`,
          metadata: {
            category: 'admissions',
            type: 'international-exams',
            title: adm.requirements.internationalExams.title,
          }
        });
      }
      
      if (adm.requirements?.regionalExams) {
        documents.push({
          content: `${adm.requirements.regionalExams.title}: ${adm.requirements.regionalExams.description}
Accepted Certificates: ${adm.requirements.regionalExams.certificates.join(', ')}`,
          metadata: {
            category: 'admissions',
            type: 'regional-exams',
            title: adm.requirements.regionalExams.title,
          }
        });
      }
      
      if (adm.residencePermit) {
        documents.push({
          content: `${adm.residencePermit.title}: ${adm.residencePermit.description}
Website: ${adm.residencePermit.website}
Assistance: ${adm.residencePermit.assistanceOffice}`,
          metadata: {
            category: 'admissions',
            type: 'residence-permit',
            title: adm.residencePermit.title,
          }
        });
      }
      
      if (adm.fees) {
        documents.push({
          content: `${adm.fees.title}: ${adm.fees.description}
Website: ${adm.fees.website}
Note: ${adm.fees.note}`,
          metadata: {
            category: 'admissions',
            type: 'fees',
            title: adm.fees.title,
          }
        });
      }
    }
    
    // 3. Academic Buildings
    if (universityData.academicBuildings) {
      Object.entries(universityData.academicBuildings).forEach(([key, building]) => {
        documents.push({
          content: `${building.title}: ${building.description}
${building.location ? `Location: ${building.location}` : ''}
${building.workingHours ? `Working Hours: ${building.workingHours}` : ''}
${building.contact ? `Contact: Email ${building.contact.email}, Phone ${building.contact.phone}` : ''}`,
          metadata: {
            category: 'academic-buildings',
            type: building.type || 'building',
            title: building.title,
            coordinates: building.coordinates || null,
            mapEmbed: building.mapEmbed || null,
          }
        });
      });
    }
    
    // 4. Accommodation
    if (universityData.accommodation) {
      Object.entries(universityData.accommodation).forEach(([key, place]) => {
        documents.push({
          content: `${place.title}: ${place.description}
${place.location ? `Location: ${place.location}` : ''}
${place.types ? `Available: ${place.types.join(', ')}` : ''}
${place.total ? `Total: ${place.total}` : ''}`,
          metadata: {
            category: 'accommodation',
            type: 'housing',
            title: place.title,
            coordinates: place.coordinates || place.dormitory1Location?.coordinates || null,
            mapEmbed: place.mapEmbed || place.dormitory1Location?.mapEmbed || null,
          }
        });
      });
    }
    
    // 5. Dining
    if (universityData.dining) {
      Object.entries(universityData.dining).forEach(([key, restaurant]) => {
        documents.push({
          content: `${restaurant.title}: ${restaurant.description}
Cuisine: ${restaurant.cuisine}`,
          metadata: {
            category: 'dining',
            type: 'restaurant',
            title: restaurant.title,
            cuisine: restaurant.cuisine,
            coordinates: restaurant.coordinates || null,
            mapEmbed: restaurant.mapEmbed || null,
          }
        });
      });
    }
    
    // 6. Sports and Recreation
    if (universityData.sportsAndRecreation) {
      Object.entries(universityData.sportsAndRecreation).forEach(([key, facility]) => {
        documents.push({
          content: `${facility.title}: ${facility.description}
Facilities: ${facility.facilities.join(', ')}`,
          metadata: {
            category: 'sports-recreation',
            type: 'facility',
            title: facility.title,
            coordinates: facility.coordinates || null,
            mapEmbed: facility.mapEmbed || null,
          }
        });
      });
    }
    
    // 7. Cultural and Events
    if (universityData.culturalAndEvents) {
      Object.entries(universityData.culturalAndEvents).forEach(([key, venue]) => {
        documents.push({
          content: `${venue.title}: ${venue.description}
Type: ${venue.type}`,
          metadata: {
            category: 'cultural-events',
            type: venue.type.toLowerCase(),
            title: venue.title,
            coordinates: venue.coordinates || null,
            mapEmbed: venue.mapEmbed || null,
          }
        });
      });
    }
    
    // 8. Banking
    if (universityData.banking) {
      Object.entries(universityData.banking).forEach(([key, bank]) => {
        documents.push({
          content: `${bank.title}: ${bank.description}
Location: ${bank.location}`,
          metadata: {
            category: 'banking',
            type: 'bank',
            title: bank.title,
            coordinates: bank.coordinates || null,
            mapEmbed: bank.mapEmbed || null,
          }
        });
      });
    }
    
    // 9. Shopping
    if (universityData.shopping) {
      Object.entries(universityData.shopping).forEach(([key, shop]) => {
        documents.push({
          content: `${shop.title}: ${shop.description}
Type: ${shop.type}`,
          metadata: {
            category: 'shopping',
            type: shop.type.toLowerCase(),
            title: shop.title,
            coordinates: shop.coordinates || null,
            mapEmbed: shop.mapEmbed || null,
          }
        });
      });
    }
    
    // 10. Healthcare
    if (universityData.healthcare) {
      Object.entries(universityData.healthcare).forEach(([key, facility]) => {
        documents.push({
          content: `${facility.title}: ${facility.description}
Type: ${facility.type}
Services: ${facility.services.join(', ')}`,
          metadata: {
            category: 'healthcare',
            type: facility.type.toLowerCase(),
            title: facility.title,
          }
        });
      });
    }
    
    // 11. Faculties
    if (universityData.faculties && Array.isArray(universityData.faculties)) {
      universityData.faculties.forEach(faculty => {
        documents.push({
          content: `${faculty.name} (${faculty.code}): ${faculty.description}
${faculty.departments ? `Departments: ${faculty.departments.join(', ')}` : ''}
${faculty.programs ? `Programs: ${faculty.programs.join(', ')}` : ''}
Location: ${faculty.location}
Website: ${faculty.website}`,
          metadata: {
            category: 'faculties',
            type: 'faculty',
            title: faculty.name,
            code: faculty.code,
            coordinates: faculty.coordinates || null,
          }
        });
      });
    }
    
    // 12. Student Services
    if (universityData.studentServices) {
      Object.entries(universityData.studentServices).forEach(([key, service]) => {
        documents.push({
          content: `${service.title}: ${service.description}
${service.contact ? `Contact: ${JSON.stringify(service.contact)}` : ''}
${service.services ? `Services: ${service.services.join(', ')}` : ''}
${service.offerings ? `Offerings: ${service.offerings.join(', ')}` : ''}`,
          metadata: {
            category: 'student-services',
            type: 'service',
            title: service.title,
          }
        });
      });
    }
    
    // 13. Academic Resources
    if (universityData.academicResources) {
      Object.entries(universityData.academicResources).forEach(([key, resource]) => {
        documents.push({
          content: `${resource.title}: ${resource.description}
Website: ${resource.website}`,
          metadata: {
            category: 'academic-resources',
            type: 'resource',
            title: resource.title,
          }
        });
      });
    }
    
    // Add documents to vector database
    console.log(`\nProcessing ${documents.length} total documents...`);
    await vectorService.addDocuments(documents);
    
    // Summary
    console.log('\n✅ Data loading completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📚 Total documents loaded: ${documents.length}`);
    console.log(`🏢 Academic Buildings: ${Object.keys(universityData.academicBuildings || {}).length}`);
    console.log(`🏠 Accommodation: ${Object.keys(universityData.accommodation || {}).length}`);
    console.log(`🍽️  Dining: ${Object.keys(universityData.dining || {}).length}`);
    console.log(`⚽ Sports & Recreation: ${Object.keys(universityData.sportsAndRecreation || {}).length}`);
    console.log(`🎭 Cultural & Events: ${Object.keys(universityData.culturalAndEvents || {}).length}`);
    console.log(`🎓 Faculties: ${universityData.faculties?.length || 0}`);
    console.log(`📖 Admissions: ${Object.keys(universityData.admissions || {}).length} sections`);
    console.log(`🛠️  Student Services: ${Object.keys(universityData.studentServices || {}).length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error loading data:', error);
    process.exit(1);
  }
}

// Run the script
loadUniversityData();