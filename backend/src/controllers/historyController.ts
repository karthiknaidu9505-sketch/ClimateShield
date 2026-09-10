import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getRiskHistory = async (_req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        incidents: true
      }
    });

    // 12-Month Historical Monthly Distribution matching Stitch data
    const monthlyTrends = [
      { month: 'Nov', incidents: 1, isPeak: false, rainfallMm: 45 },
      { month: 'Dec', incidents: 0, isPeak: false, rainfallMm: 12 },
      { month: 'Jan', incidents: 1, isPeak: false, rainfallMm: 38 },
      { month: 'Feb', incidents: 2, isPeak: false, rainfallMm: 52 },
      { month: 'Mar', incidents: 1, isPeak: false, rainfallMm: 41 },
      { month: 'Apr', incidents: 2, isPeak: false, rainfallMm: 60 },
      { month: 'May', incidents: 3, isPeak: false, rainfallMm: 75 },
      { month: 'Jun', incidents: 4, isPeak: false, rainfallMm: 98 },
      { month: 'Jul', incidents: 6, isPeak: true, rainfallMm: 142 }, // Peak monsoonal surge
      { month: 'Aug', incidents: 5, isPeak: true, rainfallMm: 118 },
      { month: 'Sep', incidents: 3, isPeak: false, rainfallMm: 80 },
      { month: 'Oct', incidents: 2, isPeak: false, rainfallMm: 55 }
    ];

    // Recurring Hotspots matching Stitch visual
    const recurringHotspots = [
      {
        id: 'loc-railway-underpass',
        name: 'Railway Underpass',
        severity: 'Critical',
        incidents: 12,
        elevationNotice: 'Sump elevation -1.8m below datum',
        summary: 'Chronic flood hotspot. Outflow siltation frequent during rapid cloudbursts; drainage pump #2 intermittent.',
        lastEvent: '18 days ago',
        mitigationPriority: 'Immediate'
      },
      {
        id: 'loc-market-road',
        name: 'Market Road Arterial',
        severity: 'High',
        incidents: 8,
        elevationNotice: 'Impervious surface density 94%',
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
      },
      {
        id: 'loc-riverbank-siphon',
        name: 'East Riverbank Siphon',
        severity: 'Medium',
        incidents: 4,
        elevationNotice: 'Tidal backwater effect',
        summary: 'Backflow through flap valve during high river crest levels coincident with intense precipitation.',
        lastEvent: '91 days ago',
        mitigationPriority: 'Scheduled Maintenance'
      }
    ];

    return res.json({
      success: true,
      summary: {
        totalIncidents: 25,
        totalTrend: '-14% vs prior annual cycle',
        floodIncidents: 18,
        floodSharePct: 72,
        peakMonth: 'July (6 incidents)',
        recurringHotspotsCount: 4,
        resolvedRatePct: 92,
        avgResolutionMinutes: 44
      },
      capitalDirective: {
        targetLocation: 'Railway Underpass',
        projectTitle: 'Railway Underpass: Dual Sluice Retrofit Directive',
        impactScore: 94,
        description: 'Railway Underpass has recorded 12 inundation events in 24 months, causing $420k in cumulative traffic delays and response costs. Retrofitting dual high-efficiency drainage sluices in Q1 would reduce local failure risk by an estimated 78%.',
        estCostAvoidance: '$340,000 / yr',
        horizon: '45 Days (Q1)'
      },
      monthlyTrends,
      recurringHotspots
    });
  } catch (error: any) {
    console.error('Error in getRiskHistory:', error);
    return res.status(500).json({ error: 'Failed to fetch risk history analytics.' });
  }
};
