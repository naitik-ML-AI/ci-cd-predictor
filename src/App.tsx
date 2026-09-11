import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, FailureAlert, PredictionResponse, RepositoryConfig } from './types';
import {
  INITIAL_PREDICTIONS,
  INITIAL_ALERTS,
  DEFAULT_REPOSITORY_CONFIG,
} from './data/mockData';
import { checkApiHealth, isApiConfigured } from './services/api';
import { Header } from './components/Header';
import { PredictionsView } from './components/PredictionsView';
import { SimulatorView } from './components/SimulatorView';
import { AlertsView } from './components/AlertsView';
import { PerformanceView } from './components/PerformanceView';
import { RepositoryView } from './components/RepositoryView';
import { WorkflowDocsView } from './components/WorkflowDocsView';
import { PredictionDetailModal } from './components/PredictionDetailModal';
import { ApiConfigModal } from './components/ApiConfigModal';

export default function App() {
  // Default to predictions tab, matching user reference image
  const [activeTab, setActiveTab] = useState<ActiveTab>('predictions');
  const [predictions, setPredictions] = useState<PredictionResponse[]>(INITIAL_PREDICTIONS);
  const [alerts, setAlerts] = useState<FailureAlert[]>(INITIAL_ALERTS);
  const [repoConfig, setRepoConfig] = useState<RepositoryConfig>(DEFAULT_REPOSITORY_CONFIG);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionResponse | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);

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
        repo_name: newPred.repo_name || 'payment-service',
        branch: newPred.branch || 'main',
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

  const handleNotifyTeam = (
    alertIds: string[],
    details: { channel: string; note: string; urgency: string }
  ) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (alertIds.includes(a.id)) {
          return {
            ...a,
            team_notified: {
              channel: details.channel,
              timestamp: 'Just now',
              note: details.note,
            },
          };
        }
        return a;
      })
    );
  };

  // Compute active alert count for badge in header
  const activeAlertCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation Bar - Exact layout matching photo */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiStatus={apiStatus}
        activeAlertCount={activeAlertCount}
        onOpenSimulator={() => setActiveTab('simulator')}
        onOpenApiConfig={() => setIsApiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {activeTab === 'predictions' && (
          <PredictionsView
            predictions={predictions}
            onSelectPrediction={(p) => setSelectedPrediction(p)}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView
            onPredictionCompleted={handlePredictionCompleted}
            onOpenDetailModal={(p) => setSelectedPrediction(p)}
            apiStatus={apiStatus}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            predictions={predictions}
            onSelectPrediction={(p) => setSelectedPrediction(p)}
            onUpdateAlertStatus={handleUpdateAlertStatus}
            onNotifyTeam={handleNotifyTeam}
          />
        )}

        {activeTab === 'performance' && <PerformanceView />}

        {activeTab === 'repository' && (
          <RepositoryView
            config={repoConfig}
            onSaveConfig={(updated) => setRepoConfig(updated)}
            onRefreshHealth={refreshHealth}
          />
        )}

        {activeTab === 'workflow' && <WorkflowDocsView />}
      </main>

      {/* Prediction Detail Modal */}
      <PredictionDetailModal
        prediction={selectedPrediction}
        onClose={() => setSelectedPrediction(null)}
        onReSimulate={(p) => {
          setSelectedPrediction(null);
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
