import { UserProfile } from '../types/tracker';

export function calculateBMR(user: UserProfile): number {
  // Mifflin-St Jeor Equation
  if (user.gender === 'female') {
    return Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age - 161);
  }
  // Male / Other default
  return Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age + 5);
}

export function calculateTDEE(user: UserProfile): number {
  const bmr = calculateBMR(user);
  const multipliers: Record<UserProfile['activityLevel'], number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  };
  const multiplier = multipliers[user.activityLevel] || 1.375;
  return Math.round(bmr * multiplier);
}

export function calculateRecommendedTargets(user: UserProfile): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  steps: number;
} {
  const tdee = calculateTDEE(user);
  let targetCalories = tdee;

  if (user.goal === 'lose') {
    targetCalories = Math.max(1400, tdee - 450);
  } else if (user.goal === 'gain') {
    targetCalories = tdee + 350;
  }

  // Protein: ~1.85g per kg
  const proteinGrams = Math.round(user.weight * 1.85);
  const proteinCalories = proteinGrams * 4;

  // Fat: ~25% of total calories (9 kcal per gram)
  const fatCalories = targetCalories * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // Carbs: remaining calories / 4
  const remainingCalories = Math.max(200, targetCalories - (proteinCalories + fatCalories));
  const carbGrams = Math.round(remainingCalories / 4);

  // Water: ~35ml per kg bodyweight (minimum 2000ml)
  const waterGoal = Math.round((user.weight * 38) / 100) * 100;

  // Steps
  const stepGoal = user.activityLevel === 'sedentary' ? 8000 : user.activityLevel === 'light' ? 9000 : 10000;

  return {
    calories: Math.round(targetCalories),
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
    water: Math.max(2000, waterGoal),
    steps: stepGoal,
  };
}

export function formatKcal(calories: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(calories));
}

export function formatSteps(steps: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(steps));
}

export function formatWaterLiters(ml: number): string {
  return (ml / 1000).toFixed(1);
}
