const fs = require('fs');
const path = require('path');

function generateMapEmbed(lat, lng, title) {
  const encodedTitle = encodeURIComponent(title);
  return `<iframe src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d500!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s${encodedTitle}!5e0!3m2!1sen!2s" 
  width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" 
  referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

// FIX: Use university-info.json
const dataPath = path.join(__dirname, '../data/university-info.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

data.campusNavigation = data.campusNavigation.map(item => {
  if (item.coordinates) {
    const [lng, lat] = item.coordinates.split(',').map(c => c.trim());
    const embed = generateMapEmbed(lat, lng, item.title);
    return { ...item, description: `${item.description}\n\n${embed}` };
  }
  return item;
});

data.courses = data.courses.map(course => {
  if (course.coordinates) {
    const [lng, lat] = course.coordinates.split(',').map(c => c.trim());
    const embed = generateMapEmbed(lat, lng, course.name);
    return { ...course, description: `${course.description}\n\n${embed}` };
  }
  return course;
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log("Maps added successfully!");
