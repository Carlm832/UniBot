require('dotenv').config();
const fs = require('fs');
const path = require('path');
const vectorService = require('../services/vectorService');

async function loadUniversityData() {
  try {
    console.log('📋 Diagnostic Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`__dirname: ${__dirname}`);
    console.log(`process.cwd(): ${process.cwd()}`);
    
    const possiblePaths = [
      path.join(__dirname, '../../data/university-info.json'),
      path.join(__dirname, '../../../data/university-info.json'),
      path.join(process.cwd(), 'data/university-info.json'),
      path.join(__dirname, '../../..', 'data', 'university-info.json')
    ];
    
    console.log('\n📂 Checking possible paths:');
    possiblePaths.forEach((p, i) => {
      const exists = fs.existsSync(p);
      console.log(`${i + 1}. ${exists ? '✅' : '❌'} ${p}`);
    });
    
    const dataPath = possiblePaths.find(p => fs.existsSync(p));
    
    if (!dataPath) {
      console.error('\n❌ Could not find university-info.json in any expected location!');
      process.exit(1);
    }
    
    console.log(`\n✅ Found data file at: ${dataPath}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('Starting data load process...');
    
    await vectorService.initialize();
    
    console.log('Clearing existing data...');
    await vectorService.clearCollection();
    
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log('✅ Successfully loaded and parsed university-info.json\n');
    
    const documents = [];
    
    // ===== PROCESS ACADEMIC BUILDINGS =====
    if (data.academicBuildings) {
      Object.values(data.academicBuildings).forEach(building => {
        const content = building.mapEmbed 
          ? `${building.title}: ${building.description}\n\n${building.mapEmbed}`
          : `${building.title}: ${building.description}`;
        
        documents.push({
          content: content,
          metadata: {
            category: 'academic-buildings',
            type: building.type || 'building',
            title: building.title,
            coordinates: building.coordinates || null,
            location: building.location || null,
            workingHours: building.workingHours || null,
            contact: building.contact || null
          }
        });
      });
      console.log(`✅ Loaded ${Object.keys(data.academicBuildings).length} academic buildings`);
    }
    
    // ===== PROCESS ACCOMMODATION =====
    if (data.accommodation) {
      Object.values(data.accommodation).forEach(place => {
        let content = `${place.title}: ${place.description}`;
        
        // Handle dormitories with special structure
        if (place.dormitory1Location?.mapEmbed) {
          content += `\n\n${place.dormitory1Location.mapEmbed}`;
        } else if (place.mapEmbed) {
          content += `\n\n${place.mapEmbed}`;
        }
        
        if (place.types) {
          content += `\nFacilities: ${place.types.join(', ')}`;
        }
        
        documents.push({
          content: content,
          metadata: {
            category: 'accommodation',
            type: 'accommodation',
            title: place.title,
            coordinates: place.coordinates || place.dormitory1Location?.coordinates || null,
            total: place.total || null,
            types: place.types || null
          }
        });
      });
      console.log(`✅ Loaded ${Object.keys(data.accommodation).length} accommodation locations`);
    }
    
    // ===== PROCESS DINING =====
    if (data.dining) {
      Object.values(data.dining).forEach(restaurant => {
        const content = restaurant.mapEmbed 
          ? `${restaurant.title}: ${restaurant.description}\n\n${restaurant.mapEmbed}`
          : `${restaurant.title}: ${restaurant.description}`;
        
        documents.push({
          content: content,
          metadata: {
            category: 'dining',
            type: 'dining',
            title: restaurant.title,
            coordinates: restaurant.coordinates || null,
            cuisine: restaurant.cuisine || null
          }
        });
      });
      console.log(`✅ Loaded ${Object.keys(data.dining).length} dining locations`);
    }
    
    // ===== PROCESS SPORTS & RECREATION =====
    if (data.sportsAndRecreation) {
      Object.values(data.sportsAndRecreation).forEach(facility => {
        let content = `${facility.title}: ${facility.description}`;
        
        if (facility.facilities) {
          content += `\nFacilities: ${facility.facilities.join(', ')}`;
        }
        
        if (facility.mapEmbed) {
          content += `\n\n${facility.mapEmbed}`;
        }
        
        documents.push({
          content: content,
          metadata: {
            category: 'sports-recreation',
            type: 'sports',
            title: facility.title,
            coordinates: facility.coordinates || null,
            facilities: facility.facilities || []
          }
        });
      });
      console.log(`✅ Loaded ${Object.keys(data.sportsAndRecreation).length} sports facilities`);
    }
    
    // ===== PROCESS CULTURAL & EVENTS =====
    if (data.culturalAndEvents) {
      Object.values(data.culturalAndEvents).forEach(venue => {
        const content = venue.mapEmbed 
          ? `${venue.title}: ${venue.description}\n\n${venue.mapEmbed}`
          : `${venue.title}: ${venue.description}`;
        
        documents.push({
          content: content,
          metadata: {
            category: 'cultural-events',
            type: venue.type || 'venue',
            title: venue.title,
            coordinates: venue.coordinates || null
          }
        });
      });
      console.log(`✅ Loaded ${Object.keys(data.culturalAndEvents).length} cultural/event venues`);
    }
    
    // ===== PROCESS BANKING =====
    if (data.banking) {
      Object.values(data.banking).forEach(bank => {
        const content = bank.mapEmbed 
          ? `${bank.title}: ${bank.description}\n\n${bank.mapEmbed}`
          : `${bank.title}: ${bank.description}`;
        
        documents.push({
          content: content,
          metadata: {
            category: 'banking',
            type: 'banking',
            title: bank.title,
            coordinates: bank.coordinates || null,
            location: bank.location || null
          }
        });
      });
      console.log(`✅ Loaded ${Object.keys(data.banking).length} banking locations`);
    }
    
    // ===== PROCESS SHOPPING =====
    if (data.shopping) {
      Object.values(data.shopping).forEach(shop => {
        const content = shop.mapEmbed 
          ? `${shop.title}: ${shop.description}\n\n${shop.mapEmbed}`
          : `${shop.title}: ${shop.description}`;
        
        documents.push({
          content: content,
          metadata: {
            category: 'shopping',
            type: shop.type || 'shopping',
            title: shop.title,
            coordinates: shop.coordinates || null
          }
        });
      });
      console.log(`✅ Loaded ${Object.keys(data.shopping).length} shopping locations`);
    }
    
    // ===== PROCESS HEALTHCARE =====
    if (data.healthcare) {
      Object.values(data.healthcare).forEach(facility => {
        let content = `${facility.title}: ${facility.description}`;
        
        if (facility.services) {
          content += `\nServices: ${facility.services.join(', ')}`;
        }
        
        documents.push({
          content: content,
          metadata: {
            category: 'healthcare',
            type: facility.type || 'healthcare',
            title: facility.title,
            services: facility.services || []
          }
        });
      });
      console.log(`✅ Loaded ${Object.keys(data.healthcare).length} healthcare facilities`);
    }
    
    // ===== PROCESS FACULTIES =====
    if (data.faculties) {
      data.faculties.forEach(faculty => {
        let content = `${faculty.name} (${faculty.code}): ${faculty.description}`;
        
        if (faculty.departments) {
          content += `\nDepartments: ${faculty.departments.join(', ')}`;
        }
        
        if (faculty.programs) {
          content += `\nPrograms: ${faculty.programs.join(', ')}`;
        }
        
        if (faculty.location) {
          content += `\nLocation: ${faculty.location}`;
        }
        
        if (faculty.website) {
          content += `\nWebsite: ${faculty.website}`;
        }
        
        documents.push({
          content: content,
          metadata: {
            category: 'faculties',
            type: 'faculty',
            title: faculty.name,
            code: faculty.code,
            coordinates: faculty.coordinates || null,
            website: faculty.website || null,
            location: faculty.location || null
          }
        });
      });
      console.log(`✅ Loaded ${data.faculties.length} faculties`);
    }
    
    // ===== PROCESS ADMISSIONS =====
    if (data.admissions) {
      // Application Process
      if (data.admissions.applicationProcess) {
        const app = data.admissions.applicationProcess;
        let content = `${app.title}: ${app.description}\nWebsite: ${app.website}`;
        
        if (app.steps) {
          content += `\nSteps: ${app.steps.join(', ')}`;
        }
        
        documents.push({
          content: content,
          metadata: {
            category: 'admissions',
            type: 'application',
            title: app.title,
            website: app.website
          }
        });
      }
      
      // Requirements
      if (data.admissions.requirements) {
        Object.values(data.admissions.requirements).forEach(req => {
          if (req.title && req.description) {
            let content = `${req.title}: ${req.description}`;
            
            if (req.certificates) {
              content += `\nAccepted: ${req.certificates.join(', ')}`;
            }
            
            documents.push({
              content: content,
              metadata: {
                category: 'admissions',
                type: 'requirements',
                title: req.title
              }
            });
          }
        });
      }
      
      // Fees
      if (data.admissions.fees) {
        const fees = data.admissions.fees;
        documents.push({
          content: `${fees.title}: ${fees.description}\nWebsite: ${fees.website}\n${fees.note}`,
          metadata: {
            category: 'admissions',
            type: 'fees',
            title: fees.title,
            website: fees.website
          }
        });
      }
      
      // Residence Permit
      if (data.admissions.residencePermit) {
        const permit = data.admissions.residencePermit;
        documents.push({
          content: `${permit.title}: ${permit.description}\nWebsite: ${permit.website}\nAssistance: ${permit.assistanceOffice}`,
          metadata: {
            category: 'admissions',
            type: 'residence-permit',
            title: permit.title,
            website: permit.website
          }
        });
      }
      
      // Registration
      if (data.admissions.registration) {
        Object.values(data.admissions.registration).forEach(reg => {
          documents.push({
            content: `${reg.title}: ${reg.description}\nWebsite: ${reg.website}`,
            metadata: {
              category: 'admissions',
              type: 'registration',
              title: reg.title,
              website: reg.website
            }
          });
        });
      }
      
      console.log(`✅ Loaded admission information`);
    }
    
    // ===== PROCESS STUDENT SERVICES =====
    if (data.studentServices) {
      Object.values(data.studentServices).forEach(service => {
        let content = `${service.title}: ${service.description}`;
        
        if (service.services) {
          content += `\nServices: ${service.services.join(', ')}`;
        }
        
        if (service.offerings) {
          content += `\nOfferings: ${service.offerings.join(', ')}`;
        }
        
        if (service.types) {
          content += `\nTypes: ${service.types.join(', ')}`;
        }
        
        if (service.contact) {
          if (service.contact.email) content += `\nEmail: ${service.contact.email}`;
          if (service.contact.office) content += `\nOffice: ${service.contact.office}`;
        }
        
        if (service.office) {
          content += `\nOffice: ${service.office}`;
        }
        
        documents.push({
          content: content,
          metadata: {
            category: 'student-services',
            type: 'service',
            title: service.title,
            contact: service.contact || null,
            office: service.office || null
          }
        });
      });
      console.log(`✅ Loaded ${Object.keys(data.studentServices).length} student services`);
    }
    
    // ===== PROCESS ACADEMIC RESOURCES =====
    if (data.academicResources) {
      Object.values(data.academicResources).forEach(resource => {
        let content = `${resource.title}: ${resource.description}`;
        
        if (resource.website) {
          content += `\nWebsite: ${resource.website}`;
        }
        
        documents.push({
          content: content,
          metadata: {
            category: 'academic-resources',
            type: 'resource',
            title: resource.title,
            website: resource.website || null
          }
        });
      });
      console.log(`✅ Loaded ${Object.keys(data.academicResources).length} academic resources`);
    }
    
    // ===== PROCESS UNIVERSITY INFO =====
    if (data.universityInfo) {
      const info = data.universityInfo;
      let content = `${info.name} (${info.abbreviation}) - Established ${info.established} in ${info.location}`;
      
      if (info.mainContact) {
        content += `\nPhone: ${info.mainContact.phone.join(', ')}`;
        content += `\nEmail: ${info.mainContact.email}`;
        content += `\nWebsite: ${info.mainContact.website}`;
        content += `\nWhatsApp: ${info.mainContact.whatsapp}`;
        content += `\nAddress: ${info.mainContact.address}`;
      }
      
      documents.push({
        content: content,
        metadata: {
          category: 'general',
          type: 'university-info',
          title: 'Near East University Information'
        }
      });
      console.log(`✅ Loaded university general information`);
    }
    
    console.log(`\n📦 Processing ${documents.length} total documents...`);
    
    if (documents.length === 0) {
      console.error('\n❌ ERROR: No documents were extracted from the JSON file!');
      process.exit(1);
    }
    
    await vectorService.addDocuments(documents);
    
    console.log('\n✅ Data loading completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📚 Total documents loaded: ${documents.length}`);
    
    // Show breakdown by category
    const categoryCount = {};
    documents.forEach(doc => {
      const cat = doc.metadata.category;
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    console.log('\n📊 Documents by category:');
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

loadUniversityData();