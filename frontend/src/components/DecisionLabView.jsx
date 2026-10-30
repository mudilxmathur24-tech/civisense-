import React, { useState, useMemo, useEffect } from 'react';
import {
  FlaskConical, ChevronDown, Droplets, Waves, Mountain,
  ArrowRight, ArrowDown, ArrowUp, RotateCcw, Download,
  Lightbulb, CheckCircle2, AlertTriangle, Target, Minus,
  ChevronRight, Info
} from 'lucide-react';
import {
  calculateRiskScore, classifyRisk, getContributions, generateExplanation,
  getRecommendedAction, getPrimaryDriver, RISK_COLORS, RISK_BG_COLORS,
  SCENARIO_PRESETS, INTERVENTION_PRESETS, clamp
} from '../utils/riskEngine';

export default function DecisionLabView({ wards, selectedWard, onSelectWard, setActiveTab }) {
  const [zoneId, setZoneId] = useState(selectedWard?.id || (wards[0]?.id ?? null));
  const zone = useMemo(() => wards.find(w => w.id === zoneId), [wards, zoneId]);

  const [rainfall, setRainfall] = useState(0);
  const [drainage, setDrainage] = useState(0);
  const [terrain, setTerrain] = useState(0);
  const [activePreset, setActivePreset] = useState('normal');
  const [selectedInterventions, setSelectedInterventions] = useState([]);
  const [activeSection, setActiveSection] = useState('intelligence');

  useEffect(() => {
    if (selectedWard?.id && selectedWard.id !== zoneId) setZoneId(selectedWard.id);
  }, [selectedWard]);

  useEffect(() => {
    if (zone) {
      setRainfall(zone.rainfall_risk);
      setDrainage(zone.drainage_risk);
      setTerrain(zone.terrain_risk);
      setActivePreset('normal');
      setSelectedInterventions([]);
    }
  }, [zone]);

  const baseline = useMemo(() => {
    if (!zone) return null;
    return getContributions(zone.rainfall_risk, zone.drainage_risk, zone.terrain_risk);
  }, [zone]);

  const simulated = useMemo(() => getContributions(rainfall, drainage, terrain), [rainfall, drainage, terrain]);

  const scoreDiff = baseline ? Math.round((simulated.total - baseline.total) * 100) / 100 : 0;

  const applyPreset = (preset) => {
    if (!zone) return;
    setActivePreset(preset.id);
    const r = preset.rainfallOverride ?? zone.rainfall_risk;
    const d = preset.drainageOverride ?? (preset.drainageReduction ? Math.max(0, zone.drainage_risk - preset.drainageReduction) : zone.drainage_risk);
    const t = preset.terrain ?? zone.terrain_risk;
    setRainfall(r);
    setDrainage(d);
    setTerrain(t);
  };

  const resetToBaseline = () => {
    if (!zone) return;
    setRainfall(zone.rainfall_risk);
    setDrainage(zone.drainage_risk);
    setTerrain(zone.terrain_risk);
    setActivePreset('normal');
  };

  const getInterventionResult = (intervention) => {
    if (!zone) return null;
    const r = clamp(zone.rainfall_risk + (intervention.rainfallChange || 0));
    const d = clamp(zone.drainage_risk - intervention.drainageReduction);
    const t = clamp(zone.terrain_risk + (intervention.terrainChange || 0));
    const score = calculateRiskScore(r, d, t);
    const cat = classifyRisk(score);
    return { score, category: cat, rainfall: r, drainage: d, terrain: t };
  };

  const toggleIntervention = (id) => {
    setSelectedInterventions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const exportSummary = () => {
    if (!zone || !baseline) return;
    const lines = [
      `CIVISENSE — Decision Summary Report`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `ZONE: ${zone.name} (${zone.code})`,
      `Sub-Region: ${zone.sub_region}`,
      `Elevation: ${zone.elevation_m}m MSL`,
      ``,
      `--- BASELINE ---`,
      `Risk Score: ${baseline.total}/100`,
      `Category: ${baseline.category}`,
      `Rainfall Input: ${zone.rainfall_risk} → Contribution: ${baseline.rainfall.contribution}`,
      `Drainage Input: ${zone.drainage_risk} → Contribution: ${baseline.drainage.contribution}`,
      `Terrain Input: ${zone.terrain_risk} → Contribution: ${baseline.terrain.contribution}`,
      ``,
      `--- SIMULATION ---`,
      `Rainfall Input: ${rainfall} → Contribution: ${simulated.rainfall.contribution}`,
      `Drainage Input: ${drainage} → Contribution: ${simulated.drainage.contribution}`,
      `Terrain Input: ${terrain} → Contribution: ${simulated.terrain.contribution}`,
      `Simulated Score: ${simulated.total}/100`,
      `Simulated Category: ${simulated.category}`,
      `Score Change: ${scoreDiff > 0 ? '+' : ''}${scoreDiff}`,
      ``,
      `--- EXPLANATION ---`,
      generateExplanation(rainfall, drainage, terrain),
      ``,
      `--- RECOMMENDED ACTION ---`,
      getRecommendedAction(rainfall, drainage, terrain),
      ``,
      `--- DATA NOTICE ---`,
      `All values are illustrative demonstration data.`,
      `Risk formula: R = 0.5×P + 0.3×D + 0.2×T (weighted rule-based score).`,
      `This is NOT a trained ML model. Scores are not probabilities.`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civisense_decision_${zone.code}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveSc = () => {
    if (!zone || !baseline) return;
    const name = prompt('Name this scenario:');
    if (!name) return;
    const existing = JSON.parse(localStorage.getItem('civisense_scenarios') || '[]');
    existing.push({
      id: Date.now().toString(),
      name,
      zoneName: zone.name,
      zoneCode: zone.code,
      rainfallRisk: rainfall,
      drainageRisk: drainage,
      terrainRisk: terrain,
      resultScore: simulated.total,
      resultCategory: simulated.category,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem('civisense_scenarios', JSON.stringify(existing));
    alert('Scenario saved to local history.');
  };

  const sections = [
    { id: 'intelligence', label: 'Zone Intelligence' },
    { id: 'simulator', label: 'What-If Simulator' },
    { id: 'comparison', label: 'Baseline vs Simulation' },
    { id: 'interventions', label: 'Intervention Impact' },
    { id: 'summary', label: 'Decision Summary' },
  ];

  const ScoreCircle = ({ score, category, size = 'lg' }) => {
    const s = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-lg';
    return (
      <div className={`${s} rounded-full border-4 flex items-center justify-center font-extrabold mx-auto`}
        style={{ borderColor: RISK_COLORS[category], color: RISK_COLORS[category] }}>
        {score}
      </div>
    );
  };

  const ContribBar = ({ label, icon: Icon, contribution, maxContrib, color, input, weight }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-[#738087] font-medium">{label}</span>
          <span className="text-[10px] text-[#D5D7D2]">w={weight}</span>
        </div>
        <div className="font-bold text-[#172B36]">{contribution} <span className="font-normal text-[#738087]">({input} × {weight})</span></div>
      </div>
      <div className="h-2.5 bg-[#F3F1E9] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${maxContrib > 0 ? (contribution / maxContrib) * 100 : 0}%`, backgroundColor: color }} />
      </div>
    </div>
  );

  if (!zone || !baseline) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-8 text-center">
          <FlaskConical className="w-10 h-10 text-[#267C78] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#172B36] mb-2">CiviSense Decision Lab</h2>
          <p className="text-sm text-[#738087] mb-4">Select a zone to begin analysis.</p>
          <select onChange={(e) => setZoneId(Number(e.target.value))} className="px-4 py-2 bg-[#F7F6F2] border border-[#D5D7D2] rounded-lg text-sm text-[#263238]">
            <option value="">Choose a zone...</option>
            {wards.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
          </select>
        </div>
      </div>
    );
  }

  const maxC = Math.max(simulated.rainfall.contribution, simulated.drainage.contribution, simulated.terrain.contribution, 1);

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <FlaskConical className="w-5 h-5 text-[#267C78]" />
            <h1 className="text-xl font-bold text-[#172B36]">Decision Lab</h1>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#267C78]/15 text-[#267C78]">FLAGSHIP</span>
          </div>
          <p className="text-xs text-[#738087]">Simulate, compare, and recommend — all in one module.</p>
        </div>
        <select
          value={zoneId}
          onChange={(e) => { setZoneId(Number(e.target.value)); onSelectWard(wards.find(w => w.id === Number(e.target.value))); }}
          className="px-3 py-2 bg-white border border-[#D5D7D2] rounded-lg text-sm text-[#263238] font-medium cursor-pointer focus:outline-none focus:border-[#267C78]"
        >
          {wards.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
        </select>
      </div>

      {/* Section Tabs */}
      <div className="flex space-x-1 bg-white rounded-lg border border-[#D5D7D2] p-1 overflow-x-auto">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeSection === s.id ? 'bg-[#267C78] text-white' : 'text-[#738087] hover:text-[#172B36] hover:bg-[#F7F6F2]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* A. Zone Intelligence */}
      {activeSection === 'intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#D5D7D2] p-5 lg:col-span-1">
            <div className="text-center mb-4">
              <ScoreCircle score={baseline.total} category={baseline.category} />
              <div className="mt-2">
                <span className="px-3 py-1 rounded-lg text-sm font-bold" style={{ color: RISK_COLORS[baseline.category], backgroundColor: RISK_COLORS[baseline.category] + '15' }}>
                  {baseline.category} Risk
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#738087]">Zone</span><span className="font-semibold text-[#172B36]">{zone.name}</span></div>
              <div className="flex justify-between"><span className="text-[#738087]">Code</span><span className="font-mono text-[#263238]">{zone.code}</span></div>
              <div className="flex justify-between"><span className="text-[#738087]">Sub-Region</span><span className="text-[#263238]">{zone.sub_region}</span></div>
              <div className="flex justify-between"><span className="text-[#738087]">Elevation</span><span className="text-[#263238]">{zone.elevation_m}m MSL</span></div>
              <div className="flex justify-between"><span className="text-[#738087]">Population</span><span className="text-[#263238]">{zone.population?.toLocaleString() || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[#738087]">Data Tag</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D69A42]/15 text-[#D69A42]">{zone.data_tag || 'SYNTHETIC'}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D7D2] p-5 lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-[#172B36]">Factor Contributions</h3>
            <ContribBar label="Rainfall" icon={Droplets} contribution={baseline.rainfall.contribution} maxContrib={50} color="#267C78" input={zone.rainfall_risk} weight={0.5} />
            <ContribBar label="Drainage" icon={Waves} contribution={baseline.drainage.contribution} maxContrib={50} color="#D69A42" input={zone.drainage_risk} weight={0.3} />
            <ContribBar label="Terrain" icon={Mountain} contribution={baseline.terrain.contribution} maxContrib={50} color="#738087" input={zone.terrain_risk} weight={0.2} />
            <div className="pt-3 border-t border-[#D5D7D2]">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-[#172B36]">Total Score</span>
                <span className="font-extrabold text-lg" style={{ color: RISK_COLORS[baseline.category] }}>{baseline.total}/100</span>
              </div>
            </div>
            <div className="p-3 bg-[#F7F6F2] rounded-lg text-xs text-[#738087] leading-relaxed">
              <Lightbulb className="w-3.5 h-3.5 inline mr-1 text-[#D69A42]" />
              {generateExplanation(zone.rainfall_risk, zone.drainage_risk, zone.terrain_risk)}
            </div>
            <div className="p-3 bg-[#267C78]/5 rounded-lg text-xs text-[#267C78] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
              <strong>Recommended:</strong> {getRecommendedAction(zone.rainfall_risk, zone.drainage_risk, zone.terrain_risk)}
            </div>
          </div>
        </div>
      )}

      {/* B. What-If Simulator */}
      {activeSection === 'simulator' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
            <h3 className="text-sm font-bold text-[#172B36] mb-3">Scenario Presets</h3>
            <div className="flex flex-wrap gap-2">
              {SCENARIO_PRESETS.map(p => (
                <button key={p.id} onClick={() => applyPreset(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                    activePreset === p.id ? 'bg-[#267C78] text-white border-[#267C78]' : 'bg-white text-[#738087] border-[#D5D7D2] hover:border-[#267C78]/30'
                  }`}>
                  {p.name}
                </button>
              ))}
              <button onClick={resetToBaseline} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#738087] border border-[#D5D7D2] hover:border-[#B94B48]/30 hover:text-[#B94B48] cursor-pointer flex items-center space-x-1">
                <RotateCcw className="w-3 h-3" /><span>Reset</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#D5D7D2] p-5 space-y-5">
              <h3 className="text-sm font-bold text-[#172B36]">Adjust Inputs</h3>
              {[
                { label: 'Rainfall Risk', icon: Droplets, value: rainfall, setter: setRainfall, base: zone.rainfall_risk, color: '#267C78' },
                { label: 'Drainage Risk', icon: Waves, value: drainage, setter: setDrainage, base: zone.drainage_risk, color: '#D69A42' },
                { label: 'Terrain Risk', icon: Mountain, value: terrain, setter: setTerrain, base: zone.terrain_risk, color: '#738087' },
              ].map(s => {
                const Icon = s.icon;
                const diff = s.value - s.base;
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5 text-xs">
                        <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                        <span className="font-medium text-[#172B36]">{s.label}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-bold text-[#172B36]">{s.value}</span>
                        {diff !== 0 && (
                          <span className={`text-[10px] font-bold ${diff > 0 ? 'text-[#B94B48]' : 'text-[#438A69]'}`}>
                            {diff > 0 ? '+' : ''}{diff}
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="range" min="0" max="100" value={s.value}
                      onChange={(e) => { s.setter(Number(e.target.value)); setActivePreset(null); }}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: s.color, background: `linear-gradient(to right, ${s.color} 0%, ${s.color} ${s.value}%, #E2E4DF ${s.value}%, #E2E4DF 100%)` }}
                    />
                    <div className="flex justify-between text-[10px] text-[#D5D7D2] mt-0.5">
                      <span>0</span><span>Baseline: {s.base}</span><span>100</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border border-[#D5D7D2] p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#172B36]">Simulated Result</h3>
              <div className="flex items-center space-x-4">
                <ScoreCircle score={simulated.total} category={simulated.category} />
                <div>
                  <span className="px-3 py-1 rounded-lg text-sm font-bold" style={{ color: RISK_COLORS[simulated.category], backgroundColor: RISK_COLORS[simulated.category] + '15' }}>
                    {simulated.category}
                  </span>
                  {scoreDiff !== 0 && (
                    <div className={`mt-2 text-sm font-bold flex items-center space-x-1 ${scoreDiff > 0 ? 'text-[#B94B48]' : 'text-[#438A69]'}`}>
                      {scoreDiff > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      <span>{scoreDiff > 0 ? '+' : ''}{scoreDiff} from baseline</span>
                    </div>
                  )}
                </div>
              </div>
              <ContribBar label="Rainfall" icon={Droplets} contribution={simulated.rainfall.contribution} maxContrib={maxC} color="#267C78" input={rainfall} weight={0.5} />
              <ContribBar label="Drainage" icon={Waves} contribution={simulated.drainage.contribution} maxContrib={maxC} color="#D69A42" input={drainage} weight={0.3} />
              <ContribBar label="Terrain" icon={Mountain} contribution={simulated.terrain.contribution} maxContrib={maxC} color="#738087" input={terrain} weight={0.2} />
              <div className="p-3 bg-[#F7F6F2] rounded-lg text-xs text-[#738087]">
                <Lightbulb className="w-3.5 h-3.5 inline mr-1 text-[#D69A42]" />
                {generateExplanation(rainfall, drainage, terrain)}
              </div>
              <div className="flex space-x-2">
                <button onClick={saveSc} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F7F6F2] text-[#738087] border border-[#D5D7D2] hover:border-[#267C78]/30 cursor-pointer">
                  Save Scenario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* C. Baseline vs Simulation */}
      {activeSection === 'comparison' && baseline && (
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
          <h3 className="text-sm font-bold text-[#172B36] mb-5">Baseline vs Simulation Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3 p-4 bg-[#F7F6F2] rounded-xl">
              <div className="text-[10px] font-bold text-[#738087] uppercase tracking-wider">Baseline</div>
              <ScoreCircle score={baseline.total} category={baseline.category} />
              <span className="inline-block px-3 py-1 rounded text-xs font-bold" style={{ color: RISK_COLORS[baseline.category], backgroundColor: RISK_COLORS[baseline.category] + '15' }}>{baseline.category}</span>
              <div className="text-xs text-[#738087] space-y-1">
                <div>Rainfall: {zone.rainfall_risk} → {baseline.rainfall.contribution}</div>
                <div>Drainage: {zone.drainage_risk} → {baseline.drainage.contribution}</div>
                <div>Terrain: {zone.terrain_risk} → {baseline.terrain.contribution}</div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className={`text-3xl font-extrabold ${scoreDiff > 0 ? 'text-[#B94B48]' : scoreDiff < 0 ? 'text-[#438A69]' : 'text-[#738087]'}`}>
                {scoreDiff > 0 ? '+' : ''}{scoreDiff}
              </div>
              <div className="text-xs text-[#738087] font-medium">Score Change</div>
              {baseline.category !== simulated.category && (
                <div className="flex items-center space-x-2 text-xs">
                  <span style={{ color: RISK_COLORS[baseline.category] }} className="font-bold">{baseline.category}</span>
                  <ArrowRight className="w-3 h-3 text-[#D5D7D2]" />
                  <span style={{ color: RISK_COLORS[simulated.category] }} className="font-bold">{simulated.category}</span>
                </div>
              )}
              <div className="text-[10px] text-[#738087] text-center mt-2 max-w-[180px]">
                {scoreDiff > 0 ? `Risk increased primarily due to higher ${getPrimaryDriver(rainfall, drainage, terrain).toLowerCase()} input.` :
                 scoreDiff < 0 ? `Risk decreased primarily due to improved conditions.` : 'No change from baseline.'}
              </div>
            </div>

            <div className="text-center space-y-3 p-4 bg-[#F7F6F2] rounded-xl">
              <div className="text-[10px] font-bold text-[#738087] uppercase tracking-wider">Simulated</div>
              <ScoreCircle score={simulated.total} category={simulated.category} />
              <span className="inline-block px-3 py-1 rounded text-xs font-bold" style={{ color: RISK_COLORS[simulated.category], backgroundColor: RISK_COLORS[simulated.category] + '15' }}>{simulated.category}</span>
              <div className="text-xs text-[#738087] space-y-1">
                <div>Rainfall: {rainfall} → {simulated.rainfall.contribution}</div>
                <div>Drainage: {drainage} → {simulated.drainage.contribution}</div>
                <div>Terrain: {terrain} → {simulated.terrain.contribution}</div>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-[#D5D7D2]">
            <h4 className="text-xs font-bold text-[#172B36] mb-2">Changed Inputs</h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                { label: 'Rainfall', base: zone.rainfall_risk, sim: rainfall },
                { label: 'Drainage', base: zone.drainage_risk, sim: drainage },
                { label: 'Terrain', base: zone.terrain_risk, sim: terrain },
              ].map(c => {
                const d = c.sim - c.base;
                return (
                  <div key={c.label} className="flex items-center justify-between p-2 bg-[#F7F6F2] rounded-lg">
                    <span className="text-[#738087]">{c.label}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-[#172B36] font-semibold">{c.base} → {c.sim}</span>
                      {d !== 0 && <span className={`font-bold ${d > 0 ? 'text-[#B94B48]' : 'text-[#438A69]'}`}>({d > 0 ? '+' : ''}{d})</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* D. Intervention Impact */}
      {activeSection === 'interventions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#172B36]">Intervention Scenarios</h3>
              <span className="text-[10px] text-[#738087]">Select up to 3 to compare</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {INTERVENTION_PRESETS.map(iv => {
                const result = getInterventionResult(iv);
                if (!result) return null;
                const diff = Math.round((result.score - baseline.total) * 100) / 100;
                const selected = selectedInterventions.includes(iv.id);
                return (
                  <div key={iv.id}
                    onClick={() => toggleIntervention(iv.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selected ? 'border-[#267C78] bg-[#267C78]/5' : 'border-[#D5D7D2] hover:border-[#267C78]/30'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-[#172B36]">{iv.name}</h4>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selected ? 'bg-[#267C78] border-[#267C78]' : 'border-[#D5D7D2]'}`}>
                        {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <p className="text-[10px] text-[#738087] mb-3">{iv.description}</p>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#738087]">Score</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[#172B36] font-bold">{baseline.total}</span>
                        <ArrowRight className="w-3 h-3 text-[#D5D7D2]" />
                        <span className="font-bold" style={{ color: RISK_COLORS[result.category] }}>{result.score}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[#738087]">Change</span>
                      <span className={`font-bold ${diff < 0 ? 'text-[#438A69]' : 'text-[#738087]'}`}>{diff > 0 ? '+' : ''}{diff}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#738087]">Category</span>
                      <span className="font-bold" style={{ color: RISK_COLORS[result.category] }}>{result.category}</span>
                    </div>
                    <div className="mt-3 p-2 bg-[#F7F6F2] rounded text-[9px] text-[#738087] leading-snug">
                      <Info className="w-2.5 h-2.5 inline mr-0.5" /> {iv.assumption}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedInterventions.length >= 2 && (
            <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
              <h3 className="text-sm font-bold text-[#172B36] mb-4">Intervention Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F7F6F2] text-left text-[11px] font-semibold text-[#738087] uppercase">
                      <th className="px-4 py-2">Metric</th>
                      {selectedInterventions.map(id => {
                        const iv = INTERVENTION_PRESETS.find(x => x.id === id);
                        return <th key={id} className="px-4 py-2">{iv?.name}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {['Original Score', 'New Score', 'Change', 'Category'].map(metric => (
                      <tr key={metric} className="border-t border-[#D5D7D2]">
                        <td className="px-4 py-2 text-[#738087] font-medium">{metric}</td>
                        {selectedInterventions.map(id => {
                          const iv = INTERVENTION_PRESETS.find(x => x.id === id);
                          const res = getInterventionResult(iv);
                          const diff = Math.round((res.score - baseline.total) * 100) / 100;
                          let val;
                          if (metric === 'Original Score') val = baseline.total;
                          else if (metric === 'New Score') val = res.score;
                          else if (metric === 'Change') val = <span className={diff < 0 ? 'text-[#438A69] font-bold' : ''}>{diff > 0 ? '+' : ''}{diff}</span>;
                          else val = <span style={{ color: RISK_COLORS[res.category] }} className="font-bold">{res.category}</span>;
                          return <td key={id} className="px-4 py-2 font-semibold text-[#172B36]">{val}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* E. Decision Summary */}
      {activeSection === 'summary' && (
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-6 space-y-5">
          <h3 className="text-lg font-bold text-[#172B36]">Decision Summary — {zone.name}</h3>
          {[
            { q: 'What is happening?', a: `Zone ${zone.code} (${zone.name}) in ${zone.sub_region} has a baseline risk score of ${baseline.total}/100, classified as ${baseline.category} risk.` },
            { q: 'Why is the zone vulnerable?', a: generateExplanation(zone.rainfall_risk, zone.drainage_risk, zone.terrain_risk) },
            { q: 'What changed in the simulation?', a: scoreDiff === 0 ? 'No changes have been applied to the baseline inputs.' : `The simulated score is ${simulated.total}/100 (${simulated.category}), a change of ${scoreDiff > 0 ? '+' : ''}${scoreDiff} from baseline.` },
            { q: 'Which factor contributed most?', a: `${getPrimaryDriver(rainfall, drainage, terrain)} is the largest contributor to the current simulated score.` },
            { q: 'What action should be considered first?', a: getRecommendedAction(rainfall, drainage, terrain) },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-[#F7F6F2] rounded-xl">
              <h4 className="text-xs font-bold text-[#267C78] uppercase tracking-wider mb-1">{item.q}</h4>
              <p className="text-sm text-[#263238] leading-relaxed">{item.a}</p>
            </div>
          ))}
          <div className="p-3 rounded-lg bg-[#D69A42]/10 text-xs text-[#D69A42] font-medium">
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
            All values are illustrative demonstration data. Risk scores are weighted rule-based indicators, not probabilities.
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportSummary} className="px-4 py-2 bg-[#267C78] hover:bg-[#1e6a66] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center space-x-2">
              <Download className="w-3.5 h-3.5" /><span>Export Report</span>
            </button>
            <button onClick={saveSc} className="px-4 py-2 bg-white border border-[#D5D7D2] hover:border-[#267C78]/30 text-[#738087] text-xs font-semibold rounded-lg cursor-pointer">Save Scenario</button>
            <button onClick={() => setActiveTab('scenario-history')} className="px-4 py-2 bg-white border border-[#D5D7D2] hover:border-[#267C78]/30 text-[#738087] text-xs font-semibold rounded-lg cursor-pointer">View History</button>
          </div>
        </div>
      )}

      <div className="text-center text-[10px] text-[#738087] py-2">
        Formula: R = 0.5 × P + 0.3 × D + 0.2 × T · Weighted rule-based score · Not a trained ML model
      </div>
    </div>
  );
}
