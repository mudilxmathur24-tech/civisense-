import React from 'react';
import {
  Home,
  LayoutDashboard,
  MapPin,
  Search as SearchIcon,
  FlaskConical,
  HelpCircle,
  ListOrdered,
  ShieldCheck,
  Database,
  Clock,
  Scale,
  BarChart3,
  Info,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  criticalCount,
  totalZones = 16,
  onOpenPresentation,
  onOpenDataQuality
}) {
  const menuItems = [
    { id: 'home', label: 'Overview', icon: Home, section: 'NAVIGATE' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'NAVIGATE' },
    { id: 'gis', label: 'GIS Risk Map', icon: MapPin, badge: `${totalZones}`, section: 'NAVIGATE' },
    { id: 'prediction', label: 'Zone Intelligence', icon: SearchIcon, section: 'ANALYSE' },
    { id: 'decision-lab', label: 'Decision Lab', icon: FlaskConical, badge: 'FLAGSHIP', badgeColor: 'bg-[#267C78]/15 text-[#267C78] border-[#267C78]/30', section: 'ANALYSE' },
    { id: 'explain', label: 'Explainable Risk', icon: HelpCircle, section: 'ANALYSE' },
    { id: 'priority', label: 'Priority Centre', icon: ListOrdered, badge: criticalCount > 0 ? criticalCount : null, badgeColor: 'bg-[#B94B48]/15 text-[#B94B48] border-[#B94B48]/30', section: 'ACT' },
    { id: 'recommendation', label: 'Recommended Actions', icon: ShieldCheck, section: 'ACT' },
    { id: 'data-trust', label: 'Data Trust Centre', icon: Database, section: 'SUPPORT' },
    { id: 'scenario-history', label: 'Scenario History', icon: Clock, section: 'SUPPORT' },
    { id: 'compare', label: 'Zone Comparison', icon: Scale, section: 'SUPPORT' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, section: 'SUPPORT' },
    { id: 'about', label: 'About CiviSense', icon: Info, section: 'SUPPORT' },
  ];

  const sections = ['NAVIGATE', 'ANALYSE', 'ACT', 'SUPPORT'];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#172B36] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding Header */}
        <div>
          <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => { setActiveTab('home'); setIsOpen(false); }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#267C78] text-white">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-wider text-white">
                  CIVISENSE
                </span>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#83A69A] font-semibold leading-none mt-0.5">
                  Predict · Prioritize · Prevent
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pilot Badge */}
          <div className="px-4 py-2 border-b border-white/8 flex items-center justify-between text-[10px] tracking-wider font-semibold">
            <div className="flex items-center space-x-2 text-[#83A69A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#438A69] animate-gentle-pulse" />
              <span>GHARUAN–KHARAR PILOT</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-white/8 text-[#83A69A] text-[9px] font-bold">
              {totalZones} ZONES
            </span>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-240px)]">
            {sections.map((section) => {
              const items = menuItems.filter(i => i.section === section);
              return (
                <div key={section} className="mb-2">
                  <div className="px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] text-[#738087] uppercase">
                    {section}
                  </div>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer group ${
                          isActive
                            ? 'bg-white/12 text-white'
                            : 'text-[#83A69A] hover:text-white hover:bg-white/6'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#267C78]' : 'text-[#738087] group-hover:text-[#83A69A]'}`} style={isActive ? { color: '#267C78' } : {}} />
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {item.badge && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${item.badgeColor || 'bg-white/8 text-[#83A69A] border-white/10'}`}>
                              {item.badge}
                            </span>
                          )}
                          {isActive && <ChevronRight className="w-3 h-3 text-[#267C78]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-white/8 space-y-2">
          {onOpenPresentation && (
            <button
              onClick={() => { onOpenPresentation(); setIsOpen(false); }}
              className="w-full py-2.5 px-3 rounded-lg bg-[#267C78] hover:bg-[#1e6a66] text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Judge Demo Mode</span>
            </button>
          )}

          <div className="p-2.5 rounded-lg bg-white/5 text-[11px] space-y-1">
            <div className="flex items-center justify-between font-mono text-[#738087]">
              <span className="text-[9px] tracking-wider">PILOT STATUS</span>
              <span className="text-[#438A69] font-bold text-[9px]">● ACTIVE</span>
            </div>
            <div className="font-semibold text-white text-[11px] truncate">
              Chandigarh University Corridor
            </div>
            <div className="text-[10px] text-[#738087] flex items-center justify-between">
              <span>NH-05 · Punjab</span>
              {onOpenDataQuality && (
                <button
                  onClick={() => { onOpenDataQuality(); setIsOpen(false); }}
                  className="text-[#267C78] hover:text-[#83A69A] cursor-pointer font-semibold"
                >
                  Data Trust →
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
