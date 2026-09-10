import { prisma } from '../../config/db.js';
import { RiskEngine } from '../risk/riskEngine.js';

export class LocationService {
  public static async getAllLocations() {
    const locations = await prisma.location.findMany({
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        assets: true,
        incidents: {
          where: { status: { not: 'RESOLVED' } }
        }
      }
    });

    // Compute dynamic live risk score for each location
    return locations.map(loc => {
      const latestReading = loc.readings[0] || {
        rainfallMm: 0,
        waterLevelCm: 0,
        drainageFlowPct: 100,
        waterLevelTrend: 'STABLE',
        riseRate: '0cm/15m'
      };

      const assessment = RiskEngine.calculateFloodRisk({
        rainfallMm: latestReading.rainfallMm,
        waterLevelCm: latestReading.waterLevelCm,
        drainageCondition: loc.drainageCondition,
        historicalIncidents: loc.historicalIncidents
      });

      return {
        id: loc.id,
        name: loc.name,
        sector: loc.sector,
        district: loc.district,
        latitude: loc.latitude,
        longitude: loc.longitude,
        assetType: loc.assetType,
        drainageCondition: loc.drainageCondition,
        historicalIncidents: loc.historicalIncidents,
        elevationMeters: loc.elevationMeters,
        catchmentAreaKm2: loc.catchmentAreaKm2,
        description: loc.description,
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        environmental: latestReading,
        assets: loc.assets,
        activeIncidentCount: loc.incidents.length
      };
    });
  }

  public static async getLocationById(id: string) {
    const loc = await prisma.location.findUnique({
      where: { id },
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 5
        },
        assets: true,
        incidents: {
          include: {
            actions: true,
            responseTeam: true,
            notes: {
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        riskAssessments: {
          orderBy: { evaluatedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!loc) return null;

    const latestReading = loc.readings[0] || {
      rainfallMm: 85,
      waterLevelCm: 42,
      drainageFlowPct: 18,
      waterLevelTrend: 'RISING',
      riseRate: '+4cm / 15min'
    };

    const calculation = RiskEngine.calculateFloodRisk({
      rainfallMm: latestReading.rainfallMm,
      waterLevelCm: latestReading.waterLevelCm,
      drainageCondition: loc.drainageCondition,
      historicalIncidents: loc.historicalIncidents
    });

    return {
      ...loc,
      riskScore: calculation.riskScore,
      riskLevel: calculation.riskLevel,
      factors: calculation.factors,
      recommendedActions: calculation.recommendedActions,
      components: calculation.components,
      latestReading
    };
  }
}
