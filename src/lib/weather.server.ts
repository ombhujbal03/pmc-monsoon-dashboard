import { WARDS } from "./prediction";
import {
  parseOpenMeteoDaily,
  type DailyWeather,
  type LiveWeather,
  type WeatherBundle,
} from "./weather";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const CACHE_MS = 15 * 60 * 1000; // 15 minutes cache

let cache: { at: number; data: WeatherBundle } | null = null;

type GoogleDay = {
  displayDate?: { year: number; month: number; day: number };
  daytimeForecast?: {
    weatherCondition?: { description?: { text?: string } };
    precipitation?: { qpf?: { quantity?: number }; probability?: { percent?: number } };
    relativeHumidity?: number;
  };
  nighttimeForecast?: {
    precipitation?: { qpf?: { quantity?: number } };
    relativeHumidity?: number;
  };
  maxTemperature?: { degrees?: number };
  minTemperature?: { degrees?: number };
};

function toDailyFromGoogle(d: GoogleDay): DailyWeather {
  const dd = d.displayDate;
  const date = dd
    ? `${dd.year}-${String(dd.month).padStart(2, "0")}-${String(dd.day).padStart(2, "0")}`
    : "";
  const dayRain = d.daytimeForecast?.precipitation?.qpf?.quantity ?? 0;
  const nightRain = d.nighttimeForecast?.precipitation?.qpf?.quantity ?? 0;
  const dayHum = d.daytimeForecast?.relativeHumidity ?? 0;
  const nightHum = d.nighttimeForecast?.relativeHumidity ?? dayHum;
  const max = d.maxTemperature?.degrees ?? 0;
  const min = d.minTemperature?.degrees ?? max;
  return {
    date,
    rainMm: Math.round((dayRain + nightRain) * 10) / 10,
    humidity: Math.round((dayHum + nightHum) / 2),
    tempC: Math.round(((max + min) / 2) * 10) / 10,
    condition: d.daytimeForecast?.weatherCondition?.description?.text ?? "—",
    rainChance: d.daytimeForecast?.precipitation?.probability?.percent ?? 0,
  };
}

/**
 * Fetch ward daily forecasts from Google Maps Weather Gateway
 */
async function fetchGoogleWeatherForWard(
  lat: number,
  lon: number,
  lovableKey: string,
  mapsKey: string,
): Promise<DailyWeather[]> {
  const days: DailyWeather[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < 3 && days.length < 10; page++) {
    const params = new URLSearchParams({
      "location.latitude": String(lat),
      "location.longitude": String(lon),
      pageSize: "5",
    });
    if (pageToken) params.set("pageToken", pageToken);
    else params.set("days", "10");

    const res = await fetch(`${GATEWAY_URL}/weather/v1/forecast/days:lookup?${params}`, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": mapsKey,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      if (days.length > 0) break;
      throw new Error(`Google Maps Weather request failed [${res.status}]: ${body}`);
    }
    const json = (await res.json()) as { forecastDays?: GoogleDay[]; nextPageToken?: string };
    for (const d of json.forecastDays ?? []) days.push(toDailyFromGoogle(d));
    pageToken = json.nextPageToken;
    if (!pageToken) break;
  }

  return days.slice(0, 10);
}

/**
 * Fetch ward daily forecasts from OpenWeather API
 */
async function fetchOpenWeatherForWard(
  lat: number,
  lon: number,
  apiKey: string,
): Promise<DailyWeather[]> {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenWeather API failed [${res.status}]: ${body}`);
  }
  const json = await res.json();
  const byDay: Record<string, { rains: number[]; temps: number[]; hums: number[]; conds: string[]; pops: number[] }> = {};

  for (const item of json.list || []) {
    const dateStr = item.dt_txt?.split(" ")[0];
    if (!dateStr) continue;
    if (!byDay[dateStr]) {
      byDay[dateStr] = { rains: [], temps: [], hums: [], conds: [], pops: [] };
    }
    const rainVal = (item.rain && (item.rain["3h"] || item.rain["1h"])) || 0;
    byDay[dateStr].rains.push(rainVal);
    byDay[dateStr].temps.push(item.main?.temp ?? 27);
    byDay[dateStr].hums.push(item.main?.humidity ?? 70);
    byDay[dateStr].pops.push(item.pop ?? 0);
    if (item.weather?.[0]?.description) {
      byDay[dateStr].conds.push(item.weather[0].description);
    }
  }

  const days: DailyWeather[] = Object.entries(byDay).map(([date, d]) => {
    const rainMm = Math.round(d.rains.reduce((a, b) => a + b, 0) * 10) / 10;
    const tempC = Math.round((d.temps.reduce((a, b) => a + b, 0) / d.temps.length) * 10) / 10;
    const humidity = Math.round(d.hums.reduce((a, b) => a + b, 0) / d.hums.length);
    const rainChance = Math.round(Math.max(...d.pops, 0) * 100);
    const condition = d.conds[Math.floor(d.conds.length / 2)] || "Partly cloudy";
    return {
      date,
      rainMm,
      humidity,
      tempC,
      condition,
      rainChance,
    };
  });

  return days.slice(0, 10);
}

/**
 * Fetch ward daily forecasts from Open-Meteo batch API (14-day high precision forecast)
 */
async function fetchOpenMeteoBatch(
  wards: typeof WARDS,
  retries = 2,
): Promise<Record<string, LiveWeather>> {
  const lats = wards.map((w) => w.lat).join(",");
  const lons = wards.map((w) => w.lon).join(",");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&daily=precipitation_sum,relative_humidity_2m_mean,temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=Asia/Kolkata&forecast_days=14`;

  let lastError: any;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) {
        throw new Error(`Open-Meteo returned HTTP ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      const records: Record<string, LiveWeather> = {};
      const fetchedAt = new Date().toISOString();

      if (Array.isArray(json)) {
        json.forEach((item, index) => {
          const ward = wards[index];
          if (ward && item.daily) {
            records[ward.id] = {
              wardId: ward.id,
              fetchedAt,
              daily: parseOpenMeteoDaily(item.daily),
            };
          }
        });
      }

      if (Object.keys(records).length > 0) {
        return records;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Open-Meteo Batch] Attempt ${attempt} failed: ${err.message}. Retrying...`);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }

  // If batch fails, try individual ward fetches as a secondary retry
  console.warn("[Open-Meteo] Batch fetch failed. Falling back to individual ward queries...");
  const records: Record<string, LiveWeather> = {};
  const fetchedAt = new Date().toISOString();

  await Promise.allSettled(
    wards.map(async (w) => {
      try {
        const u = `https://api.open-meteo.com/v1/forecast?latitude=${w.lat}&longitude=${w.lon}&daily=precipitation_sum,relative_humidity_2m_mean,temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=Asia/Kolkata&forecast_days=14`;
        const r = await fetch(u, { signal: AbortSignal.timeout(5000) });
        if (!r.ok) return;
        const j = await r.json();
        if (j.daily) {
          records[w.id] = {
            wardId: w.id,
            fetchedAt,
            daily: parseOpenMeteoDaily(j.daily),
          };
        }
      } catch (e: any) {
        console.error(`[Open-Meteo] Failed individual fetch for ward ${w.id}:`, e.message);
      }
    }),
  );

  if (Object.keys(records).length > 0) {
    return records;
  }

  throw lastError || new Error("Failed to fetch live weather from Open-Meteo");
}

export async function loadWeatherBundle(): Promise<WeatherBundle> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return cache.data;
  }

  const fetchedAt = new Date().toISOString();
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const mapsKey = process.env["GOOGLE_MAPS_API_KEY"] || process.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
  const openWeatherKey = process.env["OPENWEATHER_API_KEY"] || process.env["VITE_OPENWEATHER_API_KEY"];

  // 1. Try Google Maps Weather gateway if fully configured
  if (lovableKey && mapsKey) {
    try {
      console.info("[WeatherService] Attempting Google Maps Weather Gateway...");
      const wards: Record<string, LiveWeather> = {};
      const results = await Promise.allSettled(
        WARDS.map(async (w) => ({
          id: w.id,
          daily: await fetchGoogleWeatherForWard(w.lat, w.lon, lovableKey, mapsKey),
        })),
      );

      for (const r of results) {
        if (r.status === "fulfilled") {
          wards[r.value.id] = { wardId: r.value.id, fetchedAt, daily: r.value.daily };
        }
      }

      if (Object.keys(wards).length > 0) {
        const bundle: WeatherBundle = { fetchedAt, wards, source: "google-maps" };
        cache = { at: Date.now(), data: bundle };
        return bundle;
      }
    } catch (err: any) {
      console.warn("[WeatherService] Google Maps weather gateway failed, trying Open-Meteo:", err?.message || err);
    }
  }

  // 2. Try Open-Meteo (zero key required, full 14-day forecasts for all 15 wards)
  try {
    console.info("[WeatherService] Fetching live 14-day weather for all 15 PMC wards via Open-Meteo...");
    const wards = await fetchOpenMeteoBatch(WARDS);
    if (Object.keys(wards).length > 0) {
      console.info(`[WeatherService] Successfully fetched live weather for ${Object.keys(wards).length} wards.`);
      const bundle: WeatherBundle = { fetchedAt, wards, source: "open-meteo" };
      cache = { at: Date.now(), data: bundle };
      return bundle;
    }
  } catch (err: any) {
    console.warn("[WeatherService] Open-Meteo failed, attempting OpenWeather fallback:", err?.message || err);
  }

  // 3. Try OpenWeather if API key is present
  if (openWeatherKey) {
    try {
      console.info("[WeatherService] Attempting OpenWeather API fallback...");
      const wards: Record<string, LiveWeather> = {};
      const results = await Promise.allSettled(
        WARDS.map(async (w) => ({
          id: w.id,
          daily: await fetchOpenWeatherForWard(w.lat, w.lon, openWeatherKey),
        })),
      );

      for (const r of results) {
        if (r.status === "fulfilled") {
          wards[r.value.id] = { wardId: r.value.id, fetchedAt, daily: r.value.daily };
        }
      }

      if (Object.keys(wards).length > 0) {
        const bundle: WeatherBundle = { fetchedAt, wards, source: "openweathermap" };
        cache = { at: Date.now(), data: bundle };
        return bundle;
      }
    } catch (err: any) {
      console.error("[WeatherService] OpenWeather fallback failed:", err?.message || err);
    }
  }

  // 4. Calibrated fallback to ensure uninterrupted dashboard display even in total network blackout
  console.warn("[WeatherService] All live weather APIs unreachable. Using calibrated dynamic baseline.");
  const fallbackWards: Record<string, LiveWeather> = {};
  const today = new Date();
  for (const w of WARDS) {
    const daily: DailyWeather[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0]!;
      const variance = Math.sin((i / 14) * Math.PI) * 1.2;
      const rainMm = Math.max(0, Math.round((w.rainfallMm / 14) * (0.8 + variance) * 10) / 10);
      daily.push({
        date: dateStr,
        rainMm,
        humidity: Math.min(95, Math.max(50, Math.round(w.humidity + (variance - 0.5) * 8))),
        tempC: Math.round((w.tempC - (variance - 0.5) * 2) * 10) / 10,
        condition: rainMm > 15 ? "Heavy rain" : rainMm > 3 ? "Moderate rain" : "Partly cloudy",
        rainChance: Math.min(100, Math.round(rainMm * 4 + 20)),
      });
    }
    fallbackWards[w.id] = { wardId: w.id, fetchedAt, daily };
  }

  const fallbackBundle: WeatherBundle = {
    fetchedAt,
    wards: fallbackWards,
    error: "Live weather service temporarily offline — using calibrated dynamic forecast",
    source: "calibrated-baseline",
  };
  return fallbackBundle;
}
