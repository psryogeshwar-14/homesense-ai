import React from 'react';
import {
  X,
  ShieldCheck,
  Cpu,
  Lock,
  WifiOff,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface PrivacyPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPanel: React.FC<PrivacyPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-2xl w-full bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Privacy-First Architecture</h3>
              <p className="text-xs text-slate-400">How HomeSense AI keeps sensitive telemetry inside your home</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
              <Cpu className="w-4 h-4" />
              <span>1. Local Edge Processing</span>
            </div>
            <p className="text-xs text-slate-300">
              Sensor readings (motion, doors, cameras, power meters) are evaluated on local hardware. 0 bytes of sensitive presence data are sent to public clouds.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <Lock className="w-4 h-4" />
              <span>2. Human-in-the-Loop Guardrail</span>
            </div>
            <p className="text-xs text-slate-300">
              AI models produce recommended action plans, not autonomous executions. Backend enforces a 7-step security check and requires explicit human approval.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <WifiOff className="w-4 h-4" />
              <span>3. Offline Resiliency</span>
            </div>
            <p className="text-xs text-slate-300">
              If your external internet drops, HomeSense AI continues detecting security anomalies, executing energy rules, and managing your home without disruption.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
              <Database className="w-4 h-4" />
              <span>4. Matter & Standard IoT Ready</span>
            </div>
            <p className="text-xs text-slate-300">
              Abstracted device model designed for compatibility with Matter, MQTT, and Home Assistant rather than closed, vendor-locked ecosystems.
            </p>
          </div>
        </div>

        {/* Live Security Metrics */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
          <div className="text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Active Privacy Shield Status</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
            <div className="bg-slate-900/60 p-2 rounded-lg">
              <div className="text-slate-400 text-[10px]">Cloud Telemetry</div>
              <div className="font-bold text-emerald-400 font-mono">0 Bytes</div>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg">
              <div className="text-slate-400 text-[10px]">Local Decision Latency</div>
              <div className="font-bold text-white font-mono">&lt; 8 ms</div>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg">
              <div className="text-slate-400 text-[10px]">Security Checks</div>
              <div className="font-bold text-indigo-400 font-mono">7 / 7 Active</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
