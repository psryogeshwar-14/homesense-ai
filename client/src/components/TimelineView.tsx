import React from 'react';
import {
  Clock,
  Activity,
  Sparkles,
  CheckCircle2,
  Zap,
  ShieldAlert,
  Sliders,
  Filter,
} from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelineViewProps {
  events: TimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'SENSOR':
        return <Activity className="w-3.5 h-3.5" />;
      case 'AI_DETECTION':
        return <ShieldAlert className="w-3.5 h-3.5" />;
      case 'SUGGESTION':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'USER_APPROVAL':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'DEVICE_ACTION':
        return <Zap className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'AI_DETECTION':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'USER_APPROVAL':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'SUGGESTION':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'SENSOR':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'DEVICE_ACTION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span>Explainable Home Timeline</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Auditable chronological log of sensor events, AI reasoning, suggestions, and human approvals.
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 relative">
        {events.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No events recorded yet. Perform actions or trigger the simulator to see timeline activity.
          </div>
        ) : (
          <div className="relative border-l border-white/10 ml-4 space-y-6">
            {events.map((ev) => (
              <div key={ev.id} className="relative pl-6 group">
                {/* Node Dot */}
                <div
                  className={`absolute -left-2.5 top-1 w-5 h-5 rounded-full flex items-center justify-center border shadow-sm ${getBadgeStyle(
                    ev.type
                  )}`}
                >
                  {getBadgeIcon(ev.type)}
                </div>

                {/* Event Content */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{ev.title}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider border ${getBadgeStyle(
                          ev.type
                        )}`}
                      >
                        {ev.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(ev.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-1">{ev.details}</p>

                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                    <span>Zone: {ev.roomName}</span>
                    <span>•</span>
                    <span>{ev.approved ? 'Authorized' : 'Unconfirmed'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
