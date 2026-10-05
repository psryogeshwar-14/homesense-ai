import React from 'react';
import {
  Zap,
  Power,
  Thermometer,
  Droplets,
  AlertOctagon,
  CheckCircle2,
  Tv,
  Wind,
  Lightbulb,
  Radio,
  DoorClosed,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { DashboardData, Device, Room, Recommendation } from '../types';

interface DashboardViewProps {
  data: DashboardData;
  onToggleDevice: (id: string) => void;
  onApproveRec: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onToggleDevice,
  onApproveRec,
  onNavigateToTab,
}) => {
  const {
    rooms,
    activeDevicesCount,
    totalDevicesCount,
    currentPowerWatts,
    currentAnomaly,
    energySummary,
  } = data;

  const topPendingRec = data.rooms
    .flatMap(() => []) // placeholder
    .concat(); // to fetch later or passed from parent

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'LIGHT':
        return <Lightbulb className="w-4 h-4" />;
      case 'FAN':
        return <Wind className="w-4 h-4" />;
      case 'TV':
        return <Tv className="w-4 h-4" />;
      case 'SMART_PLUG':
        return <Radio className="w-4 h-4" />;
      case 'DOOR':
        return <DoorClosed className="w-4 h-4" />;
      default:
        return <Power className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Real-time power */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Real-Time Power</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {Math.round(currentPowerWatts)}
            </span>
            <span className="text-xs font-semibold text-slate-400">Watts</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>AI Energy Optimizer active</span>
          </div>
        </div>

        {/* Active Devices */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Connected Devices</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Power className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {activeDevicesCount}
            </span>
            <span className="text-xs font-medium text-slate-400">/ {totalDevicesCount} On</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across 4 monitored zones
          </div>
        </div>

        {/* 24h Energy Usage */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">24h Consumption</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {energySummary?.todayKwh ?? 4.2}
            </span>
            <span className="text-xs font-semibold text-slate-400">kWh</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Est. ₹{Math.round((energySummary?.todayKwh ?? 4.2) * 7.5)} today
          </div>
        </div>

        {/* Anomaly & Early Warning */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Safety Anomaly Score</span>
            <div
              className={`p-2 rounded-xl ${
                currentAnomaly.classification === 'HIGH_ANOMALY'
                  ? 'bg-rose-500/20 text-rose-400'
                  : currentAnomaly.classification === 'REVIEW'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {currentAnomaly.classification === 'HIGH_ANOMALY' ? (
                <AlertOctagon className="w-4 h-4 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl lg:text-3xl font-bold tracking-tight ${
                currentAnomaly.classification === 'HIGH_ANOMALY'
                  ? 'text-rose-400'
                  : currentAnomaly.classification === 'REVIEW'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {(currentAnomaly.score * 100).toFixed(0)}%
            </span>
            <span className="text-xs font-medium text-slate-400 capitalize">
              {currentAnomaly.classification.replace('_', ' ').toLowerCase()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 truncate">
            {currentAnomaly.isAnomaly ? currentAnomaly.reasons[0] || 'Unusual condition detected' : 'Tabular Isolation Baseline Normal'}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Room Zones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Monitored Room Zones</h2>
            <p className="text-xs text-slate-400">Real-time occupancy, environmental readings, and connected devices</p>
          </div>
          <button
            onClick={() => onNavigateToTab('simulator')}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>Simulate Sensor Events</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => {
            const motionReading = room.readings.find((r) => r.sensorType === 'MOTION');
            const tempReading = room.readings.find((r) => r.sensorType === 'TEMPERATURE');
            const humidityReading = room.readings.find((r) => r.sensorType === 'HUMIDITY');
            const isOccupied = motionReading ? motionReading.value === 1 : false;

            const roomActiveDevices = room.devices.filter((d) => d.powerState);
            const roomWatts = roomActiveDevices.reduce((sum, d) => sum + d.powerWatts, 0);

            return (
              <div
                key={room.id}
                className="glass-panel p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Room Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-base text-white">{room.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            isOccupied
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOccupied ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                            }`}
                          />
                          {isOccupied ? 'Occupied' : 'Vacant'}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {roomWatts} W active
                        </span>
                      </div>
                    </div>

                    {/* Climate Readings */}
                    <div className="flex items-center gap-3 text-xs bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                        <span>{tempReading ? tempReading.value.toFixed(1) : '24.0'}°C</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Droplets className="w-3.5 h-3.5 text-sky-400" />
                        <span>{humidityReading ? Math.round(humidityReading.value) : '50'}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Devices in Room */}
                  <div className="space-y-2 mt-4">
                    {room.devices.map((device) => {
                      return (
                        <div
                          key={device.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                            device.powerState
                              ? 'bg-indigo-950/20 border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                              : 'bg-slate-900/40 border-white/5 opacity-70'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                device.powerState
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {getDeviceIcon(device.type)}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white">
                                {device.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {device.powerState ? `${device.powerWatts}W active` : 'Standby / Off'}
                                {device.brightness !== undefined && device.powerState && (
                                  <span className="ml-1 text-indigo-300 font-mono">• {device.brightness}%</span>
                                )}
                                {device.speed && device.powerState && (
                                  <span className="ml-1 text-emerald-300 font-mono capitalize">• {device.speed}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 1-Click Toggle Switch */}
                          <button
                            onClick={() => onToggleDevice(device.id)}
                            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                              device.powerState ? 'bg-indigo-600' : 'bg-slate-700'
                            }`}
                            aria-label={`Toggle ${device.name}`}
                          >
                            <span
                              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                                device.powerState ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Room Footer Status */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Room ID: {room.id.slice(-6)}</span>
                  <span>{room.devices.length} Connected Appliances</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
