import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Bell,
  Users,
  GitPullRequest,
  GitBranch,
  ShieldAlert,
} from 'lucide-react';
import { FailureAlert } from '../types';

interface InformTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If targetAlert is provided, we inform for that single alert; if null, it's a broadcast to all active alerts
  targetAlert: FailureAlert | null;
  allActiveAlerts: FailureAlert[];
  onConfirmNotify: (
    alertIds: string[],
    details: { channel: string; note: string; urgency: string }
  ) => void;
}

export const InformTeamModal: React.FC<InformTeamModalProps> = ({
  isOpen,
  onClose,
  targetAlert,
  allActiveAlerts,
  onConfirmNotify,
}) => {
  const isBroadcast = !targetAlert;
  const activeAlertsToNotify = isBroadcast ? allActiveAlerts : [targetAlert];

  const defaultChannel = targetAlert
    ? targetAlert.repo_name.includes('payment')
      ? '#payments-eng'
      : targetAlert.repo_name.includes('queue')
      ? '#data-platform'
      : targetAlert.repo_name.includes('web')
      ? '#frontend-team'
      : '#devops-alerts'
    : '#devops-alerts';

  const [channel, setChannel] = useState(defaultChannel);
  const [channelType, setChannelType] = useState<'slack' | 'teams' | 'email' | 'pagerduty'>('slack');
  const [urgency, setUrgency] = useState<'P1 - Immediate Block' | 'P2 - Review Required'>('P1 - Immediate Block');
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  // Generate notification payload text
  const generatePreviewText = () => {
    if (targetAlert) {
      const probPct = (targetAlert.failure_probability * 100).toFixed(1);
      return `🚨 [CI/CD RISK GATE ALERT] High-Risk Pipeline Detected
Repository: ${targetAlert.repo_name} (${targetAlert.branch})
Commit: ${targetAlert.commit_sha} by @${targetAlert.author} ${targetAlert.pull_request ? `(${targetAlert.pull_request})` : ''}
Predicted Failure Risk: ${probPct}% (CRITICAL)
Stage: ${targetAlert.pipeline_stage || 'Integration Tests'}

Reason: ${targetAlert.reason}
Recommended Action: ${targetAlert.recommended_action}
${customNote ? `\nLead Note: "${customNote}"` : ''}
Action Required: Manual approval gate engaged. Pipeline suspended until reviewed.`;
    } else {
      return `📢 [CI/CD BROADCAST] Attention Engineering Leads
Currently ${activeAlertsToNotify.length} repositories are blocked by the ML Failure Predictor:
${activeAlertsToNotify
  .map(
    (a) =>
      `• ${a.repo_name} (${a.branch}) - ${(a.failure_probability * 100).toFixed(1)}% Risk [Author: @${a.author}]`
  )
  .join('\n')}
${customNote ? `\nNote: "${customNote}"` : ''}
Please review before staging deployment window.`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePreviewText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      const ids = activeAlertsToNotify.map((a) => a.id);
      onConfirmNotify(ids, {
        channel: channelType === 'slack' ? channel : `${channelType.toUpperCase()} broadcast`,
        note: customNote,
        urgency,
      });
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div
      id="inform-team-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="inform-team-modal-content"
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              {isBroadcast ? <Users size={20} /> : <Bell size={20} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isBroadcast ? 'Broadcast Alert to All Teams' : `Inform Team: ${targetAlert?.repo_name}`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBroadcast
                  ? `Notify on-call leads across all ${activeAlertsToNotify.length} blocked repositories`
                  : `Alert team leads and committer (@${targetAlert?.author}) about pipeline blockage`}
              </p>
            </div>
          </div>

          <button
            id="btn-close-inform-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selected Alert Summary Card */}
        {targetAlert ? (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{targetAlert.repo_name}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono text-[10px]">
                  {targetAlert.commit_sha}
                </span>
                {targetAlert.pull_request && (
                  <span className="inline-flex items-center gap-1 font-semibold text-indigo-600">
                    <GitPullRequest size={11} />
                    {targetAlert.pull_request}
                  </span>
                )}
              </div>
              <span className="px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 text-[11px] border border-rose-200">
                {(targetAlert.failure_probability * 100).toFixed(1)}% Failure Odds
              </span>
            </div>

            <div className="text-slate-600 line-clamp-2">
              <span className="font-semibold text-slate-700">Root cause:</span> {targetAlert.reason}
            </div>

            <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
              <GitBranch size={12} className="text-slate-400" />
              <span>{targetAlert.branch}</span>
              <span>&bull;</span>
              <span>Author: @{targetAlert.author}</span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle size={15} className="text-amber-600" />
              <span>Broadcasting to {activeAlertsToNotify.length} Blocked Repositories</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeAlertsToNotify.map((a) => (
                <span
                  key={a.id}
                  className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-slate-800 text-[11px] font-medium"
                >
                  {a.repo_name} ({(a.failure_probability * 100).toFixed(0)}%)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Channel Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Destination Channel
          </label>

          <div className="grid grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              id="channel-slack"
              onClick={() => setChannelType('slack')}
              className={`p-2.5 rounded-lg border font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                channelType === 'slack'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MessageSquare size={16} className={channelType === 'slack' ? 'text-indigo-600' : 'text-slate-400'} />
              <span>Slack</span>
            </button>

            <button
              type="button"
              id="channel-teams"
              onClick={() => setChannelType('teams')}
              className={`p-2.5 rounded-lg border font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                channelType === 'teams'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users size={16} className={channelType === 'teams' ? 'text-indigo-600' : 'text-slate-400'} />
              <span>MS Teams</span>
            </button>

            <button
              type="button"
              id="channel-email"
              onClick={() => setChannelType('email')}
              className={`p-2.5 rounded-lg border font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                channelType === 'email'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Mail size={16} className={channelType === 'email' ? 'text-indigo-600' : 'text-slate-400'} />
              <span>Email Digest</span>
            </button>

            <button
              type="button"
              id="channel-pagerduty"
              onClick={() => setChannelType('pagerduty')}
              className={`p-2.5 rounded-lg border font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                channelType === 'pagerduty'
                  ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert size={16} className={channelType === 'pagerduty' ? 'text-rose-600' : 'text-slate-400'} />
              <span>PagerDuty</span>
            </button>
          </div>

          {channelType === 'slack' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Channel:</span>
              <select
                id="select-slack-channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              >
                <option value="#devops-alerts">#devops-alerts (All On-call)</option>
                <option value="#payments-eng">#payments-eng (Payment Squad)</option>
                <option value="#data-platform">#data-platform (Celery &amp; ETL)</option>
                <option value="#frontend-team">#frontend-team (Web Portal)</option>
                <option value="#security-eng">#security-eng (Auth &amp; Sec)</option>
              </select>
            </div>
          )}
        </div>

        {/* Urgency and Custom Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Urgency Level
            </label>
            <select
              id="select-urgency"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-hidden"
            >
              <option value="P1 - Immediate Block">P1 - Immediate Block (Halt Pipeline)</option>
              <option value="P2 - Review Required">P2 - Review Required (Warning)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Notify Leads / Mentions
            </label>
            <input
              type="text"
              readOnly
              value={
                targetAlert
                  ? `@${targetAlert.author}, @oncall-devops, @team-lead`
                  : `@all-repo-leads, @devops-oncall`
              }
              className="w-full px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono select-all"
            />
          </div>
        </div>

        {/* Custom Note input */}
        <div>
          <label htmlFor="custom-lead-note" className="block text-xs font-semibold text-slate-700 mb-1">
            Custom Instruction / Note (Optional)
          </label>
          <input
            id="custom-lead-note"
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Please hold deployment until missing unit tests are merged"
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Message Payload Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Message Preview
            </span>
            <button
              type="button"
              id="btn-copy-preview"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy text</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-36">
            {generatePreviewText()}
          </pre>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-500">
            {sentSuccess ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} />
                Notification dispatched successfully!
              </span>
            ) : (
              <span>Automated audit trail will log this action.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-cancel-inform"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              id="btn-confirm-send-notification"
              onClick={handleSend}
              disabled={isSending || sentSuccess}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {isSending ? (
                <span>Dispatching...</span>
              ) : sentSuccess ? (
                <>
                  <Check size={13} />
                  <span>Sent!</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>{isBroadcast ? 'Broadcast to All' : 'Send Alert Now'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
