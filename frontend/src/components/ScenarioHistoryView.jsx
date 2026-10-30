import React, { useState, useEffect } from 'react';
import { Clock, Trash2, BarChart3, Plus, X, AlertTriangle } from 'lucide-react';
import { calculateRiskScore, classifyRisk, RISK_COLORS } from '../utils/riskEngine';

const STORAGE_KEY = 'civisense_scenarios';

export default function ScenarioHistoryView({ wards, setActiveTab }) {
  const [scenarios, setScenarios] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', zoneId: '', rainfall: 50, drainage: 50, terrain: 50 });

  useEffect(() => {
    setScenarios(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  }, []);

  const save = (list) => { setScenarios(list); localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); };
  const deleteOne = (id) => save(scenarios.filter(s => s.id !== id));
  const clearAll = () => { save([]); setCompareIds([]); };
  const toggleCompare = (id) => setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);

  const addScenario = () => {
    if (!form.name.trim()) return;
    const zone = wards.find(w => w.id === Number(form.zoneId));
    const score = calculateRiskScore(form.rainfall, form.drainage, form.terrain);
    const newS = {
      id: Date.now().toString(), name: form.name,
      zoneName: zone?.name || 'Custom', zoneCode: zone?.code || '—',
      rainfallRisk: form.rainfall, drainageRisk: form.drainage, terrainRisk: form.terrain,
      resultScore: score, resultCategory: classifyRisk(score), savedAt: new Date().toISOString(),
    };
    save([newS, ...scenarios]);
    setShowAdd(false);
    setForm({ name: '', zoneId: '', rainfall: 50, drainage: 50, terrain: 50 });
  };

  const compared = scenarios.filter(s => compareIds.includes(s.id));

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B36]">Scenario History</h1>
          <p className="text-xs text-[#738087]">Saved simulation scenarios (stored locally in your browser)</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 bg-[#267C78] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center space-x-1">
            <Plus className="w-3.5 h-3.5" /><span>New</span>
          </button>
          {scenarios.length > 0 && (
            <button onClick={clearAll} className="px-3 py-1.5 bg-white text-[#B94B48] text-xs font-semibold rounded-lg border border-[#D5D7D2] cursor-pointer">Clear All</button>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#172B36]">Create New Scenario</h3>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Scenario name" className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#D5D7D2] rounded-lg text-sm focus:outline-none focus:border-[#267C78]" />
          <select value={form.zoneId} onChange={e => setForm({...form, zoneId: e.target.value})} className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#D5D7D2] rounded-lg text-sm cursor-pointer">
            <option value="">Select zone (optional)</option>
            {wards.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-3">
            {[{l:'Rainfall',k:'rainfall'},{l:'Drainage',k:'drainage'},{l:'Terrain',k:'terrain'}].map(f=>(
              <div key={f.k}><label className="text-[11px] text-[#738087] font-medium">{f.l}: {form[f.k]}</label>
              <input type="range" min="0" max="100" value={form[f.k]} onChange={e=>setForm({...form,[f.k]:Number(e.target.value)})} className="w-full" /></div>
            ))}
          </div>
          <div className="flex space-x-2">
            <button onClick={addScenario} className="px-4 py-2 bg-[#267C78] text-white text-xs font-bold rounded-lg cursor-pointer">Save</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-white text-[#738087] text-xs rounded-lg border border-[#D5D7D2] cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      {scenarios.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-10 text-center">
          <Clock className="w-10 h-10 text-[#D5D7D2] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#172B36] mb-1">No Saved Scenarios</h3>
          <p className="text-xs text-[#738087] mb-3">Use the Decision Lab to simulate scenarios and save them here.</p>
          <button onClick={() => setActiveTab('decision-lab')} className="px-4 py-2 bg-[#267C78] text-white text-xs font-bold rounded-lg cursor-pointer">Open Decision Lab</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#D5D7D2] overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F7F6F2] text-left text-[11px] font-semibold text-[#738087] uppercase tracking-wider">
              <th className="px-4 py-3 w-8"></th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">R/D/T</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Saved</th><th className="px-4 py-3 w-10"></th>
            </tr></thead>
            <tbody>
              {scenarios.map((s,i) => (
                <tr key={s.id} className={`border-t border-[#D5D7D2] ${i%2===1?'bg-[#FAFAF8]':''}`}>
                  <td className="px-4 py-3"><input type="checkbox" checked={compareIds.includes(s.id)} onChange={()=>toggleCompare(s.id)} className="cursor-pointer" /></td>
                  <td className="px-4 py-3 font-semibold text-[#172B36]">{s.name}</td>
                  <td className="px-4 py-3 text-xs text-[#738087]">{s.zoneName}<br/><span className="font-mono">{s.zoneCode}</span></td>
                  <td className="px-4 py-3 text-xs font-mono text-[#738087]">{s.rainfallRisk}/{s.drainageRisk}/{s.terrainRisk}</td>
                  <td className="px-4 py-3 font-bold text-[#172B36]">{s.resultScore}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{color:RISK_COLORS[s.resultCategory],backgroundColor:RISK_COLORS[s.resultCategory]+'15'}}>{s.resultCategory}</span></td>
                  <td className="px-4 py-3 text-[11px] text-[#738087]">{new Date(s.savedAt).toLocaleString()}</td>
                  <td className="px-4 py-3"><button onClick={()=>deleteOne(s.id)} className="text-[#B94B48] hover:text-[#B94B48]/70 cursor-pointer"><Trash2 className="w-4 h-4"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {compared.length >= 2 && (
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
          <h3 className="text-sm font-bold text-[#172B36] mb-4">Scenario Comparison</h3>
          <table className="w-full text-sm"><thead><tr className="bg-[#F7F6F2] text-left text-[11px] font-semibold text-[#738087] uppercase">
            <th className="px-4 py-2">Metric</th>{compared.map(s=><th key={s.id} className="px-4 py-2">{s.name}</th>)}
          </tr></thead><tbody className="text-xs">
            {['Zone','Rainfall','Drainage','Terrain','Score','Category'].map(m=>(
              <tr key={m} className="border-t border-[#D5D7D2]"><td className="px-4 py-2 text-[#738087] font-medium">{m}</td>
              {compared.map(s=><td key={s.id} className="px-4 py-2 font-semibold text-[#172B36]">
                {m==='Zone'?s.zoneName:m==='Rainfall'?s.rainfallRisk:m==='Drainage'?s.drainageRisk:m==='Terrain'?s.terrainRisk:m==='Score'?s.resultScore:
                <span style={{color:RISK_COLORS[s.resultCategory]}}>{s.resultCategory}</span>}
              </td>)}</tr>
            ))}
          </tbody></table>
        </div>
      )}

      <p className="text-[10px] text-[#738087]">Scenarios are stored locally in your browser. No cloud storage is used.</p>
    </div>
  );
}

