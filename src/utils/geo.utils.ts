/**
 * Geo Utilities
 * ---------------
 * Geographic calculation helpers for map features.
 */

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a point is inside a polygon (ray casting algorithm)
 */
export function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: Array<{ lat: number; lng: number }>
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Find which ward a coordinate belongs to
 */
export function findWardForCoordinate(
  lat: number,
  lng: number,
  wards: Array<{
    id: string;
    boundaries: Array<{ lat: number; lng: number }>;
  }>
): string | null {
  for (const ward of wards) {
    if (isPointInPolygon({ lat, lng }, ward.boundaries)) {
      return ward.id;
    }
  }
  return null;
}

/**
 * Get the center of a polygon
 */
export function getPolygonCenter(
  polygon: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } {
  const sumLat = polygon.reduce((sum, p) => sum + p.lat, 0);
  const sumLng = polygon.reduce((sum, p) => sum + p.lng, 0);
  return {
    lat: sumLat / polygon.length,
    lng: sumLng / polygon.length,
  };
}

/**
 * Get bounding box for a set of coordinates
 */
export function getBoundingBox(
  points: Array<{ lat: number; lng: number }>
): { north: number; south: number; east: number; west: number } {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
