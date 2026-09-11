import React from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  GitBranch,
  Layers,
  Play,
} from 'lucide-react';
import { PredictionResponse } from '../types';

interface PredictionDetailModalProps {
  prediction: PredictionResponse | null;
  onClose: () => void;
  onReSimulate?: (prediction: PredictionResponse) => void;
}

export const PredictionDetailModal: React.FC<PredictionDetailModalProps> = ({
  prediction,
  onClose,
  onReSimulate,
}) => {
  if (!prediction) return null;

  const probPct = (prediction.failure_probability * 100).toFixed(1);

  const getActionRecommendation = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'LOW':
        return {
          title: 'Low Failure Risk',
          message: 'Build passed risk checks. Safe to proceed with merge.',
          icon: ShieldCheck,
          className: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        };
      case 'MEDIUM':
        return {
          title: 'Medium Risk Warning',
          message: 'Moderate failure risk. Review test assertions and changed dependencies.',
          icon: AlertTriangle,
          className: 'bg-amber-50 border-amber-200 text-amber-800',
        };
      case 'HIGH':
        return {
          title: 'High Risk Alert',
          message: 'High regression risk. Deployment paused pending manual review.',
          icon: AlertOctagon,
          className: 'bg-rose-50 border-rose-200 text-rose-800',
        };
    }
  };

  const action = getActionRecommendation(prediction.risk_level);
  const ActionIcon = action.icon;

  return (
    <div
      id="prediction-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="prediction-detail-modal-content"
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-5 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-indigo-600">
                {prediction.commit_sha || 'HEAD'}
              </span>
              <span className="text-slate-300">&bull;</span>
              <div className="flex items-center gap-1 text-slate-500 font-mono text-xs">
                <GitBranch size={12} />
                <span>{prediction.branch || 'main'}</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {prediction.repo_name || 'payment-service'}
            </h3>
          </div>

          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Probability & Risk */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Failure Probability</div>
            <div
              className={`text-3xl font-extrabold mt-0.5 tabular-nums ${
                prediction.risk_level === 'HIGH'
                  ? 'text-rose-600'
                  : prediction.risk_level === 'MEDIUM'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {probPct}%
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              prediction.risk_level === 'HIGH'
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : prediction.risk_level === 'MEDIUM'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                prediction.risk_level === 'HIGH'
                  ? 'bg-rose-500'
                  : prediction.risk_level === 'MEDIUM'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            ></span>
            {prediction.risk_level} RISK
          </span>
        </div>

        {/* Action Recommendation */}
        <div className={`p-3.5 rounded-xl border ${action.className} flex items-start gap-3`}>
          <ActionIcon size={18} className="shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold">{action.title}</div>
            <p className="mt-0.5">{action.message}</p>
          </div>
        </div>

        {/* Key Contributing Factors */}
        {prediction.top_factors && prediction.top_factors.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers size={14} className="text-indigo-600" />
              Key Contributing Factors
            </div>

            <div className="space-y-1.5">
              {prediction.top_factors.map((factor, idx) => {
                const isRaiser = factor.direction === 'increases_risk' || factor.impact > 0;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 capitalize">
                        {factor.feature_name.replace(/_/g, ' ')}
                      </span>
                      <p className="text-slate-500 text-[11px]">{factor.description}</p>
                    </div>

                    <span
                      className={`font-mono font-bold shrink-0 px-2 py-0.5 rounded text-xs flex items-center gap-1 ${
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

        {/* Build Metrics Grid */}
        {prediction.metrics && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Build Metrics
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Files</div>
                <div className="font-bold text-slate-900 mt-0.5 font-mono">
                  {prediction.metrics.files_changed}
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Lines +/-</div>
                <div className="font-bold text-slate-900 mt-0.5 font-mono text-[11px]">
                  +{prediction.metrics.lines_added}/-{prediction.metrics.lines_deleted}
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Coverage</div>
                <div className="font-bold text-slate-900 mt-0.5 font-mono">
                  {prediction.metrics.test_coverage}%
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Tests</div>
                <div className="font-bold text-slate-900 mt-0.5 font-mono">
                  {prediction.metrics.test_count}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          {onReSimulate && (
            <button
              type="button"
              id="btn-re-simulate"
              onClick={() => onReSimulate(prediction)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <Play size={12} className="fill-white" />
              <span>Load in Simulator</span>
            </button>
          )}
          <button
            type="button"
            id="btn-close-detail"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
