import React, { useState } from 'react';
import { Story } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, Bookmark, Clock, Eye, AlertCircle, FileText, Globe } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  variant?: 'default' | 'featured' | 'compact' | 'research';
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, variant = 'default' }) => {
  const { navigateTo, likedStoryIds, bookmarkedStoryIds, toggleLike, toggleBookmark } = useApp();
  const [imgLoaded, setImgLoaded] = useState(false);

  const isLiked = likedStoryIds.includes(story.id);
  const isBookmarked = bookmarkedStoryIds.includes(story.id);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent clicking like/bookmark from navigating to story page
    const target = e.target as HTMLElement;
    if (target.closest('.interactive-btn')) {
      return;
    }
    navigateTo(`/story/${story.id}`);
  };

  const formattedDate = new Date(story.publishedDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Category Color Map helper
  const getCategoryColor = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('tech') || lower.includes('quantum')) return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
    if (lower.includes('health') || lower.includes('biotech')) return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
    if (lower.includes('environment') || lower.includes('climate')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    if (lower.includes('social') || lower.includes('humanrights')) return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300';
    if (lower.includes('psychology')) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300';
    if (lower.includes('space') || lower.includes('astro')) return 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300';
    if (lower.includes('philosophy') || lower.includes('ethics')) return 'bg-stone-100 text-stone-700 dark:bg-stone-950 dark:text-stone-300';
    if (lower.includes('community')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
  };

  if (variant === 'featured') {
    return (
      <div
        id={`story-card-${story.id}`}
        onClick={handleCardClick}
        className="group relative flex flex-col md:flex-row bg-brand-surface rounded-2xl border border-brand-border hover:border-brand-primary/40 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      >
        {/* Cover Image */}
        <div className="relative md:w-1/2 h-64 md:h-auto overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0">
          <div className={`absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse ${imgLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`} />
          <img
            src={story.coverImage}
            alt={story.title}
            onLoad={() => setImgLoaded(true)}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${imgLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          />
          {/* Category Badge */}
          <span className={`absolute top-4 left-4 text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full shadow-sm ${getCategoryColor(story.category)}`}>
            {story.category}
          </span>

          {/* Research & Campaign Badges */}
          {story.isResearch && (
            <span className="absolute top-4 right-4 bg-sky-600 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Research
            </span>
          )}
          {story.isCampaign && (
            <span className="absolute top-4 right-4 bg-rose-600 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" /> Campaign
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6 sm:p-8 justify-between">
          <div>
            {/* Meta details */}
            <div className="flex items-center gap-4 text-xs text-brand-text-tertiary mb-3">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {story.readingTime} min read</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>

            {/* Title */}
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-brand-text-primary group-hover:text-brand-primary transition-colors duration-200 leading-tight mb-4 line-clamp-2">
              {story.title}
            </h3>

            {/* Excerpt */}
            <p className="text-brand-text-secondary leading-relaxed mb-6 line-clamp-3">
              {story.excerpt}
            </p>

            {/* Campaign Progress Bar */}
            {story.isCampaign && story.goalProgress !== undefined && (
              <div className="mb-6 interactive-btn">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-rose-600 dark:text-rose-400">Funding Goal Progress</span>
                  <span>{story.goalProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${story.goalProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Author and Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-brand-border-light">
            <div className="flex items-center gap-3">
              <img
                src={story.author.avatar}
                alt={story.author.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-brand-border"
              />
              <div>
                <h4 className="text-sm font-semibold text-brand-text-primary">
                  {story.isAnonymous ? 'Anonymous Contributor' : story.author.name}
                </h4>
                <p className="text-xs text-brand-text-tertiary">
                  {story.isAnonymous ? 'Whistleblower Safeguard' : `@${story.author.username}`}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 interactive-btn">
              <button
                onClick={() => toggleLike(story.id)}
                className={`p-2.5 rounded-full border transition-all duration-200 flex items-center justify-center ${
                  isLiked
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-400 scale-110'
                    : 'bg-transparent border-brand-border text-brand-text-secondary hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
                }`}
                title="Like Article"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs font-semibold ml-1.5">{story.likes}</span>
              </button>

              <button
                onClick={() => toggleBookmark(story.id)}
                className={`p-2.5 rounded-full border transition-all duration-200 flex items-center justify-center ${
                  isBookmarked
                    ? 'bg-purple-50 border-purple-200 text-brand-primary dark:bg-purple-950/40 dark:border-purple-900/40 dark:text-purple-300'
                    : 'bg-transparent border-brand-border text-brand-text-secondary hover:text-brand-primary hover:bg-brand-primary-light/50'
                }`}
                title="Bookmark Article"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        id={`story-card-${story.id}`}
        onClick={handleCardClick}
        className="group flex gap-4 bg-brand-surface p-4 rounded-xl border border-brand-border hover:border-brand-primary/40 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      >
        {/* Cover Image */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900 shrink-0">
          <div className={`absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse ${imgLoaded ? 'opacity-0' : 'opacity-100'}`} />
          <img
            src={story.coverImage}
            alt={story.title}
            onLoad={() => setImgLoaded(true)}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full ${getCategoryColor(story.category)}`}>
                {story.category}
              </span>
              <span className="text-[10px] text-brand-text-tertiary">{formattedDate}</span>
            </div>
            <h4 className="font-display font-semibold text-sm sm:text-base text-brand-text-primary group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
              {story.title}
            </h4>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 text-brand-text-secondary">
            <span>By {story.isAnonymous ? 'Anonymous' : story.author.name}</span>
            <div className="flex items-center gap-3 interactive-btn">
              <button
                onClick={() => toggleLike(story.id)}
                className={`flex items-center gap-1 ${isLiked ? 'text-rose-500 font-bold' : 'text-brand-text-secondary hover:text-rose-500'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{story.likes}</span>
              </button>
              <button
                onClick={() => toggleBookmark(story.id)}
                className={`${isBookmarked ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'}`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Standard Card or Research Variant
  return (
    <div
      id={`story-card-${story.id}`}
      onClick={handleCardClick}
      className="group flex flex-col bg-brand-surface rounded-xl border border-brand-border hover:border-brand-primary/40 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-full justify-between"
    >
      <div>
        {/* Cover Image */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
          <div className={`absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse ${imgLoaded ? 'opacity-0' : 'opacity-100'}`} />
          <img
            src={story.coverImage}
            alt={story.title}
            onLoad={() => setImgLoaded(true)}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* Category Badge */}
          <span className={`absolute top-3 left-3 text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-sm ${getCategoryColor(story.category)}`}>
            {story.category}
          </span>

          {/* DOI Research paper Badge */}
          {(story.isResearch || variant === 'research') && story.doi && (
            <span className="absolute top-3 right-3 bg-sky-600 text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded shadow-sm flex items-center gap-1">
              <FileText className="w-3 h-3" /> DOI Research
            </span>
          )}

          {/* Active Campaigns */}
          {story.isCampaign && (
            <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded shadow-sm flex items-center gap-1 animate-pulse">
              <AlertCircle className="w-3 h-3" /> Campaign
            </span>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5">
          <div className="flex items-center gap-3 text-xs text-brand-text-tertiary mb-2">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {story.readingTime} min read</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>

          <h3 className="font-display font-bold text-lg text-brand-text-primary group-hover:text-brand-primary transition-colors leading-snug mb-2 line-clamp-2">
            {story.title}
          </h3>

          <p className="text-sm text-brand-text-secondary leading-relaxed line-clamp-3 mb-4">
            {story.excerpt}
          </p>

          {story.isCampaign && story.goalProgress !== undefined && (
            <div className="mb-4 interactive-btn">
              <div className="flex justify-between text-[11px] font-semibold mb-1">
                <span className="text-rose-600 dark:text-rose-400">Campaign Raised</span>
                <span>{story.goalProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${story.goalProgress}%` }}
                />
              </div>
            </div>
          )}

          {story.doi && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-brand-text-tertiary mb-1">
              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-brand-text-secondary font-semibold">DOI</span>
              <span className="truncate">{story.doi}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Author Row */}
      <div className="flex items-center justify-between p-5 pt-3 border-t border-brand-border-light">
        <div className="flex items-center gap-2.5">
          <img
            src={story.author.avatar}
            alt={story.author.name}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-brand-border"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-brand-text-primary truncate">
              {story.isAnonymous ? 'Anonymous Contributor' : story.author.name}
            </h4>
            <p className="text-[10px] text-brand-text-tertiary truncate">
              {story.isAnonymous ? 'Secured Voice' : `@${story.author.username}`}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 interactive-btn">
          <button
            onClick={() => toggleLike(story.id)}
            className={`p-2 rounded-full border transition-all duration-200 flex items-center justify-center ${
              isLiked
                ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-400 scale-105'
                : 'bg-transparent border-brand-border text-brand-text-secondary hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
            }`}
            title="Like"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-bold ml-1">{story.likes}</span>
          </button>

          <button
            onClick={() => toggleBookmark(story.id)}
            className={`p-2 rounded-full border transition-all duration-200 flex items-center justify-center ${
              isBookmarked
                ? 'bg-purple-50 border-purple-200 text-brand-primary dark:bg-purple-950/40 dark:border-purple-900/40 dark:text-purple-300'
                : 'bg-transparent border-brand-border text-brand-text-secondary hover:text-brand-primary hover:bg-brand-primary-light/50'
            }`}
            title="Bookmark"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
