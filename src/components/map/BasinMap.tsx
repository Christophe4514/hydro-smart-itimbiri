"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { LEVEL_COLOR } from "@/lib/status";
import type { StationSummary } from "@/lib/types";

const BASIN_CENTER: [number, number] = [2.4, 23.5];

function FlyToSelected({ station }: { station: StationSummary | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (station) map.flyTo([station.lat, station.lon], Math.max(map.getZoom(), 8), { duration: 0.6 });
  }, [station, map]);
  return null;
}

export function BasinMap({
  stations,
  selectedId,
  onSelect,
}: {
  stations: StationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const selected = stations.find((s) => s.id === selectedId);

  return (
    <MapContainer center={BASIN_CENTER} zoom={7} className="h-full w-full" style={{ background: "#0a0e1a" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        className="map-dark-tiles"
      />
      {stations.map((s) => (
        <CircleMarker
          key={s.id}
          center={[s.lat, s.lon]}
          radius={s.id === selectedId ? 9 : 6}
          pathOptions={{
            color: LEVEL_COLOR[s.current.level],
            fillColor: LEVEL_COLOR[s.current.level],
            fillOpacity: 0.85,
            weight: s.id === selectedId ? 3 : 1.5,
          }}
          eventHandlers={{ click: () => onSelect(s.id) }}
        >
          <Popup>
            <div className="text-xs">
              <div className="font-semibold">
                {s.id} — {s.name}
              </div>
              <div>Statut : {s.current.level}</div>
              <div>Pluie du mois : {s.current.precipMm.toFixed(0)} mm</div>
              {s.approx && <div className="italic text-gray-500">Position indicative</div>}
            </div>
          </Popup>
        </CircleMarker>
      ))}
      <FlyToSelected station={selected} />
    </MapContainer>
  );
}
