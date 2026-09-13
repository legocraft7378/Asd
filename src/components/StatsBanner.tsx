import React from 'react';
import { ChefHat, Globe2, Sparkles, Flame, Clock, HeartHandshake } from 'lucide-react';
import { Recipe } from '../types';

interface StatsBannerProps {
  recipes: Recipe[];
  onSelectCuisine: (c: string) => void;
  onSelectQuickFilter: (tag: string) => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  recipes,
  onSelectCuisine,
  onSelectQuickFilter
}) => {
  const cuisines = Array.from(new Set(recipes.map(r => r.cuisine)));

  return (
    <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-amber-950 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
      {/* Subtle background decorative shapes */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -top-12 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Comprehensive 100+ Recipe Catalog
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
              Master 100+ Essential Global Dishes
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Explore 100+ culinary recipes across Italian pastas, French bistro classics, Japanese ramen, Mexican street tacos, Thai curries, Mediterranean bowls, and artisanal desserts.
            </p>

            {/* Quick Filter Discovery Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs text-stone-400 font-medium">Quick Discovery:</span>
              <button
                onClick={() => onSelectQuickFilter('Under 30 Min')}
                className="px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-medium border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3 h-3 text-amber-400" />
                Under 30 Min
              </button>
              <button
                onClick={() => onSelectQuickFilter('High-Protein')}
                className="px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-medium border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Flame className="w-3 h-3 text-orange-400" />
                High-Protein
              </button>
              <button
                onClick={() => onSelectQuickFilter('Vegetarian & Vegan')}
                className="px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-medium border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <HeartHandshake className="w-3 h-3 text-emerald-400" />
                Plant-Based
              </button>
              <button
                onClick={() => onSelectQuickFilter('Italian')}
                className="px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-medium border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Globe2 className="w-3 h-3 text-sky-400" />
                Italian Classics
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
            <div className="bg-stone-800/60 backdrop-blur-xs border border-stone-700/80 rounded-xl p-3.5">
              <div className="text-2xl font-bold font-serif text-amber-400">{recipes.length}</div>
              <div className="text-xs text-stone-400 font-medium">Complete Recipes</div>
            </div>
            <div className="bg-stone-800/60 backdrop-blur-xs border border-stone-700/80 rounded-xl p-3.5">
              <div className="text-2xl font-bold font-serif text-amber-400">{cuisines.length}</div>
              <div className="text-xs text-stone-400 font-medium">World Cuisines</div>
            </div>
            <div className="bg-stone-800/60 backdrop-blur-xs border border-stone-700/80 rounded-xl p-3.5">
              <div className="text-2xl font-bold font-serif text-amber-400">100%</div>
              <div className="text-xs text-stone-400 font-medium">Step-by-Step Timers</div>
            </div>
            <div className="bg-stone-800/60 backdrop-blur-xs border border-stone-700/80 rounded-xl p-3.5">
              <div className="text-2xl font-bold font-serif text-amber-400">100%</div>
              <div className="text-xs text-stone-400 font-medium">Chef Tested</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
