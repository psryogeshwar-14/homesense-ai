import React from 'react';
import { Home, Shield, Sparkles, Bot, AlertTriangle, Moon, Target, ShieldCheck, Sun } from 'lucide-react';
import type { HomeState, AnomalyStatus } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  homeState: HomeState;
  onUpdateMode: (mode: string) => void;
  onOpenAssistant: () => void;
  onOpenPrivacy: () => void;
  onOpenTour: () => void;
  anomalyStatus?: AnomalyStatus;
  pendingRecsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  homeState,
  onUpdateMode,
  onOpenAssistant,
  onOpenTour,
  onOpenPrivacy,
  anomalyStatus,
  pendingRecsCount,
}) => {
  const isHighAnomaly = anomalyStatus?.classification === 'HIGH_ANOMALY';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25">
            <Home className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">HomeSense</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded uppercase">
                AI Layer
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Edge AI Active</span>
              <span className="text-slate-600">•</span>
              <button
                onClick={onOpenPrivacy}
                className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                title="View Privacy Architecture"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>0ms Cloud Leakage</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('recommendations')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
              currentTab === 'recommendations'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            AI Recommendations
            {pendingRecsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold">
                {pendingRecsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('energy')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'energy'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Energy Analytics
          </button>
          <button
            onClick={() => setCurrentTab('simulator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'simulator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Device Simulator
          </button>
          <button
            onClick={() => setCurrentTab('timeline')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Timeline
          </button>
        </nav>

        {/* Right Actions: Home Mode Selector & Demo Tour & Assistant */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => onUpdateMode('HOME')}
              title="Home (Occupied)"
              className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                homeState.mode === 'HOME'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              onClick={() => onUpdateMode('AWAY')}
              title="Away (Empty House)"
              className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                homeState.mode === 'AWAY'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Away</span>
            </button>
            <button
              onClick={() => onUpdateMode('NIGHT')}
              title="Night Mode"
              className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                homeState.mode === 'NIGHT'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Night</span>
            </button>
            <button
              onClick={() => onUpdateMode('FOCUS')}
              title="Study / Focus Routine"
              className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                homeState.mode === 'FOCUS'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Focus</span>
            </button>
          </div>

          {/* 1-Click Demo Tour Button */}
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 shadow-md shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
            title="11-Step Guided Hackathon Demo Tour"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Tour</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Assistant</span>
          </button>
        </div>
      </div>

      {/* Global High Anomaly Alert Strip if active */}
      {isHighAnomaly && (
        <div className="max-w-7xl mx-auto mt-2 px-3 py-2 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-between gap-3 text-xs text-rose-200 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-semibold">Security Alert:</span>
            <span>{anomalyStatus?.reasons?.[0] || 'Unusual motion or power spike detected while house is unoccupied.'}</span>
          </div>
          <button
            onClick={() => setCurrentTab('recommendations')}
            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] whitespace-nowrap transition-colors"
          >
            Review Action Plan
          </button>
        </div>
      )}
    </header>
  );
};
