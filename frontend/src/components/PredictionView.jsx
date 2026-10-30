import React, { useState, useMemo, useEffect } from 'react';
import { Search as SearchIcon, Droplets, Waves, Mountain, Lightbulb, CheckCircle2, ChevronRight, FlaskConical } from 'lucide-react';
import { calculateRiskScore, classifyRisk, getContributions, generateExplanation, getRecommendedAction, getPrimaryDriver, RISK_COLORS } from '../utils/riskEngine';

export default function PredictionView({ wards, selectedWard, onSelectWard, setActiveTab }) {
  const [zoneId, setZoneId] = useState(selectedWard?.id || (wards[0]?.id ?? null));
  const zone = useMemo(() => wards.find(w => w.id === zoneId), [wards, zoneId]);

  useEffect(() => { if (selectedWard?.id) setZoneId(selectedWard.id); }, [selectedWard]);

  const contrib = useMemo(() => zone ? getContributions(zone.rainfall_risk, zone.drainage_risk, zone.terrain_risk) : null, [zone]);

  const factors = useMemo(() => {
    if (!contrib) return [];
    return [
      { name: 'Rainfall', icon: Droplets, color: '#267C78', input: zone.rainfall_risk, weight: 0.5, contribution: contrib.rainfall.contribution },
      { name: 'Drainage', icon: Waves, color: '#D69A42', input: zone.drainage_risk, weight: 0.3, contribution: contrib.drainage.contribution },
      { name: 'Terrain', icon: Mountain, color: '#738087', input: zone.terrain_risk, weight: 0.2, contribution: contrib.terrain.contribution },
    ].sort((a, b) => b.contribution - a.contribution);
  }, [contrib, zone]);

  if (!zone || !contrib) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D7D2] p-8 text-center animate-fade-in-up">
        <SearchIcon className="w-10 h-10 text-[#267C78] mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#172B36] mb-2">Zone Intelligence</h2>
        <p className="text-sm text-[#738087] mb-4">Select a zone to view its risk profile.</p>
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
        <div><h1 className="text-xl font-bold text-[#172B36]">Zone Intelligence</h1>
          <p className="text-xs text-[#738087]">Detailed risk profile and analysis</p></div>
        <select value={zoneId} onChange={(e) => { const id = Number(e.target.value); setZoneId(id); onSelectWard(wards.find(w => w.id === id)); }}
          className="px-3 py-2 bg-white border border-[#D5D7D2] rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:border-[#267C78]">
          {wards.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Zone Card */}
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
          <div className="text-center mb-4">
            <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center font-extrabold text-2xl mx-auto" style={{ borderColor: RISK_COLORS[contrib.category], color: RISK_COLORS[contrib.category] }}>{contrib.total}</div>
            <div className="mt-2"><span className="px-3 py-1 rounded text-sm font-bold" style={{ color: RISK_COLORS[contrib.category], backgroundColor: RISK_COLORS[contrib.category] + '15' }}>{contrib.category} Risk</span></div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#738087]">Zone</span><span className="font-semibold text-[#172B36]">{zone.name}</span></div>
            <div className="flex justify-between"><span className="text-[#738087]">Code</span><span className="font-mono text-[#263238]">{zone.code}</span></div>
            <div className="flex justify-between"><span className="text-[#738087]">Sub-Region</span><span className="text-[#263238]">{zone.sub_region}</span></div>
            <div className="flex justify-between"><span className="text-[#738087]">Elevation</span><span className="text-[#263238]">{zone.elevation_m}m MSL</span></div>
            <div className="flex justify-between"><span className="text-[#738087]">Population</span><span className="text-[#263238]">{zone.population?.toLocaleString() || '—'}</span></div>
            <div className="flex justify-between"><span className="text-[#738087]">Data</span><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D69A42]/15 text-[#D69A42]">{zone.data_tag || 'SYNTHETIC'}</span></div>
          </div>
          <button onClick={() => { onSelectWard(zone); setActiveTab('decision-lab'); }} className="w-full mt-4 py-2 rounded-lg bg-[#267C78] text-white text-xs font-bold cursor-pointer flex items-center justify-center space-x-1">
            <FlaskConical className="w-3.5 h-3.5" /><span>Open in Decision Lab</span>
          </button>
        </div>

        {/* Factors */}
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-5 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-[#172B36]">Factor Analysis (Ranked by Contribution)</h3>
          {factors.map((f, i) => {
            const Icon = f.icon;
            const pct = contrib.total > 0 ? (f.contribution / contrib.total * 100).toFixed(1) : 0;
            return (
              <div key={f.name} className="p-3 bg-[#F7F6F2] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: f.color + '15', color: f.color }}>{i + 1}</span>
                    <Icon className="w-4 h-4" style={{ color: f.color }} />
                    <span className="font-semibold text-sm text-[#172B36]">{f.name}</span>
                  </div>
                  <span className="text-sm font-bold text-[#172B36]">{f.contribution} pts ({pct}%)</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-[#738087]">
                  <span>Input: <strong className="text-[#172B36]">{f.input}</strong></span>
                  <span>×</span>
                  <span>Weight: <strong className="text-[#172B36]">{f.weight}</strong></span>
                  <span>=</span>
                  <span>Contribution: <strong style={{ color: f.color }}>{f.contribution}</strong></span>
                </div>
                <div className="h-2 bg-[#E2E4DF] rounded-full overflow-hidden mt-2">
                  <div className="h-full rounded-full" style={{ width: `${f.contribution * 2}%`, backgroundColor: f.color }} />
                </div>
              </div>
            );
          })}

          <div className="pt-3 border-t border-[#D5D7D2] flex items-center justify-between">
            <span className="text-sm font-bold text-[#172B36]">Total Score</span>
            <span className="text-lg font-extrabold" style={{ color: RISK_COLORS[contrib.category] }}>{contrib.total}/100</span>
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

      {/* All zones quick list */}
      <div className="bg-white rounded-xl border border-[#D5D7D2] overflow-hidden">
        <div className="p-4 border-b border-[#D5D7D2]"><h3 className="text-sm font-bold text-[#172B36]">All Zones Overview</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-0">
          {[...(wards || [])].sort((a, b) => (b.prediction?.final_risk_score || 0) - (a.prediction?.final_risk_score || 0)).map(w => {
            const cat = w.prediction?.risk_category || 'Low';
            const isSelected = w.id === zoneId;
            return (
              <button key={w.id} onClick={() => { setZoneId(w.id); onSelectWard(w); }}
                className={`p-3 text-center border-r border-b border-[#D5D7D2] cursor-pointer transition-colors ${isSelected ? 'bg-[#267C78]/10' : 'hover:bg-[#F7F6F2]'}`}>
                <div className="text-xs font-mono text-[#738087]">{w.code}</div>
                <div className="text-lg font-extrabold" style={{ color: RISK_COLORS[cat] }}>{w.prediction?.final_risk_score || 0}</div>
                <div className="text-[9px] font-bold" style={{ color: RISK_COLORS[cat] }}>{cat}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
