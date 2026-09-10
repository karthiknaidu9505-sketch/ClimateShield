import { ActionItem, FactorItem, RiskCalculationInput, RiskCalculationResult, RiskLevel } from '../../types/index.js';

export class RiskEngine {
  /**
   * Transparent Urban Flood-Risk Calculation
   * Weights:
   *  - Rainfall: 30%
   *  - Water Level: 30%
   *  - Drainage Condition: 20%
   *  - Historical Incidents: 20%
   */
  public static calculateFloodRisk(input: RiskCalculationInput): RiskCalculationResult {
    const { rainfallMm, waterLevelCm, drainageCondition, historicalIncidents } = input;

    // 1. Normalize Rainfall (0 - 100 mm/h scale, capped at 30 points)
    const rainfallScore = Math.min(30, Math.max(0, (rainfallMm / 100) * 30));

    // 2. Normalize Water Level (0 - 50 cm inundation scale, capped at 30 points)
    // 42cm approaches vehicle stall threshold (45cm) and curb overflow (35cm)
    const waterLevelNorm = Math.min(1, Math.max(0, waterLevelCm / 48));
    const waterLevelScore = waterLevelNorm * 30;

    // 3. Normalize Drainage Condition (20 points max)
    let drainageScore = 3;
    const cond = (drainageCondition || '').toLowerCase();
    if (cond.includes('critical') || cond.includes('severe') || cond.includes('choked')) {
      drainageScore = 20;
    } else if (cond.includes('poor')) {
      drainageScore = 17;
    } else if (cond.includes('moderate')) {
      drainageScore = 14;
    } else if (cond.includes('good')) {
      drainageScore = 4;
    }

    // 4. Normalize Historical Incidents (0 - 14+ events, 20 points max)
    const historyScore = Math.min(20, Math.max(0, (historicalIncidents / 13) * 20));

    // Aggregate Raw Score
    const rawTotal = rainfallScore + waterLevelScore + drainageScore + historyScore;
    const riskScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

    // Categorize Risk Level
    let riskLevel: RiskLevel = 'LOW';
    if (riskScore >= 76) {
      riskLevel = 'CRITICAL';
    } else if (riskScore >= 56) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 31) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    // Factor Breakdown Generation
    const factors: FactorItem[] = [];

    if (rainfallMm >= 70) {
      factors.push({
        title: `Sustained Heavy Rainfall (${rainfallMm}mm/h)`,
        description: 'Precipitation volume exceeds 10-year storm drain design capacity. Runoff velocity has saturated perimeter ditches.',
        impact: 'HIGH'
      });
    } else if (rainfallMm >= 40) {
      factors.push({
        title: `Elevated Precipitation (${rainfallMm}mm/h)`,
        description: 'Persistent cloudburst causing surface ponding across roadway gutters.',
        impact: 'MEDIUM'
      });
    } else {
      factors.push({
        title: `Controlled Rainfall (${rainfallMm}mm/h)`,
        description: 'Precipitation within standard hydraulic retention capacity.',
        impact: 'LOW'
      });
    }

    if (waterLevelCm >= 35) {
      factors.push({
        title: `Rising Water Level (${waterLevelCm}cm)`,
        description: 'Water depth has breached curb threshold and is nearing vehicle undercarriage stall limit (45cm).',
        impact: 'HIGH'
      });
    } else if (waterLevelCm >= 15) {
      factors.push({
        title: `Moderate Ponding (${waterLevelCm}cm)`,
        description: 'Gutter ponding observed. Surcharge alert active on intake culverts.',
        impact: 'MEDIUM'
      });
    } else {
      factors.push({
        title: `Normal Water Depth (${waterLevelCm}cm)`,
        description: 'Water levels within baseline drainage clearance thresholds.',
        impact: 'LOW'
      });
    }

    if (drainageScore >= 16) {
      factors.push({
        title: 'Topographical Sump & Poor Drainage',
        description: 'Sub-grade elevation depression combined with severe outflow siltation creates chronic hydraulic bottleneck.',
        impact: 'MEDIUM'
      });
    } else if (drainageScore >= 10) {
      factors.push({
        title: 'Moderate Drainage Obstruction',
        description: 'Debris buildup at curb grates reducing storm discharge efficiency by 30-40%.',
        impact: 'MEDIUM'
      });
    }

    if (historicalIncidents >= 10) {
      factors.push({
        title: `Historical Inundation Hotspot (${historicalIncidents} Events)`,
        description: `Site has flooded ${historicalIncidents} times in the past 24 months during comparable rainfall events.`,
        impact: 'HIGH'
      });
    } else if (historicalIncidents >= 5) {
      factors.push({
        title: `Recurring Event Corridor (${historicalIncidents} Events)`,
        description: 'Site exhibits seasonal vulnerability during monsoonal downpours.',
        impact: 'MEDIUM'
      });
    }

    // Contextual Action Recommendations
    const recommendedActions: ActionItem[] = [];

    if (riskLevel === 'CRITICAL') {
      recommendedActions.push(
        { priority: 'Priority 1', title: 'Alert municipal response team & dispatch rapid pump unit', description: 'Unit 4-Delta notified via automated trunk radio' },
        { priority: 'Priority 2', title: 'Inspect storm drain intake for debris obstruction', description: 'Culvert grating clogging rate exceeding 65%' },
        { priority: 'Priority 3', title: 'Prepare mobile barrier deployment & auxiliary pumps', description: 'Standby at Maintenance Yard 2 (6 min ETA)' },
        { priority: 'Priority 4', title: 'Restrict vehicle access & reroute traffic at 45cm', description: `Current water is ${waterLevelCm}cm. Pre-trigger variable detour signage` }
      );
    } else if (riskLevel === 'HIGH') {
      recommendedActions.push(
        { priority: 'Priority 1', title: 'Dispatch drain clearing crew to priority culverts', description: 'Clear curbside debris grates before peak runoff' },
        { priority: 'Priority 2', title: 'Notify Traffic Command for advisory warnings', description: 'Advise low-chassis passenger vehicles to take alternate routes' },
        { priority: 'Priority 3', title: 'Monitor water level ping every 60s', description: 'Prepare standby water-pumping equipment' }
      );
    } else if (riskLevel === 'MEDIUM') {
      recommendedActions.push(
        { priority: 'Standard', title: 'Automated monitoring of Retention Basin B', description: 'Ping telemetry every 60s to track trend' },
        { priority: 'Advisory', title: 'Log inspection checkpoint for routine patrol', description: 'Check grates within next 4 hours' }
      );
    } else {
      recommendedActions.push(
        { priority: 'Routine', title: 'Nominal telemetry logging', description: 'Standard 60-minute supervisory check' }
      );
    }

    return {
      riskScore,
      riskLevel,
      components: {
        rainfallComponent: Number(rainfallScore.toFixed(1)),
        waterLevelComponent: Number(waterLevelScore.toFixed(1)),
        drainageComponent: Number(drainageScore.toFixed(1)),
        historyComponent: Number(historyScore.toFixed(1))
      },
      factors,
      recommendedActions
    };
  }
}
