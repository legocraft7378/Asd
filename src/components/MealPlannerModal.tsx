import React, { useState } from 'react';
import { 
  X, 
  CalendarDays, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShoppingCart, 
  Utensils, 
  Shuffle, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { MealPlanDay, Recipe, Ingredient } from '../types';

interface MealPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealPlan: MealPlanDay[];
  allRecipes: Recipe[];
  onUpdateSlot: (dayIdx: number, slot: 'breakfastRecipeId' | 'lunchRecipeId' | 'dinnerRecipeId', recipeId?: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onAddAllPlanToGrocery: (ingredients: Ingredient[], title: string) => void;
  onRandomizePlan: () => void;
  onClearPlan: () => void;
}

export const MealPlannerModal: React.FC<MealPlannerModalProps> = ({
  isOpen,
  onClose,
  mealPlan,
  allRecipes,
  onUpdateSlot,
  onSelectRecipe,
  onAddAllPlanToGrocery,
  onRandomizePlan,
  onClearPlan
}) => {
  if (!isOpen) return null;

  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [selectingSlot, setSelectingSlot] = useState<{ dayIdx: number; slot: 'breakfastRecipeId' | 'lunchRecipeId' | 'dinnerRecipeId' } | null>(null);
  const [recipeFilter, setRecipeFilter] = useState('');
  const [addedGrocery, setAddedGrocery] = useState(false);

  const getRecipeById = (id?: string) => {
    if (!id) return null;
    return allRecipes.find(r => r.id === id) || null;
  };

  const handleExportGrocery = () => {
    const plannedRecipeIds = new Set<string>();
    mealPlan.forEach(day => {
      if (day.breakfastRecipeId) plannedRecipeIds.add(day.breakfastRecipeId);
      if (day.lunchRecipeId) plannedRecipeIds.add(day.lunchRecipeId);
      if (day.dinnerRecipeId) plannedRecipeIds.add(day.dinnerRecipeId);
    });

    plannedRecipeIds.forEach(id => {
      const r = allRecipes.find(item => item.id === id);
      if (r) {
        onAddAllPlanToGrocery(r.ingredients, r.title);
      }
    });

    setAddedGrocery(true);
    setTimeout(() => setAddedGrocery(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div 
        id="meal-planner-modal-container"
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Weekly Meal Planner
              </h2>
              <p className="text-xs text-stone-500">
                Plan breakfast, lunch, and dinner across 7 days from 100 recipes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRandomizePlan}
              title="Auto-fill meal plan with random recipes"
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Randomize Week</span>
            </button>

            <button
              onClick={handleExportGrocery}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{addedGrocery ? '✓ Added to Groceries!' : 'Export Groceries'}</span>
            </button>

            <button
              id="btn-close-meal-planner"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days Tab Bar */}
        <div className="flex items-center gap-1.5 px-6 pt-4 pb-2 border-b border-stone-100 overflow-x-auto bg-stone-50/70">
          {mealPlan.map((day, idx) => {
            const isSelected = activeDayIdx === idx;
            const count = [day.breakfastRecipeId, day.lunchRecipeId, day.dinnerRecipeId].filter(Boolean).length;
            return (
              <button
                key={day.day}
                onClick={() => setActiveDayIdx(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                <span>{day.day}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-amber-700 text-amber-100' : 'bg-stone-100 text-stone-500'
                }`}>
                  {count}/3
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Day Slots Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {(() => {
            const day = mealPlan[activeDayIdx];
            const slots: { key: 'breakfastRecipeId' | 'lunchRecipeId' | 'dinnerRecipeId'; label: string; icon: string }[] = [
              { key: 'breakfastRecipeId', label: 'Breakfast', icon: '☀️' },
              { key: 'lunchRecipeId', label: 'Lunch', icon: '🥗' },
              { key: 'dinnerRecipeId', label: 'Dinner', icon: '🍲' }
            ];

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    {day.day}'s Culinary Menu
                  </h3>
                  <span className="text-xs text-stone-500">
                    Click any slot to swap or choose a dish
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {slots.map(slot => {
                    const recipe = getRecipeById(day[slot.key]);
                    return (
                      <div
                        key={slot.key}
                        className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600">
                            <span>{slot.icon}</span>
                            <span>{slot.label}</span>
                          </div>

                          {recipe && (
                            <button
                              onClick={() => onUpdateSlot(activeDayIdx, slot.key, undefined)}
                              className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Clear slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {recipe ? (
                          <div 
                            onClick={() => onSelectRecipe(recipe)}
                            className="bg-white rounded-xl border border-stone-200 p-3 shadow-2xs cursor-pointer hover:shadow-md transition-shadow group flex items-center gap-3"
                          >
                            <img
                              src={recipe.image}
                              alt={recipe.title}
                              referrerPolicy="no-referrer"
                              className="w-14 h-14 rounded-lg object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold text-amber-700 uppercase line-clamp-1">
                                {recipe.cuisine} • {recipe.totalTime}m
                              </div>
                              <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                                {recipe.title}
                              </h4>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectingSlot({ dayIdx: activeDayIdx, slot: slot.key })}
                            className="w-full py-6 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-500 hover:bg-amber-50/50 text-stone-500 hover:text-amber-800 text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-5 h-5 text-amber-600" />
                            <span>Select {slot.label} Recipe</span>
                          </button>
                        )}

                        {recipe && (
                          <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                            <span>{recipe.calories} kcal</span>
                            <button
                              onClick={() => setSelectingSlot({ dayIdx: activeDayIdx, slot: slot.key })}
                              className="text-amber-700 font-semibold hover:underline cursor-pointer"
                            >
                              Swap Dish
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Recipe Picker Drawer / Modal overlay */}
        {selectingSlot && (
          <div className="p-6 bg-stone-100 border-t border-stone-200 max-h-72 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-stone-800">
                Choose a recipe for {mealPlan[selectingSlot.dayIdx].day} ({selectingSlot.slot.replace('RecipeId', '')}):
              </div>
              <button
                onClick={() => setSelectingSlot(null)}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <input
              type="text"
              value={recipeFilter}
              onChange={(e) => setRecipeFilter(e.target.value)}
              placeholder="Search by title, cuisine, ingredient..."
              className="w-full px-3.5 py-1.5 text-xs bg-white rounded-xl border border-stone-300 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {allRecipes
                .filter(r => r.title.toLowerCase().includes(recipeFilter.toLowerCase()) || r.cuisine.toLowerCase().includes(recipeFilter.toLowerCase()))
                .slice(0, 15)
                .map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      onUpdateSlot(selectingSlot.dayIdx, selectingSlot.slot, r.id);
                      setSelectingSlot(null);
                    }}
                    className="bg-white p-2.5 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50 cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <img src={r.image} alt={r.title} referrerPolicy="no-referrer" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-amber-700 font-bold">{r.cuisine}</div>
                      <div className="text-xs font-bold text-stone-900 truncate">{r.title}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div>
            Total Planned Recipes: <strong className="text-stone-800">{mealPlan.reduce((acc, d) => acc + [d.breakfastRecipeId, d.lunchRecipeId, d.dinnerRecipeId].filter(Boolean).length, 0)}</strong>
          </div>
          <button
            onClick={onClearPlan}
            className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
          >
            Clear Entire Week
          </button>
        </div>
      </div>
    </div>
  );
};
