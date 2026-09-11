import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, FailureAlert, PredictionResponse, RepositoryConfig } from './types';
import {
  INITIAL_PREDICTIONS,
  INITIAL_ALERTS,
  PIPELINE_RUN_TRENDS,
  DEFAULT_REPOSITORY_CONFIG,
} from './data/mockData';
import { checkApiHealth, isApiConfigured } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { SimulatorView } from './components/SimulatorView';
import { PredictionsView } from './components/PredictionsView';
import { AlertsView } from './components/AlertsView';
import { RepositoryView } from './components/RepositoryView';
import { PerformanceView } from './components/PerformanceView';
import { WorkflowDocsView } from './components/WorkflowDocsView';
import { PredictionDetailModal } from './components/PredictionDetailModal';
import { ApiConfigModal } from './components/ApiConfigModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedRepo, setSelectedRepo] = useState<string>('acme-corp/payment-service');
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [predictions, setPredictions] = useState<PredictionResponse[]>(INITIAL_PREDICTIONS);
  const [alerts, setAlerts] = useState<FailureAlert[]>(INITIAL_ALERTS);
  const [repoConfig, setRepoConfig] = useState<RepositoryConfig>(DEFAULT_REPOSITORY_CONFIG);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionResponse | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // API Health status
  const [apiStatus, setApiStatus] = useState<{
    isOnline: boolean;
    isConfigured: boolean;
    isChecking: boolean;
    latencyMs?: number;
  }>({
    isOnline: false,
    isConfigured: isApiConfigured(),
    isChecking: false,
  });

  // Health check function
  const refreshHealth = useCallback(async () => {
    setApiStatus((prev) => ({
      ...prev,
      isChecking: true,
      isConfigured: isApiConfigured(),
    }));

    const result = await checkApiHealth();

    setApiStatus({
      isOnline: result.isOnline,
      isConfigured: isApiConfigured(),
      isChecking: false,
      latencyMs: result.latencyMs,
    });
  }, []);

  useEffect(() => {
    refreshHealth();
    // Periodically ping health check if configured
    const interval = setInterval(() => {
      if (isApiConfigured()) {
        refreshHealth();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshHealth]);

  // When a prediction is completed in the simulator
  const handlePredictionCompleted = (newPred: PredictionResponse) => {
    // Add to predictions list
    setPredictions((prev) => [newPred, ...prev]);

    // If HIGH risk, automatically trigger a Failure Alert
    if (newPred.risk_level === 'HIGH') {
      const newAlert: FailureAlert = {
        id: `alert-${Date.now().toString().slice(-4)}`,
        prediction_id: newPred.id,
        repo_name: newPred.repo_name || selectedRepo,
        branch: newPred.branch || selectedBranch,
        commit_sha: newPred.commit_sha || 'HEAD',
        author: newPred.author || 'devops-lead',
        failure_probability: newPred.failure_probability,
        risk_level: 'HIGH',
        detected_at: newPred.created_at,
        service: newPred.metrics?.service || 'core-service',
        reason:
          newPred.explanation ||
          'High regression probability detected. Significant diff churn with test coverage deficit.',
        recommended_action:
          'Manual approval required. Risk Gate has suspended downstream deployment pipeline.',
        status: 'active',
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
  };

  const handleUpdateAlertStatus = (
    alertId: string,
    status: 'active' | 'acknowledged' | 'resolved' | 'overridden'
  ) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status } : a))
    );
  };

  // Compute active alert count for badge in sidebar
  const activeAlertCount = alerts.filter((a) => a.status === 'active').length;

  const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'CI/CD Failure Risk Dashboard',
      subtitle: 'Real-time pre-merge pipeline risk intelligence and ML decision gating',
    },
    simulator: {
      title: 'Pipeline Metric Risk Simulator',
      subtitle: 'Simulate pending branch changes against trained failure prediction models',
    },
    predictions: {
      title: 'Prediction Logs & Audit History',
      subtitle: 'Detailed inference records across all repositories and branch runs',
    },
    alerts: {
      title: 'Failure Alerts & Gate Interceptions',
      subtitle: 'High-risk deployments blocked by automated Risk Gate policies',
    },
    repository: {
      title: 'Repository & Threshold Settings',
      subtitle: 'Configure target branch policies, backend endpoints, and gating limits',
    },
    performance: {
      title: 'Model Validation & Telemetry',
      subtitle: 'Accuracy, ROC-AUC, precision-recall, and SHAP factor attribution',
    },
    workflow: {
      title: 'GitHub Actions Integration & Workflow Docs',
      subtitle: 'Architecture diagrams, policy specifications, and automated workflow scripts',
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex antialiased selection:bg-indigo-600 selection:text-white">
      {/* Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiStatus={apiStatus}
        modelVersion={repoConfig.model_version}
        activeAlertCount={activeAlertCount}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        onOpenApiConfig={() => setIsApiModalOpen(true)}
        onRefreshHealth={refreshHealth}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Header */}
        <Header
          title={tabTitles[activeTab].title}
          subtitle={tabTitles[activeTab].subtitle}
          selectedRepo={selectedRepo}
          setSelectedRepo={setSelectedRepo}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          apiStatus={apiStatus}
          onOpenSimulator={() => setActiveTab('simulator')}
          onOpenApiConfig={() => setIsApiModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Dynamic Page Views */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewView
              predictions={predictions}
              trendData={PIPELINE_RUN_TRENDS}
              onSelectPrediction={(p) => setSelectedPrediction(p)}
              onOpenSimulator={() => setActiveTab('simulator')}
              onNavigateToPredictions={() => setActiveTab('predictions')}
              onNavigateToAlerts={() => setActiveTab('alerts')}
            />
          )}

          {activeTab === 'simulator' && (
            <SimulatorView
              onPredictionCompleted={handlePredictionCompleted}
              onOpenDetailModal={(p) => setSelectedPrediction(p)}
              apiStatus={apiStatus}
            />
          )}

          {activeTab === 'predictions' && (
            <PredictionsView
              predictions={predictions}
              onSelectPrediction={(p) => setSelectedPrediction(p)}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              predictions={predictions}
              onSelectPrediction={(p) => setSelectedPrediction(p)}
              onUpdateAlertStatus={handleUpdateAlertStatus}
            />
          )}

          {activeTab === 'repository' && (
            <RepositoryView
              config={repoConfig}
              onSaveConfig={(updated) => setRepoConfig(updated)}
              onRefreshHealth={refreshHealth}
            />
          )}

          {activeTab === 'performance' && <PerformanceView />}

          {activeTab === 'workflow' && <WorkflowDocsView />}
        </main>
      </div>

      {/* Prediction Detail Modal */}
      <PredictionDetailModal
        prediction={selectedPrediction}
        onClose={() => setSelectedPrediction(null)}
        onReSimulate={() => {
          setActiveTab('simulator');
        }}
      />

      {/* API Configuration Modal */}
      <ApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onStatusChanged={refreshHealth}
      />
    </div>
  );
}
