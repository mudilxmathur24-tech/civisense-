import React from 'react';
import { AlertTriangle, ChevronRight, Shield } from 'lucide-react';

export default function AlertBanner({ alerts = [], setActiveTab, onOpenDataQuality }) {
  return (
    <div className="bg-[#F7F6F2] border-b border-[#D5D7D2] px-4 sm:px-6 py-2 flex items-center justify-between text-xs">
      <div className="flex items-center space-x-2 text-[#738087]">
        <Shield className="w-3.5 h-3.5 text-[#267C78]" />
        <span className="font-medium">
          All risk values use illustrative demonstration data.
        </span>
        <button
          onClick={onOpenDataQuality}
          className="text-[#267C78] font-semibold hover:underline cursor-pointer flex items-center space-x-0.5"
        >
          <span>View Data Provenance</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      {alerts.length > 0 && (
        <button
          onClick={() => setActiveTab('priority')}
          className="hidden md:flex items-center space-x-1.5 text-[#B94B48] font-semibold cursor-pointer hover:underline"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{alerts.length} zone{alerts.length > 1 ? 's' : ''} require attention</span>
        </button>
      )}
    </div>
  );
}
