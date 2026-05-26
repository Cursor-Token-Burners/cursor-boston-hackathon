export type AthleteBody = {
  sex: "M" | "F";
  height: number;
  weight: number;
  chest: number;
  waist: number;
  hip: number;
  shoulderWidth: number;
};

export type AthleteStats = {
  wingspan: number;
  vertical: number;
  bodyFat: number;
  reach: number;
};

export type AthleteMeasurements = {
  body: AthleteBody;
  stats: AthleteStats;
};

type Sport = "Football" | "Soccer" | "Swimming";

const sportDefaults: Record<Sport, AthleteMeasurements> = {
  Football: {
    body: { sex: "M", height: 188, weight: 100, chest: 110, waist: 86, hip: 102, shoulderWidth: 51 },
    stats: { wingspan: 197, vertical: 86, bodyFat: 12, reach: 247 },
  },
  Soccer: {
    body: { sex: "M", height: 180, weight: 75, chest: 96, waist: 78, hip: 92, shoulderWidth: 46 },
    stats: { wingspan: 184, vertical: 70, bodyFat: 9, reach: 232 },
  },
  Swimming: {
    body: { sex: "M", height: 188, weight: 84, chest: 104, waist: 80, hip: 94, shoulderWidth: 52 },
    stats: { wingspan: 200, vertical: 65, bodyFat: 7, reach: 247 },
  },
};

const overrides: Record<string, AthleteMeasurements> = {
  "football-1": { body: { sex: "M", height: 191, weight: 102, chest: 109, waist: 87, hip: 102, shoulderWidth: 51 }, stats: { wingspan: 196, vertical: 76, bodyFat: 16, reach: 246 } },
  "football-2": { body: { sex: "M", height: 196, weight: 113, chest: 117, waist: 91, hip: 107, shoulderWidth: 54 }, stats: { wingspan: 204, vertical: 89, bodyFat: 13, reach: 256 } },
  "football-3": { body: { sex: "M", height: 188, weight: 93, chest: 102, waist: 81, hip: 97, shoulderWidth: 49 }, stats: { wingspan: 198, vertical: 95, bodyFat: 10, reach: 244 } },
  "football-4": { body: { sex: "M", height: 196, weight: 108, chest: 114, waist: 89, hip: 104, shoulderWidth: 53 }, stats: { wingspan: 203, vertical: 84, bodyFat: 14, reach: 254 } },
  "football-5": { body: { sex: "M", height: 185, weight: 88, chest: 101, waist: 79, hip: 95, shoulderWidth: 48 }, stats: { wingspan: 197, vertical: 96, bodyFat: 8, reach: 245 } },
  "football-6": { body: { sex: "M", height: 180, weight: 95, chest: 105, waist: 81, hip: 99, shoulderWidth: 49 }, stats: { wingspan: 184, vertical: 95, bodyFat: 9, reach: 233 } },
  "football-7": { body: { sex: "M", height: 178, weight: 87, chest: 100, waist: 78, hip: 95, shoulderWidth: 47 }, stats: { wingspan: 188, vertical: 99, bodyFat: 7, reach: 234 } },
  "football-8": { body: { sex: "M", height: 193, weight: 98, chest: 107, waist: 85, hip: 101, shoulderWidth: 50 }, stats: { wingspan: 200, vertical: 76, bodyFat: 12, reach: 250 } },
  "football-9": { body: { sex: "M", height: 191, weight: 111, chest: 117, waist: 90, hip: 105, shoulderWidth: 53 }, stats: { wingspan: 203, vertical: 89, bodyFat: 11, reach: 251 } },
  "football-10": { body: { sex: "M", height: 193, weight: 114, chest: 119, waist: 92, hip: 107, shoulderWidth: 54 }, stats: { wingspan: 207, vertical: 92, bodyFat: 11, reach: 254 } },
  "football-11": { body: { sex: "M", height: 183, weight: 106, chest: 112, waist: 84, hip: 103, shoulderWidth: 51 }, stats: { wingspan: 191, vertical: 105, bodyFat: 8, reach: 240 } },
  "football-12": { body: { sex: "M", height: 185, weight: 101, chest: 109, waist: 85, hip: 102, shoulderWidth: 51 }, stats: { wingspan: 194, vertical: 86, bodyFat: 12, reach: 244 } },
  "soccer-1": { body: { sex: "M", height: 170, weight: 72, chest: 93, waist: 76, hip: 90, shoulderWidth: 44 }, stats: { wingspan: 172, vertical: 67, bodyFat: 10, reach: 220 } },
  "soccer-2": { body: { sex: "M", height: 187, weight: 84, chest: 101, waist: 80, hip: 95, shoulderWidth: 48 }, stats: { wingspan: 191, vertical: 78, bodyFat: 7, reach: 240 } },
  "soccer-3": { body: { sex: "M", height: 178, weight: 75, chest: 97, waist: 77, hip: 91, shoulderWidth: 46 }, stats: { wingspan: 182, vertical: 75, bodyFat: 8, reach: 230 } },
  "soccer-4": { body: { sex: "M", height: 195, weight: 88, chest: 104, waist: 82, hip: 98, shoulderWidth: 51 }, stats: { wingspan: 199, vertical: 84, bodyFat: 9, reach: 250 } },
  "swimming-1": { body: { sex: "M", height: 193, weight: 88, chest: 106, waist: 82, hip: 96, shoulderWidth: 56 }, stats: { wingspan: 203, vertical: 70, bodyFat: 6, reach: 251 } },
  "swimming-2": { body: { sex: "F", height: 183, weight: 70, chest: 92, waist: 73, hip: 96, shoulderWidth: 46 }, stats: { wingspan: 188, vertical: 55, bodyFat: 14, reach: 238 } },
  "swimming-3": { body: { sex: "M", height: 191, weight: 88, chest: 106, waist: 81, hip: 95, shoulderWidth: 55 }, stats: { wingspan: 198, vertical: 68, bodyFat: 6, reach: 249 } },
  "swimming-4": { body: { sex: "M", height: 191, weight: 86, chest: 105, waist: 80, hip: 95, shoulderWidth: 55 }, stats: { wingspan: 200, vertical: 70, bodyFat: 7, reach: 249 } },
};

export function getSportFromId(id: string): Sport {
  if (id.startsWith("football")) return "Football";
  if (id.startsWith("soccer")) return "Soccer";
  if (id.startsWith("swimming")) return "Swimming";
  return "Football";
}

export function getMeasurements(id: string): AthleteMeasurements {
  return overrides[id] ?? sportDefaults[getSportFromId(id)];
}
