import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  History,
  AlertOctagon,
  Settings2,
  BarChart3,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Server,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  apiStatus: {
    isOnline: boolean;
    isConfigured: boolean;
    isChecking: boolean;
    latencyMs?: number;
  };
  modelVersion: string;
  activeAlertCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenApiConfig: () => void;
  onRefreshHealth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  apiStatus,
  modelVersion,
  activeAlertCount,
  isOpenMobile,
  setIsOpenMobile,
  onOpenApiConfig,
  onRefreshHealth,
}) => {
  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'simulator' as ActiveTab, label: 'Simulator', icon: Cpu, badge: 'Live' },
    { id: 'predictions' as ActiveTab, label: 'Predictions', icon: History },
    {
      id: 'alerts' as ActiveTab,
      label: 'Failure Alerts',
      icon: AlertOctagon,
      countBadge: activeAlertCount,
    },
    { id: 'repository' as ActiveTab, label: 'Repository', icon: Settings2 },
    { id: 'performance' as ActiveTab, label: 'Model Performance', icon: BarChart3 },
    { id: 'workflow' as ActiveTab, label: 'Workflow Docs', icon: FileCode2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Cpu size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
                CI/CD Predictor
                <span className="text-[10px] px-1.5 py-0.2 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 font-mono">
                  ML
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">Pre-Deploy Risk Gate</p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase font-mono">
            Pipeline Analytics
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={isActive ? 'text-indigo-400' : 'text-zinc-400'}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                    {item.badge}
                  </span>
                )}

                {item.countBadge !== undefined && item.countBadge > 0 && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40">
                    {item.countBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: API Status, Model Version, Environment */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 space-y-2">
          {/* API Health Pill */}
          <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-zinc-400 font-mono text-[11px] flex items-center gap-1.5">
                <Server size={12} className="text-zinc-400" />
                API Health
              </span>
              <div className="flex items-center gap-1">
                <button
                  id="btn-refresh-health"
                  onClick={onRefreshHealth}
                  title="Ping API Health"
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <RefreshCw
                    size={11}
                    className={apiStatus.isChecking ? 'animate-spin text-indigo-400' : ''}
                  />
                </button>
                <button
                  id="btn-config-api"
                  onClick={onOpenApiConfig}
                  title="Configure API URL"
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <Sliders size={11} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      apiStatus.isOnline
                        ? 'bg-emerald-400'
                        : apiStatus.isConfigured
                        ? 'bg-rose-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      apiStatus.isOnline
                        ? 'bg-emerald-500'
                        : apiStatus.isConfigured
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </span>
                <span className="font-medium text-zinc-200 text-[11px]">
                  {apiStatus.isChecking
                    ? 'Checking...'
                    : apiStatus.isOnline
                    ? 'Online'
                    : apiStatus.isConfigured
                    ? 'Offline'
                    : 'Local Demo Mode'}
                </span>
              </div>

              {apiStatus.isOnline && apiStatus.latencyMs !== undefined ? (
                <span className="text-[10px] font-mono text-emerald-400">
                  {apiStatus.latencyMs}ms
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-400">
                  {apiStatus.isConfigured ? 'Unreachable' : 'Built-in ML'}
                </span>
              )}
            </div>
          </div>

          {/* Model & Environment metadata */}
          <div className="px-2 py-1.5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span title="Active ML Checkpoint">Model:</span>
            <span className="text-zinc-300 font-semibold">{modelVersion}</span>
          </div>

          <div className="px-2 pb-1 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Environment:</span>
            <span className="inline-flex items-center gap-1 text-zinc-400">
              {apiStatus.isConfigured ? (
                <span className="text-indigo-400 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Vercel Prod
                </span>
              ) : (
                <span className="text-amber-400/90 flex items-center gap-1">
                  <AlertCircle size={11} /> Standalone
                </span>
              )}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
