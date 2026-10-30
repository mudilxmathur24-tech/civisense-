import React, { useState, useMemo } from 'react';
import {
  MapPin, FlaskConical, BarChart3, ListOrdered, FileSpreadsheet,
  ArrowRight, ChevronUp, ChevronDown, AlertTriangle, TrendingUp,
  Droplets, Layers, Database, ArrowUpDown
} from 'lucide-react';
import { RISK_COLORS, classifyRisk } from '../utils/riskEngine';
import { getExportCSVUrl } from '../services/api';

export default function DashboardView({ summary, wards, onSelectWard, setActiveTab }) {
  const kpis = summary?.kpis || {};
  const avgFactors = summary?.avg_risk_factors || {};
  const rankings = summary?.zone_rankings || [];
  const [sortField, setSortField] = useState('risk_score');
  const [sortDir, setSortDir] = useState('desc');

  const sortedWards = useMemo(() => {
    const arr = [...(wards || [])];
    arr.sort((a, b) => {
      let va, vb;
      if (sortField === 'risk_score') {
        va = a.prediction?.final_risk_score || 0;
        vb = b.prediction?.final_risk_score || 0;
      } else if (sortField === 'name') {
        va = a.name || ''; vb = b.name || '';
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      } else {
        va = a[sortField] || 0; vb = b[sortField] || 0;
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return arr;
  }, [wards, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-[#D5D7D2]" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#267C78]" /> : <ChevronDown className="w-3 h-3 text-[#267C78]" />;
  };

  const statCards = [
    { label: 'Total Zones', value: kpis.total_zones || 16, color: '#267C78', icon: MapPin },
    { label: 'Critical', value: kpis.critical_risk_zones || 0, color: '#B94B48', icon: AlertTriangle },
    { label: 'High Risk', value: kpis.high_risk_zones || 0, color: '#D18A35', icon: TrendingUp },
    { label: 'Medium', value: kpis.medium_risk_zones || 0, color: '#D2B64B', icon: Droplets },
    { label: 'Low Risk', value: kpis.low_risk_zones || 0, color: '#438A69', icon: Layers },
  ];

  const total = (kpis.total_zones || 16);
  const distBars = [
    { label: 'Critical', count: kpis.critical_risk_zones || 0, color: '#B94B48' },
    { label: 'High', count: kpis.high_risk_zones || 0, color: '#D18A35' },
    { label: 'Medium', count: kpis.medium_risk_zones || 0, color: '#D2B64B' },
    { label: 'Low', count: kpis.low_risk_zones || 0, color: '#438A69' },
  ];

  const factorBars = [
    { label: 'Rainfall Risk', value: Math.round(avgFactors.rainfall_risk || 0), color: '#267C78', weight: '0.5' },
    { label: 'Drainage Risk', value: Math.round(avgFactors.drainage_risk || 0), color: '#D69A42', weight: '0.3' },
    { label: 'Terrain Risk', value: Math.round(avgFactors.terrain_risk || 0), color: '#738087', weight: '0.2' },
  ];

  const actions = [
    { id: 'gis', icon: MapPin, label: 'GIS Map', desc: 'Geographic view' },
    { id: 'decision-lab', icon: FlaskConical, label: 'Decision Lab', desc: 'Simulate & compare' },
    { id: 'priority', icon: ListOrdered, label: 'Priority Centre', desc: 'Ranked zones' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B36]">Unified Dashboard</h1>
          <p className="text-sm text-[#738087]">Gharuan–Kharar pilot corridor overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 rounded text-[10px] font-bold bg-[#D69A42]/15 text-[#D69A42] border border-[#D69A42]/20">DEMO DATA</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-[#D5D7D2] p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: s.color }} />
                <span className="text-[11px] font-semibold text-[#738087] uppercase">{s.label}</span>
              </div>
              <div className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Distribution */}
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-[#172B36] mb-4">Risk Distribution</h3>
          {/* Stacked bar */}
          <div className="flex rounded-lg overflow-hidden h-8 mb-4">
            {distBars.map(b => {
              const pct = total > 0 ? (b.count / total) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div key={b.label} style={{ width: `${pct}%`, backgroundColor: b.color }} className="flex items-center justify-center text-white text-[10px] font-bold min-w-[30px]">
                  {b.count}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            {distBars.map(b => (
              <div key={b.label} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: b.color }} />
                <span className="text-[#738087]">{b.label}: <strong className="text-[#172B36]">{b.count}</strong> ({total > 0 ? Math.round(b.count / total * 100) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Average Risk Factors */}
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
          <h3 className="text-sm font-bold text-[#172B36] mb-4">Average Risk Factors</h3>
          <div className="space-y-4">
            {factorBars.map(f => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#738087] font-medium">{f.label} <span className="text-[10px]">(w={f.weight})</span></span>
                  <span className="font-bold text-[#172B36]">{f.value}/100</span>
                </div>
                <div className="h-2 bg-[#F3F1E9] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${f.value}%`, backgroundColor: f.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map(a => {
          const Icon = a.icon;
          return (
            <button key={a.id} onClick={() => setActiveTab(a.id)} className="bg-white rounded-xl border border-[#D5D7D2] p-4 flex items-center space-x-3 hover:border-[#267C78]/30 transition-colors cursor-pointer text-left group">
              <div className="w-10 h-10 rounded-lg bg-[#267C78]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#267C78]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#172B36]">{a.label}</div>
                <div className="text-[11px] text-[#738087]">{a.desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#D5D7D2] group-hover:text-[#267C78] ml-auto transition-colors" />
            </button>
          );
        })}
      </div>

      {/* Zone Matrix Table */}
      <div className="bg-white rounded-xl border border-[#D5D7D2] overflow-hidden">
        <div className="p-5 border-b border-[#D5D7D2] flex items-center justify-between">
          <h3 className="text-base font-bold text-[#172B36]">Zone Risk Matrix</h3>
          <a href={getExportCSVUrl()} download className="text-xs text-[#267C78] font-semibold hover:underline flex items-center space-x-1 cursor-pointer">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F6F2] text-left text-[11px] font-semibold text-[#738087] uppercase tracking-wider">
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('code')}>
                  <div className="flex items-center space-x-1"><span>Code</span><SortIcon field="code" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('name')}>
                  <div className="flex items-center space-x-1"><span>Zone</span><SortIcon field="name" /></div>
                </th>
                <th className="px-4 py-3 hidden md:table-cell">Sub-Region</th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('risk_score')}>
                  <div className="flex items-center space-x-1"><span>Score</span><SortIcon field="risk_score" /></div>
                </th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 hidden lg:table-cell">Primary Driver</th>
                <th className="px-4 py-3 hidden xl:table-cell">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedWards.map((w, i) => {
                const cat = w.prediction?.risk_category || 'Low';
                const score = w.prediction?.final_risk_score || 0;
                return (
                  <tr
                    key={w.id}
                    onClick={() => onSelectWard(w)}
                    className={`border-t border-[#D5D7D2] hover:bg-[#F7F6F2] cursor-pointer transition-colors ${i % 2 === 1 ? 'bg-[#FAFAF8]' : ''}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#738087]">{w.code}</td>
                    <td className="px-4 py-3 font-semibold text-[#172B36]">{w.name}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-[#738087]">{w.sub_region}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#172B36]">{score}</span>
                        <div className="w-12 h-1.5 bg-[#F3F1E9] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: RISK_COLORS[cat] }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold" style={{
                        color: RISK_COLORS[cat],
                        backgroundColor: RISK_COLORS[cat] + '15',
                      }}>{cat}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#738087]">{w.prediction?.primary_risk_driver || '—'}</td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-[#738087] max-w-[200px] truncate">{w.prediction?.recommended_action || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Notice */}
      <div className="bg-[#F7F6F2] rounded-xl border border-[#D5D7D2] p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-[#738087]">
          <Database className="w-4 h-4 text-[#D69A42]" />
          <span>All displayed values use illustrative demonstration data — not validated real-world measurements.</span>
        </div>
        <button onClick={() => setActiveTab('data-trust')} className="text-xs text-[#267C78] font-semibold hover:underline cursor-pointer whitespace-nowrap">
          Data Trust Centre →
        </button>
      </div>
    </div>
  );
}
