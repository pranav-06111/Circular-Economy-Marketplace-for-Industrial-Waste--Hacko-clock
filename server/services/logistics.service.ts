export const CITIES: Record<string, { lat: number; lon: number }> = {
  "mumbai": { lat: 19.0760, lon: 72.8777 },
  "delhi": { lat: 28.7041, lon: 77.1025 },
  "bangalore": { lat: 12.9716, lon: 77.5946 },
  "hyderabad": { lat: 17.3850, lon: 78.4867 },
  "ahmedabad": { lat: 23.0225, lon: 72.5714 },
  "chennai": { lat: 13.0827, lon: 80.2707 },
  "kolkata": { lat: 22.5726, lon: 88.3639 },
  "surat": { lat: 21.1702, lon: 72.8311 },
  "pune": { lat: 18.5204, lon: 73.8567 },
  "jaipur": { lat: 26.9124, lon: 75.7873 },
  "lucknow": { lat: 26.8467, lon: 80.9462 },
  "kanpur": { lat: 26.4499, lon: 80.3319 },
  "nagpur": { lat: 21.1458, lon: 79.0882 },
  "indore": { lat: 22.7196, lon: 75.8577 },
  "thane": { lat: 19.2183, lon: 72.9781 },
  "bhopal": { lat: 23.2599, lon: 77.4126 },
  "visakhapatnam": { lat: 17.6868, lon: 83.2185 },
  "patna": { lat: 25.5941, lon: 85.1376 },
  "vadodara": { lat: 22.3072, lon: 73.1812 },
  "ghaziabad": { lat: 28.6692, lon: 77.4538 },
  "ludhiana": { lat: 30.9010, lon: 75.8573 },
  "jamshedpur": { lat: 22.8046, lon: 86.2029 }
};

export const CO2_FACTORS: Record<string, number> = {
  "plastic": 2.1,
  "metal": 1.6,
  "chemical": 3.4,
  "textile": 1.2,
  "e-waste": 2.5,
  "organic": 0.2,
  "glass": 0.3,
  "paper": 0.9,
  "wood": 0.4
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

/**
 * calculateImpact(fromCity, toCity, quantity, wasteType)
 * Upgraded to match Hackathon-Optimized API Stack requirements.
 * Simulated Google Maps Routes API + emissions.dev logic.
 */
export function calculateImpact(fromCity: string, toCity: string, quantity: number, wasteType: string) {
  const fCity = (fromCity || "").toLowerCase().trim();
  const tCity = (toCity || "").toLowerCase().trim();
  
  // Fallback to coordinates if city not found
  const from = CITIES[fCity] || { lat: 19.07, lon: 72.87 }; // Default Mumbai
  const to = CITIES[tCity] || { lat: 28.70, lon: 77.10 };   // Default Delhi
  
  // Routes API Simulation: Real distances are often 1.2x - 1.4x the haversine (displacement)
  let displacementKm = haversine(from.lat, from.lon, to.lat, to.lon);
  let distanceKm = Math.round(displacementKm * 1.25); 
  
  if (distanceKm < 15) distanceKm = 30; // Minimum industrial transit gate-to-gate

  // Transport Cost: Professional freight rates (~₹60/ton-km for industrial specialized)
  const transportCostINR = Math.round(distanceKm * 60 * quantity);
  
  const wType = (wasteType || "").toLowerCase().trim();
  const baseFactor = CO2_FACTORS[wType] || 1.0;
  
  /**
   * emissions.dev Freight API Logic:
   * CO2 Saved = (Emissions if virgin material produced) - (Transport Emissions for recycling)
   * Average Virgin Plastic Production: ~2500kg CO2 per ton
   * Average Recycled Plastic: ~500kg CO2 per ton
   */
  const virginEmissionsKg = quantity * baseFactor * 1000;
  const transportEmissionsKg = (distanceKm * 0.105 * quantity); // Road freight factor
  const totalCo2SavedKg = Math.max(0, virginEmissionsKg - transportEmissionsKg);

  return {
    distanceKm,
    transportCostINR,
    co2KgSaved: Math.round(totalCo2SavedKg),
    method: "Industrial Freight Truck (BS-VI)",
    routePrecision: "Simulated Routes API v1"
  };
}
