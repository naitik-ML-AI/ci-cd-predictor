import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronRight,
  AlertTriangle,
  Shield,
  Clock,
  Layers,
  XCircle,
  CheckCircle2,
  CornerDownRight,
} from 'lucide-react';
import { PredictionResponse, RiskLevel } from '../types';

interface PredictionsViewProps {
  predictions: PredictionResponse[];
  onSelectPrediction: (prediction: PredictionResponse) => void;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({
  predictions,
  onSelectPrediction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');

  // Filtered predictions
  const filteredPredictions = useMemo(() => {
    return predictions.filter((p) => {
      // Risk filter
      if (riskFilter !== 'ALL' && p.risk_level !== riskFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchRepo = p.repo_name?.toLowerCase().includes(q);
        const matchBranch = p.branch?.toLowerCase().includes(q);
        const matchSha = p.commit_sha?.toLowerCase().includes(q);
        const matchMsg = p.commit_message?.toLowerCase().includes(q);
        const matchAuthor = p.author?.toLowerCase().includes(q);
        if (!matchRepo && !matchBranch && !matchSha && !matchMsg && !matchAuthor) {
          return false;
        }
      }
      return true;
    });
  }, [predictions, riskFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Builds Monitored */}
        <div
          id="kpi-builds-monitored"
          className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>BUILDS MONITORED</span>
            <Layers size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mb-1">
            14,280
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span>84.0% build success rate</span>
          </div>
        </div>

        {/* Card 2: High-Risk Builds */}
        <div
          id="kpi-high-risk-builds"
          className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>HIGH-RISK BUILDS</span>
            <AlertTriangle size={14} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mb-1">
            684
          </div>
          <div className="text-xs text-slate-500">
            13.9% of total builds
          </div>
        </div>

        {/* Card 3: Model Precision */}
        <div
          id="kpi-model-precision"
          className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>MODEL PRECISION</span>
            <Shield size={14} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mb-1">
            88.4%
          </div>
          <div className="text-xs text-slate-500 font-mono">
            ROC-AUC: 0.918
          </div>
        </div>

        {/* Card 4: CI Time Saved */}
        <div
          id="kpi-ci-time-saved"
          className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>CI TIME SAVED</span>
            <Clock size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mb-1">
            194.5h
          </div>
          <div className="text-xs text-slate-500">
            Baseline failure rate: 16.0%
          </div>
        </div>
      </div>

      {/* Recent Builds Table */}
      <div
        id="recent-builds-container"
        className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
      >
        {/* Table Controls Bar */}
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Builds
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Predicted failure risk vs actual pipeline result
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                id="search-recent-builds"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search repository or branch..."
                className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400 transition-all"
              />
            </div>

            {/* Filter Buttons: ALL, HIGH, MEDIUM, LOW */}
            <div className="flex items-center gap-1">
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => {
                const isActive = riskFilter === lvl;
                return (
                  <button
                    key={lvl}
                    id={`filter-risk-${lvl.toLowerCase()}`}
                    onClick={() => setRiskFilter(lvl)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* The Data Table */}
        <div className="overflow-x-auto">
          <table id="table-recent-builds" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">REPOSITORY</th>
                <th className="py-3 px-4">BRANCH</th>
                <th className="py-3 px-4">CHANGES</th>
                <th className="py-3 px-4">COVERAGE</th>
                <th className="py-3 px-4">RISK</th>
                <th className="py-3 px-4">FAILURE RISK</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 sm:px-6 text-right">DETAILS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPredictions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No builds found matching your filter
                  </td>
                </tr>
              ) : (
                filteredPredictions.map((pred) => {
                  const probPercent = Math.round(pred.failure_probability * 100);
                  const isHigh = pred.risk_level === 'HIGH';
                  const isMedium = pred.risk_level === 'MEDIUM';

                  const riskColor = isHigh
                    ? 'text-rose-600'
                    : isMedium
                    ? 'text-amber-600'
                    : 'text-emerald-600';

                  const riskDot = isHigh
                    ? 'bg-rose-500'
                    : isMedium
                    ? 'bg-amber-500'
                    : 'bg-emerald-500';

                  const barFill = isHigh
                    ? 'bg-rose-500'
                    : isMedium
                    ? 'bg-amber-500'
                    : 'bg-teal-500';

                  const statusPassed = pred.status === 'Passed';

                  return (
                    <tr
                      key={pred.id}
                      id={`build-row-${pred.id}`}
                      onClick={() => onSelectPrediction(pred)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* REPOSITORY & COMMIT */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                          {pred.repo_name || 'payment-service'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                          <CornerDownRight size={11} className="text-slate-400 shrink-0" />
                          <span className="text-slate-700 font-semibold">
                            {pred.commit_sha || 'a7c93e2'}
                          </span>
                          <span className="truncate max-w-[180px] sm:max-w-xs text-slate-500">
                            {pred.commit_message || 'refactor: update webhook listener'}
                          </span>
                        </div>
                      </td>

                      {/* BRANCH */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
                        <div className="truncate max-w-[160px]">
                          {pred.branch || 'main'}
                        </div>
                      </td>

                      {/* CHANGES */}
                      <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                        <span className="text-slate-700">
                          {pred.metrics?.files_changed || 1} files
                        </span>{' '}
                        <span className="text-emerald-600 font-semibold ml-1">
                          +{pred.metrics?.lines_added || 0}
                        </span>{' '}
                        <span className="text-rose-500 font-semibold">
                          -{pred.metrics?.lines_deleted || 0}
                        </span>
                      </td>

                      {/* COVERAGE */}
                      <td className="py-3.5 px-4 font-mono text-xs font-medium text-slate-700 whitespace-nowrap">
                        {pred.metrics?.test_coverage ? `${pred.metrics.test_coverage}%` : '85.0%'}
                      </td>

                      {/* RISK */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 font-bold ${riskColor}`}>
                          <span className={`w-2 h-2 rounded-full ${riskDot} shrink-0`}></span>
                          {pred.risk_level}
                        </span>
                      </td>

                      {/* FAILURE RISK (Progress bar + percentage) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-20 sm:w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full ${barFill}`}
                              style={{ width: `${Math.max(4, Math.min(100, probPercent))}%` }}
                            ></div>
                          </div>
                          <span className="font-mono font-bold text-xs text-slate-800 tabular-nums">
                            {probPercent}%
                          </span>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {statusPassed ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                            <CheckCircle2 size={13} className="shrink-0" />
                            <span>Passed</span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1 text-rose-600 font-semibold text-xs">
                              <XCircle size={13} className="shrink-0" />
                              <span>Failed</span>
                            </div>
                            {pred.alert_sent && (
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                Alert sent
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* DETAILS */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center justify-center p-1 rounded-md text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all">
                          <ChevronRight size={16} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{filteredPredictions.length}</span> builds
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Model: XGBoost
          </div>
        </div>
      </div>
    </div>
  );
};
