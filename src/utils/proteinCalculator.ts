import { ProteinProfile, ActivityLevel, FitnessGoal, WeightUnit } from '../types';

export const DEFAULT_PROTEIN_PROFILE: ProteinProfile = {
  weight: 70,
  weightUnit: 'kg',
  sex: 'male',
  age: 28,
  activityLevel: 'moderate',
  goal: 'muscle_gain',
  dailyMealsCount: 4
};

// Activity multipliers in g/kg
export const ACTIVITY_PROTEIN_RANGES: Record<ActivityLevel, { min: number; max: number; rec: number; label: string; description: string }> = {
  sedentary: {
    min: 0.8,
    max: 1.1,
    rec: 0.9,
    label: 'Sedentary / Desk Job',
    description: 'Minimal intentional exercise, primarily seated work (WHO/RDA baseline)'
  },
  lightly_active: {
    min: 1.2,
    max: 1.4,
    rec: 1.3,
    label: 'Lightly Active',
    description: '1-3 days/week of light exercise, daily walking or yoga'
  },
  moderate: {
    min: 1.5,
    max: 1.8,
    rec: 1.6,
    label: 'Moderately Active / Gym',
    description: '3-5 days/week of moderate cardio or resistance training'
  },
  very_active: {
    min: 1.8,
    max: 2.2,
    rec: 2.0,
    label: 'Very Active / Hypertrophy',
    description: '5-6 days/week heavy lifting, strength training, or muscle building'
  },
  cutting_deficit: {
    min: 2.2,
    max: 2.6,
    rec: 2.3,
    label: 'Fat Loss / Calorie Deficit (Cutting)',
    description: 'High protein to prevent muscle loss and maximize satiety while dieting'
  },
  endurance: {
    min: 1.4,
    max: 1.7,
    rec: 1.5,
    label: 'Endurance Sports',
    description: 'Running, cycling, swimming, marathon training recovery'
  },
  healthy_aging: {
    min: 1.2,
    max: 1.6,
    rec: 1.4,
    label: 'Healthy Aging (50+ Vitality)',
    description: 'Counteract anabolic resistance and preserve functional muscle tissue'
  }
};

export const GOAL_ADJUSTMENTS: Record<FitnessGoal, { multiplier: number; label: string; icon: string }> = {
  muscle_gain: { multiplier: 1.1, label: 'Muscle Growth & Hypertrophy', icon: 'Dumbbell' },
  fat_loss: { multiplier: 1.15, label: 'Fat Loss & Lean Definition', icon: 'Flame' },
  maintenance: { multiplier: 1.0, label: 'Weight Maintenance & Health', icon: 'Scale' },
  athletic_performance: { multiplier: 1.05, label: 'Athletic Speed & Recovery', icon: 'Zap' },
  longevity: { multiplier: 1.0, label: 'Vitality & Healthy Aging', icon: 'Heart' }
};

export interface ProteinCalculationResult {
  weightKg: number;
  weightLbs: number;
  minGrams: number;
  maxGrams: number;
  recommendedGrams: number;
  perMealGrams: number;
  proteinCalories: number;
  estimatedTDEE: number;
  proteinPercentOfCalories: number;
  isCustomTarget: boolean;
  insights: string[];
}

export function calculateProteinRequirements(profile: ProteinProfile): ProteinCalculationResult {
  // Convert weight to kg
  const weightKg = profile.weightUnit === 'lbs' ? profile.weight * 0.45359237 : profile.weight;
  const weightLbs = profile.weightUnit === 'lbs' ? profile.weight : profile.weight * 2.20462;

  const activityData = ACTIVITY_PROTEIN_RANGES[profile.activityLevel] || ACTIVITY_PROTEIN_RANGES.moderate;
  const goalAdjustment = GOAL_ADJUSTMENTS[profile.goal]?.multiplier || 1.0;

  // Age factor: slight increase for >50 due to anabolic resistance
  let ageMultiplier = 1.0;
  if (profile.age >= 50) {
    ageMultiplier = 1.1;
  } else if (profile.age >= 65) {
    ageMultiplier = 1.18;
  }

  let minGrams = Math.round(weightKg * activityData.min * ageMultiplier);
  let maxGrams = Math.round(weightKg * activityData.max * goalAdjustment * ageMultiplier);
  let recommendedGrams = Math.round(weightKg * activityData.rec * goalAdjustment * ageMultiplier);

  // If user overrode with custom target
  const isCustomTarget = typeof profile.customProteinGrams === 'number' && profile.customProteinGrams > 0;
  if (isCustomTarget && profile.customProteinGrams) {
    recommendedGrams = profile.customProteinGrams;
  }

  const mealsCount = Math.max(1, Math.min(8, profile.dailyMealsCount || 4));
  const perMealGrams = Math.round((recommendedGrams / mealsCount) * 10) / 10;
  const proteinCalories = recommendedGrams * 4;

  // Rough Mifflin-St Jeor estimate for reference
  let bmr = (10 * weightKg) + 600;
  if (profile.sex === 'male') {
    bmr += 50;
  } else {
    bmr -= 100;
  }
  const tdeeMultiplier = profile.activityLevel === 'sedentary' ? 1.2 :
    profile.activityLevel === 'lightly_active' ? 1.375 :
    profile.activityLevel === 'moderate' ? 1.55 : 1.725;
  const estimatedTDEE = Math.round(bmr * tdeeMultiplier);
  const proteinPercentOfCalories = Math.min(60, Math.round((proteinCalories / (estimatedTDEE || 2000)) * 100));

  // Scientific insights
  const insights: string[] = [];
  if (perMealGrams >= 25) {
    insights.push(`Each meal provides ~${perMealGrams}g protein, surpassing the 2.5-3g Leucine threshold needed to trigger full Muscle Protein Synthesis (MPS).`);
  } else {
    insights.push(`Aim for at least 25g-30g of protein in your main meals to maximize muscle protein synthesis.`);
  }

  if (profile.goal === 'fat_loss') {
    insights.push(`High protein increases thermogenesis (TEF ~20-30%) and helps preserve lean muscle mass during caloric deficits.`);
  } else if (profile.goal === 'muscle_gain') {
    insights.push(`Consuming ~${recommendedGrams}g daily provides the necessary amino acid pool for tissue repair following resistance training.`);
  }

  if (profile.weightUnit === 'lbs') {
    insights.push(`Target equates to approx ${(recommendedGrams / weightLbs).toFixed(2)}g of protein per pound of body weight.`);
  } else {
    insights.push(`Target equates to approx ${(recommendedGrams / weightKg).toFixed(2)}g of protein per kilogram of body weight.`);
  }

  return {
    weightKg: Math.round(weightKg * 10) / 10,
    weightLbs: Math.round(weightLbs * 10) / 10,
    minGrams,
    maxGrams,
    recommendedGrams,
    perMealGrams,
    proteinCalories,
    estimatedTDEE,
    proteinPercentOfCalories,
    isCustomTarget,
    insights
  };
}

// Reference common protein sources
export interface ProteinFoodSource {
  id: string;
  name: string;
  category: 'Meat & Poultry' | 'Fish & Seafood' | 'Dairy & Eggs' | 'Plant-Based' | 'Supplements & Grains';
  servingSize: string;
  servingGrams: number;
  protein: number;
  calories: number;
  leucineRating: 'High' | 'Medium' | 'Good';
  isVegan?: boolean;
  isVegetarian?: boolean;
}

export const COMMON_PROTEIN_FOODS: ProteinFoodSource[] = [
  { id: 'f1', name: 'Chicken Breast (Cooked, Skinless)', category: 'Meat & Poultry', servingSize: '100g (3.5 oz)', servingGrams: 100, protein: 31, calories: 165, leucineRating: 'High' },
  { id: 'f2', name: 'Turkey Breast (Cooked)', category: 'Meat & Poultry', servingSize: '100g (3.5 oz)', servingGrams: 100, protein: 29, calories: 135, leucineRating: 'High' },
  { id: 'f3', name: 'Lean Ground Beef (93/7)', category: 'Meat & Poultry', servingSize: '100g (3.5 oz)', servingGrams: 100, protein: 26, calories: 172, leucineRating: 'High' },
  { id: 'f4', name: 'Sirloin Steak (Trimmed)', category: 'Meat & Poultry', servingSize: '100g (3.5 oz)', servingGrams: 100, protein: 28, calories: 190, leucineRating: 'High' },
  { id: 'f5', name: 'Salmon Fillet (Atlantic, Cooked)', category: 'Fish & Seafood', servingSize: '100g (3.5 oz)', servingGrams: 100, protein: 25, calories: 206, leucineRating: 'High' },
  { id: 'f6', name: 'Canned Tuna (in Water)', category: 'Fish & Seafood', servingSize: '1 can drained (120g)', servingGrams: 120, protein: 30, calories: 132, leucineRating: 'High' },
  { id: 'f7', name: 'Shrimp / Prawns (Cooked)', category: 'Fish & Seafood', servingSize: '100g (3.5 oz)', servingGrams: 100, protein: 24, calories: 99, leucineRating: 'High' },
  { id: 'f8', name: 'Cod / Whitefish Fillet', category: 'Fish & Seafood', servingSize: '100g (3.5 oz)', servingGrams: 100, protein: 20, calories: 90, leucineRating: 'High' },
  { id: 'f9', name: 'Large Whole Egg', category: 'Dairy & Eggs', servingSize: '1 large egg (50g)', servingGrams: 50, protein: 6.3, calories: 72, leucineRating: 'High', isVegetarian: true },
  { id: 'f10', name: 'Egg Whites (Liquid/Cooked)', category: 'Dairy & Eggs', servingSize: '100g (~3 whites)', servingGrams: 100, protein: 11, calories: 52, leucineRating: 'High', isVegetarian: true },
  { id: 'f11', name: '0% Fat Plain Greek Yogurt', category: 'Dairy & Eggs', servingSize: '1 cup (170g)', servingGrams: 170, protein: 17.5, calories: 100, leucineRating: 'High', isVegetarian: true },
  { id: 'f12', name: 'Low-Fat Cottage Cheese (2%)', category: 'Dairy & Eggs', servingSize: '1 cup (226g)', servingGrams: 226, protein: 28, calories: 180, leucineRating: 'High', isVegetarian: true },
  { id: 'f13', name: 'Extra Firm Tofu (Pressed)', category: 'Plant-Based', servingSize: '100g (3.5 oz)', servingGrams: 100, protein: 15, calories: 130, leucineRating: 'Good', isVegan: true, isVegetarian: true },
  { id: 'f14', name: 'Tempeh (Fermented Soy)', category: 'Plant-Based', servingSize: '100g (3.5 oz)', servingGrams: 100, protein: 19, calories: 195, leucineRating: 'High', isVegan: true, isVegetarian: true },
  { id: 'f15', name: 'Seitan (Vital Wheat Gluten)', category: 'Plant-Based', servingSize: '100g (3.5 oz)', servingGrams: 100, protein: 25, calories: 140, leucineRating: 'Medium', isVegan: true, isVegetarian: true },
  { id: 'f16', name: 'Edamame (Shelled, Cooked)', category: 'Plant-Based', servingSize: '1 cup (155g)', servingGrams: 155, protein: 18.5, calories: 188, leucineRating: 'Good', isVegan: true, isVegetarian: true },
  { id: 'f17', name: 'Cooked Green Lentils', category: 'Plant-Based', servingSize: '1 cup (198g)', servingGrams: 198, protein: 17.9, calories: 230, leucineRating: 'Medium', isVegan: true, isVegetarian: true },
  { id: 'f18', name: 'Whey Protein Isolate Powder', category: 'Supplements & Grains', servingSize: '1 scoop (30g)', servingGrams: 30, protein: 25, calories: 110, leucineRating: 'High', isVegetarian: true },
  { id: 'f19', name: 'Plant-Based Protein Powder (Pea/Rice)', category: 'Supplements & Grains', servingSize: '1 scoop (33g)', servingGrams: 33, protein: 24, calories: 120, leucineRating: 'High', isVegan: true, isVegetarian: true },
  { id: 'f20', name: 'Hemp Seeds (Hulled)', category: 'Supplements & Grains', servingSize: '3 tbsp (30g)', servingGrams: 30, protein: 9.5, calories: 166, leucineRating: 'Good', isVegan: true, isVegetarian: true }
];
