import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Clock, 
  Flame, 
  Users, 
  ChefHat, 
  Sparkles, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Play, 
  Check, 
  Wine, 
  Lightbulb, 
  Share2, 
  Printer, 
  CalendarDays,
  Download,
  Edit,
  Trash2,
  Video,
  ExternalLink,
  Film,
  Award,
  Vote,
  ShieldCheck,
  Search,
  Dumbbell,
  Timer as TimerIcon
} from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { exportRecipesToJSON } from '../utils/storage';
import { getRecipeYoutubeVideo, getYouTubeSearchUrl } from '../utils/youtube';
import { YoutubePlayer } from './YoutubePlayer';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onStartCookMode: (recipe: Recipe) => void;
  onAddIngredientsToGrocery: (ingredients: Ingredient[], recipeTitle: string) => void;
  onOpenMealPlannerForRecipe: (recipeId: string) => void;
  onEditCustomRecipe?: (recipe: Recipe) => void;
  onDeleteCustomRecipe?: (recipeId: string) => void;
  onNominateForPoll?: (recipe: Recipe) => void;
  onOpenProteinCalculator?: (recipe?: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  isFavorite,
  onToggleFavorite,
  onStartCookMode,
  onAddIngredientsToGrocery,
  onOpenMealPlannerForRecipe,
  onEditCustomRecipe,
  onDeleteCustomRecipe,
  onNominateForPoll,
  onOpenProteinCalculator
}) => {
  if (!recipe) return null;

  const [servings, setServings] = useState<number>(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedGrocery, setAddedGrocery] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(true);

  // Compute YouTube Video Info
  const videoInfo = getRecipeYoutubeVideo(recipe.title, recipe.youtubeUrl, recipe.cuisine);

  // Scaling factor
  const scaleRatio = servings / recipe.servings;

  const formatAmount = (baseAmount: number): string => {
    const scaled = baseAmount * scaleRatio;
    if (scaled === 0) return '';
    // Format nicely like 1/2, 1/4, 1/3, or decimals
    if (Math.abs(scaled - 0.25) < 0.05) return '1/4';
    if (Math.abs(scaled - 0.33) < 0.05) return '1/3';
    if (Math.abs(scaled - 0.5) < 0.05) return '1/2';
    if (Math.abs(scaled - 0.66) < 0.05) return '2/3';
    if (Math.abs(scaled - 0.75) < 0.05) return '3/4';
    if (Math.abs(scaled - 1.5) < 0.05) return '1 1/2';
    if (Math.abs(scaled - 2.5) < 0.05) return '2 1/2';
    return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1).replace(/\.0$/, '');
  };

  const toggleIngredientCheck = (idx: number) => {
    setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStepCheck = (stepNum: number) => {
    setCheckedSteps(prev => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const handleAddAllGrocery = () => {
    // Scale ingredients to current servings
    const scaledIngredients: Ingredient[] = recipe.ingredients.map(ing => ({
      ...ing,
      amount: ing.amount ? Number((ing.amount * scaleRatio).toFixed(2)) : ing.amount
    }));
    onAddIngredientsToGrocery(scaledIngredients, recipe.title);
    setAddedGrocery(true);
    setTimeout(() => setAddedGrocery(false), 2500);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    exportRecipesToJSON([recipe], `${recipe.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_recipe.json`);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      onDeleteCustomRecipe?.(recipe.id);
      onClose();
    }
  };

  // Group ingredients by category
  const categories = Array.from(new Set(recipe.ingredients.map(i => i.category || 'Main Ingredients')));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div 
        id="recipe-detail-modal-container"
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Sticky Header Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900">
              {recipe.cuisine}
            </span>
            {recipe.isPromotedToOfficial ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 flex items-center gap-1 shadow-xs">
                <Award className="w-3.5 h-3.5" />
                <span>👑 Promoted • Moderator Verified</span>
              </span>
            ) : recipe.isCustom ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white">
                ★ Custom Recipe
              </span>
            ) : (
              <span className="text-xs text-stone-400 font-medium hidden sm:inline">
                Recipe #{recipe.id.replace('recipe-', '')} of 100
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {recipe.isCustom && onNominateForPoll && !recipe.isPromotedToOfficial && (
              <button
                onClick={() => onNominateForPoll(recipe)}
                title="Nominate this recipe for Community Voting"
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Vote className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Start Community Poll</span>
              </button>
            )}

            {recipe.isCustom && onEditCustomRecipe && (
              <button
                onClick={() => {
                  onClose();
                  onEditCustomRecipe(recipe);
                }}
                title="Edit this recipe"
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {recipe.isCustom && onDeleteCustomRecipe && (
              <button
                onClick={handleDelete}
                title="Delete this custom recipe"
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleExportJSON}
              title="Download Recipe JSON file"
              className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer hidden sm:block"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => onToggleFavorite(recipe.id)}
              title="Save to favorites"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isFavorite 
                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              title="Copy recipe link"
              className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              title="Print recipe"
              className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer hidden sm:block"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              id="btn-close-recipe-detail"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden aspect-4/3 md:aspect-square bg-stone-100 shadow-md">
              <img
                src={recipe.image}
                alt={recipe.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                {recipe.dietary?.map(d => (
                  <span key={d} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                  {recipe.tagline}
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight mb-3">
                  {recipe.title}
                </h1>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  {recipe.description}
                </p>

                {recipe.author && (
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-5">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <ChefHat className="w-3.5 h-3.5" />
                    </div>
                    <span>Created by <strong className="text-stone-800">{recipe.author}</strong></span>
                  </div>
                )}
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-4 gap-2 bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-center">
                <div>
                  <div className="text-xs text-stone-400 font-medium">Prep</div>
                  <div className="text-sm font-bold text-stone-800">{recipe.prepTime}m</div>
                </div>
                <div>
                  <div className="text-xs text-stone-400 font-medium">Cook</div>
                  <div className="text-sm font-bold text-stone-800">{recipe.cookTime}m</div>
                </div>
                <div>
                  <div className="text-xs text-stone-400 font-medium">Total</div>
                  <div className="text-sm font-bold text-amber-700">{recipe.totalTime}m</div>
                </div>
                <div>
                  <div className="text-xs text-stone-400 font-medium">Calories</div>
                  <div className="text-sm font-bold text-stone-800">{recipe.calories}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  id="btn-start-cook-mode"
                  onClick={() => onStartCookMode(recipe)}
                  className="flex-1 min-w-[170px] py-3 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Cooking Mode</span>
                </button>

                <a
                  id="btn-modal-search-youtube"
                  href={recipe.youtubeUrl || getYouTubeSearchUrl(recipe.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  title={`Search "${recipe.title}" on YouTube`}
                >
                  <Search className="w-4 h-4" />
                  <span>Search on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <button
                  onClick={() => onOpenMealPlannerForRecipe(recipe.id)}
                  className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <CalendarDays className="w-4 h-4 text-stone-600" />
                  <span>Add to Plan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Nutrition Strip */}
          {recipe.nutrition && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Nutritional Profile (Per Serving)</span>
                  {recipe.nutrition.protein >= 25 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-amber-600 text-white">
                      High Protein
                    </span>
                  )}
                </div>

                {onOpenProteinCalculator && (
                  <button
                    id="btn-modal-protein-calc"
                    onClick={() => onOpenProteinCalculator(recipe)}
                    className="px-3 py-1 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Calculate Protein Needs</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                  <div className="font-bold text-stone-900 text-sm">{recipe.nutrition.calories}</div>
                  <div className="text-stone-500 text-[10px]">Calories</div>
                </div>
                <div className="bg-amber-100/70 p-2.5 rounded-xl border border-amber-300 shadow-2xs">
                  <div className="font-extrabold text-amber-900 text-sm">{recipe.nutrition.protein}g</div>
                  <div className="text-amber-800 text-[10px] font-bold">Protein</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                  <div className="font-bold text-stone-900 text-sm">{recipe.nutrition.carbs}g</div>
                  <div className="text-stone-500 text-[10px]">Carbs</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                  <div className="font-bold text-stone-900 text-sm">{recipe.nutrition.fat}g</div>
                  <div className="text-stone-500 text-[10px]">Fat</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                  <div className="font-bold text-stone-900 text-sm">{recipe.nutrition.fiber || 0}g</div>
                  <div className="text-stone-500 text-[10px]">Fiber</div>
                </div>
              </div>
            </div>
          )}

          {/* Moderator Approval Banner if Promoted */}
          {recipe.isPromotedToOfficial && (
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/50 to-emerald-50 border border-amber-300 rounded-3xl p-5 flex items-start gap-4 shadow-xs">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    Official Community Hall of Fame Selection
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                    Moderator Approved
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  This dish was crafted by <span className="font-bold">{recipe.author}</span> and voted into the official menu by community chefs, then reviewed and confirmed by a Chef Moderator.
                </p>
                {recipe.promotedDate && (
                  <p className="text-[11px] text-stone-500">
                    Official inclusion date: {new Date(recipe.promotedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* YouTube Video Masterclass Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-red-600" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                  {recipe.isCustom && recipe.youtubeUrl ? 'Custom Attached Cooking Tutorial' : 'Pinned Masterclass Video Tutorial'}
                </h3>
              </div>
              {recipe.isCustom && onEditCustomRecipe && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditCustomRecipe(recipe);
                  }}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3 h-3" />
                  <span>{recipe.youtubeUrl ? 'Change Video' : '+ Add Video Link'}</span>
                </button>
              )}
            </div>

            <YoutubePlayer 
              videoInfo={videoInfo} 
              recipeTitle={recipe.title} 
            />
          </div>

          {/* Servings Adjuster & Ingredients Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Ingredients Checklist
                </h3>
                <p className="text-xs text-stone-500">
                  Check off items as you gather them or add directly to your shopping list
                </p>
              </div>

              {/* Servings Scaler */}
              <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
                <span className="text-xs font-semibold text-stone-600 px-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Servings:</span>
                </span>
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-7 h-7 rounded-xl bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-stone-900 w-6 text-center">{servings}</span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="w-7 h-7 rounded-xl bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Categorized Ingredients */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const catIngredients = recipe.ingredients.filter(
                  i => (i.category || 'Main Ingredients') === cat
                );
                return (
                  <div key={cat} className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-4">
                    <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5 pb-1 border-b border-stone-200/60">
                      {cat}
                    </div>
                    <div className="space-y-2">
                      {catIngredients.map((ing, idx) => {
                        const originalIdx = recipe.ingredients.indexOf(ing);
                        const isChecked = !!checkedIngredients[originalIdx];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleIngredientCheck(originalIdx)}
                            className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors cursor-pointer select-none ${
                              isChecked ? 'bg-emerald-50/70 text-stone-400 line-through' : 'hover:bg-white text-stone-800'
                            }`}
                          >
                            <div className={`w-4.5 h-4.5 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 bg-white'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="text-xs leading-relaxed flex-1">
                              <span className="font-bold text-stone-900 mr-1">
                                {formatAmount(ing.amount)} {ing.unit}
                              </span>
                              <span>{ing.name}</span>
                              {ing.notes && (
                                <span className="text-stone-400 italic text-[11px] block">
                                  ({ing.notes})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add to Grocery List Button */}
            <div className="pt-2">
              <button
                id="btn-add-all-to-grocery"
                onClick={handleAddAllGrocery}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{addedGrocery ? '✓ Added to Grocery List!' : `Add All Ingredients to Shopping List (${servings} servings)`}</span>
              </button>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-4">
            <div className="pb-3 border-b border-stone-200">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Cooking Instructions
              </h3>
              <p className="text-xs text-stone-500">
                Detailed chef steps with built-in culinary timers
              </p>
            </div>

            <div className="space-y-4">
              {recipe.instructions.map((step) => {
                const isStepChecked = !!checkedSteps[step.stepNumber];
                return (
                  <div
                    key={step.stepNumber}
                    className={`p-4 rounded-2xl border transition-all ${
                      isStepChecked 
                        ? 'bg-emerald-50/50 border-emerald-200 text-stone-500' 
                        : 'bg-white border-stone-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => toggleStepCheck(step.stepNumber)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-colors ${
                          isStepChecked 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        }`}
                      >
                        {isStepChecked ? <Check className="w-4 h-4" /> : step.stepNumber}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-bold ${isStepChecked ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                            {step.title}
                          </h4>
                          {step.timerMinutes && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
                              <TimerIcon className="w-3 h-3" />
                              {step.timerMinutes} min timer
                            </span>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed ${isStepChecked ? 'line-through text-stone-400' : 'text-stone-600'}`}>
                          {step.instruction}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chef Tips & Beverage Pairing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-200">
            {recipe.chefTips && recipe.chefTips.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Chef's Pro Secrets</span>
                </div>
                <ul className="text-xs text-amber-950 space-y-1.5 list-disc list-inside leading-relaxed">
                  {recipe.chefTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {recipe.pairing && (
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800 mb-2">
                  <Wine className="w-4 h-4 text-rose-600" />
                  <span>Beverage Pairing</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {recipe.pairing}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
