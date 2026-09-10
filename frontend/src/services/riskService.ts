import { apiRequest, isOfflineMode } from './api.js';
import { FactorItem, ActionItem, RiskLevel } from '../types/index.js';
import { MOCK_LOCATIONS } from './mockData.js';

export interface LocationRiskResponse {
  success: boolean;
  locationId: string;
  locationName: string;
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

export const riskService = {
  async getRiskForLocation(locationId: string): Promise<LocationRiskResponse> {
    if (await isOfflineMode()) {
      const loc = MOCK_LOCATIONS.find((l) => l.id === locationId);
      if (!loc) throw new Error(`No mock data for location ${locationId}`);
      return {
        success: true,
        locationId: loc.id,
        locationName: loc.name,
        riskScore: loc.riskScore,
        riskLevel: loc.riskLevel,
        components: loc.components ?? { rainfallComponent: 0, waterLevelComponent: 0, drainageComponent: 0, historyComponent: 0 },
        factors: loc.factors ?? [],
        recommendedActions: loc.recommendedActions ?? [],
      };
    }
    return apiRequest<LocationRiskResponse>(`/risk/${locationId}`);
  },

  async calculateCustomRisk(params: {
    rainfallMm: number;
    waterLevelCm: number;
    drainageCondition?: string;
    historicalIncidents?: number;
  }) {
    if (await isOfflineMode()) {
      // Simple offline risk calculation formula
      const rf = Math.min((params.rainfallMm / 200) * 35, 35);
      const wl = Math.min((params.waterLevelCm / 120) * 35, 35);
      const dr = params.drainageCondition === 'POOR' ? 20 : params.drainageCondition === 'MODERATE' ? 12 : 5;
      const hi = Math.min(((params.historicalIncidents ?? 0) / 15) * 10, 10);
      const score = Math.round(rf + wl + dr + hi);
      const level: RiskLevel = score >= 75 ? 'CRITICAL' : score >= 55 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';
      return {
        success: true,
        data: {
          riskScore: score,
          riskLevel: level,
          components: { rainfallComponent: Math.round(rf), waterLevelComponent: Math.round(wl), drainageComponent: Math.round(dr), historyComponent: Math.round(hi) },
        },
      };
    }
    return apiRequest<{ success: boolean; data: any }>('/risk/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
