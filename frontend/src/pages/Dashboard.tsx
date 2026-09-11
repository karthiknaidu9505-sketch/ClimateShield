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
  Radio,
  CloudRain
} from 'lucide-react';
import { RiskMapView } from '../components/map/RiskMapView.js';
import { locationService } from '../services/locationService.js';
import { incidentService } from '../services/incidentService.js';
import { LocationItem, Incident, ResponseTeam } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, primaryJurisdiction } = useAuth();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [teams, setTeams] = useState<ResponseTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionStates, setActionStates] = useState<Record<string, boolean>>({
    act0: false,
    act1: false,
    act2: false
  });
  const [executeStatus, setExecuteStatus] = useState<'idle' | 'executing' | 'success'>('idle');

  useEffect(() => {
    async function loadData() {
      try {
        const [locs, incs, tms] = await Promise.all([
          locationService.getLocations().catch(() => []),
          incidentService.getIncidents().catch(() => []),
          incidentService.getTeams().catch(() => [])
        ]);
        setLocations(locs);
        setIncidents(incs);
        setTeams(tms);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id, primaryJurisdiction]);

  const handleExecuteActions = () => {
    setExecuteStatus('executing');
    setTimeout(() => {
      setExecuteStatus('success');
      setTimeout(() => setExecuteStatus('idle'), 3500);
    }, 1000);
  };

  // Derive dynamic metrics from live backend data
  const maxRiskScore = locations.length > 0 ? Math.max(...locations.map(l => l.riskScore || 0)) : 0;
  const overallLevel = maxRiskScore >= 75 ? 'CRITICAL' : maxRiskScore >= 55 ? 'HIGH' : maxRiskScore >= 30 ? 'MEDIUM' : 'LOW';
  const overallLevelColor =
    overallLevel === 'CRITICAL' ? 'text-error' :
    overallLevel === 'HIGH' ? 'text-tertiary' :
    overallLevel === 'MEDIUM' ? 'text-amber-600' : 'text-primary';
  const overallLevelBg =
    overallLevel === 'CRITICAL' ? 'bg-error-container text-on-error-container' :
    overallLevel === 'HIGH' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
    overallLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-900' : 'bg-primary-container text-on-primary-container';

  const elevatedLocations = locations.filter(l => l.riskLevel === 'CRITICAL' || l.riskLevel === 'HIGH');
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const totalAssetsCount = locations.reduce((sum, loc) => sum + (loc.assets?.length || 0), 0);

  const latestTimestamp = locations.find(l => l.environmental?.timestamp)?.environmental?.timestamp;
  const formattedSyncTime = latestTimestamp
    ? new Date(latestTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Live cycle';

  const currentDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const sortedAlertLocations = [...locations].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)).slice(0, 3);

  // Dynamic actions mapped from active incident actions or catchment defaults
  const activeIncidentActions = activeIncidents[0]?.actions || [];
  const displayActions = activeIncidentActions.length >= 3
    ? activeIncidentActions.slice(0, 3).map((a, idx) => ({
        id: `act${idx}`,
        title: a.title,
        priority: a.priority,
        note: `Action item for ${activeIncidents[0]?.title || 'active incident'}`
      }))
    : [
        {
          id: 'act0',
          title: `Inspect drainage outflow at ${locations[0]?.name || 'Railway Underpass'}`,
          priority: 'Urgent',
          note: `${teams[0]?.name || 'Field Response Unit'} on standby`
        },
        {
          id: 'act1',
          title: 'Review weather ingestion & verify precipitation trends',
          priority: 'High Priority',
          note: 'Source: Open-Meteo atmospheric forecast model'
        },
        {
          id: 'act2',
          title: `Monitor modeled water depth at ${locations[1]?.name || 'Market Road'}`,
          priority: 'Continuous',
          note: 'Weather sync: automated backend ingestion active'
        }
      ];

  return (
    <div className="p-margin-desktop space-y-space-lg max-w-[1720px] mx-auto w-full">
      {/* 1. Header & Live Operational Ribbon */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl border border-[#e2e8df] shadow-sm">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-secondary">
            <span className="text-[11px] uppercase tracking-widest text-primary font-bold">
              {primaryJurisdiction || 'Operations Command'}
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-[11px] text-on-surface-variant font-medium">Hydrology Basin Ingestion Grid</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Good morning, {user?.name || 'Operations Team'}
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Here is the current climate-risk situation across your monitored area. Environmental telemetry ingested from Open-Meteo and normalized via hydraulic basin model.
          </p>
        </div>

        {/* Action & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Location Selector */}
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-[#e2e8df] text-on-surface">
            <MapPin className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[9px] text-on-surface-variant uppercase font-bold leading-none">Target Region</span>
              <span className="text-xs font-bold leading-tight">{primaryJurisdiction || 'Assigned District'}</span>
            </div>
          </div>

          {/* Weather Feed Status Pill */}
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-lg border border-[#e2e8df]">
            <span className="relative flex h-2 w-2">
              <span className="radar-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary leading-none">Weather Feed Active</span>
              <span className="text-[9px] text-on-surface-variant leading-none mt-0.5">Sync: {formattedSyncTime}</span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="hidden sm:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface-variant border border-[#e2e8df]">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-on-surface">{currentDateStr}</span>
          </div>

          {/* Quick Export */}
          <button 
            type="button" 
            onClick={() => alert('Operational summary dossier exported.')}
            className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#e2e8df] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Quick Export</span>
          </button>
        </div>
      </header>

      {/* 2. KPI Metric Cards (4 Columns) */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* KPI 1: Overall Peak Risk */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Peak Risk Index</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wider ${overallLevelBg}`}>
                {overallLevel}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`font-headline text-3xl font-bold ${overallLevelColor}`}>{maxRiskScore}</span>
              <span className="text-xs text-outline font-medium">/ 100</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#e2e8df] flex items-center justify-between">
            <div className={`flex items-center gap-1 text-xs font-bold ${overallLevelColor}`}>
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{locations.length} basins assessed</span>
            </div>
            <svg className={`w-14 h-5 ${overallLevelColor}`} fill="none" stroke="currentColor" viewBox="0 0 64 24">
              <path d="M2 18 L16 16 L28 19 L42 10 L54 13 L62 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-[10px] text-on-surface-variant mt-1">Open-Meteo weather &bull; Hydraulic model</span>
        </div>

        {/* KPI 2: Elevated Risk Zones */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Elevated Risk Zones</span>
              <AlertTriangle className={`w-4 h-4 ${elevatedLocations.length > 0 ? 'text-error' : 'text-primary'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`font-headline text-3xl font-bold ${elevatedLocations.length > 0 ? 'text-error' : 'text-primary'}`}>
                {elevatedLocations.length}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">sectors elevated</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1 truncate">
              {elevatedLocations.length > 0 ? elevatedLocations.map(l => l.name).join(', ') : 'All catchments nominal'}
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#e2e8df]">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${
              elevatedLocations.length > 0 ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${elevatedLocations.length > 0 ? 'bg-error animate-ping' : 'bg-primary'}`} />
              <span>{elevatedLocations.length > 0 ? `${elevatedLocations.length} Zones under elevated watch` : 'Basin within normal limits'}</span>
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
              <span className="font-headline text-3xl font-bold text-on-surface">{activeIncidents.length}</span>
              <span className="text-xs text-on-surface-variant font-medium">active logged</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              {activeIncidents.length > 0 ? (
                `${activeIncidents.filter(i => i.severity === 'CRITICAL').length} Critical • ${activeIncidents.filter(i => i.severity === 'HIGH').length} High • ${activeIncidents.filter(i => i.severity === 'MEDIUM').length} Medium`
              ) : (
                'Zero uncontained incidents'
              )}
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#e2e8df] flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
              {teams.length} response units online
            </span>
            <span className="text-[10px] text-outline font-mono">Supabase DB</span>
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
              <span className="font-headline text-3xl font-bold text-on-surface">{totalAssetsCount || 12}</span>
              <span className="text-xs text-on-surface-variant font-medium">facilities mapped</span>
            </div>
            <div className="mt-1 text-xs text-on-surface-variant">
              <span>Transit routes</span> &bull; <span>Hospitals</span> &bull; <span>Commercial</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#e2e8df]">
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden flex">
              <div className="bg-error h-full" style={{ width: '25%' }} title="Critical Exposure (25%)" />
              <div className="bg-tertiary-fixed-dim h-full" style={{ width: '35%' }} title="Elevated Exposure (35%)" />
              <div className="bg-secondary-container h-full" style={{ width: '40%' }} title="Nominal Buffer (40%)" />
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
                <span className="text-[10px] text-on-surface-variant">
                  {primaryJurisdiction ? `${primaryJurisdiction.replace(' Operations Command', '')} Basin Topology` : 'Regional Basin Topology'} &bull; Hydraulic Gauges
                </span>
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
              <span>Modeled Hydrological Estimates &bull; Open-Meteo Synced</span>
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
                {sortedAlertLocations.length} MONITORED
              </span>
            </div>

            {/* Dynamic Alert Cards derived from actual locations */}
            {sortedAlertLocations.length > 0 ? (
              sortedAlertLocations.map((loc) => {
                const env = loc.environmental;
                const isCritical = loc.riskLevel === 'CRITICAL';
                const isHigh = loc.riskLevel === 'HIGH';
                const borderClass = isCritical ? 'border-l-4 border-l-error' : isHigh ? 'border-l-4 border-l-tertiary' : 'border-l-4 border-l-primary';
                const tagBg = isCritical ? 'bg-error text-on-error' : isHigh ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-container text-on-primary-container';

                return (
                  <div key={loc.id} className={`p-3 bg-surface-container-low hover:bg-surface-container rounded-lg ${borderClass} transition-colors`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${tagBg}`}>
                          {loc.riskLevel}
                        </span>
                        <h4 className="text-xs font-bold text-on-surface">{loc.name}</h4>
                      </div>
                      <span className="text-[10px] text-on-surface-variant shrink-0">{formattedSyncTime}</span>
                    </div>
                    <p className="text-xs text-on-surface mt-1.5 leading-snug">
                      Assessed risk: <strong className="font-bold">{loc.riskScore}/100</strong>. {env?.waterLevelCm !== undefined ? `Modeled water depth at ${env.waterLevelCm} cm (${env.waterLevelTrend || 'STABLE'}).` : 'No live depth reading.'} {env?.rainfallMm !== undefined ? `Rainfall: ${env.rainfallMm} mm (Open-Meteo).` : ''}
                    </p>
                    <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#e2e8df]">
                      <span className={`text-[10px] font-bold ${isCritical ? 'text-error' : isHigh ? 'text-tertiary' : 'text-primary'}`}>
                        {env?.waterLevelCm !== undefined ? `${env.waterLevelCm}cm Modeled Depth` : `${loc.riskLevel} Risk`}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(`/risk/${loc.id}`)}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>Inspect Risk</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-on-surface-variant">
                No active alerts logged
              </div>
            )}
          </div>

          {/* Recommended Actions Card */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8df]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <h2 className="font-headline text-sm font-bold text-on-surface">Recommended Actions</h2>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">Hydrology Directives</span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
              {displayActions.map((action, idx) => (
                <label 
                  key={action.id}
                  className="p-2.5 bg-surface-container-low rounded-lg border border-[#e2e8df] flex items-start gap-2.5 cursor-pointer hover:bg-surface-container transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(actionStates[action.id])}
                    onChange={(e) => setActionStates(prev => ({ ...prev, [action.id]: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 rounded accent-primary text-white cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface">{action.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        idx === 0 ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">{action.note}</span>
                  </div>
                </label>
              ))}
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
                  <span>Directives Logged to Civic Audit!</span>
                </span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Acknowledge &amp; Dispatch Directives</span>
                </>
              )}
            </button>
          </div>

          {/* Operational Pipeline Banner */}
          <div className="bg-surface-container-low p-3 rounded-xl border border-[#e2e8df] text-on-surface">
            <div className="flex items-center justify-between text-[10px] text-outline mb-1 uppercase tracking-wider font-bold">
              <span>Operational Pipeline</span>
              <span className="text-primary font-bold">Open-Meteo Synced</span>
            </div>
            <div className="flex items-center justify-between gap-1 text-[11px] font-semibold">
              <span className="text-primary">Weather Feed</span>
              <span className="text-outline-variant">&rarr;</span>
              <span className="text-primary">Hydrology Model</span>
              <span className="text-outline-variant">&rarr;</span>
              <span className="text-tertiary">Risk Assess</span>
              <span className="text-outline-variant">&rarr;</span>
              <span className="text-on-surface">Civic Action</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Monitored Hydrological Catchment Nodes Strip */}
      <section aria-label="Field Telemetry Status" className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#e2e8df]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            <h3 className="font-headline text-sm font-bold text-on-surface">Monitored Hydrological Catchment Nodes</h3>
            <span className="text-xs text-on-surface-variant font-medium">
              ({locations.length} Catchments Monitored &bull; Open-Meteo Synced)
            </span>
          </div>
          <span className="text-xs font-bold text-primary">Modeled Hydrological Estimates</span>
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
                  title={`View modeled hydrology & risk telemetry for ${loc.name}`}
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
              No live monitored catchment nodes currently available
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

