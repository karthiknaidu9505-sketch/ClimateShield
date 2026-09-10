import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CloudRain, 
  Waves, 
  Filter, 
  History, 
  Truck, 
  Building2, 
  ShieldAlert, 
  CheckSquare, 
  Square, 
  ArrowRight,
  Send,
  Camera,
  Share2,
  Activity
} from 'lucide-react';
import { locationService } from '../services/locationService.js';
import { incidentService } from '../services/incidentService.js';
import { LocationItem } from '../types/index.js';

export const RiskDetails: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<LocationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreatingIncident, setIsCreatingIncident] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: false,
    3: false
  });

  useEffect(() => {
    async function loadLocation() {
      try {
        setLoading(true);
        // Default to Railway Underpass if none provided
        const targetId = locationId || 'loc-railway-underpass';
        const data = await locationService.getLocationById(targetId);
        setLocation(data);
      } catch (err: any) {
        console.error('Failed to load location details:', err);
        setError(err.message || 'Unable to retrieve location risk assessment.');
      } finally {
        setLoading(false);
      }
    }
    loadLocation();
  }, [locationId]);

  const handleCreateIncident = async () => {
    if (!location) return;
    setIsCreatingIncident(true);

    try {
      const incident = await incidentService.createIncident({
        locationId: location.id,
        title: `${location.name} Flooding`,
        severity: location.riskLevel,
        riskScore: location.riskScore,
        summary: `Incident declared for ${location.name}. Water depth currently at ${location.environmental?.waterLevelCm || 42}cm.`
      });

      if (incident?.id) {
        navigate(`/incidents/${incident.id}`);
      }
    } catch (err: any) {
      console.error('Error creating incident:', err);
      alert('Failed to initialize incident: ' + err.message);
    } finally {
      setIsCreatingIncident(false);
    }
  };

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2 text-on-surface-variant">
          <Activity className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-semibold">Synthesizing hydraulic telemetry...</span>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="p-margin-desktop">
        <div className="p-4 bg-error-container text-on-error-container rounded-lg border border-error/20">
          <h3 className="font-bold text-sm">Error Loading Location</h3>
          <p className="text-xs mt-1">{error || 'Location could not be found.'}</p>
          <Link to="/risk-map" className="mt-3 inline-block text-xs font-bold underline">
            Return to Risk Map
          </Link>
        </div>
      </div>
    );
  }

  const env = location.environmental || {
    rainfallMm: 85,
    waterLevelCm: 42,
    drainageFlowPct: 18,
    waterLevelTrend: 'RISING',
    riseRate: '+4cm / 15min'
  };

  return (
    <div className="flex flex-col w-full pb-space-2xl">
      {/* 1. Contextual Breadcrumb & Header Sub-bar */}
      <div className="w-full px-margin-desktop py-space-md bg-surface-container-low border-b border-[#e2e8df]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Link
              to="/risk-map"
              className="inline-flex items-center gap-1 text-secondary hover:text-primary text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Risk Map</span>
            </Link>
            <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1 rounded border border-[#e2e8df] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-error animate-ping" />
              <span className="text-xs font-bold text-on-surface uppercase">Live Telemetry Synchronized</span>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-space-md pt-1">
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                  {location.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-error text-on-error px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider shadow-sm">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{location.riskLevel} RISK</span>
                </span>
                <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-xs font-mono font-semibold">
                  Asset ID: INF-RD-4092
                </span>
                <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-xs font-semibold">
                  {location.sector}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Flood vulnerability &amp; environmental assessment &bull; Last evaluated 2 minutes ago
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                className="inline-flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded text-xs font-semibold border border-[#e2e8df] transition-colors shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Relay Link</span>
              </button>
              <button 
                type="button"
                className="inline-flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded text-xs font-semibold border border-[#e2e8df] transition-colors shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Feed Cam #4092</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Operational 2-Column Core Layout */}
      <div className="w-full px-margin-desktop py-space-lg max-w-[1720px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          
          {/* LEFT COLUMN: Risk Assessment & Telemetry (60% ~ 7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            
            {/* Card 1: Main Risk Score Banner */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-[#e2e8df] shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-outline">
                    Dynamic Hydraulic Risk Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-headline text-5xl font-bold text-error tracking-tighter leading-none">
                      {location.riskScore}
                    </span>
                    <span className="text-xl text-outline font-normal">/ 100</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 mt-2 bg-error-container text-on-error-container px-2.5 py-1 rounded text-xs font-bold border border-error/20">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>CRITICAL FLOOD RISK</span>
                  </div>
                </div>

                <div className="w-full sm:w-64 flex flex-col gap-1.5">
                  <div className="flex justify-between text-[11px] text-on-surface-variant font-medium">
                    <span>Safe (0)</span>
                    <span>Threshold (60)</span>
                    <span>Severe (100)</span>
                  </div>
                  {/* Meter gradient line */}
                  <div className="relative w-full h-3 rounded-full bg-surface-container overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-tertiary-fixed-dim to-error" />
                    {/* Indicator marker pin at 87% */}
                    <div 
                      className="absolute top-0 bottom-0 right-0 bg-surface-container-lowest/80" 
                      style={{ width: `${Math.max(0, 100 - location.riskScore)}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-end text-error gap-1 text-xs font-bold">
                    <span>+34 pts in 30m</span>
                  </div>
                </div>
              </div>

              <div className="mt-space-md p-3 bg-surface-container-low rounded-lg border border-[#e2e8df] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Risk score calculated by the backend risk engine at <strong className="text-on-surface">{location.riskScore}/100</strong> (30% Rainfall + 30% Water Level + 20% Drainage + 20% Historical events). Water ingress rapidly accelerating.
                </p>
              </div>
            </div>

            {/* Card 2: Environmental Telemetry (4 Grid Cards) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
                  Environmental Telemetry
                </h2>
                <span className="text-[11px] text-outline">Sensor Array Active &bull; 4/4 Online</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {/* Rainfall */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      <Waves className="w-4 h-4 text-primary" />
                      <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Precipitation Rate</span>
                    </div>
                    <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[10px] font-bold">Critical</span>
                  </div>
                  <div className="my-2.5">
                    <div className="font-headline text-2xl font-bold text-on-surface">{env.rainfallMm} mm/h</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">Heavy convective cloudburst</div>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-error h-full rounded-full" style={{ width: `${Math.min(100, (env.rainfallMm / 100) * 100)}%` }} />
                  </div>
                </div>

                {/* Water Level */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      <Waves className="w-4 h-4 text-primary" />
                      <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Inundation Depth</span>
                    </div>
                    <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[10px] font-bold">Critical</span>
                  </div>
                  <div className="my-2.5">
                    <div className="font-headline text-2xl font-bold text-error">{env.waterLevelCm} cm</div>
                    <div className="text-xs text-error mt-0.5 font-semibold">Rising (+4 cm / 15 min)</div>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-error h-full rounded-full" style={{ width: `${Math.min(100, (env.waterLevelCm / 50) * 100)}%` }} />
                  </div>
                </div>

                {/* Drainage */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      <Filter className="w-4 h-4 text-secondary" />
                      <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Drainage Condition</span>
                    </div>
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded text-[10px] font-bold">
                      {location.drainageCondition}
                    </span>
                  </div>
                  <div className="my-2.5">
                    <div className="font-headline text-2xl font-bold text-on-surface">{env.drainageFlowPct || 18}% Flow</div>
                    <div className="text-xs text-tertiary mt-0.5 font-medium">Severe silting &amp; backflow</div>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-tertiary-container h-full rounded-full" style={{ width: `${env.drainageFlowPct || 18}%` }} />
                  </div>
                </div>

                {/* Historical Incidents */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      <History className="w-4 h-4 text-secondary" />
                      <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Historical Pattern</span>
                    </div>
                    <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold">Chronic</span>
                  </div>
                  <div className="my-2.5">
                    <div className="font-headline text-2xl font-bold text-on-surface">{location.historicalIncidents} Events</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">Recorded past 24 mos</div>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full rounded-full" style={{ width: `${Math.min(100, (location.historicalIncidents / 14) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Why this location is at risk (Hydrologic Factor Breakdown) */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-[#e2e8df] shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2e8df] mb-3">
                <h2 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
                  Hydrologic Factor Breakdown
                </h2>
                <span className="text-xs text-on-surface-variant font-medium">Engine Confidence: 94.2%</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {(location.factors && location.factors.length > 0 ? location.factors : [
                  { title: `Heavy Rainfall (${env.rainfallMm}mm/h)`, description: 'Precipitation volume exceeds 10-year storm drain throughput design.', impact: 'HIGH' },
                  { title: `Rising Water Level (${env.waterLevelCm}cm)`, description: 'Water depth approaching vehicle undercarriage stall limit (45cm).', impact: 'HIGH' },
                  { title: 'Poor Drainage & Topographical Sump', description: 'Lowest elevation point in 2.4 sq km catchment with clogged secondary outflow gates.', impact: 'MEDIUM' },
                  { title: `Previous Flooding (${location.historicalIncidents} Events)`, description: 'Site has recurring chronic inundation history during convective storms.', impact: 'HIGH' }
                ]).map((factor, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-surface-container-low rounded-lg border border-[#e2e8df] flex items-start justify-between gap-3 hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        factor.impact === 'HIGH' ? 'bg-error text-on-error' : 'bg-tertiary text-on-tertiary'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-xs text-on-surface">{factor.title}</h3>
                        <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{factor.description}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      factor.impact === 'HIGH' ? 'bg-error text-on-error' : 'bg-tertiary-fixed text-on-tertiary-fixed'
                    }`}>
                      {factor.impact} Impact
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Topographic Satellite Reference */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-headline text-xs font-bold text-on-surface uppercase tracking-wider">Topographic Satellite Reference</span>
                <span className="text-[11px] text-primary font-bold">Sensor Grid 4B-9</span>
              </div>
              <div className="w-full h-48 bg-slate-900 rounded-lg overflow-hidden relative border border-[#e2e8df]">
                {/* Synthetic Topographic Satellite Imagery Canvas */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-emerald-950 to-slate-900 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <pattern id="sat-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#7ed99e" strokeWidth="0.5" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#sat-grid)" />
                    </svg>
                  </div>
                  <div className="text-center p-4 z-10">
                    <span className="text-xs font-mono text-primary-fixed-dim uppercase tracking-widest block mb-1">
                      HYDRAULIC BASIN ELEVATION PROFILE
                    </span>
                    <span className="font-headline text-lg font-bold text-white block">
                      Railway Underpass Arterial Sub-Grade
                    </span>
                    <span className="text-xs text-slate-300">
                      Elevation: -1.8m below regional datum &bull; Catchment: 2.4 km²
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 z-10 bg-error text-on-error px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  Submerged Zone
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Vulnerable Assets & Response Workflow (40% ~ 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            
            {/* 1. Vulnerable Assets at Immediate Stake */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-[#e2e8df] shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2e8df] mb-3">
                <h2 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
                  Assets at Immediate Stake
                </h2>
                <span className="text-xs text-outline">{location.assets?.length || 3} Intersecting</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {(location.assets && location.assets.length > 0 ? location.assets : [
                  { name: 'Major Road / Arterial Transit Route', type: 'Transit', criticality: 'Critical', impactNotice: '14,000 daily commuters and key freight transport corridor.' },
                  { name: 'Emergency Route A', type: 'Hospital', criticality: 'Critical', impactNotice: 'Primary rapid route for General Hospital ambulances.' },
                  { name: 'Nearby Commercial Area', type: 'Commercial', criticality: 'High', impactNotice: '22 ground-floor storefronts within 200m flood boundary.' }
                ]).map((asset, idx) => (
                  <div key={idx} className="p-3 bg-surface-container-low rounded-lg border border-[#e2e8df]">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-surface-container-high rounded text-primary shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-on-surface truncate">{asset.name}</h3>
                          <span className={`text-[10px] font-bold ${asset.criticality === 'Critical' ? 'text-error' : 'text-tertiary'}`}>
                            {asset.criticality}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">{asset.impactNotice}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Recommended Response Workflow */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-[#e2e8df] shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2e8df] mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <h2 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
                    Recommended Response Workflow
                  </h2>
                </div>
                <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                  Actionable
                </span>
              </div>

              <p className="text-xs text-on-surface-variant mb-3">
                Standard operating procedure automated for Level 3 convective inundation events:
              </p>

              {/* Checklist */}
              <div className="flex flex-col gap-2 mb-space-md">
                {[
                  { priority: 'Priority 1', title: 'Alert municipal response team & dispatch rapid pump unit', note: 'Unit 4-Delta notified via automated radio' },
                  { priority: 'Priority 2', title: 'Inspect storm drain intake for debris obstruction', note: 'Clogged grate rate exceeding 65%' },
                  { priority: 'Priority 3', title: 'Prepare mobile barrier deployment & auxiliary pumps', note: 'Standby at Maintenance Yard 2 (6 min ETA)' },
                  { priority: 'Priority 4', title: 'Restrict vehicle access & reroute traffic at 45cm', note: 'Current water is 42cm. Pre-trigger variable signage' }
                ].map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className="flex items-start gap-2.5 p-2.5 bg-surface-container-low hover:bg-surface-container rounded-lg border border-[#e2e8df] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(checkedSteps[idx])}
                      onChange={() => toggleStep(idx)}
                      className="mt-0.5 h-4 w-4 rounded accent-primary text-white cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase ${idx < 2 ? 'text-error' : 'text-tertiary'}`}>
                          {step.priority}
                        </span>
                        <span className="text-xs font-bold text-on-surface leading-tight">{step.title}</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant block mt-0.5">{step.note}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Prominent Action CTAs */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#e2e8df]">
                {/* Primary CTA: Create Incident & Dispatch Team */}
                <button
                  type="button"
                  disabled={isCreatingIncident}
                  onClick={handleCreateIncident}
                  className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-75"
                >
                  {isCreatingIncident ? (
                    <span>Declaring Incident in Database...</span>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>Create Incident &amp; Dispatch Team &rarr;</span>
                    </>
                  )}
                </button>

                {/* Secondary CTA: Notify Field Response Team */}
                <button
                  type="button"
                  onClick={() => alert('Municipal Field Units in Zone 4B alerted via automated push relay.')}
                  className="w-full bg-surface-container-lowest hover:bg-surface-container-high text-on-surface py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide border border-[#e2e8df] transition-colors shadow-sm"
                >
                  <span>Notify Field Response Team</span>
                </button>
              </div>
            </div>

            {/* 3. Water Level Trajectory Sparkline Preview */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm">
              <div className="flex items-center justify-between pb-1 border-b border-[#e2e8df]">
                <span className="text-xs font-bold uppercase text-on-surface">Water Level Trajectory</span>
                <span className="text-xs font-bold text-error">+0.5cm / min velocity</span>
              </div>
              <div className="w-full h-16 pt-2">
                <svg className="w-full h-full text-error" fill="none" preserveAspectRatio="none" viewBox="0 0 300 80">
                  <path d="M0 65 Q 40 60, 80 55 T 160 45 T 220 28 T 300 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M0 65 Q 40 60, 80 55 T 160 45 T 220 28 T 300 8 L 300 80 L 0 80 Z" fill="currentColor" fillOpacity="0.08" />
                  <circle cx="300" cy="8" r="4.5" fill="currentColor" className="animate-pulse" />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-on-surface-variant pt-1">
                <span>-60 min (12cm)</span>
                <span>-30 min (22cm)</span>
                <span>-10 min (39cm)</span>
                <span className="text-error font-bold">Now ({env.waterLevelCm}cm)</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
