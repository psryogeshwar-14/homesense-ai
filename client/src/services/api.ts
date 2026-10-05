import { io, Socket } from 'socket.io-client';
import { DashboardData, Recommendation, TimelineEvent, AssistantPlan } from '../types';

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && !window.location.port.includes('5173')
    ? window.location.origin
    : 'http://localhost:3001');

const API_BASE = `${BACKEND_URL}/api`;

export const socket: Socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
});

export const api = {
  async getDashboard(): Promise<DashboardData> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  },

  async getRooms() {
    const res = await fetch(`${API_BASE}/rooms`);
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return res.json();
  },

  async getDevices() {
    const res = await fetch(`${API_BASE}/devices`);
    if (!res.ok) throw new Error('Failed to fetch devices');
    return res.json();
  },

  async toggleDevice(id: string) {
    const res = await fetch(`${API_BASE}/devices/${id}/toggle`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle device');
    return res.json();
  },

  async controlDevice(id: string, updates: { powerState?: boolean; brightness?: number; speed?: string }) {
    const res = await fetch(`${API_BASE}/devices/${id}/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update device');
    return res.json();
  },

  async getRecommendations(): Promise<Recommendation[]> {
    const res = await fetch(`${API_BASE}/recommendations`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async approveRecommendation(id: string) {
    const res = await fetch(`${API_BASE}/recommendations/${id}/approve`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to approve recommendation');
    }
    return res.json();
  },

  async rejectRecommendation(id: string) {
    const res = await fetch(`${API_BASE}/recommendations/${id}/reject`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reject recommendation');
    return res.json();
  },

  async getEnergySummary() {
    const res = await fetch(`${API_BASE}/energy/summary`);
    if (!res.ok) throw new Error('Failed to fetch energy summary');
    return res.json();
  },

  async getEvents(): Promise<TimelineEvent[]> {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error('Failed to fetch timeline events');
    return res.json();
  },

  async updateHomeMode(mode: string, isOccupied?: boolean) {
    const res = await fetch(`${API_BASE}/home-state/mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, isOccupied }),
    });
    if (!res.ok) throw new Error('Failed to update home mode');
    return res.json();
  },

  async sendSensorReading(roomId: string, sensorType: string, value: number, unit: string) {
    const res = await fetch(`${API_BASE}/sensors/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, sensorType, value, unit }),
    });
    if (!res.ok) throw new Error('Failed to send sensor reading');
    return res.json();
  },

  async runScenario(scenarioId: string) {
    const res = await fetch(`${API_BASE}/simulator/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId }),
    });
    if (!res.ok) throw new Error('Failed to execute scenario');
    return res.json();
  },

  async askAssistant(prompt: string): Promise<AssistantPlan> {
    const res = await fetch(`${API_BASE}/assistant/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('Failed to process command');
    return res.json();
  },

  async executeAssistantPlan(actions: any[]) {
    const res = await fetch(`${API_BASE}/assistant/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions }),
    });
    if (!res.ok) throw new Error('Failed to execute assistant actions');
    return res.json();
  },
};
