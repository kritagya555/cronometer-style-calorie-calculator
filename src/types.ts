
export interface UserStats {
  age: number;
  gender: 'male' | 'female';
  weight: number; // kg
  height: number; // cm
  activityLevel: number; // 1.2 to 1.9
  targetWeight: number;
}

export interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
}

export interface DBFoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: string;
  baseUnit?: 'g' | 'ml';
  sliceWeight?: number;
}

export interface FoodEntry extends DBFoodItem {
  id: string;
  servingSize: string;
  timestamp: number;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  caloriesBurned: number;
  duration: number; // minutes
  timestamp: number;
}

export const ACTIVITY_LEVELS = [
  { label: 'Sedentary', value: 1.2 },
  { label: 'Lightly Active', value: 1.375 },
  { label: 'Moderately Active', value: 1.55 },
  { label: 'Very Active', value: 1.725 },
  { label: 'Extra Active', value: 1.9 },
];
