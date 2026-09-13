import React, { useState } from 'react';
import { Recipe, Ingredient } from '../types';
import { RecipeCard } from './RecipeCard';
import { 
  Sparkles, 
  Plus, 
  Upload, 
  Download, 
  ChefHat, 
  Video, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Search, 
  FileJson,
  CheckCircle2,
  Play,
  Vote,
  Award
} from 'lucide-react';
import { exportRecipesToJSON } from '../utils/storage';

interface UserCreationsSectionProps {
  userRecipes: Recipe[];
  favorites: string[];
  onToggleFavorite: (recipeId: string, e?: React.MouseEvent) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onQuickCook: (recipe: Recipe, e: React.MouseEvent) => void;
  onOpenAddRecipe: () => void;
  onEditRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onAddSampleRecipe: () => void;
  onNominateForPoll?: (recipe: Recipe) => void;
  onOpenPolls?: () => void;
}

export function UserCreationsSection({
  userRecipes,
  favorites,
  onToggleFavorite,
  onSelectRecipe,
  onQuickCook,
  onOpenAddRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onAddSampleRecipe,
  onNominateForPoll,
  onOpenPolls
}: UserCreationsSectionProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredUserRecipes = userRecipes.filter(r => {
    if (!localSearch.trim()) return true;
    const q = localSearch.toLowerCase().trim();
    return (
      r.title.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.ingredients.some(i => i.name.toLowerCase().includes(q)) ||
      (r.author && r.author.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs mb-10 overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-100/40 via-amber-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header section */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              My Recipe Studio & Community
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
              {userRecipes.length} {userRecipes.length === 1 ? 'Creation' : 'Creations'}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            User-Generated Recipes & Personal Creations
          </h2>
          <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
            Your personal digital recipe box. Create dishes from scratch with custom instructions and YouTube video links, or import recipes directly from JSON files.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onOpenPolls && (
            <button
              onClick={onOpenPolls}
              className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="View community polls or nominate dishes"
            >
              <Vote className="w-3.5 h-3.5 text-amber-700" />
              <span>Community Polls & Voting</span>
            </button>
          )}

          {userRecipes.length > 0 && (
            <button
              onClick={() => exportRecipesToJSON(userRecipes, 'my_custom_recipes.json')}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200/80 transition-colors flex items-center gap-2 cursor-pointer"
              title="Download all personal recipes as backup JSON"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Export JSON ({userRecipes.length})</span>
            </button>
          )}

          <button
            onClick={onOpenAddRecipe}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create / Upload Recipe</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {userRecipes.length > 0 ? (
        <div className="mt-6 space-y-6">
          {/* Internal Search / Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search your custom recipes..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="text-xs text-stone-500 font-medium">
              Showing {filteredUserRecipes.length} of {userRecipes.length} custom recipes
            </div>
          </div>

          {/* User Recipe Grid */}
          {filteredUserRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUserRecipes.map((recipe) => (
                <div key={recipe.id} className="relative group">
                  <RecipeCard
                    recipe={recipe}
                    isFavorite={favorites.includes(recipe.id)}
                    onToggleFavorite={onToggleFavorite}
                    onSelectRecipe={onSelectRecipe}
                    onQuickCook={onQuickCook}
                  />

                  {/* Floating Action Overlay on User Cards */}
                  <div className="absolute top-3 right-12 z-20 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRecipe(recipe);
                      }}
                      className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-md shadow-xs transition-transform hover:scale-105 cursor-pointer"
                      title="Edit this recipe"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${recipe.title}" from your recipe studio?`)) {
                          onDeleteRecipe(recipe.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md shadow-xs transition-transform hover:scale-105 cursor-pointer"
                      title="Delete recipe"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-stone-50 rounded-2xl p-8 text-center border border-stone-200/70">
              <p className="text-stone-600 text-sm">
                No custom recipes found matching <span className="font-semibold text-stone-900">"{localSearch}"</span>.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Empty State / Welcome Guide */
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div 
            onClick={onOpenAddRecipe}
            className="p-5 rounded-2xl bg-amber-50/70 hover:bg-amber-50 border border-amber-200/80 transition-all hover:shadow-sm cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-base text-stone-900 mb-1">
              Create From Scratch
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              Add ingredients, step timers, nutrition facts, and link a YouTube cooking tutorial.
            </p>
            <span className="text-xs font-bold text-amber-800 group-hover:underline inline-flex items-center gap-1">
              Open Form Builder &rarr;
            </span>
          </div>

          <div 
            onClick={onOpenAddRecipe}
            className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200 transition-all hover:shadow-sm cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileJson className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-base text-stone-900 mb-1">
              Import / Upload JSON
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              Drag-and-drop recipe files, import culinary JSON backups, or quick-paste recipe text.
            </p>
            <span className="text-xs font-bold text-stone-800 group-hover:underline inline-flex items-center gap-1">
              Upload Files &rarr;
            </span>
          </div>

          <div 
            onClick={onAddSampleRecipe}
            className="p-5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200/80 transition-all hover:shadow-sm cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-base text-stone-900 mb-1">
              Try Sample Creation
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              Instantly load a curated user recipe with a tagged YouTube video to preview features.
            </p>
            <span className="text-xs font-bold text-emerald-800 group-hover:underline inline-flex items-center gap-1">
              Load Sample Recipe &rarr;
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
