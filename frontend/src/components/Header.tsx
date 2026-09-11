import React from 'react';
import {
  Menu,
  GitBranch,
  GitFork,
  Radio,
  Sliders,
  Play,
  Bell,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { REPOSITORY_OPTIONS } from '../data/mockData';

interface HeaderProps {
  title: string;
  subtitle?: string;
  selectedRepo: string;
  setSelectedRepo: (repo: string) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  apiStatus: {
    isOnline: boolean;
    isConfigured: boolean;
    isChecking: boolean;
    latencyMs?: number;
  };
  onOpenSimulator: () => void;
  onOpenApiConfig: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  selectedRepo,
  setSelectedRepo,
  selectedBranch,
  setSelectedBranch,
  apiStatus,
  onOpenSimulator,
  onOpenApiConfig,
  onToggleMobileMenu,
}) => {
  const branches = ['main', 'release/v2.4', 'feat/passkey-mfa', 'hotfix/invoice-tax', 'fix/kafka-consumer'];

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 h-16 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between gap-4"
    >
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="btn-sidebar-mobile-toggle"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-100 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-zinc-400 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center/Right: Repo & Branch selectors, API status pill, Simulator trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Repo selector */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <GitFork size={13} className="text-zinc-400 shrink-0" />
          <select
            id="header-repo-selector"
            aria-label="Select Repository"
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="bg-transparent text-zinc-200 font-mono text-xs focus:outline-hidden cursor-pointer"
          >
            {REPOSITORY_OPTIONS.map((repo) => (
              <option key={repo} value={repo} className="bg-zinc-900 text-zinc-200">
                {repo}
              </option>
            ))}
          </select>
        </div>

        {/* Branch selector */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <GitBranch size={13} className="text-zinc-400 shrink-0" />
          <select
            id="header-branch-selector"
            aria-label="Select Branch"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-transparent text-zinc-200 font-mono text-xs focus:outline-hidden cursor-pointer"
          >
            {branches.map((b) => (
              <option key={b} value={b} className="bg-zinc-900 text-zinc-200">
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* API Status Badge Pill (clickable for config) */}
        <button
          id="btn-header-api-status"
          onClick={onOpenApiConfig}
          title="Click to configure backend API URL"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
            apiStatus.isOnline
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
              : apiStatus.isConfigured
              ? 'bg-rose-950/40 text-rose-300 border-rose-500/30 hover:bg-rose-900/40'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          {apiStatus.isChecking ? (
            <Radio size={12} className="animate-spin text-zinc-400" />
          ) : apiStatus.isOnline ? (
            <CheckCircle2 size={12} className="text-emerald-400" />
          ) : apiStatus.isConfigured ? (
            <XCircle size={12} className="text-rose-400" />
          ) : (
            <AlertCircle size={12} className="text-amber-400" />
          )}

          <span className="hidden sm:inline">
            {apiStatus.isOnline
              ? `API Online (${apiStatus.latencyMs ?? 24}ms)`
              : apiStatus.isConfigured
              ? 'API Offline'
              : 'Demo ML Mode'}
          </span>
          <span className="sm:hidden">
            {apiStatus.isOnline ? 'Online' : apiStatus.isConfigured ? 'Offline' : 'Demo'}
          </span>
          <Sliders size={11} className="text-zinc-400 ml-0.5" />
        </button>

        {/* Quick Simulator Action Button */}
        <button
          id="btn-header-simulate"
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-950 transition-colors"
        >
          <Play size={12} className="fill-white" />
          <span className="hidden sm:inline">Simulate Run</span>
          <span className="sm:hidden">Run</span>
        </button>

        {/* Notification indicator */}
        <div className="relative">
          <button
            id="btn-header-notifications"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800/80 transition-colors"
            title="System alerts"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-zinc-950" />
          </button>
        </div>

        {/* User profile avatar */}
        <div
          id="header-user-profile"
          className="flex items-center gap-2 pl-2 border-l border-zinc-800"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold font-mono text-zinc-300">
            DE
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-medium text-zinc-200">DevOps Admin</div>
            <div className="text-[10px] font-mono text-zinc-400">CI/CD Risk Gate</div>
          </div>
        </div>
      </div>
    </header>
  );
};
