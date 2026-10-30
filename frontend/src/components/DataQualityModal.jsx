import React from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';

export default function DataQualityModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl border border-[#D5D7D2] shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-[#D5D7D2] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#172B36]">Data Quality & Transparency</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F7F6F2] text-[#738087] cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 bg-[#D69A42]/10 rounded-lg flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#D69A42] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#263238]"><strong>All values are illustrative demonstration data</strong>, not validated real-world measurements.</p>
          </div>
          {[
            { label: 'Risk Inputs', status: 'SYNTHETIC', desc: 'Generated for demonstration purposes' },
            { label: 'Zone Boundaries', status: 'SYNTHETIC', desc: 'Approximate areas, not official boundaries' },
            { label: 'Geographic Coordinates', status: 'ESTIMATED', desc: 'Based on publicly available maps' },
            { label: 'Sensor Readings', status: 'SYNTHETIC', desc: 'No physical sensors deployed' },
            { label: 'Population Data', status: 'SYNTHETIC', desc: 'Estimated ranges for demonstration' },
          ].map(d => (
            <div key={d.label} className="flex items-center justify-between p-3 bg-[#F7F6F2] rounded-lg">
              <div><div className="text-sm font-semibold text-[#172B36]">{d.label}</div><div className="text-[10px] text-[#738087]">{d.desc}</div></div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#D69A42]/15 text-[#D69A42] border border-[#D69A42]/20">{d.status}</span>
            </div>
          ))}
          <div className="p-3 bg-[#F7F6F2] rounded-lg text-xs text-[#738087]">
            <Info className="w-3 h-3 inline mr-1 text-[#267C78]" />
            Risk formula: R = 0.5×P + 0.3×D + 0.2×T — weighted rule-based score, not a trained ML model.
          </div>
        </div>
      </div>
    </div>
  );
}
