import React, { useState } from 'react';
import {
  X,
  Server,
  Radio,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Save,
} from 'lucide-react';
import {
  getApiBaseUrl,
  setApiBaseUrlOverride,
  checkApiHealth,
} from '../services/api';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onStatusChanged,
}) => {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    online: boolean;
    latencyMs?: number;
    error?: string;
    service?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    // Save override
    setApiBaseUrlOverride(apiUrl);

    const health = await checkApiHealth();
    setTesting(false);
    setTestResult({
      online: health.isOnline,
      latencyMs: health.latencyMs,
      error: health.error,
      service: health.data?.service,
    });
    onStatusChanged();
  };

  const handleResetToDemo = () => {
    setApiUrl('');
    setApiBaseUrlOverride(null);
    setTestResult(null);
    onStatusChanged();
    onClose();
  };

  return (
    <div
      id="api-config-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="api-config-modal-content"
        className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 text-slate-800 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Server size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Predictor Backend Connection</h3>
              <p className="text-xs text-slate-500">Configure FastAPI endpoint URL or use built-in simulator</p>
            </div>
          </div>

          <button
            id="btn-close-api-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label htmlFor="modal-api-url" className="block text-xs font-semibold text-slate-700 mb-1">
              Backend API Base URL
            </label>
            <input
              id="modal-api-url"
              type="text"
              placeholder="e.g. https://api-predictor.yourdomain.com"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            />
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Leave empty to run in Built-in Demo ML Simulation mode with XGBoost inference.
            </p>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs border ${
                testResult.online
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {testResult.online ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Backend is Online ({testResult.latencyMs || 24}ms latency)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-amber-600" />
                    <span>Endpoint offline or unreachable</span>
                  </>
                )}
              </div>
              <p className="text-[11px] mt-1 text-slate-600">
                {testResult.online
                  ? `Connected to ${testResult.service || 'CI/CD Risk Predictor API'}. Live inference active.`
                  : testResult.error || 'Running in local client-side heuristic mode automatically.'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              id="btn-reset-demo"
              onClick={handleResetToDemo}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              Reset to Demo
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-test-save-api"
                disabled={testing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {testing ? (
                  <>Testing...</>
                ) : (
                  <>
                    <Save size={13} />
                    Test &amp; Save
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
