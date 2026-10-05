import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Play,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenAssistant: () => void;
  onOpenPrivacy: () => void;
  onRefreshData: () => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenAssistant,
  onOpenPrivacy,
  onRefreshData,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [executing, setExecuting] = useState(false);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: 'Baseline Normal Home Conditions',
      description:
        'Start at the Home Dashboard. Show normal room states, standard power consumption (100-300W), and a clear anomaly status.',
      targetTab: 'dashboard',
      actionLabel: 'View Normal Dashboard',
      action: async () => {
        await api.runScenario('reset');
        onNavigateTab('dashboard');
        onRefreshData();
      },
    },
    {
      step: 2,
      title: 'Mark House as Empty (Away Mode)',
      description:
        'Switch the home occupancy mode to AWAY. The system adapts its context engine to expect zero occupant activity.',
      targetTab: 'dashboard',
      actionLabel: 'Set Away Mode',
      action: async () => {
        await api.updateHomeMode('AWAY', false);
        onRefreshData();
      },
    },
    {
      step: 3,
      title: 'Simulate Kitchen Motion in Empty House',
      description:
        'Inject unexpected motion in the kitchen while the house is marked empty. This initiates tabular outlier scoring.',
      targetTab: 'simulator',
      actionLabel: 'Inject Kitchen Motion',
      action: async () => {
        const rooms = await api.getRooms();
        const kitchen = rooms.find((r: any) => r.name.includes('Kitchen'));
        if (kitchen) {
          await api.sendSensorReading(kitchen.id, 'MOTION', 1, 'bool');
        }
        onNavigateTab('dashboard');
        onRefreshData();
      },
    },
    {
      step: 4,
      title: 'High-Power Load & Door Open Spike',
      description:
        'Simulate a high-power appliance turning on (1500W Smart Plug) and the main entrance opening.',
      targetTab: 'dashboard',
      actionLabel: 'Trigger Load & Door Spike',
      action: async () => {
        await api.runScenario('empty_house_anomaly');
        onNavigateTab('dashboard');
        onRefreshData();
      },
    },
    {
      step: 5,
      title: 'Anomaly Alert & Explainable Recommendation',
      description:
        'Examine the High Anomaly security alert (score 96%) and view the AI explainable recommendation generated in the queue.',
      targetTab: 'recommendations',
      actionLabel: 'Review AI Recommendations',
      action: async () => {
        onNavigateTab('recommendations');
        onRefreshData();
      },
    },
    {
      step: 6,
      title: 'Ask AI Assistant for Study Session Routine',
      description:
        'Launch the natural-language assistant and ask: "Prepare the study room for a 45-minute session".',
      targetTab: 'dashboard',
      actionLabel: 'Launch AI Assistant',
      action: async () => {
        onOpenAssistant();
      },
    },
    {
      step: 7,
      title: 'Inspect Structured Action Plan',
      description:
        'Observe how the AI produces a structured, bounded action plan (Study light 70%, TV off, fan medium) without arbitrary execution.',
      targetTab: 'dashboard',
      actionLabel: 'Ready for Review',
      action: async () => {
        onOpenAssistant();
      },
    },
    {
      step: 8,
      title: 'Approve Actions (Human-in-the-Loop)',
      description:
        'Click "Approve & Execute Actions" in the assistant drawer. The backend checks device existence, validates actions, and applies states.',
      targetTab: 'dashboard',
      actionLabel: 'Verify Approval in Drawer',
      action: async () => {
        onOpenAssistant();
      },
    },
    {
      step: 9,
      title: 'Verify Updated Device States',
      description:
        'Return to the Dashboard or Simulator. The study desk light is at 70%, television is OFF, and fan is running at medium speed.',
      targetTab: 'dashboard',
      actionLabel: 'View Updated Devices',
      action: async () => {
        onNavigateTab('dashboard');
        onRefreshData();
      },
    },
    {
      step: 10,
      title: 'Inspect Energy Dashboard & Savings',
      description:
        'Open the Energy Analytics tab. View the 24h load curve, 7-day baseline comparison, and projected ₹ monthly savings.',
      targetTab: 'energy',
      actionLabel: 'View Energy Analytics',
      action: async () => {
        onNavigateTab('energy');
        onRefreshData();
      },
    },
    {
      step: 11,
      title: 'Privacy & Edge Computing Overview',
      description:
        'Review the privacy panel: 0 bytes sent to public clouds, offline resiliency, sub-15ms local edge decision latency, and Matter standard readiness.',
      targetTab: 'dashboard',
      actionLabel: 'Open Privacy Architecture',
      action: async () => {
        onOpenPrivacy();
      },
    },
  ];

  const currentStep = demoSteps[currentStepIndex];

  const handleExecute = async () => {
    setExecuting(true);
    try {
      await currentStep.action();
    } catch (err) {
      console.error('Error executing demo step:', err);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-xl w-full bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl p-6 relative space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Hackathon 11-Step Demo Script</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                  Step {currentStep.step} / 11
                </span>
              </h3>
              <p className="text-xs text-slate-400">Step-by-step walkthrough matching your presentation pitch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-amber-500 h-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / demoSteps.length) * 100}%` }}
          />
        </div>

        {/* Current Step Content */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
              Step {currentStep.step} Goal:
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              Target View: {currentStep.targetTab.toUpperCase()}
            </span>
          </div>

          <h4 className="text-base font-bold text-white">{currentStep.title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{currentStep.description}</p>

          <button
            onClick={handleExecute}
            disabled={executing}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            {executing ? (
              <span className="animate-spin text-sm">⏳</span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Execute: {currentStep.actionLabel}</span>
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-[11px] text-slate-500">
            {currentStepIndex + 1} of {demoSteps.length}
          </span>

          <button
            onClick={() => setCurrentStepIndex((prev) => Math.min(demoSteps.length - 1, prev + 1))}
            disabled={currentStepIndex === demoSteps.length - 1}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-md shadow-indigo-600/20"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
