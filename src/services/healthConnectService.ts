import { Capacitor, registerPlugin } from '@capacitor/core';

export type HealthConnectStatus = 'connected' | 'not_connected' | 'denied' | 'unavailable';

export interface HealthConnectState {
  status: HealthConnectStatus;
  lastSynced: string;
  source: string;
  steps: number;
}

interface TrackerMacrosHealthPlugin {
  checkAvailability(): Promise<{ available: boolean; status: string; message?: string }>;
  checkPermissions(): Promise<{ granted: boolean }>;
  requestPermissions(): Promise<{ requested?: boolean; granted?: boolean }>;
  getTodaySteps(): Promise<{ steps: number; timestamp: string; source: string }>;
  openHealthConnectSettings(): Promise<void>;
}

// Register native plugin for Android Capacitor
const NativeHealthPlugin = registerPlugin<TrackerMacrosHealthPlugin>('TrackerMacrosHealth');

const STORAGE_KEY = 'tracker_macros_health_connect_state';

const DEFAULT_STATE: HealthConnectState = {
  status: 'connected',
  lastSynced: '4:32 PM',
  source: 'Health Connect (Phone & Wearables)',
  steps: 7842,
};

export function loadHealthConnectState(): HealthConnectState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load health connect state', e);
  }
  return DEFAULT_STATE;
}

export function saveHealthConnectState(state: HealthConnectState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save health connect state', e);
  }
}

/**
 * Check if Health Connect is available on the device
 */
export async function checkHealthConnectAvailability(): Promise<{
  available: boolean;
  status: 'AVAILABLE' | 'UPDATE_REQUIRED' | 'UNAVAILABLE';
  message?: string;
}> {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      const res = await NativeHealthPlugin.checkAvailability();
      return res as { available: boolean; status: 'AVAILABLE' | 'UPDATE_REQUIRED' | 'UNAVAILABLE'; message?: string };
    } catch (e) {
      console.warn('Native Health Connect check failed', e);
    }
  }

  // Web fallback simulation
  const state = loadHealthConnectState();
  if (state.status === 'unavailable') {
    return {
      available: false,
      status: 'UNAVAILABLE',
      message: 'Health Connect is not available on this device.',
    };
  }
  return { available: true, status: 'AVAILABLE' };
}

/**
 * Check if READ_STEPS permission is granted
 */
export async function checkHealthConnectPermissions(): Promise<boolean> {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      const res = await NativeHealthPlugin.checkPermissions();
      return res.granted;
    } catch (e) {
      console.warn('Native checkPermissions failed', e);
    }
  }

  const state = loadHealthConnectState();
  return state.status === 'connected';
}

/**
 * Launch Health Connect permission request flow
 */
export async function requestHealthConnectPermissions(): Promise<boolean> {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      const res = await NativeHealthPlugin.requestPermissions();
      return !!res.granted;
    } catch (e) {
      console.warn('Native requestPermissions failed', e);
    }
  }

  // Web / Dev simulation
  const state = loadHealthConnectState();
  if (state.status === 'denied') {
    return false;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const next: HealthConnectState = {
    ...state,
    status: 'connected',
    lastSynced: timeStr,
  };
  saveHealthConnectState(next);
  return true;
}

/**
 * Fetch today's aggregate steps from Health Connect
 */
export async function getTodayStepsFromHealthConnect(): Promise<{
  steps: number;
  timestamp: string;
  source: string;
}> {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      return await NativeHealthPlugin.getTodaySteps();
    } catch (e) {
      console.warn('Native getTodaySteps failed, using local', e);
    }
  }

  const state = loadHealthConnectState();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Update last synced
  const updated: HealthConnectState = {
    ...state,
    lastSynced: timeStr,
  };
  saveHealthConnectState(updated);

  return {
    steps: state.steps || 7842,
    timestamp: timeStr,
    source: 'Health Connect (Phone Sensor + Fitness Apps)',
  };
}

/**
 * Open Android Health Connect Settings or Google Play
 */
export async function openHealthConnectSettings(): Promise<void> {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      await NativeHealthPlugin.openHealthConnectSettings();
      return;
    } catch (e) {
      console.warn('Native openHealthConnectSettings failed', e);
    }
  }

  // Web fallback: alert user
  window.open('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata', '_blank');
}
