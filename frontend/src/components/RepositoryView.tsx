import React, { useState } from 'react';
import {
  Settings2,
  Sliders,
  Server,
  GitBranch,
  Shield,
  Save,
  RotateCcw,
  Info,
  CheckCircle2,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { RepositoryConfig } from '../types';
import { getApiBaseUrl, setApiBaseUrlOverride, checkApiHealth } from '../services/api';

interface RepositoryViewProps {
  config: RepositoryConfig;
  onSaveConfig: (updated: RepositoryConfig) => void;
  onRefreshHealth: () => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({
  config,
  onSaveConfig,
  onRefreshHealth,
}) => {
  const [formData, setFormData] = useState<RepositoryConfig>({
    ...config,
    api_url: getApiBaseUrl(),
  });

  const [testStatus, setTestStatus] = useState<{
    testing: boolean;
    success?: boolean;
    message?: string;
  }>({ testing: false });

  const [savedNotice, setSavedNotice] = useState(false);

  const handleTestConnection = async () => {
    setTestStatus({ testing: true });
    // Apply temporary override to test
    setApiBaseUrlOverride(formData.api_url);
    const health = await checkApiHealth();
    if (health.isOnline) {
      setTestStatus({
        testing: false,
        success: true,
        message: `Connected successfully! (Latency: ${health.latencyMs}ms, Service: ${health.data?.service || 'ok'})`,
      });
    } else {
      setTestStatus({
        testing: false,
        success: false,
        message: health.error || 'Connection failed or server unreachable.',
      });
    }
    onRefreshHealth();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrlOverride(formData.api_url);
    onSaveConfig(formData);
    onRefreshHealth();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 mb-1.5">
            <Settings2 size={12} className="text-indigo-400" />
            Repository &amp; CI/CD Environment Configuration
          </div>
          <h2 className="text-lg font-bold text-zinc-100">
            Predictor &amp; Risk Threshold Settings
          </h2>
          <p className="text-xs text-zinc-400">
            Define failure risk gating limits, backend endpoint connectivity, and automated pipeline action triggers.
          </p>
        </div>

        {savedNotice && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            Saved to session storage
          </div>
        )}
      </div>

      {/* Notice about client-side persistence */}
      <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-zinc-300 flex items-start gap-2.5">
        <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-indigo-300 font-mono">Session-Scoped Configuration:</strong>{' '}
          Settings edited below apply directly to your current dashboard session. To persist across production CI/CD runners, export values to your GitHub repository secrets and set{' '}
          <code className="px-1.5 py-0.5 rounded bg-zinc-900 text-indigo-300 font-mono text-[11px]">
            VITE_API_BASE_URL
          </code>{' '}
          in your Vercel project settings.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Repository & Provider Meta */}
          <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
              <GitBranch size={16} className="text-indigo-400" />
              Repository Details
            </h3>

            <div>
              <label htmlFor="repo-name" className="block text-xs font-mono text-zinc-300 mb-1">
                Repository Name
              </label>
              <input
                id="repo-name"
                type="text"
                required
                value={formData.repo_name}
                onChange={(e) => setFormData({ ...formData, repo_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="default-branch" className="block text-xs font-mono text-zinc-300 mb-1">
                  Default Target Branch
                </label>
                <input
                  id="default-branch"
                  type="text"
                  required
                  value={formData.default_branch}
                  onChange={(e) => setFormData({ ...formData, default_branch: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="ci-provider" className="block text-xs font-mono text-zinc-300 mb-1">
                  CI/CD Provider
                </label>
                <select
                  id="ci-provider"
                  value={formData.ci_provider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ci_provider: e.target.value as RepositoryConfig['ci_provider'],
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                  <option value="GitHub Actions">GitHub Actions</option>
                  <option value="GitLab CI">GitLab CI</option>
                  <option value="CircleCI">CircleCI</option>
                  <option value="Jenkins">Jenkins</option>
                  <option value="Argo Workflows">Argo Workflows</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="model-version" className="block text-xs font-mono text-zinc-300 mb-1">
                Active ML Predictor Checkpoint
              </label>
              <input
                id="model-version"
                type="text"
                disabled
                value={formData.model_version}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-400 text-xs font-mono cursor-not-allowed"
              />
              <p className="text-[11px] text-zinc-500 font-mono mt-1">
                Retrained monthly on merged pipeline telemetry.
              </p>
            </div>
          </div>

          {/* Card 2: Predictor API Connectivity */}
          <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Server size={16} className="text-indigo-400" />
              Predictor API Endpoint
            </h3>

            <div>
              <label htmlFor="api-url-input" className="block text-xs font-mono text-zinc-300 mb-1">
                FastAPI Backend URL
              </label>
              <div className="flex gap-2">
                <input
                  id="api-url-input"
                  type="text"
                  placeholder="e.g. https://api-predictor.yourdomain.com or empty for demo"
                  value={formData.api_url}
                  onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="button"
                  id="btn-test-connection"
                  onClick={handleTestConnection}
                  disabled={testStatus.testing}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono border border-zinc-700 transition-colors shrink-0 flex items-center gap-1.5"
                >
                  {testStatus.testing ? <Radio size={13} className="animate-spin" /> : null}
                  Test Ping
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono mt-1">
                Target endpoint expects <code className="text-zinc-400">GET /api/v1/health</code> and{' '}
                <code className="text-zinc-400">POST /api/v1/predictions</code>
              </p>
            </div>

            {testStatus.message && (
              <div
                className={`p-3 rounded-lg text-xs font-mono ${
                  testStatus.success
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                }`}
              >
                {testStatus.message}
              </div>
            )}

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs space-y-1">
              <span className="font-mono text-zinc-400 text-[11px] uppercase tracking-wider block">
                Environment Variable Guide
              </span>
              <p className="text-zinc-400 text-[11px]">
                In Vercel or local env, specify{' '}
                <code className="text-indigo-400 font-mono">VITE_API_BASE_URL</code> without trailing slash. If not configured, the frontend gracefully runs in local demo mode with deterministic heuristic simulation.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Prediction Risk Thresholds */}
        <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <Shield size={16} className="text-indigo-400" />
                Pipeline Risk Gate Thresholds
              </h3>
              <p className="text-xs text-zinc-400">
                Determine the boundary percentages that separate automated continuation from manual intervention
              </p>
            </div>
            <div className="text-xs font-mono text-zinc-500">
              Low: &le;{formData.thresholds.low_max}% &bull; Med: &le;{formData.thresholds.medium_max}% &bull; High: &gt;{formData.thresholds.medium_max}%
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Low vs Medium Threshold Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400">LOW Risk Ceiling:</span>
                <span className="text-zinc-200 font-bold">{formData.thresholds.low_max}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="1"
                value={formData.thresholds.low_max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    thresholds: {
                      ...formData.thresholds,
                      low_max: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-zinc-500 font-mono">
                Pipelines with failure probability &le;{formData.thresholds.low_max}% continue automatically.
              </p>
            </div>

            {/* Medium vs High Threshold Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-rose-400">HIGH Risk Cutoff:</span>
                <span className="text-zinc-200 font-bold">{formData.thresholds.medium_max}%</span>
              </div>
              <input
                type="range"
                min="51"
                max="90"
                step="1"
                value={formData.thresholds.medium_max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    thresholds: {
                      ...formData.thresholds,
                      medium_max: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
              <p className="text-[11px] text-zinc-500 font-mono">
                Pipelines with failure probability &gt;{formData.thresholds.medium_max}% trigger Risk Gate halt.
              </p>
            </div>
          </div>

          {/* Automated Rule Toggles */}
          <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.auto_block_high_risk}
                onChange={(e) =>
                  setFormData({ ...formData, auto_block_high_risk: e.target.checked })
                }
                className="w-4 h-4 mt-0.5 rounded bg-zinc-950 border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="font-semibold block font-mono">Auto-Block High Risk</span>
                <span className="text-[11px] text-zinc-500">
                  Fail GitHub Actions check when risk &gt; {formData.thresholds.medium_max}%
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.comment_on_pr}
                onChange={(e) =>
                  setFormData({ ...formData, comment_on_pr: e.target.checked })
                }
                className="w-4 h-4 mt-0.5 rounded bg-zinc-950 border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="font-semibold block font-mono">PR Failure Card Comment</span>
                <span className="text-[11px] text-zinc-500">
                  Post formatted SHAP factors directly to GitHub pull request
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notify_slack}
                onChange={(e) =>
                  setFormData({ ...formData, notify_slack: e.target.checked })
                }
                className="w-4 h-4 mt-0.5 rounded bg-zinc-950 border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="font-semibold block font-mono">DevOps Channel Webhook</span>
                <span className="text-[11px] text-zinc-500">
                  Notify on-call engineers when failure probability exceeds 80%
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setFormData({
                ...config,
                api_url: '',
              });
              setApiBaseUrlOverride(null);
              onRefreshHealth();
            }}
            className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            Reset to Demo Defaults
          </button>

          <button
            type="submit"
            id="btn-save-repo-settings"
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold font-mono shadow-md shadow-indigo-950 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save size={14} />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
