import React, { useState, useMemo, useEffect } from 'react';
import { 
  ALL_RECIPES, 
  TOTAL_RECIPE_COUNT,
  MEAL_TYPES, 
  CUISINES 
} from './data/allRecipes';
import { 
  Recipe, 
  MealType, 
  Cuisine, 
  DietaryRestriction, 
  DifficultyLevel, 
  GroceryItem, 
  Ingredient,
  RecipePoll,
  ProteinProfile,
  ProteinTrackerItem
} from './types';
import { 
  getStoredFavorites, 
  setStoredFavorites, 
  getStoredGroceryList, 
  setStoredGroceryList, 
  getStoredMealPlan, 
  setStoredMealPlan,
  getStoredCustomRecipes,
  setStoredCustomRecipes,
  getStoredPolls,
  setStoredPolls,
  getStoredModeratorMode,
  setStoredModeratorMode,
  getStoredProteinProfile,
  setStoredProteinProfile,
  getStoredProteinTrackerItems,
  setStoredProteinTrackerItems,
  exportRecipesToJSON
} from './utils/storage';
import { calculateProteinRequirements } from './utils/proteinCalculator';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar } from './components/FilterBar';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { CookModeModal } from './components/CookModeModal';
import { GroceryListModal } from './components/GroceryListModal';
import { MealPlannerModal } from './components/MealPlannerModal';
import { AddRecipeModal } from './components/AddRecipeModal';
import { UserCreationsSection } from './components/UserCreationsSection';
import { CommunityPollsModal } from './components/CommunityPollsModal';
import { ProteinCalculatorModal } from './components/ProteinCalculatorModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AppHeaderBanner } from './components/AppHeaderBanner';
import { AppInstallModal } from './components/AppInstallModal';
import { ChefHat, Sparkles, SearchX, RotateCcw, Plus, Upload, Download, Vote, ShieldCheck, Award, Dumbbell } from 'lucide-react';

export function App() {
  // Global Recipe state & local storage
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(getStoredCustomRecipes);
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>(getStoredGroceryList);
  const [mealPlan, setMealPlan] = useState(getStoredMealPlan);
  const [polls, setPolls] = useState<RecipePoll[]>(getStoredPolls);
  const [isModerator, setIsModerator] = useState<boolean>(getStoredModeratorMode);
  const [proteinProfile, setProteinProfile] = useState<ProteinProfile>(getStoredProteinProfile);
  const [proteinTrackerItems, setProteinTrackerItems] = useState<ProteinTrackerItem[]>(getStoredProteinTrackerItems);

  // Active UI & Modals state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [isGroceryOpen, setIsGroceryOpen] = useState(false);
  const [isMealPlannerOpen, setIsMealPlannerOpen] = useState(false);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [isPollsOpen, setIsPollsOpen] = useState(false);
  const [isProteinCalcOpen, setIsProteinCalcOpen] = useState(false);
  const [isAppInstallModalOpen, setIsAppInstallModalOpen] = useState(false);
  const [proteinPreselectRecipe, setProteinPreselectRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // URL Deep Link / PWA Action Handler
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      if (action === 'protein') {
        setIsProteinCalcOpen(true);
      } else if (action === 'grocery') {
        setIsGroceryOpen(true);
      } else if (action === 'planner') {
        setIsMealPlannerOpen(true);
      } else if (action === 'search') {
        const searchInput = document.getElementById('navbar-recipe-search') as HTMLInputElement | null;
        searchInput?.focus();
      }
    } catch {
      // URL params parsing safe guard
    }
  }, []);

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType | 'all'>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | 'all'>('all');
  const [selectedDietary, setSelectedDietary] = useState<DietaryRestriction[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'calories' | 'reviews' | 'name' | 'protein'>('time');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCustomOnly, setShowCustomOnly] = useState(false);

  // Combined Recipe Collection (Custom user recipes prioritized first)
  const allCombinedRecipes = useMemo(() => {
    return [...customRecipes, ...ALL_RECIPES];
  }, [customRecipes]);

  // Sync to local storage
  useEffect(() => {
    setStoredFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    setStoredGroceryList(groceryList);
  }, [groceryList]);

  useEffect(() => {
    setStoredMealPlan(mealPlan);
  }, [mealPlan]);

  useEffect(() => {
    setStoredPolls(polls);
  }, [polls]);

  useEffect(() => {
    setStoredModeratorMode(isModerator);
  }, [isModerator]);

  useEffect(() => {
    setStoredProteinProfile(proteinProfile);
  }, [proteinProfile]);

  useEffect(() => {
    setStoredProteinTrackerItems(proteinTrackerItems);
  }, [proteinTrackerItems]);

  const proteinCalcTarget = useMemo(() => {
    return calculateProteinRequirements(proteinProfile).recommendedGrams;
  }, [proteinProfile]);

  // Community Poll Handlers
  const handleVote = (pollId: string, direction: 'up' | 'down') => {
    setPolls(prev => prev.map(poll => {
      if (poll.id !== pollId) return poll;

      let newVotesUp = poll.votesUp;
      let newVotesDown = poll.votesDown;
      let newUserVote = poll.userVote;

      if (poll.userVote === direction) {
        // Toggle off
        if (direction === 'up') newVotesUp = Math.max(0, newVotesUp - 1);
        if (direction === 'down') newVotesDown = Math.max(0, newVotesDown - 1);
        newUserVote = null;
      } else {
        // Switching or new vote
        if (poll.userVote === 'up') newVotesUp = Math.max(0, newVotesUp - 1);
        if (poll.userVote === 'down') newVotesDown = Math.max(0, newVotesDown - 1);

        if (direction === 'up') newVotesUp += 1;
        if (direction === 'down') newVotesDown += 1;
        newUserVote = direction;
      }

      // Check if threshold is reached to flag for moderator review
      let newStatus = poll.status;
      if (poll.status === 'active' && newVotesUp >= poll.voteTarget) {
        newStatus = 'pending_moderator';
      }

      return {
        ...poll,
        votesUp: newVotesUp,
        votesDown: newVotesDown,
        userVote: newUserVote,
        status: newStatus
      };
    }));
  };

  const handleAddPollComment = (pollId: string, commentText: string, rating: number) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id !== pollId) return poll;

      const newComment = {
        id: `poll-comment-${Date.now()}`,
        userName: 'Chef Community Member',
        comment: commentText,
        createdAt: new Date().toISOString(),
        rating
      };

      return {
        ...poll,
        comments: [newComment, ...poll.comments]
      };
    }));
  };

  const handleNominateRecipe = (recipe: Recipe, reason: string) => {
    const newPoll: RecipePoll = {
      id: `poll-${Date.now()}-${recipe.id}`,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      tagline: recipe.tagline,
      author: recipe.author || 'Community Chef',
      cuisine: recipe.cuisine,
      image: recipe.image,
      votesUp: 1,
      votesDown: 0,
      userVote: 'up',
      status: 'active',
      createdAt: new Date().toISOString(),
      reason,
      voteTarget: 5,
      comments: [
        {
          id: `comment-init-${Date.now()}`,
          userName: recipe.author || 'Author',
          comment: reason || 'Nominated this recipe for the official catalogue!',
          createdAt: new Date().toISOString(),
          rating: 5
        }
      ]
    };

    setPolls(prev => [newPoll, ...prev]);
  };

  const handleModeratorApprove = (pollId: string, moderatorNotes: string) => {
    const targetPoll = polls.find(p => p.id === pollId);
    if (!targetPoll) return;

    // 1. Update Poll
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p;
      return {
        ...p,
        status: 'approved_promoted',
        moderatorApprovedAt: new Date().toISOString(),
        moderatorNotes,
        moderatorName: 'Head Chef Moderator'
      };
    }));

    // 2. Promote the actual recipe to Official status
    setCustomRecipes(prev => prev.map(r => {
      if (r.id === targetPoll.recipeId || r.title.toLowerCase() === targetPoll.recipeTitle.toLowerCase()) {
        return {
          ...r,
          isPromotedToOfficial: true,
          moderatorApproved: true,
          promotedDate: new Date().toISOString(),
          pollId: targetPoll.id,
          pollVotes: targetPoll.votesUp
        };
      }
      return r;
    }));

    // Also update selectedRecipe if currently viewing it
    if (selectedRecipe && (selectedRecipe.id === targetPoll.recipeId || selectedRecipe.title === targetPoll.recipeTitle)) {
      setSelectedRecipe(prev => prev ? {
        ...prev,
        isPromotedToOfficial: true,
        moderatorApproved: true,
        promotedDate: new Date().toISOString(),
        pollId: targetPoll.id
      } : null);
    }
  };

  const handleModeratorReject = (pollId: string, reason: string) => {
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p;
      return {
        ...p,
        status: 'rejected',
        moderatorNotes: reason,
        moderatorApprovedAt: new Date().toISOString(),
        moderatorName: 'Head Chef Moderator'
      };
    }));
  };

  const handleOpenNominateForPoll = (recipe: Recipe) => {
    setSelectedRecipe(null);
    setIsPollsOpen(true);
  };

  // Custom Recipe Handlers
  const handleSaveCustomRecipe = (recipe: Recipe) => {
    setCustomRecipes(prev => {
      const existsIndex = prev.findIndex(r => r.id === recipe.id);
      let updated: Recipe[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = recipe;
      } else {
        updated = [recipe, ...prev];
      }
      setStoredCustomRecipes(updated);
      return updated;
    });
    setEditingRecipe(null);
  };

  const handleImportRecipes = (newRecipes: Recipe[]) => {
    setCustomRecipes(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const toAdd = newRecipes.filter(r => !existingIds.has(r.id));
      const updated = [...toAdd, ...prev];
      setStoredCustomRecipes(updated);
      return updated;
    });
  };

  const handleDeleteCustomRecipe = (recipeId: string) => {
    setCustomRecipes(prev => {
      const updated = prev.filter(r => r.id !== recipeId);
      setStoredCustomRecipes(updated);
      return updated;
    });
    setFavorites(prev => prev.filter(id => id !== recipeId));
  };

  const handleEditCustomRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsAddRecipeOpen(true);
  };

  const handleAddSampleRecipe = () => {
    const sampleRecipes: Recipe[] = [
      {
        id: `custom-sample-truffle-${Date.now()}`,
        title: "Chef's Artisanal Black Truffle Fettuccine with Parmigiano Emulsion",
        tagline: "Silky handcrafted pasta tossed with black winter truffle butter and 24-month aged Parmigiano Reggiano.",
        description: "An indulgent culinary showpiece celebrating simple Italian luxury. High-quality egg fettuccine is tossed in starchy emulsified pasta water, cultured butter, shaved black truffle carpaccio, and rich Parmigiano Reggiano cheese.",
        cuisine: "Italian",
        mealType: "dinner",
        difficulty: "Medium",
        prepTime: 20,
        cookTime: 15,
        totalTime: 35,
        servings: 2,
        calories: 560,
        rating: 4.9,
        reviewCount: 42,
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&auto=format&fit=crop&q=80",
        author: "Chef Marco Valenti",
        youtubeUrl: "https://www.youtube.com/watch?v=4d_s_mS9b_Y",
        ingredients: [
          { name: "Fresh Egg Fettuccine Pasta", amount: 250, unit: "g", category: "Pantry & Spices" },
          { name: "Cultured European Butter", amount: 4, unit: "tbsp", category: "Dairy & Eggs" },
          { name: "Black Truffle Butter or Truffle Paste", amount: 2, unit: "tbsp", category: "Pantry & Spices" },
          { name: "Parmigiano Reggiano (Aged 24 Months, grated)", amount: 1, unit: "cup", category: "Dairy & Eggs" },
          { name: "Fresh Black Summer/Winter Truffle (for shaving)", amount: 1, unit: "whole", category: "Produce" },
          { name: "Flaky Sea Salt & Freshly Cracked Black Pepper", amount: 1, unit: "tsp", category: "Pantry & Spices" }
        ],
        instructions: [
          {
            stepNumber: 1,
            title: "Boil Heavily Salted Water",
            instruction: "Bring a large pot of cold water to a rolling boil. Season generously with kosher salt until it tastes like gentle ocean water.",
            timerMinutes: 5,
            tip: "Salted pasta water is the secret to seasoning pasta from within."
          },
          {
            stepNumber: 2,
            title: "Melt Truffle Butter & Create Emulsion Base",
            instruction: "In a wide heavy skillet over low heat, gently melt the cultured butter and truffle paste with 2 tablespoons of warm pasta water, swirling to create a glossy emulsion.",
            timerMinutes: 3,
            tip: "Keep heat very low so the butter emulsifies rather than separating."
          },
          {
            stepNumber: 3,
            title: "Cook Fettuccine al Dente",
            instruction: "Drop fresh egg fettuccine into boiling water and cook for 2 to 3 minutes until al dente with a slight bite in the center.",
            timerMinutes: 3
          },
          {
            stepNumber: 4,
            title: "Mantecatura (Glossy Finish)",
            instruction: "Transfer pasta directly into the skillet with a ladle of starchy pasta water. Remove from direct heat, vigorously toss in the grated Parmigiano Reggiano until a creamy, velvety sauce coats every strand.",
            timerMinutes: 2,
            tip: "Never add cheese over direct flame or it will clump."
          },
          {
            stepNumber: 5,
            title: "Plate & Shave Fresh Truffle",
            instruction: "Twirl onto warm shallow pasta bowls with culinary tongs. Generously shave fresh black truffle over the top with a mandoline and finish with cracked black pepper.",
            timerMinutes: 1
          }
        ],
        dietary: ["Vegetarian"],
        tags: ["Truffle", "Artisanal", "Pasta", "Romantic Dinner", "Gourmet"],
        nutrition: { calories: 560, protein: 18, carbs: 62, fat: 28, fiber: 4 },
        chefTips: [
          "Always finish the mantecatura off the flame to prevent the Parmigiano from curdling.",
          "Warm the serving bowls in a low oven to keep the emulsified sauce creamy."
        ],
        pairing: "A crisp Barolo, Chianti Classico, or mineral-driven dry Franciacorta sparkling wine.",
        isCustom: true
      }
    ];

    setCustomRecipes(prev => {
      const updated = [...sampleRecipes, ...prev];
      setStoredCustomRecipes(updated);
      return updated;
    });
  };

  // Favorite toggle
  const handleToggleFavorite = (recipeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId) 
        : [...prev, recipeId]
    );
  };

  // Grocery List actions
  const handleAddIngredientsToGrocery = (ingredients: Ingredient[], recipeTitle: string) => {
    const newItems: GroceryItem[] = ingredients.map((ing, idx) => ({
      id: `grocery-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      category: ing.category || 'Pantry & Spices',
      checked: false,
      recipeTitle
    }));

    setGroceryList(prev => [...prev, ...newItems]);
  };

  const handleToggleGroceryItem = (id: string) => {
    setGroceryList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleRemoveGroceryItem = (id: string) => {
    setGroceryList(prev => prev.filter(item => item.id !== id));
  };

  const handleAddCustomGroceryItem = (name: string, category: string) => {
    const newItem: GroceryItem = {
      id: `grocery-${Date.now()}`,
      name,
      category,
      checked: false
    };
    setGroceryList(prev => [newItem, ...prev]);
  };

  const handleClearCompletedGrocery = () => {
    setGroceryList(prev => prev.filter(i => !i.checked));
  };

  const handleClearAllGrocery = () => {
    setGroceryList([]);
  };

  // Meal Planner actions
  const handleUpdateMealSlot = (
    dayIdx: number, 
    slot: 'breakfastRecipeId' | 'lunchRecipeId' | 'dinnerRecipeId', 
    recipeId?: string
  ) => {
    setMealPlan(prev => {
      const updated = [...prev];
      updated[dayIdx] = {
        ...updated[dayIdx],
        [slot]: recipeId
      };
      return updated;
    });
  };

  const handleRandomizeMealPlan = () => {
    const breakfastPool = allCombinedRecipes.filter(r => r.mealType === 'breakfast');
    const lunchPool = allCombinedRecipes.filter(r => r.mealType === 'lunch' || r.mealType === 'soup-salad');
    const dinnerPool = allCombinedRecipes.filter(r => r.mealType === 'dinner');

    setMealPlan(prev => prev.map(d => ({
      ...d,
      breakfastRecipeId: breakfastPool[Math.floor(Math.random() * breakfastPool.length)]?.id,
      lunchRecipeId: lunchPool[Math.floor(Math.random() * lunchPool.length)]?.id,
      dinnerRecipeId: dinnerPool[Math.floor(Math.random() * dinnerPool.length)]?.id
    })));
  };

  const handleClearMealPlan = () => {
    setMealPlan(prev => prev.map(d => ({
      day: d.day,
      breakfastRecipeId: undefined,
      lunchRecipeId: undefined,
      dinnerRecipeId: undefined
    })));
  };

  // Surprise me randomizer
  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * allCombinedRecipes.length);
    setSelectedRecipe(allCombinedRecipes[randomIndex]);
  };

  // Dietary Toggle
  const handleToggleDietary = (diet: DietaryRestriction) => {
    setSelectedDietary(prev => 
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMealType('all');
    setSelectedCuisine('all');
    setSelectedDietary([]);
    setSelectedDifficulty('all');
    setMaxTime(null);
    setShowFavoritesOnly(false);
    setShowCustomOnly(false);
    setSortBy('time');
  };

  // Quick banner discovery actions
  const handleQuickFilter = (tag: string) => {
    if (tag === 'Under 30 Min') {
      setMaxTime(30);
    } else if (tag === 'High-Protein') {
      setSelectedDietary(['High-Protein']);
    } else if (tag === 'Vegetarian & Vegan') {
      setSelectedDietary(['Vegetarian', 'Vegan']);
    } else if (tag === 'Italian') {
      setSelectedCuisine('Italian');
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery || 
    selectedMealType !== 'all' || 
    selectedCuisine !== 'all' || 
    selectedDietary.length > 0 || 
    selectedDifficulty !== 'all' || 
    maxTime !== null || 
    showFavoritesOnly ||
    showCustomOnly
  );

  // Filter and Sort Engine
  const filteredRecipes = useMemo(() => {
    return allCombinedRecipes.filter(recipe => {
      // My Custom Recipes Only filter
      if (showCustomOnly && !recipe.isCustom) {
        return false;
      }

      // Favorites Only filter
      if (showFavoritesOnly && !favorites.includes(recipe.id)) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = recipe.title.toLowerCase().includes(q);
        const matchesTagline = recipe.tagline.toLowerCase().includes(q);
        const matchesDesc = recipe.description.toLowerCase().includes(q);
        const matchesCuisine = recipe.cuisine.toLowerCase().includes(q);
        const matchesAuthor = recipe.author?.toLowerCase().includes(q);
        const matchesIngredients = recipe.ingredients.some(i => i.name.toLowerCase().includes(q));
        const matchesTags = recipe.tags?.some(t => t.toLowerCase().includes(q));
        const matchesDietary = recipe.dietary?.some(d => d.toLowerCase().includes(q));

        if (!matchesTitle && !matchesTagline && !matchesDesc && !matchesCuisine && !matchesAuthor && !matchesIngredients && !matchesTags && !matchesDietary) {
          return false;
        }
      }

      // Meal Type
      if (selectedMealType !== 'all' && recipe.mealType !== selectedMealType) {
        return false;
      }

      // Cuisine
      if (selectedCuisine !== 'all' && recipe.cuisine !== selectedCuisine) {
        return false;
      }

      // Difficulty
      if (selectedDifficulty !== 'all' && recipe.difficulty !== selectedDifficulty) {
        return false;
      }

      // Max Prep/Total Time
      if (maxTime !== null && recipe.totalTime > maxTime) {
        return false;
      }

      // Dietary (must match any of the selected dietary preferences)
      if (selectedDietary.length > 0) {
        const hasMatch = selectedDietary.some(diet => recipe.dietary?.includes(diet));
        if (!hasMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'time') return a.totalTime - b.totalTime;
      if (sortBy === 'protein') return (b.nutrition?.protein || 0) - (a.nutrition?.protein || 0);
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'calories') return a.calories - b.calories;
      if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
      return 0;
    });
  }, [
    allCombinedRecipes,
    searchQuery, 
    selectedMealType, 
    selectedCuisine, 
    selectedDietary, 
    selectedDifficulty, 
    maxTime, 
    sortBy, 
    showFavoritesOnly, 
    showCustomOnly,
    favorites
  ]);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* App Mode Install & Open Banner (appears only in web browser mode) */}
      <AppHeaderBanner onOpenInstallModal={() => setIsAppInstallModalOpen(true)} />

      {/* Sticky Navigation Header */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favoritesCount={favorites.length}
        groceryCount={groceryList.length}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => {
          setShowFavoritesOnly(!showFavoritesOnly);
          if (showCustomOnly) setShowCustomOnly(false);
        }}
        customRecipeCount={customRecipes.length}
        showCustomOnly={showCustomOnly}
        onToggleCustomOnly={() => {
          setShowCustomOnly(!showCustomOnly);
          if (showFavoritesOnly) setShowFavoritesOnly(false);
        }}
        onOpenAddRecipe={() => {
          setEditingRecipe(null);
          setIsAddRecipeOpen(true);
        }}
        onOpenGrocery={() => setIsGroceryOpen(true)}
        onOpenMealPlanner={() => setIsMealPlannerOpen(true)}
        onOpenProteinCalc={() => {
          setProteinPreselectRecipe(null);
          setIsProteinCalcOpen(true);
        }}
        proteinTargetGrams={proteinCalcTarget}
        onSurpriseMe={handleSurpriseMe}
        totalRecipeCount={allCombinedRecipes.length}
        onOpenPolls={() => setIsPollsOpen(true)}
        activePollsCount={polls.filter(p => p.status === 'active' || p.status === 'pending_moderator').length}
        isModerator={isModerator}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Editorial Top Hero Banner */}
        <StatsBanner
          recipes={allCombinedRecipes}
          onSelectCuisine={(cuisine) => setSelectedCuisine(cuisine as Cuisine)}
          onSelectQuickFilter={handleQuickFilter}
        />

        {/* Filter Toolbar */}
        <FilterBar
          selectedMealType={selectedMealType}
          onSelectMealType={setSelectedMealType}
          selectedCuisine={selectedCuisine}
          onSelectCuisine={setSelectedCuisine}
          selectedDietary={selectedDietary}
          onToggleDietary={handleToggleDietary}
          selectedDifficulty={selectedDifficulty}
          onSelectDifficulty={setSelectedDifficulty}
          maxTime={maxTime}
          onSelectMaxTime={setMaxTime}
          sortBy={sortBy}
          onSelectSortBy={setSortBy}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          resultCount={filteredRecipes.length}
        />

        {/* User-Generated Custom Recipes Studio Section */}
        {(showCustomOnly || customRecipes.length > 0) && (
          <UserCreationsSection
            userRecipes={customRecipes}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectRecipe={(r) => setSelectedRecipe(r)}
            onQuickCook={(r, e) => {
              e.stopPropagation();
              setCookingRecipe(r);
            }}
            onOpenAddRecipe={() => {
              setEditingRecipe(null);
              setIsAddRecipeOpen(true);
            }}
            onEditRecipe={handleEditCustomRecipe}
            onDeleteRecipe={handleDeleteCustomRecipe}
            onAddSampleRecipe={handleAddSampleRecipe}
            onNominateForPoll={(r) => {
              setIsPollsOpen(true);
            }}
            onOpenPolls={() => setIsPollsOpen(true)}
          />
        )}

        {/* Recipe Grid or Empty State */}
        {filteredRecipes.length > 0 ? (
          <div 
            id="recipes-catalog-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favorites.includes(recipe.id)}
                onToggleFavorite={handleToggleFavorite}
                onSelectRecipe={(r) => setSelectedRecipe(r)}
                onQuickCook={(r, e) => {
                  e.stopPropagation();
                  setCookingRecipe(r);
                }}
              />
            ))}
          </div>
        ) : (
          /* Empty Search/Filter State */
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs my-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              No Matching Recipes Found
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              We couldn't find any dishes matching your current filter selection or search query. You can add your own custom recipe or reset filters.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>

              <button
                onClick={() => {
                  setEditingRecipe(null);
                  setIsAddRecipeOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your Own Recipe</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
              <ChefHat className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-stone-800">100 Recipes</span>
            <span>— The Definitive Digital Cookbook & Culinary Companion</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setProteinPreselectRecipe(null);
                setIsProteinCalcOpen(true);
              }}
              className="text-amber-700 hover:underline font-bold cursor-pointer flex items-center gap-1"
            >
              <Dumbbell className="w-3.5 h-3.5 text-amber-600" />
              <span>Protein Calculator ({proteinCalcTarget}g)</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPollsOpen(true)}
              className="text-stone-600 hover:text-stone-900 hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <Vote className="w-3 h-3" />
              <span>Community Polls & Voting</span>
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setEditingRecipe(null);
                setIsAddRecipeOpen(true);
              }}
              className="text-stone-600 hover:text-stone-900 hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              <span>Add Recipe</span>
            </button>
            {customRecipes.length > 0 && (
              <button
                onClick={() => exportRecipesToJSON(customRecipes, 'my_custom_recipes.json')}
                className="text-stone-600 hover:text-stone-900 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Export ({customRecipes.length})</span>
              </button>
            )}
            <span>•</span>
            <span>Step-by-Step Cooking Mode</span>
          </div>
        </div>
      </footer>

      {/* Community Recipe Polls & Moderator Approval Modal */}
      <CommunityPollsModal
        isOpen={isPollsOpen}
        onClose={() => setIsPollsOpen(false)}
        polls={polls}
        userRecipes={customRecipes}
        onVote={handleVote}
        onAddComment={handleAddPollComment}
        onNominateRecipe={handleNominateRecipe}
        onModeratorApprove={handleModeratorApprove}
        onModeratorReject={handleModeratorReject}
        isModerator={isModerator}
        onToggleModerator={setIsModerator}
        onViewRecipe={(r) => {
          setIsPollsOpen(false);
          setSelectedRecipe(r);
        }}
      />

      {/* Protein Macro Calculator & Meal Tracker Modal */}
      <ProteinCalculatorModal
        isOpen={isProteinCalcOpen}
        onClose={() => {
          setIsProteinCalcOpen(false);
          setProteinPreselectRecipe(null);
        }}
        recipes={allCombinedRecipes}
        onSelectRecipe={(r) => {
          setIsProteinCalcOpen(false);
          setSelectedRecipe(r);
        }}
        profile={proteinProfile}
        onSaveProfile={setProteinProfile}
        trackerItems={proteinTrackerItems}
        onUpdateTrackerItems={setProteinTrackerItems}
        initialSelectedRecipe={proteinPreselectRecipe}
      />

      {/* Add / Upload Recipe Modal */}
      <AddRecipeModal
        isOpen={isAddRecipeOpen}
        onClose={() => {
          setIsAddRecipeOpen(false);
          setEditingRecipe(null);
        }}
        onSaveRecipe={handleSaveCustomRecipe}
        onImportRecipes={handleImportRecipes}
        editingRecipe={editingRecipe}
      />

      {/* Full Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isFavorite={favorites.includes(selectedRecipe.id)}
          onToggleFavorite={handleToggleFavorite}
          onStartCookMode={(r) => {
            setSelectedRecipe(null);
            setCookingRecipe(r);
          }}
          onAddIngredientsToGrocery={handleAddIngredientsToGrocery}
          onOpenMealPlannerForRecipe={(recipeId) => {
            setSelectedRecipe(null);
            setIsMealPlannerOpen(true);
          }}
          onEditCustomRecipe={handleEditCustomRecipe}
          onDeleteCustomRecipe={handleDeleteCustomRecipe}
          onNominateForPoll={(r) => {
            setSelectedRecipe(null);
            setIsPollsOpen(true);
          }}
          onOpenProteinCalculator={(r) => {
            setSelectedRecipe(null);
            setProteinPreselectRecipe(r || selectedRecipe);
            setIsProteinCalcOpen(true);
          }}
        />
      )}

      {/* Hands-Free Kitchen Cook Mode */}
      {cookingRecipe && (
        <CookModeModal
          recipe={cookingRecipe}
          onClose={() => setCookingRecipe(null)}
        />
      )}

      {/* Grocery Shopping List Drawer/Modal */}
      <GroceryListModal
        isOpen={isGroceryOpen}
        onClose={() => setIsGroceryOpen(false)}
        items={groceryList}
        onToggleItem={handleToggleGroceryItem}
        onRemoveItem={handleRemoveGroceryItem}
        onAddItem={handleAddCustomGroceryItem}
        onClearCompleted={handleClearCompletedGrocery}
        onClearAll={handleClearAllGrocery}
      />

      {/* Weekly 7-Day Meal Planner Modal */}
      <MealPlannerModal
        isOpen={isMealPlannerOpen}
        onClose={() => setIsMealPlannerOpen(false)}
        mealPlan={mealPlan}
        allRecipes={allCombinedRecipes}
        onUpdateSlot={handleUpdateMealSlot}
        onSelectRecipe={(r) => {
          setIsMealPlannerOpen(false);
          setSelectedRecipe(r);
        }}
        onAddAllPlanToGrocery={handleAddIngredientsToGrocery}
        onRandomizePlan={handleRandomizeMealPlan}
        onClearPlan={handleClearMealPlan}
      />

      {/* Standalone App Mode & Installation Modal */}
      <AppInstallModal
        isOpen={isAppInstallModalOpen}
        onClose={() => setIsAppInstallModalOpen(false)}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}

export default App;

