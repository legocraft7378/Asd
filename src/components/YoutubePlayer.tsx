import React, { useState } from 'react';
import { Play, ExternalLink, Search, Film, Sparkles, Youtube } from 'lucide-react';
import { YoutubeVideoInfo, getYouTubeSearchUrl } from '../utils/youtube';

interface YoutubePlayerProps {
  videoInfo: YoutubeVideoInfo;
  recipeTitle: string;
  autoPlay?: boolean;
  className?: string;
  compact?: boolean;
  onOpenCustomModal?: () => void;
}

export function YoutubePlayer({
  videoInfo,
  recipeTitle,
  autoPlay = false,
  className = '',
  compact = false
}: YoutubePlayerProps) {
  const [isPlayingInline, setIsPlayingInline] = useState(autoPlay);
  const [iframeError, setIframeError] = useState(false);

  const mainSearchUrl = getYouTubeSearchUrl(recipeTitle);
  const quickSearches = [
    { label: 'Step-by-Step Tutorial', query: `${recipeTitle} recipe step by step` },
    { label: 'Quick 15-Min Version', query: `quick easy ${recipeTitle} recipe` },
    { label: 'Master Chef Technique', query: `authentic ${recipeTitle} masterclass` }
  ];

  return (
    <div className={`rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 text-white shadow-lg ${className}`}>
      {isPlayingInline && !iframeError ? (
        <div className="space-y-2">
          {/* Iframe wrapper */}
          <div className={`relative ${compact ? 'aspect-16/10' : 'aspect-video'} bg-black w-full overflow-hidden`}>
            <iframe
              src={videoInfo.embedUrl}
              title={`YouTube video tutorial for ${recipeTitle}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 w-full h-full border-0"
              onError={() => setIframeError(true)}
            />
          </div>

          {/* Quick controls beneath player */}
          <div className="px-4 py-2.5 bg-stone-950 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-stone-800">
            <div className="flex items-center gap-2 truncate text-stone-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span className="font-medium truncate">{videoInfo.videoTitle}</span>
              <span className="text-amber-400 font-semibold shrink-0">({videoInfo.creator})</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPlayingInline(false)}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-medium transition-colors cursor-pointer"
              >
                Show Search Options
              </button>
              <a
                href={mainSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Search className="w-3 h-3" />
                <span>Search on YouTube</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* YouTube Search & Video Hub */
        <div className="p-4 sm:p-5 space-y-4">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <span>YouTube Cooking Videos & Tutorials</span>
                </h4>
                <p className="text-xs text-stone-400">
                  Search millions of recipes or watch step-by-step masterclasses on YouTube
                </p>
              </div>
            </div>

            <a
              id="btn-main-youtube-search"
              href={mainSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-2 shadow-md cursor-pointer hover:shadow-red-900/30 hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Search "{recipeTitle}" on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Search Suggestions */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Quick YouTube Search Shortcuts:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((item, idx) => (
                <a
                  key={idx}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-medium border border-stone-700/80 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Search className="w-3 h-3 text-red-400" />
                  <span>{item.label}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              ))}
            </div>
          </div>

          {/* Video Preview with Instant Inline Play or Direct Watch */}
          <div className="relative rounded-xl overflow-hidden bg-stone-950 border border-stone-800">
            <div className="relative aspect-video sm:aspect-21/9 w-full overflow-hidden">
              <img
                src={videoInfo.thumbnailUrl}
                alt={videoInfo.videoTitle}
                className="w-full h-full object-cover opacity-75 hover:opacity-90 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoInfo.youtubeId}/0.jpg`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setIframeError(false);
                    setIsPlayingInline(true);
                  }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/20"
                  title="Play video right here"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
                </button>
              </div>

              <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-xs">
                <span className="text-stone-300 font-medium truncate max-w-[70%]">
                  {videoInfo.videoTitle}
                </span>
                <a
                  href={videoInfo.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-stone-200 text-[11px] font-semibold transition-colors inline-flex items-center gap-1 backdrop-blur-xs"
                >
                  <span>Open Video</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
