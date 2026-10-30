import React, { useState, useMemo } from 'react';
import { ListOrdered, Search, FileSpreadsheet, ChevronRight, ArrowUpDown, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { RISK_COLORS, getPrimaryDriver, getRecommendedAction } from '../utils/riskEngine';
import { getExportCSVUrl } from '../services/api';

export default function PriorityView({ summary, wards, selectedWard, setActiveTab, onSelectWard }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [sortDir, setSortDir] = useState('desc');
  const [statuses, setStatuses] = useState({});

  const sorted = useMemo(() => {
    let arr = [...(wards || [])];
    if (catFilter !== 'All') arr = arr.filter(w => w.prediction?.risk_category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(w => (w.name || '').toLowerCase().includes(q) || (w.code || '').toLowerCase().includes(q));
    }
    arr.sort((a, b) => {
      const sa = a.prediction?.final_risk_score || 0;
      const sb = b.prediction?.final_risk_score || 0;
      return sortDir === 'desc' ? sb - sa : sa - sb;
    });
    return arr;
  }, [wards, catFilter, search, sortDir]);

  const statusOptions = ['Pending Review', 'Under Review', 'Recommended', 'Completed'];
  const statusColors = {
    'Pending Review': '#738087',
    'Under Review': '#D69A42',
    'Recommended': '#267C78',
    'Completed': '#438A69',
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h1 className="text-xl font-bold text-[#172B36]">Prevention Priority Centre</h1>
        <p className="text-xs text-[#738087]">Where should authorities consider focusing attention first?</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#D5D7D2] p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#738087]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search zone by name or code..."
            className="w-full pl-9 pr-3 py-2 bg-[#F7F6F2] border border-[#D5D7D2] rounded-lg text-sm focus:outline-none focus:border-[#267C78]" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2 bg-[#F7F6F2] border border-[#D5D7D2] rounded-lg text-sm cursor-pointer focus:outline-none focus:border-[#267C78]">
          <option value="All">All Categories</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <a href={getExportCSVUrl()} download className="px-3 py-2 bg-[#F7F6F2] border border-[#D5D7D2] rounded-lg text-sm text-[#738087] hover:text-[#267C78] flex items-center space-x-1.5 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4" /><span>CSV</span>
        </a>
      </div>

      {/* Priority Table */}
      <div className="bg-white rounded-xl border border-[#D5D7D2] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F6F2] text-left text-[11px] font-semibold text-[#738087] uppercase tracking-wider">
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Local Area</th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                  <div className="flex items-center space-x-1">
                    <span>Score</span>
                    {sortDir === 'desc' ? <ChevronDown className="w-3 h-3 text-[#267C78]" /> : <ChevronUp className="w-3 h-3 text-[#267C78]" />}
                  </div>
                </th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 hidden lg:table-cell">Main Factor</th>
                <th className="px-4 py-3 hidden xl:table-cell">Recommended Action</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((w, i) => {
                const cat = w.prediction?.risk_category || 'Low';
                const score = w.prediction?.final_risk_score || 0;
                const driver = w.prediction?.primary_risk_driver || getPrimaryDriver(w.rainfall_risk, w.drainage_risk, w.terrain_risk);
                const action = w.prediction?.recommended_action || getRecommendedAction(w.rainfall_risk, w.drainage_risk, w.terrain_risk);
                const status = statuses[w.id] || 'Pending Review';
                return (
                  <tr key={w.id} onClick={() => { onSelectWard(w); }} className={`border-t border-[#D5D7D2] hover:bg-[#F7F6F2] cursor-pointer transition-colors ${i % 2 === 1 ? 'bg-[#FAFAF8]' : ''}`}>
                    <td className="px-4 py-3 font-bold text-[#738087]">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#738087]">{w.code}</td>
                    <td className="px-4 py-3 font-semibold text-[#172B36]">{w.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#172B36]">{score}</span>
                        <div className="w-10 h-1.5 bg-[#F3F1E9] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: RISK_COLORS[cat] }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold" style={{ color: RISK_COLORS[cat], backgroundColor: RISK_COLORS[cat] + '15' }}>{cat}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#738087]">{driver}</td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-[#738087] max-w-[200px] truncate">{action}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select value={status} onChange={(e) => setStatuses(prev => ({ ...prev, [w.id]: e.target.value }))}
                        className="px-2 py-1 rounded text-[11px] font-semibold border cursor-pointer focus:outline-none"
                        style={{ color: statusColors[status], borderColor: statusColors[status] + '40', backgroundColor: statusColors[status] + '10' }}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className="p-8 text-center text-sm text-[#738087]">No zones match the current filters.</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-[#738087]">
          Priority ranking based on illustrative demonstration data. Status labels are demonstration workflow indicators, not actual municipal work orders.
        </p>
        <button onClick={() => setActiveTab('decision-lab')} className="text-xs text-[#267C78] font-semibold hover:underline cursor-pointer flex items-center space-x-1">
          <span>Open Decision Lab</span><ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
