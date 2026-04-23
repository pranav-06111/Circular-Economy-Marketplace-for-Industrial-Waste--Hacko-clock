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

export function calculateImpact(fromCity: string, toCity: string, quantityTons: number, wasteType: string) {
  const fCity = (fromCity || "").toLowerCase().trim();
  const tCity = (toCity || "").toLowerCase().trim();
  
  // Default to 100km if cities not found
  const from = CITIES[fCity] || { lat: 19.0, lon: 72.8 }; 
  const to = CITIES[tCity] || { lat: Math.random() + 19.0, lon: Math.random() + 72.8 }; // Randomize slightly if unknown city
  
  let distanceKm = haversine(from.lat, from.lon, to.lat, to.lon);
  if (distanceKm < 10) distanceKm = 50; // Assume minimum local transit

  // Transport Cost: ₹50 per ton per km
  const transportCostINR = Math.round(distanceKm * 50 * quantityTons);
  
  const wType = (wasteType || "").toLowerCase().trim();
  const baseFactor = CO2_FACTORS[wType] || 1.0;
  
  // Transport emissions: ~0.1 kg CO2 per ton-km
  const transportEmissions = (distanceKm * 0.1 * quantityTons) / 1000; // in tons
  
  const totalCo2Saved = Math.max(0, (quantityTons * baseFactor) - transportEmissions);
  const co2KgSaved = Math.round(totalCo2Saved * 1000);

  return {
    distanceKm: Math.round(distanceKm),
    transportCostINR,
    co2KgSaved,
    method: "Truck"
  };
}
