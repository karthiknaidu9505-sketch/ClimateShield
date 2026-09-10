import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Check, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Radio, 
  Send, 
  Truck, 
  ShieldAlert, 
  Layers, 
  CheckSquare, 
  Square,
  Waves,
  MessageSquare,
  Lock,
  UserCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { incidentService } from '../services/incidentService.js';
import { Incident, ResponseTeam, IncidentStatus } from '../types/index.js';

export const IncidentResponse: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [teams, setTeams] = useState<ResponseTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Default fallback ID if route has no parameter
  const targetId = incidentId && incidentId !== ':incidentId' ? incidentId : 'inc-railway-001';

  const loadData = async () => {
    try {
      setLoading(true);
      const [incidentData, teamsData] = await Promise.all([
        incidentService.getIncidentById(targetId).catch(async () => {
          // If specific ID fails, try getting the first active incident
          const all = await incidentService.getIncidents();
          return all[0] || null;
        }),
        incidentService.getTeams().catch(() => [])
      ]);

      setIncident(incidentData);
      setTeams(teamsData);
    } catch (err) {
      console.error('Failed to load incident response:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetId]);

  const handleToggleAction = async (actionId: string, currentStatus: boolean) => {
    try {
      await incidentService.toggleAction(actionId, !currentStatus);
      setIncident(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          actions: prev.actions.map(a => a.id === actionId ? { ...a, isCompleted: !currentStatus } : a)
        };
      });
    } catch (err) {
      console.error('Failed to toggle action:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !incident) return;
    setIsSubmittingNote(true);

    try {
      const note = await incidentService.addNote(
        incident.id,
        newNote.trim(),
        'Elena Vance (Lead Operations Officer)'
      );
      setIncident(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          notes: [note, ...prev.notes]
        };
      });
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleResolveIncident = async () => {
    if (!incident) return;
    const allCompleted = incident.actions.length > 0 && incident.actions.every(a => a.isCompleted);
    if (!allCompleted) {
      alert('Cannot mark incident as RESOLVED: All mandatory protocol response actions must be completed first.');
      return;
    }
    setIsResolving(true);

    try {
      const updated = await incidentService.updateIncidentStatus(incident.id, 'RESOLVED');
      setIncident(updated);
      setFeedbackMsg('Incident marked as Resolved and logged to civic audit history.');
      setTimeout(() => setFeedbackMsg(''), 5000);
    } catch (err) {
      console.error('Failed to resolve incident:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!incident) return;
    try {
      const updated = await incidentService.updateIncidentStatus(incident.id, newStatus);
      setIncident(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleTeamChange = async (teamId: string) => {
    if (!incident) return;
    try {
      const updated = await incidentService.updateIncidentStatus(incident.id, incident.status, teamId);
      setIncident(updated);
    } catch (err) {
      console.error('Failed to assign team:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-on-surface-variant text-sm font-semibold">
          Loading incident operational state...
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-margin-desktop text-center">
        <h2 className="text-lg font-bold text-on-surface">No Incident Selected</h2>
        <p className="text-xs text-on-surface-variant mt-1">Please select an incident or declare one from the Risk Details page.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-primary text-on-primary px-4 py-2 rounded text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const allActionsCompleted = incident.actions.length > 0 && incident.actions.every(a => a.isCompleted);
  const isResolved = incident.status === 'RESOLVED';

  // 5 Step Stepper Logic
  const steps: { key: IncidentStatus; label: string; time: string; sub: string }[] = [
    { key: 'RISK_DETECTED', label: 'Risk Detected', time: new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sub: 'Risk Engine' },
    { key: 'ALERT_SENT', label: 'Alert Sent', time: 'Auto Dispatch', sub: 'Dispatch Auto' },
    { key: 'TEAM_ASSIGNED', label: 'Team Assigned', time: incident.responseTeam ? incident.responseTeam.name : 'Pending', sub: 'Rapid Unit' },
    { key: 'RESPONSE_IN_PROGRESS', label: 'Response In Progress', time: isResolved ? 'Completed' : 'Active State', sub: 'Deploying' },
    { key: 'RESOLVED', label: 'Resolution & Review', time: isResolved && incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : isResolved ? 'Verified' : 'Pending', sub: 'Audit Cert' }
  ];

  const statusOrder: Record<IncidentStatus, number> = {
    'RISK_DETECTED': 1,
    'ALERT_SENT': 2,
    'TEAM_ASSIGNED': 3,
    'RESPONSE_IN_PROGRESS': 4,
    'RESOLVED': 5
  };

  const currentStepNum = statusOrder[incident.status] || 4;

  const currentWaterLevel = incident.waterLevelAtIncident ?? (incident.location?.environmental?.waterLevelCm ?? 0);

  return (
    <div className="p-space-lg lg:p-margin-desktop flex flex-col gap-space-lg max-w-[1720px] mx-auto w-full">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
          <span>Incidents</span>
          <span>/</span>
          <span>Active Command</span>
          <span>/</span>
          <span className="text-primary font-bold">{incident.incidentNumber}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Incident Response: {incident.title}
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
              incident.status === 'RESOLVED' 
                ? 'bg-primary text-on-primary' 
                : 'bg-error text-on-error'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${incident.status === 'RESOLVED' ? 'bg-white' : 'bg-on-error animate-ping'}`} />
              {incident.status === 'RESOLVED' ? 'RESOLVED' : `${incident.severity} SEVERITY • ${incident.status.replace(/_/g, ' ')}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded border border-[#e2e8df]">
              Database Synchronized
            </span>
            <button
              type="button"
              onClick={loadData}
              className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded text-xs font-semibold border border-[#e2e8df] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-primary" />
              <span>Sync State</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert if resolved */}
        {feedbackMsg && (
          <div className="p-3 bg-primary-container text-on-primary-container rounded-lg text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Metric Strip */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant bg-surface-container-low px-4 py-2 rounded-lg border border-[#e2e8df] mt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Logged: <strong className="text-on-surface font-semibold">{new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Monitored Zone: <strong className="text-on-surface font-semibold">{incident.location?.sector || 'District Core'}</strong></span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-error" />
            <span>Modeled Depth: <strong className="text-error font-semibold">{currentWaterLevel}cm</strong></span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-tertiary" />
            <span>Risk Index: <strong className="text-on-surface font-semibold">{incident.riskScore}/100</strong> ({incident.severity})</span>
          </div>
        </div>
      </div>

      {/* 2. Workflow Status Progression Bar (Horizontal Stepper) */}
      <div className="w-full bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStepNum > stepNum || incident.status === 'RESOLVED';
            const isActive = currentStepNum === stepNum && incident.status !== 'RESOLVED';

            return (
              <React.Fragment key={step.key}>
                <div 
                  onClick={() => handleStatusChange(step.key)}
                  className={`flex-1 flex items-center gap-2.5 p-1.5 rounded cursor-pointer transition-all ${
                    isActive ? 'bg-tertiary-fixed/30 border border-tertiary-fixed-dim/50' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCompleted
                      ? 'bg-primary-fixed text-primary'
                      : isActive
                      ? 'bg-tertiary-fixed-dim text-on-tertiary-fixed relative'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : isActive ? (
                      <>
                        <span>{stepNum}</span>
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-tertiary animate-ping" />
                      </>
                    ) : (
                      <span>{stepNum}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs truncate ${isActive ? 'text-tertiary font-bold' : 'font-bold text-on-surface'}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-on-surface-variant truncate">
                      {isCompleted ? 'Verified' : isActive ? step.time : step.sub}
                    </span>
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <div className={`hidden md:block w-8 h-[2px] shrink-0 ${
                    currentStepNum > stepNum ? 'bg-primary-fixed' : 'bg-surface-container-high'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        
        {/* Left Column (60% ~ 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          
          {/* Action Checklist Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-[#e2e8df] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8df]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                <h2 className="font-headline text-sm font-bold text-on-surface">
                  Incident Response Protocol &bull; Urban Flash Flood
                </h2>
              </div>
              <span className="text-xs bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded font-bold">
                {incident.actions.filter(a => a.isCompleted).length} of {incident.actions.length} Complete
              </span>
            </div>

            <p className="text-xs text-on-surface-variant">
              Mandatory operational actions according to Municipal Standard OP-404 for railway sub-grade structures under red-tier warnings:
            </p>

            {/* Actions List */}
            <div className="flex flex-col gap-2 mt-1">
              {incident.actions.map((action) => (
                <label
                  key={action.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    action.isCompleted 
                      ? 'bg-surface-container-low/60 border-[#e2e8df]' 
                      : 'bg-surface-container-lowest border-[#e2e8df] hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={action.isCompleted}
                    onChange={() => handleToggleAction(action.id, action.isCompleted)}
                    className="mt-0.5 h-4 w-4 rounded accent-primary text-white cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${action.isCompleted ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                        {action.title}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        action.priority === 'Urgent' 
                          ? 'bg-error-container text-on-error-container' 
                          : 'bg-tertiary-fixed text-on-tertiary-fixed'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant block mt-0.5">
                      {action.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Incident Notes & Operations Log */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-[#e2e8df] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8df]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h2 className="font-headline text-sm font-bold text-on-surface">Field Response Updates &amp; Communications</h2>
              </div>
              <span className="text-[10px] text-on-surface-variant font-mono uppercase">Audit Log Synced</span>
            </div>

            {/* Log Feed */}
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {incident.notes.map((note) => (
                <div key={note.id} className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-container-low border border-[#e2e8df]">
                  <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {note.role === 'FIELD' ? <Truck className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface">{note.author}</span>
                      <span className="text-[10px] text-on-surface-variant">
                        {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-snug">{note.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Post Update Form */}
            <form onSubmit={handleAddNote} className="flex flex-col gap-2 pt-2 border-t border-[#e2e8df]">
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add operational field update, response log, or mitigation note..."
                className="w-full bg-surface-container-low text-on-surface text-xs p-2.5 rounded-lg border border-[#e2e8df] focus:outline-none focus:border-primary resize-none"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                  <Lock className="w-3 h-3 text-outline" />
                  <span>Encrypted Municipal Audit Record</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNote.trim()}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary px-3 py-1.5 rounded text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Update</span>
                </button>
              </div>
            </form>
          </div>

          {/* Incident Resolution Action Buttons */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-[#e2e8df] shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* PRIMARY ACTION: Mark Incident Resolved */}
              <button
                type="button"
                onClick={handleResolveIncident}
                disabled={isResolving || incident.status === 'RESOLVED' || !allActionsCompleted}
                title={!allActionsCompleted ? 'Complete all protocol response actions before resolving' : 'Mark incident resolved'}
                className="flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-60"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{incident.status === 'RESOLVED' ? 'Incident Resolved' : 'Mark Incident Resolved'}</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Escalation notification dispatched to Municipal District Command.')}
                className="flex items-center gap-1.5 bg-surface-container hover:bg-tertiary-fixed/40 text-tertiary px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Escalate to Command</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => alert('Incident report exported to audit log.')}
              className="text-xs text-on-surface-variant hover:text-on-surface font-semibold underline"
            >
              Export Incident Audit Log
            </button>
          </div>

        </div>

        {/* Right Column (40% ~ 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          
          {/* Catchment Hydrology Model & Weather Telemetry Snapshot Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-[#e2e8df] shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#e2e8df]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-outline">Catchment Hydrology Model &amp; Weather Data</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-primary" title="Weather data from Open-Meteo">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>Open-Meteo Synced</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-surface-container-low p-2.5 rounded-lg border border-[#e2e8df]">
                <span className="text-[9px] uppercase font-bold text-outline block" title="Modeled hydrological estimate">Modeled Depth</span>
                <span className="font-headline text-xl font-bold text-error mt-0.5 block">{currentWaterLevel} cm</span>
                <span className="text-[10px] text-tertiary font-semibold">{incident.location?.environmental?.waterLevelTrend || 'Monitored'}</span>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-lg border border-[#e2e8df]">
                <span className="text-[9px] uppercase font-bold text-outline block" title="Source: Open-Meteo">Precipitation</span>
                <span className="font-headline text-xl font-bold text-on-surface mt-0.5 block">
                  {incident.rainfallAtIncident ?? (incident.location?.environmental?.rainfallMm ?? 0)} mm/h
                </span>
                <span className="text-[10px] text-primary font-semibold">Open-Meteo</span>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-lg border border-[#e2e8df]">
                <span className="text-[9px] uppercase font-bold text-outline block">Outflow</span>
                <span className="font-headline text-xl font-bold text-tertiary mt-0.5 block">
                  {incident.location?.environmental?.drainageFlowPct ?? 25}% cap.
                </span>
                <span className="text-[10px] text-on-surface-variant font-semibold">Modeled</span>
              </div>
            </div>

            {/* Depth Trend Sparkline */}
            <div className="bg-surface-container-low p-2.5 rounded-lg border border-[#e2e8df] mt-2">
              <div className="flex justify-between text-[10px] text-on-surface-variant font-bold mb-1">
                <span>Modeled Inundation Depth Curve</span>
                <span className="text-on-surface-variant font-semibold">Trend: {incident.location?.environmental?.waterLevelTrend || 'Stable'}</span>
              </div>
              <div className="w-full h-10">
                <svg className="w-full h-full text-error" fill="none" preserveAspectRatio="none" viewBox="0 0 300 48">
                  <path d="M0,42 L25,40 L50,38 L75,34 L100,35 L125,28 L150,22 L175,18 L200,10 L225,8 L250,6 L275,7 L300,6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M0,42 L25,40 L50,38 L75,34 L100,35 L125,28 L150,22 L175,18 L200,10 L225,8 L250,6 L275,7 L300,6 L300,48 L0,48 Z" fill="currentColor" fillOpacity="0.08" />
                </svg>
              </div>
              <div className="flex justify-between text-[9px] text-on-surface-variant mt-1">
                <span>T-60m</span>
                <span>T-30m</span>
                <span className="text-error font-bold">Current ({currentWaterLevel}cm)</span>
              </div>
            </div>
          </div>

          {/* Assigned Response Unit Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-[#e2e8df] shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between pb-2 border-b border-[#e2e8df]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm border border-primary/30">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline text-sm font-bold text-on-surface">
                    {incident.responseTeam?.name || 'Municipal Response Team A'}
                  </h3>
                  <span className="text-[11px] text-primary font-bold">
                    {incident.responseTeam?.unitType || 'Rapid Hydro Unit'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded">
                {incident.responseTeam?.status || 'EN ROUTE'}
              </span>
            </div>

            {/* Team Change Selector */}
            <div>
              <label className="text-[10px] uppercase font-bold text-outline block mb-1">
                Assign / Dispatch Team
              </label>
              <select
                value={incident.responseTeamId || ''}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface text-xs p-2 rounded border border-[#e2e8df] focus:outline-none focus:border-primary font-semibold"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.unitType}) &bull; Lead: {t.leadName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded-lg border border-[#e2e8df]">
              <div>
                <span className="text-[9px] uppercase font-bold text-outline block">Team Lead</span>
                <p className="text-xs font-bold text-on-surface mt-0.5">
                  {incident.responseTeam?.leadName || 'Capt. Marcus Vance'}
                </p>
                <span className="text-[10px] text-on-surface-variant">
                  {incident.responseTeam?.crewSize || 4} Crew Responders
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-outline block">Current Status</span>
                <p className="text-xs font-bold text-primary mt-0.5">
                  ETA: {incident.responseTeam?.eta || '~6-8 minutes'}
                </p>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  Vehicle: {incident.responseTeam?.vehicleId || '#RH-04'}
                </span>
              </div>
            </div>

            {/* Equipment Pills */}
            <div>
              <span className="text-[10px] uppercase font-bold text-outline block mb-1">Equipment on Board</span>
              <div className="flex flex-wrap gap-1">
                {[
                  '2x 4-inch Submersible Sump Pumps',
                  'Traffic Cones & Detour Signage',
                  'Emergency Hydro Diverters',
                  'High-Volume Siphon Tubes'
                ].map((eq, idx) => (
                  <span key={idx} className="bg-surface-container-high px-2 py-0.5 rounded text-[10px] text-on-surface font-medium border border-[#e2e8df]">
                    {eq}
                  </span>
                ))}
              </div>
            </div>

            {/* Dispatch Radio Channel */}
            <div className="pt-2 border-t border-[#e2e8df]">
              <button
                type="button"
                onClick={() => alert(`Radio link opened: ${incident.responseTeam?.radioChannel || 'Channel 4 Active (TANGO-4-HYDRO)'}`)}
                className="w-full flex items-center justify-center gap-2 bg-surface-container hover:bg-secondary-container text-on-secondary-container py-2 px-3 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                <Radio className="w-4 h-4" />
                <span>Dispatch Radio Link (Channel 4 Active)</span>
              </button>
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant mt-1.5 px-1">
                <span>Tactical Call: TANGO-4-HYDRO</span>
                <span className="text-primary font-bold">Frequency Locked</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
