const fs = require('fs');
const path = require('path');

/**
 * This script adds Google Maps embed code to locations that have coordinates
 * but are missing map embeds. Your current data already has maps, so this is 
 * mainly for maintenance/updates.
 */

function generateMapEmbed(lat, lng, title) {
  const encodedTitle = encodeURIComponent(title);
  return `<iframe src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d500!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s${encodedTitle}!5e0!3m2!1sen!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

function processObject(obj, title) {
  if (obj.coordinates && !obj.mapEmbed) {
    const [lng, lat] = obj.coordinates.split(',').map(c => c.trim());
    obj.mapEmbed = generateMapEmbed(lat, lng, title || obj.title);
    console.log(`✅ Added map for: ${title || obj.title}`);
    return true;
  }
  return false;
}

function addMapsToData() {
  const dataPath = path.join(__dirname, '../data/university-info.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ university-info.json not found!');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  let mapsAdded = 0;

  // Process Academic Buildings
  if (data.academicBuildings) {
    Object.values(data.academicBuildings).forEach(building => {
      if (processObject(building, building.title)) mapsAdded++;
    });
  }

  // Process Accommodation
  if (data.accommodation) {
    Object.values(data.accommodation).forEach(place => {
      if (processObject(place, place.title)) mapsAdded++;
      
      // Handle dormitory1Location sub-object
      if (place.dormitory1Location) {
        if (processObject(place.dormitory1Location, `${place.title} - Location 1`)) mapsAdded++;
      }
    });
  }

  // Process Dining
  if (data.dining) {
    Object.values(data.dining).forEach(restaurant => {
      if (processObject(restaurant, restaurant.title)) mapsAdded++;
    });
  }

  // Process Sports & Recreation
  if (data.sportsAndRecreation) {
    Object.values(data.sportsAndRecreation).forEach(facility => {
      if (processObject(facility, facility.title)) mapsAdded++;
    });
  }

  // Process Cultural & Events
  if (data.culturalAndEvents) {
    Object.values(data.culturalAndEvents).forEach(venue => {
      if (processObject(venue, venue.title)) mapsAdded++;
    });
  }

  // Process Banking
  if (data.banking) {
    Object.values(data.banking).forEach(bank => {
      if (processObject(bank, bank.title)) mapsAdded++;
    });
  }

  // Process Shopping
  if (data.shopping) {
    Object.values(data.shopping).forEach(shop => {
      if (processObject(shop, shop.title)) mapsAdded++;
    });
  }

  // Process Faculties
  if (data.faculties) {
    data.faculties.forEach(faculty => {
      if (processObject(faculty, faculty.name)) mapsAdded++;
    });
  }

  // Save updated data
  if (mapsAdded > 0) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log(`\n✅ Successfully added ${mapsAdded} map embeds!`);
  } else {
    console.log('\n✅ All locations already have maps!');
  }
}

// Run the script
addMapsToData();