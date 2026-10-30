import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, RotateCcw, ShieldCheck, MapPin, Target, HelpCircle, FlaskConical, Sliders, ArrowUp, ListOrdered, CheckCircle2, Database, Sparkles, Droplets, Waves, Mountain } from 'lucide-react';
import { RISK_COLORS, getContributions, generateExplanation, getRecommendedAction, calculateRiskScore, classifyRisk, getPrimaryDriver } from '../utils/riskEngine';

export default function PresentationMode({ wards, summary, onClose, setActiveTab }) {
  const [step, setStep] = useState(0);
  const zone = wards?.[0]; // Demo zone
  const contrib = zone ? getContributions(zone.rainfall_risk, zone.drainage_risk, zone.terrain_risk) : null;
  // Simulated heavy rain
  const simRain = zone ? getContributions(90, zone.drainage_risk, zone.terrain_risk) : null;
  // Improved drainage
  const simDrain = zone ? getContributions(zone.rainfall_risk, Math.max(0, zone.drainage_risk - 25), zone.terrain_risk) : null;

  const steps = [
    { title: 'Welcome to CiviSense', subtitle: 'Gharuan–Kharar Pilot', content: (
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-[#267C78]/10 flex items-center justify-center mx-auto"><ShieldCheck className="w-10 h-10 text-[#267C78]" /></div>
        <h2 className="text-3xl font-extrabold text-[#172B36]">CIVISENSE</h2>
        <p className="text-lg text-[#267C78] font-semibold tracking-wider">PREDICT · PRIORITIZE · PREVENT</p>
        <p className="text-sm text-[#738087] max-w-lg mx-auto">A civic risk intelligence platform demonstrating how location-oriented data, explainable scoring, and interactive simulation can support urban waterlogging prevention in the Gharuan–Kharar corridor.</p>
        <div className="pt-2"><span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#D69A42]/15 text-[#D69A42]">ILLUSTRATIVE DEMONSTRATION</span></div>
      </div>
    )},
    { title: 'The GIS Risk Map', subtitle: 'Geographic intelligence', content: (
      <div className="space-y-4 text-center">
        <MapPin className="w-12 h-12 text-[#267C78] mx-auto" />
        <h3 className="text-xl font-bold text-[#172B36]">16 Demonstration Zones</h3>
        <p className="text-sm text-[#738087] max-w-md mx-auto">The interactive map displays all zones in the Gharuan–Kharar corridor, colour-coded by risk level. Click any zone to inspect its risk profile.</p>
        <div className="flex justify-center gap-4 pt-2">{['Critical','High','Medium','Low'].map(c=>(
          <div key={c} className="flex items-center space-x-1.5"><span className="w-4 h-4 rounded" style={{backgroundColor:RISK_COLORS[c]}}/><span className="text-xs text-[#738087]">{c}</span></div>
        ))}</div>
      </div>
    )},
    { title: 'Select a Zone', subtitle: zone?.name || 'Zone GH-01', content: zone && contrib && (
      <div className="text-center space-y-3">
        <Target className="w-10 h-10 text-[#267C78] mx-auto" />
        <h3 className="text-lg font-bold text-[#172B36]">{zone.name} ({zone.code})</h3>
        <p className="text-sm text-[#738087]">{zone.sub_region} · Elevation: {zone.elevation_m}m MSL</p>
        <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center font-extrabold text-2xl mx-auto" style={{ borderColor: RISK_COLORS[contrib.category], color: RISK_COLORS[contrib.category] }}>{contrib.total}</div>
        <span className="inline-block px-3 py-1 rounded text-sm font-bold" style={{ color: RISK_COLORS[contrib.category], backgroundColor: RISK_COLORS[contrib.category] + '15' }}>{contrib.category} Risk</span>
      </div>
    )},
    { title: 'Understand the Risk', subtitle: 'Three contributing factors', content: zone && contrib && (
      <div className="space-y-4 max-w-md mx-auto">
        <HelpCircle className="w-10 h-10 text-[#267C78] mx-auto" />
        <h3 className="text-lg font-bold text-[#172B36] text-center">Risk Score: {contrib.total}/100</h3>
        <div className="bg-[#F7F6F2] rounded-xl p-4 font-mono text-sm text-center">R = (0.5 × {zone.rainfall_risk}) + (0.3 × {zone.drainage_risk}) + (0.2 × {zone.terrain_risk}) = {contrib.total}</div>
        {[{l:'Rainfall',v:contrib.rainfall.contribution,c:'#267C78'},{l:'Drainage',v:contrib.drainage.contribution,c:'#D69A42'},{l:'Terrain',v:contrib.terrain.contribution,c:'#738087'}].map(f=>(
          <div key={f.l}><div className="flex justify-between text-xs mb-1"><span className="text-[#738087]">{f.l}</span><span className="font-bold text-[#172B36]">{f.v} pts</span></div>
          <div className="h-3 bg-[#E2E4DF] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${f.v*2}%`,backgroundColor:f.c}}/></div></div>
        ))}
      </div>
    )},
    { title: 'Open Decision Lab', subtitle: 'The flagship module', content: (
      <div className="text-center space-y-4">
        <FlaskConical className="w-12 h-12 text-[#267C78] mx-auto" />
        <h3 className="text-xl font-bold text-[#172B36]">CiviSense Decision Lab</h3>
        <p className="text-sm text-[#738087] max-w-md mx-auto">Five connected capabilities: Zone Intelligence, What-If Simulator, Baseline vs Simulation, Intervention Impact, and Decision Summary.</p>
        <p className="text-xs text-[#267C78] font-semibold">Don't just see the risk. Understand it. Test it. Prioritize what to do next.</p>
      </div>
    )},
    { title: 'Change Rainfall', subtitle: 'What-If: Heavy rainfall scenario', content: zone && contrib && simRain && (
      <div className="space-y-4 max-w-md mx-auto text-center">
        <Sliders className="w-10 h-10 text-[#267C78] mx-auto" />
        <h3 className="text-lg font-bold text-[#172B36]">Increase Rainfall to 90</h3>
        <p className="text-sm text-[#738087]">Rainfall input: {zone.rainfall_risk} → 90</p>
        <div className="flex justify-center items-center space-x-6">
          <div><div className="text-xs text-[#738087] mb-1">Baseline</div><div className="text-2xl font-extrabold" style={{color:RISK_COLORS[contrib.category]}}>{contrib.total}</div></div>
          <ChevronRight className="w-6 h-6 text-[#D5D7D2]" />
          <div><div className="text-xs text-[#738087] mb-1">Simulated</div><div className="text-2xl font-extrabold" style={{color:RISK_COLORS[simRain.category]}}>{simRain.total}</div></div>
        </div>
        <div className="text-sm font-bold text-[#B94B48]">+{Math.round((simRain.total - contrib.total)*100)/100} increase</div>
      </div>
    )},
    { title: 'Updated Score', subtitle: 'Recalculated using the risk engine', content: zone && simRain && (
      <div className="text-center space-y-4 max-w-md mx-auto">
        <ArrowUp className="w-10 h-10 text-[#B94B48] mx-auto" />
        <h3 className="text-lg font-bold text-[#172B36]">New Score: {simRain.total}/100</h3>
        <span className="inline-block px-3 py-1 rounded text-sm font-bold" style={{ color: RISK_COLORS[simRain.category], backgroundColor: RISK_COLORS[simRain.category] + '15' }}>{simRain.category}</span>
        <p className="text-sm text-[#738087]">The score increased because rainfall contribution rose from {contrib?.rainfall.contribution} to {simRain.rainfall.contribution} points.</p>
      </div>
    )},
    { title: 'Explain the Change', subtitle: 'Which factor caused the increase?', content: zone && simRain && (
      <div className="space-y-4 max-w-md mx-auto">
        <HelpCircle className="w-10 h-10 text-[#D69A42] mx-auto" />
        <h3 className="text-lg font-bold text-[#172B36] text-center">Factor Analysis</h3>
        <div className="p-4 bg-[#F7F6F2] rounded-xl text-sm text-[#263238] leading-relaxed">{generateExplanation(90, zone.drainage_risk, zone.terrain_risk)}</div>
        <p className="text-xs text-[#738087] text-center">Rainfall contribution increased by {simRain.rainfall.contribution - contrib.rainfall.contribution} points, driving the overall score higher.</p>
      </div>
    )},
    { title: 'Compare Interventions', subtitle: 'Improved drainage scenario', content: zone && contrib && simDrain && (
      <div className="space-y-4 max-w-md mx-auto text-center">
        <CheckCircle2 className="w-10 h-10 text-[#438A69] mx-auto" />
        <h3 className="text-lg font-bold text-[#172B36]">Drainage Improvement</h3>
        <p className="text-sm text-[#738087]">Drainage risk reduced by 25 (from {zone.drainage_risk} to {Math.max(0, zone.drainage_risk - 25)})</p>
        <div className="flex justify-center items-center space-x-6">
          <div><div className="text-xs text-[#738087] mb-1">Before</div><div className="text-2xl font-extrabold" style={{color:RISK_COLORS[contrib.category]}}>{contrib.total}</div></div>
          <ChevronRight className="w-6 h-6 text-[#D5D7D2]" />
          <div><div className="text-xs text-[#738087] mb-1">After</div><div className="text-2xl font-extrabold" style={{color:RISK_COLORS[simDrain.category]}}>{simDrain.total}</div></div>
        </div>
        <div className="text-sm font-bold text-[#438A69]">{Math.round((simDrain.total - contrib.total)*100)/100} reduction</div>
        <p className="text-[10px] text-[#738087]">Assumption: Drainage improvement reduces drainage risk input by an illustrative amount.</p>
      </div>
    )},
    { title: 'Update Priority', subtitle: 'Where to focus first', content: (
      <div className="space-y-4 max-w-md mx-auto">
        <ListOrdered className="w-10 h-10 text-[#267C78] mx-auto" />
        <h3 className="text-lg font-bold text-[#172B36] text-center">Prevention Priority Centre</h3>
        <p className="text-sm text-[#738087] text-center">Zones are automatically ranked by risk score. After simulation, updated rankings show which locations should receive attention first.</p>
        <div className="space-y-2">
          {(wards||[]).slice(0,5).sort((a,b)=>(b.prediction?.final_risk_score||0)-(a.prediction?.final_risk_score||0)).map((w,i)=>{
            const cat = w.prediction?.risk_category||'Low';
            return(<div key={w.id} className="flex items-center justify-between p-2 bg-[#F7F6F2] rounded-lg text-sm">
              <div className="flex items-center space-x-2"><span className="font-bold text-[#738087] w-5">{i+1}</span><span className="font-semibold text-[#172B36]">{w.name}</span></div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{color:RISK_COLORS[cat],backgroundColor:RISK_COLORS[cat]+'15'}}>{w.prediction?.final_risk_score}</span>
            </div>);
          })}
        </div>
      </div>
    )},
    { title: 'Recommend Action', subtitle: 'Preventive inspection', content: zone && (
      <div className="text-center space-y-4 max-w-md mx-auto">
        <CheckCircle2 className="w-10 h-10 text-[#438A69] mx-auto" />
        <h3 className="text-lg font-bold text-[#172B36]">Recommended Action</h3>
        <div className="p-4 bg-[#267C78]/5 rounded-xl text-sm text-[#267C78] font-medium">{getRecommendedAction(zone.rainfall_risk, zone.drainage_risk, zone.terrain_risk)}</div>
        <p className="text-xs text-[#738087]">Actions are recommendations based on risk factor analysis, not actual dispatches.</p>
      </div>
    )},
    { title: 'Data Trust', subtitle: 'Transparency and honesty', content: (
      <div className="text-center space-y-4 max-w-md mx-auto">
        <Database className="w-10 h-10 text-[#D69A42] mx-auto" />
        <h3 className="text-lg font-bold text-[#172B36]">Data Transparency</h3>
        <div className="space-y-2">
          {[{l:'Risk Inputs',t:'SYNTHETIC'},{l:'Zone Boundaries',t:'SYNTHETIC'},{l:'Geographic Data',t:'ESTIMATED'},{l:'Sensor Values',t:'SYNTHETIC'}].map(d=>(
            <div key={d.l} className="flex items-center justify-between p-2 bg-[#F7F6F2] rounded-lg text-sm">
              <span className="text-[#738087]">{d.l}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D69A42]/15 text-[#D69A42]">{d.t}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#738087]">CiviSense clearly labels all data sources. No values are presented as verified without evidence.</p>
      </div>
    )},
    { title: 'Thank You', subtitle: 'CiviSense — Predict. Prioritize. Prevent.', content: (
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-[#267C78]/10 flex items-center justify-center mx-auto"><ShieldCheck className="w-10 h-10 text-[#267C78]" /></div>
        <h2 className="text-2xl font-extrabold text-[#172B36]">CIVISENSE</h2>
        <p className="text-lg text-[#267C78] font-semibold">Starting locally. Building a foundation for smarter, safer cities.</p>
        <p className="text-sm text-[#738087]">Gharuan–Kharar Pilot · Chandigarh University · Zinnovatio 4.0</p>
        <div className="flex justify-center gap-3 pt-4">
          <button onClick={() => { onClose(); setActiveTab('decision-lab'); }} className="px-5 py-2.5 bg-[#267C78] text-white text-sm font-bold rounded-lg cursor-pointer">Explore Platform →</button>
        </div>
      </div>
    )},
  ];

  const total = steps.length;
  const current = steps[step];

  return (
    <div className="presentation-overlay flex flex-col">
      {/* Top bar */}
      <div className="h-14 px-6 border-b border-[#D5D7D2] flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-4 h-4 text-[#267C78]" />
          <span className="text-sm font-bold text-[#172B36]">Judge Demo Mode</span>
          <span className="text-xs text-[#738087]">Step {step + 1} of {total}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setStep(0)} className="px-3 py-1.5 text-xs text-[#738087] hover:text-[#172B36] cursor-pointer"><RotateCcw className="w-3.5 h-3.5 inline mr-1" />Restart</button>
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-[#B94B48] font-semibold cursor-pointer flex items-center space-x-1"><X className="w-3.5 h-3.5" /><span>Exit</span></button>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-[#E2E4DF]"><div className="h-full bg-[#267C78] transition-all duration-300" style={{ width: `${((step + 1) / total) * 100}%` }} /></div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full animate-fade-in-up" key={step}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#172B36]">{current.title}</h2>
            <p className="text-sm text-[#738087] mt-1">{current.subtitle}</p>
          </div>
          {current.content}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="h-16 px-6 border-t border-[#D5D7D2] flex items-center justify-between bg-white">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer flex items-center space-x-1 ${step === 0 ? 'text-[#D5D7D2]' : 'text-[#738087] hover:text-[#172B36] border border-[#D5D7D2]'}`}>
          <ChevronLeft className="w-4 h-4" /><span>Previous</span>
        </button>
        <div className="flex space-x-1">
          {steps.map((_, i) => <button key={i} onClick={() => setStep(i)} className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${i === step ? 'bg-[#267C78]' : 'bg-[#D5D7D2]'}`} />)}
        </div>
        <button onClick={() => setStep(Math.min(total - 1, step + 1))} disabled={step === total - 1}
          className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer flex items-center space-x-1 ${step === total - 1 ? 'text-[#D5D7D2]' : 'bg-[#267C78] text-white hover:bg-[#1e6a66]'}`}>
          <span>Next</span><ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
