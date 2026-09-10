import { apiRequest } from './api.js';
import { FactorItem, ActionItem, RiskLevel } from '../types/index.js';

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
    return apiRequest<LocationRiskResponse>(`/risk/${locationId}`);
  },

  async calculateCustomRisk(params: {
    rainfallMm: number;
    waterLevelCm: number;
    drainageCondition?: string;
    historicalIncidents?: number;
  }) {
    return apiRequest<{ success: boolean; data: any }>('/risk/calculate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
};
