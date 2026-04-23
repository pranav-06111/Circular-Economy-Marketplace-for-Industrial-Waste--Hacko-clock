// Hardcoded coordinates for major Indian cities (lat, lng)
export const CITY_COORDINATES: Record<string, [number, number]> = {
  // Metros
  'mumbai': [19.0760, 72.8777],
  'delhi': [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  'bangalore': [12.9716, 77.5946],
  'bengaluru': [12.9716, 77.5946],
  'chennai': [13.0827, 80.2707],
  'hyderabad': [17.3850, 78.4867],
  'kolkata': [22.5726, 88.3639],
  'pune': [18.5204, 73.8567],
  'ahmedabad': [23.0225, 72.5714],
  
  // Industrial hubs
  'surat': [21.1702, 72.8311],
  'jaipur': [26.9124, 75.7873],
  'lucknow': [26.8467, 80.9462],
  'kanpur': [26.4499, 80.3319],
  'nagpur': [21.1458, 79.0882],
  'indore': [22.7196, 75.8577],
  'thane': [19.2183, 72.9781],
  'bhopal': [23.2599, 77.4126],
  'visakhapatnam': [17.6868, 83.2185],
  'vizag': [17.6868, 83.2185],
  'coimbatore': [11.0168, 76.9558],
  'vadodara': [22.3072, 73.1812],
  'baroda': [22.3072, 73.1812],
  'rajkot': [22.3039, 70.8022],
  'ludhiana': [30.9010, 75.8573],
  'agra': [27.1767, 78.0081],
  'nashik': [19.9975, 73.7898],
  'faridabad': [28.4089, 77.3178],
  'noida': [28.5355, 77.3910],
  'ghaziabad': [28.6692, 77.4538],
  'gurgaon': [28.4595, 77.0266],
  'gurugram': [28.4595, 77.0266],
  'ranchi': [23.3441, 85.3096],
  'patna': [25.6093, 85.1376],
  'kochi': [9.9312, 76.2673],
  'cochin': [9.9312, 76.2673],
  'trivandrum': [8.5241, 76.9366],
  'thiruvananthapuram': [8.5241, 76.9366],
  'chandigarh': [30.7333, 76.7794],
  'mysore': [12.2958, 76.6394],
  'mysuru': [12.2958, 76.6394],
  'mangalore': [12.9141, 74.8560],
  'mangaluru': [12.9141, 74.8560],
  'jamshedpur': [22.8046, 86.2029],
  'raipur': [21.2514, 81.6296],
  'guwahati': [26.1445, 91.7362],
  'bhubaneswar': [20.2961, 85.8245],
  'dehradun': [30.3165, 78.0322],
  'amritsar': [31.6340, 74.8723],
  'varanasi': [25.3176, 82.9739],
  'jodhpur': [26.2389, 73.0243],
  'madurai': [9.9252, 78.1198],
  'salem': [11.6643, 78.1460],
  'tiruchirappalli': [10.7905, 78.7047],
  'trichy': [10.7905, 78.7047],
  'hubli': [15.3647, 75.1240],
  'belgaum': [15.8497, 74.4977],
  'belagavi': [15.8497, 74.4977],
  'aurangabad': [19.8762, 75.3433],
  'ankleshwar': [21.6263, 73.0153],
  'vapi': [20.3714, 72.9060],
  'silvassa': [20.2766, 73.0175],
  'hosur': [12.7409, 77.8253],
  'dharwad': [15.4589, 75.0078],

  // Fallback defaults
  'india': [20.5937, 78.9629],
};

// Default center of India
export const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

/**
 * Resolve a location string to coordinates.
 * Tries exact match, then partial match on city names.
 */
export function getCoordinates(location: string): [number, number] {
  if (!location) return DEFAULT_CENTER;

  const normalized = location.toLowerCase().trim();

  // Exact match
  if (CITY_COORDINATES[normalized]) return CITY_COORDINATES[normalized];

  // Partial match — check if any city name is contained in the location string
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return coords;
    }
  }

  // Try splitting by comma and matching the first part (city name)
  const parts = normalized.split(',').map(s => s.trim());
  for (const part of parts) {
    if (CITY_COORDINATES[part]) return CITY_COORDINATES[part];
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
      if (part.includes(city) || city.includes(part)) {
        return coords;
      }
    }
  }

  return DEFAULT_CENTER;
}

/**
 * Calculate distance between two lat/lng points using the Haversine formula.
 * Returns distance in kilometers.
 */
export function haversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2[0] - coord1[0]);
  const dLon = toRad(coord2[1] - coord1[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1[0])) *
    Math.cos(toRad(coord2[0])) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// CO₂ emission factors per ton of waste diverted (tCO₂ saved per ton)
const CO2_FACTORS: Record<string, number> = {
  'plastic waste': 1.8,
  'plastic': 1.8,
  'metal scrap': 2.0,
  'metal': 2.0,
  'paper / cardboard': 1.0,
  'paper': 1.0,
  'glass': 0.6,
  'e-waste': 3.2,
  'hazardous chemical waste': 2.5,
  'solvents & degreasers': 2.2,
  'oily wastes': 1.9,
  'industrial sludges': 1.2,
  'batteries': 3.0,
  'municipal solid waste (msw)': 0.9,
  'msw': 0.9,
  'organic waste': 0.8,
  'textile waste': 1.3,
  'rubber waste': 1.6,
  'wood / biomass': 0.7,
  'composite / other': 1.5,
};

const TRANSPORT_CO2_PER_TON_KM = 0.12; // kg CO₂ per ton-km
const LOGISTICS_RATE_PER_KM = 15; // ₹15 per km (flat rate)
const MAX_TRUCK_LOAD_TONS = 25; // Standard Indian truck capacity

/**
 * Calculate logistics cost based on distance.
 * Flat rate: ₹15/km.
 */
export function calculateLogisticsCost(distanceKm: number, quantityTons: number): number {
  return Math.round(distanceKm * LOGISTICS_RATE_PER_KM);
}

/**
 * Calculate net CO₂ savings.
 * = (waste factor × quantity) - (distance × transport emissions × quantity)
 */
export function calculateCO2Savings(
  distanceKm: number,
  quantityTons: number,
  wasteType: string
): number {
  const normalizedType = wasteType.toLowerCase().trim();
  const factor = CO2_FACTORS[normalizedType] || 1.5;
  const grossSavings = factor * quantityTons; // tCO₂
  const transportEmissions = (distanceKm * TRANSPORT_CO2_PER_TON_KM * quantityTons) / 1000; // convert kg to tonnes
  return Math.max(0, parseFloat((grossSavings - transportEmissions).toFixed(2)));
}
