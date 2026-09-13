export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type DifficultyLevel = Difficulty;

export type MealType = 
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'dessert'
  | 'soup-salad'
  | 'appetizer-snack'
  | 'beverage';

export type Cuisine = 
  | 'Italian'
  | 'Mexican'
  | 'Japanese'
  | 'American'
  | 'French'
  | 'Thai'
  | 'Indian'
  | 'Mediterranean'
  | 'Spanish'
  | 'Vietnamese'
  | 'Middle Eastern'
  | 'Korean'
  | 'Greek'
  | string;

export type DietaryTag = 
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Dairy-Free'
  | 'Keto'
  | 'High-Protein'
  | 'Low-Calorie'
  | 'Low-Carb'
  | 'Nut-Free';

export type DietaryRestriction = DietaryTag;

export interface Ingredient {
  name: string;
  amount: number; // base amount for base servings
  unit: string;
  category?: 'Produce' | 'Meat & Seafood' | 'Dairy & Eggs' | 'Pantry & Spices' | 'Bakery & Grains' | 'Oils & Condiments' | 'Other' | string;
  notes?: string;
}

export interface InstructionStep {
  stepNumber: number;
  title: string;
  instruction: string;
  timerMinutes?: number; // optional timer in minutes
  tip?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  fiber?: number;  // in grams
}

export interface Recipe {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  cuisine: string;
  mealType: MealType;
  difficulty: Difficulty;
  prepTime: number; // minutes
  cookTime: number; // minutes
  totalTime: number; // minutes
  servings: number; // base servings
  calories: number;
  rating: number; // 4.0 - 5.0
  reviewCount: number;
  author: string;
  dietary?: (DietaryTag | string)[];
  tags?: string[];
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  nutrition: NutritionInfo;
  chefTips?: string[];
  pairing?: string;
  youtubeUrl?: string;
  isCustom?: boolean;
  isPromotedToOfficial?: boolean;
  promotedDate?: string;
  moderatorApproved?: boolean;
  pollId?: string;
  pollVotes?: number;
}

export interface PollComment {
  id: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: string;
}

export type PollStatus = 'active' | 'pending_moderator' | 'approved_promoted' | 'rejected';

export interface RecipePoll {
  id: string;
  recipeId: string;
  recipeTitle: string;
  author: string;
  cuisine: string;
  image: string;
  tagline: string;
  createdAt: string;
  votesUp: number;
  votesDown: number;
  voteTarget: number; // e.g. 5 votes to trigger moderator review
  status: PollStatus;
  userVote?: 'up' | 'down'; // current user's vote
  reason?: string;
  moderatorNotes?: string;
  moderatorApprovedAt?: string;
  moderatorName?: string;
  comments: PollComment[];
}

export interface GroceryItem {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
  category: string;
  recipeTitle?: string;
  recipeId?: string;
  checked: boolean;
}

export type ShoppingItem = GroceryItem;

export interface MealPlanDay {
  day: string;
  breakfastRecipeId?: string;
  lunchRecipeId?: string;
  dinnerRecipeId?: string;
  notes?: string;
}

export interface UserRecipeState {
  favorites: string[]; // recipe IDs
  cooked: string[];    // recipe IDs marked as cooked
  notes: Record<string, string>; // recipeId -> personal notes
  customRatings: Record<string, number>; // recipeId -> user rating
}

export type WeightUnit = 'kg' | 'lbs';
export type BiologicalSex = 'male' | 'female';
export type ActivityLevel = 
  | 'sedentary'       // 0.8 - 1.0 g/kg (desk work, little exercise)
  | 'lightly_active'  // 1.2 - 1.4 g/kg (light exercise 1-3 days/wk)
  | 'moderate'        // 1.5 - 1.8 g/kg (moderate exercise 3-5 days/wk)
  | 'very_active'     // 1.8 - 2.2 g/kg (heavy training, bodybuilding)
  | 'cutting_deficit' // 2.2 - 2.6 g/kg (fat loss / calorie deficit)
  | 'endurance'       // 1.4 - 1.7 g/kg (running, cycling, swimming)
  | 'healthy_aging';  // 1.2 - 1.5 g/kg (50+ muscle retention)

export type FitnessGoal = 
  | 'muscle_gain'
  | 'fat_loss'
  | 'maintenance'
  | 'athletic_performance'
  | 'longevity';

export interface ProteinProfile {
  weight: number;
  weightUnit: WeightUnit;
  sex: BiologicalSex;
  age: number;
  heightCm?: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  dailyMealsCount: number; // 3, 4, 5, or 6
  customProteinGrams?: number;
}

export interface ProteinTrackerItem {
  id: string;
  name: string;
  protein: number; // grams
  calories: number;
  servings: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId?: string;
}
