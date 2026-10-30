import React from 'react';
import { X, MapPin, FlaskConical, HelpCircle, Sliders, ShieldCheck, Droplets, Waves, Mountain } from 'lucide-react';
import { RISK_COLORS, getContributions, getRecommendedAction } from '../utils/riskEngine';

export default function WardModal({ ward, onClose, onLaunchMap, onLaunchCompare, onLaunchExplain, onLaunchSimulator, onLaunchDispatch }) {
  if (!ward) return null;
  const c = getContributions(ward.rainfall_risk, ward.drainage_risk, ward.terrain_risk);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl border border-[#D5D7D2] shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-[#D5D7D2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#172B36]">{ward.name}</h2>
            <p className="text-xs text-[#738087]">{ward.code} · {ward.sub_region}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F7F6F2] text-[#738087] cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-extrabold text-xl" style={{ borderColor: RISK_COLORS[c.category], color: RISK_COLORS[c.category] }}>{c.total}</div>
            <div>
              <span className="px-3 py-1 rounded text-sm font-bold" style={{ color: RISK_COLORS[c.category], backgroundColor: RISK_COLORS[c.category] + '15' }}>{c.category} Risk</span>
              <div className="text-xs text-[#738087] mt-1">Elevation: {ward.elevation_m}m MSL</div>
            </div>
          </div>
          <div className="space-y-2">
            {[{l:'Rainfall',v:ward.rainfall_risk,cv:c.rainfall.contribution,ic:Droplets,cl:'#267C78'},{l:'Drainage',v:ward.drainage_risk,cv:c.drainage.contribution,ic:Waves,cl:'#D69A42'},{l:'Terrain',v:ward.terrain_risk,cv:c.terrain.contribution,ic:Mountain,cl:'#738087'}].map(f=>{
              const Icon=f.ic;
              return(<div key={f.l} className="flex items-center justify-between text-xs"><div className="flex items-center space-x-1.5"><Icon className="w-3.5 h-3.5" style={{color:f.cl}}/><span className="text-[#738087]">{f.l}</span></div>
                <div><span className="font-bold text-[#172B36]">{f.v}</span> <span className="text-[#738087]">→ {f.cv} pts</span></div></div>);
            })}
          </div>
          <div className="p-3 bg-[#267C78]/5 rounded-lg text-xs text-[#267C78]"><ShieldCheck className="w-3.5 h-3.5 inline mr-1" />{getRecommendedAction(ward.rainfall_risk, ward.drainage_risk, ward.terrain_risk)}</div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onLaunchMap(ward)} className="py-2 rounded-lg bg-white border border-[#D5D7D2] text-[#738087] text-xs font-semibold cursor-pointer flex items-center justify-center space-x-1"><MapPin className="w-3 h-3"/><span>Map</span></button>
            <button onClick={() => onLaunchCompare(ward)} className="py-2 rounded-lg bg-white border border-[#D5D7D2] text-[#738087] text-xs font-semibold cursor-pointer flex items-center justify-center space-x-1"><HelpCircle className="w-3 h-3"/><span>Compare</span></button>
            <button onClick={() => onLaunchExplain(ward)} className="py-2 rounded-lg bg-white border border-[#D5D7D2] text-[#738087] text-xs font-semibold cursor-pointer flex items-center justify-center space-x-1"><Sliders className="w-3 h-3"/><span>Explain</span></button>
            <button onClick={() => onLaunchSimulator(ward)} className="py-2 rounded-lg bg-[#267C78] text-white text-xs font-bold cursor-pointer flex items-center justify-center space-x-1"><FlaskConical className="w-3 h-3"/><span>Decision Lab</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
