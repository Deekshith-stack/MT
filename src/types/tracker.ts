export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: MealType;
  timestamp: string;
  confidence?: 'exact' | 'estimated' | 'verified';
  source?: 'tmai' | 'manual' | 'database' | 'scan';
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number; // in ml
  steps: number;
  activeMinutes?: number;
  foods: FoodItem[];
}

export interface UserProfile {
  id: string;
  name: string;
  weight: number; // in kg
  targetWeight: number; // in kg
  height: number; // in cm
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  waterGoal: number; // in ml
  stepGoal: number;
  units: 'metric' | 'imperial';
  darkMode: boolean;
}

export interface WeightEntry {
  date: string;
  weight: number;
  note?: string;
}

export interface TMAIAnalysisResult {
  food: string;
  emoji: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: 'exact' | 'estimated';
  notes?: string;
}

export interface MultiItemAnalysisResult {
  items: TMAIAnalysisResult[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  rawInput: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}
