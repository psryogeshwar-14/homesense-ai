import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { RecommendationsView } from './components/RecommendationsView';
import { EnergyAnalyticsView } from './components/EnergyAnalyticsView';
import { SimulatorView } from './components/SimulatorView';
import { TimelineView } from './components/TimelineView';
import { AssistantDrawer } from './components/AssistantDrawer';
import { PrivacyPanel } from './components/PrivacyPanel';
import { DemoTourModal } from './components/DemoTourModal';

import { api, socket } from './services/api';
import { DashboardData, Recommendation, TimelineEvent } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Modals
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Load all initial data
  const loadData = async () => {
    try {
      const [dash, recs, events] = await Promise.all([
        api.getDashboard(),
        api.getRecommendations(),
        api.getEvents(),
      ]);
      setDashboardData(dash);
      setRecommendations(recs);
      setTimelineEvents(events);
    } catch (err) {
      console.error('Failed to load HomeSense data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Socket.IO event subscriptions for real-time reactivity
    socket.on('connect', () => {
      console.log('Connected to HomeSense AI Live Gateway');
    });

    socket.on('device:updated', () => {
      loadData();
    });

    socket.on('sensor:reading', () => {
      loadData();
    });

    socket.on('anomaly:detected', (anomaly) => {
      console.warn('⚠️ Safety anomaly detected:', anomaly);
      loadData();
    });

    socket.on('recommendation:created', () => {
      loadData();
    });

    socket.on('recommendation:updated', () => {
      loadData();
    });

    socket.on('context:updated', () => {
      loadData();
    });

    socket.on('homeState:updated', () => {
      loadData();
    });

    socket.on('event:created', () => {
      loadData();
    });

    return () => {
      socket.off('device:updated');
      socket.off('sensor:reading');
      socket.off('anomaly:detected');
      socket.off('recommendation:created');
      socket.off('recommendation:updated');
      socket.off('context:updated');
      socket.off('homeState:updated');
      socket.off('event:created');
    };
  }, []);

  // Handlers
  const handleToggleDevice = async (id: string) => {
    try {
      await api.toggleDevice(id);
      loadData();
    } catch (err) {
      console.error('Failed to toggle device:', err);
    }
  };

  const handleApproveRec = async (id: string) => {
    setApprovingId(id);
    try {
      await api.approveRecommendation(id);
      loadData();
    } catch (err) {
      console.error('Failed to approve recommendation:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectRec = async (id: string) => {
    try {
      await api.rejectRecommendation(id);
      loadData();
    } catch (err) {
      console.error('Failed to reject recommendation:', err);
    }
  };

  const handleUpdateMode = async (mode: string, isOccupied?: boolean) => {
    try {
      await api.updateHomeMode(mode, isOccupied);
      loadData();
    } catch (err) {
      console.error('Failed to update home mode:', err);
    }
  };

  const handleSendSensorReading = async (
    roomId: string,
    sensorType: string,
    value: number,
    unit: string
  ) => {
    try {
      await api.sendSensorReading(roomId, sensorType, value, unit);
      loadData();
    } catch (err) {
      console.error('Failed to send sensor reading:', err);
    }
  };

  const handleRunScenario = async (scenarioId: string) => {
    try {
      await api.runScenario(scenarioId);
      loadData();
    } catch (err) {
      console.error('Failed to run scenario:', err);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse flex items-center justify-center shadow-lg shadow-indigo-600/50">
          <span className="text-xl">🏠</span>
        </div>
        <div className="text-sm font-semibold tracking-wide text-slate-300">
          Starting HomeSense AI Decision Engine...
        </div>
        <div className="text-xs text-slate-500">Connecting to local edge telemetry</div>
      </div>
    );
  }

  const pendingRecsCount = recommendations.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        homeState={dashboardData.homeState}
        onUpdateMode={handleUpdateMode}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        anomalyStatus={dashboardData.currentAnomaly}
        pendingRecsCount={pendingRecsCount}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            data={dashboardData}
            onToggleDevice={handleToggleDevice}
            onApproveRec={handleApproveRec}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'recommendations' && (
          <RecommendationsView
            recommendations={recommendations}
            onApprove={handleApproveRec}
            onReject={handleRejectRec}
            approvingId={approvingId}
          />
        )}

        {currentTab === 'energy' && (
          <EnergyAnalyticsView data={dashboardData.energySummary} />
        )}

        {currentTab === 'simulator' && (
          <SimulatorView
            rooms={dashboardData.rooms}
            homeState={dashboardData.homeState}
            onUpdateMode={handleUpdateMode}
            onSendSensorReading={handleSendSensorReading}
            onRunScenario={handleRunScenario}
            onToggleDevice={handleToggleDevice}
          />
        )}

        {currentTab === 'timeline' && <TimelineView events={timelineEvents} />}
      </main>

      {/* Modals & Drawers */}
      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onActionExecuted={loadData}
      />

      <PrivacyPanel
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <DemoTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          loadData();
        }}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onRefreshData={loadData}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-xs text-slate-500">
        HomeSense AI • Privacy-First Smart Home Intelligence Layer • Local Edge Processing & Human-in-the-Loop Automation
      </footer>
    </div>
  );
}

export default App;
