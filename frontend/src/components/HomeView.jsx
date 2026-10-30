import React from 'react';
import {
  ShieldCheck, MapPin, FlaskConical, BarChart3, HelpCircle,
  Database, ListOrdered, ArrowRight, Target, Search, Sliders,
  CheckCircle2, TrendingUp, AlertTriangle, ChevronRight, Droplets
} from 'lucide-react';
import { RISK_COLORS } from '../utils/riskEngine';

export default function HomeView({ summary, setActiveTab }) {
  const kpis = summary?.kpis || {};
  const rankings = (summary?.zone_rankings || []).slice(0, 5);
  const avgFactors = summary?.avg_risk_factors || {};
  const ctx = summary?.corridor_context || {};

  const workflowSteps = [
    { icon: Target, label: 'IDENTIFY', desc: 'Locate zones with elevated risk using geographic intelligence', color: '#267C78' },
    { icon: HelpCircle, label: 'EXPLAIN', desc: 'Understand why each zone scores the way it does', color: '#D69A42' },
    { icon: Sliders, label: 'SIMULATE', desc: 'Test what-if scenarios and compare interventions', color: '#267C78' },
    { icon: ListOrdered, label: 'PRIORITIZE', desc: 'Rank zones by risk to focus resources effectively', color: '#B94B48' },
    { icon: CheckCircle2, label: 'RECOMMEND', desc: 'Generate actionable preventive recommendations', color: '#438A69' },
  ];

  const navCards = [
    { id: 'dashboard', icon: BarChart3, title: 'Unified Dashboard', desc: 'Complete command centre with all zone metrics' },
    { id: 'gis', icon: MapPin, title: 'GIS Risk Map', desc: 'Interactive geographic visualization of all zones' },
    { id: 'decision-lab', icon: FlaskConical, title: 'Decision Lab', desc: 'Simulate scenarios and compare interventions', featured: true },
    { id: 'explain', icon: HelpCircle, title: 'Explainable Risk', desc: 'Transparent factor-by-factor risk breakdown' },
    { id: 'priority', icon: ListOrdered, title: 'Priority Centre', desc: 'Ranked prevention priority recommendations' },
    { id: 'data-trust', icon: Database, title: 'Data Trust Centre', desc: 'Complete data transparency and provenance' },
  ];

  const statCards = [
    { label: 'Monitored Zones', value: kpis.total_zones || 16, color: '#267C78', icon: MapPin },
    { label: 'Critical Zones', value: kpis.critical_risk_zones || 0, color: '#B94B48', icon: AlertTriangle },
    { label: 'Average Risk', value: kpis.average_risk_score ? `${Math.round(kpis.average_risk_score)}` : '—', color: '#D69A42', icon: TrendingUp },
    { label: 'Data Source', value: 'Synthetic', color: '#738087', icon: Database },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero */}
      <div className="bg-white rounded-xl border border-[#D5D7D2] p-8 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-[#267C78]" />
              <span className="text-[11px] font-bold tracking-[0.15em] text-[#738087] uppercase">Gharuan–Kharar Pilot · Punjab, India</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#172B36] tracking-tight">
              CIVISENSE
            </h1>
            <p className="text-sm font-semibold text-[#267C78] tracking-[0.1em] uppercase">
              Predict · Prioritize · Prevent
            </p>
            <p className="text-[#738087] text-sm leading-relaxed max-w-xl">
              Urban waterlogging risk intelligence platform for the Gharuan–Kharar corridor.
              Combines location-oriented risk information, explainable scoring, interactive scenario
              simulation, and preventive action recommendations.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => setActiveTab('dashboard')} className="px-5 py-2.5 bg-[#267C78] hover:bg-[#1e6a66] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Open Dashboard</span>
              </button>
              <button onClick={() => setActiveTab('decision-lab')} className="px-5 py-2.5 bg-white hover:bg-[#F7F6F2] text-[#267C78] text-sm font-semibold rounded-lg border border-[#267C78]/30 transition-colors cursor-pointer flex items-center space-x-2">
                <FlaskConical className="w-4 h-4" />
                <span>Launch Decision Lab</span>
              </button>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center space-y-2 bg-[#F7F6F2] rounded-xl p-6 min-w-[200px]">
            <div className="w-16 h-16 rounded-xl bg-[#267C78]/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#267C78]" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-[#172B36]">{kpis.total_zones || 16}</div>
              <div className="text-xs text-[#738087] font-medium">Demonstration Zones</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#B94B48]">{kpis.critical_risk_zones || 0}</div>
              <div className="text-[10px] text-[#738087]">Critical</div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Workflow */}
      <div>
        <h2 className="text-lg font-bold text-[#172B36] mb-4">Decision Intelligence Workflow</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="bg-white rounded-xl border border-[#D5D7D2] p-4 text-center relative">
                {i < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                    <ChevronRight className="w-4 h-4 text-[#D5D7D2]" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: step.color + '15' }}>
                  <Icon className="w-5 h-5" style={{ color: step.color }} />
                </div>
                <div className="text-xs font-bold text-[#172B36] tracking-wider">{step.label}</div>
                <p className="text-[10px] text-[#738087] mt-1 leading-snug">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-[#D5D7D2] p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <span className="text-[11px] font-semibold text-[#738087] uppercase">{s.label}</span>
              </div>
              <div className="text-2xl font-extrabold text-[#172B36]">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Top Priority Zones */}
      {rankings.length > 0 && (
        <div className="bg-white rounded-xl border border-[#D5D7D2] overflow-hidden">
          <div className="p-5 border-b border-[#D5D7D2] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#172B36]">Top Priority Zones</h2>
            <button onClick={() => setActiveTab('priority')} className="text-xs text-[#267C78] font-semibold hover:underline cursor-pointer flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F7F6F2] text-left text-[11px] font-semibold text-[#738087] uppercase tracking-wider">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Zone</th>
                  <th className="px-5 py-3">Score</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Primary Driver</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((z, i) => (
                  <tr
                    key={z.zone_id}
                    onClick={() => setActiveTab('decision-lab')}
                    className="border-t border-[#D5D7D2] hover:bg-[#F7F6F2] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 font-bold text-[#738087]">{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-[#172B36]">{z.zone_name}</div>
                      <div className="text-[11px] text-[#738087]">{z.zone_code}</div>
                    </td>
                    <td className="px-5 py-3 font-bold text-[#172B36]">{z.risk_score}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-bold" style={{
                        color: RISK_COLORS[z.risk_category],
                        backgroundColor: RISK_COLORS[z.risk_category] + '15',
                      }}>
                        {z.risk_category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#738087] text-xs">{z.primary_driver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pilot Context */}
      <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
        <h3 className="text-sm font-bold text-[#172B36] mb-2">Gharuan–Kharar Pilot Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-[11px] text-[#738087] uppercase font-semibold mb-0.5">Geographic Scope</div>
            <div className="text-[#263238]">{ctx.geographic_scope || 'Gharuan–Kharar corridor, Punjab'}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#738087] uppercase font-semibold mb-0.5">Reference Institution</div>
            <div className="text-[#263238]">{ctx.reference_institution || 'Chandigarh University, Gharuan'}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#738087] uppercase font-semibold mb-0.5">Data Classification</div>
            <div className="flex items-center space-x-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D69A42]/15 text-[#D69A42] border border-[#D69A42]/20">SYNTHETIC</span>
              <span className="text-[#738087] text-xs">Illustrative demonstration data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-lg font-bold text-[#172B36] mb-4">Explore Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                className={`text-left p-5 rounded-xl border transition-all cursor-pointer group ${
                  card.featured
                    ? 'bg-[#267C78]/5 border-[#267C78]/25 hover:border-[#267C78]/50'
                    : 'bg-white border-[#D5D7D2] hover:border-[#267C78]/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.featured ? '#267C7820' : '#F7F6F2' }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: card.featured ? '#267C78' : '#738087' }} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#D5D7D2] group-hover:text-[#267C78] transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-[#172B36] mb-1">{card.title}</h3>
                <p className="text-xs text-[#738087] leading-relaxed">{card.desc}</p>
                {card.featured && <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-bold bg-[#267C78]/15 text-[#267C78]">FLAGSHIP</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
