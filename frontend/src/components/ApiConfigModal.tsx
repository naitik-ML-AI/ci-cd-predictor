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
  ExternalLink,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="api-config-modal-content"
        className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-4 text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-700/50">
              <Server size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Predictor Backend Connection</h3>
              <p className="text-xs text-zinc-400">Configure FastAPI endpoint URL or use local demo mode</p>
            </div>
          </div>

          <button
            id="btn-close-api-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label htmlFor="modal-api-url" className="block text-xs font-mono text-zinc-300 mb-1">
              Backend API Base URL
            </label>
            <input
              id="modal-api-url"
              type="text"
              placeholder="e.g. https://api-predictor.yourdomain.com"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
            />
            <p className="text-[11px] text-zinc-500 font-mono mt-1">
              Leave empty to run in Built-in Demo ML Simulation mode.
            </p>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs font-mono flex items-start gap-2 ${
                testResult.online
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
              }`}
            >
              {testResult.online ? (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <XCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
              )}
              <div>
                <div className="font-bold">
                  {testResult.online
                    ? `Backend Connected! (${testResult.latencyMs}ms)`
                    : 'Connection Failed'}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {testResult.online
                    ? `Service: ${testResult.service || 'cicd-failure-predictor'} — Health check passed at /api/v1/health`
                    : testResult.error || 'Server did not respond to /api/v1/health'}
                </div>
              </div>
            </div>
          )}

          {/* Vercel Environment Notice */}
          <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-mono text-zinc-300 text-[11px] uppercase tracking-wider">
              <Sparkles size={12} className="text-indigo-400" />
              Vercel Deployment Guide
            </div>
            <p className="text-[11px] leading-relaxed">
              When deploying this repository to Vercel, set the environment variable:
            </p>
            <div className="p-2 rounded bg-zinc-950 text-indigo-300 font-mono text-[11px] select-all border border-zinc-800">
              VITE_API_BASE_URL=https://your-production-fastapi-domain.com
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs font-mono">
            <button
              type="button"
              id="btn-reset-demo"
              onClick={handleResetToDemo}
              className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={13} />
              Reset to Demo Mode
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                id="btn-save-api-url"
                disabled={testing}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {testing ? <Radio size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{testing ? 'Testing...' : 'Test & Save'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
