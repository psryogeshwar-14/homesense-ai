import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Zap, IndianRupee, TrendingDown, ArrowDownRight, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { EnergyAnalytics } from '../types';

interface EnergyAnalyticsViewProps {
  data: EnergyAnalytics;
}

export const EnergyAnalyticsView: React.FC<EnergyAnalyticsViewProps> = ({ data }) => {
  const {
    todayKwh,
    predictedNextDayKwh,
    avg7DayKwh,
    estimatedMonthlyBillInr,
    dailyHistory,
    breakdown,
    hourlyData,
    wasteItems,
  } = data;

  const potentialMonthlySavingsInr = wasteItems.reduce((acc, curr) => acc + curr.potentialSavingsInr, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Energy KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Today's Consumption */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Today's Usage</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {todayKwh}
            </span>
            <span className="text-xs font-semibold text-slate-400">kWh</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Current tariff: ₹7.50 / kWh
          </div>
        </div>

        {/* Next-Day AI Prediction */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Tomorrow's AI Forecast</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-emerald-400 tracking-tight">
              {predictedNextDayKwh}
            </span>
            <span className="text-xs font-semibold text-slate-400">kWh</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/80 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Factoring occupancy & weather</span>
          </div>
        </div>

        {/* Projected Monthly Electricity Bill */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Est. Monthly Bill</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              ₹{estimatedMonthlyBillInr}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ mo</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Based on 7-day rolling baseline
          </div>
        </div>

        {/* AI Potential Savings */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Potential Savings</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-emerald-400 tracking-tight">
              ₹{potentialMonthlySavingsInr}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ mo</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400">
            Via context recommendations
          </div>
        </div>
      </div>

      {/* Chart 1: 24-Hour Real-Time Power Curve */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-base text-white tracking-tight">24-Hour Power Demand Curve (Watts)</h3>
            <p className="text-xs text-slate-400">Actual load vs baseline profile & AI predicted curve</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Actual Load
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Predicted Optimal
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actualWattsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="predictedWattsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="actualWatts"
                name="Actual Load (W)"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#actualWattsGrad)"
              />
              <Area
                type="monotone"
                dataKey="predictedWatts"
                name="AI Optimized (W)"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#predictedWattsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row: 7-Day Trend + Appliance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Daily Consumption BarChart */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-bold text-base text-white tracking-tight">7-Day Consumption vs Efficient Baseline</h3>
            <p className="text-xs text-slate-400">Daily kWh compared against HomeSense AI efficiency target</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="consumptionKwh" name="Actual Usage (kWh)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="baselineKwh" name="AI Baseline (kWh)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appliance Breakdown Donut Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-white tracking-tight">Appliance Energy Distribution</h3>
            <p className="text-xs text-slate-400">Share of total electrical consumption</p>

            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            {breakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono text-slate-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Energy Waste Leaks Detector */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5">
        <h3 className="font-bold text-base text-white tracking-tight mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Active Inefficiency & Waste Detections</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Heuristic and tabular outlier analysis of appliances consuming electricity without user presence
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {wasteItems.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="flex items-start justify-between">
                <span className="font-semibold text-xs text-white">{item.appliance}</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Save ₹{item.potentialSavingsInr}/mo
                </span>
              </div>
              <div className="text-[11px] text-amber-300/90 font-medium">
                Issue: {item.status}
              </div>
              <div className="text-xs text-slate-400">
                {item.suggestion}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
