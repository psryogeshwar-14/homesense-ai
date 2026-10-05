import React, { useState } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Shield,
  Activity,
  DoorOpen,
  Thermometer,
  Zap,
  Wind,
  CheckCircle,
} from 'lucide-react';
import { Room, Device, HomeState } from '../types';

interface SimulatorViewProps {
  rooms: Room[];
  homeState: HomeState;
  onUpdateMode: (mode: string, isOccupied?: boolean) => void;
  onSendSensorReading: (roomId: string, sensorType: string, value: number, unit: string) => void;
  onRunScenario: (scenarioId: string) => void;
  onToggleDevice: (id: string) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  rooms,
  homeState,
  onUpdateMode,
  onSendSensorReading,
  onRunScenario,
  onToggleDevice,
}) => {
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ [roomId: string]: number }>({});

  const handleScenario = async (id: string) => {
    setRunningScenario(id);
    await onRunScenario(id);
    setTimeout(() => setRunningScenario(null), 800);
  };

  const handleTempChange = (roomId: string, val: number) => {
    setTempValues((prev) => ({ ...prev, [roomId]: val }));
    onSendSensorReading(roomId, 'TEMPERATURE', val, '°C');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>Interactive IoT & Device Simulator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test and demonstrate context-aware intelligence, safety anomaly detection, and energy optimization without physical hardware.
          </p>
        </div>

        <button
          onClick={() => handleScenario('reset')}
          disabled={runningScenario !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Home Baseline</span>
        </button>
      </div>

      {/* Preset 1-Click Demo Scenarios */}
      <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-indigo-400 uppercase">
              Hackathon Demo Scenarios
            </span>
            <h3 className="text-base font-bold text-white">One-Click Demonstration Flows</h3>
          </div>
          <span className="text-xs text-slate-400">Instantly triggers multi-signal situations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scenario A: Empty House Anomaly */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-rose-950/20 to-slate-900/80 border border-rose-500/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-rose-400 text-xs font-bold mb-1">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Scenario A
                </span>
                <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded">High Anomaly</span>
              </div>
              <h4 className="font-bold text-sm text-white">Empty House Security & Load Spike</h4>
              <p className="text-xs text-slate-400 mt-1">
                Marks home EMPTY, triggers Kitchen motion, opens main door, and switches on heavy 1500W load. Demonstrates early warning system.
              </p>
            </div>
            <button
              onClick={() => handleScenario('empty_house_anomaly')}
              disabled={runningScenario !== null}
              className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/25 transition-all"
            >
              {runningScenario === 'empty_house_anomaly' ? (
                <span className="animate-spin text-sm">⏳</span>
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Trigger Anomaly Alert</span>
            </button>
          </div>

          {/* Scenario B: Study Session Routine */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-indigo-950/20 to-slate-900/80 border border-indigo-500/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-indigo-400 text-xs font-bold mb-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> Scenario B
                </span>
                <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded">Focus Routine</span>
              </div>
              <h4 className="font-bold text-sm text-white">Study Room Focus Preparation</h4>
              <p className="text-xs text-slate-400 mt-1">
                Simulates presence in study room. Ready for natural-language command: "Prepare the study room for a 45-minute session".
              </p>
            </div>
            <button
              onClick={() => handleScenario('study_routine')}
              disabled={runningScenario !== null}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all"
            >
              {runningScenario === 'study_routine' ? (
                <span className="animate-spin text-sm">⏳</span>
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Prepare Study Session</span>
            </button>
          </div>

          {/* Scenario C: Nighttime Unused Fan */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-amber-950/20 to-slate-900/80 border border-amber-500/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-amber-400 text-xs font-bold mb-1">
                <span className="flex items-center gap-1">
                  <Wind className="w-4 h-4" /> Scenario C
                </span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">Energy Waste</span>
              </div>
              <h4 className="font-bold text-sm text-white">Overnight Unused Fan Waste</h4>
              <p className="text-xs text-slate-400 mt-1">
                Simulates night-time vacancy in bedroom with fan running continuously. Generates ₹140/mo savings recommendation.
              </p>
            </div>
            <button
              onClick={() => handleScenario('night_waste')}
              disabled={runningScenario !== null}
              className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/25 transition-all"
            >
              {runningScenario === 'night_waste' ? (
                <span className="animate-spin text-sm">⏳</span>
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Simulate Energy Waste</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Hardware Simulation Matrix */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">Live Sensor & Actuator Matrix</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => {
            const motion = room.readings.find((r) => r.sensorType === 'MOTION');
            const temp = room.readings.find((r) => r.sensorType === 'TEMPERATURE');
            const door = room.readings.find((r) => r.sensorType === 'DOOR');
            const isMotionActive = motion ? motion.value === 1 : false;
            const isDoorOpen = door ? door.value === 1 : false;
            const currentTemp = tempValues[room.id] !== undefined ? tempValues[room.id] : (temp ? temp.value : 24.0);

            return (
              <div key={room.id} className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h4 className="font-bold text-sm text-white">{room.name}</h4>
                  <span className="text-xs text-slate-400 font-mono">Sensors Live</span>
                </div>

                {/* Motion Sensor Button */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex items-center gap-2">
                    <Activity className={`w-4 h-4 ${isMotionActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-semibold text-white">PIR Motion Sensor</div>
                      <div className="text-[10px] text-slate-400">{isMotionActive ? 'Movement Detected' : 'No Movement'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onSendSensorReading(room.id, 'MOTION', isMotionActive ? 0 : 1, 'bool')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isMotionActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isMotionActive ? 'Clear Motion' : 'Trigger Motion'}
                  </button>
                </div>

                {/* Door Sensor (If Kitchen & Entrance) */}
                {room.name.includes('Kitchen') && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
                    <div className="flex items-center gap-2">
                      <DoorOpen className={`w-4 h-4 ${isDoorOpen ? 'text-rose-400' : 'text-slate-500'}`} />
                      <div>
                        <div className="text-xs font-semibold text-white">Main Entrance Sensor</div>
                        <div className="text-[10px] text-slate-400">{isDoorOpen ? 'Door Opened!' : 'Door Closed'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onSendSensorReading(room.id, 'DOOR', isDoorOpen ? 0 : 1, 'bool')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isDoorOpen
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isDoorOpen ? 'Close Door' : 'Open Door'}
                    </button>
                  </div>
                )}

                {/* Temperature Slider */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                      Ambient Temperature
                    </span>
                    <span className={`font-mono font-bold ${currentTemp >= 38 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                      {currentTemp.toFixed(1)}°C {currentTemp >= 38 && '(Thermal Alert!)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="48"
                    step="0.5"
                    value={currentTemp}
                    onChange={(e) => handleTempChange(room.id, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>18°C Cool</span>
                    <span>24°C Normal</span>
                    <span>45°C Fire Risk</span>
                  </div>
                </div>

                {/* Quick Device Toggles */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 block">Room Devices:</span>
                  <div className="flex flex-wrap gap-2">
                    {room.devices.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => onToggleDevice(d.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all border ${
                          d.powerState
                            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-sm'
                            : 'bg-slate-800/60 text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        <Zap className={`w-3 h-3 ${d.powerState ? 'text-indigo-400 fill-current' : 'text-slate-500'}`} />
                        <span>{d.name.split(' ')[1] || d.name}</span>
                        <span className="font-mono text-[10px] opacity-75">({d.powerWatts}W)</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
