const BASE_URL = '/api';

export async function fetchDashboardSummary() {
  const res = await fetch(`${BASE_URL}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchWards() {
  const res = await fetch(`${BASE_URL}/wards`);
  if (!res.ok) throw new Error('Failed to fetch zones');
  return res.json();
}

export async function fetchWardDetails(wardId) {
  const res = await fetch(`${BASE_URL}/wards/${wardId}`);
  if (!res.ok) throw new Error(`Failed to fetch zone ${wardId}`);
  return res.json();
}

export async function fetchSensors() {
  const res = await fetch(`${BASE_URL}/wards/sensors/all`);
  if (!res.ok) throw new Error('Failed to fetch sensors');
  return res.json();
}

export async function runPrediction(inputData) {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputData),
  });
  if (!res.ok) throw new Error('Failed to run prediction');
  return res.json();
}

export async function fetchSimulatorPresets() {
  const res = await fetch(`${BASE_URL}/simulator/presets`);
  if (!res.ok) throw new Error('Failed to fetch simulator presets');
  return res.json();
}

export async function fetchSimulatorBaseline() {
  const res = await fetch(`${BASE_URL}/simulator/baseline`);
  if (!res.ok) throw new Error('Failed to fetch baseline state');
  return res.json();
}

export async function runSimulation(simParams) {
  const res = await fetch(`${BASE_URL}/simulator/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(simParams),
  });
  if (!res.ok) throw new Error('Failed to run simulation');
  return res.json();
}

export async function fetchGlobalExplain() {
  const res = await fetch(`${BASE_URL}/explain/global`);
  if (!res.ok) throw new Error('Failed to fetch global explanation');
  return res.json();
}

export async function fetchWardExplain(wardId) {
  const res = await fetch(`${BASE_URL}/explain/ward/${wardId}`);
  if (!res.ok) throw new Error(`Failed to fetch explain for zone ${wardId}`);
  return res.json();
}

export async function fetchMitigationRecommendations() {
  const res = await fetch(`${BASE_URL}/mitigation/recommendations`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function fetchDispatches() {
  const res = await fetch(`${BASE_URL}/mitigation/active-logs`);
  if (!res.ok) throw new Error('Failed to fetch preventive action logs');
  return res.json();
}

export async function createDispatch(payload) {
  const res = await fetch(`${BASE_URL}/mitigation/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to log preventive action');
  return res.json();
}

export async function updateDispatchStatus(dispatchId, status) {
  const res = await fetch(`${BASE_URL}/mitigation/${dispatchId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update action status');
  return res.json();
}

export function getExportCSVUrl() {
  return `${BASE_URL}/reports/export/csv`;
}
