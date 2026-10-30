// CiviSense — Centralized Risk Calculation Engine
// Weighted rule-based score, NOT a trained ML model.
// Formula: R = 0.5·P + 0.3·D + 0.2·T
// P = Rainfall Risk, D = Drainage Risk, T = Terrain Risk (all 0–100)

export const WEIGHTS = { rainfall: 0.5, drainage: 0.3, terrain: 0.2 };

export const RISK_COLORS = {
  Critical: '#B94B48',
  High: '#D18A35',
  Medium: '#D2B64B',
  Low: '#438A69',
};

export const RISK_BG_COLORS = {
  Critical: '#B94B4815',
  High: '#D18A3515',
  Medium: '#D2B64B15',
  Low: '#438A6915',
};

export const RISK_BORDER_COLORS = {
  Critical: '#B94B4840',
  High: '#D18A3540',
  Medium: '#D2B64B40',
  Low: '#438A6940',
};

export function clamp(value, min = 0, max = 100) {
  if (value == null || isNaN(value)) return min;
  return Math.max(min, Math.min(max, Number(value)));
}

export function calculateRiskScore(rainfallRisk, drainageRisk, terrainRisk) {
  const p = clamp(rainfallRisk);
  const d = clamp(drainageRisk);
  const t = clamp(terrainRisk);
  return Math.round((WEIGHTS.rainfall * p + WEIGHTS.drainage * d + WEIGHTS.terrain * t) * 100) / 100;
}

export function classifyRisk(score) {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 35) return 'Medium';
  return 'Low';
}

export function getRiskColor(category) {
  return RISK_COLORS[category] || RISK_COLORS.Low;
}

export function getRiskBgColor(category) {
  return RISK_BG_COLORS[category] || RISK_BG_COLORS.Low;
}

export function getContributions(rainfallRisk, drainageRisk, terrainRisk) {
  const p = clamp(rainfallRisk);
  const d = clamp(drainageRisk);
  const t = clamp(terrainRisk);
  const rc = Math.round(WEIGHTS.rainfall * p * 100) / 100;
  const dc = Math.round(WEIGHTS.drainage * d * 100) / 100;
  const tc = Math.round(WEIGHTS.terrain * t * 100) / 100;
  const total = Math.round((rc + dc + tc) * 100) / 100;
  return {
    rainfall: { input: p, weight: WEIGHTS.rainfall, contribution: rc },
    drainage: { input: d, weight: WEIGHTS.drainage, contribution: dc },
    terrain: { input: t, weight: WEIGHTS.terrain, contribution: tc },
    total,
    category: classifyRisk(total),
  };
}

export function getPrimaryDriver(rainfallRisk, drainageRisk, terrainRisk) {
  const c = getContributions(rainfallRisk, drainageRisk, terrainRisk);
  const factors = [
    { name: 'Rainfall', contribution: c.rainfall.contribution },
    { name: 'Drainage', contribution: c.drainage.contribution },
    { name: 'Terrain', contribution: c.terrain.contribution },
  ];
  factors.sort((a, b) => b.contribution - a.contribution);
  return factors[0].name;
}

export function generateExplanation(rainfallRisk, drainageRisk, terrainRisk) {
  const c = getContributions(rainfallRisk, drainageRisk, terrainRisk);
  const factors = [
    { name: 'rainfall-related risk', contribution: c.rainfall.contribution },
    { name: 'drainage-related risk', contribution: c.drainage.contribution },
    { name: 'terrain-related risk', contribution: c.terrain.contribution },
  ];
  factors.sort((a, b) => b.contribution - a.contribution);
  
  const primary = factors[0];
  const secondary = factors[1];
  
  let text = `This zone has a ${c.category.toLowerCase()} illustrative risk score of ${c.total}/100, `;
  text += `primarily driven by its ${primary.name} (contributing ${primary.contribution} points). `;
  if (secondary.contribution > 10) {
    text += `${secondary.name.charAt(0).toUpperCase() + secondary.name.slice(1)} also contributes substantially (${secondary.contribution} points).`;
  }
  return text;
}

export function getRecommendedAction(rainfallRisk, drainageRisk, terrainRisk) {
  const driver = getPrimaryDriver(rainfallRisk, drainageRisk, terrainRisk);
  const score = calculateRiskScore(rainfallRisk, drainageRisk, terrainRisk);
  const category = classifyRisk(score);
  
  const actions = {
    Rainfall: {
      Critical: 'Urgent: Monitor weather conditions closely and review vulnerable locations for immediate preventive measures.',
      High: 'Review rainfall preparedness plans and check drainage clearance in vulnerable sections.',
      Medium: 'Schedule periodic review of rainfall-sensitive locations.',
      Low: 'Continue routine monitoring of weather conditions.',
    },
    Drainage: {
      Critical: 'Urgent: Conduct immediate drainage inspection and prioritize maintenance in this zone.',
      High: 'Schedule drainage inspection and cleaning for this zone within the current review cycle.',
      Medium: 'Include drainage condition review in next scheduled maintenance.',
      Low: 'Continue routine drainage maintenance schedule.',
    },
    Terrain: {
      Critical: 'Urgent: Assess terrain and water-flow characteristics; consider additional monitoring.',
      High: 'Review local elevation and water-flow patterns for potential improvements.',
      Medium: 'Evaluate terrain impact during next planning cycle.',
      Low: 'No immediate terrain-related actions needed.',
    },
  };
  
  return actions[driver]?.[category] || 'Continue routine monitoring.';
}

// Intervention presets for the Decision Lab
export const INTERVENTION_PRESETS = [
  {
    id: 'drainage-inspection',
    name: 'Drainage Inspection',
    description: 'Scheduled inspection of drainage infrastructure',
    assumption: 'Assumes inspection identifies 10–15% of drainage inefficiencies, modestly reducing drainage risk input.',
    drainageReduction: 8,
    rainfallChange: 0,
    terrainChange: 0,
  },
  {
    id: 'drain-cleaning',
    name: 'Drain Cleaning & Maintenance',
    description: 'Clearing debris and sediment from drain channels',
    assumption: 'Assumes cleaning restores partial drainage capacity, reducing drainage risk input by an illustrative amount.',
    drainageReduction: 18,
    rainfallChange: 0,
    terrainChange: 0,
  },
  {
    id: 'improved-capacity',
    name: 'Improved Drainage Capacity',
    description: 'Infrastructure upgrade to increase drainage throughput',
    assumption: 'Assumes a significant drainage infrastructure improvement, substantially reducing drainage risk input.',
    drainageReduction: 30,
    rainfallChange: 0,
    terrainChange: 0,
  },
  {
    id: 'road-monitoring',
    name: 'Road Monitoring',
    description: 'Enhanced monitoring of road conditions during rainfall',
    assumption: 'Assumes monitoring enables faster response; does not directly reduce risk inputs but improves situational awareness.',
    drainageReduction: 3,
    rainfallChange: 0,
    terrainChange: 0,
  },
  {
    id: 'additional-data',
    name: 'Additional Data Collection',
    description: 'Deploy sensors and collect more granular data',
    assumption: 'Assumes better data enables more accurate risk assessment; illustrative reduction in uncertainty across factors.',
    drainageReduction: 5,
    rainfallChange: -3,
    terrainChange: -2,
  },
];

// Scenario presets for the What-If Simulator
export const SCENARIO_PRESETS = [
  {
    id: 'normal',
    name: 'Normal Conditions',
    description: 'Baseline conditions with no modifications',
    rainfall: null, // null means use zone baseline
    drainage: null,
    terrain: null,
  },
  {
    id: 'heavy-rain',
    name: 'Heavy Rainfall',
    description: 'Simulates elevated rainfall intensity',
    rainfallOverride: 90,
    drainage: null,
    terrain: null,
  },
  {
    id: 'reduced-drainage',
    name: 'Reduced Drainage Capacity',
    description: 'Simulates degraded drainage infrastructure',
    rainfall: null,
    drainageOverride: 85,
    terrain: null,
  },
  {
    id: 'improved-drainage',
    name: 'Improved Drainage',
    description: 'Simulates drainage infrastructure improvements',
    rainfall: null,
    drainageReduction: 25,
    terrain: null,
  },
  {
    id: 'combined-stress',
    name: 'Combined Stress',
    description: 'Heavy rainfall with degraded drainage',
    rainfallOverride: 90,
    drainageOverride: 85,
    terrain: null,
  },
];

