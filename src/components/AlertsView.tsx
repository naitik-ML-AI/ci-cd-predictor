import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  GitBranch,
  Clock,
  Eye,
  Check,
  Search,
  Bell,
  Send,
  GitPullRequest,
  AlertTriangle,
  FolderGit2,
  Users,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { FailureAlert, PredictionResponse } from '../types';
import { InformTeamModal } from './InformTeamModal';

interface AlertsViewProps {
  alerts: FailureAlert[];
  predictions: PredictionResponse[];
  onSelectPrediction: (prediction: PredictionResponse) => void;
  onUpdateAlertStatus: (
    alertId: string,
    status: 'active' | 'acknowledged' | 'resolved' | 'overridden'
  ) => void;
  onNotifyTeam?: (
    alertIds: string[],
    details: { channel: string; note: string; urgency: string }
  ) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  predictions,
  onSelectPrediction,
  onUpdateAlertStatus,
  onNotifyTeam,
}) => {
  const [filterTab, setFilterTab] = useState<'active' | 'all' | 'acknowledged'>('active');
  const [selectedRepo, setSelectedRepo] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inform Team Modal State
  const [isInformModalOpen, setIsInformModalOpen] = useState(false);
  const [targetAlertForModal, setTargetAlertForModal] = useState<FailureAlert | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Distinct repositories list
  const repositories = useMemo(() => {
    const repos = new Set<string>();
    alerts.forEach((a) => repos.add(a.repo_name));
    return Array.from(repos);
  }, [alerts]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      // Status filter
      if (filterTab === 'active' && a.status !== 'active') return false;
      if (filterTab === 'acknowledged' && a.status !== 'acknowledged' && a.status !== 'overridden') return false;
      
      // Repo filter
      if (selectedRepo !== 'ALL' && a.repo_name !== selectedRepo) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          a.repo_name.toLowerCase().includes(q) ||
          a.branch.toLowerCase().includes(q) ||
          a.commit_sha.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q) ||
          (a.commit_message && a.commit_message.toLowerCase().includes(q)) ||
          (a.pull_request && a.pull_request.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [alerts, filterTab, selectedRepo, searchQuery]);

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const activeCount = activeAlerts.length;

  const handleInspect = (predictionId: string) => {
    const found = predictions.find((p) => p.id === predictionId);
    if (found) {
      onSelectPrediction(found);
    }
  };

  // Open modal for single alert
  const handleOpenInformSingle = (alert: FailureAlert) => {
    setTargetAlertForModal(alert);
    setIsInformModalOpen(true);
  };

  // Open modal for broadcast to all active
  const handleOpenInformAll = () => {
    setTargetAlertForModal(null);
    setIsInformModalOpen(true);
  };

  const handleConfirmNotify = (
    alertIds: string[],
    details: { channel: string; note: string; urgency: string }
  ) => {
    if (onNotifyTeam) {
      onNotifyTeam(alertIds, details);
    }
    const count = alertIds.length;
    showToast(
      count === 1
        ? `Alert successfully dispatched to ${details.channel} for lead review`
        : `Broadcast alert dispatched to ${details.channel} across ${count} blocked repositories`
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="alerts-toast-banner"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-3"
        >
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900">Failure Alerts</h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
              {activeCount} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            High-risk builds and regression gates flagged for engineering review
          </p>
        </div>

        {/* Global Action: Inform All Teams */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="btn-inform-all-teams"
            onClick={handleOpenInformAll}
            disabled={activeCount === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Broadcast active alerts to all engineering on-call channels"
          >
            <Send size={13} className="text-emerald-400" />
            <span>Inform All Teams ({activeCount})</span>
          </button>
        </div>
      </div>

      {/* Per-Repository Status Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FolderGit2 size={13} className="text-indigo-600" />
            Repository Breakdown
          </span>
          <span className="text-slate-400 font-normal">
            Click a repository to filter alerts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* All Repos Card */}
          <button
            type="button"
            onClick={() => setSelectedRepo('ALL')}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              selectedRepo === 'ALL'
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200/80 text-slate-800 hover:bg-white hover:border-slate-300'
            }`}
          >
            <div className="text-xs font-bold truncate">All Repositories</div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className={selectedRepo === 'ALL' ? 'text-slate-300' : 'text-slate-500'}>
                {alerts.length} Total Alerts
              </span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedRepo === 'ALL'
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {activeCount} blocked
              </span>
            </div>
          </button>

          {/* Individual Repos Cards */}
          {repositories.map((repo) => {
            const repoAlerts = alerts.filter((a) => a.repo_name === repo);
            const repoActive = repoAlerts.filter((a) => a.status === 'active').length;
            const maxRisk = Math.max(...repoAlerts.map((a) => a.failure_probability));
            const shortName = repo.replace('acme-corp/', '');
            const isSelected = selectedRepo === repo;

            return (
              <button
                key={repo}
                type="button"
                id={`repo-filter-${shortName}`}
                onClick={() => setSelectedRepo(repo)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200/80 text-slate-800 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold truncate">{shortName}</div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className={isSelected ? 'text-indigo-200' : 'text-slate-500'}>
                    {(maxRisk * 100).toFixed(0)}% peak risk
                  </span>
                  {repoActive > 0 ? (
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded-full text-[10px] ${
                        isSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {repoActive} active
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] font-semibold ${
                        isSelected ? 'text-emerald-200' : 'text-emerald-600'
                      }`}
                    >
                      Reviewed
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            id="tab-alerts-active"
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              filterTab === 'active'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            id="tab-alerts-ack"
            onClick={() => setFilterTab('acknowledged')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              filterTab === 'acknowledged'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reviewed ({alerts.length - activeCount})
          </button>
          <button
            id="tab-alerts-all"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              filterTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({alerts.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            id="search-alerts"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repo, branch, PR, or author..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Detailed Alerts Cards List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const probPct = (alert.failure_probability * 100).toFixed(1);
            const isHigh = alert.risk_level === 'HIGH';

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                className={`rounded-xl border p-5 sm:p-6 transition-all shadow-xs ${
                  alert.status === 'active'
                    ? 'bg-white border-rose-200 ring-1 ring-rose-100'
                    : 'bg-white border-slate-200/90 opacity-90'
                }`}
              >
                {/* 1. Header: Repo, PR, Commit, Author, Status */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Repository Name with Icon */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold text-slate-900 font-mono">
                      <FolderGit2 size={13} className="text-indigo-600" />
                      <span>{alert.repo_name}</span>
                    </div>

                    {/* Pull Request Badge */}
                    {alert.pull_request && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                        <GitPullRequest size={11} />
                        {alert.pull_request}
                      </span>
                    )}

                    {/* Branch */}
                    <div className="inline-flex items-center gap-1 text-xs font-mono text-slate-600">
                      <GitBranch size={12} className="text-slate-400" />
                      <span>{alert.branch}</span>
                    </div>

                    <span className="text-slate-300 hidden sm:inline">&bull;</span>

                    {/* Commit SHA */}
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded">
                      {alert.commit_sha}
                    </span>

                    <span className="text-slate-300 hidden sm:inline">&bull;</span>

                    {/* Author Tag */}
                    <div className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                        {alert.author_avatar || alert.author.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-medium">@{alert.author}</span>
                    </div>

                    <span className="text-slate-300 hidden sm:inline">&bull;</span>

                    {/* Detected Time */}
                    <div className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={11} />
                      <span>{new Date(alert.detected_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Status Indicator Badge */}
                  <div className="flex items-center gap-2">
                    {alert.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        GATE BLOCKED
                      </span>
                    ) : alert.status === 'acknowledged' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Check size={12} />
                        ACKNOWLEDGED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        OVERRIDDEN
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Middle Body: Risk Probability, Stage, Commit Message, Root Causes, Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-4">
                  {/* Left Column: Details & Explanations (8 cols) */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Commit Message & Pipeline Stage */}
                    <div>
                      {alert.commit_message && (
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm font-mono leading-snug">
                          {alert.commit_message}
                        </div>
                      )}
                      {alert.pipeline_stage && (
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                          <span className="font-medium text-slate-700">Blocked Stage:</span>
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {alert.pipeline_stage}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Primary Reason */}
                    <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                      <span className="font-bold text-slate-800">Trigger:</span> {alert.reason}
                    </div>

                    {/* Root Causes Bullets */}
                    {alert.root_causes && alert.root_causes.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <AlertTriangle size={12} className="text-rose-500" />
                          Key Risk Drivers
                        </div>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {alert.root_causes.map((rc, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                              <span>{rc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Downstream Impacted Services */}
                    {alert.impacted_services && alert.impacted_services.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                          Downstream Impact:
                        </span>
                        {alert.impacted_services.map((svc) => (
                          <span
                            key={svc}
                            className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Probability Gauge & Metrics (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
                    {/* Failure Risk Meter */}
                    <div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Failure Probability
                        </span>
                        <span className="text-2xl font-extrabold text-rose-600 tabular-nums">
                          {probPct}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, alert.failure_probability * 100))}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 text-right">
                        Threshold: &gt;65% blocks deploy
                      </div>
                    </div>

                    {/* Code Churn & Metrics Grid */}
                    {alert.metrics && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Files</div>
                          <div className="font-bold text-slate-900 font-mono mt-0.5">
                            {alert.metrics.files_changed}
                          </div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Churn</div>
                          <div className="font-bold font-mono mt-0.5 text-[11px]">
                            <span className="text-emerald-600">+{alert.metrics.lines_added}</span>{' '}
                            <span className="text-rose-500">-{alert.metrics.lines_deleted}</span>
                          </div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Coverage</div>
                          <div className="font-bold text-slate-900 font-mono mt-0.5">
                            {alert.metrics.test_coverage}%
                          </div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Tests</div>
                          <div className="font-bold text-slate-900 font-mono mt-0.5">
                            {alert.metrics.test_count}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Team Notified Status Pill */}
                    <div>
                      {alert.team_notified ? (
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold">Team notified:</span>{' '}
                            <span className="font-mono">{alert.team_notified.channel}</span>{' '}
                            <span className="text-emerald-600/80">({alert.team_notified.timestamp})</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
                          <Bell size={13} className="text-amber-600 shrink-0" />
                          <span>Team not yet alerted</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Action Recommendation Callout */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700">
                  <ShieldAlert size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Recommended Action: </span>
                    <span>{alert.recommended_action}</span>
                  </div>
                </div>

                {/* 4. Action Buttons Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500 font-mono">
                    ID: {alert.id} &bull; Service: {alert.service}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* BUTTON TO INFORM TEAM */}
                    <button
                      type="button"
                      id={`btn-inform-team-${alert.id}`}
                      onClick={() => handleOpenInformSingle(alert)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Send size={13} />
                      <span>Inform Team</span>
                    </button>

                    {/* View Prediction Details */}
                    <button
                      type="button"
                      id={`btn-inspect-alert-${alert.id}`}
                      onClick={() => handleInspect(alert.prediction_id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Inspect Build</span>
                    </button>

                    {/* Workflow status triggers */}
                    {alert.status === 'active' ? (
                      <>
                        <button
                          type="button"
                          id={`btn-ack-alert-${alert.id}`}
                          onClick={() => onUpdateAlertStatus(alert.id, 'acknowledged')}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                        <button
                          type="button"
                          id={`btn-override-alert-${alert.id}`}
                          onClick={() => onUpdateAlertStatus(alert.id, 'overridden')}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Override Gate
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        id={`btn-reactivate-alert-${alert.id}`}
                        onClick={() => onUpdateAlertStatus(alert.id, 'active')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reopen Gate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-xl bg-white border border-slate-200 text-slate-500 space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
            <div className="text-sm font-bold text-slate-800">No Alerts Found</div>
            <p className="text-xs text-slate-500">
              No alerts matching your current repository or status filters.
            </p>
          </div>
        )}
      </div>

      {/* Inform Team Modal */}
      <InformTeamModal
        isOpen={isInformModalOpen}
        onClose={() => {
          setIsInformModalOpen(false);
          setTargetAlertForModal(null);
        }}
        targetAlert={targetAlertForModal}
        allActiveAlerts={activeAlerts}
        onConfirmNotify={handleConfirmNotify}
      />
    </div>
  );
};
