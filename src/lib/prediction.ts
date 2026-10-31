import type { LiveWeather } from "./weather";

export type WardId =
  | "aundh-baner"
  | "bhavani-peth"
  | "bibwewadi"
  | "dhankawadi"
  | "dhole-patil"
  | "hadapsar"
  | "kondhwa"
  | "kothrud"
  | "nagar-road"
  | "shivajinagar"
  | "sinhgad-road"
  | "wanawadi"
  | "warje"
  | "yerawada"
  | "kasba";

export type Ward = {
  id: WardId;
  name: string;
  short: string;
  pincodes: number[];
  areas: string[];
  lat: number;
  lon: number;
  rainfallMm: number; // 14-day forecast total
  humidity: number; // %
  tempC: number;
  drainComplaints: number; // unresolved
  sewageComplaints: number;
  stagnationDays: number;
  historicalDengue: number; // cases last season
  population: number;
};

export const WARDS: Ward[] = [
  {
    id: "aundh-baner",
    name: "Aundh - Baner Ward Office",
    short: "Aundh-Baner",
    pincodes: [411007, 411008, 411045, 411021],
    areas: ["Aundh", "Baner", "Balewadi", "Pashan", "Sus"],
    lat: 18.5602,
    lon: 73.8031,
    rainfallMm: 268,
    humidity: 82,
    tempC: 25.6,
    drainComplaints: 14,
    sewageComplaints: 5,
    stagnationDays: 3,
    historicalDengue: 96,
    population: 312000,
  },
  {
    id: "bhavani-peth",
    name: "Bhavani Peth Ward Office",
    short: "Bhavani Peth",
    pincodes: [411042],
    areas: ["Bhavani Peth", "Guruwar Peth", "Ghorpade Peth", "Swargate"],
    lat: 18.5074,
    lon: 73.8633,
    rainfallMm: 214,
    humidity: 86,
    tempC: 26.4,
    drainComplaints: 48,
    sewageComplaints: 27,
    stagnationDays: 11,
    historicalDengue: 143,
    population: 178000,
  },
  {
    id: "bibwewadi",
    name: "Bibwewadi Ward Office",
    short: "Bibwewadi",
    pincodes: [411037],
    areas: ["Bibwewadi", "Market Yard", "Salisbury Park"],
    lat: 18.4783,
    lon: 73.868,
    rainfallMm: 231,
    humidity: 80,
    tempC: 26.1,
    drainComplaints: 22,
    sewageComplaints: 9,
    stagnationDays: 6,
    historicalDengue: 88,
    population: 196000,
  },
  {
    id: "dhankawadi",
    name: "Dhankawadi - Sahakarnagar Ward Office",
    short: "Dhankawadi",
    pincodes: [411043, 411046],
    areas: ["Dhankawadi", "Katraj", "Ambegaon", "Padmavati"],
    lat: 18.4575,
    lon: 73.8508,
    rainfallMm: 296,
    humidity: 84,
    tempC: 25.2,
    drainComplaints: 31,
    sewageComplaints: 12,
    stagnationDays: 8,
    historicalDengue: 121,
    population: 242000,
  },
  {
    id: "dhole-patil",
    name: "Dhole Patil Road Ward Office",
    short: "Dhole Patil Rd",
    pincodes: [411001],
    areas: ["Koregaon Park", "Pune Station", "Ghorpuri", "Pune Cantt"],
    lat: 18.5362,
    lon: 73.8828,
    rainfallMm: 247,
    humidity: 83,
    tempC: 26.8,
    drainComplaints: 18,
    sewageComplaints: 7,
    stagnationDays: 4,
    historicalDengue: 74,
    population: 154000,
  },
  {
    id: "hadapsar",
    name: "Hadapsar - Mundhwa Ward Office",
    short: "Hadapsar",
    pincodes: [411013, 411028, 411036],
    areas: ["Hadapsar", "Magarpatta", "Mundhwa", "Fursungi"],
    lat: 18.5089,
    lon: 73.926,
    rainfallMm: 259,
    humidity: 87,
    tempC: 26.9,
    drainComplaints: 57,
    sewageComplaints: 34,
    stagnationDays: 12,
    historicalDengue: 187,
    population: 398000,
  },
  {
    id: "kondhwa",
    name: "Kondhwa - Yewalewadi Ward Office",
    short: "Kondhwa",
    pincodes: [411048],
    areas: ["Kondhwa Khurd", "Kondhwa Budruk", "NIBM", "Yewalewadi"],
    lat: 18.4635,
    lon: 73.8906,
    rainfallMm: 238,
    humidity: 85,
    tempC: 26.3,
    drainComplaints: 44,
    sewageComplaints: 21,
    stagnationDays: 10,
    historicalDengue: 152,
    population: 286000,
  },
  {
    id: "kothrud",
    name: "Kothrud - Bawdhan Ward Office",
    short: "Kothrud",
    pincodes: [411038, 411021],
    areas: ["Kothrud", "Ideal Colony", "Bhusari Colony", "Bavdhan"],
    lat: 18.5074,
    lon: 73.8077,
    rainfallMm: 312,
    humidity: 81,
    tempC: 25.0,
    drainComplaints: 11,
    sewageComplaints: 4,
    stagnationDays: 2,
    historicalDengue: 103,
    population: 334000,
  },
  {
    id: "nagar-road",
    name: "Nagar Road - Vadgaonsheri Ward Office",
    short: "Nagar Road",
    pincodes: [411014],
    areas: ["Vadgaonsheri", "Kalyani Nagar", "Viman Nagar", "Kharadi"],
    lat: 18.5529,
    lon: 73.9182,
    rainfallMm: 221,
    humidity: 79,
    tempC: 26.6,
    drainComplaints: 26,
    sewageComplaints: 10,
    stagnationDays: 5,
    historicalDengue: 118,
    population: 305000,
  },
  {
    id: "shivajinagar",
    name: "Shivajinagar - Ghole Road Ward Office",
    short: "Shivajinagar",
    pincodes: [411004, 411005, 411016],
    areas: ["Shivajinagar", "Deccan Gymkhana", "Model Colony", "Khadki"],
    lat: 18.5308,
    lon: 73.8474,
    rainfallMm: 341,
    humidity: 84,
    tempC: 25.4,
    drainComplaints: 19,
    sewageComplaints: 8,
    stagnationDays: 3,
    historicalDengue: 109,
    population: 268000,
  },
  {
    id: "sinhgad-road",
    name: "Sinhgad Road Ward Office",
    short: "Sinhgad Road",
    pincodes: [411041, 411051],
    areas: ["Vadgaon Budruk", "Anandnagar", "Dhayari", "Nanded City"],
    lat: 18.4704,
    lon: 73.8242,
    rainfallMm: 327,
    humidity: 86,
    tempC: 25.1,
    drainComplaints: 38,
    sewageComplaints: 17,
    stagnationDays: 9,
    historicalDengue: 134,
    population: 291000,
  },
  {
    id: "wanawadi",
    name: "Wanawadi - Ramtekadi Ward Office",
    short: "Wanawadi",
    pincodes: [411040],
    areas: ["Wanowrie", "Ramtekadi", "AFMC"],
    lat: 18.488,
    lon: 73.896,
    rainfallMm: 226,
    humidity: 82,
    tempC: 26.5,
    drainComplaints: 29,
    sewageComplaints: 14,
    stagnationDays: 7,
    historicalDengue: 97,
    population: 172000,
  },
  {
    id: "warje",
    name: "Warje - Karvenagar Ward Office",
    short: "Warje",
    pincodes: [411052, 411058, 411023],
    areas: ["Warje", "Karvenagar", "Shivane"],
    lat: 18.4832,
    lon: 73.8016,
    rainfallMm: 304,
    humidity: 83,
    tempC: 25.3,
    drainComplaints: 16,
    sewageComplaints: 6,
    stagnationDays: 4,
    historicalDengue: 81,
    population: 219000,
  },
  {
    id: "yerawada",
    name: "Yerawada - Kalas - Dhanori Ward Office",
    short: "Yerawada",
    pincodes: [411006, 411015, 411032, 411047],
    areas: ["Yerawada", "Dhanori", "Vishrantwadi", "Lohegaon", "Airport"],
    lat: 18.5639,
    lon: 73.877,
    rainfallMm: 252,
    humidity: 88,
    tempC: 26.7,
    drainComplaints: 53,
    sewageComplaints: 29,
    stagnationDays: 13,
    historicalDengue: 176,
    population: 356000,
  },
  {
    id: "kasba",
    name: "Kasba - Vishrambaug Wada Ward Office",
    short: "Kasba Peth",
    pincodes: [411011, 411030],
    areas: ["Kasba Peth", "Sadashiv Peth", "Narayan Peth", "Shaniwar Peth"],
    lat: 18.5186,
    lon: 73.8554,
    rainfallMm: 243,
    humidity: 85,
    tempC: 26.0,
    drainComplaints: 35,
    sewageComplaints: 19,
    stagnationDays: 9,
    historicalDengue: 128,
    population: 163000,
  },
];

export type Horizon = number; // 1..14 days

export type DiseaseName = "Dengue" | "Malaria" | "Leptospirosis" | "Typhoid";

export type DiseaseScore = {
  disease: DiseaseName;
  probability: number; // 0-100
  driver: string;
  action: string;
};

export type RiskLevel = "low" | "moderate" | "high" | "severe";

export type FeatureImportance = { feature: string; weight: number; value: string };

export type Prediction = {
  ward: Ward;
  horizon: Horizon;
  level: RiskLevel;
  headline: string;
  diseases: DiseaseScore[];
  waterProfile: string;
  features: FeatureImportance[];
  timeline: { day: number; label: string; rainfall: number; risk: number }[];
  live: boolean;
  observed: { rainfallMm: number; humidity: number; tempC: number };
};

const clamp = (n: number) => Math.max(2, Math.min(97, Math.round(n)));

/**
 * Multi-class risk scoring (Random-Forest style weighted ensemble) over the
 * forecast window. Clean stagnant water -> Dengue. Dirty/aged water -> Malaria.
 * Sewage mixed with floodwater -> Leptospirosis / Typhoid.
 *
 * When `live` daily weather is supplied (Google Weather 14-day forecast), the
 * rainfall / humidity / temperature inputs come from the real forecast instead
 * of the stored baseline.
 */
export function predict(ward: Ward, horizon: Horizon, live?: LiveWeather | null): Prediction {
  const scale = horizon / 14;
  const liveDays = live?.daily?.slice(0, horizon) ?? [];
  const hasLive = liveDays.length > 0;

  const rain = hasLive
    ? liveDays.reduce((s, d) => s + d.rainMm, 0)
    : ward.rainfallMm * scale;
  const humidity = hasLive
    ? Math.round(liveDays.reduce((s, d) => s + d.humidity, 0) / liveDays.length)
    : ward.humidity;
  const tempC = hasLive
    ? Math.round((liveDays.reduce((s, d) => s + d.tempC, 0) / liveDays.length) * 10) / 10
    : ward.tempC;

  const drains = ward.drainComplaints * scale;
  const sewage = ward.sewageComplaints * scale;
  const stagnation = ward.stagnationDays * scale;
  const humidityBoost = (humidity - 75) * 1.6;
  const tempBoost = (tempC - 24) * 3;
  const historyBoost = ward.historicalDengue * 0.06;

  const dengue = clamp(
    rain * 0.14 + humidityBoost + tempBoost + historyBoost - drains * 0.45 - stagnation * 1.2 + 6,
  );
  const malaria = clamp(
    stagnation * 3.8 + drains * 0.7 + rain * 0.04 + humidityBoost * 0.5 + 4,
  );
  const lepto = clamp(sewage * 1.5 + drains * 0.7 + rain * 0.08 + humidityBoost * 0.4 - 6);
  const typhoid = clamp(sewage * 1.1 + stagnation * 1.4 + drains * 0.4 + rain * 0.02 - 4);


  const diseases: DiseaseScore[] = ([
    {
      disease: "Dengue",
      probability: dengue,
      driver: `Fresh rainwater pooling in clean containers at ${ward.humidity}% humidity, ${ward.tempC}°C`,
      action: "Dry-day drive: empty rooftop tanks, tyres and construction pits",
    },
    {
      disease: "Malaria",
      probability: malaria,
      driver: `Dirty water standing for ~${Math.round(stagnation)} days mixed with silt`,
      action: "Larvicide spraying and de-silting of open nullahs",
    },
    {
      disease: "Leptospirosis",
      probability: lepto,
      driver: `${Math.round(sewage)} sewage overflow reports with flood mixing`,
      action: "Clear choked drains, issue rodent-urine advisory and stock doxycycline",
    },
    {
      disease: "Typhoid",
      probability: typhoid,
      driver: "Sewage seepage into drinking water supply lines",
      action: "Chlorinate supply lines and test water at ward taps",
    },
  ] as DiseaseScore[]).sort((a, b) => b.probability - a.probability);

  const top = diseases[0]!;
  const second = diseases[1]!;
  const level: RiskLevel =
    top.probability >= 75
      ? "severe"
      : top.probability >= 60
        ? "high"
        : top.probability >= 40
          ? "moderate"
          : "low";

  const sewageDriven = top.disease !== "Dengue";
  const waterProfile = sewageDriven
    ? "Dirty stagnant water mixing with sewage overflow"
    : "Clean stagnant rainwater collecting in open containers";

  const headline = sewageDriven
    ? `URGENT: High probability of ${top.disease} and ${second.disease} in ${horizon} days across ${ward.short} due to overflowing dirty sewage.`
    : `Warning: High probability of ${top.disease} in ${horizon} days across ${ward.short} due to fresh rainwater pooling.`;

  const rawFeatures: FeatureImportance[] = [
    { feature: "Unresolved drain complaints", weight: drains * 0.7, value: `${ward.drainComplaints}` },
    { feature: "Rainfall forecast", weight: rain * 0.12, value: `${Math.round(rain)} mm` },
    { feature: "Relative humidity", weight: Math.max(0, humidityBoost), value: `${humidity}%` },
    { feature: "Water stagnation", weight: stagnation * 2.2, value: `${ward.stagnationDays} days` },
    { feature: "Sewage overflow reports", weight: sewage * 1.2, value: `${ward.sewageComplaints}` },
    { feature: "Historical dengue load", weight: historyBoost, value: `${ward.historicalDengue} cases` },
    { feature: "Mean temperature", weight: Math.max(0, tempBoost), value: `${tempC}°C` },
  ];
  const total = rawFeatures.reduce((s, f) => s + f.weight, 0) || 1;
  const features = rawFeatures
    .map((f) => ({ ...f, weight: Math.round((f.weight / total) * 100) }))
    .sort((a, b) => b.weight - a.weight);

  const timeline = Array.from({ length: horizon }, (_, i) => {
    const day = i + 1;
    const wave = Math.sin((day / horizon) * Math.PI);
    const liveDay = liveDays[i];
    const label = liveDay
      ? new Date(`${liveDay.date}T00:00:00Z`).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })
      : `T+${day}`;
    return {
      day,
      label,
      rainfall: liveDay ? liveDay.rainMm : Math.round((rain / horizon) * (0.5 + wave)),
      risk: clamp(top.probability * (0.45 + 0.55 * (day / horizon))),
    };
  });

  return {
    ward,
    horizon,
    level,
    headline,
    diseases,
    waterProfile,
    features,
    timeline,
    live: hasLive,
    observed: { rainfallMm: Math.round(rain), humidity, tempC },
  };
}

export function riskLevelOf(ward: Ward, horizon: Horizon, live?: LiveWeather | null): RiskLevel {
  return predict(ward, horizon, live).level;
}


export const LEVEL_LABEL: Record<RiskLevel, string> = {
  low: "Low risk",
  moderate: "Moderate risk",
  high: "High risk",
  severe: "Severe risk",
};
