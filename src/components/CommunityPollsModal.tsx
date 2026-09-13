import React, { useState } from 'react';
import { 
  Recipe, 
  RecipePoll, 
  PollStatus, 
  PollComment 
} from '../types';
import { 
  X, 
  Vote, 
  ShieldCheck, 
  Award, 
  Flame, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  MessageSquare, 
  Plus, 
  ExternalLink, 
  ChefHat, 
  Search, 
  KeyRound, 
  AlertCircle, 
  Lock, 
  Unlock,
  Eye,
  Play
} from 'lucide-react';
import { YoutubePlayer } from './YoutubePlayer';
import { getRecipeYoutubeVideo } from '../utils/youtube';

interface CommunityPollsModalProps {
  isOpen: boolean;
  onClose: () => void;
  polls: RecipePoll[];
  userRecipes: Recipe[];
  onVote: (pollId: string, direction: 'up' | 'down') => void;
  onAddComment: (pollId: string, comment: string, rating: number) => void;
  onNominateRecipe: (recipe: Recipe, reason: string) => void;
  onModeratorApprove: (pollId: string, moderatorNotes: string) => void;
  onModeratorReject: (pollId: string, reason: string) => void;
  isModerator: boolean;
  onToggleModerator: (enabled: boolean) => void;
  onViewRecipe: (recipe: Recipe) => void;
}

export function CommunityPollsModal({
  isOpen,
  onClose,
  polls,
  userRecipes,
  onVote,
  onAddComment,
  onNominateRecipe,
  onModeratorApprove,
  onModeratorReject,
  isModerator,
  onToggleModerator,
  onViewRecipe
}: CommunityPollsModalProps) {
  const [activeTab, setActiveTab] = useState<'polls' | 'pending' | 'promoted' | 'nominate'>('polls');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoll, setSelectedPoll] = useState<RecipePoll | null>(null);
  
  // Comment input state
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);

  // Nomination state
  const [nominateRecipeId, setNominateRecipeId] = useState<string>('');
  const [nominateReason, setNominateReason] = useState<string>('');

  // Moderator approval notes state
  const [modNotes, setModNotes] = useState('');
  const [modPasswordInput, setModPasswordInput] = useState('');
  const [showModAuth, setShowModAuth] = useState(false);
  const [authError, setAuthError] = useState(false);

  if (!isOpen) return null;

  // Filter polls by active tab
  const filteredPolls = polls.filter(poll => {
    const matchesSearch = 
      poll.recipeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'polls') {
      return poll.status === 'active' || poll.status === 'pending_moderator';
    }
    if (activeTab === 'pending') {
      return poll.status === 'pending_moderator';
    }
    if (activeTab === 'promoted') {
      return poll.status === 'approved_promoted';
    }
    return true;
  });

  const pendingCount = polls.filter(p => p.status === 'pending_moderator').length;
  const promotedCount = polls.filter(p => p.status === 'approved_promoted').length;
  const activeCount = polls.filter(p => p.status === 'active' || p.status === 'pending_moderator').length;

  const handleModeratorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow PIN 1234 or simple click for test friendliness
    if (modPasswordInput === '1234' || modPasswordInput.trim() === 'admin' || modPasswordInput.trim() === '') {
      onToggleModerator(true);
      setShowModAuth(false);
      setModPasswordInput('');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleNominateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipeToNominate = userRecipes.find(r => r.id === nominateRecipeId);
    if (!recipeToNominate) return;

    onNominateRecipe(recipeToNominate, nominateReason || 'Community nominated favorite creation.');
    setNominateRecipeId('');
    setNominateReason('');
    setActiveTab('polls');
  };

  const handleCommentSubmit = (pollId: string) => {
    if (!commentText.trim()) return;
    onAddComment(pollId, commentText.trim(), commentRating);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white p-5 sm:p-6 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center shadow-lg font-bold">
                <Vote className="w-6 h-6 text-stone-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                    Community Recipe Polls & Hall of Fame
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-stone-950 uppercase tracking-wider">
                    Community Voting
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
                  Vote for user-crafted recipes to enter the Official Main Menu. Once a dish passes the poll, a Chef Moderator reviews and confirms its addition!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Moderator Mode Status Pill */}
              <button
                type="button"
                onClick={() => {
                  if (isModerator) {
                    onToggleModerator(false);
                  } else {
                    setShowModAuth(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isModerator 
                    ? 'bg-emerald-500 text-stone-950 hover:bg-emerald-400' 
                    : 'bg-stone-800/80 hover:bg-stone-700 text-amber-300 border border-amber-500/30'
                }`}
                title={isModerator ? 'Click to exit Moderator Mode' : 'Click to access Moderator Controls'}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isModerator ? '👑 Moderator Active' : 'Moderator Portal'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Moderator Auth Popover */}
          {showModAuth && (
            <div className="mt-4 p-4 rounded-2xl bg-stone-800 border border-amber-500/40 text-white shadow-xl animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Lock className="w-4 h-4" />
                  <span>Chef Moderator Access</span>
                </div>
                <button 
                  onClick={() => setShowModAuth(false)}
                  className="text-stone-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[11px] text-stone-300 mb-3">
                Moderators review community polls, approve recipes, and promote them into the official catalog. Enter PIN <span className="font-mono bg-stone-900 px-1 py-0.5 rounded text-amber-400">1234</span> (or leave blank to test):
              </p>
              <form onSubmit={handleModeratorLogin} className="flex gap-2">
                <input
                  type="password"
                  value={modPasswordInput}
                  onChange={(e) => setModPasswordInput(e.target.value)}
                  placeholder="PIN: 1234"
                  className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400 w-44"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock Moderator Mode</span>
                </button>
              </form>
              {authError && (
                <p className="text-[11px] text-red-400 mt-1.5">Incorrect PIN. Hint: Use 1234</p>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <button
              onClick={() => setActiveTab('polls')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'polls'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'bg-white/10 text-stone-200 hover:bg-white/15'
              }`}
            >
              <Vote className="w-3.5 h-3.5" />
              <span>Active Polls ({activeCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'bg-white/10 text-stone-200 hover:bg-white/15'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Awaiting Moderator ({pendingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('promoted')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'promoted'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'bg-white/10 text-stone-200 hover:bg-white/15'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Promoted to Main Menu ({promotedCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('nominate')}
              className={`ml-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'nominate'
                  ? 'bg-emerald-500 text-stone-950 shadow-md'
                  : 'bg-emerald-600/90 text-white hover:bg-emerald-600'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nominate Your Recipe</span>
            </button>
          </div>
        </div>

        {/* Search and Filters for Polls */}
        {activeTab !== 'nominate' && (
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search polls by recipe name, author, or cuisine..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="text-xs text-stone-500 font-medium">
              Showing <span className="font-bold text-stone-800">{filteredPolls.length}</span> polls
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB: Nominate Recipe */}
          {activeTab === 'nominate' ? (
            <div className="max-w-2xl mx-auto space-y-5 py-2">
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200/80">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">
                      Nominate a Recipe for Official Inclusion
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      Have you crafted a dish that is too good to keep to yourself? Nominate it to open a community poll! Once the community reaches the upvote threshold, our Chef Moderators will review it for permanent addition to the Main Official Catalog.
                    </p>
                  </div>
                </div>
              </div>

              {userRecipes.length === 0 ? (
                <div className="text-center py-10 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-3">
                  <ChefHat className="w-10 h-10 text-stone-400 mx-auto" />
                  <h4 className="text-sm font-bold text-stone-800">You haven't created any custom recipes yet!</h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Create a recipe in the Recipe Studio or import from JSON first, then come back here to nominate it for community voting.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleNominateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                      Select Your Recipe to Nominate
                    </label>
                    <select
                      value={nominateRecipeId}
                      onChange={(e) => setNominateRecipeId(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="">-- Choose a Recipe --</option>
                      {userRecipes.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.cuisine} • By {r.author})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                      Why should this dish be added to the Main Official Menu?
                    </label>
                    <textarea
                      rows={3}
                      value={nominateReason}
                      onChange={(e) => setNominateReason(e.target.value)}
                      placeholder="e.g. Grandma's generational recipe tested across 50 dinners; perfect balance of spices and foolproof step timers."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('polls')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!nominateRecipeId}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Vote className="w-4 h-4" />
                      <span>Start Community Poll</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* TAB: Polls List */
            <div className="space-y-6">
              {filteredPolls.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
                  <Vote className="w-10 h-10 text-stone-400 mx-auto opacity-60" />
                  <h4 className="text-base font-bold text-stone-800">No polls found in this category</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {activeTab === 'pending' 
                      ? 'No recipes currently waiting for moderator review.' 
                      : activeTab === 'promoted' 
                      ? 'No recipes have been promoted yet. Vote on active polls to help them qualify!'
                      : 'Be the first to nominate a dish for the community to vote on!'}
                  </p>
                </div>
              ) : (
                filteredPolls.map((poll) => {
                  const totalVotes = poll.votesUp + poll.votesDown;
                  const upPercentage = totalVotes > 0 ? Math.round((poll.votesUp / totalVotes) * 100) : 100;
                  const targetReached = poll.votesUp >= poll.voteTarget;
                  const isPromoted = poll.status === 'approved_promoted';
                  const isPendingMod = poll.status === 'pending_moderator';

                  return (
                    <div 
                      key={poll.id}
                      className={`rounded-3xl border transition-all p-5 sm:p-6 space-y-5 ${
                        isPromoted 
                          ? 'bg-amber-50/40 border-amber-300 shadow-md ring-1 ring-amber-400/30'
                          : isPendingMod
                          ? 'bg-amber-50/20 border-amber-200 shadow-sm'
                          : 'bg-white border-stone-200 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={poll.image}
                            alt={poll.recipeTitle}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-sm border border-stone-200 shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {isPromoted ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-stone-950 flex items-center gap-1 shadow-xs uppercase tracking-wider">
                                  <Award className="w-3 h-3" />
                                  <span>Promoted to Main Catalog</span>
                                </span>
                              ) : isPendingMod ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-stone-950 flex items-center gap-1 uppercase tracking-wider">
                                  <Clock className="w-3 h-3" />
                                  <span>Goal Reached • Awaiting Moderator</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-100 text-stone-700 flex items-center gap-1 uppercase tracking-wider">
                                  <Vote className="w-3 h-3" />
                                  <span>Active Community Poll</span>
                                </span>
                              )}

                              <span className="text-[11px] font-semibold text-stone-500">
                                {poll.cuisine} • By <span className="font-bold text-stone-800">{poll.author}</span>
                              </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 leading-snug">
                              {poll.recipeTitle}
                            </h3>

                            <p className="text-xs text-stone-600 line-clamp-2">
                              {poll.tagline}
                            </p>

                            {poll.reason && (
                              <p className="text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-block mt-1">
                                <span className="font-semibold">Creator Note:</span> "{poll.reason}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quick View Button */}
                        <button
                          onClick={() => {
                            const found = userRecipes.find(r => r.id === poll.recipeId);
                            if (found) {
                              onViewRecipe(found);
                            }
                          }}
                          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Recipe</span>
                        </button>
                      </div>

                      {/* Vote Progress Bar & Metric Stats */}
                      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">Community Sentiment:</span>
                            <span className="font-extrabold text-emerald-700">{upPercentage}% Approval</span>
                            <span className="text-stone-400">({totalVotes} total votes)</span>
                          </div>

                          <div className="text-stone-600 text-[11px]">
                            Goal: <span className="font-bold text-stone-900">{poll.votesUp} / {poll.voteTarget}</span> upvotes to trigger Moderator Confirmation
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-3 rounded-full bg-stone-200 overflow-hidden flex shadow-inner">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, (poll.votesUp / Math.max(1, totalVotes)) * 100)}%` }}
                          />
                          <div 
                            className="h-full bg-rose-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, (poll.votesDown / Math.max(1, totalVotes)) * 100)}%` }}
                          />
                        </div>

                        {/* Voting Buttons for Users */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onVote(poll.id, 'up')}
                              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                                poll.userVote === 'up'
                                  ? 'bg-emerald-600 text-white scale-105'
                                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Yes! Add to Main Menu ({poll.votesUp})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onVote(poll.id, 'down')}
                              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                poll.userVote === 'down'
                                  ? 'bg-rose-600 text-white scale-105'
                                  : 'bg-white hover:bg-rose-50 text-stone-600 border border-stone-200'
                              }`}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <span>Needs Tweaks ({poll.votesDown})</span>
                            </button>
                          </div>

                          {isPromoted ? (
                            <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Live in Official Catalog!</span>
                            </span>
                          ) : targetReached ? (
                            <span className="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200">
                              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>Community Target Reached!</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-stone-500">
                              Needs {Math.max(0, poll.voteTarget - poll.votesUp)} more upvotes
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Moderator Actions & Confirmation Panel (Visible in Moderator Mode or if Approved) */}
                      {isPromoted ? (
                        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                                Confirmed & Approved by Moderator
                              </h4>
                              <span className="text-[10px] font-semibold text-emerald-700">
                                {poll.moderatorName || 'Chef Moderator'}
                              </span>
                            </div>
                            <p className="text-xs text-emerald-900 mt-0.5">
                              {poll.moderatorNotes || 'Approved by Chef Moderator. Recipe is now accessible in the Main Recipe Catalog for all chefs!'}
                            </p>
                          </div>
                        </div>
                      ) : isModerator ? (
                        /* Moderator Decision Box */
                        <div className="bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-stone-100 border border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-5 h-5 text-amber-700" />
                              <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                                Chef Moderator Confirmation Panel
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                              Moderator Action Required
                            </span>
                          </div>

                          <p className="text-xs text-stone-700">
                            As a Chef Moderator, review this submission. If confirmed, this recipe will be added directly into the <span className="font-bold">Official Main Recipe Catalog</span> with a Moderator-Verified Hall of Fame badge.
                          </p>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={modNotes}
                              onChange={(e) => setModNotes(e.target.value)}
                              placeholder="Add moderator endorsement notes (e.g. Masterful spice ratio & clean steps!)..."
                              className="flex-1 px-3.5 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  onModeratorApprove(poll.id, modNotes || 'Verified & approved by Chef Moderator for official inclusion.');
                                  setModNotes('');
                                }}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                              >
                                <Award className="w-4 h-4" />
                                <span>👑 Confirm & Promote to Main List</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onModeratorReject(poll.id, modNotes || 'Needs adjustments before official inclusion.');
                                  setModNotes('');
                                }}
                                className="px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Community Comments / Reviews Section */}
                      <div className="space-y-3 pt-1 border-t border-stone-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-stone-800 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                            <span>Community Feedback & Reviews ({poll.comments.length})</span>
                          </span>
                        </div>

                        {/* Comments list */}
                        {poll.comments.length > 0 && (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {poll.comments.map((c) => (
                              <div key={c.id} className="bg-stone-50 rounded-xl p-3 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-stone-800">{c.userName}</span>
                                  <span className="text-[10px] text-amber-600 font-bold">
                                    {'★'.repeat(c.rating)}
                                  </span>
                                </div>
                                <p className="text-stone-600">{c.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add comment bar */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCommentSubmit(poll.id);
                            }}
                            placeholder="Add your review / why you voted for this dish..."
                            className="flex-1 px-3.5 py-1.5 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => handleCommentSubmit(poll.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>
              All recipes promoted to the Main Menu retain creator credit and earn the Official Chef Hall of Fame seal.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-colors ml-auto cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
