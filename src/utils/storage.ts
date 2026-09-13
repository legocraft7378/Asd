import { GroceryItem, MealPlanDay, Recipe, RecipePoll, ProteinProfile, ProteinTrackerItem } from '../types';
import { DEFAULT_PROTEIN_PROFILE } from './proteinCalculator';

const FAVORITES_KEY = 'recipes_100_favorites';
const GROCERY_KEY = 'recipes_100_grocery_list';
const MEAL_PLAN_KEY = 'recipes_100_meal_plan';
const CUSTOM_RECIPES_KEY = 'recipes_100_custom_recipes';
const POLLS_KEY = 'recipes_100_community_polls';
const MODERATOR_MODE_KEY = 'recipes_100_moderator_mode';
const PROTEIN_PROFILE_KEY = 'recipes_100_protein_profile';
const PROTEIN_TRACKER_KEY = 'recipes_100_protein_tracker_items';

export const getStoredCustomRecipes = (): Recipe[] => {
  try {
    const data = localStorage.getItem(CUSTOM_RECIPES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const setStoredCustomRecipes = (recipes: Recipe[]) => {
  try {
    localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(recipes));
  } catch (e) {
    console.error('Failed to save custom recipes', e);
  }
};

export const exportRecipesToJSON = (recipes: Recipe[], filename = 'my_recipes_export.json') => {
  try {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(recipes, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (err) {
    console.error('Failed to export recipes', err);
  }
};

export const getStoredFavorites = (): string[] => {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : ['recipe-1', 'recipe-16', 'recipe-31', 'recipe-87'];
  } catch {
    return ['recipe-1', 'recipe-16', 'recipe-31', 'recipe-87'];
  }
};

export const setStoredFavorites = (favorites: string[]) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
};

export const getStoredGroceryList = (): GroceryItem[] => {
  try {
    const data = localStorage.getItem(GROCERY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const setStoredGroceryList = (items: GroceryItem[]) => {
  try {
    localStorage.setItem(GROCERY_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save grocery list', e);
  }
};

export const getStoredMealPlan = (): MealPlanDay[] => {
  try {
    const data = localStorage.getItem(MEAL_PLAN_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return daysOfWeek.map((day, idx) => ({
    day,
    breakfastRecipeId: idx === 0 ? 'recipe-1' : idx === 5 ? 'recipe-4' : undefined,
    lunchRecipeId: idx === 1 ? 'recipe-18' : idx === 4 ? 'recipe-56' : undefined,
    dinnerRecipeId: idx === 0 ? 'recipe-31' : idx === 2 ? 'recipe-16' : idx === 5 ? 'recipe-45' : undefined
  }));
};

export const setStoredMealPlan = (plan: MealPlanDay[]) => {
  try {
    localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
  } catch (e) {
    console.error('Failed to save meal plan', e);
  }
};

const DEFAULT_INITIAL_POLLS: RecipePoll[] = [
  {
    id: 'poll-truffle-pasta-01',
    recipeId: 'custom-sample-truffle-master',
    recipeTitle: "Chef's Artisanal Black Truffle Fettuccine with Parmigiano Emulsion",
    author: 'Chef Marco Valenti',
    cuisine: 'Italian',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&auto=format&fit=crop&q=80',
    tagline: 'Silky handcrafted pasta tossed with black winter truffle butter and 24-month aged Parmigiano Reggiano.',
    createdAt: '2026-08-19T14:30:00.000Z',
    votesUp: 14,
    votesDown: 1,
    voteTarget: 5,
    status: 'pending_moderator',
    reason: 'Tested across 15 fine-dining dinner services. The mantecatura technique produces a restaurant-grade glossy emulsion in under 20 minutes.',
    comments: [
      {
        id: 'c1',
        userName: 'Elena Rossi',
        comment: 'Cooked this for anniversary dinner—absolutely restaurant quality! Deserves to be in the main list.',
        rating: 5,
        createdAt: '2026-08-20T10:15:00.000Z'
      },
      {
        id: 'c2',
        userName: 'David Miller',
        comment: 'The tip about turning off the stove before adding cheese saved my sauce from clumping. 10/10!',
        rating: 5,
        createdAt: '2026-08-20T16:45:00.000Z'
      }
    ]
  },
  {
    id: 'poll-birria-crispy-02',
    recipeId: 'custom-sample-birria-tacos',
    recipeTitle: 'Grandma Elena’s 3-Chile Crispy Quesabirria Tacos with Rich Consomé',
    author: 'Elena Morales',
    cuisine: 'Mexican',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=900&auto=format&fit=crop&q=80',
    tagline: 'Slow-braised beef chuck dipped in chili broth, crisped on a flat-top with melting Oaxaca cheese.',
    createdAt: '2026-08-20T09:00:00.000Z',
    votesUp: 28,
    votesDown: 2,
    voteTarget: 5,
    status: 'approved_promoted',
    moderatorApprovedAt: '2026-08-21T02:15:00.000Z',
    moderatorName: 'Chef Antoine (Lead Moderator)',
    moderatorNotes: 'Exceptional chili blend balance and crystal clear step timers. Promoted to Official Main Catalog.',
    reason: 'Authentic Jalisco family recipe passed down for 3 generations with secret guajillo-ancho broth balance.',
    comments: [
      {
        id: 'c3',
        userName: 'Carlos Santana',
        comment: 'Best birria recipe on the internet hands down.',
        rating: 5,
        createdAt: '2026-08-20T19:20:00.000Z'
      }
    ]
  }
];

export const getStoredPolls = (): RecipePoll[] => {
  try {
    const data = localStorage.getItem(POLLS_KEY);
    return data ? JSON.parse(data) : DEFAULT_INITIAL_POLLS;
  } catch {
    return DEFAULT_INITIAL_POLLS;
  }
};

export const setStoredPolls = (polls: RecipePoll[]) => {
  try {
    localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
  } catch (e) {
    console.error('Failed to save community polls', e);
  }
};

export const getStoredModeratorMode = (): boolean => {
  try {
    const data = localStorage.getItem(MODERATOR_MODE_KEY);
    return data ? JSON.parse(data) : false;
  } catch {
    return false;
  }
};

export const getModeratorMode = getStoredModeratorMode;

export const setStoredModeratorMode = (enabled: boolean) => {
  try {
    localStorage.setItem(MODERATOR_MODE_KEY, JSON.stringify(enabled));
  } catch (e) {
    console.error('Failed to save moderator mode', e);
  }
};

export const getStoredProteinProfile = (): ProteinProfile => {
  try {
    const data = localStorage.getItem(PROTEIN_PROFILE_KEY);
    return data ? { ...DEFAULT_PROTEIN_PROFILE, ...JSON.parse(data) } : DEFAULT_PROTEIN_PROFILE;
  } catch {
    return DEFAULT_PROTEIN_PROFILE;
  }
};

export const setStoredProteinProfile = (profile: ProteinProfile) => {
  try {
    localStorage.setItem(PROTEIN_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save protein profile', e);
  }
};

export const getStoredProteinTrackerItems = (): ProteinTrackerItem[] => {
  try {
    const data = localStorage.getItem(PROTEIN_TRACKER_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const setStoredProteinTrackerItems = (items: ProteinTrackerItem[]) => {
  try {
    localStorage.setItem(PROTEIN_TRACKER_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save protein tracker items', e);
  }
};

