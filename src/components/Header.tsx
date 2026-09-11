import React from 'react';
import {
  Activity,
  SlidersHorizontal,
  Bell,
  BarChart3,
  Settings,
  BookOpen,
  Terminal,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  apiStatus: {
    isOnline: boolean;
    isConfigured: boolean;
    isChecking: boolean;
    latencyMs?: number;
  };
  activeAlertCount: number;
  onOpenSimulator: () => void;
  onOpenApiConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  apiStatus,
  activeAlertCount,
  onOpenApiConfig,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Terminal size={17} className="text-emerald-400" />
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              CI/CD Failure Predictor
            </h1>

            {/* Status indicator */}
            <span
              onClick={onOpenApiConfig}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-medium cursor-pointer hover:bg-emerald-100/60 transition-colors"
              title={apiStatus.isOnline ? `Online (${apiStatus.latencyMs || 24}ms)` : 'Click to configure API'}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Online
            </span>
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            id="tab-nav-predictions"
            onClick={() => setActiveTab('predictions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'predictions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity size={14} className={activeTab === 'predictions' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Predictions</span>
          </button>

          <button
            id="tab-nav-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal size={14} className={activeTab === 'simulator' ? 'text-indigo-600' : 'text-slate-400'} />
            <span>Simulator</span>
          </button>

          <button
            id="tab-nav-alerts"
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === 'alerts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell size={14} className={activeTab === 'alerts' ? 'text-rose-600' : 'text-slate-400'} />
            <span>Alerts</span>
            {activeAlertCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {activeAlertCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Secondary Navigation */}
        <div className="flex items-center gap-1 text-xs">
          <button
            id="header-nav-telemetry"
            onClick={() => setActiveTab('performance')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              activeTab === 'performance'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 size={14} />
            <span>Telemetry</span>
          </button>

          <button
            id="header-nav-settings"
            onClick={() => setActiveTab('repository')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              activeTab === 'repository'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings size={14} />
            <span>Settings</span>
          </button>

          <button
            id="header-nav-workflow-docs"
            onClick={() => setActiveTab('workflow')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              activeTab === 'workflow'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen size={14} />
            <span>Docs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
