export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ContributingFactor {
  feature_name: string;
  impact: number; // e.g. +14.2% or -8.5%
  description: string;
  direction: 'increases_risk' | 'decreases_risk';
}

export interface PredictionRequest {
  repo_name: string;
  branch: string;
  files_changed: number;
  lines_added: number;
  lines_deleted: number;
  test_coverage: number;
  test_count: number;
  dependency_changed: boolean;
  service: string;
  historical_failure_rate?: number;
}

export interface PredictionResponse {
  id: string;
  repo_name?: string;
  branch?: string;
  commit_sha?: string;
  commit_message?: string;
  author?: string;
  failure_probability: number; // 0.0 to 1.0
  risk_level: RiskLevel;
  top_factors: ContributingFactor[];
  model_version: string;
  explanation: string;
  created_at: string;
  status?: 'Passed' | 'Failed';
  alert_sent?: boolean;
  metrics?: {
    files_changed: number;
    lines_added: number;
    lines_deleted: number;
    test_coverage: number;
    test_count: number;
    dependency_changed: boolean;
    service: string;
    historical_failure_rate?: number;
  };
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version?: string;
  timestamp?: string;
}

export interface FailureAlert {
  id: string;
  prediction_id: string;
  repo_name: string;
  branch: string;
  commit_sha: string;
  commit_message?: string;
  author: string;
  author_avatar?: string;
  failure_probability: number;
  risk_level: RiskLevel;
  detected_at: string;
  service: string;
  reason: string;
  recommended_action: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'overridden';
  pull_request?: string;
  pipeline_stage?: string;
  impacted_services?: string[];
  team_notified?: {
    channel: string;
    timestamp: string;
    note?: string;
  };
  metrics?: {
    files_changed: number;
    lines_added: number;
    lines_deleted: number;
    test_coverage: number;
    test_count: number;
  };
  root_causes?: string[];
}

export interface RepositoryConfig {
  repo_name: string;
  default_branch: string;
  ci_provider: 'GitHub Actions' | 'GitLab CI' | 'CircleCI' | 'Jenkins' | 'Argo Workflows';
  api_url: string;
  model_version: string;
  thresholds: {
    low_max: number; // e.g. 35
    medium_max: number; // e.g. 70
  };
  auto_block_high_risk: boolean;
  notify_slack: boolean;
  comment_on_pr: boolean;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  model_version: string;
  last_trained: string;
  total_evaluations: number;
}

export interface PipelineRunTrend {
  run_number: number;
  run_id: string;
  commit_sha: string;
  timestamp: string;
  probability: number; // percentage 0 - 100
  risk_level: RiskLevel;
  duration_seconds: number;
  outcome: 'success' | 'failure';
}

export type ActiveTab =
  | 'overview'
  | 'simulator'
  | 'predictions'
  | 'alerts'
  | 'repository'
  | 'performance'
  | 'workflow';
