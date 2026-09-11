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
      <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-700 mb-1.5">
            <Cpu size={12} className="text-indigo-600" />
            ML Model Telemetry &amp; Validation
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Model Performance &amp; Evaluation Metrics
          </h2>
          <p className="text-xs text-slate-500">
            Statistical validation metrics for XGBoost tree ensemble ({metrics.model_version}) evaluated against 14,280 historical pipeline runs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Active Checkpoint: <strong className="text-slate-900 font-mono">{metrics.model_version}</strong></span>
        </div>
      </div>

      {/* 5 ML Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Accuracy */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Accuracy</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-emerald-600 font-medium">Overall true prediction rate</p>
        </div>

        {/* 2. Precision */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Precision</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Minimizes false alarms</p>
        </div>

        {/* 3. Recall */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recall</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Catches 9 of 10 true fails</p>
        </div>

        {/* 4. F1 Score */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">F1 Score</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {(metrics.f1_score * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-indigo-600 font-medium">Harmonic precision-recall</p>
        </div>

        {/* 5. ROC-AUC */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">ROC-AUC</div>
          <div className="text-2xl font-extrabold text-indigo-600 font-mono">
            {metrics.roc_auc.toFixed(3)}
          </div>
          <p className="text-[10px] text-emerald-600 font-medium">Strong class separability</p>
        </div>
      </div>

      {/* Row 1 Charts: Prediction Distribution & Risk-Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prediction Distribution Histogram */}
        <div className="lg:col-span-7 rounded-xl bg-white border border-slate-200/80 shadow-xs p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart size={16} className="text-indigo-600" />
              Prediction Probability Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of predicted failure probabilities across 14,280 evaluated runs
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBar
                data={PROBABILITY_HISTOGRAM_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  stroke="#cbd5e1"
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  stroke="#cbd5e1"
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-md">
                          <div className="font-mono font-bold text-slate-900">
                            Range: {payload[0].payload.bucket}
                          </div>
                          <div className="text-slate-600">
                            Count: {payload[0].value} runs
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {PROBABILITY_HISTOGRAM_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index < 3
                          ? '#10b981'
                          : index < 7
                          ? '#f59e0b'
                          : '#f43f5e'
                      }
                    />
                  ))}
                </Bar>
              </RechartsBar>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Ratio Breakdown */}
        <div className="lg:col-span-5 rounded-xl bg-white border border-slate-200/80 shadow-xs p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers size={16} className="text-indigo-600" />
              Dataset Risk Classification Share
            </h3>
            <p className="text-xs text-slate-500">
              Proportion of evaluated pull requests categorized by risk gate tier
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RISK_DISTRIBUTION_DATA}
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {RISK_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 rounded-lg border border-slate-200 text-xs shadow-md">
                          <span className="font-bold text-slate-900">
                            {payload[0].name}: {payload[0].value}%
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {RISK_DISTRIBUTION_DATA.map((item) => (
              <div key={item.name} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">{item.name}</div>
                <div className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
                  {item.value}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Global Feature Importance (SHAP) */}
      <div className="rounded-xl bg-white border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              Global Feature Importance (TreeSHAP Attribution)
            </h3>
            <p className="text-xs text-slate-500">
              Ranking features by mean absolute SHAP value impact on predicting CI failure
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Algorithm: XGBoost Exact TreeSHAP
          </span>
        </div>

        <div className="space-y-3">
          {FEATURE_IMPORTANCE_DATA.map((feat, idx) => (
            <div key={feat.feature} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                  {feat.feature}
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {(feat.importance * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${feat.importance * 100 * 2.8}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
