/**
 * Gwalior Boundary GeoJSON Data
 * ------------------------------
 * Approximated geospatial boundaries for the Gwalior Municipal Corporation area.
 * Coordinates are formatted as [longitude, latitude] per GeoJSON specification.
 */

const gwaliorBoundary = {
  type: "Feature" as const,
  properties: {
    name: "Gwalior Municipal Area",
    state: "Madhya Pradesh",
    country: "India",
  },
  geometry: {
    type: "Polygon" as const,
    coordinates: [
      [
        [78.112, 26.195],
        [78.125, 26.242],
        [78.158, 26.271],
        [78.204, 26.282],
        [78.246, 26.258],
        [78.259, 26.215],
        [78.234, 26.164],
        [78.182, 26.139],
        [78.136, 26.155],
        [78.112, 26.195]
      ]
    ]
  }
};

export default gwaliorBoundary;
