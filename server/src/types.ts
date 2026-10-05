export interface StructuredAction {
  deviceId?: string;
  deviceName: string;
  action: 'TURN_ON' | 'TURN_OFF' | 'SET_BRIGHTNESS' | 'SET_SPEED';
  value?: number | string | null;
}

export interface AssistantResponse {
  intent: 'CONTROL_DEVICE' | 'CREATE_ROUTINE' | 'QUERY_STATUS' | 'UNKNOWN';
  actions: StructuredAction[];
  explanation: string;
  requiresConfirmation: boolean;
  status: 'PENDING_CONFIRMATION' | 'EXECUTED' | 'INFO_ONLY';
}

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number; // 0.00 - 1.00
  classification: 'NORMAL' | 'REVIEW' | 'HIGH_ANOMALY';
  reasons: string[];
  suggestedAction?: {
    action: string;
    targetDeviceId?: string;
    targetDeviceName?: string;
    reason: string;
    confidence: number;
    savingsEst?: number;
    category: 'ENERGY' | 'SAFETY' | 'COMFORT';
  };
}
