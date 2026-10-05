export interface Room {
  id: string;
  name: string;
  floor: number;
  devices: Device[];
  readings: SensorReading[];
}

export interface Device {
  id: string;
  name: string;
  type: string; // 'LIGHT' | 'FAN' | 'SMART_PLUG' | 'DOOR' | 'TV' | 'HEATER' | 'AC'
  roomId: string;
  isOnline: boolean;
  powerState: boolean;
  powerWatts: number;
  brightness?: number;
  speed?: string;
  room?: Room;
}

export interface SensorReading {
  id: string;
  roomId: string;
  sensorType: 'MOTION' | 'TEMPERATURE' | 'HUMIDITY' | 'DOOR' | 'POWER';
  value: number;
  unit: string;
  recordedAt: string;
  room?: Room;
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  action: string;
  deviceId?: string;
  confidence: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  category: 'ENERGY' | 'SAFETY' | 'COMFORT';
  savingsEst?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface AnomalyStatus {
  isAnomaly: boolean;
  score: number;
  classification: 'NORMAL' | 'REVIEW' | 'HIGH_ANOMALY';
  reasons: string[];
}

export interface HomeState {
  id: string;
  isOccupied: boolean;
  mode: 'HOME' | 'AWAY' | 'NIGHT' | 'FOCUS';
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  type: 'SENSOR' | 'AI_DETECTION' | 'SUGGESTION' | 'USER_APPROVAL' | 'DEVICE_ACTION' | 'ENERGY';
  title: string;
  details: string;
  timestamp: string;
  roomName: string;
  badgeColor: string;
  approved: boolean;
}

export interface StructuredAction {
  deviceId?: string;
  deviceName: string;
  action: 'TURN_ON' | 'TURN_OFF' | 'SET_BRIGHTNESS' | 'SET_SPEED';
  value?: number | string | null;
}

export interface AssistantPlan {
  intent: string;
  actions: StructuredAction[];
  explanation: string;
  requiresConfirmation: boolean;
  status: 'PENDING_CONFIRMATION' | 'EXECUTED' | 'INFO_ONLY';
}

export interface EnergyAnalytics {
  todayKwh: number;
  predictedNextDayKwh: number;
  avg7DayKwh: number;
  estimatedMonthlyBillInr: number;
  tariffRate: number;
  dailyHistory: {
    date: string;
    consumptionKwh: number;
    baselineKwh: number;
    costInr: number;
  }[];
  breakdown: {
    name: string;
    value: number;
    color: string;
  }[];
  hourlyData: {
    hour: string;
    actualWatts: number | null;
    predictedWatts: number;
    baselineWatts: number;
  }[];
  wasteItems: {
    appliance: string;
    status: string;
    potentialSavingsInr: number;
    suggestion: string;
  }[];
}

export interface DashboardData {
  homeState: HomeState;
  rooms: Room[];
  activeDevicesCount: number;
  totalDevicesCount: number;
  currentPowerWatts: number;
  pendingRecommendationsCount: number;
  recentAnomalies: any[];
  currentAnomaly: AnomalyStatus;
  energySummary: EnergyAnalytics;
  privacyMetrics: {
    edgeProcessingActive: boolean;
    localTelemetryLatencyMs: number;
    cloudTelemetrySentBytes: number;
    approvalGuardedActions: boolean;
  };
}
