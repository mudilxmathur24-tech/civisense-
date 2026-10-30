import React, { useState } from 'react';
import {
  Menu,
  RotateCcw,
  Search,
  FileSpreadsheet,
  Sparkles,
  FlaskConical,
  X,
} from 'lucide-react';
import { getExportCSVUrl } from '../services/api';

export default function Navbar({
  activeTab,
  setActiveTab,
  onToggleSidebar,
  onRefresh,
  isRefreshing,
  criticalCount,
  onOpenPresentation,
  onOpenDataQuality,
  wards = [],
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getTabTitle = (tab) => {
    const titles = {
      home: 'Overview',
      dashboard: 'Unified Dashboard',
      gis: 'GIS Risk Map',
      prediction: 'Zone Intelligence',
      'decision-lab': 'Decision Lab',
      explain: 'Explainable Risk Analysis',
      priority: 'Prevention Priority Centre',
      recommendation: 'Recommended Actions',
      'data-trust': 'Data Trust Centre',
      'scenario-history': 'Scenario History',
      compare: 'Zone Comparison',
      reports: 'Reports & Analytics',
      about: 'About CiviSense',
    };
    return titles[tab] || 'Dashboard';
  };

  const filteredZones = searchQuery.trim()
    ? wards.filter(w =>
        (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.sub_region || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur-md border-b border-[#D5D7D2] px-4 sm:px-6 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg bg-[#F3F1E9] hover:bg-[#E2E4DF] text-[#263238] border border-[#D5D7D2] transition-all cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-[#267C78]" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline text-[10px] font-semibold text-[#738087] uppercase tracking-wider">
            CIVISENSE /
          </span>
          <h2 className="text-sm font-bold text-[#172B36] tracking-tight truncate">
            {getTabTitle(activeTab)}
          </h2>
          <span className="hidden md:inline px-2 py-0.5 rounded text-[9px] font-semibold bg-[#267C78]/10 text-[#267C78] border border-[#267C78]/20">
            Gharuan–Kharar
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        {/* Global Zone Search */}
        <div className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-lg bg-[#F7F6F2] hover:bg-[#E2E4DF] text-[#738087] border border-[#D5D7D2] transition-all cursor-pointer"
            title="Search zones"
          >
            {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>
          {searchOpen && (
            <div className="absolute right-0 top-12 w-72 bg-white border border-[#D5D7D2] rounded-lg shadow-xl z-50">
              <div className="p-2">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search zone by name, ID, area..."
                  className="w-full px-3 py-2 text-sm bg-[#F7F6F2] border border-[#D5D7D2] rounded-lg text-[#263238] placeholder:text-[#738087] focus:outline-none focus:border-[#267C78] focus:ring-1 focus:ring-[#267C78]/20"
                />
              </div>
              {filteredZones.length > 0 && (
                <div className="border-t border-[#D5D7D2] max-h-60 overflow-y-auto">
                  {filteredZones.map(z => (
                    <button
                      key={z.id}
                      onClick={() => {
                        setActiveTab('prediction');
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-[#F7F6F2] flex items-center justify-between text-sm cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-[#172B36]">{z.name}</div>
                        <div className="text-[11px] text-[#738087]">{z.code} · {z.sub_region}</div>
                      </div>
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{
                          color: z.prediction?.risk_category === 'Critical' ? '#B94B48' :
                                 z.prediction?.risk_category === 'High' ? '#D18A35' :
                                 z.prediction?.risk_category === 'Medium' ? '#D2B64B' : '#438A69',
                          backgroundColor: z.prediction?.risk_category === 'Critical' ? '#B94B4815' :
                                           z.prediction?.risk_category === 'High' ? '#D18A3515' :
                                           z.prediction?.risk_category === 'Medium' ? '#D2B64B15' : '#438A6915',
                        }}
                      >
                        {z.prediction?.final_risk_score}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery.trim() && filteredZones.length === 0 && (
                <div className="p-3 text-center text-sm text-[#738087] border-t border-[#D5D7D2]">
                  No zones found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Decision Lab CTA */}
        <button
          onClick={() => setActiveTab('decision-lab')}
          className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#267C78]/10 hover:bg-[#267C78]/20 text-[#267C78] border border-[#267C78]/25 text-xs font-semibold transition-all cursor-pointer"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Decision Lab</span>
        </button>

        {/* Judge Demo */}
        {onOpenPresentation && (
          <button
            onClick={onOpenPresentation}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#267C78] hover:bg-[#1e6a66] text-white font-bold text-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Judge Demo</span>
          </button>
        )}

        {/* CSV Export */}
        <a
          href={getExportCSVUrl()}
          download="civisense_gharuan_kharar_risk_report.csv"
          className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#F7F6F2] hover:bg-[#E2E4DF] text-[#738087] border border-[#D5D7D2] text-xs transition-all cursor-pointer"
          title="Download Risk Report CSV"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#438A69]" />
          <span>CSV</span>
        </a>

        {/* Sync */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh data"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F6F2] hover:bg-[#E2E4DF] text-[#738087] border border-[#D5D7D2] transition-all text-xs cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#267C78]' : ''}`} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Critical Badge */}
        {criticalCount > 0 && (
          <button
            onClick={() => setActiveTab('priority')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#B94B48]/10 hover:bg-[#B94B48]/15 text-[#B94B48] border border-[#B94B48]/25 text-xs font-bold transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#B94B48] animate-gentle-pulse" />
            <span className="hidden sm:inline">{criticalCount} Critical</span>
          </button>
        )}
      </div>
    </header>
  );
}
