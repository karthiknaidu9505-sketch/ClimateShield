import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Building2, 
  Layers, 
  CheckCircle, 
  Send, 
  Clock, 
  MapPin, 
  ArrowRight,
  Share2,
  Cpu,
  Radio
} from 'lucide-react';
import { RiskMapView } from '../components/map/RiskMapView.js';
import { locationService } from '../services/locationService.js';
import { incidentService } from '../services/incidentService.js';
import { LocationItem } from '../types/index.js';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionStates, setActionStates] = useState({
    act1: false,
    act2: false,
    act3: false
  });
  const [executeStatus, setExecuteStatus] = useState<'idle' | 'executing' | 'success'>('idle');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await locationService.getLocations();
        setLocations(data);
      } catch (err) {
        console.error('Failed to load dashboard locations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExecuteActions = () => {
    setExecuteStatus('executing');
    setTimeout(() => {
      setExecuteStatus('success');
      setTimeout(() => setExecuteStatus('idle'), 3500);
    }, 1000);
  };

  return (
    <div className="p-margin-desktop space-y-space-lg max-w-[1720px] mx-auto w-full">
      {/* 1. Header & Live Operational Ribbon */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl border border-[#e2e8df] shadow-sm">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-secondary">
            <span className="text-[11px] uppercase tracking-widest text-primary font-bold">
              Amalapuram Region Operations Command
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-[11px] text-on-surface-variant font-medium">Telemetry Grid Alpha-09</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Good morning, Operations Team
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Here is the current climate-risk situation across your monitored area. Elevated precipitation detected across eastern drainage sub-basins.
          </p>
        </div>

        {/* Action & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Location Selector */}
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-[#e2e8df] text-on-surface">
            <MapPin className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[9px] text-on-surface-variant uppercase font-bold leading-none">Target Region</span>
              <span className="text-xs font-bold leading-tight">Amalapuram &amp; North Sector</span>
            </div>
          </div>

          {/* Telemetry Status Pill */}
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-lg border border-[#e2e8df]">
            <span className="relative flex h-2 w-2">
              <span className="radar-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary leading-none">Telemetry Live</span>
              <span className="text-[9px] text-on-surface-variant leading-none mt-0.5">Updated 1m ago</span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="hidden sm:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface-variant border border-[#e2e8df]">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-on-surface">Thursday, Oct 24 • 10:45 AM</span>
          </div>

          {/* Quick Export */}
          <button 
            type="button" 
            className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#e2e8df] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Quick Export</span>
          </button>
        </div>
      </header>

      {/* 2. KPI Metric Cards (4 Columns) */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* KPI 1: Overall Risk */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Overall Risk Index</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-tertiary-fixed text-on-tertiary-fixed tracking-wider">
                HIGH
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-headline text-3xl font-bold text-tertiary">72</span>
              <span className="text-xs text-outline font-medium">/ 100</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#e2e8df] flex items-center justify-between">
            <div className="flex items-center gap-1 text-tertiary text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+8% over last 2h</span>
            </div>
            <svg className="w-14 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 64 24">
              <path d="M2 18 L16 16 L28 19 L42 10 L54 13 L62 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-[10px] text-on-surface-variant mt-1">Driven by persistent localized downpours</span>
        </div>

        {/* KPI 2: Critical Zones */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Critical Zones</span>
              <AlertTriangle className="w-4 h-4 text-error" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-error">3</span>
              <span className="text-xs text-on-surface-variant font-medium">sectors critical</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1 truncate">
              Railway Underpass, Market Rd, Canal
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#e2e8df]">
            <div className="inline-flex items-center gap-1.5 bg-error-container text-on-error-container px-2 py-0.5 rounded text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
              <span>2 Zones under active warning</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Active Incidents */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Active Incidents</span>
              <ShieldAlert className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-on-surface">5</span>
              <span className="text-xs text-on-surface-variant font-medium">concurrent logged</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              2 Critical &bull; 2 High &bull; 1 Medium
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#e2e8df] flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
              1 team awaiting dispatch
            </span>
            <span className="text-[10px] text-outline font-mono">Queue #04</span>
          </div>
        </div>

        {/* KPI 4: Vulnerable Assets */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Vulnerable Assets</span>
              <Building2 className="w-4 h-4 text-secondary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-on-surface">18</span>
              <span className="text-xs text-on-surface-variant font-medium">facilities exposed</span>
            </div>
            <div className="mt-1 text-xs text-on-surface-variant">
              <span>4 Hospitals</span> &bull; <span>6 Schools</span> &bull; <span>8 Roads</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#e2e8df]">
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden flex">
              <div className="bg-error h-full" style={{ width: '22%' }} title="Critical (22%)" />
              <div className="bg-tertiary-fixed-dim h-full" style={{ width: '33%' }} title="High (33%)" />
              <div className="bg-secondary-container h-full" style={{ width: '45%' }} title="Moderate (45%)" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Operational Split Layout: GIS Map (65%) & Alert Telemetry (35%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        
        {/* LEFT COLUMN: Live Climate Risk GIS Canvas (8 cols) */}
        <div className="xl:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl border border-[#e2e8df] shadow-sm overflow-hidden">
          <div className="px-space-md py-space-sm bg-surface-container-low border-b border-[#e2e8df] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <div>
                <h2 className="font-headline text-sm font-bold text-on-surface">Live Climate Risk Map</h2>
                <span className="text-[10px] text-on-surface-variant">Amalapuram Basin Topology &bull; Hydraulic Gauges</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/risk-map')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Full View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Embedded Leaflet Map with Markers */}
          <RiskMapView locations={locations} height="520px" />

          {/* GIS Status Footer Bar */}
          <div className="px-space-md py-2 bg-surface-container-low border-t border-[#e2e8df] flex flex-wrap items-center justify-between text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span>Projection: EPSG 3857 (Web Mercator)</span>
              <span>•</span>
              <span>Cell Resolution: 5m²</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>Hydro-Sensor Telemetry Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Priority Alerts & Recommended Actions (4 cols) */}
        <div className="xl:col-span-4 flex flex-col space-y-space-md">
          
          {/* Priority Alerts Card */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8df]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-error" />
                <h2 className="font-headline text-sm font-bold text-on-surface">Priority Alerts</h2>
              </div>
              <span className="px-2 py-0.5 bg-error-container text-on-error-container text-[10px] font-bold rounded">
                3 ACTIVE
              </span>
            </div>

            {/* Alert 1: Railway Underpass (Critical) */}
            <div className="p-3 bg-error-container/25 hover:bg-error-container/35 rounded-lg border-l-4 border-l-error transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-error text-on-error rounded text-[9px] font-bold uppercase">Critical</span>
                  <h4 className="text-xs font-bold text-on-surface">Railway Underpass</h4>
                </div>
                <span className="text-[10px] text-on-surface-variant shrink-0">2 min ago</span>
              </div>
              <p className="text-xs text-on-surface mt-1.5 leading-snug">
                Flood risk has reached critical level (<strong className="text-error font-bold">87/100</strong>). Water level at 42 cm and rising rapidly. Submersible bypass offline.
              </p>
              <div className="mt-2 flex items-center justify-between pt-1 border-t border-error/15">
                <span className="text-[10px] text-error font-bold">Breach Imminent (42cm)</span>
                <button
                  type="button"
                  onClick={() => navigate('/risk/loc-railway-underpass')}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Dispatch Crew</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Alert 2: Market Road (High) */}
            <div className="p-3 bg-surface-container-low hover:bg-surface-container rounded-lg border-l-4 border-l-tertiary transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed rounded text-[9px] font-bold uppercase">High</span>
                  <h4 className="text-xs font-bold text-on-surface">Market Road</h4>
                </div>
                <span className="text-[10px] text-on-surface-variant shrink-0">12 min ago</span>
              </div>
              <p className="text-xs text-on-surface mt-1.5 leading-snug">
                Waterlogging risk increasing. Drainage capacity reached <strong className="text-tertiary">82%</strong> threshold. Traffic redirection recommended.
              </p>
              <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#e2e8df]">
                <span className="text-[10px] text-on-surface-variant">Zone: Commercial</span>
                <button
                  type="button"
                  onClick={() => navigate('/risk/loc-market-road')}
                  className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
                >
                  <span>View Telemetry</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Alert 3: University Campus (Medium) */}
            <div className="p-3 bg-surface-container-low hover:bg-surface-container rounded-lg border-l-4 border-l-tertiary-fixed-dim transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-surface-container-high text-on-surface rounded text-[9px] font-bold uppercase">Medium</span>
                  <h4 className="text-xs font-bold text-on-surface">University Campus</h4>
                </div>
                <span className="text-[10px] text-on-surface-variant shrink-0">26 min ago</span>
              </div>
              <p className="text-xs text-on-surface mt-1.5 leading-snug">
                Heat exposure &amp; localized storm drain backlog elevated. Minor detention pool overflow on South Quad lawn.
              </p>
              <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#e2e8df]">
                <span className="text-[10px] text-on-surface-variant">Zone: Institutional</span>
                <span className="text-[10px] text-primary font-bold">Auto-monitoring</span>
              </div>
            </div>
          </div>

          {/* Recommended Actions Card */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8df]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <h2 className="font-headline text-sm font-bold text-on-surface">Recommended Actions</h2>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">Mitigation Engine</span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
              <label className="p-2.5 bg-surface-container-low rounded-lg border border-[#e2e8df] flex items-start gap-2.5 cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={actionStates.act1}
                  onChange={(e) => setActionStates(prev => ({ ...prev, act1: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded accent-primary text-white cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">Inspect drainage at Railway Underpass</span>
                    <span className="px-1.5 py-0.5 bg-error-container text-on-error-container text-[9px] font-bold rounded uppercase">Urgent</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant block mt-0.5">Field Unit 4 &bull; ETA: 8 mins</span>
                </div>
              </label>

              <label className="p-2.5 bg-surface-container-low rounded-lg border border-[#e2e8df] flex items-start gap-2.5 cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={actionStates.act2}
                  onChange={(e) => setActionStates(prev => ({ ...prev, act2: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded accent-primary text-white cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">Notify municipal team &amp; dispatch pumps</span>
                    <span className="px-1.5 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[9px] font-bold rounded uppercase">High Priority</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant block mt-0.5">Target: Mobile Station Gamma &bull; 1200L/m</span>
                </div>
              </label>

              <label className="p-2.5 bg-surface-container-low rounded-lg border border-[#e2e8df] flex items-start gap-2.5 cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={actionStates.act3}
                  onChange={(e) => setActionStates(prev => ({ ...prev, act3: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded accent-primary text-white cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">Monitor water level threshold at Culvert 9</span>
                    <span className="px-1.5 py-0.5 bg-surface-container-high text-on-surface text-[9px] font-bold rounded uppercase">Continuous</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant block mt-0.5">Sensor Telemetry: Automated ping every 60s</span>
                </div>
              </label>
            </div>

            {/* Execute Button */}
            <button
              type="button"
              onClick={handleExecuteActions}
              disabled={executeStatus === 'executing'}
              className="w-full bg-primary hover:bg-primary-container text-on-primary py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {executeStatus === 'executing' ? (
                <span>Transmitting Directives...</span>
              ) : executeStatus === 'success' ? (
                <span className="flex items-center gap-1 text-primary-fixed-dim">
                  <CheckCircle className="w-4 h-4" />
                  <span>Actions Dispatched to Field!</span>
                </span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Selected Actions</span>
                </>
              )}
            </button>
          </div>

          {/* Operational Pipeline Banner */}
          <div className="bg-surface-container-low p-3 rounded-xl border border-[#e2e8df] text-on-surface">
            <div className="flex items-center justify-between text-[10px] text-outline mb-1 uppercase tracking-wider font-bold">
              <span>Operational Pipeline</span>
              <span className="text-primary font-bold">Active Cycle</span>
            </div>
            <div className="flex items-center justify-between gap-1 text-[11px] font-semibold">
              <span className="text-primary">Env Data</span>
              <span className="text-outline-variant">&rarr;</span>
              <span className="text-primary">Risk Assess</span>
              <span className="text-outline-variant">&rarr;</span>
              <span className="text-tertiary">Vulnerable Assets</span>
              <span className="text-outline-variant">&rarr;</span>
              <span className="text-on-surface">Dispatch</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Monitored Ground Telemetry Nodes Strip (Fix 4: Live Telemetry from /api/locations) */}
      <section aria-label="Field Telemetry Status" className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#e2e8df]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            <h3 className="font-headline text-sm font-bold text-on-surface">Monitored Ground Telemetry Nodes</h3>
            <span className="text-xs text-on-surface-variant font-medium">
              ({locations.length} Locations Monitored • Open-Meteo Synced)
            </span>
          </div>
          <span className="text-xs font-bold text-primary">Hydrology Network Synchronized</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          {locations.length > 0 ? (
            locations.slice(0, 4).map((loc) => {
              const env = loc.environmental;
              const levelColor =
                loc.riskLevel === 'CRITICAL' ? 'text-error' :
                loc.riskLevel === 'HIGH' ? 'text-tertiary' :
                loc.riskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-primary';

              return (
                <div
                  key={loc.id}
                  onClick={() => navigate(`/risk/${loc.id}`)}
                  className="bg-surface-container-low p-2.5 rounded-lg border border-[#e2e8df] hover:border-primary/40 transition-colors cursor-pointer"
                  title={`View risk telemetry for ${loc.name}`}
                >
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block truncate">
                    {loc.name}
                  </span>
                  <span className={`font-headline font-bold text-sm ${levelColor} block truncate`}>
                    {env?.waterLevelCm !== undefined ? `${env.waterLevelCm} cm (${loc.riskLevel})` : 'No live reading'}
                  </span>
                  <span className="text-[10px] text-on-surface-variant block mt-0.5 truncate">
                    {env?.rainfallMm !== undefined
                      ? `Rain: ${env.rainfallMm}mm • ${env.riseRate || env.waterLevelTrend || 'Nominal'}`
                      : 'No live reading'}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 sm:col-span-4 text-center py-3 text-xs text-on-surface-variant">
              No live monitored telemetry nodes currently available
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
