import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AlertBanner from './components/AlertBanner';
import HomeView from './components/HomeView';
import DashboardView from './components/DashboardView';
import GISMapView from './components/GISMapView';
import CompareView from './components/CompareView';
import PredictionView from './components/PredictionView';
import DecisionLabView from './components/DecisionLabView';
import ExplainView from './components/ExplainView';
import PriorityView from './components/PriorityView';
import MitigationView from './components/MitigationView';
import ReportsView from './components/ReportsView';
import AboutView from './components/AboutView';
import DataTrustView from './components/DataTrustView';
import ScenarioHistoryView from './components/ScenarioHistoryView';
import WardModal from './components/WardModal';
import PresentationMode from './components/PresentationMode';
import DataQualityModal from './components/DataQualityModal';
import { fetchDashboardSummary, fetchWards, fetchSensors } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [wards, setWards] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [modalWard, setModalWard] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showDataQualityModal, setShowDataQualityModal] = useState(false);

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const [sumData, wardsData, sensorsData] = await Promise.all([
        fetchDashboardSummary(),
        fetchWards(),
        fetchSensors()
      ]);
      setSummary(sumData);
      setWards(wardsData.wards || []);
      setSensors(sensorsData.sensors || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 45000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = summary?.kpis?.critical_risk_zones || 0;

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView summary={summary} setActiveTab={setActiveTab} />;
      case 'dashboard':
        return <DashboardView summary={summary} wards={wards} onSelectWard={(w) => { setSelectedWard(w); setModalWard(w); }} setActiveTab={setActiveTab} />;
      case 'gis':
        return <GISMapView wards={wards} sensors={sensors} selectedWard={selectedWard} onSelectWard={setSelectedWard} setActiveTab={setActiveTab} />;
      case 'prediction':
        return <PredictionView wards={wards} selectedWard={selectedWard} onSelectWard={setSelectedWard} setActiveTab={setActiveTab} />;
      case 'decision-lab':
        return <DecisionLabView wards={wards} selectedWard={selectedWard} onSelectWard={setSelectedWard} setActiveTab={setActiveTab} />;
      case 'explain':
        return <ExplainView wards={wards} selectedWard={selectedWard} onSelectWard={setSelectedWard} setActiveTab={setActiveTab} />;
      case 'priority':
        return <PriorityView summary={summary} wards={wards} selectedWard={selectedWard} setActiveTab={setActiveTab} onSelectWard={setSelectedWard} />;
      case 'recommendation':
        return <MitigationView wards={wards} selectedWard={selectedWard} onSelectWard={setSelectedWard} onRefreshSummary={loadAllData} />;
      case 'data-trust':
        return <DataTrustView setActiveTab={setActiveTab} />;
      case 'scenario-history':
        return <ScenarioHistoryView wards={wards} setActiveTab={setActiveTab} />;
      case 'compare':
        return <CompareView wards={wards} selectedWard={selectedWard} onSelectWard={setSelectedWard} setActiveTab={setActiveTab} />;
      case 'reports':
        return <ReportsView summary={summary} wards={wards} />;
      case 'about':
        return <AboutView setActiveTab={setActiveTab} />;
      default:
        return <HomeView summary={summary} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F1E9] text-[#263238] flex font-sans antialiased">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        criticalCount={criticalCount}
        totalZones={wards.length || 16}
        onOpenPresentation={() => setShowPresentation(true)}
        onOpenDataQuality={() => setShowDataQualityModal(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onRefresh={loadAllData}
          isRefreshing={isRefreshing}
          criticalCount={criticalCount}
          onOpenPresentation={() => setShowPresentation(true)}
          onOpenDataQuality={() => setShowDataQualityModal(true)}
          wards={wards}
        />

        <AlertBanner
          alerts={summary?.recent_alerts || []}
          setActiveTab={setActiveTab}
          onOpenDataQuality={() => setShowDataQualityModal(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <div className="w-12 h-12 rounded-xl border-4 border-[#267C78]/20 border-t-[#267C78] animate-spin" />
              <div className="text-sm font-semibold text-[#172B36]">Loading CiviSense...</div>
              <p className="text-xs text-[#738087]">Gharuan–Kharar Pilot · 16 Demonstration Zones</p>
            </div>
          ) : renderView()}
        </main>

        {modalWard && (
          <WardModal
            ward={modalWard}
            onClose={() => setModalWard(null)}
            onLaunchMap={(w) => { setSelectedWard(w); setActiveTab('gis'); setModalWard(null); }}
            onLaunchCompare={(w) => { setSelectedWard(w); setActiveTab('compare'); setModalWard(null); }}
            onLaunchExplain={(w) => { setSelectedWard(w); setActiveTab('explain'); setModalWard(null); }}
            onLaunchSimulator={(w) => { setSelectedWard(w); setActiveTab('decision-lab'); setModalWard(null); }}
            onLaunchDispatch={(w) => { setSelectedWard(w); setActiveTab('recommendation'); setModalWard(null); }}
          />
        )}

        {showPresentation && (
          <PresentationMode
            wards={wards}
            summary={summary}
            onClose={() => setShowPresentation(false)}
            setActiveTab={setActiveTab}
          />
        )}

        <DataQualityModal
          isOpen={showDataQualityModal}
          onClose={() => setShowDataQualityModal(false)}
        />

        <footer className="mt-auto border-t border-[#D5D7D2] bg-white py-6 text-xs text-[#738087]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-[#267C78] tracking-wider">CIVISENSE</span>
              <span>·</span>
              <span>Predict. Prioritize. Prevent.</span>
              <span>·</span>
              <span className="text-[#738087]">Gharuan–Kharar Pilot</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <button onClick={() => setShowDataQualityModal(true)} className="text-[#267C78] hover:underline cursor-pointer font-semibold">Data Trust</button>
              <span>·</span>
              <span>Zinnovatio 4.0</span>
              <span>·</span>
              <span>React 19 · FastAPI · Leaflet</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
