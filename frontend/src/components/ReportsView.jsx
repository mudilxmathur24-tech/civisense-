import React from 'react';
import { BarChart3, FileSpreadsheet, Download, Printer, AlertTriangle } from 'lucide-react';
import { RISK_COLORS, getContributions, getRecommendedAction, getPrimaryDriver } from '../utils/riskEngine';
import { getExportCSVUrl } from '../services/api';

export default function ReportsView({ summary, wards }) {
  const generateTextReport = () => {
    const lines = [`CIVISENSE — Risk Assessment Report`, `Gharuan–Kharar Pilot Corridor`, `Generated: ${new Date().toLocaleString()}`, ``, `SUMMARY`, `Total Zones: ${summary?.kpis?.total_zones || 16}`,
      `Critical: ${summary?.kpis?.critical_risk_zones || 0}`, `High: ${summary?.kpis?.high_risk_zones || 0}`, `Medium: ${summary?.kpis?.medium_risk_zones || 0}`, `Low: ${summary?.kpis?.low_risk_zones || 0}`,
      `Average Risk: ${summary?.kpis?.average_risk_score || '—'}`, ``, `ZONE DETAILS`, `${'—'.repeat(80)}`];
    (wards || []).sort((a,b) => (b.prediction?.final_risk_score||0) - (a.prediction?.final_risk_score||0)).forEach((w,i) => {
      const c = getContributions(w.rainfall_risk, w.drainage_risk, w.terrain_risk);
      lines.push(``, `#${i+1} ${w.code} — ${w.name} (${w.sub_region})`, `  Score: ${c.total}/100 | Category: ${c.category}`,
        `  Rainfall: ${w.rainfall_risk} (contrib: ${c.rainfall.contribution})`, `  Drainage: ${w.drainage_risk} (contrib: ${c.drainage.contribution})`,
        `  Terrain: ${w.terrain_risk} (contrib: ${c.terrain.contribution})`, `  Primary Driver: ${getPrimaryDriver(w.rainfall_risk, w.drainage_risk, w.terrain_risk)}`,
        `  Action: ${getRecommendedAction(w.rainfall_risk, w.drainage_risk, w.terrain_risk)}`);
    });
    lines.push(``, `DATA NOTICE`, `All values are illustrative demonstration data.`, `Risk formula: R = 0.5×P + 0.3×D + 0.2×T (weighted rule-based score, NOT ML).`);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `civisense_report_${Date.now()}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div><h1 className="text-xl font-bold text-[#172B36]">Reports & Analytics</h1><p className="text-xs text-[#738087]">Export and download risk assessment reports</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href={getExportCSVUrl()} download className="bg-white rounded-xl border border-[#D5D7D2] p-5 hover:border-[#267C78]/30 transition-colors cursor-pointer block">
          <FileSpreadsheet className="w-8 h-8 text-[#438A69] mb-3" />
          <h3 className="text-sm font-bold text-[#172B36]">CSV Export</h3>
          <p className="text-xs text-[#738087] mt-1">Download all zone data as a spreadsheet-compatible CSV file.</p>
        </a>
        <button onClick={generateTextReport} className="bg-white rounded-xl border border-[#D5D7D2] p-5 hover:border-[#267C78]/30 transition-colors cursor-pointer text-left">
          <Download className="w-8 h-8 text-[#267C78] mb-3" />
          <h3 className="text-sm font-bold text-[#172B36]">Full Report</h3>
          <p className="text-xs text-[#738087] mt-1">Generate a comprehensive text report with all zones, scores, and recommendations.</p>
        </button>
        <button onClick={() => window.print()} className="bg-white rounded-xl border border-[#D5D7D2] p-5 hover:border-[#267C78]/30 transition-colors cursor-pointer text-left">
          <Printer className="w-8 h-8 text-[#D69A42] mb-3" />
          <h3 className="text-sm font-bold text-[#172B36]">Print Report</h3>
          <p className="text-xs text-[#738087] mt-1">Print the current view using your browser's print function.</p>
        </button>
      </div>

      {/* Quick summary table */}
      <div className="bg-white rounded-xl border border-[#D5D7D2] overflow-hidden">
        <div className="p-5 border-b border-[#D5D7D2]"><h3 className="text-sm font-bold text-[#172B36]">Report Preview — All Zones</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F7F6F2] text-left text-[11px] font-semibold text-[#738087] uppercase tracking-wider">
              <th className="px-4 py-3">#</th><th className="px-4 py-3">Zone</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Driver</th><th className="px-4 py-3">Data</th>
            </tr></thead>
            <tbody>
              {[...(wards||[])].sort((a,b)=>(b.prediction?.final_risk_score||0)-(a.prediction?.final_risk_score||0)).map((w,i)=>{
                const cat=w.prediction?.risk_category||'Low';
                return(<tr key={w.id} className={`border-t border-[#D5D7D2] ${i%2===1?'bg-[#FAFAF8]':''}`}>
                  <td className="px-4 py-2 text-[#738087]">{i+1}</td>
                  <td className="px-4 py-2"><div className="font-semibold text-[#172B36]">{w.name}</div><div className="text-[10px] text-[#738087]">{w.code}</div></td>
                  <td className="px-4 py-2 font-bold text-[#172B36]">{w.prediction?.final_risk_score||0}</td>
                  <td className="px-4 py-2"><span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{color:RISK_COLORS[cat],backgroundColor:RISK_COLORS[cat]+'15'}}>{cat}</span></td>
                  <td className="px-4 py-2 text-xs text-[#738087]">{w.prediction?.primary_risk_driver||'—'}</td>
                  <td className="px-4 py-2"><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D69A42]/15 text-[#D69A42]">{w.data_tag||'SYNTHETIC'}</span></td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-3 bg-[#D69A42]/10 rounded-lg text-xs text-[#D69A42] flex items-center space-x-2">
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /><span>All exported data is illustrative demonstration data, not validated measurements.</span>
      </div>
    </div>
  );
}
