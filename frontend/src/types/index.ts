export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 
  | 'RISK_DETECTED' 
  | 'ALERT_SENT' 
  | 'TEAM_ASSIGNED' 
  | 'RESPONSE_IN_PROGRESS' 
  | 'RESOLVED';

export interface EnvironmentalReading {
  rainfallMm: number;
  waterLevelCm: number;
  drainageFlowPct: number;
  waterLevelTrend?: string;
  riseRate?: string;
  timestamp?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  criticality: string;
  impactNotice: string;
}

export interface FactorItem {
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ActionItem {
  priority: string;
  title: string;
  description: string;
}

export interface LocationItem {
  id: string;
  name: string;
  sector: string;
  district: string;
  latitude: number;
  longitude: number;
  assetType: string;
  drainageCondition: string;
  historicalIncidents: number;
  elevationMeters: number;
  catchmentAreaKm2: number;
  description: string;
  riskScore: number;
  riskLevel: RiskLevel;
  environmental: EnvironmentalReading;
  assets: Asset[];
  activeIncidentCount?: number;
  factors?: FactorItem[];
  recommendedActions?: ActionItem[];
  components?: {
    rainfallComponent: number;
    waterLevelComponent: number;
    drainageComponent: number;
    historyComponent: number;
  };
  latestReading?: EnvironmentalReading;
}

export interface ResponseAction {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  priority: string;
  order: number;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface IncidentNote {
  id: string;
  incidentId: string;
  author: string;
  role: string;
  message: string;
  createdAt: string;
}

export interface ResponseTeam {
  id: string;
  name: string;
  unitType: string;
  leadName: string;
  crewSize: number;
  status: string;
  eta: string;
  vehicleId: string;
  equipment: string[] | string;
  radioChannel: string;
}

export interface Incident {
  id: string;
  incidentNumber: string;
  locationId: string;
  location?: LocationItem;
  responseTeamId?: string | null;
  responseTeam?: ResponseTeam | null;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  status: IncidentStatus;
  waterLevelAtIncident: number;
  rainfallAtIncident: number;
  summary: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string | null;
  actions: ResponseAction[];
  notes: IncidentNote[];
}

export interface MonthlyTrend {
  month: string;
  incidents: number;
  isPeak: boolean;
  rainfallMm: number;
}

export interface RecurringHotspot {
  id: string;
  name: string;
  severity: string;
  incidents: number;
  elevationNotice: string;
  summary: string;
  lastEvent: string;
  mitigationPriority: string;
}

export interface HistoryAnalytics {
  summary: {
    totalIncidents: number;
    totalTrend: string;
    floodIncidents: number;
    floodSharePct: number;
    peakMonth: string;
    recurringHotspotsCount: number;
    resolvedRatePct: number;
    avgResolutionMinutes: number;
  };
  capitalDirective: {
    targetLocation: string;
    projectTitle: string;
    impactScore: number;
    description: string;
    estCostAvoidance: string;
    horizon: string;
  };
  monthlyTrends: MonthlyTrend[];
  recurringHotspots: RecurringHotspot[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  organizationId?: string;
  primaryJurisdiction?: string;
  primaryJurisdictionId?: string;
  authorizedJurisdictions?: string[];
  jurisdiction?: string;
  team?: string;
}
