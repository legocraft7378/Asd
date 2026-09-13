import React, { useState, useMemo } from 'react';
import { 
  X, 
  Dumbbell, 
  Flame, 
  Scale, 
  Heart, 
  Zap, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  ChevronRight, 
  Info, 
  Search, 
  Utensils, 
  Activity, 
  BookOpen, 
  PieChart, 
  Sliders,
  RotateCcw,
  Coffee,
  Sandwich,
  UtensilsCrossed,
  Cookie,
  Target
} from 'lucide-react';
import { Recipe, ProteinProfile, ProteinTrackerItem, WeightUnit, ActivityLevel, FitnessGoal } from '../types';
import { 
  calculateProteinRequirements, 
  ACTIVITY_PROTEIN_RANGES, 
  GOAL_ADJUSTMENTS, 
  COMMON_PROTEIN_FOODS,
  ProteinFoodSource
} from '../utils/proteinCalculator';

interface ProteinCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  profile: ProteinProfile;
  onSaveProfile: (profile: ProteinProfile) => void;
  trackerItems: ProteinTrackerItem[];
  onUpdateTrackerItems: (items: ProteinTrackerItem[]) => void;
  initialSelectedRecipe?: Recipe | null;
}

export const ProteinCalculatorModal: React.FC<ProteinCalculatorModalProps> = ({
  isOpen,
  onClose,
  recipes,
  onSelectRecipe,
  profile,
  onSaveProfile,
  trackerItems,
  onUpdateTrackerItems,
  initialSelectedRecipe
}) => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'tracker' | 'recipes' | 'foods'>('calculator');

  // Calculator Form State
  const [weight, setWeight] = useState<number>(profile.weight || 70);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(profile.weightUnit || 'kg');
  const [sex, setSex] = useState<'male' | 'female'>(profile.sex || 'male');
  const [age, setAge] = useState<number>(profile.age || 28);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel || 'moderate');
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal || 'muscle_gain');
  const [dailyMealsCount, setDailyMealsCount] = useState<number>(profile.dailyMealsCount || 4);
  const [customProtein, setCustomProtein] = useState<string>(
    profile.customProteinGrams ? String(profile.customProteinGrams) : ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Recipe Search in Tracker
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [selectedMealSlot, setSelectedMealSlot] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  
  // High Protein Explorer Filter
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogSort, setCatalogSort] = useState<'protein_desc' | 'density_desc'>('protein_desc');
  const [catalogDietFilter, setCatalogDietFilter] = useState<string>('all');

  // Food Guide Portion Calculator State
  const [selectedFood, setSelectedFood] = useState<ProteinFoodSource>(COMMON_PROTEIN_FOODS[0]);
  const [customGrams, setCustomGrams] = useState<number>(150);
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCategory, setFoodCategory] = useState<string>('all');

  // Compute live calculation results based on active form state
  const currentProfile: ProteinProfile = useMemo(() => ({
    weight: Number(weight) || 70,
    weightUnit,
    sex,
    age: Number(age) || 28,
    activityLevel,
    goal,
    dailyMealsCount: Number(dailyMealsCount) || 4,
    customProteinGrams: customProtein ? Number(customProtein) : undefined
  }), [weight, weightUnit, sex, age, activityLevel, goal, dailyMealsCount, customProtein]);

  const calcResult = useMemo(() => {
    return calculateProteinRequirements(currentProfile);
  }, [currentProfile]);

  // Compute tracker totals
  const totalLoggedProtein = useMemo(() => {
    return Math.round(trackerItems.reduce((sum, item) => sum + (item.protein * item.servings), 0) * 10) / 10;
  }, [trackerItems]);

  const totalLoggedCalories = useMemo(() => {
    return Math.round(trackerItems.reduce((sum, item) => sum + (item.calories * item.servings), 0));
  }, [trackerItems]);

  const progressPercent = Math.min(150, Math.round((totalLoggedProtein / (calcResult.recommendedGrams || 1)) * 100));

  // High Protein Recipes List
  const highProteinRecipes = useMemo(() => {
    return recipes
      .filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(catalogSearch.toLowerCase()) ||
          r.tagline?.toLowerCase().includes(catalogSearch.toLowerCase());

        const matchesDiet = catalogDietFilter === 'all' || 
          (r.dietary && r.dietary.some(d => d.toLowerCase().includes(catalogDietFilter.toLowerCase())));

        return matchesSearch && matchesDiet;
      })
      .map(r => {
        const protein = r.nutrition?.protein || 0;
        const calories = r.nutrition?.calories || 1;
        // Grams of protein per 100 kcal
        const density = Math.round((protein / (calories / 100)) * 10) / 10;
        return { recipe: r, protein, calories, density };
      })
      .sort((a, b) => {
        if (catalogSort === 'density_desc') {
          return b.density - a.density;
        }
        return b.protein - a.protein;
      });
  }, [recipes, catalogSearch, catalogSort, catalogDietFilter]);

  // Filtered Common Foods
  const filteredFoods = useMemo(() => {
    return COMMON_PROTEIN_FOODS.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(foodSearch.toLowerCase());
      const matchesCat = foodCategory === 'all' || f.category === foodCategory;
      return matchesSearch && matchesCat;
    });
  }, [foodSearch, foodCategory]);

  if (!isOpen) return null;

  const handleSaveProfileClick = () => {
    onSaveProfile(currentProfile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddRecipeToTracker = (r: Recipe, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const newItem: ProteinTrackerItem = {
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: r.title,
      protein: r.nutrition?.protein || 20,
      calories: r.nutrition?.calories || 400,
      servings: 1,
      mealType,
      recipeId: r.id
    };
    onUpdateTrackerItems([newItem, ...trackerItems]);
  };

  const handleAddFoodToTracker = (f: ProteinFoodSource, grams: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const ratio = grams / (f.servingGrams || 100);
    const calculatedProtein = Math.round(f.protein * ratio * 10) / 10;
    const calculatedCalories = Math.round(f.calories * ratio);

    const newItem: ProteinTrackerItem = {
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${f.name} (${grams}g)`,
      protein: calculatedProtein,
      calories: calculatedCalories,
      servings: 1,
      mealType
    };
    onUpdateTrackerItems([newItem, ...trackerItems]);
  };

  const handleRemoveTrackerItem = (id: string) => {
    onUpdateTrackerItems(trackerItems.filter(item => item.id !== id));
  };

  const handleClearTracker = () => {
    if (window.confirm('Clear all logged meals for today?')) {
      onUpdateTrackerItems([]);
    }
  };

  // 1-Click Auto Plan Generator
  const handleGenerateAutoPlan = () => {
    const target = calcResult.recommendedGrams;
    const breakfastCandidates = recipes.filter(r => r.mealType === 'breakfast' && (r.nutrition?.protein || 0) >= 15);
    const lunchCandidates = recipes.filter(r => (r.mealType === 'lunch' || r.mealType === 'soup-salad') && (r.nutrition?.protein || 0) >= 20);
    const dinnerCandidates = recipes.filter(r => r.mealType === 'dinner' && (r.nutrition?.protein || 0) >= 25);
    const snackCandidates = recipes.filter(r => (r.mealType === 'appetizer-snack' || r.mealType === 'dessert') && (r.nutrition?.protein || 0) >= 10);

    const pickRandom = (arr: Recipe[]) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    const b = pickRandom(breakfastCandidates) || recipes[0];
    const l = pickRandom(lunchCandidates) || recipes[1];
    const d = pickRandom(dinnerCandidates) || recipes[2];
    const s = pickRandom(snackCandidates);

    const newItems: ProteinTrackerItem[] = [
      {
        id: `auto-b-${Date.now()}`,
        name: b.title,
        protein: b.nutrition?.protein || 25,
        calories: b.nutrition?.calories || 400,
        servings: 1,
        mealType: 'breakfast',
        recipeId: b.id
      },
      {
        id: `auto-l-${Date.now()}`,
        name: l.title,
        protein: l.nutrition?.protein || 35,
        calories: l.nutrition?.calories || 550,
        servings: 1,
        mealType: 'lunch',
        recipeId: l.id
      },
      {
        id: `auto-d-${Date.now()}`,
        name: d.title,
        protein: d.nutrition?.protein || 45,
        calories: d.nutrition?.calories || 650,
        servings: 1,
        mealType: 'dinner',
        recipeId: d.id
      }
    ];

    if (s && target >= 120) {
      newItems.push({
        id: `auto-s-${Date.now()}`,
        name: s.title,
        protein: s.nutrition?.protein || 18,
        calories: s.nutrition?.calories || 250,
        servings: 1,
        mealType: 'snack',
        recipeId: s.id
      });
    }

    onUpdateTrackerItems(newItems);
    setActiveTab('tracker');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Protein Macro Calculator & Meal Tracker
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                  Science-Backed
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Personalized protein targets, muscle protein synthesis guidance & high-protein recipe matching
              </p>
            </div>
          </div>

          <button
            id="btn-close-protein-calc"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 border-b border-stone-200 bg-white flex items-center justify-between overflow-x-auto gap-2 py-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Target Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
                activeTab === 'tracker'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Daily Meal Tracker</span>
              {trackerItems.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'tracker' ? 'bg-stone-900 text-amber-300' : 'bg-amber-100 text-amber-800'
                }`}>
                  {totalLoggedProtein}g
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'recipes'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>High-Protein Recipes</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-600">
                {highProteinRecipes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('foods')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'foods'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Protein Food Guide</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-stone-400">Target:</span>
            <strong className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
              {calcResult.recommendedGrams}g / day
            </strong>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1 bg-stone-50/50">

          {/* TAB 1: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <span>Your Body & Lifestyle Profile</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Adjust your physical metrics to estimate exact daily protein requirements.
                  </p>
                </div>

                {/* Weight & Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Body Weight
                    </label>
                    <div className="flex rounded-xl border border-stone-200 overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-amber-500">
                      <input
                        type="number"
                        min="30"
                        max="300"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full px-3.5 py-2 text-sm font-bold text-stone-900 focus:outline-none bg-white"
                        placeholder="70"
                      />
                      <div className="flex bg-stone-100 border-l border-stone-200 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setWeightUnit('kg')}
                          className={`px-3 py-2 transition-colors cursor-pointer ${
                            weightUnit === 'kg' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          kg
                        </button>
                        <button
                          type="button"
                          onClick={() => setWeightUnit('lbs')}
                          className={`px-3 py-2 transition-colors cursor-pointer ${
                            weightUnit === 'lbs' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          lbs
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Age & Sex
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="14"
                        max="100"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-20 px-3 py-2 text-sm font-bold text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        title="Age in years"
                      />
                      <div className="flex-1 flex rounded-xl border border-stone-200 overflow-hidden text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setSex('male')}
                          className={`flex-1 py-2 text-center transition-colors cursor-pointer ${
                            sex === 'male' ? 'bg-stone-800 text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setSex('female')}
                          className={`flex-1 py-2 text-center transition-colors cursor-pointer ${
                            sex === 'female' ? 'bg-stone-800 text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Activity Level & Training Volume
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {(Object.keys(ACTIVITY_PROTEIN_RANGES) as ActivityLevel[]).map((levelKey) => {
                      const item = ACTIVITY_PROTEIN_RANGES[levelKey];
                      const isSelected = activityLevel === levelKey;
                      return (
                        <div
                          key={levelKey}
                          onClick={() => setActivityLevel(levelKey)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-400 text-stone-900'
                              : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <div className="text-xs">
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{item.label}</span>
                              <span className="text-[10px] font-normal text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded">
                                {item.min}-{item.max} g/kg
                              </span>
                            </div>
                            <div className="text-stone-500 text-[11px] leading-tight mt-0.5">
                              {item.description}
                            </div>
                          </div>
                          <div className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-stone-300'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Fitness Goal */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Primary Goal
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(GOAL_ADJUSTMENTS) as FitnessGoal[]).map((goalKey) => {
                      const g = GOAL_ADJUSTMENTS[goalKey];
                      const isSelected = goal === goalKey;
                      return (
                        <button
                          key={goalKey}
                          type="button"
                          onClick={() => setGoal(goalKey)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                              : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                          }`}
                        >
                          <span>{g.label}</span>
                          <span className={`text-[10px] mt-1 font-medium ${isSelected ? 'text-amber-300' : 'text-stone-500'}`}>
                            {g.multiplier > 1.0 ? `+${Math.round((g.multiplier - 1) * 100)}% intake` : 'Baseline'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Meals per Day & Custom Target */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Target Meals per Day
                    </label>
                    <div className="flex rounded-xl border border-stone-200 bg-stone-50 p-1 text-xs font-bold">
                      {[3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setDailyMealsCount(num)}
                          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            dailyMealsCount === num
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {num} Meals
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
                      <span>Custom Protein Override</span>
                      <span className="text-[10px] text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="400"
                        placeholder="e.g. 150"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-medium">
                        grams
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Profile Button */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSaveProfileClick}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savedSuccess ? 'Profile Saved!' : 'Save My Target Profile'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateAutoPlan}
                    className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Generate 1-Click High-Protein Day</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Dynamic Results Card & Insights */}
              <div className="lg:col-span-5 space-y-4">
                {/* Main Target Card */}
                <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 text-white p-6 rounded-3xl shadow-xl border border-stone-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Dumbbell className="w-32 h-32" />
                  </div>

                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Recommended Daily Intake
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {calcResult.isCustomTarget ? 'Custom Override' : 'Calculated'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-4xl sm:text-5xl font-black text-white tracking-tight">
                          {calcResult.recommendedGrams}
                        </span>
                        <span className="text-xl font-bold text-amber-400">grams / day</span>
                      </div>
                      <div className="text-xs text-stone-400 mt-1">
                        Optimal target range: <strong className="text-stone-200">{calcResult.minGrams}g – {calcResult.maxGrams}g</strong>
                      </div>
                    </div>

                    {/* Breakdown Metrics */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-800 text-xs">
                      <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/50">
                        <div className="text-stone-400 text-[11px]">Per Meal ({dailyMealsCount} meals)</div>
                        <div className="text-lg font-bold text-white mt-0.5">
                          ~{calcResult.perMealGrams}g
                        </div>
                        <div className="text-[10px] text-amber-400">
                          {calcResult.perMealGrams >= 25 ? '✓ Exceeds Leucine MPS threshold' : 'Aim for >25g per meal'}
                        </div>
                      </div>

                      <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/50">
                        <div className="text-stone-400 text-[11px]">Protein Calories</div>
                        <div className="text-lg font-bold text-white mt-0.5">
                          {calcResult.proteinCalories} kcal
                        </div>
                        <div className="text-[10px] text-stone-400">
                          ~{calcResult.proteinPercentOfCalories}% of estimated energy
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Science & Physiology Insights */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>Scientific Guidance & Research Notes</span>
                  </div>

                  <div className="space-y-2 text-xs text-stone-600 leading-relaxed">
                    {calcResult.insights.map((insight, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab('recipes')}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Explore matching high-protein recipes</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAILY MEAL TRACKER */}
          {activeTab === 'tracker' && (
            <div className="space-y-6">
              {/* Progress Banner */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                      <span>Today's Protein Tracker</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                        {totalLoggedProtein}g / {calcResult.recommendedGrams}g target
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Log recipes and foods to meet your daily muscle building and recovery target.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateAutoPlan}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Fill Day</span>
                    </button>

                    {trackerItems.length > 0 && (
                      <button
                        onClick={handleClearTracker}
                        className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-stone-700">
                    <span>Daily Protein Target Progress</span>
                    <span className={progressPercent >= 100 ? 'text-emerald-600 font-extrabold' : 'text-amber-700'}>
                      {progressPercent}% {progressPercent >= 100 ? '✓ Goal Reached!' : `(${Math.max(0, Math.round(calcResult.recommendedGrams - totalLoggedProtein))}g remaining)`}
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        progressPercent >= 100 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                          : 'bg-gradient-to-r from-amber-500 to-amber-600'
                      }`}
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>0g</span>
                    <span>Total calories logged: <strong className="text-stone-700">{totalLoggedCalories} kcal</strong></span>
                    <span>{calcResult.recommendedGrams}g target</span>
                  </div>
                </div>
              </div>

              {/* Logged Meal Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((slot) => {
                  const slotItems = trackerItems.filter(item => item.mealType === slot);
                  const slotProtein = Math.round(slotItems.reduce((sum, i) => sum + (i.protein * i.servings), 0) * 10) / 10;
                  const slotCalories = Math.round(slotItems.reduce((sum, i) => sum + (i.calories * i.servings), 0));
                  
                  const slotIcons = {
                    breakfast: <Coffee className="w-4 h-4 text-amber-600" />,
                    lunch: <Sandwich className="w-4 h-4 text-emerald-600" />,
                    dinner: <UtensilsCrossed className="w-4 h-4 text-indigo-600" />,
                    snack: <Cookie className="w-4 h-4 text-rose-600" />
                  };

                  return (
                    <div key={slot} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                          <div className="flex items-center gap-2">
                            {slotIcons[slot]}
                            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider capitalize">
                              {slot}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            {slotProtein}g Protein {slotCalories > 0 && `• ${slotCalories} kcal`}
                          </span>
                        </div>

                        {/* List of items */}
                        <div className="space-y-2 mt-3 min-h-[60px]">
                          {slotItems.length === 0 ? (
                            <div className="text-center py-4 text-xs text-stone-400 italic">
                              No items logged for {slot} yet.
                            </div>
                          ) : (
                            slotItems.map((item) => (
                              <div 
                                key={item.id}
                                className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                              >
                                <div className="truncate mr-2">
                                  <div className="font-bold text-stone-900 truncate">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-stone-500">
                                    {item.calories} kcal
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-extrabold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                                    {item.protein}g
                                  </span>
                                  <button
                                    onClick={() => handleRemoveTrackerItem(item.id)}
                                    className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Quick Add To Slot */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setSelectedMealSlot(slot);
                            setActiveTab('recipes');
                          }}
                          className="w-full py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Recipe from Catalog</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: HIGH-PROTEIN RECIPE FINDER */}
          {activeTab === 'recipes' && (
            <div className="space-y-5">
              {/* Filter controls */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search high-protein dishes, chicken, salmon, tofu..."
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={catalogDietFilter}
                    onChange={(e) => setCatalogDietFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold border border-stone-200 rounded-xl bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Dietary Preferences</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                    <option value="Keto">Keto</option>
                    <option value="High-Protein">High-Protein Tagged</option>
                  </select>

                  <select
                    value={catalogSort}
                    onChange={(e) => setCatalogSort(e.target.value as any)}
                    className="px-3 py-2 text-xs font-semibold border border-stone-200 rounded-xl bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="protein_desc">Highest Protein (g/serving)</option>
                    <option value="density_desc">Best Protein Density (g/100 kcal)</option>
                  </select>
                </div>
              </div>

              {/* Recipe Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {highProteinRecipes.slice(0, 24).map(({ recipe: r, protein, calories, density }) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                  >
                    <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                      <img
                        src={r.image}
                        alt={r.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-stone-900/90 text-amber-300 backdrop-blur-xs shadow-xs">
                          {protein}g Protein
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                          {calories} kcal
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-600 text-white shadow-xs">
                          {density}g / 100kcal
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          {r.cuisine} • {r.mealType}
                        </div>
                        <h4 className="font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-amber-700 transition-colors">
                          {r.title}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                          {r.tagline}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            onSelectRecipe(r);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Recipe
                        </button>

                        <button
                          onClick={() => {
                            handleAddRecipeToTracker(r, selectedMealSlot);
                            setActiveTab('tracker');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                          title={`Add to ${selectedMealSlot}`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Log to Tracker</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROTEIN FOOD GUIDE & PORTION CALCULATOR */}
          {activeTab === 'foods' && (
            <div className="space-y-6">
              {/* Interactive Portion Scaler Card */}
              <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-stone-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Interactive Portion & Protein Scaler
                    </span>
                    <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                      {selectedFood.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      handleAddFoodToTracker(selectedFood, customGrams, 'lunch');
                      setActiveTab('tracker');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log {customGrams}g to Meal Tracker</span>
                  </button>
                </div>

                {/* Slider and Live Values */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Adjust Custom Portion:</span>
                    <span className="text-amber-400 font-extrabold text-sm">{customGrams} grams</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="500"
                    step="5"
                    value={customGrams}
                    onChange={(e) => setCustomGrams(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
                  />

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-stone-800/70 p-3 rounded-2xl text-center border border-stone-700/50">
                      <div className="text-stone-400 text-[11px]">Total Protein</div>
                      <div className="text-xl font-bold text-amber-300 mt-0.5">
                        {Math.round((selectedFood.protein * (customGrams / selectedFood.servingGrams)) * 10) / 10}g
                      </div>
                    </div>

                    <div className="bg-stone-800/70 p-3 rounded-2xl text-center border border-stone-700/50">
                      <div className="text-stone-400 text-[11px]">Calories</div>
                      <div className="text-xl font-bold text-white mt-0.5">
                        {Math.round(selectedFood.calories * (customGrams / selectedFood.servingGrams))} kcal
                      </div>
                    </div>

                    <div className="bg-stone-800/70 p-3 rounded-2xl text-center border border-stone-700/50">
                      <div className="text-stone-400 text-[11px]">Leucine Quality</div>
                      <div className="text-sm font-bold text-emerald-400 mt-1">
                        {selectedFood.leucineRating} Bioavailability
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Food Reference Sheet & Search */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      value={foodSearch}
                      onChange={(e) => setFoodSearch(e.target.value)}
                      placeholder="Search whole foods, whey, chicken, eggs, lentils..."
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {['all', 'Meat & Poultry', 'Fish & Seafood', 'Dairy & Eggs', 'Plant-Based', 'Supplements & Grains'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFoodCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          foodCategory === cat
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        {cat === 'all' ? 'All Foods' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table of Foods */}
                <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto">
                  {filteredFoods.map((f) => {
                    const isSelected = selectedFood.id === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFood(f)}
                        className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected ? 'bg-amber-50/80 border border-amber-300' : 'hover:bg-stone-50'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-stone-900 flex items-center gap-2">
                            <span>{f.name}</span>
                            {f.isVegan && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Vegan
                              </span>
                            )}
                            {f.isVegetarian && !f.isVegan && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-green-100 text-green-800">
                                Veg
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            Base serving: {f.servingSize} • {f.category}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              {f.protein}g protein
                            </div>
                            <div className="text-[10px] text-stone-400 mt-0.5">
                              {f.calories} kcal
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFood(f);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Target calibrated to your physical profile ({calcResult.recommendedGrams}g/day)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
