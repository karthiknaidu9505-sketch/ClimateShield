// -------------------------------------------------------------
//  ClimateShield � Offline Mock Data
//  Used when the backend is unreachable so the app works fully
//  without any server. All data mirrors the backend seed.
// -------------------------------------------------------------

import { LocationItem, Incident, ResponseTeam, HistoryAnalytics } from '../types/index.js';

// -- AUTH -----------------------------------------------------
export const MOCK_USER = {
  id: 'demo-user-1',
  name: 'Elena Vance',
  email: 'admin@climateshield.demo',
  role: 'Lead Operations Officer, District 4',
  jurisdiction: 'Amalapuram / Metro District North',
};

export const MOCK_TOKEN = 'demo-offline-jwt-token-climateshield-2024';

export const DEMO_CREDENTIALS = [
  { email: 'admin@climateshield.demo', password: 'demo123' },
  { email: 'admin', password: 'climateshield2024' },
  { email: 'demo', password: 'demo' },
];

export function checkDemoCredentials(email: string, password: string): boolean {
  return DEMO_CREDENTIALS.some(
    (c) => c.email === email.toLowerCase().trim() && c.password === password
  );
}

// -- TEAMS -----------------------------------------------------
export const MOCK_TEAMS: ResponseTeam[] = [
  { id: 'team-alpha', name: 'Alpha Flood Response', unitType: 'Flood Response', leadName: 'Insp. Ravi Kumar', crewSize: 8, status: 'DEPLOYED', eta: '4 min', vehicleId: 'FRU-04A', equipment: ['Mobile Pump Unit', 'Inflatable Rescue Boat', 'Water Barrier Kit'], radioChannel: 'CH-04A' },
  { id: 'team-bravo', name: 'Bravo Engineering', unitType: 'Drainage & Civil', leadName: 'Eng. Priya Sharma', crewSize: 5, status: 'STANDBY', eta: '12 min', vehicleId: 'ENG-07B', equipment: ['Vacuum Truck', 'Drain Snake', 'Submersible Pump x2'], radioChannel: 'CH-07B' },
  { id: 'team-charlie', name: 'Charlie Medical Aid', unitType: 'Medical & Evacuation', leadName: 'Dr. Meera Nair', crewSize: 4, status: 'STANDBY', eta: '8 min', vehicleId: 'MED-02C', equipment: ['First Aid Station', 'Stretcher x4', 'Emergency Medication Kit'], radioChannel: 'CH-02C' },
  { id: 'team-delta', name: 'Delta Traffic Control', unitType: 'Traffic & Barriers', leadName: 'SI Anand Pillai', crewSize: 6, status: 'DEPLOYED', eta: '2 min', vehicleId: 'TFC-09D', equipment: ['Road Barriers x20', 'Traffic Cones x50', 'LED Warning Signs x10'], radioChannel: 'CH-09D' },
];

// -- LOCATIONS ------------------------------------------------
export const MOCK_LOCATIONS: LocationItem[] = [
  {
    id: 'loc-railway-underpass', name: 'Railway Underpass � Station Rd', sector: 'Transport', district: 'Central',
    latitude: 16.5763, longitude: 81.5238, assetType: 'Underpass', drainageCondition: 'POOR',
    historicalIncidents: 12, elevationMeters: 2.1, catchmentAreaKm2: 4.8,
    description: 'Low-lying railway underpass prone to flash flooding during monsoon season. Drainage infrastructure is severely under-capacity.',
    riskScore: 87, riskLevel: 'CRITICAL',
    environmental: { rainfallMm: 142, waterLevelCm: 94, drainageFlowPct: 23, waterLevelTrend: 'RISING', riseRate: '+3.2 cm/hr', timestamp: new Date(Date.now() - 480000).toISOString() },
    assets: [
      { id: 'ast-01', name: 'Pedestrian Walkway', type: 'Infrastructure', criticality: 'HIGH', impactNotice: 'Complete closure risk' },
      { id: 'ast-02', name: 'Vehicle Lane (2-way)', type: 'Transport', criticality: 'HIGH', impactNotice: 'Flooding likely above 80 cm water level' },
      { id: 'ast-03', name: 'Electrical Panel � Junction Box', type: 'Utility', criticality: 'CRITICAL', impactNotice: 'Submersion risk; electrocution hazard' },
    ],
    factors: [
      { title: 'Extreme Rainfall Intensity', description: '142 mm in 6 hours � 94th percentile for this catchment', impact: 'HIGH' },
      { title: 'Water Level Critical', description: '94 cm water level approaching historical flood threshold of 100 cm', impact: 'HIGH' },
      { title: 'Severely Blocked Drainage', description: 'Only 23% drainage flow capacity � debris blockage confirmed by field audit', impact: 'HIGH' },
      { title: 'Historical Flood Hotspot', description: '12 recorded flooding incidents over 5 years � highest in district', impact: 'MEDIUM' },
    ],
    recommendedActions: [
      { priority: 'IMMEDIATE', title: 'Emergency Road Closure', description: 'Deploy barriers and redirect all vehicle and pedestrian traffic via Station Road bypass.' },
      { priority: 'IMMEDIATE', title: 'Dispatch Pump Unit Alpha', description: 'Mobilize mobile pump unit to begin active water extraction from the underpass channel.' },
      { priority: 'URGENT', title: 'Emergency Electrician', description: 'Isolate and de-energise the electrical junction box before water level reaches the panel threshold.' },
      { priority: 'URGENT', title: 'Clear Drainage Blockage', description: 'Maintenance crew to physically clear storm drain blockage with vacuum truck.' },
    ],
    components: { rainfallComponent: 28, waterLevelComponent: 32, drainageComponent: 20, historyComponent: 7 },
    activeIncidentCount: 2,
  },
  {
    id: 'loc-market-district', name: 'Market District � MG Road', sector: 'Commercial', district: 'Central',
    latitude: 16.5812, longitude: 81.5189, assetType: 'Commercial Zone', drainageCondition: 'MODERATE',
    historicalIncidents: 7, elevationMeters: 3.4, catchmentAreaKm2: 6.2,
    description: 'High-density commercial corridor with moderate flood risk due to aging drainage infrastructure and upstream catchment runoff.',
    riskScore: 68, riskLevel: 'HIGH',
    environmental: { rainfallMm: 98, waterLevelCm: 61, drainageFlowPct: 52, waterLevelTrend: 'RISING', riseRate: '+1.8 cm/hr', timestamp: new Date(Date.now() - 720000).toISOString() },
    assets: [
      { id: 'ast-04', name: 'MG Road Main Carriageway', type: 'Transport', criticality: 'HIGH', impactNotice: 'Flood risk above 75 cm water level' },
      { id: 'ast-05', name: 'Municipal Market Building', type: 'Commercial', criticality: 'MEDIUM', impactNotice: 'Ground floor inventory risk' },
    ],
    factors: [
      { title: 'High Rainfall', description: '98 mm in 6 hours � above 75th percentile threshold', impact: 'HIGH' },
      { title: 'Rising Water Level', description: 'Water level rising at 1.8 cm/hr � projected critical threshold in 7 hours', impact: 'MEDIUM' },
      { title: 'Partial Drainage Blockage', description: 'Drainage at 52% capacity � moderate blockage detected', impact: 'MEDIUM' },
    ],
    recommendedActions: [
      { priority: 'URGENT', title: 'Issue Flood Watch Advisory', description: 'Send SMS and public PA advisory for basement and ground floor clearance along MG Road.' },
      { priority: 'URGENT', title: 'Pre-position Pump Units', description: 'Stage pump units at northern end of MG Road ready for rapid deployment.' },
    ],
    components: { rainfallComponent: 20, waterLevelComponent: 22, drainageComponent: 16, historyComponent: 10 },
    activeIncidentCount: 1,
  },
  {
    id: 'loc-riverside-colony', name: 'Riverside Colony � Ward 7', sector: 'Residential', district: 'North',
    latitude: 16.5901, longitude: 81.5312, assetType: 'Residential Zone', drainageCondition: 'GOOD',
    historicalIncidents: 3, elevationMeters: 5.2, catchmentAreaKm2: 3.1,
    description: 'Residential ward adjacent to the Godavari tributary with currently contained risk levels.',
    riskScore: 41, riskLevel: 'MEDIUM',
    environmental: { rainfallMm: 65, waterLevelCm: 38, drainageFlowPct: 78, waterLevelTrend: 'STABLE', riseRate: '+0.4 cm/hr', timestamp: new Date(Date.now() - 300000).toISOString() },
    assets: [
      { id: 'ast-07', name: 'Ward 7 Access Road', type: 'Transport', criticality: 'MEDIUM', impactNotice: 'Risk low at current levels' },
      { id: 'ast-08', name: 'Primary Health Centre', type: 'Healthcare', criticality: 'CRITICAL', impactNotice: 'Monitor; evacuate if water exceeds 60 cm' },
    ],
    factors: [
      { title: 'Moderate Rainfall', description: '65 mm � within manageable range for this sector', impact: 'MEDIUM' },
      { title: 'Good Drainage', description: '78% drainage capacity � system operating normally', impact: 'LOW' },
    ],
    recommendedActions: [{ priority: 'MONITORING', title: 'Monitor PHC Access', description: 'Ensure Primary Health Centre access road remains passable; trigger alert at 55 cm.' }],
    components: { rainfallComponent: 13, waterLevelComponent: 14, drainageComponent: 6, historyComponent: 8 },
    activeIncidentCount: 0,
  },
  {
    id: 'loc-hospital-junction', name: 'General Hospital Junction', sector: 'Healthcare', district: 'South',
    latitude: 16.5698, longitude: 81.5147, assetType: 'Critical Infrastructure', drainageCondition: 'MODERATE',
    historicalIncidents: 5, elevationMeters: 4.1, catchmentAreaKm2: 2.8,
    description: 'Access corridor to the district general hospital. Any flooding here cuts emergency vehicle access to the hospital.',
    riskScore: 56, riskLevel: 'HIGH',
    environmental: { rainfallMm: 81, waterLevelCm: 52, drainageFlowPct: 61, waterLevelTrend: 'STABLE', riseRate: '+0.9 cm/hr', timestamp: new Date(Date.now() - 900000).toISOString() },
    assets: [
      { id: 'ast-09', name: 'Emergency Vehicle Lane', type: 'Transport', criticality: 'CRITICAL', impactNotice: 'Cannot be flooded � ambulance lifeline' },
      { id: 'ast-10', name: 'District General Hospital', type: 'Healthcare', criticality: 'CRITICAL', impactNotice: 'Flood risk to ground floor pharmacy and ICU' },
    ],
    factors: [
      { title: 'Critical Asset Proximity', description: 'Hospital emergency access at stake � any closure has life-safety implications', impact: 'HIGH' },
      { title: 'Moderate Rainfall', description: '81 mm � approaching alert threshold for this sector', impact: 'MEDIUM' },
    ],
    recommendedActions: [
      { priority: 'URGENT', title: 'Protect Emergency Lane', description: 'Deploy temporary flood barriers along the emergency vehicle lane perimeter.' },
    ],
    components: { rainfallComponent: 16, waterLevelComponent: 19, drainageComponent: 12, historyComponent: 9 },
    activeIncidentCount: 1,
  },
  {
    id: 'loc-bus-depot', name: 'Central Bus Depot', sector: 'Transport', district: 'East',
    latitude: 16.5745, longitude: 81.5398, assetType: 'Transport Hub', drainageCondition: 'POOR',
    historicalIncidents: 8, elevationMeters: 2.8, catchmentAreaKm2: 5.5,
    description: 'Major intercity bus terminus. Low elevation and poor drainage make it frequently impacted during heavy rain.',
    riskScore: 73, riskLevel: 'HIGH',
    environmental: { rainfallMm: 115, waterLevelCm: 72, drainageFlowPct: 31, waterLevelTrend: 'RISING', riseRate: '+2.1 cm/hr', timestamp: new Date(Date.now() - 180000).toISOString() },
    assets: [
      { id: 'ast-11', name: 'Bus Bays 1�24', type: 'Transport', criticality: 'HIGH', impactNotice: 'Flooding disrupts intercity connectivity' },
      { id: 'ast-12', name: 'Fuel Depot', type: 'Utility', criticality: 'CRITICAL', impactNotice: 'Flood contamination risk to fuel storage' },
    ],
    factors: [
      { title: 'High Rainfall', description: '115 mm � well above 80th percentile for this location', impact: 'HIGH' },
      { title: 'Poor Drainage', description: 'Only 31% drainage flow � significant debris accumulation', impact: 'HIGH' },
    ],
    recommendedActions: [
      { priority: 'IMMEDIATE', title: 'Suspend Bus Operations', description: 'Halt all bus arrivals and departures. Redirect to temporary terminus at Bypass Road.' },
    ],
    components: { rainfallComponent: 23, waterLevelComponent: 26, drainageComponent: 18, historyComponent: 6 },
    activeIncidentCount: 1,
  },
  {
    id: 'loc-old-town-bridge', name: 'Old Town Bridge � Kakinada Rd', sector: 'Transport', district: 'West',
    latitude: 16.5634, longitude: 81.5078, assetType: 'Bridge', drainageCondition: 'GOOD',
    historicalIncidents: 2, elevationMeters: 6.8, catchmentAreaKm2: 1.9,
    description: 'Heritage bridge connecting old town to the commercial sector. Good elevation and low historical risk.',
    riskScore: 22, riskLevel: 'LOW',
    environmental: { rainfallMm: 38, waterLevelCm: 21, drainageFlowPct: 91, waterLevelTrend: 'STABLE', riseRate: '+0.1 cm/hr', timestamp: new Date(Date.now() - 1200000).toISOString() },
    assets: [{ id: 'ast-13', name: 'Old Town Bridge Span', type: 'Infrastructure', criticality: 'HIGH', impactNotice: 'No current risk' }],
    factors: [{ title: 'Low Rainfall', description: '38 mm � well within safe operational parameters', impact: 'LOW' }],
    recommendedActions: [{ priority: 'MONITORING', title: 'Routine System Check', description: 'Standard system synchronization � no action required at current risk level.' }],
    components: { rainfallComponent: 5, waterLevelComponent: 8, drainageComponent: 3, historyComponent: 6 },
    activeIncidentCount: 0,
  },
];

// -- INCIDENTS -------------------------------------------------
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-001', incidentNumber: 'INC-2024-0847', locationId: 'loc-railway-underpass',
    location: MOCK_LOCATIONS[0], responseTeamId: 'team-alpha', responseTeam: MOCK_TEAMS[0],
    title: 'Flash Flood � Railway Underpass Critical', severity: 'CRITICAL', riskScore: 87,
    status: 'RESPONSE_IN_PROGRESS', waterLevelAtIncident: 94, rainfallAtIncident: 142,
    summary: 'Rapid water accumulation at Railway Underpass Station Rd. Hydrologic model indicates 94 cm inundation depth, rising at 3.2 cm/hr. Electrical junction box at submersion risk. Road closure and pump deployment in progress.',
    createdAt: new Date(Date.now() - 2880000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(), resolvedAt: null,
    actions: [
      { id: 'act-001', incidentId: 'inc-001', title: 'Road Closure � Deploy Barriers', description: 'Physical road barriers placed at north and south entry points', priority: 'IMMEDIATE', order: 1, isCompleted: true, completedAt: new Date(Date.now() - 2400000).toISOString() },
      { id: 'act-002', incidentId: 'inc-001', title: 'Dispatch Pump Unit Alpha', description: 'Mobile pump unit FRU-04A en route to site for water extraction', priority: 'IMMEDIATE', order: 2, isCompleted: true, completedAt: new Date(Date.now() - 1800000).toISOString() },
      { id: 'act-003', incidentId: 'inc-001', title: 'Isolate Electrical Junction Box', description: 'Emergency electrician notified; junction box isolation in progress', priority: 'IMMEDIATE', order: 3, isCompleted: false, completedAt: null },
      { id: 'act-004', incidentId: 'inc-001', title: 'Clear Drainage Blockage', description: 'Vacuum truck dispatched to clear storm drain blockage', priority: 'URGENT', order: 4, isCompleted: false, completedAt: null },
      { id: 'act-005', incidentId: 'inc-001', title: 'Public Safety Announcement', description: 'PA system and SMS broadcast issued for 500m radius', priority: 'URGENT', order: 5, isCompleted: true, completedAt: new Date(Date.now() - 1500000).toISOString() },
    ],
    notes: [
      { id: 'note-001', incidentId: 'inc-001', author: 'Elena Vance', role: 'Lead Operations Officer', message: 'Confirmed visual from site � water is at culvert drain level. Pump unit has arrived and begun extraction. Electrical team 10 minutes away.', createdAt: new Date(Date.now() - 900000).toISOString() },
      { id: 'note-002', incidentId: 'inc-001', author: 'Insp. Ravi Kumar', role: 'Alpha Team Lead', message: 'Road barriers deployed. Civilian traffic diverted via Station Road bypass. Pump extracting approx 800 L/min. Water level rise appears to be slowing.', createdAt: new Date(Date.now() - 480000).toISOString() },
    ],
  },
  {
    id: 'inc-002', incidentNumber: 'INC-2024-0848', locationId: 'loc-market-district',
    location: MOCK_LOCATIONS[1], responseTeamId: 'team-bravo', responseTeam: MOCK_TEAMS[1],
    title: 'Flood Watch � MG Road Market Zone', severity: 'HIGH', riskScore: 68,
    status: 'ALERT_SENT', waterLevelAtIncident: 61, rainfallAtIncident: 98,
    summary: 'Rising water levels on MG Road market corridor. Pre-emptive advisory issued to traders and residents. Pump units on standby.',
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString(), resolvedAt: null,
    actions: [
      { id: 'act-006', incidentId: 'inc-002', title: 'Issue Flood Watch Advisory', description: 'SMS and PA advisory sent to 2,400 registered contacts in MG Road sector', priority: 'URGENT', order: 1, isCompleted: true, completedAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'act-007', incidentId: 'inc-002', title: 'Pre-position Pump Units', description: 'Stage pump units at northern end of MG Road', priority: 'URGENT', order: 2, isCompleted: false, completedAt: null },
      { id: 'act-008', incidentId: 'inc-002', title: 'Monitor Hydrologic Model', description: 'Increase data sync frequency to every 5 minutes', priority: 'MONITORING', order: 3, isCompleted: true, completedAt: new Date(Date.now() - 2700000).toISOString() },
    ],
    notes: [
      { id: 'note-003', incidentId: 'inc-002', author: 'Elena Vance', role: 'Lead Operations Officer', message: 'Advisory sent. Market traders have been notified. Situation is being monitored � will escalate if water level exceeds 75 cm.', createdAt: new Date(Date.now() - 3300000).toISOString() },
    ],
  },
  {
    id: 'inc-003', incidentNumber: 'INC-2024-0843', locationId: 'loc-bus-depot',
    location: MOCK_LOCATIONS[4], responseTeamId: 'team-delta', responseTeam: MOCK_TEAMS[3],
    title: 'Bus Depot Flooding � Operations Suspended', severity: 'HIGH', riskScore: 73,
    status: 'TEAM_ASSIGNED', waterLevelAtIncident: 72, rainfallAtIncident: 115,
    summary: 'Central Bus Depot experiencing significant flooding. All bus operations suspended. Traffic team deployed to manage diversion.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(), resolvedAt: null,
    actions: [
      { id: 'act-009', incidentId: 'inc-003', title: 'Suspend Bus Operations', description: 'All departures and arrivals halted; temporary terminus at Bypass Road activated', priority: 'IMMEDIATE', order: 1, isCompleted: true, completedAt: new Date(Date.now() - 5400000).toISOString() },
      { id: 'act-010', incidentId: 'inc-003', title: 'Deploy Traffic Diversion', description: 'Traffic signs and officers deployed to redirect passengers', priority: 'URGENT', order: 2, isCompleted: true, completedAt: new Date(Date.now() - 4200000).toISOString() },
      { id: 'act-011', incidentId: 'inc-003', title: 'Secure Fuel Depot Containment', description: 'Secondary containment activated at fuel storage', priority: 'URGENT', order: 3, isCompleted: false, completedAt: null },
    ],
    notes: [],
  },
  {
    id: 'inc-004', incidentNumber: 'INC-2024-0819', locationId: 'loc-hospital-junction',
    location: MOCK_LOCATIONS[3], responseTeamId: null, responseTeam: null,
    title: 'Risk Detected � Hospital Junction', severity: 'HIGH', riskScore: 56,
    status: 'RISK_DETECTED', waterLevelAtIncident: 52, rainfallAtIncident: 81,
    summary: 'Elevated risk at hospital access junction. Emergency vehicle lane integrity must be maintained. Monitoring in progress.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(), resolvedAt: null,
    actions: [
      { id: 'act-012', incidentId: 'inc-004', title: 'Assess Emergency Lane Status', description: 'Field officer to physically inspect emergency vehicle access lane condition', priority: 'URGENT', order: 1, isCompleted: false, completedAt: null },
      { id: 'act-013', incidentId: 'inc-004', title: 'Alert Hospital Facilities', description: 'Contact hospital facilities manager to activate internal flood protocol', priority: 'URGENT', order: 2, isCompleted: false, completedAt: null },
    ],
    notes: [],
  },
];

// -- HISTORY / ANALYTICS --------------------------------------
export const MOCK_HISTORY: HistoryAnalytics = {
  summary: { totalIncidents: 47, totalTrend: '+12% vs last year', floodIncidents: 38, floodSharePct: 81, peakMonth: 'August', recurringHotspotsCount: 4, resolvedRatePct: 94, avgResolutionMinutes: 127 },
  capitalDirective: { targetLocation: 'Railway Underpass � Station Rd', projectTitle: 'Storm Drain Capacity Upgrade � Phase 1', impactScore: 94, description: 'Replacing 320m of undersized 600mm culvert with 1200mm box culvert. Reduces critical flood events by an estimated 73% at the highest-risk hotspot in the district.', estCostAvoidance: '?2.4 Cr annually', horizon: '18 months' },
  monthlyTrends: [
    { month: 'Jan', incidents: 1, isPeak: false, rainfallMm: 12 }, { month: 'Feb', incidents: 0, isPeak: false, rainfallMm: 8 },
    { month: 'Mar', incidents: 1, isPeak: false, rainfallMm: 18 }, { month: 'Apr', incidents: 2, isPeak: false, rainfallMm: 34 },
    { month: 'May', incidents: 3, isPeak: false, rainfallMm: 68 }, { month: 'Jun', incidents: 6, isPeak: false, rainfallMm: 142 },
    { month: 'Jul', incidents: 9, isPeak: false, rainfallMm: 198 }, { month: 'Aug', incidents: 14, isPeak: true, rainfallMm: 241 },
    { month: 'Sep', incidents: 8, isPeak: false, rainfallMm: 179 }, { month: 'Oct', incidents: 2, isPeak: false, rainfallMm: 52 },
    { month: 'Nov', incidents: 1, isPeak: false, rainfallMm: 21 }, { month: 'Dec', incidents: 0, isPeak: false, rainfallMm: 9 },
  ],
  recurringHotspots: [
    { id: 'hs-01', name: 'Railway Underpass � Station Rd', severity: 'CRITICAL', incidents: 12, elevationNotice: 'Elevation 2.1m (district low-point)', summary: 'Highest-frequency flood hotspot in the district. Sub-standard culvert capacity combined with catchment runoff creates critical flash flood conditions during moderate-to-heavy rainfall.', lastEvent: '8 hrs ago', mitigationPriority: 'Priority 1 � Capital Project Approved' },
    { id: 'hs-02', name: 'Central Bus Depot', severity: 'HIGH', incidents: 8, elevationNotice: 'Elevation 2.8m', summary: 'Poor drainage condition and low elevation result in regular flooding events. Operational disruption to intercity bus connectivity during monsoon season.', lastEvent: '2 hrs ago', mitigationPriority: 'Priority 2 � Drainage Upgrade Proposed' },
    { id: 'hs-03', name: 'Market District � MG Road', severity: 'HIGH', incidents: 7, elevationNotice: 'Elevation 3.4m', summary: 'High-density commercial area with aging 1980s drainage infrastructure. Upstream catchment increases risk significantly during sustained rainfall.', lastEvent: '3 hrs ago', mitigationPriority: 'Priority 3 � Engineering Study Underway' },
    { id: 'hs-04', name: 'Hospital Junction', severity: 'HIGH', incidents: 5, elevationNotice: 'Critical Asset Zone', summary: 'Life-safety critical location � emergency vehicle access lane must remain passable. Moderate drainage with high criticality due to hospital proximity.', lastEvent: '30 min ago', mitigationPriority: 'Priority 2 � Immediate Monitoring Required' },
  ],
};
