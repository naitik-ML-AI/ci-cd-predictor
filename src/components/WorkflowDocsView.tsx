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
          BASE_SHA=\${{ github.event.pull_request.base.sha || 'HEAD~1' }}
          STATS=$(git diff --shortstat $BASE_SHA HEAD)
          FILES_CHANGED=$(git diff --name-only $BASE_SHA HEAD | wc -l)
          echo "files_changed=$FILES_CHANGED" >> $GITHUB_OUTPUT

      - name: Run Unit Tests & Measure Coverage
        run: |
          npm test -- --coverage --coverageReporters="text-summary"

      - name: Call Failure Risk Inference Service
        id: predict
        env:
          PREDICTOR_ENDPOINT: "https://cicd-predictor.internal.corp"
        run: |
          RESPONSE=$(curl -s -X POST "$PREDICTOR_ENDPOINT/api/v1/predictions" \\
            -H "Content-Type: application/json" \\
            -d '{
              "repo_name": "\${{ github.repository }}",
              "branch": "\${{ github.head_ref || github.ref_name }}",
              "files_changed": \${{ steps.git-diff.outputs.files_changed || 5 }},
              "lines_added": 120,
              "lines_deleted": 30,
              "test_coverage": 85.0,
              "test_count": 92
            }')
          echo "PREDICTION=$RESPONSE" >> $GITHUB_OUTPUT

      - name: Evaluate Risk Gate Policy
        run: |
          RISK_LEVEL=$(echo '\${{ steps.predict.outputs.PREDICTION }}' | jq -r '.risk_level')
          if [ "$RISK_LEVEL" == "HIGH" ]; then
            echo "::error::Risk Gate: Failure probability exceeded critical threshold (>70%). Blocking deployment."
            exit 1
          fi
`;

  const curlExample = `curl -X POST "http://localhost:8000/api/v1/predictions" \\
  -H "Content-Type: application/json" \\
  -d '{
    "repo_name": "acme-corp/payment-service",
    "branch": "feat/stripe-v3-migration",
    "files_changed": 28,
    "lines_added": 840,
    "lines_deleted": 210,
    "test_coverage": 61.4,
    "test_count": 48,
    "dependency_changed": true
  }'`;

  const copyText = (text: string, type: 'workflow' | 'curl') => {
    navigator.clipboard.writeText(text);
    if (type === 'workflow') {
      setCopiedWorkflow(true);
      setTimeout(() => setCopiedWorkflow(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-700 mb-1.5">
            <FileCode2 size={12} className="text-indigo-600" />
            Integration Architecture &amp; Workflow Docs
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Automating CI/CD Pipeline Risk Gating
          </h2>
          <p className="text-xs text-slate-500">
            Embed pre-merge ML inference into GitHub Actions, GitLab CI, or Jenkins pipelines using REST API hooks.
          </p>
        </div>
      </div>

      {/* GitHub Actions YAML Code Block */}
      <div className="rounded-xl bg-white border border-slate-200/80 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 font-mono">
              .github/workflows/cicd-risk-gate.yml
            </span>
          </div>
          <button
            type="button"
            id="btn-copy-workflow"
            onClick={() => copyText(workflowYaml, 'workflow')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            {copiedWorkflow ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            {copiedWorkflow ? 'Copied' : 'Copy Workflow'}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
          <code>{workflowYaml}</code>
        </pre>
      </div>

      {/* cURL API Invocation Example */}
      <div className="rounded-xl bg-white border border-slate-200/80 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 font-mono">
              Direct REST API cURL Specification
            </span>
          </div>
          <button
            type="button"
            id="btn-copy-curl"
            onClick={() => copyText(curlExample, 'curl')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            {copiedCurl ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            {copiedCurl ? 'Copied' : 'Copy cURL'}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
          <code>{curlExample}</code>
        </pre>
      </div>
    </div>
  );
};
