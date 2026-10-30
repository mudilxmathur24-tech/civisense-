import React from 'react';
import { Info, ShieldCheck, Target, HelpCircle, Sliders, ListOrdered, CheckCircle2, MapPin, Database, FlaskConical, Code, Globe } from 'lucide-react';

export default function AboutView({ setActiveTab }) {
  const workflow = [
    { icon: Target, label: 'Identify', desc: 'Locate zones with elevated risk using geographic intelligence' },
    { icon: HelpCircle, label: 'Explain', desc: 'Understand why each zone scores the way it does' },
    { icon: Sliders, label: 'Simulate', desc: 'Test what-if scenarios and compare interventions' },
    { icon: ListOrdered, label: 'Prioritize', desc: 'Rank zones by risk to focus attention' },
    { icon: CheckCircle2, label: 'Recommend', desc: 'Generate actionable preventive recommendations' },
  ];

  const stack = [
    { name: 'React 19', desc: 'Frontend framework' }, { name: 'Tailwind CSS 4', desc: 'Styling system' },
    { name: 'FastAPI', desc: 'Backend API' }, { name: 'SQLite', desc: 'Database' },
    { name: 'Leaflet', desc: 'Map visualization' }, { name: 'Lucide', desc: 'Icon library' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white rounded-xl border border-[#D5D7D2] p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#267C78]/10 flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-[#267C78]" /></div>
          <div><h1 className="text-2xl font-extrabold text-[#172B36]">CIVISENSE</h1><p className="text-sm text-[#267C78] font-semibold tracking-wider">PREDICT · PRIORITIZE · PREVENT</p></div>
        </div>
        <p className="text-sm text-[#738087] leading-relaxed max-w-2xl">
          CiviSense is a civic risk intelligence and preventive decision support platform. It combines location-oriented risk information, explainable scoring, interactive scenario simulation, and preventive action recommendations for the Gharuan–Kharar corridor in Punjab, India.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#D5D7D2] p-6">
        <h2 className="text-base font-bold text-[#172B36] mb-4">Decision Intelligence Workflow</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {workflow.map((s, i) => { const Icon = s.icon; return (
            <div key={s.label} className="text-center p-3 bg-[#F7F6F2] rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[#267C78]/10 flex items-center justify-center mx-auto mb-2"><Icon className="w-4.5 h-4.5 text-[#267C78]" /></div>
              <div className="text-xs font-bold text-[#172B36] uppercase">{s.label}</div>
              <p className="text-[10px] text-[#738087] mt-1">{s.desc}</p>
            </div>
          ); })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
          <h3 className="text-sm font-bold text-[#172B36] mb-3">Pilot Scope</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#738087]">Geography</span><span className="text-[#172B36]">Gharuan–Kharar, Punjab</span></div>
            <div className="flex justify-between"><span className="text-[#738087]">Reference</span><span className="text-[#172B36]">Chandigarh University</span></div>
            <div className="flex justify-between"><span className="text-[#738087]">Zones</span><span className="text-[#172B36]">16 demonstration zones</span></div>
            <div className="flex justify-between"><span className="text-[#738087]">Data</span><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D69A42]/15 text-[#D69A42]">SYNTHETIC</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
          <h3 className="text-sm font-bold text-[#172B36] mb-3">Technology Stack</h3>
          <div className="grid grid-cols-2 gap-2">
            {stack.map(s => (
              <div key={s.name} className="p-2 bg-[#F7F6F2] rounded-lg">
                <div className="text-xs font-bold text-[#172B36]">{s.name}</div>
                <div className="text-[10px] text-[#738087]">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
        <h3 className="text-sm font-bold text-[#172B36] mb-2">Risk Formula</h3>
        <div className="bg-[#F7F6F2] rounded-lg p-3 text-center font-mono font-bold text-[#172B36]">R = 0.5 × P + 0.3 × D + 0.2 × T</div>
        <p className="text-xs text-[#738087] mt-2">Weighted rule-based score. Not a trained ML model. Scores are not probabilities.</p>
      </div>

      <div className="bg-[#267C78]/5 rounded-xl border border-[#267C78]/20 p-5 text-center">
        <p className="text-sm font-semibold text-[#267C78] mb-1">Starting locally. Building a foundation for smarter, safer cities.</p>
        <p className="text-xs text-[#738087]">Zinnovatio 4.0 Hackathon Finale · Chandigarh University</p>
        <button onClick={() => setActiveTab('decision-lab')} className="mt-3 px-5 py-2 bg-[#267C78] text-white text-xs font-bold rounded-lg cursor-pointer">Explore Decision Lab →</button>
      </div>
    </div>
  );
}
