import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Zap,
  TrendingDown,
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Recommendation } from '../types';

interface RecommendationsViewProps {
  recommendations: Recommendation[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  approvingId?: string | null;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  onApprove,
  onReject,
  approvingId,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ENERGY' | 'SAFETY' | 'HISTORY'>('ALL');

  const pendingList = recommendations.filter((r) => r.status === 'PENDING');
  const historyList = recommendations.filter((r) => r.status !== 'PENDING');

  const filteredList =
    filter === 'HISTORY'
      ? historyList
      : filter === 'ALL'
      ? pendingList
      : pendingList.filter((r) => r.category === filter);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Context-Aware AI Recommendations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Explainable smart-home recommendations backed by multi-signal context and human approval guardrails.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({pendingList.length})
          </button>
          <button
            onClick={() => setFilter('ENERGY')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'ENERGY'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Energy
          </button>
          <button
            onClick={() => setFilter('SAFETY')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'SAFETY'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Safety
          </button>
          <button
            onClick={() => setFilter('HISTORY')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'HISTORY'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            History ({historyList.length})
          </button>
        </div>
      </div>

      {/* Recommendations List */}
      {filteredList.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No pending recommendations</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Your home is running at optimal efficiency. Trigger simulator events to see real-time AI suggestions!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredList.map((rec) => {
            const isPending = rec.status === 'PENDING';
            const isApproving = approvingId === rec.id;

            return (
              <div
                key={rec.id}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  rec.category === 'SAFETY'
                    ? 'border-rose-500/30 hover:border-rose-500/50 bg-rose-950/10'
                    : 'border-indigo-500/20 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rec.category === 'SAFETY'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {rec.category}
                      </span>

                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {/* Confidence Score Pill */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {Math.round(rec.confidence * 100)}% Confidence
                      </span>

                      {rec.savingsEst && rec.savingsEst > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Est. ₹{rec.savingsEst}/month savings
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">{rec.title}</h3>

                    {/* Explainable Reasoning Block */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300 flex items-start gap-2">
                      <Info className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-indigo-300 text-[11px] mb-0.5">
                          AI Context & Reasoning:
                        </div>
                        <p>{rec.reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Approval Workflow */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-center gap-2 min-w-[200px]">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => onApprove(rec.id)}
                          disabled={isApproving}
                          className="w-full sm:w-auto lg:w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                        >
                          {isApproving ? (
                            <span className="inline-block animate-spin">⏳</span>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span>Approve Action</span>
                        </button>

                        <button
                          onClick={() => onReject(rec.id)}
                          disabled={isApproving}
                          className="w-full sm:w-auto lg:w-full px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 border border-white/5 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Dismiss</span>
                        </button>
                      </>
                    ) : (
                      <div
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                          rec.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {rec.status === 'APPROVED' ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span>Action Executed & Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-slate-400" />
                            <span>Dismissed</span>
                          </>
                        )}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-400" />
                      <span>Protected by 7-Step Backend Checklist</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Engine Architecture Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Why Multi-Signal Context Trumps Basic Rule Engines</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 mt-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="font-semibold text-rose-400 block mb-1">❌ Traditional Dumb Automation:</span>
            <p>
              "If motion is detected, turn on light." Doesn't care if you just fell asleep, if daylight is streaming in, or if electricity tariffs are at peak rates.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="font-semibold text-emerald-400 block mb-1">✅ HomeSense AI Context Engine:</span>
            <p>
              Combines room occupancy + time of day + historical usage curve + power wattage + human approval to ensure zero false triggers and tangible energy savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
