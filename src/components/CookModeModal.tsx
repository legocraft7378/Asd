import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  Sparkles, 
  ChefHat, 
  Timer as TimerIcon,
  ListOrdered,
  Video,
  ExternalLink,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe } from '../types';
import { getRecipeYoutubeVideo, getYouTubeSearchUrl } from '../utils/youtube';

interface CookModeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export const CookModeModal: React.FC<CookModeModalProps> = ({ recipe, onClose }) => {
  if (!recipe) return null;

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showVideoGuide, setShowVideoGuide] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const videoInfo = getRecipeYoutubeVideo(recipe.title, recipe.youtubeUrl, recipe.cuisine);

  const currentStep = recipe.instructions[currentStepIdx];
  const totalSteps = recipe.instructions.length;

  // Initialize timer when step changes
  useEffect(() => {
    if (currentStep?.timerMinutes) {
      setTimerSecondsLeft(currentStep.timerMinutes * 60);
      setTimerRunning(false);
    } else {
      setTimerSecondsLeft(null);
      setTimerRunning(false);
    }
  }, [currentStepIdx, currentStep]);

  // Handle countdown interval
  useEffect(() => {
    if (timerRunning && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev !== null && prev > 1) {
            return prev - 1;
          } else {
            setTimerRunning(false);
            // Play alert bell beep using Web Audio API
            playBeep();
            return 0;
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerSecondsLeft]);

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio might be blocked
    }
  };

  const handleNextStep = () => {
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      setCompleted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
      setCompleted(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-stone-800 bg-stone-900/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-white shadow-sm">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Kitchen Mode • {recipe.cuisine}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-stone-100 line-clamp-1">
              {recipe.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={recipe.youtubeUrl || getYouTubeSearchUrl(recipe.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            title={`Search "${recipe.title}" on YouTube`}
          >
            <Search className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">Search on YouTube</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>

          <button
            onClick={() => setShowVideoGuide(!showVideoGuide)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              showVideoGuide
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{showVideoGuide ? 'Hide Video' : 'Video Guide'}</span>
          </button>

          <button
            id="btn-close-cook-mode"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Exit Mode</span>
          </button>
        </div>
      </div>

      {/* Floating Picture-in-Picture YouTube Video Guide */}
      {showVideoGuide && (
        <div className="absolute top-20 right-6 z-40 w-80 sm:w-96 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-3.5 py-2 bg-stone-800/90 flex items-center justify-between border-b border-stone-700">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Pinned: {videoInfo.creator}</span>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={videoInfo.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded text-stone-400 hover:text-white"
                title="Open in YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowVideoGuide(false)}
                className="p-1 rounded text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="relative aspect-video bg-black">
            <iframe
              src={videoInfo.embedUrl}
              title={`Video guide for ${recipe.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-stone-900 h-1.5">
        <div 
          className="bg-amber-500 h-full transition-all duration-300"
          style={{ width: `${((currentStepIdx + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Center Main Stage */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 max-w-4xl mx-auto w-full text-center overflow-y-auto">
        {!completed ? (
          <div className="space-y-6 w-full animate-in fade-in duration-300">
            {/* Step Counter Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-800 text-stone-300 text-xs sm:text-sm font-bold border border-stone-700">
              <ListOrdered className="w-4 h-4 text-amber-400" />
              <span>Step {currentStepIdx + 1} of {totalSteps}</span>
            </div>

            {/* Step Title */}
            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-amber-300 tracking-tight leading-tight">
              {currentStep.title}
            </h3>

            {/* Instruction Body */}
            <p className="text-lg sm:text-2xl text-stone-200 leading-relaxed font-light max-w-3xl mx-auto">
              {currentStep.instruction}
            </p>

            {/* Step Timer Widget (if applicable) */}
            {timerSecondsLeft !== null && (
              <div className="mt-8 p-6 rounded-3xl bg-stone-900/90 border border-stone-800 inline-block shadow-2xl">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  <TimerIcon className="w-4 h-4" />
                  <span>Culinary Timer</span>
                </div>

                <div className="text-5xl sm:text-6xl font-mono font-bold text-white tracking-widest my-2">
                  {formatTimer(timerSecondsLeft)}
                </div>

                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      timerRunning
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{timerRunning ? 'Pause' : 'Start Timer'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSecondsLeft((currentStep.timerMinutes || 0) * 60);
                    }}
                    className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Completion Screen */
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Bon Appétit!
            </h2>
            <p className="text-stone-300 text-lg max-w-md mx-auto">
              You've successfully completed <strong className="text-amber-400">{recipe.title}</strong>. Enjoy your delicious masterpiece!
            </p>

            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  setCurrentStepIdx(0);
                  setCompleted(false);
                }}
                className="px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm transition-colors cursor-pointer"
              >
                Cook Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
              >
                Done & Return to Library
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Controls */}
      <div className="px-6 py-5 border-t border-stone-800 bg-stone-900 flex items-center justify-between">
        <button
          onClick={handlePrevStep}
          disabled={currentStepIdx === 0 && !completed}
          className={`px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            currentStepIdx === 0 && !completed
              ? 'opacity-30 pointer-events-none bg-stone-800 text-stone-500'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        <div className="text-xs text-stone-400 hidden sm:block">
          Use buttons or arrow keys to navigate steps
        </div>

        <button
          onClick={handleNextStep}
          className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg hover:shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>{currentStepIdx === totalSteps - 1 ? 'Complete Recipe 🎉' : 'Next Step'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
