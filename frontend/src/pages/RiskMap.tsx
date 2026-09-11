import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Layers, 
  ArrowRight, 
  AlertTriangle, 
  Filter, 
  Radio, 
  Umbrella, 
  Download,
  Building,
  CheckSquare
} from 'lucide-react';
import { RiskMapView } from '../components/map/RiskMapView.js';
import { locationService } from '../services/locationService.js';
import { LocationItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export const RiskMap: React.FC = () => {
  const navigate = useNavigate();
  const { user, primaryJurisdiction } = useAuth();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [hazardDomain, setHazardDomain] = useState<string>('FLOODING');
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(
    () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }) + ' UTC'
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await locationService.getLocations();
        setLocations(data);
        const defaultLoc = data && data.length > 0 ? (data.find(l => l.name.toLowerCase().includes('railway')) || data[0]) : null;
        if (defaultLoc) setSelectedLocation(defaultLoc);
      } catch (err) {
        console.error('Failed to load locations for Risk Map:', err);
      }
    }
    loadData();
  }, [user?.id, primaryJurisdiction]);

  const filteredLocations = locations.filter(loc => {
    if (severityFilter === 'ALL') return true;
    return loc.riskLevel === severityFilter;
  });

  const avgRainfall = locations.length
    ? (locations.reduce((acc, loc) => acc + (loc.environmental?.rainfallMm || 0), 0) / locations.length).toFixed(1)
    : '0.0';

  return (
    <div className="flex flex-col w-full h-[calc(100vh-4rem)]">
      {/* 1. Top Context Header Bar */}
      <section className="w-full bg-surface-container-lowest border-b border-[#e2e8df] px-margin-desktop py-3 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 shadow-sm z-10 shrink-0">
        <div className="flex flex-col gap-0.5 max-w-2xl">
          <div className="flex items-center gap-2 text-primary text-[10px] uppercase font-bold tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Geospatial Climate Risk Engine</span>
            <span className="text-outline">•</span>
            <span className="text-on-surface-variant font-medium">EPSG:3857 Hydro-Cadastral Proj</span>
          </div>
          <h1 className="font-headline text-xl font-bold text-on-surface tracking-tight leading-tight">
            Climate Risk Map
          </h1>
          <p className="text-xs text-on-surface-variant line-clamp-1">
            Monitor localized climate risk, weather ingestion (Open-Meteo), and modeled inundation estimates across municipal infrastructure.
          </p>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* District Select */}
          <div className="bg-surface-container-low rounded border border-[#e2e8df] px-3 py-1.5 flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-primary" />
            <div className="flex flex-col">
              <span className="text-[9px] text-outline uppercase font-bold leading-none">Municipal District</span>
              <span className="text-xs font-bold text-on-surface leading-tight">
                {primaryJurisdiction ? primaryJurisdiction.replace(' Operations Command', '') : 'Monitored District'} &bull; Active Corridor
              </span>
            </div>
          </div>

          {/* Live Weather Feed (Open-Meteo) */}
          <div className="bg-surface-container-low rounded border border-[#e2e8df] px-3 py-1.5 flex items-center gap-2" title="Weather data ingested via backend Open-Meteo integration">
            <div className="flex items-center gap-1.5 bg-primary-container/20 px-2 py-0.5 rounded text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-wider">LIVE WEATHER FEED</span>
            </div>
            <span className="text-xs font-mono font-medium text-on-surface">{currentTime}</span>
          </div>

          {/* Toggle Filter Tray */}
          <button
            type="button"
            onClick={() => setFilterPanelOpen(prev => !prev)}
            className="bg-surface-container-high hover:bg-secondary-container text-on-surface px-3 py-1.5 rounded flex items-center gap-1.5 text-xs font-semibold border border-[#e2e8df] transition-colors shadow-sm"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters ({severityFilter})</span>
          </button>

          {/* Export Report */}
          <button
            type="button"
            className="bg-primary hover:bg-primary-container text-on-primary px-3 py-1.5 rounded flex items-center gap-1.5 text-xs font-bold transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </section>

      {/* 2. Map Container with Floating Overlays */}
      <div className="relative flex-1 w-full bg-surface-container overflow-hidden">
        
        {/* The Real Interactive Leaflet Map */}
        <RiskMapView
          locations={filteredLocations}
          height="100%"
          selectedLocationId={selectedLocation?.id}
          onSelectLocation={(loc) => setSelectedLocation(loc)}
        />

        {/* Floating Filter Card (Top Left) */}
        {filterPanelOpen && (
          <div className="absolute top-4 left-4 z-[1000] w-72 bg-surface-container-lowest/95 backdrop-blur-md rounded-lg border border-[#e2e8df] shadow-xl p-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8df] mb-2.5">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Hazard Filters</span>
              <button
                type="button"
                onClick={() => setFilterPanelOpen(false)}
                className="text-xs text-on-surface-variant hover:text-on-surface"
              >
                &times;
              </button>
            </div>

            {/* Hazard Selector */}
            <div className="mb-3">
              <label className="text-[10px] uppercase font-bold text-outline block mb-1">Hazard Domain</label>
              <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded border border-[#e2e8df]">
                {['FLOODING', 'HEAT', 'AIR'].map(domain => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => setHazardDomain(domain)}
                    className={`py-1 text-[10px] font-bold rounded transition-all ${
                      hazardDomain === domain
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {domain === 'FLOODING' ? 'Flooding' : domain === 'HEAT' ? 'Heat' : 'Air'}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Filter Buttons */}
            <div className="mb-3">
              <label className="text-[10px] uppercase font-bold text-outline block mb-1">Severity Level</label>
              <div className="flex items-center gap-1 flex-wrap">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverityFilter(level)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                      severityFilter === level
                        ? level === 'CRITICAL'
                          ? 'bg-error text-on-error shadow-sm'
                          : 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset Infrastructure Checkboxes */}
            <div>
              <label className="text-[10px] uppercase font-bold text-outline block mb-1">Asset Types</label>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-on-surface">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary rounded" />
                  <span>Critical Roads</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary rounded" />
                  <span>Hospitals</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary rounded" />
                  <span>Commercial</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary rounded" />
                  <span>Schools</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Floating Target Hotspot Card (Bottom Left - Focus on Selected Location) */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 z-[1000] w-80 sm:w-96 bg-surface-container-lowest/95 backdrop-blur-md rounded-xl border border-[#e2e8df] shadow-2xl p-4">
            {/* Card Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-1.5 text-error text-[10px] uppercase font-bold tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Hotspot Selected</span>
                </div>
                <h3 className="font-headline font-bold text-base text-on-surface uppercase tracking-tight mt-0.5">
                  {selectedLocation.name}
                </h3>
              </div>
              <div className={`px-2 py-1 rounded text-right shrink-0 ${
                selectedLocation.riskLevel === 'CRITICAL' ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed'
              }`}>
                <span className="text-[9px] font-bold tracking-wider uppercase block">{selectedLocation.riskLevel} RISK</span>
                <span className="font-headline text-base font-bold leading-none">{selectedLocation.riskScore} / 100</span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-1.5 my-2.5">
              <div className="bg-surface-container-low p-2 rounded border border-[#e2e8df] text-center">
                <span className="text-[9px] text-outline uppercase font-bold block" title="Source: Open-Meteo">Rainfall</span>
                <span className="font-headline font-bold text-xs text-on-surface">
                  {selectedLocation.environmental?.rainfallMm ?? 0} mm/h
                </span>
                <span className={`text-[9px] font-bold block mt-0.5 ${(selectedLocation.environmental?.rainfallMm || 0) >= 15 ? 'text-error' : (selectedLocation.environmental?.rainfallMm || 0) > 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {(selectedLocation.environmental?.rainfallMm || 0) >= 15 ? 'Heavy' : (selectedLocation.environmental?.rainfallMm || 0) >= 2 ? 'Moderate' : (selectedLocation.environmental?.rainfallMm || 0) > 0 ? 'Light' : 'Clear'}
                </span>
              </div>
              <div className="bg-surface-container-low p-2 rounded border border-[#e2e8df] text-center">
                <span className="text-[9px] text-outline uppercase font-bold block" title="Modeled hydrological estimate">Modeled Depth</span>
                <span className={`font-headline font-bold text-xs ${(selectedLocation.environmental?.waterLevelCm || 0) >= 35 ? 'text-error' : 'text-on-surface'}`}>
                  {selectedLocation.environmental?.waterLevelCm ?? 0} cm
                </span>
                <span className="text-[9px] text-on-surface-variant font-medium block mt-0.5">
                  {selectedLocation.environmental?.riseRate ? selectedLocation.environmental.riseRate : (selectedLocation.environmental?.waterLevelTrend || 'Stable')}
                </span>
              </div>
              <div className="bg-surface-container-low p-2 rounded border border-[#e2e8df] text-center">
                <span className="text-[9px] text-outline uppercase font-bold block">Drainage</span>
                <span className="font-headline font-bold text-xs text-on-surface">
                  {selectedLocation.drainageCondition}
                </span>
                <span className="text-[9px] text-tertiary font-medium block mt-0.5">
                  {selectedLocation.environmental?.drainageFlowPct !== undefined ? `${selectedLocation.environmental.drainageFlowPct}% capacity` : 'Modeled Sump'}
                </span>
              </div>
            </div>

            {/* Context Notice */}
            <p className="text-xs text-on-surface-variant mb-3 line-clamp-2 leading-relaxed">
              {selectedLocation.description}
            </p>

            {/* Action CTA Button */}
            <button
              type="button"
              onClick={() => navigate(`/risk/${selectedLocation.id}`)}
              className="w-full bg-error hover:bg-[#b91c1c] text-white py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <span>Inspect Risk Factors &amp; Workflow Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom-Right Map Legend & Telemetry Bar */}
        <div className="absolute bottom-4 right-4 z-[1000] max-w-xs bg-surface-container-lowest/95 backdrop-blur-md rounded-xl border border-[#e2e8df] shadow-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between bg-surface-container-low px-2.5 py-1.5 rounded border border-[#e2e8df]">
            <div className="flex items-center gap-1.5">
              <Umbrella className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-bold text-on-surface">Weather Feed (Open-Meteo)</span>
            </div>
            <span className="text-[11px] text-primary font-bold">{avgRainfall} mm avg</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-outline">
              <span>Threat Spectrum</span>
              <span>Index Scale</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden flex shadow-inner">
              <div className="h-full w-1/4 bg-[#006a3b]" title="Safe (0-30)" />
              <div className="h-full w-1/4 bg-[#f59e0b]" title="Medium (31-55)" />
              <div className="h-full w-1/4 bg-[#ea580c]" title="High (56-75)" />
              <div className="h-full w-1/4 bg-[#dc2626]" title="Critical (76-100)" />
            </div>
            <div className="flex justify-between text-[10px] text-on-surface-variant font-medium">
              <span className="text-primary font-bold">Low (0-30)</span>
              <span className="text-tertiary">Med (31-55)</span>
              <span className="text-[#ea580c]">High (56-75)</span>
              <span className="text-error font-bold">Crit (76-100)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
