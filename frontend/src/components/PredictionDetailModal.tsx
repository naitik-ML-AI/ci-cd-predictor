import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  GitBranch,
  Clock,
  Layers,
  FileCode,
  Play,
} from 'lucide-react';
import { PredictionResponse } from '../types';
import { RiskBadge } from './RiskBadge';

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
  const [copied, setCopied] = useState(false);

  if (!prediction) return null;

  const probPct = (prediction.failure_probability * 100).toFixed(1);

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(prediction, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionRecommendation = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'LOW':
        return {
          title: 'Continue pipeline',
          message: 'All pre-merge failure risk metrics fall well within acceptable thresholds. Automated deployment approved.',
          icon: ShieldCheck,
          className: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
        };
      case 'MEDIUM':
        return {
          title: 'Proceed with caution',
          message: 'Moderate risk identified. Ensure all unit and integration test assertions pass and review warning annotations.',
          icon: AlertTriangle,
          className: 'bg-amber-950/40 border-amber-500/40 text-amber-300',
        };
      case 'HIGH':
        return {
          title: 'Manual approval required',
          message: 'High probability of build or runtime regression. Risk Gate has suspended downstream CI/CD deployment pending DevOps review.',
          icon: AlertOctagon,
          className: 'bg-rose-950/40 border-rose-500/40 text-rose-300',
        };
    }
  };

  const action = getActionRecommendation(prediction.risk_level);
  const ActionIcon = action.icon;

  return (
    <div
      id="prediction-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="prediction-detail-modal-content"
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-5 text-zinc-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-zinc-400">PREDICTION DETAIL</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                {prediction.id}
              </span>
            </div>
            <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
              {prediction.repo_name || 'acme-corp/service'}
            </h3>
          </div>

          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
          <div>
            <span className="text-zinc-500 text-[10px] block">BRANCH</span>
            <div className="flex items-center gap-1 text-zinc-200 mt-0.5 truncate font-medium">
              <GitBranch size={12} className="shrink-0" />
              <span>{prediction.branch || 'main'}</span>
            </div>
          </div>

          <div>
            <span className="text-zinc-500 text-[10px] block">COMMIT</span>
            <div className="text-indigo-400 mt-0.5 font-semibold">
              {prediction.commit_sha || 'HEAD'}
            </div>
          </div>

          <div>
            <span className="text-zinc-500 text-[10px] block">AUTHOR</span>
            <div className="text-zinc-200 mt-0.5">{prediction.author || 'devops-lead'}</div>
          </div>

          <div>
            <span className="text-zinc-500 text-[10px] block">MODEL</span>
            <div className="text-zinc-300 mt-0.5">{prediction.model_version}</div>
          </div>
        </div>

        {/* Failure Probability & Risk Badge Bar */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-zinc-400">Failure Probability</div>
            <div className="text-3xl font-extrabold font-mono text-zinc-100 mt-0.5">
              <span
                className={
                  prediction.risk_level === 'HIGH'
                    ? 'text-rose-400'
                    : prediction.risk_level === 'MEDIUM'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }
              >
                {probPct}%
              </span>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="text-xs font-mono text-zinc-400">Risk Classification</div>
            <RiskBadge level={prediction.risk_level} size="lg" />
          </div>
        </div>

        {/* Recommended Action Banner */}
        <div className={`p-4 rounded-xl border ${action.className} flex items-start gap-3`}>
          <ActionIcon size={20} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wide font-mono">
              Action: {action.title}
            </div>
            <p className="text-xs text-zinc-300 mt-0.5">{action.message}</p>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs">
          <div className="font-mono text-zinc-400 text-[11px] mb-1">EVALUATION EXPLANATION</div>
          <p className="text-zinc-200 leading-relaxed">{prediction.explanation}</p>
        </div>

        {/* Top Contributing Factors */}
        <div className="space-y-2.5">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Layers size={14} className="text-indigo-400" />
            Top Contributing Factors (SHAP Analysis)
          </div>

          <div className="space-y-2">
            {prediction.top_factors && prediction.top_factors.length > 0 ? (
              prediction.top_factors.map((factor, idx) => {
                const isRaiser = factor.direction === 'increases_risk' || factor.impact > 0;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-mono font-semibold text-zinc-200">
                        {factor.feature_name.replace(/_/g, ' ')}
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-0.5">{factor.description}</p>
                    </div>

                    <div
                      className={`flex items-center gap-1 font-mono font-bold shrink-0 px-2 py-1 rounded text-xs ${
                        isRaiser
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      }`}
                    >
                      {isRaiser ? (
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
              <div className="p-3 text-xs font-mono text-zinc-500 bg-zinc-900 rounded">
                Standard baseline distribution without outlier risk variance.
              </div>
            )}
          </div>
        </div>

        {/* Metrics Grid if available */}
        {prediction.metrics && (
          <div className="space-y-2 pt-1">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              CI/CD Pipeline Diff Metrics
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500">Files Changed</span>
                <div className="text-zinc-200 font-bold">{prediction.metrics.files_changed}</div>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500">Lines Added / Deleted</span>
                <div className="text-zinc-200 font-bold">
                  +{prediction.metrics.lines_added} / -{prediction.metrics.lines_deleted}
                </div>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500">Test Coverage</span>
                <div className="text-zinc-200 font-bold">{prediction.metrics.test_coverage}%</div>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500">Test Count</span>
                <div className="text-zinc-200 font-bold">{prediction.metrics.test_count}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs font-mono">
          <button
            type="button"
            id="btn-copy-modal-json"
            onClick={copyJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied JSON' : 'Copy JSON'}
          </button>

          <div className="flex items-center gap-2">
            {onReSimulate && (
              <button
                type="button"
                id="btn-resimulate-values"
                onClick={() => {
                  onReSimulate(prediction);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 transition-colors"
              >
                <Play size={13} />
                Load in Simulator
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
