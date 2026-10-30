import React, { useState, useMemo, useEffect } from 'react';
import { HelpCircle, Droplets, Waves, Mountain, Lightbulb, CheckCircle2, ArrowRight, AlertTriangle, ChevronRight } from 'lucide-react';
import { calculateRiskScore, classifyRisk, getContributions, generateExplanation, getRecommendedAction, getPrimaryDriver, RISK_COLORS } from '../utils/riskEngine';

export default function ExplainView({ wards, selectedWard, onSelectWard, setActiveTab }) {
  const [zoneId, setZoneId] = useState(selectedWard?.id || (wards[0]?.id ?? null));
  const zone = useMemo(() => wards.find(w => w.id === zoneId), [wards, zoneId]);

  useEffect(() => {
    if (selectedWard?.id) setZoneId(selectedWard.id);
  }, [selectedWard]);

  const contrib = useMemo(() => {
    if (!zone) return null;
    return getContributions(zone.rainfall_risk, zone.drainage_risk, zone.terrain_risk);
  }, [zone]);

  const factors = useMemo(() => {
    if (!contrib) return [];
    return [
      { name: 'Rainfall', icon: Droplets, color: '#267C78', input: contrib.rainfall.input, weight: contrib.rainfall.weight, contribution: contrib.rainfall.contribution },
      { name: 'Drainage', icon: Waves, color: '#D69A42', input: contrib.drainage.input, weight: contrib.drainage.weight, contribution: contrib.drainage.contribution },
      { name: 'Terrain', icon: Mountain, color: '#738087', input: contrib.terrain.input, weight: contrib.terrain.weight, contribution: contrib.terrain.contribution },
    ].sort((a, b) => b.contribution - a.contribution);
  }, [contrib]);

  // Counterfactual: what if drainage were reduced by 20?
  const counterfactual = useMemo(() => {
    if (!zone) return null;
    const newD = Math.max(0, zone.drainage_risk - 20);
    const newScore = calculateRiskScore(zone.rainfall_risk, newD, zone.terrain_risk);
    return { newD, newScore, newCat: classifyRisk(newScore), diff: Math.round((newScore - contrib.total) * 100) / 100 };
  }, [zone, contrib]);

  if (!zone || !contrib) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D7D2] p-8 text-center animate-fade-in-up">
        <HelpCircle className="w-10 h-10 text-[#267C78] mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#172B36] mb-2">Explainable Risk Analysis</h2>
        <p className="text-sm text-[#738087] mb-4">Select a zone to see its risk breakdown.</p>
        <select onChange={(e) => setZoneId(Number(e.target.value))} className="px-4 py-2 bg-[#F7F6F2] border border-[#D5D7D2] rounded-lg text-sm">
          <option value="">Choose a zone...</option>
          {wards.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#172B36]">Explainable Risk Analysis</h1>
          <p className="text-xs text-[#738087]">Transparent factor-by-factor risk breakdown</p>
        </div>
        <select value={zoneId} onChange={(e) => { const id = Number(e.target.value); setZoneId(id); onSelectWard(wards.find(w => w.id === id)); }}
          className="px-3 py-2 bg-white border border-[#D5D7D2] rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:border-[#267C78]">
          {wards.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
        </select>
      </div>

      {/* Zone header */}
      <div className="bg-white rounded-xl border border-[#D5D7D2] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#172B36]">{zone.name}</h2>
          <p className="text-xs text-[#738087]">{zone.code} · {zone.sub_region} · {zone.elevation_m}m MSL</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-extrabold text-xl"
            style={{ borderColor: RISK_COLORS[contrib.category], color: RISK_COLORS[contrib.category] }}>
            {contrib.total}
          </div>
          <span className="px-3 py-1 rounded text-sm font-bold" style={{ color: RISK_COLORS[contrib.category], backgroundColor: RISK_COLORS[contrib.category] + '15' }}>
            {contrib.category}
          </span>
        </div>
      </div>

      {/* Formula Display */}
      <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
        <h3 className="text-sm font-bold text-[#172B36] mb-3">Risk Calculation Formula</h3>
        <div className="bg-[#F7F6F2] rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-[#172B36] font-mono">R = 0.5 × P + 0.3 × D + 0.2 × T</div>
          <div className="text-xs text-[#738087] mt-1">P = Rainfall Risk · D = Drainage Risk · T = Terrain Risk · All inputs 0–100</div>
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-bold text-[#172B36] uppercase tracking-wider">Step-by-Step Calculation</h4>
          <div className="bg-[#F7F6F2] rounded-lg p-4 font-mono text-sm space-y-2">
            <div className="text-[#738087]">Given: P = {zone.rainfall_risk}, D = {zone.drainage_risk}, T = {zone.terrain_risk}</div>
            <div className="border-t border-[#D5D7D2] pt-2 space-y-1">
              <div>Rainfall: 0.5 × {zone.rainfall_risk} = <strong className="text-[#267C78]">{contrib.rainfall.contribution}</strong></div>
              <div>Drainage: 0.3 × {zone.drainage_risk} = <strong className="text-[#D69A42]">{contrib.drainage.contribution}</strong></div>
              <div>Terrain: 0.2 × {zone.terrain_risk} = <strong className="text-[#738087]">{contrib.terrain.contribution}</strong></div>
            </div>
            <div className="border-t border-[#D5D7D2] pt-2">
              <div>Total = {contrib.rainfall.contribution} + {contrib.drainage.contribution} + {contrib.terrain.contribution} = <strong className="text-[#172B36] text-base">{contrib.total}/100</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Bars */}
      <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
        <h3 className="text-sm font-bold text-[#172B36] mb-4">Factor Contributions (Ranked)</h3>
        <div className="space-y-4">
          {factors.map((f, i) => {
            const Icon = f.icon;
            const pct = contrib.total > 0 ? (f.contribution / contrib.total * 100).toFixed(1) : 0;
            return (
              <div key={f.name}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: f.color + '15', color: f.color }}>
                      {i + 1}
                    </span>
                    <Icon className="w-4 h-4" style={{ color: f.color }} />
                    <span className="font-semibold text-[#172B36]">{f.name}</span>
                    <span className="text-[#D5D7D2]">|</span>
                    <span className="text-[#738087]">Input: {f.input} × Weight: {f.weight}</span>
                  </div>
                  <span className="font-bold text-[#172B36]">{f.contribution} pts ({pct}%)</span>
                </div>
                <div className="h-3 bg-[#F3F1E9] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${f.contribution}%`, backgroundColor: f.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white rounded-xl border border-[#D5D7D2] p-5 space-y-3">
        <h3 className="text-sm font-bold text-[#172B36]">Natural Language Explanation</h3>
        <div className="p-4 bg-[#F7F6F2] rounded-lg text-sm text-[#263238] leading-relaxed">
          <Lightbulb className="w-4 h-4 inline mr-1.5 text-[#D69A42]" />
          {generateExplanation(zone.rainfall_risk, zone.drainage_risk, zone.terrain_risk)}
        </div>
      </div>

      {/* Counterfactual */}
      {counterfactual && (
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
          <h3 className="text-sm font-bold text-[#172B36] mb-3">Counterfactual Analysis</h3>
          <div className="p-4 bg-[#F7F6F2] rounded-lg">
            <p className="text-sm text-[#263238]">
              <strong>What if drainage risk were reduced by 20?</strong>
            </p>
            <p className="text-sm text-[#738087] mt-1">
              Drainage input would change from {zone.drainage_risk} to {counterfactual.newD}.
              The risk score would become <strong style={{ color: RISK_COLORS[counterfactual.newCat] }}>{counterfactual.newScore}</strong> ({counterfactual.newCat}),
              a change of <span className={counterfactual.diff < 0 ? 'text-[#438A69] font-bold' : 'text-[#B94B48] font-bold'}>{counterfactual.diff > 0 ? '+' : ''}{counterfactual.diff}</span> from the current score.
            </p>
          </div>
        </div>
      )}

      {/* Recommended Action */}
      <div className="bg-[#267C78]/5 rounded-xl border border-[#267C78]/20 p-5">
        <div className="flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-[#267C78] mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-[#267C78] mb-1">Recommended Action</h3>
            <p className="text-sm text-[#263238]">{getRecommendedAction(zone.rainfall_risk, zone.drainage_risk, zone.terrain_risk)}</p>
            <button onClick={() => setActiveTab('decision-lab')} className="mt-2 text-xs text-[#267C78] font-semibold hover:underline cursor-pointer flex items-center space-x-1">
              <span>Open in Decision Lab</span><ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-[#738087]">
        This is a weighted rule-based score, not a trained ML model. A score of {contrib.total}/100 is not a {contrib.total}% probability of flooding.
      </div>
    </div>
  );
}
