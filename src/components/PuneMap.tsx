import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { predict, type Horizon, type RiskLevel, type Ward, type WardId } from "@/lib/prediction";
import type { WeatherBundle } from "@/lib/weather";

export type Props = {
  wards: Ward[];
  selected: WardId;
  onSelect: (id: WardId) => void;
  horizon: Horizon;
  weather: WeatherBundle | undefined;
  showComplaints: boolean;
  showRisk: boolean;
};

const RISK_HEX: Record<RiskLevel, string> = {
  low: "#22c55e",
  moderate: "#facc15",
  high: "#f97316",
  severe: "#ef4444",
};

// Sub-area centroids within Hadapsar - Mundhwa Ward with their authentic geographic locations and risk profiles
const HADAPSAR_AREAS = [
  {
    name: "Hadapsar (Gadital / Central)",
    areaId: "hadapsar-central",
    lat: 18.5089,
    lng: 73.9259,
    riskLevel: "severe" as RiskLevel,
    complaintCount: 38,
    details: "Severe water-logging hotspot around Gadital bus depot & Pune-Solapur Rd",
  },
  {
    name: "Mundhwa (Riverfront / Nullah)",
    areaId: "mundhwa-industrial",
    lat: 18.5362,
    lng: 73.919,
    riskLevel: "high" as RiskLevel,
    complaintCount: 26,
    details: "High overflow risk along Mula-Mutha riverbank & industrial drains",
  },
  {
    name: "Magarpatta (Cybercity)",
    areaId: "magarpatta-city",
    lat: 18.5158,
    lng: 73.9272,
    riskLevel: "low" as RiskLevel,
    complaintCount: 7,
    details: "Low risk due to managed stormwater recharge network",
  },
  {
    name: "Fursungi (SP Infocity / Canal)",
    areaId: "fursungi-canal",
    lat: 18.4764,
    lng: 73.9782,
    riskLevel: "moderate" as RiskLevel,
    complaintCount: 20,
    details: "Moderate risk near Mutha Right Bank Canal & open nullah stretches",
  },
];

function MapViewController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function PuneMap({
  wards,
  selected,
  onSelect,
  horizon = 10,
  weather,
  showRisk = true,
  showComplaints = true,
}: Props) {
  const selectedWard = useMemo(
    () => (wards || []).find((w) => w.id === selected),
    [wards, selected],
  );

  const centerLat = selectedWard?.lat ?? 18.5089;
  const centerLng = selectedWard?.lon ?? (selectedWard as any)?.lng ?? 73.9259;
  const centerPosition: [number, number] = useMemo(
    () => [centerLat, centerLng],
    [centerLat, centerLng],
  );

  const wardMarkers = useMemo(() => {
    return (wards || []).map((ward) => {
      const lat = ward.lat;
      const lng = ward.lon ?? (ward as any).lng ?? 73.8567;

      const prediction = predict(ward, horizon, weather?.wards?.[ward.id] ?? null);
      const safeRiskLevel = prediction.level;
      const riskColor = RISK_HEX[safeRiskLevel] ?? "#3b82f6";
      const complaintCount = (ward.drainComplaints || 0) + (ward.sewageComplaints || 0);
      const isSelected = selected === ward.id;
      const circleRadiusInMeters = showComplaints
        ? 1100 + Math.min(1000, complaintCount * 14)
        : 1400;

      return (
        <Circle
          key={ward.id}
          center={[lat, lng]}
          radius={circleRadiusInMeters}
          pathOptions={{
            color: showRisk ? riskColor : "#2563eb",
            fillColor: showRisk ? riskColor : "#3b82f6",
            fillOpacity: isSelected ? 0.75 : 0.38,
            weight: isSelected ? 3.5 : 1.5,
          }}
          eventHandlers={{ click: () => onSelect(ward.id) }}
        >
          <Popup>
            <div style={{ fontSize: "13px", lineHeight: "1.4" }}>
              <strong style={{ fontSize: "14px" }}>{ward.name}</strong>
              <br />
              <span>
                Risk Level:{" "}
                <b style={{ color: riskColor, textTransform: "uppercase" }}>
                  {safeRiskLevel}
                </b>
              </span>
              <br />
              <span>Open Complaints: <b>{complaintCount}</b></span>
              <br />
              <span>
                Top Concern: {prediction.diseases[0]?.disease} ({prediction.diseases[0]?.probability}%)
              </span>
              <br />
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                Coords: {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            </div>
          </Popup>
        </Circle>
      );
    });
  }, [wards, horizon, weather, showRisk, showComplaints, selected, onSelect]);

  const isHadapsarSelected = selected === "hadapsar";
  const hadapsarAreaMarkers = useMemo(() => {
    return HADAPSAR_AREAS.map((area) => {
      const riskColor = RISK_HEX[area.riskLevel];
      const radius = showComplaints ? 650 + area.complaintCount * 10 : 850;
      return (
        <Circle
          key={area.areaId}
          center={[area.lat, area.lng]}
          radius={radius}
          pathOptions={{
            color: showRisk ? riskColor : "#1d4ed8",
            fillColor: showRisk ? riskColor : "#2563eb",
            fillOpacity: 0.65,
            weight: 2,
            dashArray: "4, 4",
          }}
          eventHandlers={{ click: () => onSelect("hadapsar") }}
        >
          <Popup>
            <div style={{ fontSize: "13px", lineHeight: "1.4" }}>
              <strong style={{ fontSize: "14px" }}>{area.name}</strong>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Hadapsar Ward Area</div>
              <span>
                Risk Level:{" "}
                <b style={{ color: riskColor, textTransform: "uppercase" }}>
                  {area.riskLevel}
                </b>
              </span>
              <br />
              <span>Area Complaints: <b>{area.complaintCount}</b></span>
              <br />
              <p style={{ margin: "4px 0 0", fontSize: "11px" }}>{area.details}</p>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                Coords: {area.lat.toFixed(4)}, {area.lng.toFixed(4)}
              </span>
            </div>
          </Popup>
        </Circle>
      );
    });
  }, [showRisk, showComplaints, onSelect]);

  return (
    <div style={{ height: "100%", width: "100%", minHeight: "420px", borderRadius: "8px", overflow: "hidden" }}>
      <MapContainer
        center={centerPosition}
        zoom={12}
        scrollWheelZoom={true}
        preferCanvas={true}
        style={{ height: "100%", width: "100%", minHeight: "420px" }}
      >
        <MapViewController lat={centerLat} lng={centerLng} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {wardMarkers}
        {isHadapsarSelected && hadapsarAreaMarkers}
      </MapContainer>
    </div>
  );
}