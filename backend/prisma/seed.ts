import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ClimateShield database...');

  // 1. Clean existing records in reverse order
  await prisma.incidentNote.deleteMany({});
  await prisma.responseAction.deleteMany({});
  await prisma.incident.deleteMany({});
  await prisma.riskAssessment.deleteMany({});
  await prisma.environmentalReading.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.responseTeam.deleteMany({});
  await prisma.location.deleteMany({});

  // 2. Seed Response Teams
  const teamA = await prisma.responseTeam.create({
    data: {
      id: 'team-alpha-01',
      name: 'Municipal Response Team A',
      unitType: 'Rapid Hydro Unit',
      leadName: 'Capt. Marcus Vance',
      crewSize: 4,
      status: 'EN_ROUTE',
      eta: '6-8 minutes',
      vehicleId: '#RH-04',
      radioChannel: 'Channel 4 Active (TANGO-4-HYDRO)',
      equipment: JSON.stringify([
        '2x 4-inch Submersible Sump Pumps',
        'Traffic Cones',
        'Emergency Diverters',
        'High-Volume Siphon Tubes'
      ])
    }
  });

  const teamB = await prisma.responseTeam.create({
    data: {
      id: 'team-bravo-02',
      name: 'Municipal Response Team B',
      unitType: 'Civil Protection & Drainage Crew',
      leadName: 'Lt. Sarah Chen',
      crewSize: 6,
      status: 'STANDBY',
      eta: '14 minutes',
      vehicleId: '#CP-09',
      radioChannel: 'Channel 2 (BRAVO-DRAIN)',
      equipment: JSON.stringify([
        'High-Capacity Trash Pumps',
        'Inflatable Flood Barriers',
        'Generator Trailer'
      ])
    }
  });

  // 3. Seed Demo Operator
  await prisma.user.create({
    data: {
      id: 'user-elena-vance',
      email: 'admin@climateshield.demo',
      name: 'Elena Vance',
      role: 'OPERATOR',
      password: 'demo123', // In a production app, this would be hashed with bcrypt
      responseTeamId: teamA.id
    }
  });

  // 4. Seed Locations & Associated Assets & Readings
  // Location 1: Railway Underpass (CRITICAL ~ 87)
  const railwayUnderpass = await prisma.location.create({
    data: {
      id: 'loc-railway-underpass',
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
      contributingFactors: JSON.stringify([
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
      ]),
      recommendedActions: JSON.stringify([
        { priority: 'Priority 1', title: 'Alert municipal team & dispatch rapid pump unit', description: 'Unit 4-Delta notified via automated radio link' },
        { priority: 'Priority 2', title: 'Inspect storm drain intake for debris obstruction', description: 'Grate clogging rate exceeds 65%' },
        { priority: 'Priority 3', title: 'Prepare mobile barrier deployment & auxiliary pumps', description: 'Standby at Maintenance Yard 2 (6 min ETA)' },
        { priority: 'Priority 4', title: 'Restrict vehicle access & reroute traffic at 45cm', description: 'Current water is 42cm. Pre-trigger variable signage' }
      ])
    }
  });

  // Location 2: Market Road (HIGH ~ 71)
  const marketRoad = await prisma.location.create({
    data: {
      id: 'loc-market-road',
      name: 'Market Road Arterial',
      sector: 'Sector 5 Commercial',
      district: 'Amalapuram / Metro District North',
      latitude: 16.592,
      longitude: 82.015,
      assetType: 'Commercial',
      drainageCondition: 'Moderate',
      historicalIncidents: 8,
      elevationMeters: 1.2,
      catchmentAreaKm2: 1.8,
      description: 'High impervious surface density (94%) along commercial market corridor experiencing rapid pluvial runoff.'
    }
  });

  await prisma.asset.createMany({
    data: [
      {
        locationId: marketRoad.id,
        name: 'Commercial Market Arcade',
        type: 'Commercial',
        criticality: 'High',
        impactNotice: 'High-density retail strip with 45 merchant stalls prone to sidewalk ponding.'
      },
      {
        locationId: marketRoad.id,
        name: 'Central Freight Depot',
        type: 'Transit',
        criticality: 'Moderate',
        impactNotice: 'Logistics delivery hub for municipal supply chain.'
      }
    ]
  });

  await prisma.environmentalReading.create({
    data: {
      locationId: marketRoad.id,
      rainfallMm: 68.0,
      waterLevelCm: 29.0,
      drainageFlowPct: 48.0,
      waterLevelTrend: 'RISING',
      riseRate: '+2cm / 15min'
    }
  });

  await prisma.riskAssessment.create({
    data: {
      locationId: marketRoad.id,
      riskScore: 71,
      riskLevel: 'HIGH',
      rainfallScore: 20.4,
      waterLevelScore: 19.5,
      drainageScore: 13.0,
      historyScore: 18.0,
      contributingFactors: JSON.stringify([
        {
          title: 'High Pluvial Runoff (68mm/h)',
          description: 'Urban concrete runoff exceeding gutter inlet rate.',
          impact: 'HIGH'
        },
        {
          title: 'Water Level Ponding (29cm)',
          description: 'Street-level pooling reaching sidewalk boundaries.',
          impact: 'MEDIUM'
        },
        {
          title: 'Moderate Drainage Obstruction',
          description: 'Secondary culverts partially choked by market refuse.',
          impact: 'MEDIUM'
        }
      ]),
      recommendedActions: JSON.stringify([
        { priority: 'Priority 1', title: 'Clear curbside debris grates along Block 3', description: 'Prevent backwater accumulation' },
        { priority: 'Priority 2', title: 'Notify Traffic Command for lane restrictions', description: 'Divert low-chassis passenger vehicles' }
      ])
    }
  });

  // Location 3: University Campus (MEDIUM ~ 32)
  const universityCampus = await prisma.location.create({
    data: {
      id: 'loc-university-campus',
      name: 'University Campus',
      sector: 'Sector 2 Institutional',
      district: 'Amalapuram / Metro District North',
      latitude: 16.571,
      longitude: 81.988,
      assetType: 'Campus',
      drainageCondition: 'Good',
      historicalIncidents: 3,
      elevationMeters: 4.5,
      catchmentAreaKm2: 3.1,
      description: 'Expansive permeable quad lawns and retention swales buffering institutional research facilities.'
    }
  });

  await prisma.asset.createMany({
    data: [
      {
        locationId: universityCampus.id,
        name: 'University Science Laboratory',
        type: 'School',
        criticality: 'Moderate',
        impactNotice: 'Basement computer servers protected by elevated perimeter berm.'
      },
      {
        locationId: universityCampus.id,
        name: 'Student Health Clinic',
        type: 'Hospital',
        criticality: 'High',
        impactNotice: 'Civic secondary triage medical outpost.'
      }
    ]
  });

  await prisma.environmentalReading.create({
    data: {
      locationId: universityCampus.id,
      rainfallMm: 35.0,
      waterLevelCm: 10.0,
      drainageFlowPct: 78.0,
      waterLevelTrend: 'STABLE',
      riseRate: '0cm / 15min'
    }
  });

  await prisma.riskAssessment.create({
    data: {
      locationId: universityCampus.id,
      riskScore: 32,
      riskLevel: 'MEDIUM',
      rainfallScore: 10.5,
      waterLevelScore: 7.0,
      drainageScore: 6.0,
      historyScore: 8.5,
      contributingFactors: JSON.stringify([
        {
          title: 'Moderate Rainfall (35mm/h)',
          description: 'Well within local retention pond absorption limits.',
          impact: 'LOW'
        },
        {
          title: 'Minor Detention Swale Overflow',
          description: 'Local quad pond reached 65% capacity.',
          impact: 'LOW'
        }
      ]),
      recommendedActions: JSON.stringify([
        { priority: 'Standard', title: 'Automated monitoring of Retention Basin B', description: 'Ping every 60s' }
      ])
    }
  });

  // Location 4: Residential Zone (LOW ~ 18)
  const residentialZone = await prisma.location.create({
    data: {
      id: 'loc-residential-zone',
      name: 'North Residential Zone',
      sector: 'Sector 1 Uplands',
      district: 'Amalapuram / Metro District North',
      latitude: 16.565,
      longitude: 82.025,
      assetType: 'Residential',
      drainageCondition: 'Good',
      historicalIncidents: 1,
      elevationMeters: 8.2,
      catchmentAreaKm2: 4.0,
      description: 'Elevated topography with newly installed high-throughput subsurface stormwater mains.'
    }
  });

  await prisma.asset.createMany({
    data: [
      {
        locationId: residentialZone.id,
        name: 'Community Storm Shelter',
        type: 'Utility',
        criticality: 'Moderate',
        impactNotice: 'Operational emergency gathering point.'
      },
      {
        locationId: residentialZone.id,
        name: 'North Elementary School',
        type: 'School',
        criticality: 'Moderate',
        impactNotice: 'Designated civil emergency evacuation assembly hall.'
      }
    ]
  });

  await prisma.environmentalReading.create({
    data: {
      locationId: residentialZone.id,
      rainfallMm: 22.0,
      waterLevelCm: 5.0,
      drainageFlowPct: 92.0,
      waterLevelTrend: 'RECEDING',
      riseRate: '-1cm / 15min'
    }
  });

  await prisma.riskAssessment.create({
    data: {
      locationId: residentialZone.id,
      riskScore: 18,
      riskLevel: 'LOW',
      rainfallScore: 6.6,
      waterLevelScore: 3.5,
      drainageScore: 3.0,
      historyScore: 4.9,
      contributingFactors: JSON.stringify([
        {
          title: 'Light Storm Influx (22mm/h)',
          description: 'Subsurface stormwater lines functioning with 85% spare head capacity.',
          impact: 'LOW'
        }
      ]),
      recommendedActions: JSON.stringify([
        { priority: 'Standard', title: 'Routine sensor telemetry check', description: 'Maintain standard 60-min polling' }
      ])
    }
  });

  // 5. Seed Pre-existing Active Incident for Railway Underpass
  const incident1 = await prisma.incident.create({
    data: {
      id: 'inc-railway-001',
      incidentNumber: 'INC-2024-089',
      locationId: railwayUnderpass.id,
      responseTeamId: teamA.id,
      title: 'Railway Underpass Flooding',
      severity: 'CRITICAL',
      riskScore: 87,
      status: 'RESPONSE_IN_PROGRESS',
      waterLevelAtIncident: 42.0,
      rainfallAtIncident: 85.0,
      summary: 'Critical inundation observed at Railway Underpass. Inundation depth at 42cm and rising. Submersible bypass pump offline; Municipal Response Team A dispatched.'
    }
  });

  await prisma.responseAction.createMany({
    data: [
      {
        incidentId: incident1.id,
        title: 'Alert municipal emergency response team',
        description: 'Notified 10:40 AM • Dispatched Unit 4 & Traffic Division',
        priority: 'Urgent',
        order: 1,
        isCompleted: true,
        completedAt: new Date(Date.now() - 20 * 60 * 1000)
      },
      {
        incidentId: incident1.id,
        title: 'Inspect primary storm drain intakes for blockages',
        description: 'Field Unit 4 dispatched • Hydraulic culvert 9 monitored',
        priority: 'Urgent',
        order: 2,
        isCompleted: true,
        completedAt: new Date(Date.now() - 10 * 60 * 1000)
      },
      {
        incidentId: incident1.id,
        title: 'Deploy mobile high-capacity water pumps',
        description: 'Target: Pump trailer P-12 arriving with Municipal Unit A',
        priority: 'High Priority',
        order: 3,
        isCompleted: false
      },
      {
        incidentId: incident1.id,
        title: 'Restrict road access & activate dynamic detour signs',
        description: 'Signals awaiting manual override confirmation from Traffic Ops',
        priority: 'High Priority',
        order: 4,
        isCompleted: false
      },
      {
        incidentId: incident1.id,
        title: 'Confirm water level recedes below 15cm & certify area safe',
        description: 'Civil engineer site inspection sign-off required prior to reopening',
        priority: 'Standard',
        order: 5,
        isCompleted: false
      }
    ]
  });

  await prisma.incidentNote.createMany({
    data: [
      {
        incidentId: incident1.id,
        author: 'Field Unit 4 (Capt. M. Vance)',
        role: 'FIELD',
        message: 'En route, current ETA 6 minutes. Heavy standing water observed at west approach. Diverting to access gate C for pump deployment.'
      },
      {
        incidentId: incident1.id,
        author: 'Automated Alert: Surcharge Warning',
        role: 'SENSOR',
        message: 'Surcharge warning triggered on Culvert 9. Water depth exceeded safety threshold of 35cm. Fluvial backflow detector engaged.'
      }
    ]
  });

  console.log('Database successfully seeded with ClimateShield demo telemetry and incident data!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
