import { UserProfile, DailyRecord, WeightEntry, AppNotification } from '../types/tracker';
import { INITIAL_USER, INITIAL_TODAY_RECORD, INITIAL_WEIGHT_HISTORY, INITIAL_NOTIFICATIONS } from '../data/initialData';

const USER_STORAGE_KEY = 'tracker_macros_user';
const TODAY_STORAGE_KEY = 'tracker_macros_today';
const WEIGHT_STORAGE_KEY = 'tracker_macros_weight_history';
const NOTIFICATIONS_STORAGE_KEY = 'tracker_macros_notifications';
const HISTORY_STORAGE_KEY = 'tracker_macros_history_records';

export function loadUserProfile(): UserProfile {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load user profile from storage', e);
  }
  return INITIAL_USER;
}

export function saveUserProfile(user: UserProfile): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

export function loadTodayRecord(): DailyRecord {
  try {
    const data = localStorage.getItem(TODAY_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load today record from storage', e);
  }
  return INITIAL_TODAY_RECORD;
}

export function saveTodayRecord(record: DailyRecord): void {
  try {
    localStorage.setItem(TODAY_STORAGE_KEY, JSON.stringify(record));
  } catch (e) {
    console.error('Failed to save today record', e);
  }
}

export function loadWeightHistory(): WeightEntry[] {
  try {
    const data = localStorage.getItem(WEIGHT_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load weight history', e);
  }
  return INITIAL_WEIGHT_HISTORY;
}

export function saveWeightHistory(entries: WeightEntry[]): void {
  try {
    localStorage.setItem(WEIGHT_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save weight history', e);
  }
}

export function loadNotifications(): AppNotification[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load notifications', e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveNotifications(notifs: AppNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export function exportBackupData(): string {
  const data = {
    user: loadUserProfile(),
    today: loadTodayRecord(),
    weightHistory: loadWeightHistory(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.user) saveUserProfile(parsed.user);
    if (parsed.today) saveTodayRecord(parsed.today);
    if (parsed.weightHistory) saveWeightHistory(parsed.weightHistory);
    return true;
  } catch (e) {
    console.error('Invalid backup format', e);
    return false;
  }
}

export function resetToDefaults(): void {
  localStorage.clear();
}
