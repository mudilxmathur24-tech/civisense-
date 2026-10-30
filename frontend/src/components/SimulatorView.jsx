import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  CloudRain, 
  Droplets, 
  Activity, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { runSimulation, fetchSimulatorPresets, fetchSimulatorBaseline } from '../services/api';

export default function SimulatorView({ wards = [], selectedWard, onSelectWard, setActiveTab }) {
  // Simulator state with direct 0-100 controls and preset support
  const [params, setParams] = useState({
    target_ward_id: selectedWard?.id || wards[0]?.id || 1, // Focus zone
    rainfall_risk: null,
    drainage_risk: null,
    rainfall_delta: 25.0,
    drainage_delta: 30.0,
    drainage_capacity_pct: null,
    traffic_delta_pct: 20.0,
    preset_id: null
  });

  const [loading, setLoading] = useState(false);
  const [simResults, setSimResults] = useState(null);
  const [presets, setPresets] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    if (selectedWard && selectedWard.id) {
      setParams(prev => {
        if (prev.target_ward_id === selectedWard.id) return prev;
        const updated = {
          ...prev,
          target_ward_id: selectedWard.id
        };
        executeSimulation(updated);
        return updated;
      });
    }
  }, [selectedWard]);

  useEffect(() => {
    fetchSimulatorPresets()
      .then(data => {
        if (data?.presets) setPresets(data.presets);
      })
      .catch(() => {});
    executeSimulation(params);
  }, []);

  const executeSimulation = async (simParams) => {
    setLoading(true);
    try {
      const data = await runSimulation(simParams);
      setSimResults(data);
    } catch (err) {
      console.error('Simulation execution failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    if (type === 'range' || type === 'number') {
      parsedValue = parseFloat(value);
    } else if (name === 'target_ward_id') {
      parsedValue = value === 'ALL' ? null : parseInt(value);
      if (onSelectWard && parsedValue) {
        const found = wards.find(w => w.id === parsedValue);
        if (found) onSelectWard(found);
      }
    }

    const newParams = {
      ...params,
      preset_id: null, // clear preset when manual slider is touched
      [name]: parsedValue
    };
    setActivePreset(null);
    setParams(newParams);
    executeSimulation(newParams);
  };

  const handleDirectRiskChange = (type, val) => {
    const newParams = {
      ...params,
      preset_id: null,
      [type]: parseFloat(val)
    };
    setActivePreset(null);
    setParams(newParams);
    executeSimulation(newParams);
  };

  const loadPreset = (presetKey) => {
    setActivePreset(presetKey);
    const newParams = {
      ...params,
      preset_id: presetKey,
      rainfall_risk: null,
      drainage_risk: null
    };
    setParams(newParams);
    executeSimulation(newParams);
  };

  const handleReset = () => {
    setActivePreset('baseline');
    const resetParams = {
      target_ward_id: params.target_ward_id || 1,
      rainfall_risk: null,
      drainage_risk: null,
      rainfall_delta: 0.0,
      drainage_delta: 0.0,
      drainage_capacity_pct: null,
      traffic_delta_pct: 0.0,
      preset_id: 'baseline'
    };
    setParams(resetParams);
    executeSimulation(resetParams);
  };

  const kpis = simResults?.kpis || {};
  const zones = simResults?.zones || [];
  const rankedZones = simResults?.ranked_zones || zones;

  // Selected or featured zone comparison
  const targetId = params.target_ward_id || (zones[0]?.id || 1);
  const featuredZone = zones.find(z => z.id === targetId) || zones[0];

  // Filtered list for search
  const displayedZones = rankedZones.filter(z => {
    if (searchTerm.trim() === '') return true;
    const term = searchTerm.toLowerCase();
    return (z.name || '').toLowerCase().includes(term) || (z.code || '').toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8 py-2">
      {/* Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2">
              <Sliders className="w-6 h-6 text-cyan-400" />
              <span>What-If Urban Resilience Simulator</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              Interactive Decision Support
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Formulate multi-scenario stress tests using the 0.5R + 0.3D + 0.2T formula with immediate side-by-side risk recalculation.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer group"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400 group-hover:-rotate-90 transition-transform" />
            <span>Reset to Baseline</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendation')}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-950/30 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>View Suggested Actions</span>
          </button>
        </div>
      </div>

      {/* Instant Presets Bar (Required presets: heavy rainfall, reduced drainage capacity, improved drainage) */}
      <div className="glass-panel p-4 rounded-xl border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
            Standard Hydrological Presets:
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">Instant corridor recalculation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Heavy Rainfall Preset */}
          <button
            onClick={() => loadPreset('heavy_rainfall')}
            className={`text-left p-3 rounded-lg border transition-all text-xs cursor-pointer group ${
              activePreset === 'heavy_rainfall'
                ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-cyan-500/40'
            }`}
          >
            <div className="font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                <span>Heavy Rainfall</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">85/100</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Simulates severe monsoonal cloudburst along NH-05.
            </div>
          </button>

          {/* Reduced Drainage Capacity Preset */}
          <button
            onClick={() => loadPreset('reduced_drainage')}
            className={`text-left p-3 rounded-lg border transition-all text-xs cursor-pointer group ${
              activePreset === 'reduced_drainage'
                ? 'bg-rose-950/60 border-rose-400 shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-rose-500/40'
            }`}
          >
            <div className="font-bold text-white group-hover:text-rose-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Droplets className="w-3.5 h-3.5 text-rose-400" />
                <span>Reduced Drainage</span>
              </span>
              <span className="text-[10px] font-mono text-rose-400">90/100</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Simulates choked roadside culverts and silt blockage.
            </div>
          </button>

          {/* Improved Drainage Conditions Preset */}
          <button
            onClick={() => loadPreset('improved_drainage')}
            className={`text-left p-3 rounded-lg border transition-all text-xs cursor-pointer group ${
              activePreset === 'improved_drainage'
                ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-emerald-500/40'
            }`}
          >
            <div className="font-bold text-white group-hover:text-emerald-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Improved Drainage</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">20/100</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Desilted stormwater channels and cleared trash grates.
            </div>
          </button>

          {/* Compound Storm & Gridlock */}
          <button
            onClick={() => loadPreset('extreme_compound')}
            className={`text-left p-3 rounded-lg border transition-all text-xs cursor-pointer group ${
              activePreset === 'extreme_compound'
                ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-amber-500/40'
            }`}
          >
            <div className="font-bold text-white group-hover:text-amber-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Compound Surge</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400">90R + 85D</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Severe downpour combined with choked drainage.
            </div>
          </button>
        </div>
      </div>

      {/* Featured Side-by-Side Baseline vs Scenario Highlight Card */}
      {featuredZone && (
        <div className="glass-panel p-6 rounded-2xl border-cyan-800/50 bg-gradient-to-r from-slate-900/95 via-cyan-950/20 to-slate-900/95 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-base font-bold text-white">
                Side-by-Side Scenario Evaluation: <span className="text-cyan-300">{featuredZone.name} ({featuredZone.code})</span>
              </h3>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Elevation: <strong className="text-white">{featuredZone.elevation_m}m MSL</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Baseline Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold flex items-center justify-between">
                <span>Baseline Observed</span>
                <span className="text-slate-500">Calibrated</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black font-mono text-slate-200">
                  {featuredZone.baseline.risk_score}%
                </span>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                  featuredZone.baseline.risk_category === 'Critical' ? 'bg-rose-500/20 text-rose-300' :
                  (featuredZone.baseline.risk_category === 'High' ? 'bg-amber-500/20 text-amber-300' :
                  (featuredZone.baseline.risk_category === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-emerald-500/20 text-emerald-300'))
                }`}>
                  {featuredZone.baseline.risk_category}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono space-y-0.5 pt-1">
                <div>Rainfall: <strong>{featuredZone.baseline.rainfall_risk}/100</strong></div>
                <div>Drainage Risk: <strong>{featuredZone.baseline.drainage_risk}/100</strong></div>
                <div>Terrain Risk: <strong>{featuredZone.baseline.terrain_risk}/100</strong></div>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                Priority: <strong>{featuredZone.baseline.priority_level}</strong>
              </div>
            </div>

            {/* Simulated Scenario Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-800/60 space-y-2 shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]">
              <div className="text-[10px] uppercase font-mono text-cyan-300 font-bold flex items-center justify-between">
                <span>Simulated Scenario</span>
                <span className={featuredZone.delta.risk_score_diff > 0 ? 'text-rose-400 font-bold' : (featuredZone.delta.risk_score_diff < 0 ? 'text-emerald-400 font-bold' : 'text-slate-400')}>
                  {featuredZone.delta.risk_score_diff > 0 ? `+${featuredZone.delta.risk_score_diff} pts` : `${featuredZone.delta.risk_score_diff} pts`}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-3xl font-black font-mono ${
                  featuredZone.simulated.risk_score >= 80 ? 'text-rose-400' :
                  (featuredZone.simulated.risk_score >= 60 ? 'text-amber-300' :
                  (featuredZone.simulated.risk_score >= 35 ? 'text-yellow-300' : 'text-emerald-400'))
                }`}>
                  {featuredZone.simulated.risk_score}%
                </span>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                  featuredZone.simulated.risk_category === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  (featuredZone.simulated.risk_category === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  (featuredZone.simulated.risk_category === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'))
                }`}>
                  {featuredZone.simulated.risk_category}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-mono space-y-0.5 pt-1">
                <div>Sim. Rain: <strong>{featuredZone.simulated.rainfall_risk}/100</strong></div>
                <div>Sim. Drain Risk: <strong>{featuredZone.simulated.drainage_risk}/100</strong></div>
                <div>Sim. Water Depth: <strong>{featuredZone.simulated.predicted_depth_cm} cm</strong></div>
              </div>
              <div className="text-[11px] text-cyan-300 font-bold pt-1 border-t border-slate-800">
                Shift: {featuredZone.delta.summary}
              </div>
            </div>

            {/* Simulated Recommended Action & Explanation */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold">
                  Recommended Response
                </div>
                <div className="text-xs text-white font-medium mt-1 leading-relaxed">
                  {featuredZone.simulated.recommended_action}
                </div>
                {featuredZone.simulated.action_rationale && (
                  <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                    <strong>Rationale:</strong> {featuredZone.simulated.action_rationale}
                  </div>
                )}
              </div>
              <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                Rank in Simulation: <strong className="text-white">#{featuredZone.simulated.rank || 1}</strong> of {zones.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Controls (5 cols) + Zone Comparison Ranking Matrix (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Scenario Control Parameters</h3>
              <p className="text-[10px] text-slate-400">Direct inputs for 0.5R + 0.3D + 0.2T</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Immediate Recalculation</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Zone Selection Dropdown */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <label className="text-slate-300 text-xs font-semibold flex items-center justify-between">
                <span>Target Focus Zone:</span>
                <span className="text-[10px] text-cyan-400 font-mono">16 Pilot Zones</span>
              </label>
              <select
                name="target_ward_id"
                value={params.target_ward_id || 'ALL'}
                onChange={handleSliderChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 outline-none text-xs font-mono"
              >
                <option value="ALL">All 16 Pilot Zones (Corridor-wide)</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>{w.code}: {w.name}</option>
                ))}
              </select>
            </div>

            {/* 1. Rainfall Risk Control (0 to 100) */}
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-200 font-sans font-semibold flex items-center space-x-1.5">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <span>Rainfall Delta & Stress</span>
                </span>
                <span className="font-bold text-cyan-300">
                  {params.rainfall_risk !== null ? `${params.rainfall_risk}/100 direct` : (params.rainfall_delta > 0 ? `+${params.rainfall_delta} pts` : `${params.rainfall_delta} pts`)}
                </span>
              </div>
              <input
                type="range"
                min="-40"
                max="50"
                step="5"
                name="rainfall_delta"
                value={params.rainfall_delta}
                onChange={handleSliderChange}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Drizzle (-40 pts)</span>
                <span>Normal (0)</span>
                <span>Cloudburst (+50 pts)</span>
              </div>
            </div>

            {/* 2. Drainage Risk Control (0 to 100) */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-200 font-sans font-semibold flex items-center space-x-1.5">
                  <Droplets className="w-4 h-4 text-emerald-400" />
                  <span>Drainage Risk & Silt Choke</span>
                </span>
                <span className="font-bold text-emerald-300">
                  {params.drainage_risk !== null ? `${params.drainage_risk}/100 direct` : (params.drainage_delta > 0 ? `+${params.drainage_delta} choke` : `${params.drainage_delta} clear`)}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                name="drainage_delta"
                value={params.drainage_delta}
                onChange={handleSliderChange}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Desilted (-50 pts)</span>
                <span>Baseline (0)</span>
                <span>Severe Choke (+50 pts)</span>
              </div>
            </div>

            {/* 3. Traffic Congestion Factor (+0% to +60%) */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-200 font-sans font-semibold flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Traffic Surge on NH-05</span>
                </span>
                <span className="font-bold text-amber-300">
                  +{params.traffic_delta_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="10"
                name="traffic_delta_pct"
                value={params.traffic_delta_pct}
                onChange={handleSliderChange}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Normal Flow (+0%)</span>
                <span>Heavy (+30%)</span>
                <span>Gridlock (+60%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Matrix Table & Rankings (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Aggregated Simulation KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel p-3.5 rounded-xl border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Baseline Corridor Avg</div>
              <div className="mt-1 text-2xl font-black font-mono text-slate-300">
                {kpis.baseline_avg_risk ?? 63.0}%
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Simulated Avg Risk</div>
              <div className="mt-1 text-2xl font-black font-mono text-cyan-300">
                {kpis.simulated_avg_risk ?? 72.5}%
              </div>
            </div>

            <div className={`glass-panel p-3.5 rounded-xl border text-center ${
              (kpis.risk_change_pts ?? 0) > 0 ? 'border-rose-900/60 bg-rose-950/20' : 'border-emerald-900/60 bg-emerald-950/20'
            }`}>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Net Delta</div>
              <div className={`mt-1 text-2xl font-black font-mono flex items-center justify-center ${
                (kpis.risk_change_pts ?? 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {(kpis.risk_change_pts ?? 0) > 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
                <span>{(kpis.risk_change_pts ?? 0) > 0 ? `+${kpis.risk_change_pts}` : kpis.risk_change_pts} pts</span>
              </div>
            </div>
          </div>

          {/* Table comparing Before vs After */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">Zone Simulation & Priority Rankings</h4>
                <p className="text-[10px] text-slate-400">Ranked from highest to lowest simulated risk</p>
              </div>

              {/* Search */}
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
                <Search className="w-3 h-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter zone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-slate-200 outline-none text-xs w-28 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="sticky top-0 bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Rank & Zone</th>
                    <th className="py-2.5 px-3">Baseline</th>
                    <th className="py-2.5 px-3">Simulated</th>
                    <th className="py-2.5 px-3">Delta</th>
                    <th className="py-2.5 px-3 text-right">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {displayedZones.map((z, idx) => {
                    const diff = z.delta.risk_score_diff;
                    const isSelected = z.id === targetId;

                    return (
                      <tr 
                        key={z.id} 
                        onClick={() => {
                          setParams(p => ({ ...p, target_ward_id: z.id }));
                          executeSimulation({ ...params, target_ward_id: z.id });
                        }}
                        className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-950/30 border-l-2 border-cyan-400' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-sans">
                          <div className="font-semibold text-white flex items-center space-x-1.5">
                            <span className="font-mono text-cyan-400 text-xs">#{z.simulated.rank || idx + 1}</span>
                            <span>{z.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{z.code} &bull; {z.sub_region}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {z.baseline.risk_score}%
                          <span className="block text-[9px] text-slate-500 font-sans">{z.baseline.risk_category}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">
                          <span className={z.simulated.risk_score >= 80 ? 'text-rose-400' : (z.simulated.risk_score >= 60 ? 'text-amber-400' : 'text-cyan-300')}>
                            {z.simulated.risk_score}%
                          </span>
                          <span className="block text-[9px] text-slate-400 font-sans">{z.simulated.risk_category}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className={diff > 0 ? 'text-rose-400' : (diff < 0 ? 'text-emerald-400' : 'text-slate-400')}>
                            {diff > 0 ? `+${diff}` : diff} pts
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSelected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500'
                          }`}>
                            {isSelected ? 'ACTIVE' : 'SELECT'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
