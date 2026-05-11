
import { UserStats, MacroNutrients } from '../types';

export function calculateBMR(stats: UserStats): number {
  const { weight, height, age, gender } = stats;
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

export function calculateTDEE(stats: UserStats): number {
  const bmr = calculateBMR(stats);
  return bmr * stats.activityLevel;
}

export function calculateMacroGoals(targetCalories: number): MacroNutrients {
  // Typical balanced split: 30% Protein, 40% Carbs, 30% Fat
  return {
    protein: (targetCalories * 0.30) / 4,
    carbs: (targetCalories * 0.40) / 4,
    fat: (targetCalories * 0.30) / 9,
  };
}
