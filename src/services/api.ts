import { HealthCheckResponse, PredictionRequest, PredictionResponse, RiskLevel, ContributingFactor } from '../types';

// Read API Base URL from environment variable without hardcoding localhost in components
const ENV_API_URL = import.meta.env.VITE_API_BASE_URL ? String(import.meta.env.VITE_API_BASE_URL).trim() : '';

// Session storage key for optional user-configured URL override in the dashboard UI
const STORAGE_KEY_API_URL = 'cicd_predictor_api_url_override';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const override = sessionStorage.getItem(STORAGE_KEY_API_URL);
    if (override && override.trim()) {
      return override.trim().replace(/\/+$/, '');
    }
  }
  return ENV_API_URL.replace(/\/+$/, '');
}

export function setApiBaseUrlOverride(url: string | null): void {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      sessionStorage.setItem(STORAGE_KEY_API_URL, url.trim().replace(/\/+$/, ''));
    } else {
      sessionStorage.removeItem(STORAGE_KEY_API_URL);
    }
  }
}

export function isApiConfigured(): boolean {
  return Boolean(getApiBaseUrl());
}

/**
 * Health check endpoint: GET ${API_BASE_URL}/api/v1/health
 */
export async function checkApiHealth(): Promise<{
  isOnline: boolean;
  data?: HealthCheckResponse;
  latencyMs?: number;
  error?: string;
}> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return {
      isOnline: false,
      error: 'VITE_API_BASE_URL is not configured (Running in local demo mode)',
    };
  }

  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${baseUrl}/api/v1/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - start);

    if (!response.ok) {
      return {
        isOnline: false,
        latencyMs,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data: HealthCheckResponse = await response.json();
    return {
      isOnline: true,
      data,
      latencyMs,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const errorMessage = err instanceof Error ? err.message : 'Network connection failed';
    return {
      isOnline: false,
      latencyMs,
      error: errorMessage.includes('aborted') ? 'Request timed out after 4s' : errorMessage,
    };
  }
}

/**
 * Local ML deterministic heuristic predictor.
 * Generates realistic ML factors and probabilities based on software engineering failure models
 * (coverage penalty, churn entropy, dependency volatility, and historical baseline).
 */
export function simulateLocalPrediction(input: PredictionRequest): PredictionResponse {
  const totalChurn = input.lines_added + input.lines_deleted;
  const coverage = Math.max(0, Math.min(100, input.test_coverage));
  const testCount = Math.max(0, input.test_count);
  const histRate = input.historical_failure_rate ?? 14.5;

  let riskScore = 0.05; // base probability 5%

  const factors: ContributingFactor[] = [];

  // 1. Test coverage impact
  if (coverage < 40) {
    const penalty = 0.38;
    riskScore += penalty;
    factors.push({
      feature_name: 'test_coverage',
      impact: 38.0,
      description: `Test coverage is critically low at ${coverage.toFixed(1)}% (below 40% safeguard threshold).`,
      direction: 'increases_risk',
    });
  } else if (coverage < 70) {
    const penalty = 0.18;
    riskScore += penalty;
    factors.push({
      feature_name: 'test_coverage',
      impact: 18.0,
      description: `Test coverage at ${coverage.toFixed(1)}% is below standard 80% CI target.`,
      direction: 'increases_risk',
    });
  } else if (coverage >= 85) {
    const benefit = 0.12;
    riskScore -= benefit;
    factors.push({
      feature_name: 'test_coverage',
      impact: -12.0,
      description: `Robust test suite coverage of ${coverage.toFixed(1)}% acts as a strong safety buffer.`,
      direction: 'decreases_risk',
    });
  }

  // 2. Churn & diff magnitude
  if (totalChurn > 800 || input.files_changed > 25) {
    const penalty = 0.28;
    riskScore += penalty;
    factors.push({
      feature_name: 'code_churn_volume',
      impact: 28.0,
      description: `Large code surface change (${input.files_changed} files, ${totalChurn} lines modified) correlates with elevated regression risk.`,
      direction: 'increases_risk',
    });
  } else if (totalChurn < 50 && input.files_changed <= 3) {
    const benefit = 0.08;
    riskScore -= benefit;
    factors.push({
      feature_name: 'code_churn_volume',
      impact: -8.0,
      description: `Focused micro-diff (${input.files_changed} files, ${totalChurn} lines) limits potential regression surface.`,
      direction: 'decreases_risk',
    });
  }

  // 3. Dependency changes
  if (input.dependency_changed) {
    const penalty = 0.22;
    riskScore += penalty;
    factors.push({
      feature_name: 'dependency_graph_mutation',
      impact: 22.0,
      description: 'Dependency manifest modification detected. Lockfile/transitive resolution failures are frequent CI blockers.',
      direction: 'increases_risk',
    });
  }

  // 4. Test count ratio to churn
  if (testCount < 10 && totalChurn > 100) {
    const penalty = 0.16;
    riskScore += penalty;
    factors.push({
      feature_name: 'test_density_ratio',
      impact: 16.0,
      description: `Low test count (${testCount} tests) relative to diff churn indicates under-tested logic.`,
      direction: 'increases_risk',
    });
  } else if (testCount > 100) {
    const benefit = 0.07;
    riskScore -= benefit;
    factors.push({
      feature_name: 'test_density_ratio',
      impact: -7.0,
      description: `Comprehensive suite of ${testCount} automated test assertions provides regression coverage.`,
      direction: 'decreases_risk',
    });
  }

  // 5. Service criticality
  if (input.service.includes('auth') || input.service.includes('payment') || input.service.includes('billing')) {
    const penalty = 0.14;
    riskScore += penalty;
    factors.push({
      feature_name: 'tier1_service_criticality',
      impact: 14.0,
      description: `Tier-1 critical service (${input.service}) with strict compliance and zero-downtime constraints.`,
      direction: 'increases_risk',
    });
  }

  // 6. Historical baseline influence
  if (histRate > 25) {
    const penalty = 0.12;
    riskScore += penalty;
    factors.push({
      feature_name: 'historical_service_failure_rate',
      impact: 12.0,
      description: `Historical pipeline failure rate of ${histRate.toFixed(1)}% exceeds team baseline median.`,
      direction: 'increases_risk',
    });
  }

  // Bound probability between 0.015 and 0.965
  const failureProbability = Math.max(0.015, Math.min(0.965, riskScore));

  let riskLevel: RiskLevel = 'LOW';
  if (failureProbability > 0.70) {
    riskLevel = 'HIGH';
  } else if (failureProbability > 0.35) {
    riskLevel = 'MEDIUM';
  }

  const roundedPct = (failureProbability * 100).toFixed(1);

  const topFactorNames = factors.map(f => f.feature_name.replace(/_/g, ' ')).slice(0, 3).join('; ');
  const explanation = `Risk evaluated as ${riskLevel} (${roundedPct}%). Key drivers: ${topFactorNames || 'Test coverage stability; Branch policy risk weighting'}.`;

  const randomHash = Math.random().toString(36).substring(2, 8);

  return {
    id: `pred-${Math.floor(1000 + Math.random() * 9000)}`,
    repo_name: input.repo_name,
    branch: input.branch,
    commit_sha: randomHash,
    commit_message: `Update ${input.service} pipeline specs`,
    author: 'devops-lead',
    failure_probability: failureProbability,
    risk_level: riskLevel,
    top_factors: factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 4),
    model_version: 'xgb-2026.09-v1',
    explanation,
    created_at: new Date().toISOString(),
    metrics: {
      files_changed: input.files_changed,
      lines_added: input.lines_added,
      lines_deleted: input.lines_deleted,
      test_coverage: input.test_coverage,
      test_count: input.test_count,
      dependency_changed: input.dependency_changed,
      service: input.service,
      historical_failure_rate: input.historical_failure_rate,
    },
  };
}

/**
 * Predict failure risk endpoint: POST ${API_BASE_URL}/api/v1/predictions
 * If API is not configured or request fails, falls back gracefully to local ML engine.
 */
export async function predictFailureRisk(
  payload: PredictionRequest
): Promise<{
  data: PredictionResponse;
  isFallback: boolean;
  error?: string;
}> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    // API not configured -> fallback to deterministic local ML engine
    const result = simulateLocalPrediction(payload);
    return {
      data: result,
      isFallback: true,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${baseUrl}/api/v1/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}: ${response.statusText}`);
    }

    const liveData: PredictionResponse = await response.json();

    // Ensure shape compatibility with fields
    return {
      data: {
        ...liveData,
        repo_name: liveData.repo_name || payload.repo_name,
        branch: liveData.branch || payload.branch,
        top_factors: liveData.top_factors || [],
        created_at: liveData.created_at || new Date().toISOString(),
      },
      isFallback: false,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Prediction request failed';
    // Fall back to local simulator so user experience is never blocked
    const fallbackData = simulateLocalPrediction(payload);
    return {
      data: fallbackData,
      isFallback: true,
      error: errorMsg,
    };
  }
}
