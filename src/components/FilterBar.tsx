import React from 'react';
import { 
  SlidersHorizontal, 
  Utensils, 
  Globe2, 
  Check, 
  RotateCcw, 
  Flame, 
  Clock, 
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { MealType, Cuisine, DietaryRestriction, DifficultyLevel } from '../types';
import { MEAL_TYPES, CUISINES, DIETARY_OPTIONS } from '../data/allRecipes';

interface FilterBarProps {
  selectedMealType: MealType | 'all';
  onSelectMealType: (type: MealType | 'all') => void;
  selectedCuisine: Cuisine | 'all';
  onSelectCuisine: (cuisine: Cuisine | 'all') => void;
  selectedDietary: DietaryRestriction[];
  onToggleDietary: (diet: DietaryRestriction) => void;
  selectedDifficulty: DifficultyLevel | 'all';
  onSelectDifficulty: (difficulty: DifficultyLevel | 'all') => void;
  maxTime: number | null; // minutes
  onSelectMaxTime: (time: number | null) => void;
  sortBy: 'time' | 'calories' | 'reviews' | 'name' | 'protein';
  onSelectSortBy: (sort: 'time' | 'calories' | 'reviews' | 'name' | 'protein') => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedMealType,
  onSelectMealType,
  selectedCuisine,
  onSelectCuisine,
  selectedDietary,
  onToggleDietary,
  selectedDifficulty,
  onSelectDifficulty,
  maxTime,
  onSelectMaxTime,
  sortBy,
  onSelectSortBy,
  onResetFilters,
  hasActiveFilters,
  resultCount
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <div className="space-y-4 mb-8">
      {/* Primary Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {MEAL_TYPES.map((cat) => {
          const isSelected = selectedMealType === cat.id;
          return (
            <button
              key={cat.id}
              id={`meal-tab-${cat.id}`}
              onClick={() => onSelectMealType(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/20'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                isSelected ? 'bg-amber-700 text-amber-100' : 'bg-stone-100 text-stone-500'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Controls Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Cuisine Selector */}
            <div className="relative">
              <select
                id="cuisine-filter-select"
                value={selectedCuisine}
                onChange={(e) => onSelectCuisine(e.target.value as Cuisine | 'all')}
                className="appearance-none bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold px-3.5 py-2 pr-8 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                <option value="all">🌍 All Cuisines</option>
                {CUISINES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Globe2 className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Time Filter */}
            <div className="relative">
              <select
                id="time-filter-select"
                value={maxTime || 'all'}
                onChange={(e) => onSelectMaxTime(e.target.value === 'all' ? null : Number(e.target.value))}
                className="appearance-none bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold px-3.5 py-2 pr-8 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                <option value="all">⏱️ Any Time</option>
                <option value="20">⚡ Under 20 min</option>
                <option value="30">⏱️ Under 30 min</option>
                <option value="45">⏱️ Under 45 min</option>
                <option value="60">⏱️ Under 1 hour</option>
              </select>
              <Clock className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Difficulty Filter */}
            <div className="relative">
              <select
                id="difficulty-filter-select"
                value={selectedDifficulty}
                onChange={(e) => onSelectDifficulty(e.target.value as DifficultyLevel | 'all')}
                className="appearance-none bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold px-3.5 py-2 pr-8 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                <option value="all">🍳 Any Difficulty</option>
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard / Masterclass</option>
              </select>
              <Flame className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Toggle Dietary Pills Filter Drawer */}
            <button
              id="btn-toggle-advanced-filters"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                selectedDietary.length > 0 || showAdvanced
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              <span>Dietary Tags</span>
              {selectedDietary.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-bold">
                  {selectedDietary.length}
                </span>
              )}
            </button>
          </div>

          {/* Right Sort & Reset */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-400 font-medium hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  id="sort-by-select"
                  value={sortBy}
                  onChange={(e) => onSelectSortBy(e.target.value as any)}
                  className="appearance-none bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold px-3 py-2 pr-8 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                >
                  <option value="time">⚡ Fastest Time</option>
                  <option value="protein">🥩 Highest Protein</option>
                  <option value="name">🔤 Alphabetical (A-Z)</option>
                  <option value="calories">🥗 Lowest Calories</option>
                  <option value="reviews">🔥 Most Popular</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                id="btn-reset-filters"
                onClick={onResetFilters}
                title="Reset all filters"
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Dietary Checkbox Pills Drawer */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <div className="text-xs font-bold text-stone-700 mb-2 flex items-center justify-between">
              <span>Filter by Dietary Restrictions & Lifestyles:</span>
              {selectedDietary.length > 0 && (
                <button
                  onClick={() => selectedDietary.forEach(d => onToggleDietary(d))}
                  className="text-amber-600 hover:text-amber-700 text-xs font-medium cursor-pointer"
                >
                  Clear dietary tags
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map((diet) => {
                const isSelected = selectedDietary.includes(diet);
                return (
                  <button
                    key={diet}
                    id={`dietary-chip-${diet.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onToggleDietary(diet)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-white font-semibold shadow-2xs ring-1 ring-amber-500'
                        : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{diet}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Result Count Info */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <div>
          Showing <span className="font-semibold text-stone-800">{resultCount}</span> of 100 recipes
        </div>
        {hasActiveFilters && (
          <span className="text-amber-700 font-medium">Filtered results</span>
        )}
      </div>
    </div>
  );
};
