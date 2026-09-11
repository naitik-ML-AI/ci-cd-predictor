import React from 'react';
import {
  Activity,
  Percent,
  AlertTriangle,
  Target,
  ExternalLink,
  Play,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { PipelineRunTrend, PredictionResponse } from '../types';
import { RiskBadge } from './RiskBadge';

interface OverviewViewProps {
  predictions: PredictionResponse[];
  trendData: PipelineRunTrend[];
  onSelectPrediction: (prediction: PredictionResponse) => void;
  onOpenSimulator: () => void;
  onNavigateToPredictions: () => void;
  onNavigateToAlerts: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  predictions,
  trendData,
  onSelectPrediction,
  onOpenSimulator,
  onNavigateToPredictions,
  onNavigateToAlerts,
}) => {
  // Compute summary stats dynamically
  const totalPredictionsCount = 1284; // Benchmark total runs
  const highRiskCount = predictions.filter((p) => p.risk_level === 'HIGH').length;
  const avgProb =
    predictions.length > 0
      ? (
          (predictions.reduce((acc, p) => acc + p.failure_probability, 0) /
            predictions.length) *
          100
        ).toFixed(1)
      : '18.4';

  const recentPredictions = predictions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Quick Launch Banner for Simulator */}
      <div
        id="overview-hero-card"
        className="rounded-xl border border-indigo-900/40 bg-radial-[at_top_left] from-indigo-950/40 via-zinc-900/60 to-zinc-950 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-900/50 border border-indigo-500/30 text-[11px] font-mono text-indigo-300">
            <Zap size={12} className="text-indigo-400" />
            ML Pre-Flight Analysis Active
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
            Predict CI/CD Pipeline Failures Before Merge
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Real-time gradient-boosted risk classifier evaluating diff churn, dependency mutations,
            and test coverage variance to protect production deployments.
          </p>
        </div>

        <button
          id="btn-overview-run-sim"
          onClick={onOpenSimulator}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-950/50 transition-colors shrink-0"
        >
          <Play size={14} className="fill-white" />
          Predict Pipeline Risk
        </button>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card A: Total Predictions */}
        <div
          id="metric-card-total-predictions"
          className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Predictions</span>
            <div className="p-2 rounded-lg bg-zinc-800/80 text-indigo-400 border border-zinc-700/50">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tracking-tight">
            {totalPredictionsCount.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <TrendingUp size={13} />
            <span>+12.4% this week</span>
            <span className="text-zinc-500 ml-auto">Across 7 repos</span>
          </div>
        </div>

        {/* Card B: Average Failure Probability */}
        <div
          id="metric-card-avg-probability"
          className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Avg Failure Probability</span>
            <div className="p-2 rounded-lg bg-zinc-800/80 text-amber-400 border border-zinc-700/50">
              <Percent size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tracking-tight">
            {avgProb}%
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <ShieldCheck size={13} />
            <span>-2.1% improvement</span>
            <span className="text-zinc-500 ml-auto">Target &lt;20%</span>
          </div>
        </div>

        {/* Card C: High Risk Predictions */}
        <div
          id="metric-card-high-risk"
          onClick={onNavigateToAlerts}
          className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 relative overflow-hidden cursor-pointer hover:border-rose-700/60 transition-colors group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-300">
              High Risk Predictions
            </span>
            <div className="p-2 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-800/40 group-hover:scale-105 transition-transform">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-300 font-mono tracking-tight">
            37
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 font-mono">
            <span>{highRiskCount} active gate blocks</span>
            <span className="text-zinc-500 ml-auto group-hover:text-rose-400 transition-colors">
              View alerts &rarr;
            </span>
          </div>
        </div>

        {/* Card D: Model Accuracy */}
        <div
          id="metric-card-model-accuracy"
          className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Model Accuracy</span>
            <div className="p-2 rounded-lg bg-zinc-800/80 text-emerald-400 border border-zinc-700/50">
              <Target size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tracking-tight">
            94.2%
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <span className="text-indigo-400">ROC-AUC 0.963</span>
            <span className="text-zinc-500 ml-auto">xgb-2026.09-v1</span>
          </div>
        </div>
      </div>

      {/* FAILURE RISK TREND CHART */}
      <div
        id="overview-risk-trend-card"
        className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              Failure Risk Trend
              <span className="text-xs font-normal text-zinc-400 font-mono">
                (Recent Pipeline Runs #1030 – #1048)
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Model failure probability evaluated at Git push gate before build initialization
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/80" />
              Low (&le;35%)
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/80" />
              Medium (36-70%)
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500/80" />
              High (&gt;70%)
            </div>
          </div>
        </div>

        {/* Responsive Recharts Line Graph */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tick={{ fill: '#71717a', fontSize: 11 }}
                stroke="#3f3f46"
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#71717a', fontSize: 11 }}
                stroke="#3f3f46"
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as PipelineRunTrend;
                    return (
                      <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 shadow-xl text-xs font-mono space-y-1.5 min-w-[200px]">
                        <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-zinc-800">
                          <span>Run #{data.run_number}</span>
                          <span className="text-zinc-500">{data.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-zinc-300">Failure Prob:</span>
                          <span className="font-bold text-zinc-100">
                            {data.probability.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-300">Risk Level:</span>
                          <RiskBadge level={data.risk_level} size="sm" />
                        </div>
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Commit:</span>
                          <span className="text-indigo-400">{data.commit_sha}</span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Realized Run:</span>
                          <span
                            className={
                              data.outcome === 'success'
                                ? 'text-emerald-400'
                                : 'text-rose-400 font-semibold'
                            }
                          >
                            {data.outcome.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Threshold Zones */}
              <ReferenceLine
                y={70}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: 'High Risk Gate (70%)',
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <ReferenceLine
                y={35}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: 'Warning Threshold (35%)',
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Line
                type="monotone"
                dataKey="probability"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#6366f1', stroke: '#18181b', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#818cf8', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT PREDICTIONS TABLE */}
      <div
        id="overview-recent-predictions-card"
        className="rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-hidden"
      >
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">
              Recent Pipeline Predictions
            </h3>
            <p className="text-xs text-zinc-400">
              Latest pre-merge evaluation logs and risk classifications
            </p>
          </div>

          <button
            id="btn-view-all-predictions"
            onClick={onNavigateToPredictions}
            className="inline-flex items-center gap-1 text-xs font-mono text-indigo-400 hover:text-indigo-300 font-medium"
          >
            View all 1,284 predictions
            <ExternalLink size={12} />
          </button>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto">
          <table id="recent-predictions-table" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 font-mono">
                <th className="py-3 px-4 font-semibold">Repository</th>
                <th className="py-3 px-4 font-semibold">Branch</th>
                <th className="py-3 px-4 font-semibold">Commit</th>
                <th className="py-3 px-4 font-semibold">Probability</th>
                <th className="py-3 px-4 font-semibold">Risk</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Model</th>
                <th className="py-3 px-4 font-semibold hidden lg:table-cell">Time</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {recentPredictions.map((pred) => {
                const probPct = (pred.failure_probability * 100).toFixed(1);
                return (
                  <tr
                    key={pred.id}
                    id={`row-pred-${pred.id}`}
                    onClick={() => onSelectPrediction(pred)}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-medium text-zinc-200">
                      {pred.repo_name || 'acme-corp/service'}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {pred.branch || 'main'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-indigo-400 font-semibold">{pred.commit_sha}</span>
                        <span className="text-[11px] text-zinc-400 truncate max-w-[200px] font-sans">
                          {pred.commit_message || 'Pipeline commit'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            pred.risk_level === 'HIGH'
                              ? 'text-rose-400'
                              : pred.risk_level === 'MEDIUM'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {probPct}%
                        </span>
                        <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden hidden sm:block">
                          <div
                            className={`h-full ${
                              pred.risk_level === 'HIGH'
                                ? 'bg-rose-500'
                                : pred.risk_level === 'MEDIUM'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Number(probPct))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={pred.risk_level} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 text-[11px] hidden md:table-cell">
                      {pred.model_version}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 text-[11px] hidden lg:table-cell">
                      {new Date(pred.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        id={`btn-inspect-${pred.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPrediction(pred);
                        }}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-sans transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
