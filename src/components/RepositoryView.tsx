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
      <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-700 mb-1.5">
            <Settings2 size={12} className="text-indigo-600" />
            Repository &amp; CI/CD Environment Configuration
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Predictor &amp; Risk Threshold Settings
          </h2>
          <p className="text-xs text-slate-500">
            Define failure risk gating limits, backend endpoint connectivity, and automated pipeline action triggers.
          </p>
        </div>

        {savedNotice && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Settings saved successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Backend Connection */}
          <div className="rounded-xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Server size={16} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">ML Backend Connectivity</h3>
            </div>

            <div>
              <label htmlFor="repo-api-url" className="block text-xs font-semibold text-slate-700 mb-1">
                FastAPI Predictor Endpoint URL
              </label>
              <div className="flex gap-2">
                <input
                  id="repo-api-url"
                  type="text"
                  placeholder="e.g. http://localhost:8000 or https://predictor.domain.com"
                  value={formData.api_url}
                  onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:bg-white"
                />
                <button
                  type="button"
                  id="btn-test-backend-connection"
                  onClick={handleTestConnection}
                  disabled={testStatus.testing}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                >
                  {testStatus.testing ? 'Testing...' : 'Ping Test'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Leave blank to automatically run with the integrated high-fidelity XGBoost simulation model.
              </p>
            </div>

            {testStatus.message && (
              <div
                className={`p-3 rounded-lg text-xs border ${
                  testStatus.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  <Radio size={14} />
                  <span>{testStatus.message}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="repo-model-version" className="block text-xs font-semibold text-slate-700 mb-1">
                Active ML Checkpoint Version
              </label>
              <input
                id="repo-model-version"
                type="text"
                value={formData.model_version}
                onChange={(e) => setFormData({ ...formData, model_version: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Card 2: Risk Gating Thresholds */}
          <div className="rounded-xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield size={16} className="text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Risk Gate Policies</h3>
            </div>

            {/* High-Risk Threshold Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="repo-high-thresh" className="text-xs font-semibold text-slate-700">
                  High-Risk Block Threshold: <span className="font-bold text-rose-600 font-mono">{formData.thresholds.medium_max}%</span>
                </label>
              </div>
              <input
                id="repo-high-thresh"
                type="range"
                min="50"
                max="95"
                step="1"
                value={formData.thresholds.medium_max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    thresholds: {
                      ...formData.thresholds,
                      medium_max: parseInt(e.target.value) || 70,
                    },
                  })
                }
                className="w-full accent-rose-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pipelines with failure probability above this threshold are intercepted with a required manual override.
              </p>
            </div>

            {/* Medium-Risk Threshold Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="repo-med-thresh" className="text-xs font-semibold text-slate-700">
                  Medium-Risk Warning Threshold: <span className="font-bold text-amber-600 font-mono">{formData.thresholds.low_max}%</span>
                </label>
              </div>
              <input
                id="repo-med-thresh"
                type="range"
                min="10"
                max="60"
                step="1"
                value={formData.thresholds.low_max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    thresholds: {
                      ...formData.thresholds,
                      low_max: parseInt(e.target.value) || 35,
                    },
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pipelines with failure probability above this threshold trigger Slack notices and PR warnings.
              </p>
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            id="btn-save-repo-settings"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save size={14} />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
