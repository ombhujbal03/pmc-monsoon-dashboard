import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "outbreak.db");

export const db = new DatabaseSync(dbPath);

// Initialize SQLite tables
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS wards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short TEXT NOT NULL,
      pincodes TEXT NOT NULL,
      areas TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      population INTEGER NOT NULL,
      risk_score REAL DEFAULT 0,
      risk_level TEXT DEFAULT 'low'
    );

    CREATE TABLE IF NOT EXISTS civic_metrics (
      ward_id TEXT PRIMARY KEY,
      drain_complaints INTEGER NOT NULL DEFAULT 0,
      sewage_overflow INTEGER NOT NULL DEFAULT 0,
      water_stagnation_days INTEGER NOT NULL DEFAULT 0,
      dengue_cases_last_season INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(ward_id) REFERENCES wards(id)
    );

    CREATE TABLE IF NOT EXISTS weather_cache (
      ward_id TEXT PRIMARY KEY,
      rainfall_10d REAL NOT NULL DEFAULT 0,
      humidity REAL NOT NULL DEFAULT 70,
      temperature REAL NOT NULL DEFAULT 26.5,
      is_live INTEGER NOT NULL DEFAULT 0,
      condition TEXT DEFAULT 'Partly cloudy',
      rain_chance REAL DEFAULT 20,
      daily_json TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(ward_id) REFERENCES wards(id)
    );
  `);
}

export function getAllWards() {
  const stmt = db.prepare(`
    SELECT 
      w.id,
      w.name,
      w.short,
      w.pincodes,
      w.areas,
      w.latitude,
      w.longitude,
      w.population,
      w.risk_score,
      w.risk_level,
      cm.drain_complaints,
      cm.sewage_overflow,
      cm.water_stagnation_days,
      cm.dengue_cases_last_season,
      wc.rainfall_10d,
      wc.humidity,
      wc.temperature,
      wc.is_live,
      wc.condition,
      wc.rain_chance,
      wc.updated_at AS weather_updated_at
    FROM wards w
    LEFT JOIN civic_metrics cm ON w.id = cm.ward_id
    LEFT JOIN weather_cache wc ON w.id = wc.ward_id
    ORDER BY w.name ASC
  `);

  const rows = stmt.all();
  return rows.map((r) => {
    let parsedPincodes = [];
    try {
      parsedPincodes = JSON.parse(r.pincodes);
    } catch {
      parsedPincodes = typeof r.pincodes === "string" ? r.pincodes.split(",").map((s) => Number(s.trim())) : [];
    }

    let parsedAreas = [];
    try {
      parsedAreas = JSON.parse(r.areas);
    } catch {
      parsedAreas = typeof r.areas === "string" ? r.areas.split(",").map((s) => s.trim()) : [];
    }

    return {
      id: r.id,
      name: r.name,
      short: r.short,
      pincodes: parsedPincodes,
      areas: parsedAreas,
      latitude: r.latitude,
      longitude: r.longitude,
      lat: r.latitude,
      lng: r.longitude,
      lon: r.longitude,
      population: r.population,
      risk_score: r.risk_score,
      risk_level: r.risk_level,
      civic_metrics: {
        drain_complaints: r.drain_complaints || 0,
        sewage_overflow: r.sewage_overflow || 0,
        water_stagnation_days: r.water_stagnation_days || 0,
        dengue_cases_last_season: r.dengue_cases_last_season || 0,
      },
      weather: {
        rainfall_10d: r.rainfall_10d || 0,
        humidity: r.humidity || 70,
        temperature: r.temperature || 26.5,
        is_live: Boolean(r.is_live),
        condition: r.condition || "Partly cloudy",
        rain_chance: r.rain_chance || 20,
        updated_at: r.weather_updated_at,
      },
    };
  });
}

export function getWardById(id) {
  const stmt = db.prepare(`
    SELECT 
      w.id,
      w.name,
      w.short,
      w.pincodes,
      w.areas,
      w.latitude,
      w.longitude,
      w.population,
      w.risk_score,
      w.risk_level,
      cm.drain_complaints,
      cm.sewage_overflow,
      cm.water_stagnation_days,
      cm.dengue_cases_last_season,
      wc.rainfall_10d,
      wc.humidity,
      wc.temperature,
      wc.is_live,
      wc.condition,
      wc.rain_chance,
      wc.daily_json,
      wc.updated_at AS weather_updated_at
    FROM wards w
    LEFT JOIN civic_metrics cm ON w.id = cm.ward_id
    LEFT JOIN weather_cache wc ON w.id = wc.ward_id
    WHERE w.id = ?
  `);

  const r = stmt.get(id);
  if (!r) return null;

  let parsedPincodes = [];
  try {
    parsedPincodes = JSON.parse(r.pincodes);
  } catch {
    parsedPincodes = [];
  }

  let parsedAreas = [];
  try {
    parsedAreas = JSON.parse(r.areas);
  } catch {
    parsedAreas = [];
  }

  let parsedDaily = [];
  try {
    parsedDaily = JSON.parse(r.daily_json || "[]");
  } catch {
    parsedDaily = [];
  }

  return {
    id: r.id,
    name: r.name,
    short: r.short,
    pincodes: parsedPincodes,
    areas: parsedAreas,
    latitude: r.latitude,
    longitude: r.longitude,
    lat: r.latitude,
    lng: r.longitude,
    lon: r.longitude,
    population: r.population,
    risk_score: r.risk_score,
    risk_level: r.risk_level,
    civic_metrics: {
      drain_complaints: r.drain_complaints || 0,
      sewage_overflow: r.sewage_overflow || 0,
      water_stagnation_days: r.water_stagnation_days || 0,
      dengue_cases_last_season: r.dengue_cases_last_season || 0,
    },
    weather: {
      rainfall_10d: r.rainfall_10d || 0,
      humidity: r.humidity || 70,
      temperature: r.temperature || 26.5,
      is_live: Boolean(r.is_live),
      condition: r.condition || "Partly cloudy",
      rain_chance: r.rain_chance || 20,
      daily: parsedDaily,
      updated_at: r.weather_updated_at,
    },
  };
}

export function updateCivicMetrics(wardId, metrics) {
  const current = getWardById(wardId);
  if (!current) return null;

  const drainComplaints =
    metrics.drain_complaints !== undefined ? Number(metrics.drain_complaints) : current.civic_metrics.drain_complaints;
  const sewageOverflow =
    metrics.sewage_overflow !== undefined ? Number(metrics.sewage_overflow) : current.civic_metrics.sewage_overflow;
  const waterStagnationDays =
    metrics.water_stagnation_days !== undefined
      ? Number(metrics.water_stagnation_days)
      : current.civic_metrics.water_stagnation_days;
  const dengueCases =
    metrics.dengue_cases_last_season !== undefined
      ? Number(metrics.dengue_cases_last_season)
      : current.civic_metrics.dengue_cases_last_season;

  const now = new Date().toISOString();

  const upsert = db.prepare(`
    INSERT INTO civic_metrics (ward_id, drain_complaints, sewage_overflow, water_stagnation_days, dengue_cases_last_season, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(ward_id) DO UPDATE SET
      drain_complaints = excluded.drain_complaints,
      sewage_overflow = excluded.sewage_overflow,
      water_stagnation_days = excluded.water_stagnation_days,
      dengue_cases_last_season = excluded.dengue_cases_last_season,
      updated_at = excluded.updated_at
  `);

  upsert.run(wardId, drainComplaints, sewageOverflow, waterStagnationDays, dengueCases, now);

  // Recalculate risk score:
  // Random-forest weighted heuristic formula:
  const rain = current.weather.rainfall_10d;
  const hum = current.weather.humidity;
  const temp = current.weather.temperature;
  const humBoost = Math.max(0, (hum - 75) * 1.5);
  const tempBoost = Math.max(0, (temp - 24) * 2.8);
  const dengueRisk = Math.min(
    98,
    Math.max(
      5,
      Math.round(rain * 0.12 + humBoost + tempBoost + dengueCases * 0.08 + drainComplaints * 0.35 + waterStagnationDays * 1.8),
    ),
  );

  let level = "low";
  if (dengueRisk >= 75) level = "severe";
  else if (dengueRisk >= 55) level = "high";
  else if (dengueRisk >= 35) level = "moderate";

  db.prepare(`UPDATE wards SET risk_score = ?, risk_level = ? WHERE id = ?`).run(dengueRisk, level, wardId);

  return getWardById(wardId);
}

export function updateWeatherCache(wardId, weatherData) {
  const upsert = db.prepare(`
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

  upsert.run(
    wardId,
    weatherData.rainfall_10d,
    weatherData.humidity,
    weatherData.temperature,
    weatherData.is_live ? 1 : 0,
    weatherData.condition || "Partly cloudy",
    weatherData.rain_chance || 20,
    JSON.stringify(weatherData.daily || []),
    weatherData.updated_at || new Date().toISOString(),
  );
}
