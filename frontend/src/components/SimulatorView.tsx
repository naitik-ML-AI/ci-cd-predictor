import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sliders,
  Sparkles,
  Info,
  ShieldCheck,
  Radio,
  Layers,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';
import { PredictionRequest, PredictionResponse } from '../types';
import { predictFailureRisk } from '../services/api';
import { RiskBadge } from './RiskBadge';
import { SERVICE_OPTIONS, REPOSITORY_OPTIONS } from '../data/mockData';

interface SimulatorViewProps {
  onPredictionCompleted: (result: PredictionResponse) => void;
  onOpenDetailModal: (result: PredictionResponse) => void;
  apiStatus: {
    isOnline: boolean;
    isConfigured: boolean;
  };
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  onPredictionCompleted,
  onOpenDetailModal,
  apiStatus,
}) => {
  const [formData, setFormData] = useState<PredictionRequest>({
    repo_name: 'acme-corp/payment-service',
    branch: 'feat/webhook-retry',
    files_changed: 6,
    lines_added: 240,
    lines_deleted: 45,
    test_coverage: 84.5,
    test_count: 110,
    dependency_changed: false,
    service: 'payment-service',
    historical_failure_rate: 12.0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isFallbackResult, setIsFallbackResult] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Preset quick configurations
  const applyPreset = (type: 'high_risk' | 'standard' | 'clean_patch') => {
    setErrorNotice(null);
    if (type === 'high_risk') {
      setFormData({
        repo_name: 'acme-corp/payment-service',
        branch: 'feat/large-refactor',
        files_changed: 34,
        lines_added: 1280,
        lines_deleted: 390,
        test_coverage: 42.0,
        test_count: 35,
        dependency_changed: true,
        service: 'payment-service',
        historical_failure_rate: 28.5,
      });
    } else if (type === 'standard') {
      setFormData({
        repo_name: 'acme-corp/core-auth',
        branch: 'feat/user-settings-v2',
        files_changed: 8,
        lines_added: 310,
        lines_deleted: 55,
        test_coverage: 76.5,
        test_count: 88,
        dependency_changed: false,
        service: 'core-auth',
        historical_failure_rate: 14.0,
      });
    } else {
      setFormData({
        repo_name: 'acme-corp/billing-engine',
        branch: 'hotfix/tax-precision',
        files_changed: 1,
        lines_added: 10,
        lines_deleted: 2,
        test_coverage: 94.0,
        test_count: 120,
        dependency_changed: false,
        service: 'billing-engine',
        historical_failure_rate: 6.0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorNotice(null);

    // Realistic pipeline animation steps
    setLoadingStep('Extracting Git diff AST & churn metrics...');
    await new Promise((r) => setTimeout(r, 220));

    setLoadingStep('Querying XGBoost failure tree ensemble...');
    await new Promise((r) => setTimeout(r, 280));

    setLoadingStep('Synthesizing SHAP top contributing factors...');

    try {
      const response = await predictFailureRisk(formData);
      setResult(response.data);
      setIsFallbackResult(response.isFallback);
      if (response.error) {
        setErrorNotice(response.error);
      }
      onPredictionCompleted(response.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Prediction request failed';
      setErrorNotice(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const copyJsonPayload = () => {
    const payload = JSON.stringify(formData, null, 2);
    navigator.clipboard.writeText(payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const getActionRecommendation = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'LOW':
        return {
          title: 'Continue Pipeline',
          message: 'Risk threshold checks passed. Safe to merge into default release branch.',
          icon: ShieldCheck,
          className: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
        };
      case 'MEDIUM':
        return {
          title: 'Proceed with Caution',
          message: 'Moderate failure risk detected. Review test coverage and run full integration smoke suites.',
          icon: AlertTriangle,
          className: 'bg-amber-950/40 border-amber-500/40 text-amber-300',
        };
      case 'HIGH':
        return {
          title: 'Manual Approval Required',
          message: 'High regression probability. Pipeline Risk Gate suspended deployment. Team lead approval required.',
          icon: AlertOctagon,
          className: 'bg-rose-950/40 border-rose-500/40 text-rose-300',
        };
    }
  };

  const probPercentage = result ? (result.failure_probability * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Header & Presets Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-[11px] font-mono text-indigo-300 mb-1.5">
            <Sparkles size={12} className="text-indigo-400" />
            Interactive CI/CD Simulation Sandbox
          </div>
          <h2 className="text-lg font-bold text-zinc-100">
            Pipeline Metric Risk Simulator
          </h2>
          <p className="text-xs text-zinc-400">
            Input pending PR metrics to simulate pre-merge failure probabilities and view key risk drivers.
          </p>
        </div>

        {/* Quick Scenario Presets */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs text-zinc-400 font-mono mr-1 hidden sm:inline">Presets:</span>
          <button
            type="button"
            id="preset-clean-patch"
            onClick={() => applyPreset('clean_patch')}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-mono border border-emerald-900/40 transition-colors"
          >
            Clean Micro-Patch (Low)
          </button>
          <button
            type="button"
            id="preset-standard"
            onClick={() => applyPreset('standard')}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-mono border border-amber-900/40 transition-colors"
          >
            Feature PR (Med)
          </button>
          <button
            type="button"
            id="preset-high-risk"
            onClick={() => applyPreset('high_risk')}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-400 text-xs font-mono border border-rose-900/40 transition-colors"
          >
            Major Refactor (High)
          </button>
        </div>
      </div>

      {/* Main Grid: Input Form on Left, Output Result on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-6 xl:col-span-5">
          <form
            id="simulator-form"
            onSubmit={handleSubmit}
            className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Sliders size={16} className="text-indigo-400" />
                Pipeline Metric Inputs
              </span>
              <button
                type="button"
                id="btn-copy-input-json"
                onClick={copyJsonPayload}
                className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                title="Copy request payload as JSON"
              >
                {copiedPayload ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedPayload ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            {/* Repo Name */}
            <div>
              <label htmlFor="sim-repo" className="block text-xs font-mono text-zinc-300 mb-1">
                Repository Name
              </label>
              <select
                id="sim-repo"
                value={formData.repo_name}
                onChange={(e) => setFormData({ ...formData, repo_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700/80 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
              >
                {REPOSITORY_OPTIONS.map((repo) => (
                  <option key={repo} value={repo}>
                    {repo}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch & Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="sim-branch" className="block text-xs font-mono text-zinc-300 mb-1">
                  Target / PR Branch
                </label>
                <input
                  id="sim-branch"
                  type="text"
                  required
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700/80 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="sim-service" className="block text-xs font-mono text-zinc-300 mb-1">
                  Target Service
                </label>
                <select
                  id="sim-service"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700/80 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                >
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Diff Stats: Files Changed, Lines Added, Lines Deleted */}
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 space-y-2.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Code Churn Metrics (Git Diff)
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="sim-files" className="block text-[11px] text-zinc-400 mb-0.5">
                    Files Changed
                  </label>
                  <input
                    id="sim-files"
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={formData.files_changed}
                    onChange={(e) =>
                      setFormData({ ...formData, files_changed: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="sim-added" className="block text-[11px] text-zinc-400 mb-0.5">
                    Lines Added
                  </label>
                  <input
                    id="sim-added"
                    type="number"
                    min="0"
                    max="50000"
                    required
                    value={formData.lines_added}
                    onChange={(e) =>
                      setFormData({ ...formData, lines_added: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="sim-deleted" className="block text-[11px] text-zinc-400 mb-0.5">
                    Lines Deleted
                  </label>
                  <input
                    id="sim-deleted"
                    type="number"
                    min="0"
                    max="50000"
                    required
                    value={formData.lines_deleted}
                    onChange={(e) =>
                      setFormData({ ...formData, lines_deleted: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Test Coverage & Test Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="sim-coverage" className="text-xs font-mono text-zinc-300">
                    Test Coverage: <span className="font-bold text-zinc-100">{formData.test_coverage}%</span>
                  </label>
                </div>
                <input
                  id="sim-coverage"
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.test_coverage}
                  onChange={(e) =>
                    setFormData({ ...formData, test_coverage: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                  <span>0% (Critical)</span>
                  <span>70%</span>
                  <span>100% (Safest)</span>
                </div>
              </div>

              <div>
                <label htmlFor="sim-test-count" className="block text-xs font-mono text-zinc-300 mb-1">
                  Automated Test Count
                </label>
                <input
                  id="sim-test-count"
                  type="number"
                  min="0"
                  max="10000"
                  required
                  value={formData.test_count}
                  onChange={(e) =>
                    setFormData({ ...formData, test_count: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700/80 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Historical Failure Rate & Dependency Mutation Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label htmlFor="sim-hist-rate" className="block text-xs font-mono text-zinc-300 mb-1">
                  Historical Failure Rate: {formData.historical_failure_rate}%
                </label>
                <input
                  id="sim-hist-rate"
                  type="range"
                  min="0"
                  max="60"
                  step="0.5"
                  value={formData.historical_failure_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, historical_failure_rate: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  id="sim-dependency-toggle"
                  type="checkbox"
                  checked={formData.dependency_changed}
                  onChange={(e) =>
                    setFormData({ ...formData, dependency_changed: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label
                  htmlFor="sim-dependency-toggle"
                  className="text-xs font-mono text-zinc-300 cursor-pointer"
                >
                  Dependency Changed?
                  <span className="block text-[10px] text-zinc-500 font-sans">
                    e.g. package.json / go.mod bump
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-predict-risk-submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-white" />
                    <span>Evaluating Risk...</span>
                  </>
                ) : (
                  <>
                    <Play size={15} className="fill-white" />
                    <span>Predict Failure Risk</span>
                  </>
                )}
              </button>
            </div>

            {/* Loading step status */}
            {isLoading && (
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono text-indigo-300 flex items-center gap-2">
                <Radio size={14} className="animate-pulse text-indigo-400 shrink-0" />
                <span>{loadingStep}</span>
              </div>
            )}

            {/* Backend Notice */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
              <span>
                {apiStatus.isOnline
                  ? 'Active backend: FastAPI /api/v1/predictions'
                  : 'Backend offline: using integrated ML heuristic simulation'}
              </span>
            </div>
          </form>
        </div>

        {/* Prediction Result Column */}
        <div className="lg:col-span-6 xl:col-span-7">
          {errorNotice && (
            <div className="mb-4 p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2">
              <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Notice: Falling back to local ML heuristic engine</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">{errorNotice}</div>
              </div>
            </div>
          )}

          {result ? (
            <div
              id="prediction-result-card"
              className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 sm:p-6 space-y-5"
            >
              {/* Top Result Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">PREDICTION RESULT</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      ID: {result.id}
                    </span>
                    {isFallbackResult ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40">
                        Local ML Engine
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                        Live API Response
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-100 mt-1 flex items-center gap-3 font-mono">
                    <span
                      className={
                        result.risk_level === 'HIGH'
                          ? 'text-rose-400'
                          : result.risk_level === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {probPercentage}%
                    </span>
                    <span className="text-xs font-normal text-zinc-400 font-sans">
                      Probability of pipeline failure
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <RiskBadge level={result.risk_level} size="lg" />
                </div>
              </div>

              {/* Visual Risk Indicator / Gauge Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>Risk Spectrum</span>
                  <span className="text-zinc-200 font-semibold">{probPercentage}% Risk Score</span>
                </div>

                <div className="h-3 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden relative">
                  {/* Threshold demarcation markers */}
                  <div className="absolute top-0 bottom-0 left-[35%] w-px bg-zinc-700 z-10" />
                  <div className="absolute top-0 bottom-0 left-[70%] w-px bg-zinc-700 z-10" />

                  <div
                    className={`h-full transition-all duration-500 ${
                      result.risk_level === 'HIGH'
                        ? 'bg-rose-500'
                        : result.risk_level === 'MEDIUM'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(2, Number(probPercentage)))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
                  <span className="text-emerald-400">0% – 35% (LOW)</span>
                  <span className="text-amber-400">36% – 70% (MEDIUM)</span>
                  <span className="text-rose-400">&gt; 70% (HIGH RISK)</span>
                </div>
              </div>

              {/* Recommended Action Box */}
              {(() => {
                const action = getActionRecommendation(result.risk_level);
                const Icon = action.icon;
                return (
                  <div className={`p-4 rounded-xl border ${action.className} flex items-start gap-3`}>
                    <Icon size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs sm:text-sm uppercase tracking-wide font-mono">
                        Recommendation: {action.title}
                      </div>
                      <p className="text-xs text-zinc-300 mt-0.5">{action.message}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Explanation Paragraph */}
              <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs">
                <div className="font-mono text-zinc-400 text-[11px] mb-1 flex items-center justify-between">
                  <span>ML EXPLANATION</span>
                  <span>Model: {result.model_version}</span>
                </div>
                <p className="text-zinc-200 leading-relaxed">{result.explanation}</p>
              </div>

              {/* TOP CONTRIBUTING FACTORS */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <Layers size={14} className="text-indigo-400" />
                    Top Contributing Factors (SHAP Feature Importance)
                  </span>
                  <span className="text-zinc-500 text-[11px]">Ranked by impact</span>
                </div>

                <div className="space-y-2">
                  {result.top_factors && result.top_factors.length > 0 ? (
                    result.top_factors.map((factor, idx) => {
                      const isRiskRaiser = factor.direction === 'increases_risk' || factor.impact > 0;
                      return (
                        <div
                          key={idx}
                          id={`factor-item-${idx}`}
                          className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="font-mono font-semibold text-zinc-200 flex items-center gap-2">
                              <span>{factor.feature_name.replace(/_/g, ' ')}</span>
                            </div>
                            <p className="text-zinc-400 text-[11px] leading-relaxed">
                              {factor.description}
                            </p>
                          </div>

                          <div
                            className={`flex items-center gap-1 font-mono font-bold shrink-0 px-2 py-1 rounded text-xs ${
                              isRiskRaiser
                                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                                : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            }`}
                          >
                            {isRiskRaiser ? (
                              <>
                                <ArrowUpRight size={13} />
                                +{Math.abs(factor.impact).toFixed(1)}%
                              </>
                            ) : (
                              <>
                                <ArrowDownRight size={13} />
                                -{Math.abs(factor.impact).toFixed(1)}%
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-xs text-zinc-500 font-mono bg-zinc-950 rounded">
                      Standard baseline profile without outlier feature variance.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  id="btn-inspect-sim-result"
                  onClick={() => onOpenDetailModal(result)}
                  className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors"
                >
                  View Full Detail Modal
                </button>
              </div>
            </div>
          ) : (
            /* Empty state placeholder before simulation */
            <div
              id="simulator-empty-state"
              className="h-full min-h-[380px] rounded-xl bg-zinc-900/40 border border-dashed border-zinc-800 p-8 flex flex-col items-center justify-center text-center text-zinc-500 space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400">
                <FileCode size={22} />
              </div>
              <h4 className="text-sm font-bold text-zinc-300">No Prediction Generated Yet</h4>
              <p className="text-xs text-zinc-400 max-w-sm">
                Adjust the metrics on the left and click &quot;Predict Failure Risk&quot; or select one of the
                presets above to evaluate the risk probability and view contributing factors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
