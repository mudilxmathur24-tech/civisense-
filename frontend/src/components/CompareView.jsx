import React, { useState, useMemo } from 'react';
import { Scale, ArrowRight, Droplets, Waves, Mountain, CheckCircle2 } from 'lucide-react';
import { getContributions, generateExplanation, getRecommendedAction, getPrimaryDriver, RISK_COLORS } from '../utils/riskEngine';

export default function CompareView({ wards, selectedWard, onSelectWard, setActiveTab }) {
  const [zoneA, setZoneA] = useState(wards[0]?.id || null);
  const [zoneB, setZoneB] = useState(wards[1]?.id || null);
  const wA = useMemo(() => wards.find(w => w.id === zoneA), [wards, zoneA]);
  const wB = useMemo(() => wards.find(w => w.id === zoneB), [wards, zoneB]);
  const cA = useMemo(() => wA ? getContributions(wA.rainfall_risk, wA.drainage_risk, wA.terrain_risk) : null, [wA]);
  const cB = useMemo(() => wB ? getContributions(wB.rainfall_risk, wB.drainage_risk, wB.terrain_risk) : null, [wB]);

  const metrics = cA && cB ? [
    { label: 'Risk Score', a: cA.total, b: cB.total },
    { label: 'Category', a: cA.category, b: cB.category, isCategory: true },
    { label: 'Rainfall Risk', a: wA.rainfall_risk, b: wB.rainfall_risk },
    { label: 'Drainage Risk', a: wA.drainage_risk, b: wB.drainage_risk },
    { label: 'Terrain Risk', a: wA.terrain_risk, b: wB.terrain_risk },
    { label: 'Rainfall Contribution', a: cA.rainfall.contribution, b: cB.rainfall.contribution },
    { label: 'Drainage Contribution', a: cA.drainage.contribution, b: cB.drainage.contribution },
    { label: 'Terrain Contribution', a: cA.terrain.contribution, b: cB.terrain.contribution },
    { label: 'Primary Driver', a: getPrimaryDriver(wA.rainfall_risk, wA.drainage_risk, wA.terrain_risk), b: getPrimaryDriver(wB.rainfall_risk, wB.drainage_risk, wB.terrain_risk), isText: true },
  ] : [];

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h1 className="text-xl font-bold text-[#172B36]">Zone Comparison</h1>
        <p className="text-xs text-[#738087]">Compare risk profiles of two demonstration zones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-4">
          <label className="text-[11px] font-semibold text-[#738087] uppercase mb-2 block">Zone A</label>
          <select value={zoneA || ''} onChange={e => setZoneA(Number(e.target.value))} className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#D5D7D2] rounded-lg text-sm cursor-pointer focus:outline-none focus:border-[#267C78]">
            {wards.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
          </select>
        </div>
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-4">
          <label className="text-[11px] font-semibold text-[#738087] uppercase mb-2 block">Zone B</label>
          <select value={zoneB || ''} onChange={e => setZoneB(Number(e.target.value))} className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#D5D7D2] rounded-lg text-sm cursor-pointer focus:outline-none focus:border-[#267C78]">
            {wards.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
          </select>
        </div>
      </div>

      {cA && cB && wA && wB && (
        <>
          {/* Score comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-[#D5D7D2] p-5 text-center">
              <div className="text-[10px] font-bold text-[#738087] uppercase mb-2">{wA.name}</div>
              <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-extrabold text-xl mx-auto" style={{ borderColor: RISK_COLORS[cA.category], color: RISK_COLORS[cA.category] }}>{cA.total}</div>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold" style={{ color: RISK_COLORS[cA.category], backgroundColor: RISK_COLORS[cA.category] + '15' }}>{cA.category}</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-[#172B36]">{Math.abs(cA.total - cB.total)}</div>
                <div className="text-xs text-[#738087]">Score Difference</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#D5D7D2] p-5 text-center">
              <div className="text-[10px] font-bold text-[#738087] uppercase mb-2">{wB.name}</div>
              <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-extrabold text-xl mx-auto" style={{ borderColor: RISK_COLORS[cB.category], color: RISK_COLORS[cB.category] }}>{cB.total}</div>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold" style={{ color: RISK_COLORS[cB.category], backgroundColor: RISK_COLORS[cB.category] + '15' }}>{cB.category}</span>
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-xl border border-[#D5D7D2] overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F7F6F2] text-left text-[11px] font-semibold text-[#738087] uppercase tracking-wider">
                <th className="px-4 py-3">Metric</th><th className="px-4 py-3">{wA.name}</th><th className="px-4 py-3">{wB.name}</th>
              </tr></thead>
              <tbody>
                {metrics.map((m, i) => (
                  <tr key={m.label} className={`border-t border-[#D5D7D2] ${i % 2 === 1 ? 'bg-[#FAFAF8]' : ''}`}>
                    <td className="px-4 py-3 text-[#738087] font-medium">{m.label}</td>
                    <td className="px-4 py-3 font-bold">{m.isCategory ? <span style={{ color: RISK_COLORS[m.a] }}>{m.a}</span> : <span className="text-[#172B36]">{m.a}</span>}</td>
                    <td className="px-4 py-3 font-bold">{m.isCategory ? <span style={{ color: RISK_COLORS[m.b] }}>{m.b}</span> : <span className="text-[#172B36]">{m.b}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bar comparison */}
          <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
            <h3 className="text-sm font-bold text-[#172B36] mb-4">Factor Comparison</h3>
            {[{l:'Rainfall',a:wA.rainfall_risk,b:wB.rainfall_risk,c:'#267C78'},{l:'Drainage',a:wA.drainage_risk,b:wB.drainage_risk,c:'#D69A42'},{l:'Terrain',a:wA.terrain_risk,b:wB.terrain_risk,c:'#738087'}].map(f=>(
              <div key={f.l} className="mb-4">
                <div className="text-xs font-semibold text-[#172B36] mb-1">{f.l}</div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs"><span className="w-20 text-[#738087] truncate">{wA.code}</span>
                    <div className="flex-1 h-3 bg-[#F3F1E9] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${f.a}%`,backgroundColor:f.c}}/></div>
                    <span className="w-8 text-right font-bold text-[#172B36]">{f.a}</span></div>
                  <div className="flex items-center space-x-2 text-xs"><span className="w-20 text-[#738087] truncate">{wB.code}</span>
                    <div className="flex-1 h-3 bg-[#F3F1E9] rounded-full overflow-hidden"><div className="h-full rounded-full opacity-70" style={{width:`${f.b}%`,backgroundColor:f.c}}/></div>
                    <span className="w-8 text-right font-bold text-[#172B36]">{f.b}</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[{w:wA,c:cA},{w:wB,c:cB}].map(({w,c})=>(
              <div key={w.id} className="bg-[#267C78]/5 rounded-xl border border-[#267C78]/20 p-4">
                <div className="text-xs font-bold text-[#267C78] mb-1">{w.name} — Recommendation</div>
                <p className="text-sm text-[#263238]">{getRecommendedAction(w.rainfall_risk, w.drainage_risk, w.terrain_risk)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
