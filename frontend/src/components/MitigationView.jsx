import React, { useState, useMemo } from 'react';
import { ShieldCheck, Search, ChevronRight, CheckCircle2, Clock, AlertTriangle, Droplets, Waves, Mountain } from 'lucide-react';
import { RISK_COLORS, getRecommendedAction, getPrimaryDriver, classifyRisk } from '../utils/riskEngine';

export default function MitigationView({ wards, selectedWard, onSelectWard, onRefreshSummary }) {
  const [catFilter, setCatFilter] = useState('All');
  const [actionLog, setActionLog] = useState([]);
  const [statuses, setStatuses] = useState({});

  const filtered = useMemo(() => {
    let arr = [...(wards || [])].sort((a, b) => (b.prediction?.final_risk_score || 0) - (a.prediction?.final_risk_score || 0));
    if (catFilter !== 'All') arr = arr.filter(w => w.prediction?.risk_category === catFilter);
    return arr;
  }, [wards, catFilter]);

  const statusOptions = ['Pending Review', 'Under Review', 'Recommended', 'Completed'];
  const statusIcons = { 'Pending Review': Clock, 'Under Review': AlertTriangle, 'Recommended': CheckCircle2, 'Completed': CheckCircle2 };
  const statusColors = { 'Pending Review': '#738087', 'Under Review': '#D69A42', 'Recommended': '#267C78', 'Completed': '#438A69' };

  const driverIcons = { Rainfall: Droplets, Drainage: Waves, Terrain: Mountain };

  const markAction = (ward, newStatus) => {
    setStatuses(prev => ({ ...prev, [ward.id]: newStatus }));
    setActionLog(prev => [{ id: Date.now(), zoneName: ward.name, zoneCode: ward.code, status: newStatus, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h1 className="text-xl font-bold text-[#172B36]">Recommended Actions</h1>
        <p className="text-xs text-[#738087]">Preventive action recommendations based on risk factors</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', 'Critical', 'High', 'Medium', 'Low'].map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
              catFilter === c ? 'bg-[#267C78] text-white border-[#267C78]' : 'bg-white text-[#738087] border-[#D5D7D2] hover:border-[#267C78]/30'
            }`}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(w => {
          const cat = w.prediction?.risk_category || 'Low';
          const score = w.prediction?.final_risk_score || 0;
          const driver = w.prediction?.primary_risk_driver || getPrimaryDriver(w.rainfall_risk, w.drainage_risk, w.terrain_risk);
          const action = getRecommendedAction(w.rainfall_risk, w.drainage_risk, w.terrain_risk);
          const status = statuses[w.id] || 'Pending Review';
          const DriverIcon = driverIcons[driver] || Droplets;
          return (
            <div key={w.id} className="bg-white rounded-xl border border-[#D5D7D2] p-4 hover:border-[#267C78]/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-[#172B36]">{w.name}</h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ color: RISK_COLORS[cat], backgroundColor: RISK_COLORS[cat] + '15' }}>{cat}</span>
                  </div>
                  <p className="text-[11px] text-[#738087]">{w.code} · Score: {score}/100</p>
                </div>
                <div className="flex items-center space-x-1.5 text-xs" style={{ color: RISK_COLORS[cat] }}>
                  <DriverIcon className="w-4 h-4" />
                  <span className="font-semibold">{driver}</span>
                </div>
              </div>
              <div className="p-3 bg-[#F7F6F2] rounded-lg text-xs text-[#263238] mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-[#267C78]" />
                {action}
              </div>
              <div className="flex items-center justify-between">
                <select value={status} onChange={(e) => markAction(w, e.target.value)}
                  className="px-2 py-1 rounded text-[11px] font-semibold border cursor-pointer focus:outline-none"
                  style={{ color: statusColors[status], borderColor: statusColors[status] + '40', backgroundColor: statusColors[status] + '10' }}>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => onSelectWard(w)} className="text-[11px] text-[#267C78] font-semibold hover:underline cursor-pointer flex items-center space-x-0.5">
                  <span>Details</span><ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Log */}
      {actionLog.length > 0 && (
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
          <h3 className="text-sm font-bold text-[#172B36] mb-3">Session Action Log</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {actionLog.map(log => (
              <div key={log.id} className="flex items-center justify-between text-xs p-2 bg-[#F7F6F2] rounded-lg">
                <div><span className="font-semibold text-[#172B36]">{log.zoneName}</span> <span className="text-[#738087]">({log.zoneCode})</span></div>
                <div className="flex items-center space-x-2">
                  <span style={{ color: statusColors[log.status] }} className="font-semibold">{log.status}</span>
                  <span className="text-[#D5D7D2]">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-[#738087]">
        This platform does not dispatch municipal teams. All actions shown are demonstration recommendations for illustrative purposes.
      </p>
    </div>
  );
}
