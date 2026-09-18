import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { UserProfile, DailyRecord, FoodItem, WeightEntry, AppNotification, TMAIAnalysisResult } from '../types/tracker';
import {
  loadUserProfile,
  saveUserProfile,
  loadTodayRecord,
  saveTodayRecord,
  loadWeightHistory,
  saveWeightHistory,
  loadNotifications,
  saveNotifications,
} from '../services/storageService';
import {
  HealthConnectState,
  HealthConnectStatus,
  loadHealthConnectState,
  saveHealthConnectState,
  getTodayStepsFromHealthConnect,
} from '../services/healthConnectService';
import confetti from 'canvas-confetti';

export type AppPage = 'home' | 'food' | 'add' | 'tmai' | 'activity' | 'progress' | 'profile' | 'settings';

interface TrackerContextType {
  user: UserProfile;
  updateUser: (updated: Partial<UserProfile>) => void;
  today: DailyRecord;
  addFood: (food: Omit<FoodItem, 'id' | 'timestamp'>) => void;
  updateFood: (id: string, updated: Partial<FoodItem>) => void;
  deleteFood: (id: string) => void;
  addWater: (ml: number) => void;
  resetWater: () => void;
  addSteps: (steps: number) => void;
  setSteps: (steps: number) => void;
  weightHistory: WeightEntry[];
  addWeightEntry: (entry: WeightEntry) => void;
  activeTab: AppPage;
  setActiveTab: (tab: AppPage) => void;
  notifications: AppNotification[];
  unreadNotifsCount: number;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  pendingConfirmation: TMAIAnalysisResult | null;
  setPendingConfirmation: (res: TMAIAnalysisResult | null) => void;
  toggleDarkMode: () => void;
  triggerGoalCelebration: () => void;

  // Health Connect (2026 Android Architecture)
  healthState: HealthConnectState;
  setHealthConnectStatus: (status: HealthConnectStatus) => void;
  syncHealthSteps: () => Promise<void>;
  isHealthConnectModalOpen: boolean;
  setIsHealthConnectModalOpen: (open: boolean) => void;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(loadUserProfile);
  const [today, setToday] = useState<DailyRecord>(loadTodayRecord);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(loadWeightHistory);
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);
  const [activeTab, setActiveTab] = useState<AppPage>('home');
  const [pendingConfirmation, setPendingConfirmation] = useState<TMAIAnalysisResult | null>(null);

  // Health Connect State
  const [healthState, setHealthState] = useState<HealthConnectState>(loadHealthConnectState);
  const [isHealthConnectModalOpen, setIsHealthConnectModalOpen] = useState(false);

  // Sync dark mode class on <html> element
  useEffect(() => {
    if (user.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.darkMode]);

  // Recalculate daily totals whenever foods change
  const recalculateRecord = (foods: FoodItem[], water: number, steps: number): DailyRecord => {
    const totalCal = foods.reduce((sum, f) => sum + f.calories, 0);
    const totalP = Math.round(foods.reduce((sum, f) => sum + f.protein, 0) * 10) / 10;
    const totalC = Math.round(foods.reduce((sum, f) => sum + f.carbs, 0) * 10) / 10;
    const totalF = Math.round(foods.reduce((sum, f) => sum + f.fat, 0) * 10) / 10;

    return {
      ...today,
      foods,
      calories: totalCal,
      protein: totalP,
      carbs: totalC,
      fat: totalF,
      water,
      steps,
    };
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser(prev => {
      const next = { ...prev, ...updated };
      saveUserProfile(next);
      return next;
    });
  };

  const toggleDarkMode = () => {
    updateUser({ darkMode: !user.darkMode });
  };

  const addFood = (foodData: Omit<FoodItem, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newFood: FoodItem = {
      ...foodData,
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeStr,
    };

    const newFoods = [newFood, ...today.foods];
    const updatedRecord = recalculateRecord(newFoods, today.water, today.steps);
    setToday(updatedRecord);
    saveTodayRecord(updatedRecord);

    if (updatedRecord.protein >= user.proteinGoal && today.protein < user.proteinGoal) {
      triggerGoalCelebration();
    }
  };

  const updateFood = (id: string, updated: Partial<FoodItem>) => {
    const newFoods = today.foods.map(f => (f.id === id ? { ...f, ...updated } : f));
    const updatedRecord = recalculateRecord(newFoods, today.water, today.steps);
    setToday(updatedRecord);
    saveTodayRecord(updatedRecord);
  };

  const deleteFood = (id: string) => {
    const newFoods = today.foods.filter(f => f.id !== id);
    const updatedRecord = recalculateRecord(newFoods, today.water, today.steps);
    setToday(updatedRecord);
    saveTodayRecord(updatedRecord);
  };

  const addWater = (ml: number) => {
    const newWater = Math.max(0, today.water + ml);
    const updatedRecord = { ...today, water: newWater };
    setToday(updatedRecord);
    saveTodayRecord(updatedRecord);

    if (newWater >= user.waterGoal && today.water < user.waterGoal) {
      triggerGoalCelebration();
    }
  };

  const resetWater = () => {
    const updatedRecord = { ...today, water: 0 };
    setToday(updatedRecord);
    saveTodayRecord(updatedRecord);
  };

  const addSteps = (steps: number) => {
    const newSteps = Math.max(0, today.steps + steps);
    const updatedRecord = { ...today, steps: newSteps };
    setToday(updatedRecord);
    saveTodayRecord(updatedRecord);

    // Keep Health Connect synced state in line
    setHealthState(prev => {
      const next = { ...prev, steps: newSteps };
      saveHealthConnectState(next);
      return next;
    });

    if (newSteps >= user.stepGoal && today.steps < user.stepGoal) {
      triggerGoalCelebration();
    }
  };

  const setSteps = (steps: number) => {
    const updatedRecord = { ...today, steps: Math.max(0, steps) };
    setToday(updatedRecord);
    saveTodayRecord(updatedRecord);

    setHealthState(prev => {
      const next = { ...prev, steps: Math.max(0, steps) };
      saveHealthConnectState(next);
      return next;
    });
  };

  const addWeightEntry = (entry: WeightEntry) => {
    setWeightHistory(prev => {
      const filtered = prev.filter(e => e.date !== entry.date);
      const next = [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
      saveWeightHistory(next);
      return next;
    });
    updateUser({ weight: entry.weight });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(next);
      return next;
    });
  };

  const clearAllNotifications = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      saveNotifications(next);
      return next;
    });
  };

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const triggerGoalCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF7A00', '#22C55E', '#FFB300', '#FFFFFF'],
    });
  };

  // Health Connect Sync Function
  const syncHealthSteps = useCallback(async () => {
    if (healthState.status === 'denied' || healthState.status === 'unavailable') {
      return;
    }

    try {
      const result = await getTodayStepsFromHealthConnect();
      setToday(prev => {
        const next = { ...prev, steps: result.steps };
        saveTodayRecord(next);
        return next;
      });

      setHealthState(prev => {
        const next: HealthConnectState = {
          ...prev,
          lastSynced: result.timestamp,
          steps: result.steps,
        };
        saveHealthConnectState(next);
        return next;
      });
    } catch (e) {
      console.warn('Sync failed', e);
    }
  }, [healthState.status]);

  const setHealthConnectStatus = (status: HealthConnectStatus) => {
    setHealthState(prev => {
      const next = { ...prev, status };
      saveHealthConnectState(next);
      return next;
    });
  };

  // Section 18: Auto-refresh steps when app returns to foreground / window focus
  useEffect(() => {
    const handleFocus = () => {
      syncHealthSteps();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        syncHealthSteps();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncHealthSteps]);

  return (
    <TrackerContext.Provider
      value={{
        user,
        updateUser,
        today,
        addFood,
        updateFood,
        deleteFood,
        addWater,
        resetWater,
        addSteps,
        setSteps,
        weightHistory,
        addWeightEntry,
        activeTab,
        setActiveTab,
        notifications,
        unreadNotifsCount,
        markNotificationRead,
        clearAllNotifications,
        pendingConfirmation,
        setPendingConfirmation,
        toggleDarkMode,
        triggerGoalCelebration,

        // Health Connect
        healthState,
        setHealthConnectStatus,
        syncHealthSteps,
        isHealthConnectModalOpen,
        setIsHealthConnectModalOpen,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
}
