export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 
  | 'RISK_DETECTED' 
  | 'ALERT_SENT' 
  | 'TEAM_ASSIGNED' 
  | 'RESPONSE_IN_PROGRESS' 
  | 'RESOLVED';

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

export interface RiskCalculationInput {
  rainfallMm: number;
  waterLevelCm: number;
  drainageCondition: string; // 'Poor' | 'Moderate' | 'Good' | 'Critical'
  historicalIncidents: number;
}

export interface RiskCalculationResult {
  riskScore: number;
  riskLevel: RiskLevel;
  components: {
    rainfallComponent: number;
    waterLevelComponent: number;
    drainageComponent: number;
    historyComponent: number;
  };
  factors: FactorItem[];
  recommendedActions: ActionItem[];
}
