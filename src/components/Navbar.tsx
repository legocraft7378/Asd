import React from 'react';
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  CalendarDays, 
  Sparkles, 
  ChefHat, 
  X,
  Plus,
  BookOpen,
  Upload,
  Vote,
  ShieldCheck,
  Dumbbell
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  favoritesCount: number;
  groceryCount: number;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  customRecipeCount: number;
  showCustomOnly: boolean;
  onToggleCustomOnly: () => void;
  onOpenAddRecipe: () => void;
  onOpenGrocery: () => void;
  onOpenMealPlanner: () => void;
  onOpenProteinCalc?: () => void;
  proteinTargetGrams?: number;
  onSurpriseMe: () => void;
  totalRecipeCount: number;
  onOpenPolls: () => void;
  activePollsCount: number;
  isModerator?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  favoritesCount,
  groceryCount,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  customRecipeCount,
  showCustomOnly,
  onToggleCustomOnly,
  onOpenAddRecipe,
  onOpenGrocery,
  onOpenMealPlanner,
  onOpenProteinCalc,
  proteinTargetGrams,
  onSurpriseMe,
  totalRecipeCount,
  onOpenPolls,
  activePollsCount,
  isModerator = false
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-6">
          {/* Brand Logo & Tag */}
          <div 
            id="brand-logo-container"
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            onClick={() => {
              onSearchChange('');
              if (showFavoritesOnly) onToggleFavoritesOnly();
              if (showCustomOnly) onToggleCustomOnly();
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm ring-2 ring-amber-500/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-xl tracking-tight text-stone-900">
                  100+ Recipes
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Culinary Library
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Curated global dishes & step-by-step masterclasses
              </p>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="flex-1 max-w-lg relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={`Search ${totalRecipeCount} recipes, ingredients, cuisines...`}
                className="w-full pl-10 pr-9 py-2 text-sm bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-stone-900 placeholder:text-stone-400 rounded-full border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
              />
              {searchQuery && (
                <button
                  id="btn-clear-search"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-stone-400 hover:text-stone-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* In-App PWA Install Prompt */}
            <PWAInstallButton />

            {/* Add / Upload Recipe Primary Button */}
            <button
              id="btn-open-add-recipe"
              onClick={onOpenAddRecipe}
              title="Add or upload your own recipe"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Recipe</span>
            </button>

            {/* My Uploaded Recipes Toggle (if any exist) */}
            {customRecipeCount > 0 && (
              <button
                id="btn-toggle-custom-recipes"
                onClick={onToggleCustomOnly}
                title="View your custom uploaded recipes"
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  showCustomOnly
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden lg:inline">My Recipes</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  showCustomOnly ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {customRecipeCount}
                </span>
              </button>
            )}

            {/* Community Polls & Voting Portal */}
            <button
              id="btn-open-polls"
              onClick={onOpenPolls}
              title="Community Recipe Polls & Moderator Confirmation"
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs ${
                isModerator
                  ? 'bg-emerald-500 text-stone-950 hover:bg-emerald-400'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
            >
              <Vote className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Polls</span>
              {activePollsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isModerator ? 'bg-stone-900 text-amber-300' : 'bg-amber-600 text-white'
                }`}>
                  {activePollsCount}
                </span>
              )}
            </button>

            {/* Protein Macro Calculator */}
            {onOpenProteinCalc && (
              <button
                id="btn-open-protein-calc"
                onClick={onOpenProteinCalc}
                title="Protein Macro Calculator & Meal Tracker"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 border border-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                <Dumbbell className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Protein Calc</span>
                {proteinTargetGrams && (
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {proteinTargetGrams}g
                  </span>
                )}
              </button>
            )}

            {/* Surprise / Random Recipe */}
            <button
              id="btn-surprise-me"
              onClick={onSurpriseMe}
              title="Surprise me with a random recipe"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Surprise Me</span>
            </button>

            {/* Meal Planner */}
            <button
              id="btn-open-meal-planner"
              onClick={onOpenMealPlanner}
              title="Weekly Meal Planner"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden lg:inline">Meal Plan</span>
            </button>

            {/* Grocery List */}
            <button
              id="btn-open-grocery-list"
              onClick={onOpenGrocery}
              title="Grocery Shopping List"
              className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden md:inline">Grocery</span>
              {groceryCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  {groceryCount}
                </span>
              )}
            </button>

            {/* Saved Favorites Toggle */}
            <button
              id="btn-toggle-favorites"
              onClick={onToggleFavoritesOnly}
              title="Filter by Favorites"
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                showFavoritesOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : 'text-stone-500'}`} />
              <span className="hidden sm:inline">Favorites</span>
              {favoritesCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  showFavoritesOnly ? 'bg-rose-500 text-white' : 'bg-stone-200 text-stone-700'
                }`}>
                  {favoritesCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
