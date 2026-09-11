import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocationItem } from '../../types/index.js';
import { ArrowRight, Waves, CloudRain, AlertOctagon, Layers, Radio } from 'lucide-react';

// Create custom SVG Leaflet marker icons matching Stitch telemetry style
const createCustomIcon = (riskLevel: string, score: number) => {
  let bgColor = '#10b981'; // Green
  let pulseClass = '';

  if (riskLevel === 'CRITICAL') {
    bgColor = '#dc2626'; // Red
    pulseClass = 'animate-ping opacity-75';
  } else if (riskLevel === 'HIGH') {
    bgColor = '#ea580c'; // Orange
  } else if (riskLevel === 'MEDIUM') {
    bgColor = '#f59e0b'; // Yellow
  }

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
      ${riskLevel === 'CRITICAL' ? `<span style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background-color: ${bgColor};" class="${pulseClass}"></span>` : ''}
      <div style="position: relative; width: 26px; height: 26px; border-radius: 9999px; background-color: ${bgColor}; color: white; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.25);">
        ${score}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
};

// Recenter/fit map whenever locations update
function MapRecenter({ center, locations }: { center: [number, number]; locations: LocationItem[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (locations && locations.length > 0) {
      if (locations.length === 1) {
        map.setView([locations[0].latitude, locations[0].longitude], 14);
      } else {
        const bounds = L.latLngBounds(locations.map(l => [l.latitude, l.longitude]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    } else {
      map.setView(center, 13);
    }
  }, [locations, center, map]);
  return null;
}

interface RiskMapViewProps {
  locations: LocationItem[];
  height?: string;
  selectedLocationId?: string;
  onSelectLocation?: (loc: LocationItem) => void;
  showRadarOverlay?: boolean;
}

export const RiskMapView: React.FC<RiskMapViewProps> = ({
  locations,
  height = '600px',
  selectedLocationId,
  onSelectLocation,
  showRadarOverlay = true
}) => {
  const navigate = useNavigate();
  const [mapError, setMapError] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    radar: true,
    drainage: true,
    routes: true
  });

  // Dynamically calculate center coordinate from authorized locations (fallback: 16.58, 82.005)
  const centerLat = locations.length > 0
    ? locations.reduce((sum, l) => sum + l.latitude, 0) / locations.length
    : 16.58;
  const centerLng = locations.length > 0
    ? locations.reduce((sum, l) => sum + l.longitude, 0) / locations.length
    : 82.005;

  if (mapError) {
    return (
      <div 
        style={{ height }}
        className="w-full bg-surface-container-low rounded-xl border border-[#e2e8df] flex flex-col items-center justify-center p-space-lg text-center"
      >
        <AlertOctagon className="w-12 h-12 text-tertiary mb-space-sm" />
        <h3 className="font-headline text-lg font-bold text-on-surface">Geospatial Basemap Fallback Active</h3>
        <p className="text-sm text-on-surface-variant max-w-md mt-1 mb-space-md">
          External map cartographic tiles are currently operating in offline supervisory mode. Location risk assessments remain active.
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => navigate(`/risk/${loc.id}`)}
              className="p-3 bg-surface-container-lowest rounded-lg border border-[#e2e8df] text-left hover:border-primary transition-all"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-on-surface">{loc.name}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${loc.riskLevel === 'CRITICAL' ? 'bg-error text-on-error' : 'bg-surface-container-high'}`}>
                  {loc.riskScore}
                </span>
              </div>
              <span className="text-xs text-on-surface-variant mt-1 block">Rain: {loc.environmental?.rainfallMm}mm • Water: {loc.environmental?.waterLevelCm}cm</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[#e2e8df] shadow-sm select-none" style={{ height }}>
      {/* Tactical Map Header Layer Toggles */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-surface-container-lowest/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#e2e8df] shadow-md">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary mr-1">
          <Layers className="w-3.5 h-3.5" />
          <span>GIS LAYERS:</span>
        </div>
        <button
          type="button"
          onClick={() => setActiveLayers(prev => ({ ...prev, radar: !prev.radar }))}
          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
            activeLayers.radar ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          Rainfall Radar
        </button>
        <button
          type="button"
          onClick={() => setActiveLayers(prev => ({ ...prev, drainage: !prev.drainage }))}
          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
            activeLayers.drainage ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          Drainage Basins
        </button>
      </div>

      {/* Radar Animation Overlay */}
      {activeLayers.radar && (
        <div className="absolute inset-0 pointer-events-none z-[998] overflow-hidden opacity-30">
          <div className="radar-sweep absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-primary/20 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,106,59,0.35)_0deg,transparent_65deg,transparent_360deg)]" />
        </div>
      )}

      {/* Actual Interactive Leaflet Map */}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapRecenter center={[centerLat, centerLng]} locations={locations} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hazard Exclusion / Inundation Circles */}
        {activeLayers.drainage && locations.map(loc => {
          let fillColor = '#10b981';
          if (loc.riskLevel === 'CRITICAL') fillColor = '#dc2626';
          else if (loc.riskLevel === 'HIGH') fillColor = '#ea580c';
          else if (loc.riskLevel === 'MEDIUM') fillColor = '#f59e0b';

          return (
            <Circle
              key={`circle-${loc.id}`}
              center={[loc.latitude, loc.longitude]}
              radius={loc.riskLevel === 'CRITICAL' ? 350 : 200}
              pathOptions={{
                color: fillColor,
                fillColor: fillColor,
                fillOpacity: loc.riskLevel === 'CRITICAL' ? 0.22 : 0.12,
                weight: 1.5,
                dashArray: loc.riskLevel === 'CRITICAL' ? '4, 4' : undefined
              }}
            />
          );
        })}

        {/* Markers for each Predefined Location */}
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={createCustomIcon(loc.riskLevel, loc.riskScore)}
            eventHandlers={{
              click: () => {
                if (onSelectLocation) onSelectLocation(loc);
              }
            }}
          >
            <Popup className="climateshield-popup">
              <div className="p-1 min-w-[240px]">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#e2e8df]">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    loc.riskLevel === 'CRITICAL' 
                      ? 'bg-error-container text-on-error-container' 
                      : loc.riskLevel === 'HIGH' 
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : 'bg-surface-container-high text-on-surface'
                  }`}>
                    {loc.riskLevel} RISK: {loc.riskScore}/100
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono">{loc.assetType}</span>
                </div>

                <h4 className="font-headline font-bold text-sm text-on-surface mt-2 mb-1.5">
                  {loc.name}
                </h4>

                <div className="grid grid-cols-2 gap-1.5 bg-surface-container-low p-2 rounded mb-2 text-center text-xs">
                  <div>
                    <span className="block text-[10px] uppercase text-on-surface-variant font-medium" title="Weather Source: Open-Meteo">Rain (Open-Meteo)</span>
                    <span className="font-bold text-on-surface">{loc.environmental?.rainfallMm ?? 0} mm/h</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-on-surface-variant font-medium" title="Modeled hydrological estimate">Modeled Depth</span>
                    <span className={`font-bold ${(loc.environmental?.waterLevelCm || 0) >= 35 ? 'text-error' : 'text-on-surface'}`}>
                      {loc.environmental?.waterLevelCm ?? 0} cm
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/risk/${loc.id}`)}
                  className="w-full bg-primary hover:bg-primary-container text-on-primary py-1.5 px-3 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>View Risk Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Map Severity Scale Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-surface-container-lowest/95 backdrop-blur-md p-2.5 rounded-lg border border-[#e2e8df] shadow-md text-xs">
        <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1.5">
          Risk Assessment Severity Scale
        </span>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Low</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim" /> Med</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-tertiary" /> High</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-error" /> Critical</div>
        </div>
      </div>
    </div>
  );
};
