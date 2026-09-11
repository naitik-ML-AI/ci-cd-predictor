import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  GitBranch,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Eye,
  Check,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { FailureAlert, PredictionResponse } from '../types';
import { RiskBadge } from './RiskBadge';

interface AlertsViewProps {
  alerts: FailureAlert[];
  predictions: PredictionResponse[];
  onSelectPrediction: (prediction: PredictionResponse) => void;
  onUpdateAlertStatus: (alertId: string, status: 'active' | 'acknowledged' | 'resolved' | 'overridden') => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  predictions,
  onSelectPrediction,
  onUpdateAlertStatus,
}) => {
  const [filterTab, setFilterTab] = useState<'active' | 'all' | 'acknowledged'>('active');

  const filteredAlerts = alerts.filter((a) => {
    if (filterTab === 'active') return a.status === 'active';
    if (filterTab === 'acknowledged') return a.status === 'acknowledged' || a.status === 'overridden';
    return true;
  });

  const activeCount = alerts.filter((a) => a.status === 'active').length;

  const handleInspect = (predictionId: string) => {
    const found = predictions.find((p) => p.id === predictionId);
    if (found) {
      onSelectPrediction(found);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-radial-[at_top_left] from-rose-950/40 via-zinc-900/60 to-zinc-950 border border-rose-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-950 border border-rose-500/40 text-[11px] font-mono text-rose-300">
            <ShieldAlert size={12} className="text-rose-400" />
            Active Risk Gate Interceptions
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
            Pipeline Failure Alerts &amp; Blocks
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Automated ML gate holds triggered when predicted failure risk exceeds the 70% high-risk threshold.
            Pipelines require DevOps review before merging to production.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-950 border border-zinc-800 self-start md:self-auto text-xs font-mono">
          <button
            id="tab-alerts-active"
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterTab === 'active'
                ? 'bg-rose-900/60 text-rose-200 border border-rose-700/50 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Active Blocks ({activeCount})
          </button>
          <button
            id="tab-alerts-ack"
            onClick={() => setFilterTab('acknowledged')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterTab === 'acknowledged'
                ? 'bg-zinc-800 text-zinc-200 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Reviewed ({alerts.length - activeCount})
          </button>
          <button
            id="tab-alerts-all"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterTab === 'all'
                ? 'bg-zinc-800 text-zinc-200 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All History ({alerts.length})
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const probPct = (alert.failure_probability * 100).toFixed(1);
            const isHigh = alert.risk_level === 'HIGH';

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                className={`rounded-xl border p-5 transition-all ${
                  alert.status === 'active'
                    ? 'bg-zinc-900/90 border-rose-900/50 hover:border-rose-700/70 shadow-lg shadow-rose-950/20'
                    : 'bg-zinc-900/50 border-zinc-800 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-2.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <RiskBadge level={alert.risk_level} size="md" />
                      <span className="text-xs font-mono font-bold text-zinc-200">
                        {alert.repo_name}
                      </span>
                      <span className="text-zinc-600">&bull;</span>
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400">
                        <GitBranch size={12} />
                        {alert.branch}
                      </span>
                      <span className="text-zinc-600">&bull;</span>
                      <span className="text-xs font-mono text-indigo-400">
                        {alert.commit_sha}
                      </span>
                      <span className="text-zinc-600">&bull;</span>
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500">
                        <Clock size={12} />
                        {new Date(alert.detected_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        ({new Date(alert.detected_at).toLocaleDateString()})
                      </span>
                    </div>

                    {/* Detected Reason */}
                    <div className="text-xs sm:text-sm text-zinc-200">
                      <strong className="text-rose-300 font-mono text-xs block mb-0.5">
                        FAILURE RISK TRIGGER:
                      </strong>
                      <p className="leading-relaxed text-zinc-300">{alert.reason}</p>
                    </div>

                    {/* Recommended Action */}
                    <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs font-mono space-y-1">
                      <div className="text-zinc-400 text-[11px] uppercase tracking-wider">
                        Recommended Action &amp; Risk Gate Status
                      </div>
                      <div className="text-zinc-200 flex items-center gap-2">
                        {alert.status === 'active' ? (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        ) : (
                          <Check size={14} className="text-emerald-400" />
                        )}
                        <span>{alert.recommended_action}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Probability Meter & Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono text-zinc-400">Failure Probability</div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
                        {probPct}%
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        Status: <span className="uppercase text-zinc-300 font-bold">{alert.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-inspect-alert-${alert.id}`}
                        onClick={() => handleInspect(alert.prediction_id)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <Eye size={13} />
                        Inspect Run
                      </button>

                      {alert.status === 'active' ? (
                        <>
                          <button
                            id={`btn-ack-alert-${alert.id}`}
                            onClick={() => onUpdateAlertStatus(alert.id, 'acknowledged')}
                            className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 text-xs font-mono transition-colors"
                          >
                            Acknowledge
                          </button>
                          <button
                            id={`btn-override-alert-${alert.id}`}
                            onClick={() => onUpdateAlertStatus(alert.id, 'overridden')}
                            className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 text-xs font-mono transition-colors"
                          >
                            Override Gate
                          </button>
                        </>
                      ) : (
                        <button
                          id={`btn-reactivate-alert-${alert.id}`}
                          onClick={() => onUpdateAlertStatus(alert.id, 'active')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 font-mono space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500/80 mb-2" />
            <h4 className="text-sm font-bold text-zinc-300">All Risk Gate Alerts Clear</h4>
            <p className="text-xs text-zinc-400">
              No active pipeline blocks currently flagged. Pipelines meeting threshold requirements continue automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
