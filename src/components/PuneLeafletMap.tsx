import React from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { predict, type RiskLevel } from "@/lib/prediction";
import type { Props } from "./PuneMap";

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

const RISK_HEX: Record<RiskLevel, string> = {
  low: "#22c55e",
  moderate: "#facc15",
  high: "#f97316",
  severe: "#ef4444",
};

export default function PuneLeafletMap({
  wards,
  selected,
  onSelect,
  horizon,
  weather,
  showComplaints,
  showRisk,
}: Props) {
  return (
    <MapContainer center={[18.5204, 73.8567]} zoom={12} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {wards?.map((ward) => {
        const lat = ward.lat;
        const lng = ward.lon ?? (ward as any).lng ?? 73.8567;
        const prediction = predict(ward, horizon, weather?.wards?.[ward.id] ?? null);
        const active = ward.id === selected;
        const color = RISK_HEX[prediction.level];
        const complaintCount = (ward.drainComplaints || 0) + (ward.sewageComplaints || 0);
        const radius = 600 + Math.min(1400, (ward.drainComplaints || 0) * 26);
        const markerIcon = L.divIcon({
          className: "ward-risk-marker",
          html: `<div style="display:grid;width:${active ? 32 : 26}px;height:${active ? 32 : 26}px;place-items:center;border:${active ? 3 : 1.5}px solid ${active ? "#ffffff" : "#0f172a"};border-radius:50%;background:${color};color:#ffffff;font:700 11px/1 ui-sans-serif,system-ui,sans-serif;box-shadow:0 1px 4px #0f172a66">${showComplaints ? complaintCount : ""}</div>`,
          iconSize: [active ? 32 : 26, active ? 32 : 26],
          iconAnchor: [active ? 16 : 13, active ? 16 : 13],
        });

        return (
          <React.Fragment key={ward.id}>
            {showRisk && (
              <Circle
                center={[lat, lng]}
                radius={radius}
                pathOptions={{
                  color,
                  opacity: active ? 1 : 0.65,
                  weight: active ? 3 : 1.5,
                  fillColor: color,
                  fillOpacity: active ? 0.45 : 0.25,
                }}
                eventHandlers={{ click: () => onSelect(ward.id) }}
              />
            )}
            <Marker
              position={[lat, lng]}
              icon={markerIcon}
              title={`${ward.name} — ${prediction.diseases[0]?.disease ?? "Risk"} ${prediction.diseases[0]?.probability ?? 0}%`}
              eventHandlers={{ click: () => onSelect(ward.id) }}
            >
              <Popup>
                <strong>{ward.name}</strong>
                <div>Risk: {prediction.level}</div>
                <div>
                  {prediction.diseases[0]?.disease ?? "No predicted disease"}
                  {prediction.diseases[0] ? ` · ${prediction.diseases[0].probability}%` : ""}
                </div>
                <div>Open complaints: {complaintCount}</div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}
