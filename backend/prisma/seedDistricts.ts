import { PrismaClient } from '@prisma/client';
import { supabaseAdmin } from '../src/config/supabase.js';

const prisma = new PrismaClient();

export async function seedDistricts() {
  console.log('--- Seeding ClimateShield Multi-Tenant Districts ---');

  // 1. Provision Supabase Auth Users
  const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
  const existingUsers = listData?.users || [];

  // Elena Vance (Amalapuram)
  let elenaAuth = existingUsers.find(u => u.email === 'admin@climateshield.demo');
  if (!elenaAuth) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@climateshield.demo',
      password: 'demo123',
      email_confirm: true,
      user_metadata: { full_name: 'Elena Vance', role: 'OPERATOR', district: 'Amalapuram Region' }
    });
    if (error) console.warn('Supabase Auth Elena create warning:', error.message);
    else elenaAuth = data.user;
  }
  console.log('✓ Supabase Auth: admin@climateshield.demo (Elena Vance) active');

  // Ravi Kumar (Tuni)
  let raviAuth = existingUsers.find(u => u.email === 'operator.tuni@climateshield.demo');
  if (!raviAuth) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'operator.tuni@climateshield.demo',
      password: 'demo123',
      email_confirm: true,
      user_metadata: { full_name: 'Ravi Kumar', role: 'OPERATOR', district: 'Tuni District' }
    });
    if (error) console.warn('Supabase Auth Ravi create warning:', error.message);
    else raviAuth = data.user;
  }
  console.log('✓ Supabase Auth: operator.tuni@climateshield.demo (Ravi Kumar) active');

  // 2. Ensure Amalapuram Organization & Jurisdiction
  const amalapuramOrg = await prisma.organization.upsert({
    where: { code: 'AMC-AP' },
    update: {},
    create: {
      id: 'org-amalapuram-mc',
      name: 'Amalapuram Municipal Corporation',
      code: 'AMC-AP'
    }
  });

  const amalapuramJur = await prisma.jurisdiction.upsert({
    where: { code: 'AMALAPURAM-REGION' },
    update: {},
    create: {
      id: 'jur-amalapuram-region',
      organizationId: amalapuramOrg.id,
      name: 'Amalapuram Region Operations Command',
      code: 'AMALAPURAM-REGION',
      centerLat: 16.5787,
      centerLng: 82.0061
    }
  });

  // Ensure Elena Vance exists in database
  const elenaUser = await prisma.user.upsert({
    where: { email: 'admin@climateshield.demo' },
    update: {
      organizationId: amalapuramOrg.id,
      primaryJurisdictionId: amalapuramJur.id,
      role: 'OPERATOR'
    },
    create: {
      id: elenaAuth?.id || 'user-elena-vance',
      email: 'admin@climateshield.demo',
      name: 'Elena Vance',
      role: 'OPERATOR',
      organizationId: amalapuramOrg.id,
      primaryJurisdictionId: amalapuramJur.id
    }
  });

  await prisma.userJurisdiction.upsert({
    where: {
      userId_jurisdictionId: {
        userId: elenaUser.id,
        jurisdictionId: amalapuramJur.id
      }
    },
    update: {},
    create: {
      userId: elenaUser.id,
      jurisdictionId: amalapuramJur.id,
      isDefault: true
    }
  });
  console.log('✓ Amalapuram district and Elena Vance profile verified.');

  // 3. Provision Second District: Tuni Municipal Corporation
  const tuniOrg = await prisma.organization.upsert({
    where: { code: 'TMC-AP' },
    update: {},
    create: {
      id: 'org-tuni-mc',
      name: 'Tuni Municipal Corporation',
      code: 'TMC-AP'
    }
  });

  const tuniJur = await prisma.jurisdiction.upsert({
    where: { code: 'TUNI-DISTRICT' },
    update: {},
    create: {
      id: 'jur-tuni-district',
      organizationId: tuniOrg.id,
      name: 'Tuni District Operations Command',
      code: 'TUNI-DISTRICT',
      centerLat: 17.3597,
      centerLng: 82.5491,
      boundaryGeoJson: {
        type: 'Polygon',
        coordinates: [
          [
            [82.52, 17.33],
            [82.58, 17.33],
            [82.58, 17.39],
            [82.52, 17.39],
            [82.52, 17.33]
          ]
        ]
      }
    }
  });

  // Tuni Zone
  const tuniZoneHighway = await prisma.zone.upsert({
    where: { id: 'zone-tuni-highway' },
    update: {},
    create: {
      id: 'zone-tuni-highway',
      jurisdictionId: tuniJur.id,
      name: 'Tuni Highway Corridor',
      code: 'SEC-TUNI-HWY',
      drainageRating: 'POOR'
    }
  });

  // Tuni Response Team
  const tuniTeamAlpha = await prisma.responseTeam.upsert({
    where: { id: 'team-tuni-alpha' },
    update: {},
    create: {
      id: 'team-tuni-alpha',
      jurisdictionId: tuniJur.id,
      name: 'Tuni Rapid Hydro Unit Alpha',
      unitType: 'Rapid Drainage Response',
      leadName: 'Lt. Arjun Rao',
      crewSize: 5,
      status: 'STANDBY',
      eta: '8-10 minutes',
      vehicleId: '#TUNI-RH-01',
      radioChannel: 'Channel 6 Active (TUNI-HYDRO)',
      equipment: [
        '3x 4-inch Submersible Sump Pumps',
        'Mobile Trash Gate Barrier System',
        'Emergency Siphon Hose 100m'
      ]
    }
  });

  // Tuni Operator: Ravi Kumar
  const raviUser = await prisma.user.upsert({
    where: { email: 'operator.tuni@climateshield.demo' },
    update: {
      organizationId: tuniOrg.id,
      primaryJurisdictionId: tuniJur.id,
      role: 'OPERATOR',
      responseTeamId: tuniTeamAlpha.id
    },
    create: {
      id: raviAuth?.id || 'user-ravi-kumar-tuni',
      email: 'operator.tuni@climateshield.demo',
      name: 'Ravi Kumar',
      role: 'OPERATOR',
      organizationId: tuniOrg.id,
      primaryJurisdictionId: tuniJur.id,
      responseTeamId: tuniTeamAlpha.id
    }
  });

  await prisma.userJurisdiction.upsert({
    where: {
      userId_jurisdictionId: {
        userId: raviUser.id,
        jurisdictionId: tuniJur.id
      }
    },
    update: {},
    create: {
      userId: raviUser.id,
      jurisdictionId: tuniJur.id,
      isDefault: true
    }
  });
  console.log('✓ Tuni district and Ravi Kumar profile verified.');

  // 4. Tuni Locations
  // Location 1: Tuni Highway Junction
  const locTuniJunction = await prisma.location.upsert({
    where: { id: 'loc-tuni-junction' },
    update: {},
    create: {
      id: 'loc-tuni-junction',
      jurisdictionId: tuniJur.id,
      zoneId: tuniZoneHighway.id,
      name: 'Tuni Highway Junction Underpass',
      sector: 'North Arterial Sector',
      district: 'Tuni District',
      latitude: 17.3597,
      longitude: 82.5491,
      assetType: 'Road',
      drainageCondition: 'Poor',
      historicalIncidents: 9,
      elevationMeters: -1.2,
      catchmentAreaKm2: 3.1,
      description: 'National Highway underpass vulnerable to sheet wash runoff from the Eastern Ghats foothills.'
    }
  });

  const existingAsset1 = await prisma.asset.findFirst({ where: { locationId: locTuniJunction.id } });
  if (!existingAsset1) {
    await prisma.asset.create({
      data: {
        locationId: locTuniJunction.id,
        name: 'National Highway 16 Freight Corridor',
        type: 'Transit',
        criticality: 'Critical',
        impactNotice: '18,000 daily heavy transport vehicles along coastal freight route.'
      }
    });
  }

  const existingReading1 = await prisma.environmentalReading.findFirst({ where: { locationId: locTuniJunction.id } });
  if (!existingReading1) {
    await prisma.environmentalReading.create({
      data: {
        locationId: locTuniJunction.id,
        rainfallMm: 74.0,
        waterLevelCm: 38.0,
        drainageFlowPct: 22.0,
        waterLevelTrend: 'RISING',
        riseRate: '+3cm / 15min'
      }
    });
  }

  const existingAssessment1 = await prisma.riskAssessment.findFirst({ where: { locationId: locTuniJunction.id } });
  if (!existingAssessment1) {
    await prisma.riskAssessment.create({
      data: {
        locationId: locTuniJunction.id,
        riskScore: 79,
        riskLevel: 'HIGH',
        rainfallScore: 22.0,
        waterLevelScore: 23.5,
        drainageScore: 16.0,
        historyScore: 17.5,
        contributingFactors: [
          { title: 'Highway Runoff Convergence', description: 'Foothill runoff overtopping lateral highway drains.', impact: 'HIGH' },
          { title: 'Standing Water (38cm)', description: 'Lane 1 & 2 impassable for light commercial vehicles.', impact: 'HIGH' }
        ],
        recommendedActions: [
          { priority: 'Priority 1', title: 'Deploy mobile high-capacity dewatering pumps', description: 'Pump water to canal spillway' },
          { priority: 'Priority 2', title: 'Activate dynamic variable message signs', description: 'Divert light traffic to Bypass Road' }
        ],
        aiExplanation: 'Rapid runoff accumulation along low depression topography on NH-16. Standing water reaches 38cm with positive rise rate.',
        aiTacticalAdvice: 'Position rapid hydro unit at northern shoulder intake. Restrict eastern carriageway.'
      }
    });
  }

  // Location 2: Tuni Main Commercial Market
  const locTuniMarket = await prisma.location.upsert({
    where: { id: 'loc-tuni-market' },
    update: {},
    create: {
      id: 'loc-tuni-market',
      jurisdictionId: tuniJur.id,
      name: 'Tuni Main Bazaar Culvert',
      sector: 'Central Market Sector',
      district: 'Tuni District',
      latitude: 17.3650,
      longitude: 82.5520,
      assetType: 'Commercial',
      drainageCondition: 'Moderate',
      historicalIncidents: 5,
      elevationMeters: 0.8,
      catchmentAreaKm2: 1.5,
      description: 'Dense commercial market area with municipal storm drain intersection.'
    }
  });

  const existingAsset2 = await prisma.asset.findFirst({ where: { locationId: locTuniMarket.id } });
  if (!existingAsset2) {
    await prisma.asset.create({
      data: {
        locationId: locTuniMarket.id,
        name: 'Tuni Wholesale Grain Market',
        type: 'Commercial',
        criticality: 'High',
        impactNotice: '35 wholesale agro-produce storehouses susceptible to curb overflow.'
      }
    });
  }

  const existingReading2 = await prisma.environmentalReading.findFirst({ where: { locationId: locTuniMarket.id } });
  if (!existingReading2) {
    await prisma.environmentalReading.create({
      data: {
        locationId: locTuniMarket.id,
        rainfallMm: 52.0,
        waterLevelCm: 20.0,
        drainageFlowPct: 48.0,
        waterLevelTrend: 'STABLE',
        riseRate: '0cm / 15min'
      }
    });
  }

  // 5. Tuni Incident: inc-tuni-001
  const existingTuniInc = await prisma.incident.findUnique({ where: { id: 'inc-tuni-001' } });
  if (!existingTuniInc) {
    const inc = await prisma.incident.create({
      data: {
        id: 'inc-tuni-001',
        incidentNumber: 'INC-2024-TUNI-01',
        jurisdictionId: tuniJur.id,
        locationId: locTuniJunction.id,
        responseTeamId: tuniTeamAlpha.id,
        declaredById: raviUser.id,
        title: 'Tuni Highway Junction Surcharge Emergency',
        severity: 'HIGH',
        riskScore: 79,
        status: 'RESPONSE_IN_PROGRESS',
        waterLevelAtIncident: 38.0,
        rainfallAtIncident: 74.0,
        summary: 'NH-16 underpass culvert backflow causing 38cm pooling across westbound lanes. Hydro Team Alpha dispatched.'
      }
    });

    await prisma.responseAction.createMany({
      data: [
        {
          incidentId: inc.id,
          title: 'Alert Tuni Municipal Highway Patrol',
          description: 'Deploy highway division warning barriers',
          priority: 'Urgent',
          order: 1,
          isCompleted: true,
          completedAt: new Date(Date.now() - 1800000)
        },
        {
          incidentId: inc.id,
          title: 'Activate Highway Dewatering Sump Pump #1',
          description: 'Operate auxiliary pump at northern retention basin',
          priority: 'High Priority',
          order: 2,
          isCompleted: false
        }
      ]
    });

    await prisma.incidentNote.createMany({
      data: [
        {
          incidentId: inc.id,
          authorId: raviUser.id,
          author: 'Ravi Kumar (Tuni Operations Lead)',
          role: 'OPERATIONS',
          message: 'Water logging detected on westbound NH-16. Hydro Team Alpha en route with 3 submersible pumps.'
        }
      ]
    });
  }

  // 6. Tuni Historical Risk Data
  const existingHistory = await prisma.historicalRiskData.findFirst({ where: { jurisdictionId: tuniJur.id } });
  if (!existingHistory) {
    await prisma.historicalRiskData.create({
      data: {
        jurisdictionId: tuniJur.id,
        year: 2024,
        summaryMetrics: {
          totalIncidents: 16,
          totalTrend: '-8% vs prior cycle',
          floodIncidents: 11,
          floodSharePct: 68,
          peakMonth: 'August (4 incidents)',
          recurringHotspotsCount: 2,
          resolvedRatePct: 94,
          avgResolutionMinutes: 38
        },
        capitalDirective: {
          targetLocation: 'Tuni Highway Junction',
          projectTitle: 'NH-16 Culvert Deepening & Retention Basin Project',
          impactScore: 88,
          description: 'Expanding roadside retention capacity by 4,500 m3 will safeguard primary freight corridor.',
          estCostAvoidance: '$260,000 / yr',
          horizon: '60 Days'
        },
        monthlyTrends: [
          { month: 'Nov', incidents: 1, isPeak: false, rainfallMm: 40 },
          { month: 'Dec', incidents: 0, isPeak: false, rainfallMm: 10 },
          { month: 'Jan', incidents: 1, isPeak: false, rainfallMm: 30 },
          { month: 'Feb', incidents: 1, isPeak: false, rainfallMm: 45 },
          { month: 'Mar', incidents: 1, isPeak: false, rainfallMm: 38 },
          { month: 'Apr', incidents: 2, isPeak: false, rainfallMm: 55 },
          { month: 'May', incidents: 2, isPeak: false, rainfallMm: 68 },
          { month: 'Jun', incidents: 3, isPeak: false, rainfallMm: 85 },
          { month: 'Jul', incidents: 4, isPeak: true, rainfallMm: 125 },
          { month: 'Aug', incidents: 4, isPeak: true, rainfallMm: 130 },
          { month: 'Sep', incidents: 2, isPeak: false, rainfallMm: 72 },
          { month: 'Oct', incidents: 1, isPeak: false, rainfallMm: 48 }
        ],
        recurringHotspots: [
          {
            id: 'loc-tuni-junction',
            name: 'Tuni Highway Junction Underpass',
            severity: 'High',
            incidents: 9,
            elevationNotice: 'Sump elevation -1.2m below datum',
            summary: 'Runoff convergence during heavy downpours.',
            lastEvent: '12 days ago',
            mitigationPriority: 'Immediate'
          }
        ]
      }
    });
  }

  console.log('✅ Multi-tenant districts successfully seeded and verified.');
}

// Run standalone if executed directly
if (process.argv[1]?.endsWith('seedDistricts.ts') || process.argv[1]?.endsWith('seedDistricts.js')) {
  seedDistricts()
    .catch((e) => {
      console.error('Error seeding districts:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
