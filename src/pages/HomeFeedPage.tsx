import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCard } from '../components/StoryCard';
import { Rss, Plus, Flame, Clock, Heart, Award } from 'lucide-react';

export const HomeFeedPage: React.FC = () => {
  const { stories, navigateTo, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const [loading, setLoading] = useState(true);
  const [feedStories, setFeedStories] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);

  // Trigger initial visual skeleton loading state
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Handle feed sorting/filtering based on tabs
  useEffect(() => {
    let list = [...stories];
    if (activeTab === 'following') {
      // Simulate feed from following authors (e.g. filter out anonymous or prioritize specific authors)
      list = stories.filter(s => !s.isAnonymous && s.author.id !== 'user-12');
    } else {
      // "For You" - sort by likes/rating
      list.sort((a, b) => b.likes - a.likes);
    }
    setFeedStories(list);
    setVisibleCount(6);
  }, [stories, activeTab]);

  const simulateInfiniteScroll = () => {
    if (visibleCount >= feedStories.length) {
      showToast('You have read all available articles in your feed!', 'success');
      return;
    }
    setIsInfiniteLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 4, feedStories.length));
      setIsInfiniteLoading(false);
      showToast('Pulled 4 new publications into your feed', 'success');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="text-left">
          <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-text-primary tracking-tight">Your Editorial Feed</h1>
          <p className="text-sm text-brand-text-secondary mt-1">Curated publications, ongoing research papers, and social campaigns.</p>
        </div>

        {/* Tab Switchers */}
        <div className="flex bg-brand-surface p-1 rounded-xl border border-brand-border">
          <button
            onClick={() => setActiveTab('for-you')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'for-you'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-brand-text-secondary hover:text-brand-primary'
            }`}
          >
            <Award className="w-4 h-4" /> Curated
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'following'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-brand-text-secondary hover:text-brand-primary'
            }`}
          >
            <Rss className="w-4 h-4" /> Following
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left main feed (staggered layouts) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {loading ? (
            // Shimmer Skeleton Loaders
            <div className="space-y-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col md:flex-row gap-6 animate-pulse">
                  <div className="w-full md:w-1/2 h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div className="flex-1 space-y-4 py-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    <div className="flex items-center gap-3 pt-4">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : feedStories.length === 0 ? (
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center flex flex-col items-center gap-4">
              <Award className="w-12 h-12 text-brand-primary animate-bounce" />
              <h3 className="font-display font-bold text-lg text-brand-text-primary">No stories found</h3>
              <p className="text-brand-text-secondary text-sm max-w-sm leading-relaxed">
                You currently do not follow any writers who have posted. Check back soon or follow additional scholars on our Landing Welcome.
              </p>
              <button onClick={() => navigateTo('/')} className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider">
                Discover Popular Authors
              </button>
            </div>
          ) : (
            // Staggered Render: First story is massive featured layout, rest are standard or grid
            <div className="space-y-8">
              {feedStories.slice(0, 1).map(story => (
                <div key={story.id}>
                  <StoryCard story={story} variant="featured" />
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feedStories.slice(1, visibleCount).map(story => (
                  <div key={story.id} className="h-full">
                    <StoryCard story={story} />
                  </div>
                ))}
              </div>

              {/* Simulated Infinite Scroll Trigger */}
              <div className="text-center pt-4">
                {isInfiniteLoading ? (
                  <div className="inline-flex items-center gap-2 px-6 py-3 border border-brand-border bg-brand-surface text-brand-primary rounded-xl text-sm font-semibold">
                    <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    Refining feed algorithmic weights...
                  </div>
                ) : visibleCount < feedStories.length ? (
                  <button
                    onClick={simulateInfiniteScroll}
                    className="px-6 py-3 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary-light/40 dark:hover:bg-brand-primary-light/10 font-bold text-sm rounded-xl transition-all shadow-sm"
                  >
                    Simulate Infinite Scroll Load
                  </button>
                ) : (
                  <p className="text-xs font-mono text-brand-text-tertiary">All articles in feed synchronized successfully</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Editorial sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Stats Panel */}
          <div className="bg-brand-surface border border-brand-border p-6 rounded-2xl transition-theme text-left">
            <h3 className="font-display font-bold text-base text-brand-text-primary flex items-center gap-2 border-b border-brand-border-light pb-3 mb-4">
              <Flame className="w-4 h-4 text-orange-500" /> Platform Highlights
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center text-xs">
                <span className="text-brand-text-secondary flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Average Reading Time</span>
                <span className="font-bold text-brand-text-primary">7.5 mins</span>
              </li>
              <li className="flex justify-between items-center text-xs">
                <span className="text-brand-text-secondary flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Total Community Likes</span>
                <span className="font-bold text-brand-text-primary">12,540+</span>
              </li>
              <li className="flex justify-between items-center text-xs">
                <span className="text-brand-text-secondary flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Peer Reviewed Index</span>
                <span className="font-bold text-brand-text-primary">94.8%</span>
              </li>
            </ul>
          </div>

          {/* Guidelines Sidebar card */}
          <div className="bg-gradient-to-br from-purple-900 to-indigo-950 p-6 rounded-2xl text-white text-left shadow-md">
            <h3 className="font-display font-black text-lg mb-2">Write Securely</h3>
            <p className="text-xs text-indigo-200 leading-relaxed mb-4">
              VYRA employs military-grade local browser metadata shredding to safeguard whistleblowers and investigative journalists publishing anonymous articles.
            </p>
            <button
              onClick={() => navigateTo('/write')}
              className="w-full py-2 px-4 bg-white text-purple-950 font-bold text-xs uppercase rounded-xl tracking-wider text-center hover:bg-indigo-50 transition-colors"
            >
              Draft Anonymous Report
            </button>
          </div>
        </div>

      </div>

      {/* Floating Action Button (FAB) for Mobile drafting */}
      <button
        onClick={() => navigateTo('/write')}
        className="fixed bottom-20 right-6 z-40 md:hidden bg-brand-primary hover:bg-brand-primary-hover text-white p-4 rounded-full shadow-2xl flex items-center justify-center animate-bounce"
        title="Author draft story"
      >
        <Plus className="w-6 h-6" />
      </button>

    </div>
  );
};
