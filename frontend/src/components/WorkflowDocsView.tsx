import React, { useState } from 'react';
import {
  FileCode2,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Copy,
  Check,
  Cpu,
  Terminal,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export const WorkflowDocsView: React.FC = () => {
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const workflowYaml = `# .github/workflows/cicd-risk-gate.yml
name: CI/CD ML Failure Predictor Gate

on:
  pull_request:
    branches: [ main, release/* ]
  push:
    branches: [ main ]

jobs:
  predict-failure-risk:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Compute Git Diff & Churn Stats
        id: git-diff
        run: |
          # Compute added and deleted line counts against base branch
          BASE_SHA=\${{ github.event.pull_request.base.sha || 'HEAD~1' }}
          STATS=$(git diff --shortstat $BASE_SHA HEAD)
          FILES_CHANGED=$(git diff --name-only $BASE_SHA HEAD | wc -l)
          echo "files_changed=$FILES_CHANGED" >> $GITHUB_OUTPUT

      - name: Run Unit Tests & Measure Coverage
        id: test-run
        run: |
          npm test -- --coverage --coverageReporters="json-summary"
          # Extract coverage summary percentage and test count

      - name: Call AI CI/CD Failure Predictor API
        id: predictor
        env:
          PREDICTOR_API_URL: \${{ secrets.CICD_PREDICTOR_API_URL }}
        run: |
          RESPONSE=$(curl -s -X POST "\${PREDICTOR_API_URL}/api/v1/predictions" \\
            -H "Content-Type: application/json" \\
            -d '{
              "repo_name": "\${{ github.repository }}",
              "branch": "\${{ github.head_ref || github.ref_name }}",
              "files_changed": \${{ steps.git-diff.outputs.files_changed || 1 }},
              "lines_added": 140,
              "lines_deleted": 20,
              "test_coverage": 86.5,
              "test_count": 120,
              "dependency_changed": false,
              "service": "api-service"
            }')
          echo "prediction=$RESPONSE" >> $GITHUB_OUTPUT
          RISK=$(echo $RESPONSE | jq -r '.risk_level')
          PROB=$(echo $RESPONSE | jq -r '.failure_probability')
          echo "risk_level=$RISK" >> $GITHUB_ENV
          echo "failure_prob=$PROB" >> $GITHUB_ENV

      - name: Evaluate Risk Gate
        run: |
          echo "Evaluated Risk Level: $risk_level ($failure_prob)"
          if [ "$risk_level" = "HIGH" ]; then
            echo "::error::High risk of pipeline regression detected! Manual DevOps approval required."
            exit 1
          elif [ "$risk_level" = "MEDIUM" ]; then
            echo "::warning::Medium risk detected. Review suggested test coverage gaps."
          else
            echo "Risk evaluated as LOW. Safe to proceed with automated deployment."
          fi`;

  const curlExample = `curl -X POST "https://your-api-url/api/v1/predictions" \\
  -H "Content-Type: application/json" \\
  -d '{
    "repo_name": "acme-corp/payment-service",
    "branch": "feat/webhook-retry",
    "files_changed": 6,
    "lines_added": 240,
    "lines_deleted": 45,
    "test_coverage": 84.5,
    "test_count": 110,
    "dependency_changed": false,
    "service": "payment-service"
  }'`;

  const copyCode = (text: string, type: 'workflow' | 'curl') => {
    navigator.clipboard.writeText(text);
    if (type === 'workflow') {
      setCopiedWorkflow(true);
      setTimeout(() => setCopiedWorkflow(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  const workflowSteps = [
    { num: '01', title: 'Developer Push', desc: 'Git push or pull request opened', icon: GitPullRequest },
    { num: '02', title: 'GitHub Actions', desc: 'Runner workflow triggers', icon: Terminal },
    { num: '03', title: 'Compute Git Diff Stats', desc: 'Files changed, lines added/deleted', icon: Layers },
    { num: '04', title: 'Feature Extraction', desc: 'Test coverage delta, dependency bumps', icon: Cpu },
    { num: '05', title: 'ML Failure Predictor', desc: 'Inference via POST /api/v1/predictions', icon: Sparkles },
    { num: '06', title: 'Risk Classification', desc: 'Calculates probability & SHAP factors', icon: Shield },
    { num: '07', title: 'Risk Gate', desc: 'Enforces LOW, MEDIUM, or HIGH policy', icon: Shield },
    { num: '08', title: 'Deployment', desc: 'Production release or manual review hold', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 mb-1.5">
          <FileCode2 size={12} className="text-indigo-400" />
          DevOps Integration Architecture
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
          CI/CD Pipeline Integration &amp; Risk Gate Flow
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
          Integrate machine learning failure predictions directly into GitHub Actions or any CI runner to block risky builds before deployment.
        </p>
      </div>

      {/* Step Visualization Diagram */}
      <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-wider">
          End-to-End Prediction Lifecycle
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 relative space-y-2 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-indigo-400 font-bold">{step.num}</span>
                  <div className="p-1.5 rounded bg-zinc-900 text-zinc-400">
                    <Icon size={14} />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">{step.title}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{step.desc}</p>
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-zinc-700 pointer-events-none">
                    &bull;
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Gate Policies Breakdown */}
      <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-wider">
          Risk Gate Evaluation Policies
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* LOW */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <RiskBadge level="LOW" size="sm" />
              <span className="text-xs font-mono text-emerald-400 font-bold">&le; 35% Failure Prob</span>
            </div>
            <h4 className="text-xs font-bold text-zinc-100 font-mono">Pipeline Continues Automatically</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No regression flags. Pipeline proceeds straight to build, integration verification, and deployment.
            </p>
          </div>

          {/* MEDIUM */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <RiskBadge level="MEDIUM" size="sm" />
              <span className="text-xs font-mono text-amber-400 font-bold">36% – 70% Failure Prob</span>
            </div>
            <h4 className="text-xs font-bold text-zinc-100 font-mono">Pipeline Continues with Warning</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automated PR comment posted noting elevated code churn or test coverage drop. Deployment continues with advisory annotations.
            </p>
          </div>

          {/* HIGH */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-rose-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <RiskBadge level="HIGH" size="sm" />
              <span className="text-xs font-mono text-rose-400 font-bold">&gt; 70% Failure Prob</span>
            </div>
            <h4 className="text-xs font-bold text-zinc-100 font-mono">Pipeline Stopped: Manual Approval</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Risk Gate holds deployment. CI status set to failure or pending lead sign-off. Slack alert dispatched to on-call engineers.
            </p>
          </div>
        </div>
      </div>

      {/* GitHub Actions YAML Code Snippet */}
      <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
        <div className="p-4 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
            <Terminal size={14} className="text-indigo-400" />
            <span>.github/workflows/cicd-risk-gate.yml</span>
          </div>

          <button
            id="btn-copy-workflow-yaml"
            onClick={() => copyCode(workflowYaml, 'workflow')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors"
          >
            {copiedWorkflow ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copiedWorkflow ? 'Copied' : 'Copy YAML'}
          </button>
        </div>

        <pre className="p-4 text-xs font-mono text-zinc-300 bg-zinc-950/90 overflow-x-auto leading-relaxed">
          <code>{workflowYaml}</code>
        </pre>
      </div>

      {/* cURL REST Example */}
      <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
        <div className="p-4 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
            <Terminal size={14} className="text-indigo-400" />
            <span>FastAPI Ingestion Endpoint (cURL)</span>
          </div>

          <button
            id="btn-copy-curl-example"
            onClick={() => copyCode(curlExample, 'curl')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors"
          >
            {copiedCurl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copiedCurl ? 'Copied' : 'Copy cURL'}
          </button>
        </div>

        <pre className="p-4 text-xs font-mono text-zinc-300 bg-zinc-950/90 overflow-x-auto leading-relaxed">
          <code>{curlExample}</code>
        </pre>
      </div>
    </div>
  );
};
