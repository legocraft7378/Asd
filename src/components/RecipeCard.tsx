import React from 'react';
import { 
  Heart, 
  Clock, 
  Flame, 
  Users,
  Sparkles,
  ArrowRight,
  Play,
  Award,
  Search
} from 'lucide-react';
import { Recipe } from '../types';
import { getYouTubeSearchUrl } from '../utils/youtube';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onQuickCook: (recipe: Recipe, e: React.MouseEvent) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onSelectRecipe,
  onQuickCook
}) => {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div
      id={`recipe-card-${recipe.id}`}
      onClick={() => onSelectRecipe(recipe)}
      className="group bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        {/* Placeholder shimmer while loading */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-stone-200 animate-pulse" />
        )}

        <img
          src={imgError ? 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80' : recipe.image}
          alt={recipe.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Cuisine & Dietary Chips (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[75%]">
          {recipe.isPromotedToOfficial ? (
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-500 text-stone-950 backdrop-blur-xs shadow-md border border-amber-300 flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>👑 Promoted</span>
            </span>
          ) : recipe.isCustom ? (
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-white backdrop-blur-xs shadow-xs border border-amber-400">
              ★ Your Recipe
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white/95 text-stone-800 backdrop-blur-xs shadow-xs border border-white/40">
              {recipe.cuisine}
            </span>
          )}
          {recipe.dietary && recipe.dietary.length > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-900/80 text-white backdrop-blur-xs">
              {recipe.dietary[0]}
            </span>
          )}
          {/* Video Search Badge */}
          {(!recipe.isCustom || !!recipe.youtubeUrl) && (
            <a
              href={recipe.youtubeUrl || getYouTubeSearchUrl(recipe.title)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-600 hover:bg-red-700 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              title={`Search "${recipe.title}" on YouTube`}
            >
              <Play className="w-2.5 h-2.5 fill-white" />
              <span>YouTube</span>
            </a>
          )}
        </div>

        {/* Favorite Heart Button (Top Right) */}
        <button
          id={`btn-favorite-${recipe.id}`}
          onClick={(e) => onToggleFavorite(recipe.id, e)}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 hover:bg-white text-stone-600 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Bottom Image Stats (Total Time & Servings) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{recipe.totalTime} min</span>
          </div>

          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tagline / Subtitle */}
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1 line-clamp-1">
            {recipe.tagline}
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg group-hover:text-amber-700 transition-colors leading-snug line-clamp-2 mb-2">
            {recipe.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
            {recipe.description}
          </p>
        </div>

        {/* Card Footer Meta */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
            <span className="text-stone-400 font-medium flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              {recipe.calories}
            </span>
            {recipe.nutrition?.protein && (
              <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200/70 px-1.5 py-0.2 rounded text-[10px]">
                {recipe.nutrition.protein}g protein
              </span>
            )}
          </div>

          <button
            onClick={(e) => onQuickCook(recipe, e)}
            className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer group-hover:translate-x-0.5 transition-transform"
          >
            <span>Cook</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
