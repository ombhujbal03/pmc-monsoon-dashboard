import { db, initDb } from "./db.js";

export const SEED_WARDS = [
  {
    id: "hadapsar",
    name: "Hadapsar - Mundhwa Ward Office",
    short: "Hadapsar",
    pincodes: [411013, 411028, 411036],
    areas: ["Hadapsar", "Magarpatta", "Mundhwa", "Fursungi"],
    latitude: 18.5089,
    longitude: 73.9259,
    population: 398000,
    risk_score: 82,
    risk_level: "severe",
    metrics: {
      drain_complaints: 57,
      sewage_overflow: 34,
      water_stagnation_days: 12,
      dengue_cases_last_season: 187,
    },
    baseline_weather: {
      rainfall_10d: 48.5,
      humidity: 87,
      temperature: 26.9,
      condition: "Rain showers",
      rain_chance: 85,
    },
  },
  {
    id: "magarpatta",
    name: "Magarpatta City Zone",
    short: "Magarpatta",
    pincodes: [411028],
    areas: ["Cybercity", "Destination Centre", "North Hadapsar"],
    latitude: 18.5158,
    longitude: 73.9272,
    population: 85000,
    risk_score: 28,
    risk_level: "low",
    metrics: {
      drain_complaints: 7,
      sewage_overflow: 2,
      water_stagnation_days: 1,
      dengue_cases_last_season: 18,
    },
    baseline_weather: {
      rainfall_10d: 32.0,
      humidity: 78,
      temperature: 26.8,
      condition: "Partly cloudy",
      rain_chance: 40,
    },
  },
  {
    id: "mundhwa",
    name: "Mundhwa Industrial & Riverfront Ward",
    short: "Mundhwa",
    pincodes: [411036],
    areas: ["Mundhwa Gaon", "Keshav Nagar", "Koregaon Park Ext"],
    latitude: 18.5362,
    longitude: 73.919,
    population: 145000,
    risk_score: 68,
    risk_level: "high",
    metrics: {
      drain_complaints: 39,
      sewage_overflow: 22,
      water_stagnation_days: 9,
      dengue_cases_last_season: 124,
    },
    baseline_weather: {
      rainfall_10d: 44.0,
      humidity: 85,
      temperature: 26.5,
      condition: "Moderate rain",
      rain_chance: 75,
    },
  },
  {
    id: "fursungi",
    name: "Fursungi - Uruli Devachi Belt",
    short: "Fursungi",
    pincodes: [412308],
    areas: ["Fursungi", "Bhekrai Nagar", "SP Infocity Canal"],
    latitude: 18.4764,
    longitude: 73.9782,
    population: 160000,
    risk_score: 52,
    risk_level: "moderate",
    metrics: {
      drain_complaints: 28,
      sewage_overflow: 16,
      water_stagnation_days: 7,
      dengue_cases_last_season: 95,
    },
    baseline_weather: {
      rainfall_10d: 38.5,
      humidity: 82,
      temperature: 26.2,
      condition: "Scattered showers",
      rain_chance: 60,
    },
  },
  {
    id: "aundh-baner",
    name: "Aundh - Baner Ward Office",
    short: "Aundh-Baner",
    pincodes: [411007, 411008, 411045, 411021],
    areas: ["Aundh", "Baner", "Balewadi", "Pashan"],
    latitude: 18.5602,
    longitude: 73.8031,
    population: 312000,
    risk_score: 32,
    risk_level: "low",
    metrics: {
      drain_complaints: 14,
      sewage_overflow: 5,
      water_stagnation_days: 3,
      dengue_cases_last_season: 96,
    },
    baseline_weather: {
      rainfall_10d: 26.8,
      humidity: 82,
      temperature: 25.6,
      condition: "Partly cloudy",
      rain_chance: 35,
    },
  },
  {
    id: "bhavani-peth",
    name: "Bhavani Peth Ward Office",
    short: "Bhavani Peth",
    pincodes: [411042],
    areas: ["Bhavani Peth", "Guruwar Peth", "Swargate"],
    latitude: 18.5074,
    longitude: 73.8633,
    population: 178000,
    risk_score: 76,
    risk_level: "severe",
    metrics: {
      drain_complaints: 48,
      sewage_overflow: 27,
      water_stagnation_days: 11,
      dengue_cases_last_season: 143,
    },
    baseline_weather: {
      rainfall_10d: 42.0,
      humidity: 86,
      temperature: 26.4,
      condition: "Rain",
      rain_chance: 80,
    },
  },
  {
    id: "bibwewadi",
    name: "Bibwewadi Ward Office",
    short: "Bibwewadi",
    pincodes: [411037],
    areas: ["Bibwewadi", "Market Yard", "Salisbury Park"],
    latitude: 18.4783,
    longitude: 73.868,
    population: 196000,
    risk_score: 45,
    risk_level: "moderate",
    metrics: {
      drain_complaints: 22,
      sewage_overflow: 9,
      water_stagnation_days: 6,
      dengue_cases_last_season: 88,
    },
    baseline_weather: {
      rainfall_10d: 31.0,
      humidity: 80,
      temperature: 26.1,
      condition: "Partly cloudy",
      rain_chance: 45,
    },
  },
  {
    id: "dhankawadi",
    name: "Dhankawadi - Sahakarnagar Ward Office",
    short: "Dhankawadi",
    pincodes: [411043, 411046],
    areas: ["Dhankawadi", "Katraj", "Ambegaon"],
    latitude: 18.4575,
    longitude: 73.8508,
    population: 242000,
    risk_score: 62,
    risk_level: "high",
    metrics: {
      drain_complaints: 31,
      sewage_overflow: 12,
      water_stagnation_days: 8,
      dengue_cases_last_season: 121,
    },
    baseline_weather: {
      rainfall_10d: 40.0,
      humidity: 84,
      temperature: 25.2,
      condition: "Light rain",
      rain_chance: 70,
    },
  },
  {
    id: "dhole-patil",
    name: "Dhole Patil Road Ward Office",
    short: "Dhole Patil Rd",
    pincodes: [411001],
    areas: ["Koregaon Park", "Pune Station", "Ghorpuri"],
    latitude: 18.5362,
    longitude: 73.8828,
    population: 154000,
    risk_score: 38,
    risk_level: "moderate",
    metrics: {
      drain_complaints: 18,
      sewage_overflow: 7,
      water_stagnation_days: 4,
      dengue_cases_last_season: 74,
    },
    baseline_weather: {
      rainfall_10d: 29.0,
      humidity: 83,
      temperature: 26.8,
      condition: "Partly cloudy",
      rain_chance: 40,
    },
  },
  {
    id: "kondhwa",
    name: "Kondhwa - Yewalewadi Ward Office",
    short: "Kondhwa",
    pincodes: [411048],
    areas: ["Kondhwa Khurd", "Kondhwa Budruk", "NIBM"],
    latitude: 18.4635,
    longitude: 73.8906,
    population: 286000,
    risk_score: 72,
    risk_level: "high",
    metrics: {
      drain_complaints: 44,
      sewage_overflow: 21,
      water_stagnation_days: 10,
      dengue_cases_last_season: 152,
    },
    baseline_weather: {
      rainfall_10d: 43.0,
      humidity: 85,
      temperature: 26.3,
      condition: "Rain",
      rain_chance: 75,
    },
  },
  {
    id: "kothrud",
    name: "Kothrud - Bawdhan Ward Office",
    short: "Kothrud",
    pincodes: [411038, 411021],
    areas: ["Kothrud", "Ideal Colony", "Bavdhan"],
    latitude: 18.5074,
    longitude: 73.8077,
    population: 334000,
    risk_score: 25,
    risk_level: "low",
    metrics: {
      drain_complaints: 11,
      sewage_overflow: 4,
      water_stagnation_days: 2,
      dengue_cases_last_season: 103,
    },
    baseline_weather: {
      rainfall_10d: 22.0,
      humidity: 81,
      temperature: 25.0,
      condition: "Clear sky",
      rain_chance: 20,
    },
  },
  {
    id: "nagar-road",
    name: "Nagar Road - Vadgaonsheri Ward Office",
    short: "Nagar Road",
    pincodes: [411014],
    areas: ["Vadgaonsheri", "Viman Nagar", "Kharadi"],
    latitude: 18.5529,
    longitude: 73.9182,
    population: 305000,
    risk_score: 48,
    risk_level: "moderate",
    metrics: {
      drain_complaints: 26,
      sewage_overflow: 10,
      water_stagnation_days: 5,
      dengue_cases_last_season: 118,
    },
    baseline_weather: {
      rainfall_10d: 31.0,
      humidity: 79,
      temperature: 26.6,
      condition: "Partly cloudy",
      rain_chance: 40,
    },
  },
  {
    id: "shivajinagar",
    name: "Shivajinagar - Ghole Road Ward Office",
    short: "Shivajinagar",
    pincodes: [411004, 411005, 411016],
    areas: ["Shivajinagar", "Deccan Gymkhana", "Model Colony"],
    latitude: 18.5308,
    longitude: 73.8474,
    population: 268000,
    risk_score: 36,
    risk_level: "moderate",
    metrics: {
      drain_complaints: 19,
      sewage_overflow: 8,
      water_stagnation_days: 3,
      dengue_cases_last_season: 109,
    },
    baseline_weather: {
      rainfall_10d: 28.0,
      humidity: 84,
      temperature: 25.4,
      condition: "Partly cloudy",
      rain_chance: 35,
    },
  },
  {
    id: "sinhgad-road",
    name: "Sinhgad Road Ward Office",
    short: "Sinhgad Road",
    pincodes: [411041, 411051],
    areas: ["Vadgaon Budruk", "Dhayari", "Nanded City"],
    latitude: 18.4704,
    longitude: 73.8242,
    population: 291000,
    risk_score: 64,
    risk_level: "high",
    metrics: {
      drain_complaints: 38,
      sewage_overflow: 17,
      water_stagnation_days: 9,
      dengue_cases_last_season: 134,
    },
    baseline_weather: {
      rainfall_10d: 41.0,
      humidity: 86,
      temperature: 25.1,
      condition: "Rain",
      rain_chance: 70,
    },
  },
  {
    id: "yerawada",
    name: "Yerawada - Kalas - Dhanori Ward Office",
    short: "Yerawada",
    pincodes: [411006, 411015, 411032],
    areas: ["Yerawada", "Dhanori", "Vishrantwadi"],
    latitude: 18.5639,
    longitude: 73.877,
    population: 356000,
    risk_score: 79,
    risk_level: "severe",
    metrics: {
      drain_complaints: 53,
      sewage_overflow: 29,
      water_stagnation_days: 13,
      dengue_cases_last_season: 176,
    },
    baseline_weather: {
      rainfall_10d: 46.0,
      humidity: 88,
      temperature: 26.7,
      condition: "Heavy rain",
      rain_chance: 85,
    },
  },
];

export function seedDatabase() {
  initDb();
  const now = new Date().toISOString();

  const insertWard = db.prepare(`
    INSERT INTO wards (id, name, short, pincodes, areas, latitude, longitude, population, risk_score, risk_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      short = excluded.short,
      pincodes = excluded.pincodes,
      areas = excluded.areas,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      population = excluded.population,
      risk_score = excluded.risk_score,
      risk_level = excluded.risk_level
  `);

  const insertMetrics = db.prepare(`
    INSERT INTO civic_metrics (ward_id, drain_complaints, sewage_overflow, water_stagnation_days, dengue_cases_last_season, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(ward_id) DO UPDATE SET
      drain_complaints = excluded.drain_complaints,
      sewage_overflow = excluded.sewage_overflow,
      water_stagnation_days = excluded.water_stagnation_days,
      dengue_cases_last_season = excluded.dengue_cases_last_season,
      updated_at = excluded.updated_at
  `);

  const insertWeather = db.prepare(`
    INSERT INTO weather_cache (ward_id, rainfall_10d, humidity, temperature, is_live, condition, rain_chance, daily_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(ward_id) DO UPDATE SET
      rainfall_10d = excluded.rainfall_10d,
      humidity = excluded.humidity,
      temperature = excluded.temperature,
      is_live = excluded.is_live,
      condition = excluded.condition,
      rain_chance = excluded.rain_chance,
      daily_json = excluded.daily_json,
      updated_at = excluded.updated_at
  `);

  // Mock 10-day daily breakdown for baseline
  for (const w of SEED_WARDS) {
    insertWard.run(
      w.id,
      w.name,
      w.short,
      JSON.stringify(w.pincodes),
      JSON.stringify(w.areas),
      w.latitude,
      w.longitude,
      w.population,
      w.risk_score,
      w.risk_level,
    );

    insertMetrics.run(
      w.id,
      w.metrics.drain_complaints,
      w.metrics.sewage_overflow,
      w.metrics.water_stagnation_days,
      w.metrics.dengue_cases_last_season,
      now,
    );

    const daily = Array.from({ length: 10 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      return {
        date: dateStr,
        rainMm: Math.round((w.baseline_weather.rainfall_10d / 10) * (0.8 + Math.random() * 0.4) * 10) / 10,
        humidity: Math.round(w.baseline_weather.humidity + (Math.random() - 0.5) * 6),
        tempC: Math.round((w.baseline_weather.temperature + (Math.random() - 0.5) * 2) * 10) / 10,
        condition: w.baseline_weather.condition,
        rainChance: w.baseline_weather.rain_chance,
      };
    });

    insertWeather.run(
      w.id,
      w.baseline_weather.rainfall_10d,
      w.baseline_weather.humidity,
      w.baseline_weather.temperature,
      0, // Initially stored baseline (is_live: 0)
      w.baseline_weather.condition,
      w.baseline_weather.rain_chance,
      JSON.stringify(daily),
      now,
    );
  }

  console.log(`[Seed] Successfully seeded ${SEED_WARDS.length} wards with coordinates and metrics.`);
}

// Execute if run directly
seedDatabase();
