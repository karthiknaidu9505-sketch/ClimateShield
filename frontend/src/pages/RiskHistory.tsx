import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  Waves, 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Building,
  Calendar,
  Construction
} from 'lucide-react';
import { apiRequest, isOfflineMode } from '../services/api.js';
import { MOCK_HISTORY } from '../services/mockData.js';
import { HistoryAnalytics } from '../types/index.js';


export const RiskHistory: React.FC = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<HistoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        if (await isOfflineMode()) {
          setHistoryData(MOCK_HISTORY);
        } else {
          const res = await apiRequest<{ success: boolean; data: HistoryAnalytics }>('/history');
          setHistoryData(res.data || (res as any));
        }
      } catch (err) {
        console.error('Failed to load risk history analytics:', err);
        setHistoryData(MOCK_HISTORY);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);


  const summary = historyData?.summary || {
    totalIncidents: 25,
    totalTrend: '-14% vs prior annual cycle',
    floodIncidents: 18,
    floodSharePct: 72,
    peakMonth: 'July (6 incidents)',
    recurringHotspotsCount: 4,
    resolvedRatePct: 92,
    avgResolutionMinutes: 44
  };

  const monthlyTrends = historyData?.monthlyTrends || [
    { month: 'Nov', incidents: 1, isPeak: false, rainfallMm: 45 },
    { month: 'Dec', incidents: 0, isPeak: false, rainfallMm: 12 },
    { month: 'Jan', incidents: 1, isPeak: false, rainfallMm: 38 },
    { month: 'Feb', incidents: 2, isPeak: false, rainfallMm: 52 },
    { month: 'Mar', incidents: 1, isPeak: false, rainfallMm: 41 },
    { month: 'Apr', incidents: 2, isPeak: false, rainfallMm: 60 },
    { month: 'May', incidents: 3, isPeak: false, rainfallMm: 75 },
    { month: 'Jun', incidents: 4, isPeak: false, rainfallMm: 98 },
    { month: 'Jul', incidents: 6, isPeak: true, rainfallMm: 142 },
    { month: 'Aug', incidents: 5, isPeak: true, rainfallMm: 118 },
    { month: 'Sep', incidents: 3, isPeak: false, rainfallMm: 80 },
    { month: 'Oct', incidents: 2, isPeak: false, rainfallMm: 55 }
  ];

  const hotspots = historyData?.recurringHotspots || [
    {
      id: 'loc-railway-underpass',
      name: 'Railway Underpass',
      severity: 'Critical',
      incidents: 12,
      elevationNotice: 'Sump elevation -1.8m',
      summary: 'Chronic flood hotspot. Outflow siltation frequent during rapid cloudbursts; drainage pump #2 intermittent.',
      lastEvent: '18 days ago',
      mitigationPriority: 'Immediate'
    },
    {
      id: 'loc-market-road',
      name: 'Market Road Arterial',
      severity: 'High',
      incidents: 8,
      elevationNotice: 'Impervious surface 94%',
      summary: 'Flash runoff convergence point during downpours. High vehicle stoppage rate impacting emergency corridors.',
      lastEvent: '42 days ago',
      mitigationPriority: 'High'
    },
    {
      id: 'loc-old-bus-stand',
      name: 'Old Bus Stand Culvert',
      severity: 'Medium',
      incidents: 6,
      elevationNotice: 'Debris accumulation bottleneck',
      summary: 'Grate blockage during storm events with high municipal waste drift. Water logging clears within 35 min once cleared.',
      lastEvent: '64 days ago',
      mitigationPriority: 'Scheduled Maintenance'
    }
  ];

  return (
    <div className="p-margin-desktop flex flex-col gap-space-lg max-w-[1720px] mx-auto w-full">
      {/* 1. Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div className="flex flex-col gap-1 max-w-3xl">
          <div className="flex items-center gap-2 text-primary text-[10px] uppercase font-bold tracking-wider flex-wrap">
            <History className="w-3.5 h-3.5" />
            <span>Civic Resilience Dossier</span>
            <span className="text-outline">•</span>
            <span className="text-on-surface-variant font-medium">Temporal Range: Nov 2023 – Oct 2024</span>
            <span className="text-outline">•</span>
            <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-[9px] font-bold uppercase">
              Retrospective Archive &bull; Not Live Feed
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Risk History &amp; Resilience Planning
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Understand recurring climate risks, evaluate historical flood records from municipal archives, and prioritize capital mitigation investments.
          </p>
        </div>

        <button 
          type="button"
          onClick={() => alert('Exporting Historical Resilience Audit to CSV/PDF...')}
          className="flex items-center gap-1.5 bg-surface-container-lowest text-primary hover:bg-surface-container-low px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-[#e2e8df] shadow-sm transition-all self-start lg:self-end"
        >
          <Download className="w-4 h-4" />
          <span>Export Historical Audit</span>
        </button>
      </div>

      {/* 2. Filter Matrix Ribbon */}
      <div className="bg-surface-container-lowest p-3 rounded-xl border border-[#e2e8df] shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded border border-[#e2e8df] text-xs">
            <Building className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">District:</span>
            <span className="font-bold text-on-surface">Amalapuram Region (Active)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded border border-[#e2e8df] text-xs">
            <Waves className="w-3.5 h-3.5 text-secondary" />
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">Hazard:</span>
            <span className="font-bold text-on-surface">Flooding &amp; Pluvial</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded border border-[#e2e8df] text-xs">
            <Calendar className="w-3.5 h-3.5 text-outline" />
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">Timeline:</span>
            <span className="font-bold text-on-surface">Last 12 Mo (Nov '23 - Oct '24)</span>
          </div>
        </div>
        <span className="text-xs text-on-surface-variant">Active Scope: <strong>District 4 Core</strong></span>
      </div>

      {/* 3. Summary Telemetry Readouts (4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Total Recorded Incidents</span>
            <div className="w-7 h-7 rounded bg-surface-container-low flex items-center justify-center text-primary">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-on-surface">{summary.totalIncidents}</span>
              <span className="text-xs text-primary font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> -14%
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">Across monitored municipal grid</p>
          </div>
          <span className="text-[10px] text-primary font-bold pt-1 border-t border-[#e2e8df]">Declining annual risk trend</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Flood &amp; Inundation Events</span>
            <div className="w-7 h-7 rounded bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <Waves className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-on-surface">{summary.floodIncidents}</span>
              <span className="text-xs text-secondary font-bold bg-secondary-container px-2 py-0.5 rounded">
                {summary.floodSharePct}% Share
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">Primary municipal hazard domain</p>
          </div>
          <span className="text-[10px] text-on-surface font-bold pt-1 border-t border-[#e2e8df]">Peak Month: {summary.peakMonth}</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Recurring Hotspots</span>
            <div className="w-7 h-7 rounded bg-error-container flex items-center justify-center text-on-error-container">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-on-surface">{summary.recurringHotspotsCount}</span>
              <span className="text-xs text-on-error-container bg-error-container px-2 py-0.5 rounded font-bold">
                High Vulnerability
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">Identified chronic drainage sumps</p>
          </div>
          <span className="text-[10px] text-error font-bold pt-1 border-t border-[#e2e8df] uppercase">Mitigation priority: High</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Resolved Incident Rate</span>
            <div className="w-7 h-7 rounded bg-primary-fixed/40 flex items-center justify-center text-primary">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-on-surface">{summary.resolvedRatePct}%</span>
              <span className="text-xs text-primary font-bold">&uarr; +4.2%</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">Avg containment time: {summary.avgResolutionMinutes} min</p>
          </div>
          <span className="text-[10px] text-primary font-bold pt-1 border-t border-[#e2e8df]">Optimal containment pace</span>
        </div>
      </div>

      {/* 4. Main Spatial Operations Grid: Left (60%) vs Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        
        {/* Left Column (60% ~ 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          
          {/* Trend Bar Visualization */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-[#e2e8df] shadow-sm flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#e2e8df]">
              <div>
                <h2 className="font-headline text-sm font-bold text-on-surface">Flood Incidents by Month (Past 12 Months)</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Correlation between heavy cloudburst downpours (&gt;50mm) and operational callouts
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Standard
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-tertiary-fixed-dim" /> Monsoonal Surge
                </div>
              </div>
            </div>

            {/* SVG Chart Container */}
            <div className="w-full pt-4 flex flex-col">
              <div className="relative w-full h-56 flex items-end">
                {/* Horizontal Guide lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-outline">
                  <div className="w-full flex items-center">
                    <span className="w-5">6</span>
                    <div className="flex-1 border-b border-dashed border-[#e2e8df]" />
                  </div>
                  <div className="w-full flex items-center">
                    <span className="w-5">4</span>
                    <div className="flex-1 border-b border-dashed border-[#e2e8df]" />
                  </div>
                  <div className="w-full flex items-center relative">
                    <span className="w-5 text-tertiary font-bold">3</span>
                    <div className="flex-1 border-b-2 border-dotted border-tertiary-fixed-dim relative">
                      <span className="absolute right-0 -top-4 text-[9px] font-bold bg-tertiary-fixed text-on-tertiary-fixed px-1.5 py-0.5 rounded shadow-sm">
                        Warning Threshold: 3/mo
                      </span>
                    </div>
                  </div>
                  <div className="w-full flex items-center">
                    <span className="w-5">2</span>
                    <div className="flex-1 border-b border-dashed border-[#e2e8df]" />
                  </div>
                  <div className="w-full flex items-center">
                    <span className="w-5">0</span>
                    <div className="flex-1 border-b border-[#e2e8df]" />
                  </div>
                </div>

                {/* Bar Columns */}
                <div className="w-full h-full pl-6 pr-2 flex items-end justify-between gap-1.5 sm:gap-2 z-10 pb-1">
                  {monthlyTrends.map((item) => {
                    const heightPct = (item.incidents / 6) * 100;
                    const isSelected = selectedMonth === item.month;

                    return (
                      <div 
                        key={item.month} 
                        onClick={() => setSelectedMonth(item.month)}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      >
                        <span className={`text-[10px] font-bold mb-1 transition-opacity ${
                          item.isPeak ? 'text-tertiary opacity-100 font-extrabold' : 'text-on-surface opacity-0 group-hover:opacity-100'
                        }`}>
                          {item.incidents}{item.isPeak ? '*' : ''}
                        </span>
                        <div 
                          className={`w-full max-w-[28px] rounded-t transition-all duration-300 ${
                            item.isPeak 
                              ? 'bg-tertiary-container hover:brightness-110 shadow-sm' 
                              : item.incidents >= 3 
                              ? 'bg-primary-container hover:brightness-110' 
                              : item.incidents === 0
                              ? 'bg-[#e2e8df]'
                              : 'bg-primary hover:brightness-110'
                          } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                          style={{ height: item.incidents === 0 ? '4px' : `${Math.max(12, heightPct)}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Month X-Axis */}
              <div className="w-full pl-6 pr-2 flex justify-between gap-1.5 sm:gap-2 mt-2 text-center text-xs text-on-surface-variant font-medium">
                {monthlyTrends.map(m => (
                  <span key={m.month} className={`flex-1 ${m.isPeak ? 'text-tertiary font-bold' : ''}`}>
                    {m.month}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-lg border border-[#e2e8df] flex items-center justify-between text-xs text-on-surface mt-2">
              <span>Summer monsoonal surge accounted for <strong>60% of all annual structural flood alerts</strong>.</span>
              <span className="text-primary font-bold cursor-pointer hover:underline">Inspect Rainfall Matrix &rarr;</span>
            </div>
          </div>

          {/* Strategic Resilience Insight Card (Green Banner) */}
          <div className="bg-primary text-on-primary p-space-lg rounded-xl shadow-md border border-primary-container relative overflow-hidden flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-1 z-10">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                  Municipal Capital Allocation Priority
                </span>
                <span className="text-xs font-bold text-primary-fixed">Impact Score: 94/100</span>
              </div>

              <h3 className="font-headline text-lg sm:text-xl font-bold text-white mt-1">
                Railway Underpass: Dual Sluice Retrofit Directive
              </h3>

              <p className="text-xs text-white/90 leading-relaxed mt-1">
                Railway Underpass has recorded 12 inundation events in 24 months, causing $420k in cumulative traffic delays and response costs. Retrofitting dual high-efficiency drainage sluices in Q1 would reduce local failure risk by an estimated 78%.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/20 z-10">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-primary-fixed uppercase font-bold block">Est. Cost Avoidance</span>
                  <span className="font-headline text-sm font-bold text-white">$340,000 / yr</span>
                </div>
                <div>
                  <span className="text-[10px] text-primary-fixed uppercase font-bold block">Implementation Horizon</span>
                  <span className="font-headline text-sm font-bold text-white">45 Days (Q1)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert('Capital Improvement Proposal generated for City Council Review.')}
                className="bg-surface-container-lowest text-primary hover:bg-surface-container-high px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Generate Capital Proposal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (40% ~ 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          
          {/* Recurring Risk Hotspots */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8df]">
              <div>
                <h2 className="font-headline text-sm font-bold text-on-surface">Recurring Risk Hotspots</h2>
                <span className="text-xs text-on-surface-variant">Infrastructure Vulnerability Audit</span>
              </div>
              <span className="text-[10px] bg-surface-container-low text-primary px-2 py-0.5 rounded font-bold uppercase">
                Amalapuram Grid
              </span>
            </div>

            {/* Hotspots Stack */}
            <div className="flex flex-col gap-2.5">
              {hotspots.map((spot) => (
                <div 
                  key={spot.id}
                  className="bg-surface-container-low p-3 rounded-lg border border-[#e2e8df] hover:bg-surface-container transition-colors flex flex-col gap-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className={`w-4 h-4 ${spot.severity === 'Critical' ? 'text-error' : 'text-tertiary'}`} />
                      <h4 className="font-headline text-xs font-bold text-on-surface">{spot.name}</h4>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      spot.severity === 'Critical' 
                        ? 'bg-error-container text-on-error-container' 
                        : 'bg-tertiary-fixed text-on-tertiary-fixed'
                    }`}>
                      {spot.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="font-bold text-on-surface">{spot.incidents} incidents recorded</span>
                    <span>&bull;</span>
                    <span>{spot.elevationNotice}</span>
                  </div>

                  <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">
                    {spot.summary}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-[#e2e8df]/60 mt-1">
                    <span className="text-[10px] text-outline">Last Event: {spot.lastEvent}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/risk/${spot.id}`)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>View Location Audit</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preventive Infrastructure Actions Card */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8df]">
              <div className="flex items-center gap-2">
                <Construction className="w-4 h-4 text-primary" />
                <h3 className="font-headline text-sm font-bold text-on-surface">Preventive Infrastructure Actions</h3>
              </div>
              <span className="text-[10px] text-primary font-bold uppercase">Scheduled</span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="p-2.5 bg-surface-container-low rounded-lg border border-[#e2e8df] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Pre-monsoon Culvert Desilting</span>
                  <span className="text-[10px] text-on-surface-variant">Target: Railway Underpass Canal Line B</span>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded">In Progress</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg border border-[#e2e8df] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Automatic Flood Barrier Deployment Test</span>
                  <span className="text-[10px] text-on-surface-variant">Target: Market Road Sump Barrier #3</span>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">Queued (14 Oct)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
