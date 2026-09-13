import { Recipe, MealType, Cuisine, DietaryRestriction } from '../types';
import { breakfastRecipes } from './breakfastRecipes';
import { pastaPizzaRecipes } from './pastaPizzaRecipes';
import { mainMeatSeafoodRecipes } from './mainMeatSeafoodRecipes';
import { veggieVeganRecipes } from './veggieVeganRecipes';
import { soupSaladRecipes } from './soupSaladRecipes';
import { dessertsSnacksRecipes } from './dessertsSnacksRecipes';
import { extendedGlobalMains1 } from './extendedGlobalMains1';
import { extendedGlobalMains2 } from './extendedGlobalMains2';
import { extendedGlobalMains3 } from './extendedGlobalMains3';
import { extendedGlobalMains4 } from './extendedGlobalMains4';

export const ALL_RECIPES: Recipe[] = [
  ...breakfastRecipes,        // 1 - 15 (15)
  ...pastaPizzaRecipes,       // 16 - 30 (15)
  ...mainMeatSeafoodRecipes,  // 31 - 55 (25)
  ...veggieVeganRecipes,      // 56 - 70 (15)
  ...soupSaladRecipes,        // 71 - 85 (15)
  ...dessertsSnacksRecipes,   // 86 - 100 (15)
  ...extendedGlobalMains1,    // 101 - 200 (100)
  ...extendedGlobalMains2,    // 201 - 300 (100)
  ...extendedGlobalMains3,    // 301 - 400 (100)
  ...extendedGlobalMains4     // 401 - 500 (100)
];

export const TOTAL_RECIPE_COUNT = ALL_RECIPES.length; // 500!

export const MEAL_TYPES: { id: MealType | 'all'; label: string; icon: string; count: number }[] = [
  { id: 'all', label: 'All Recipes', icon: 'Sparkles', count: ALL_RECIPES.length },
  { id: 'breakfast', label: 'Breakfast & Brunch', icon: 'Coffee', count: ALL_RECIPES.filter(r => r.mealType === 'breakfast').length },
  { id: 'lunch', label: 'Lunch & Quick Bites', icon: 'Sandwich', count: ALL_RECIPES.filter(r => r.mealType === 'lunch').length },
  { id: 'dinner', label: 'Dinner & Mains', icon: 'UtensilsCrossed', count: ALL_RECIPES.filter(r => r.mealType === 'dinner').length },
  { id: 'soup-salad', label: 'Soups & Fresh Salads', icon: 'Soup', count: ALL_RECIPES.filter(r => r.mealType === 'soup-salad').length },
  { id: 'appetizer-snack', label: 'Appetizers & Tapas', icon: 'PartyPopper', count: ALL_RECIPES.filter(r => r.mealType === 'appetizer-snack').length },
  { id: 'dessert', label: 'Desserts & Sweets', icon: 'Cake', count: ALL_RECIPES.filter(r => r.mealType === 'dessert').length },
  { id: 'beverage', label: 'Drinks & Refreshers', icon: 'GlassWater', count: ALL_RECIPES.filter(r => r.mealType === 'beverage').length }
];

export const CUISINES: Cuisine[] = [
  'Italian',
  'Mexican',
  'Japanese',
  'American',
  'French',
  'Thai',
  'Indian',
  'Mediterranean',
  'Spanish',
  'Vietnamese',
  'Middle Eastern',
  'Korean',
  'Greek',
  'Chinese',
  'Latin American',
  'German',
  'Nordic'
];

export const DIETARY_OPTIONS: DietaryRestriction[] = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'High-Protein',
  'Low-Carb',
  'Low-Calorie'
];
