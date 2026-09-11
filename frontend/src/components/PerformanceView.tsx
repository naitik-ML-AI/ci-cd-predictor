import React from 'react';
import {
  Target,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  Award,
  Zap,
  BarChart,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  MODEL_METRICS_DATA,
  PROBABILITY_HISTOGRAM_DATA,
  RISK_DISTRIBUTION_DATA,
  FEATURE_IMPORTANCE_DATA,
} from '../data/mockData';

export const PerformanceView: React.FC = () => {
  const metrics = MODEL_METRICS_DATA;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 mb-1.5">
            <Cpu size={12} className="text-indigo-400" />
            ML Model Telemetry &amp; Validation
          </div>
          <h2 className="text-lg font-bold text-zinc-100">
            Model Performance &amp; Evaluation Metrics
          </h2>
          <p className="text-xs text-zinc-400">
            Statistical validation metrics for XGBoost tree ensemble ({metrics.model_version}) evaluated against 1,284 historical pipeline runs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Active Checkpoint: <strong className="text-zinc-200">{metrics.model_version}</strong></span>
        </div>
      </div>

      {/* 5 ML Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Accuracy */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Accuracy</div>
          <div className="text-2xl font-extrabold text-zinc-100 font-mono">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-emerald-400 font-mono">Overall true prediction rate</p>
        </div>

        {/* 2. Precision */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Precision</div>
          <div className="text-2xl font-extrabold text-zinc-100 font-mono">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">Minimizes false alarms</p>
        </div>

        {/* 3. Recall */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Recall</div>
          <div className="text-2xl font-extrabold text-zinc-100 font-mono">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">Catches 9 of 10 true fails</p>
        </div>

        {/* 4. F1 Score */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">F1 Score</div>
          <div className="text-2xl font-extrabold text-zinc-100 font-mono">
            {(metrics.f1_score * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-indigo-400 font-mono">Harmonic precision-recall</p>
        </div>

        {/* 5. ROC-AUC */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">ROC-AUC</div>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">
            {metrics.roc_auc.toFixed(3)}
          </div>
          <p className="text-[10px] text-emerald-400 font-mono">Strong class separability</p>
        </div>
      </div>

      {/* Row 1 Charts: Prediction Distribution & Risk-Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prediction Distribution Histogram */}
        <div className="lg:col-span-7 rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <BarChart size={16} className="text-indigo-400" />
              Prediction Probability Distribution
            </h3>
            <p className="text-xs text-zinc-400">
              Distribution of predicted failure probabilities across 1,284 evaluated runs
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBar
                data={PROBABILITY_HISTOGRAM_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  stroke="#3f3f46"
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  stroke="#3f3f46"
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono space-y-1">
                          <div className="text-zinc-400">Probability: {item.bucket}</div>
                          <div className="text-indigo-300 font-bold">{item.count} Pipeline Runs</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {PROBABILITY_HISTOGRAM_DATA.map((entry, index) => {
                    const isHigh = index >= 7;
                    const isMed = index >= 3 && index < 7;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#6366f1'}
                      />
                    );
                  })}
                </Bar>
              </RechartsBar>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
            <span>Low Risk Clusters (&lt;30%)</span>
            <span>High Risk Tail (&gt;70%)</span>
          </div>
        </div>

        {/* Risk-Level Distribution Donut/Pie */}
        <div className="lg:col-span-5 rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <Layers size={16} className="text-indigo-400" />
              Risk Level Breakdown
            </h3>
            <p className="text-xs text-zinc-400">
              Categorical proportion of CI/CD executions by assigned tier
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RISK_DISTRIBUTION_DATA}
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {RISK_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono">
                          <span style={{ color: item.color }} className="font-bold">
                            {item.name}
                          </span>
                          <div className="text-zinc-300">
                            {item.value}% ({item.count} runs)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-1">
            {RISK_DISTRIBUTION_DATA.map((tier) => (
              <div
                key={tier.name}
                className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-zinc-950/60"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-xs"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-zinc-300">{tier.name}</span>
                </div>
                <span className="text-zinc-200 font-bold">
                  {tier.value}% <span className="text-zinc-500 font-normal">({tier.count})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Top Feature Importance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Importance */}
        <div className="lg:col-span-7 rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <Award size={16} className="text-indigo-400" />
              Global Feature Importance (SHAP Relative Weights)
            </h3>
            <p className="text-xs text-zinc-400">
              Primary telemetry signals driving failure risk classification in XGBoost
            </p>
          </div>

          <div className="space-y-3">
            {FEATURE_IMPORTANCE_DATA.map((feat) => {
              const pct = (feat.importance * 100).toFixed(1);
              return (
                <div key={feat.feature} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-300">{feat.feature}</span>
                    <span className="text-indigo-400 font-semibold">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confusion Matrix Visualization */}
        <div className="lg:col-span-5 rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <Target size={16} className="text-indigo-400" />
              Validation Confusion Matrix
            </h3>
            <p className="text-xs text-zinc-400">
              Evaluated on 400 holdout pipeline runs
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* True Positive */}
            <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1">
              <div className="text-[10px] text-emerald-400 uppercase">True Positives (TP)</div>
              <div className="text-xl font-bold text-emerald-300">118</div>
              <p className="text-[10px] text-zinc-400">Correctly caught true failures</p>
            </div>

            {/* False Positive */}
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <div className="text-[10px] text-amber-400 uppercase">False Positives (FP)</div>
              <div className="text-xl font-bold text-amber-300">11</div>
              <p className="text-[10px] text-zinc-400">Flagged risk that merged green</p>
            </div>

            {/* False Negative */}
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <div className="text-[10px] text-rose-400 uppercase">False Negatives (FN)</div>
              <div className="text-xl font-bold text-rose-300">14</div>
              <p className="text-[10px] text-zinc-400">Missed failure slipped past gate</p>
            </div>

            {/* True Negative */}
            <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-center space-y-1">
              <div className="text-[10px] text-indigo-400 uppercase">True Negatives (TN)</div>
              <div className="text-xl font-bold text-indigo-300">257</div>
              <p className="text-[10px] text-zinc-400">Correctly allowed green merge</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 space-y-1">
            <div className="flex justify-between">
              <span>Specificity:</span>
              <span className="text-zinc-200">95.9%</span>
            </div>
            <div className="flex justify-between">
              <span>Negative Predictive Value:</span>
              <span className="text-zinc-200">94.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
