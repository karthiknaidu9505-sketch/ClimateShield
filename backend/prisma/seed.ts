import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ClimateShield Supabase PostgreSQL database...');

  // 1. Clean existing records in reverse dependency order
  try {
    await prisma.historicalRiskData.deleteMany({});
    await prisma.incidentNote.deleteMany({});
    await prisma.responseAction.deleteMany({});
    await prisma.incident.deleteMany({});
    await prisma.riskAssessment.deleteMany({});
    await prisma.environmentalReading.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.zone.deleteMany({});
    await prisma.userJurisdiction.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.responseTeam.deleteMany({});
    await prisma.jurisdiction.deleteMany({});
    await prisma.organization.deleteMany({});
  } catch (err) {
    console.warn('Initial cleanup note (tables may be newly created):', err);
  }

  // 2. Seed Organization (Multi-Tenant Root)
  const organization = await prisma.organization.create({
    data: {
      id: 'org-amalapuram-mc',
      name: 'Amalapuram Municipal Corporation',
      code: 'AMC-AP'
    }
  });

  // 3. Seed Geographic Jurisdiction
  const jurisdiction = await prisma.jurisdiction.create({
    data: {
      id: 'jur-amalapuram-region',
      organizationId: organization.id,
      name: 'Amalapuram Region Operations Command',
      code: 'AMALAPURAM-REGION',
      centerLat: 16.5787,
      centerLng: 82.0061,
      boundaryGeoJson: {
        type: 'Polygon',
        coordinates: [
          [
            [81.98, 16.55],
            [82.04, 16.55],
            [82.04, 16.61],
            [81.98, 16.61],
            [81.98, 16.55]
          ]
        ]
      }
    }
  });

  // 4. Seed Administrative Zones / Catchment Basins
  const zoneSector7 = await prisma.zone.create({
    data: {
      id: 'zone-sector-7',
      jurisdictionId: jurisdiction.id,
      name: 'Sector 4B / Sector 7',
      code: 'SEC-7',
      drainageRating: 'POOR'
    }
  });

  const zoneSector2 = await prisma.zone.create({
    data: {
      id: 'zone-sector-2',
      jurisdictionId: jurisdiction.id,
      name: 'Sector 2 Commercial Arterial',
      code: 'SEC-2',
      drainageRating: 'MODERATE'
    }
  });

  const zoneEast = await prisma.zone.create({
    data: {
      id: 'zone-east-basin',
      jurisdictionId: jurisdiction.id,
      name: 'East Riverbank Drainage Basin',
      code: 'BASIN-EAST',
      drainageRating: 'CRITICAL'
    }
  });

  // 5. Seed Response Teams (Emergency Units)
  const teamA = await prisma.responseTeam.create({
    data: {
      id: 'team-alpha-01',
      jurisdictionId: jurisdiction.id,
      name: 'Municipal Response Team A',
      unitType: 'Rapid Hydro Unit',
      leadName: 'Capt. Marcus Vance',
      crewSize: 4,
      status: 'EN_ROUTE',
      eta: '6-8 minutes',
      vehicleId: '#RH-04',
      radioChannel: 'Channel 4 Active (TANGO-4-HYDRO)',
      equipment: [
        '2x 4-inch Submersible Sump Pumps',
        'Traffic Cones & Deployable Barricades',
        'Emergency Siphon Tubes',
        'Inflatable Rapid Flood Barrier (50m)'
      ]
    }
  });

  const teamB = await prisma.responseTeam.create({
    data: {
      id: 'team-bravo-02',
      jurisdictionId: jurisdiction.id,
      name: 'Municipal Response Team B',
      unitType: 'Civil Protection & Drainage Crew',
      leadName: 'Lt. Sarah Chen',
      crewSize: 6,
      status: 'STANDBY',
      eta: '14 minutes',
      vehicleId: '#CP-09',
      radioChannel: 'Channel 2 (BRAVO-DRAIN)',
      equipment: [
        'High-Capacity Vacuum Trash Pump',
        'Culvert Snake & Silt Dredge',
        'Mobile Generator Unit (30kVA)'
      ]
    }
  });

  // 6. Seed Operations User Profile (Linked to Supabase Auth ID)
  // Note: NO plaintext passwords are stored in our application database!
  const userElena = await prisma.user.create({
    data: {
      id: 'user-elena-vance', // Corresponds to Supabase auth.users.id
      email: 'admin@climateshield.demo',
      name: 'Elena Vance',
      role: 'OPERATOR',
      organizationId: organization.id,
      primaryJurisdictionId: jurisdiction.id,
      responseTeamId: teamA.id
    }
  });

  await prisma.userJurisdiction.create({
    data: {
      userId: userElena.id,
      jurisdictionId: jurisdiction.id,
      isDefault: true
    }
  });

  // 7. Seed Locations, Assets, Readings, and Assessments
  // Location 1: Railway Underpass (CRITICAL ~ 87)
  const railwayUnderpass = await prisma.location.create({
    data: {
      id: 'loc-railway-underpass',
      jurisdictionId: jurisdiction.id,
      zoneId: zoneSector7.id,
      name: 'Railway Underpass',
      sector: 'Sector 4B / Sector 7',
      district: 'Amalapuram / Metro District North',
      latitude: 16.58,
      longitude: 82.00,
      assetType: 'Road',
      drainageCondition: 'Poor',
      historicalIncidents: 12,
      elevationMeters: -1.8,
      catchmentAreaKm2: 2.4,
      description: 'Depression topography under arterial railway embankment with severe surface runoff convergence during rapid downpours.'
    }
  });

  await prisma.asset.createMany({
    data: [
      {
        locationId: railwayUnderpass.id,
        name: 'Primary Arterial Transit Route',
        type: 'Transit',
        criticality: 'Critical',
        impactNotice: '14,000 daily commuters and key freight corridor between Industrial Sector 4 and Downtown terminal.'
      },
      {
        locationId: railwayUnderpass.id,
        name: 'Emergency Response Route A',
        type: 'Hospital',
        criticality: 'Critical',
        impactNotice: 'Primary rapid route for Metro General Hospital ambulances. Reroute adds +11 minutes to transit times.'
      },
      {
        locationId: railwayUnderpass.id,
        name: 'Nearby Commercial Plaza',
        type: 'Commercial',
        criticality: 'High',
        impactNotice: '22 ground-floor storefronts within 200m flood boundary. Risk of inventory inundation if water breaches 50cm.'
      }
    ]
  });

  await prisma.environmentalReading.create({
    data: {
      locationId: railwayUnderpass.id,
      rainfallMm: 85.0,
      waterLevelCm: 42.0,
      drainageFlowPct: 18.0,
      waterLevelTrend: 'RISING',
      riseRate: '+4cm / 15min'
    }
  });

  await prisma.riskAssessment.create({
    data: {
      locationId: railwayUnderpass.id,
      riskScore: 87,
      riskLevel: 'CRITICAL',
      rainfallScore: 25.5,
      waterLevelScore: 26.0,
      drainageScore: 17.5,
      historyScore: 18.0,
      contributingFactors: [
        {
          title: 'Sustained Heavy Rainfall (85mm/h)',
          description: 'Precipitation volume exceeds 10-year storm drain design capacity. Runoff velocity has saturated perimeter ditches.',
          impact: 'HIGH'
        },
        {
          title: 'Rising Water Level (42cm)',
          description: 'Water depth has breached roadway curb threshold and is nearing vehicle stall depth (45cm).',
          impact: 'HIGH'
        },
        {
          title: 'Topographical Sump & Poor Drainage',
          description: 'Underpass represents the lowest point in a 2.4 sq km catchment with clogged secondary outflow gates.',
          impact: 'MEDIUM'
        },
        {
          title: 'Historical Inundation Hotspot (12 Events)',
          description: 'Site has flooded 12 times in the last 24 months during comparable rainfall events.',
          impact: 'HIGH'
        }
      ],
      recommendedActions: [
        { priority: 'Priority 1', title: 'Alert municipal team & dispatch rapid pump unit', description: 'Unit 4-Delta notified via automated radio link' },
        { priority: 'Priority 2', title: 'Inspect storm drain intake for debris obstruction', description: 'Grate clogging rate exceeds 65%' },
        { priority: 'Priority 3', title: 'Deploy mobile high-capacity water pumps', description: 'Deploy 2x 4-inch submersible pumps to lower water below 15cm' },
        { priority: 'Priority 4', title: 'Restrict road access & activate dynamic detour signs', description: 'Dynamic signs along Sector 4 and 7 routes' },
        { priority: 'Priority 5', title: 'Confirm water level recedes below 15cm & certify area safe', description: 'Engineering sign-off required prior to reopening' }
      ],
      aiExplanation: 'Severe runoff convergence at low-lying underpass sump (-1.8m elevation). Culvert surcharge at 18% capacity with +4cm/15min water rise rate requires immediate mobile pumping.',
      aiTacticalAdvice: 'Position high-volume submersible pumps at southern culvert inflow. Barricade eastbound transit access immediately before vehicle stall threshold (45cm) is breached.'
    }
  });

  // Location 2: Market Road Arterial (HIGH ~ 68)
  const marketRoad = await prisma.location.create({
    data: {
      id: 'loc-market-road',
      jurisdictionId: jurisdiction.id,
      zoneId: zoneSector2.id,
      name: 'Market Road Arterial',
      sector: 'Sector 2 Commercial',
      district: 'Amalapuram / Metro District North',
      latitude: 16.59,
      longitude: 82.02,
      assetType: 'Commercial',
      drainageCondition: 'Moderate',
      historicalIncidents: 8,
      elevationMeters: 0.4,
      catchmentAreaKm2: 1.8,
      description: 'High-density commercial thoroughfare with 94% impervious surface density and gutter surcharge during monsoonal downpours.'
    }
  });

  await prisma.asset.create({
    data: {
      locationId: marketRoad.id,
      name: 'Central Wholesale Produce Market',
      type: 'Commercial',
      criticality: 'High',
      impactNotice: '48 storefronts and logistics bays subject to street ponding.'
    }
  });

  await prisma.environmentalReading.create({
    data: {
      locationId: marketRoad.id,
      rainfallMm: 62.0,
      waterLevelCm: 28.0,
      drainageFlowPct: 45.0,
      waterLevelTrend: 'STABLE',
      riseRate: '+1cm / 15min'
    }
  });

  await prisma.riskAssessment.create({
    data: {
      locationId: marketRoad.id,
      riskScore: 68,
      riskLevel: 'HIGH',
      rainfallScore: 18.6,
      waterLevelScore: 17.5,
      drainageScore: 14.0,
      historyScore: 12.3,
      contributingFactors: [
        { title: 'Elevated Rainfall (62mm/h)', description: 'Surface sheet runoff across wide paved avenues.', impact: 'MEDIUM' },
        { title: 'Gutter Inundation (28cm)', description: 'Approaching sidewalk edge line.', impact: 'MEDIUM' }
      ],
      recommendedActions: [
        { priority: 'Priority 1', title: 'Clear roadside debris grates', description: 'Remove paper drift and vegetative blockage.' },
        { priority: 'Priority 2', title: 'Monitor commercial zone inflow', description: 'Check drain gate #4.' }
      ]
    }
  });

  // Location 3: Old Bus Stand Culvert (MEDIUM ~ 48)
  const oldBusStand = await prisma.location.create({
    data: {
      id: 'loc-old-bus-stand',
      jurisdictionId: jurisdiction.id,
      zoneId: zoneSector7.id,
      name: 'Old Bus Stand Culvert',
      sector: 'Sector 7 Transit Hub',
      district: 'Amalapuram / Metro District North',
      latitude: 16.57,
      longitude: 81.99,
      assetType: 'Transit',
      drainageCondition: 'Moderate',
      historicalIncidents: 6,
      elevationMeters: 1.2,
      catchmentAreaKm2: 1.1,
      description: 'Major regional bus depot passenger apron and municipal terminal drainage bottleneck.'
    }
  });

  await prisma.asset.create({
    data: {
      locationId: oldBusStand.id,
      name: 'Municipal Intercity Bus Terminal',
      type: 'Transit',
      criticality: 'High',
      impactNotice: 'Serves 28,000 regional commuters.'
    }
  });

  await prisma.environmentalReading.create({
    data: {
      locationId: oldBusStand.id,
      rainfallMm: 45.0,
      waterLevelCm: 16.0,
      drainageFlowPct: 62.0,
      waterLevelTrend: 'STABLE',
      riseRate: '0cm / 15min'
    }
  });

  await prisma.riskAssessment.create({
    data: {
      locationId: oldBusStand.id,
      riskScore: 48,
      riskLevel: 'MEDIUM',
      rainfallScore: 13.5,
      waterLevelScore: 10.0,
      drainageScore: 14.0,
      historyScore: 9.2,
      contributingFactors: [
        { title: 'Moderate Precipitation (45mm/h)', description: 'Within terminal drainage tolerance.', impact: 'LOW' }
      ],
      recommendedActions: [
        { priority: 'Priority 1', title: 'Inspect terminal perimeter ditch', description: 'Verify trash screen clearance.' }
      ]
    }
  });

  // Location 4: East Riverbank Siphon (MEDIUM ~ 38)
  const riverbankSiphon = await prisma.location.create({
    data: {
      id: 'loc-riverbank-siphon',
      jurisdictionId: jurisdiction.id,
      zoneId: zoneEast.id,
      name: 'East Riverbank Siphon',
      sector: 'East Riverbank',
      district: 'Amalapuram / Metro District North',
      latitude: 16.60,
      longitude: 82.03,
      assetType: 'Utility',
      drainageCondition: 'Good',
      historicalIncidents: 4,
      elevationMeters: 3.1,
      catchmentAreaKm2: 3.5,
      description: 'Outfall flume and siphon discharge point into regional canal network.'
    }
  });

  await prisma.asset.create({
    data: {
      locationId: riverbankSiphon.id,
      name: 'District Canal Siphon Gate',
      type: 'Utility',
      criticality: 'Moderate',
      impactNotice: 'Regulates water backflow into municipal drainage ditches.'
    }
  });

  await prisma.environmentalReading.create({
    data: {
      locationId: riverbankSiphon.id,
      rainfallMm: 38.0,
      waterLevelCm: 12.0,
      drainageFlowPct: 78.0,
      waterLevelTrend: 'RECEDING',
      riseRate: '-2cm / 15min'
    }
  });

  await prisma.riskAssessment.create({
    data: {
      locationId: riverbankSiphon.id,
      riskScore: 38,
      riskLevel: 'MEDIUM',
      rainfallScore: 11.4,
      waterLevelScore: 7.5,
      drainageScore: 4.0,
      historyScore: 6.1,
      contributingFactors: [
        { title: 'Controlled Flap Valve Flow', description: 'Flap gate operating normally.', impact: 'LOW' }
      ],
      recommendedActions: [
        { priority: 'Priority 1', title: 'Monitor tidal crest gauge', description: 'Check backflow prevention status.' }
      ]
    }
  });

  // 8. Seed Active Incident (INC-2024-089)
  const activeIncident = await prisma.incident.create({
    data: {
      id: 'inc-railway-001',
      incidentNumber: 'INC-2024-089',
      jurisdictionId: jurisdiction.id,
      locationId: railwayUnderpass.id,
      responseTeamId: teamA.id,
      declaredById: userElena.id,
      title: 'Railway Underpass Inundation Emergency',
      severity: 'CRITICAL',
      riskScore: 87,
      status: 'RESPONSE_IN_PROGRESS',
      waterLevelAtIncident: 42.0,
      rainfallAtIncident: 85.0,
      summary: 'Underpass culvert surcharge resulting in 42cm standing water across roadway. Unit 4-Delta on site.'
    }
  });

  await prisma.responseAction.createMany({
    data: [
      {
        incidentId: activeIncident.id,
        title: 'Alert municipal emergency response team',
        description: 'Automated notification dispatched to rapid response team',
        priority: 'Urgent',
        order: 1,
        isCompleted: true,
        completedAt: new Date(Date.now() - 3600000)
      },
      {
        incidentId: activeIncident.id,
        title: 'Inspect primary storm drain intake for debris obstruction',
        description: 'Culvert grates inspection for storm drift and vegetation',
        priority: 'Urgent',
        order: 2,
        isCompleted: true,
        completedAt: new Date(Date.now() - 1800000)
      },
      {
        incidentId: activeIncident.id,
        title: 'Deploy mobile high-capacity water pumps',
        description: 'Deploy 2x 4-inch submersible pumps to lower water below 15cm',
        priority: 'High Priority',
        order: 3,
        isCompleted: false
      },
      {
        incidentId: activeIncident.id,
        title: 'Restrict road access & activate dynamic detour signs',
        description: 'Position barriers and redirect transit traffic away from underpass',
        priority: 'High Priority',
        order: 4,
        isCompleted: false
      },
      {
        incidentId: activeIncident.id,
        title: 'Confirm water level recedes below 15cm & certify area safe',
        description: 'Engineering sign-off before reopening public corridor',
        priority: 'Standard',
        order: 5,
        isCompleted: false
      }
    ]
  });

  await prisma.incidentNote.createMany({
    data: [
      {
        incidentId: activeIncident.id,
        authorId: userElena.id,
        author: 'Elena Vance (Lead Operations Officer)',
        role: 'OPERATIONS',
        message: 'Incident declared for Railway Underpass. Severe runoff volume exceeding culvert intake. Unit 4-Delta deployed.'
      },
      {
        incidentId: activeIncident.id,
        author: 'Field Unit 4 (Capt. M. Vance)',
        role: 'FIELD',
        message: 'On site. Water level measured at 42cm at lowest elevation point. Primary intake grate clogged with construction runoff debris. Commencing debris removal.'
      },
      {
        incidentId: activeIncident.id,
        author: 'District Operations Command',
        role: 'AUTOMATED',
        message: 'Automated SMS notification dispatched to Municipal Transit Authority rerouting Bus Routes 14, 22, and 48.'
      }
    ]
  });

  // 9. Seed Historical Risk Data
  await prisma.historicalRiskData.create({
    data: {
      jurisdictionId: jurisdiction.id,
      year: 2024,
      summaryMetrics: {
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
      monthlyTrends: [
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
      ],
      recurringHotspots: [
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
      ]
    }
  });

  console.log('✅ ClimateShield database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
