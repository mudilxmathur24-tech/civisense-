import React, { useRef, useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import { MapPin, X, ChevronRight, Layers, RotateCcw, FlaskConical, HelpCircle, Scale, Eye, EyeOff } from 'lucide-react';
import { RISK_COLORS, classifyRisk, getContributions, getRecommendedAction } from '../utils/riskEngine';

const CORRIDOR_CENTER = [30.70, 76.78];
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

export default function GISMapView({ wards, sensors, selectedWard, onSelectWard, setActiveTab }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layersRef = useRef({ zones: [], sensors: [], labels: [] });
  const [inspector, setInspector] = useState(null);
  const [showSensors, setShowSensors] = useState(true);
  const [riskFilter, setRiskFilter] = useState('All');

  const filteredWards = useMemo(() => {
    if (riskFilter === 'All') return wards;
    return wards.filter(w => {
      const cat = w.prediction?.risk_category || 'Low';
      if (riskFilter === 'Critical') return cat === 'Critical';
      if (riskFilter === 'High+') return cat === 'Critical' || cat === 'High';
      if (riskFilter === 'Medium+') return cat !== 'Low';
      return true;
    });
  }, [wards, riskFilter]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true }).setView(CORRIDOR_CENTER, 13);
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 18 }).addTo(map);
    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    // Clear old layers
    layersRef.current.zones.forEach(l => map.removeLayer(l));
    layersRef.current.labels.forEach(l => map.removeLayer(l));
    layersRef.current.zones = [];
    layersRef.current.labels = [];

    filteredWards.forEach(w => {
      if (!w.polygon || w.polygon.length < 3) return;
      const cat = w.prediction?.risk_category || 'Low';
      const color = RISK_COLORS[cat];
      const poly = L.polygon(w.polygon, {
        color, weight: 2, opacity: 0.8,
        fillColor: color, fillOpacity: 0.25,
      }).addTo(map);
      poly.on('click', () => { onSelectWard(w); setInspector(w); });
      poly.bindTooltip(`<strong>${w.code}</strong> — ${w.name}<br/>Score: ${w.prediction?.final_risk_score || 0}`, { sticky: true, className: '' });
      layersRef.current.zones.push(poly);

      // Label marker
      const center = poly.getBounds().getCenter();
      const label = L.marker(center, {
        icon: L.divIcon({
          className: '',
          html: `<div style="font-size:10px;font-weight:700;color:${color};text-shadow:0 0 3px white,0 0 3px white;white-space:nowrap">${w.code}</div>`,
          iconSize: [50, 14], iconAnchor: [25, 7],
        })
      }).addTo(map);
      layersRef.current.labels.push(label);
    });
  }, [filteredWards]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    layersRef.current.sensors.forEach(l => map.removeLayer(l));
    layersRef.current.sensors = [];
    if (!showSensors) return;
    (sensors || []).forEach(s => {
      const m = L.circleMarker([s.lat, s.lng], {
        radius: 5, color: '#267C78', fillColor: '#267C78', fillOpacity: 0.7, weight: 1,
      }).addTo(map);
      m.bindTooltip(`${s.name} (${s.type})`, { className: '' });
      layersRef.current.sensors.push(m);
    });
  }, [sensors, showSensors]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selectedWard) return;
    if (selectedWard.lat && selectedWard.lng) {
      map.flyTo([selectedWard.lat, selectedWard.lng], 14, { duration: 0.8 });
      setInspector(selectedWard);
    }
  }, [selectedWard]);

  const resetView = () => { mapInstance.current?.flyTo(CORRIDOR_CENTER, 13, { duration: 0.5 }); setInspector(null); };

  const iw = inspector; // inspected ward
  const ic = iw ? getContributions(iw.rainfall_risk, iw.drainage_risk, iw.terrain_risk) : null;

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B36]">GIS Risk Map</h1>
          <p className="text-xs text-[#738087]">Gharuan–Kharar corridor · {filteredWards.length} zones displayed</p>
        </div>
        <div className="flex items-center space-x-2">
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="px-2 py-1.5 bg-white border border-[#D5D7D2] rounded-lg text-xs cursor-pointer focus:outline-none focus:border-[#267C78]">
            <option value="All">All Zones</option>
            <option value="Critical">Critical Only</option>
            <option value="High+">High+</option>
            <option value="Medium+">Medium+</option>
          </select>
          <button onClick={() => setShowSensors(!showSensors)} className={`p-1.5 rounded-lg border text-xs cursor-pointer ${showSensors ? 'bg-[#267C78]/10 border-[#267C78]/30 text-[#267C78]' : 'bg-white border-[#D5D7D2] text-[#738087]'}`}>
            {showSensors ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button onClick={resetView} className="p-1.5 rounded-lg bg-white border border-[#D5D7D2] text-[#738087] hover:text-[#267C78] cursor-pointer">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div ref={mapRef} className="w-full h-[500px] md:h-[600px] rounded-xl border border-[#D5D7D2] overflow-hidden z-0" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg border border-[#D5D7D2] p-3 z-[500] shadow-sm">
          <div className="text-[10px] font-bold text-[#738087] uppercase mb-1.5">Risk Level</div>
          {['Critical','High','Medium','Low'].map(c => (
            <div key={c} className="flex items-center space-x-1.5 text-[11px] mb-0.5">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: RISK_COLORS[c] }} />
              <span className="text-[#263238]">{c}</span>
            </div>
          ))}
        </div>

        {/* Inspector Panel */}
        {iw && ic && (
          <div className="absolute top-0 right-0 w-72 h-full bg-white/95 backdrop-blur-sm border-l border-[#D5D7D2] z-[500] overflow-y-auto p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#172B36]">{iw.name}</h3>
              <button onClick={() => setInspector(null)} className="text-[#738087] hover:text-[#172B36] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-[#738087]">Code</span><span className="font-mono text-[#172B36]">{iw.code}</span></div>
              <div className="flex justify-between"><span className="text-[#738087]">Sub-Region</span><span className="text-[#172B36]">{iw.sub_region}</span></div>
              <div className="flex justify-between"><span className="text-[#738087]">Elevation</span><span className="text-[#172B36]">{iw.elevation_m}m</span></div>
              <div className="flex justify-between items-center">
                <span className="text-[#738087]">Risk Score</span>
                <span className="text-lg font-extrabold" style={{ color: RISK_COLORS[ic.category] }}>{ic.total}</span>
              </div>
              <div className="flex justify-between"><span className="text-[#738087]">Category</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ color: RISK_COLORS[ic.category], backgroundColor: RISK_COLORS[ic.category] + '15' }}>{ic.category}</span>
              </div>
              <div className="border-t border-[#D5D7D2] pt-2 space-y-2">
                {[{l:'Rainfall',v:iw.rainfall_risk,c:'#267C78'},{l:'Drainage',v:iw.drainage_risk,c:'#D69A42'},{l:'Terrain',v:iw.terrain_risk,c:'#738087'}].map(f=>(
                  <div key={f.l}>
                    <div className="flex justify-between mb-0.5"><span className="text-[#738087]">{f.l}</span><span className="font-bold text-[#172B36]">{f.v}/100</span></div>
                    <div className="h-1.5 bg-[#F3F1E9] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${f.v}%`,backgroundColor:f.c}}/></div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#D5D7D2] pt-2">
                <div className="text-[10px] text-[#738087] uppercase font-semibold mb-1">Recommended</div>
                <p className="text-[#263238] leading-snug">{getRecommendedAction(iw.rainfall_risk, iw.drainage_risk, iw.terrain_risk)}</p>
              </div>
              <div className="border-t border-[#D5D7D2] pt-2 space-y-1.5">
                <button onClick={() => { onSelectWard(iw); setActiveTab('decision-lab'); }} className="w-full py-1.5 rounded-lg bg-[#267C78] text-white text-[11px] font-bold cursor-pointer flex items-center justify-center space-x-1">
                  <FlaskConical className="w-3 h-3" /><span>Decision Lab</span>
                </button>
                <button onClick={() => { onSelectWard(iw); setActiveTab('explain'); }} className="w-full py-1.5 rounded-lg bg-white border border-[#D5D7D2] text-[#738087] text-[11px] font-semibold cursor-pointer flex items-center justify-center space-x-1">
                  <HelpCircle className="w-3 h-3" /><span>Explain Risk</span>
                </button>
                <button onClick={() => { onSelectWard(iw); setActiveTab('compare'); }} className="w-full py-1.5 rounded-lg bg-white border border-[#D5D7D2] text-[#738087] text-[11px] font-semibold cursor-pointer flex items-center justify-center space-x-1">
                  <Scale className="w-3 h-3" /><span>Compare Zones</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-[10px] text-[#738087]">Zone boundaries are illustrative demonstration areas, not official municipal boundaries. Basemap: OpenStreetMap / CARTO.</div>
    </div>
  );
}
