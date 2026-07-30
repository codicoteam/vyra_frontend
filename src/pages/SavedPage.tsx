import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCard } from '../components/StoryCard';
import { 
  Bookmark, Trash2, Search, SlidersHorizontal, Grid, List as ListIcon, 
  ArrowRight, BookOpen, Filter, X, HelpCircle
} from 'lucide-react';

export const SavedPage: React.FC = () => {
  const { 
    stories, 
    bookmarkedStoryIds, 
    toggleBookmark, 
    navigateTo, 
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes' | 'reading-time'>('newest');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [clearModalOpen, setClearModalOpen] = useState(false);

  // Get only the bookmarked stories
  const savedStories = stories.filter(story => bookmarkedStoryIds.includes(story.id));

  // Extract unique categories from saved stories for filtering
  const availableCategories = ['All', ...Array.from(new Set(savedStories.map(story => story.category)))];

  // Filter & Search Saved Stories
  const filteredStories = savedStories.filter(story => {
    const matchesSearch = 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || story.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort Saved Stories
  const sortedStories = [...filteredStories].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime();
    }
    if (sortBy === 'likes') {
      return b.likes - a.likes;
    }
    if (sortBy === 'reading-time') {
      return a.readingTime - b.readingTime;
    }
    return 0;
  });

  // Clear all bookmarks helper
  const handleClearAllBookmarks = () => {
    if (bookmarkedStoryIds.length === 0) return;
    
    // Explicitly toggle each one off
    bookmarkedStoryIds.forEach(id => {
      toggleBookmark(id);
    });
    
    setClearModalOpen(false);
    showToast('Your Saved Collection has been cleared completely', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-border-light pb-6 sm:pb-8 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-primary-light dark:bg-purple-950/40 text-brand-primary dark:text-purple-300 rounded-2xl">
              <Bookmark className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-text-primary tracking-tight">
                Saved Collection
              </h1>
              <p className="text-xs sm:text-sm text-brand-text-secondary">
                Your personal secure repository of bookmarked investigative intelligence and research.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {savedStories.length > 0 && (
            <button
              onClick={() => setClearModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold rounded-xl border border-rose-200/40 dark:border-rose-900/40 shadow-sm transition-all active:scale-95 touch-target"
            >
              <Trash2 className="w-4 h-4" /> Clear Saved Collection
            </button>
          )}
          <button
            onClick={() => navigateTo('/explore')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-surface border border-brand-border hover:bg-brand-border-light text-brand-text-secondary text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            Browse More
          </button>
        </div>
      </div>

      {savedStories.length === 0 ? (
        /* Empty State with CTA */
        <div className="max-w-lg mx-auto py-16 px-4 bg-brand-surface dark:bg-slate-900 border border-brand-border rounded-3xl text-center shadow-md flex flex-col items-center gap-5 transition-all">
          <div className="p-5 bg-brand-primary-light dark:bg-purple-950/30 text-brand-primary dark:text-purple-300 rounded-full relative">
            <Bookmark className="w-12 h-12" />
            <div className="absolute top-2 right-2 w-3 h-3 bg-brand-accent rounded-full animate-ping" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-xl text-brand-text-primary">Your Saved Collection is Empty</h3>
            <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed max-w-sm">
              Bookmark stories as you browse the platform to archive them in this local sandbox. They will persist offline to your browser storage automatically.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
            <button
              onClick={() => navigateTo('/home')}
              className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group touch-target"
            >
              View Home Feed <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigateTo('/explore')}
              className="px-6 py-3 bg-brand-surface border border-brand-border hover:bg-brand-border-light text-brand-text-secondary text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 touch-target"
            >
              <BookOpen className="w-4 h-4 text-brand-accent" /> Explore Categories
            </button>
          </div>
        </div>
      ) : (
        /* Main Search & Grid interface */
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-brand-surface dark:bg-slate-900 border border-brand-border rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-tertiary" />
              <input
                type="text"
                placeholder="Search saved titles, descriptions, writers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-bg dark:bg-slate-950 border border-brand-border pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 text-brand-text-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-brand-border-light rounded-full text-brand-text-tertiary hover:text-brand-text-primary"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sorting, Layout, and Category Selectors */}
            <div className="flex flex-wrap items-center gap-3.5">
              
              {/* Category Dropdown/Pills */}
              <div className="flex items-center gap-1.5 text-xs text-brand-text-secondary">
                <Filter className="w-3.5 h-3.5 text-brand-text-tertiary" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-brand-bg dark:bg-slate-950 border border-brand-border text-xs py-1.5 px-3 rounded-lg outline-none text-brand-text-secondary focus:border-brand-primary"
                >
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'All Disciplines' : cat}</option>
                  ))}
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 text-xs text-brand-text-secondary">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-text-tertiary" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-brand-bg dark:bg-slate-950 border border-brand-border text-xs py-1.5 px-3 rounded-lg outline-none text-brand-text-secondary focus:border-brand-primary"
                >
                  <option value="newest">Newest Bookmarked</option>
                  <option value="oldest">Oldest Bookmarked</option>
                  <option value="likes">Most Popular (Likes)</option>
                  <option value="reading-time">Shortest Read First</option>
                </select>
              </div>

              {/* Layout Mode Toggles (Hidden on small mobile) */}
              <div className="hidden sm:flex border border-brand-border p-0.5 rounded-lg bg-brand-bg dark:bg-slate-950">
                <button 
                  onClick={() => setLayoutMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${layoutMode === 'grid' ? 'bg-brand-surface dark:bg-slate-800 text-brand-primary shadow-sm' : 'text-brand-text-tertiary hover:text-brand-text-secondary'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setLayoutMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${layoutMode === 'list' ? 'bg-brand-surface dark:bg-slate-800 text-brand-primary shadow-sm' : 'text-brand-text-tertiary hover:text-brand-text-secondary'}`}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Active Filtering Summary */}
          {(selectedCategory !== 'All' || searchQuery) && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-brand-text-secondary px-1">
              <div className="flex items-center gap-1.5">
                <span>Showing <b>{sortedStories.length}</b> results</span>
                {selectedCategory !== 'All' && (
                  <span className="bg-brand-border-light text-brand-text-secondary px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory('All')} className="hover:text-rose-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-brand-border-light text-brand-text-secondary px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 max-w-xs truncate">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-rose-500 ml-0.5 shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <button 
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="text-brand-primary hover:underline font-semibold"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Bookmarked Grid list */}
          {sortedStories.length === 0 ? (
            <div className="bg-brand-surface border border-brand-border p-12 text-center rounded-2xl flex flex-col items-center gap-3">
              <BookOpen className="w-10 h-10 text-brand-text-tertiary" />
              <h3 className="font-display font-semibold text-base text-brand-text-primary">No stories match your criteria</h3>
              <p className="text-xs text-brand-text-secondary max-w-xs leading-relaxed">
                Try widening your search terms, clearing the filter category, or select a different sort parameter to locate matches.
              </p>
            </div>
          ) : (
            <div className={layoutMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6 max-w-4xl mx-auto"}>
              {sortedStories.map((story) => (
                <div key={story.id} className="animate-fade-in">
                  <StoryCard story={story} variant={layoutMode === 'list' ? 'compact' : 'default'} />
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Clear Confirmation Safeguard Modal */}
      {clearModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border w-full max-w-md rounded-2xl p-6 text-left shadow-2xl relative animate-scale-up">
            
            <button 
              onClick={() => setClearModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-brand-bg hover:bg-brand-border-light rounded-full text-brand-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="font-display font-black text-lg">Clear Saved Collection?</h3>
            </div>

            <p className="text-xs text-brand-text-secondary leading-relaxed mb-6">
              You are about to clear **all {bookmarkedStoryIds.length} bookmarked articles** from your local dashboard history. This action cannot be undone. Are you sure you want to proceed?
            </p>

            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setClearModalOpen(false)}
                className="py-2.5 px-4 border border-brand-border text-brand-text-secondary hover:bg-brand-border-light text-xs sm:text-sm font-semibold rounded-xl"
              >
                Keep Collection
              </button>
              <button
                onClick={handleClearAllBookmarks}
                className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm"
              >
                Yes, Clear All
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
