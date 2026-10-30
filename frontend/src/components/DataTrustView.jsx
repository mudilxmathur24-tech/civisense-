import React from 'react';
import { Database, Shield, AlertTriangle, ExternalLink, CheckCircle2, HelpCircle, Info } from 'lucide-react';

const dataFields = [
  { field: 'Rainfall Risk Input', source: 'Synthetic demonstration value', classification: 'SYNTHETIC', quality: 'Illustrative only', limitation: 'Not validated against IMD records' },
  { field: 'Drainage Risk Input', source: 'Synthetic demonstration value', classification: 'SYNTHETIC', quality: 'Illustrative only', limitation: 'No municipal drainage survey data' },
  { field: 'Terrain Risk Input', source: 'Derived from approximate elevation', classification: 'ESTIMATED', quality: 'Approximate', limitation: 'Elevation values are illustrative' },
  { field: 'Zone Boundaries', source: 'Approximate demonstration areas', classification: 'SYNTHETIC', quality: 'Illustrative only', limitation: 'Not official municipal boundaries' },
  { field: 'Geographic Coordinates', source: 'OpenStreetMap approximate', classification: 'ESTIMATED', quality: 'Approximate', limitation: 'Based on publicly available maps' },
  { field: 'Population Estimates', source: 'Synthetic range estimates', classification: 'SYNTHETIC', quality: 'Illustrative only', limitation: 'Not from census data' },
  { field: 'Sensor Readings', source: 'Simulated demonstration values', classification: 'SYNTHETIC', quality: 'Generated for demo', limitation: 'No physical sensors deployed' },
];

const futureSources = [
  { name: 'India Meteorological Department (IMD)', provides: 'Historical and real-time rainfall data for the region', status: 'Potential Future Source' },
  { name: 'OpenStreetMap', provides: 'Geographic information, roads, and building footprints', status: 'Partial — used for basemap tiles' },
  { name: 'ISRO Bhuvan', provides: 'High-resolution geospatial and elevation data', status: 'Potential Future Source' },
  { name: 'Central Water Commission', provides: 'River flow and hydrological monitoring data', status: 'Potential Future Source' },
  { name: 'Municipal Authorities', provides: 'Drainage infrastructure maps, historical waterlogging records', status: 'Potential Future Source' },
];

const classColors = {
  VERIFIED: { bg: '#438A6915', text: '#438A69', border: '#438A6930' },
  SYNTHETIC: { bg: '#D69A4215', text: '#D69A42', border: '#D69A4230' },
  ESTIMATED: { bg: '#D18A3515', text: '#D18A35', border: '#D18A3530' },
  MISSING: { bg: '#73808715', text: '#738087', border: '#73808730' },
};

export default function DataTrustView({ setActiveTab }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <Database className="w-5 h-5 text-[#267C78]" />
          <h1 className="text-xl font-bold text-[#172B36]">Data Trust Centre</h1>
        </div>
        <p className="text-sm text-[#738087]">Complete transparency about data sources, quality, and limitations</p>
      </div>

      <div className="bg-[#D69A42]/10 rounded-xl border border-[#D69A42]/25 p-5 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-[#D69A42] mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-[#D69A42] uppercase tracking-wider">Illustrative Demonstration Data</h3>
          <p className="text-sm text-[#263238] mt-1">All risk values, zone boundaries, and sensor readings displayed in this platform are synthetic demonstration data, not validated real-world measurements.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
        <h3 className="text-sm font-bold text-[#172B36] mb-4">Data Classification Key</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'VERIFIED', desc: 'Confirmed from authoritative source', key: 'VERIFIED' },
            { label: 'SYNTHETIC', desc: 'Generated for demonstration', key: 'SYNTHETIC' },
            { label: 'ESTIMATED', desc: 'Derived from approximate sources', key: 'ESTIMATED' },
            { label: 'MISSING', desc: 'Data not available', key: 'MISSING' },
          ].map(c => (
            <div key={c.key} className="p-3 rounded-lg border" style={{ backgroundColor: classColors[c.key].bg, borderColor: classColors[c.key].border }}>
              <span className="text-xs font-bold" style={{ color: classColors[c.key].text }}>{c.label}</span>
              <p className="text-[10px] text-[#738087] mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#D5D7D2] overflow-hidden">
        <div className="p-5 border-b border-[#D5D7D2]"><h3 className="text-sm font-bold text-[#172B36]">Data Field Inventory</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F6F2] text-left text-[11px] font-semibold text-[#738087] uppercase tracking-wider">
                <th className="px-4 py-3">Field</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Classification</th><th className="px-4 py-3">Quality</th><th className="px-4 py-3">Limitations</th>
              </tr>
            </thead>
            <tbody>
              {dataFields.map((f, i) => (
                <tr key={f.field} className={`border-t border-[#D5D7D2] ${i % 2 === 1 ? 'bg-[#FAFAF8]' : ''}`}>
                  <td className="px-4 py-3 font-semibold text-[#172B36]">{f.field}</td>
                  <td className="px-4 py-3 text-xs text-[#738087]">{f.source}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border" style={{ color: classColors[f.classification].text, backgroundColor: classColors[f.classification].bg, borderColor: classColors[f.classification].border }}>{f.classification}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#738087]">{f.quality}</td>
                  <td className="px-4 py-3 text-xs text-[#738087]">{f.limitation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
        <h3 className="text-sm font-bold text-[#172B36] mb-4">Potential Future Data Sources</h3>
        <div className="space-y-3">
          {futureSources.map(s => (
            <div key={s.name} className="flex items-start justify-between p-3 bg-[#F7F6F2] rounded-lg">
              <div><div className="text-sm font-semibold text-[#172B36]">{s.name}</div><div className="text-xs text-[#738087] mt-0.5">{s.provides}</div></div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${s.status.includes('Partial') ? 'bg-[#267C78]/10 text-[#267C78]' : 'bg-[#738087]/10 text-[#738087]'}`}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
        <h3 className="text-sm font-bold text-[#172B36] mb-3">Risk Calculation Methodology</h3>
        <div className="bg-[#F7F6F2] rounded-lg p-4 mb-3">
          <div className="text-base font-bold text-[#172B36] font-mono text-center">R = 0.5 × P + 0.3 × D + 0.2 × T</div>
          <div className="text-xs text-[#738087] text-center mt-1">P = Rainfall Risk · D = Drainage Risk · T = Terrain Risk</div>
        </div>
        <ul className="space-y-1.5 text-xs text-[#738087]">
          <li className="flex items-start space-x-2"><Info className="w-3 h-3 mt-0.5 text-[#267C78] flex-shrink-0" /><span>This is a <strong>weighted rule-based score</strong>, not a trained ML model.</span></li>
          <li className="flex items-start space-x-2"><Info className="w-3 h-3 mt-0.5 text-[#267C78] flex-shrink-0" /><span>A score of 79/100 is <strong>not</strong> a 79% probability of flooding.</span></li>
          <li className="flex items-start space-x-2"><Info className="w-3 h-3 mt-0.5 text-[#267C78] flex-shrink-0" /><span>Weights are illustrative and not calibrated against observed outcomes.</span></li>
        </ul>
      </div>

      <div className="bg-white rounded-xl border border-[#D5D7D2] p-5">
        <h3 className="text-sm font-bold text-[#172B36] mb-3">Known Limitations</h3>
        <div className="space-y-2 text-xs text-[#738087]">
          {['Does not predict actual flood events.', 'No real-time sensors connected.', 'Zone boundaries are illustrative.', 'Drainage data not field-validated.', 'Risk scores for comparison only.', 'Does not dispatch emergency teams.', 'Population data is synthetic.'].map((l, i) => (
            <div key={i} className="flex items-start space-x-2 p-2 bg-[#F7F6F2] rounded">
              <AlertTriangle className="w-3 h-3 mt-0.5 text-[#D69A42] flex-shrink-0" /><span>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
