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

// ─────────────────────────────────────────────────────────────
// Weather Ingestion & Environmental Reading Types
// ─────────────────────────────────────────────────────────────

export interface OpenMeteoCurrent {
  time: string;
  interval?: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation: number;
  rain: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  elevation?: number;
  current: OpenMeteoCurrent;
  hourly?: {
    time: string[];
    precipitation: number[];
    rain?: number[];
  };
}

export interface NormalizedWeatherReading {
  rainfallMm: number;
  waterLevelCm: number;
  drainageFlowPct: number;
  waterLevelTrend: 'RISING' | 'STABLE' | 'RECEDING';
  riseRate: string;
  rawTemperature?: number;
  rawHumidity?: number;
  rawWindSpeed?: number;
  weatherCode?: number;
}

export interface WeatherSyncLocationResult {
  locationId: string;
  locationName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  weather: {
    temperature: number;
    humidity: number;
    precipitation: number;
    rain: number;
    windSpeed: number;
    weatherCode: number;
    observedAt: string;
  };
  reading: {
    id: string;
    rainfallMm: number;
    waterLevelCm: number;
    drainageFlowPct: number;
    waterLevelTrend: string;
    riseRate: string;
    timestamp: string;
  };
  assessment: {
    id: string;
    riskScore: number;
    riskLevel: RiskLevel;
    components: RiskCalculationResult['components'];
    factorsCount: number;
    actionsCount: number;
  };
  previousRiskScore?: number;
}

export interface WeatherSyncReport {
  success: boolean;
  syncTimestamp: string;
  provider: string;
  summary: {
    totalLocations: number;
    syncedLocations: number;
    failedLocations: number;
  };
  results: WeatherSyncLocationResult[];
  errors?: Array<{ locationId: string; error: string }>;
}

