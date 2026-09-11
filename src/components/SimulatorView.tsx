import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  ShieldCheck,
  Layers,
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
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

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

    try {
      const response = await predictFailureRisk(formData);
      setResult(response.data);
      if (response.error) {
        setErrorNotice(response.error);
      }
      onPredictionCompleted(response.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Prediction request failed';
      setErrorNotice(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionRecommendation = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'LOW':
        return {
          title: 'Low Failure Risk',
          message: 'Safe to proceed with deployment.',
          icon: ShieldCheck,
          className: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        };
      case 'MEDIUM':
        return {
          title: 'Medium Risk Warning',
          message: 'Review tests and dependencies before merging.',
          icon: AlertTriangle,
          className: 'bg-amber-50 border-amber-200 text-amber-800',
        };
      case 'HIGH':
        return {
          title: 'High Risk Block',
          message: 'High probability of pipeline failure. Manual review required.',
          icon: AlertOctagon,
          className: 'bg-rose-50 border-rose-200 text-rose-800',
        };
    }
  };

  const probPercentage = result ? (result.failure_probability * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Header & Presets Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Pipeline Risk Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test changes to predict build failure risk before opening a PR
          </p>
        </div>

        {/* Quick Scenario Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Presets:</span>
          <button
            type="button"
            id="preset-clean-patch"
            onClick={() => applyPreset('clean_patch')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
          >
            Low Risk
          </button>
          <button
            type="button"
            id="preset-standard"
            onClick={() => applyPreset('standard')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 transition-colors cursor-pointer"
          >
            Medium Risk
          </button>
          <button
            type="button"
            id="preset-high-risk"
            onClick={() => applyPreset('high_risk')}
            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
          >
            High Risk
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
            className="rounded-xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-xs"
          >
            <div className="pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders size={16} className="text-indigo-600" />
                Parameters
              </span>
            </div>

            {/* Service & Branch */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sim-service" className="block text-xs font-semibold text-slate-700 mb-1">
                  Service
                </label>
                <select
                  id="sim-service"
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service: e.target.value,
                      repo_name: `acme-corp/${e.target.value}`,
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:bg-white"
                >
                  {SERVICE_OPTIONS.map((svc) => (
                    <option key={svc} value={svc}>
                      {svc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sim-branch" className="block text-xs font-semibold text-slate-700 mb-1">
                  Branch
                </label>
                <input
                  id="sim-branch"
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Files Changed & Test Coverage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sim-files" className="block text-xs font-semibold text-slate-700 mb-1">
                  Files Changed ({formData.files_changed})
                </label>
                <input
                  id="sim-files"
                  type="range"
                  min="1"
                  max="100"
                  value={formData.files_changed}
                  onChange={(e) =>
                    setFormData({ ...formData, files_changed: parseInt(e.target.value) || 1 })
                  }
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="sim-coverage" className="block text-xs font-semibold text-slate-700 mb-1">
                  Test Coverage ({formData.test_coverage}%)
                </label>
                <input
                  id="sim-coverage"
                  type="range"
                  min="10"
                  max="100"
                  step="0.5"
                  value={formData.test_coverage}
                  onChange={(e) =>
                    setFormData({ ...formData, test_coverage: parseFloat(e.target.value) || 50 })
                  }
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Lines Added & Deleted */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sim-lines-added" className="block text-xs font-semibold text-slate-700 mb-1">
                  Lines Added
                </label>
                <input
                  id="sim-lines-added"
                  type="number"
                  min="0"
                  value={formData.lines_added}
                  onChange={(e) =>
                    setFormData({ ...formData, lines_added: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="sim-lines-deleted" className="block text-xs font-semibold text-slate-700 mb-1">
                  Lines Deleted
                </label>
                <input
                  id="sim-lines-deleted"
                  type="number"
                  min="0"
                  value={formData.lines_deleted}
                  onChange={(e) =>
                    setFormData({ ...formData, lines_deleted: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Test Count & Service Failure Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sim-test-count" className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Unit Tests
                </label>
                <input
                  id="sim-test-count"
                  type="number"
                  min="0"
                  value={formData.test_count}
                  onChange={(e) =>
                    setFormData({ ...formData, test_count: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="sim-fail-rate" className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Failure Rate ({formData.historical_failure_rate}%)
                </label>
                <input
                  id="sim-fail-rate"
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={formData.historical_failure_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      historical_failure_rate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Dependency Modified Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  id="sim-deps"
                  checked={formData.dependency_changed}
                  onChange={(e) => setFormData({ ...formData, dependency_changed: e.target.checked })}
                  className="rounded border-slate-300 text-slate-900 accent-slate-900"
                />
                <span>Dependencies changed (e.g. package.json, requirements.txt)</span>
              </label>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-run-simulation"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <Play size={14} className="fill-white" />
                <span>{isLoading ? 'Calculating...' : 'Run Simulation'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Results Column */}
        <div className="lg:col-span-6 xl:col-span-7">
          {result ? (
            <div
              id="simulator-results-panel"
              className="rounded-xl bg-white border border-slate-200/80 p-5 space-y-5 shadow-xs"
            >
              {/* Top Result Banner */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Prediction Result
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                      {probPercentage}%
                    </span>
                    <span className="text-xs text-slate-500 font-medium">failure probability</span>
                  </div>
                </div>

                <RiskBadge level={result.risk_level} size="md" />
              </div>

              {/* Recommendation Callout */}
              {(() => {
                const rec = getActionRecommendation(result.risk_level);
                const RecIcon = rec.icon;
                return (
                  <div className={`p-4 rounded-xl border ${rec.className} flex items-start gap-3`}>
                    <RecIcon size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wide">
                        {rec.title}
                      </div>
                      <p className="text-xs mt-0.5">{rec.message}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Key Factors */}
              {result.top_factors && result.top_factors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers size={14} className="text-indigo-600" />
                    Key Risk Factors
                  </div>
                  <div className="space-y-2">
                    {result.top_factors.map((factor, idx) => {
                      const isRaiser = factor.direction === 'increases_risk' || factor.impact > 0;
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 capitalize">
                              {factor.feature_name.replace(/_/g, ' ')}
                            </span>
                            <p className="text-slate-500 text-[11px] mt-0.5">{factor.description}</p>
                          </div>
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-xs shrink-0 flex items-center gap-1 ${
                              isRaiser
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isRaiser ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {isRaiser ? '+' : '-'}{Math.abs(factor.impact).toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* View Full Details Button */}
              <button
                type="button"
                id="btn-open-detail-from-sim"
                onClick={() => onOpenDetailModal(result)}
                className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                Inspect Full SHAP Breakdown &amp; Metrics
              </button>
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-slate-200/80 p-12 text-center text-slate-400 space-y-2 shadow-xs">
              <Sliders size={32} className="mx-auto text-slate-300 mb-2" />
              <div className="text-sm font-semibold text-slate-700">No simulation run yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Adjust parameters on the left or select a preset, then click "Run Simulation" to see failure probability.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
