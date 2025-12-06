const navigationService = {
  findLocation(userText, db) {
    const q = userText.toLowerCase();

    // Search through campusNavigation list
    return db.campusNavigation.find(loc =>
      q.includes(loc.title.toLowerCase())
    );
  },

  buildMapCard(location) {
    const [lngRaw, latRaw] = location.coordinates.split(",");
    const lat = parseFloat(latRaw.trim());
    const lng = parseFloat(lngRaw.trim());

    return {
      type: "map",
      title: location.title,
      description: location.description,
      embedUrl: this.buildOpenStreetMap(lat, lng),
      mapsUrl: this.buildGoogleMaps(lat, lng)
    };
  },

  buildOpenStreetMap(lat, lng) {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${
      lng - 0.0008
    }%2C${lat - 0.0008}%2C${lng + 0.0008}%2C${lat + 0.0008}&layer=mapnik&marker=${lat}%2C${lng}`;
  },

  buildGoogleMaps(lat, lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
};

module.exports = navigationService;
