import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

import { StoryCard } from '../components/StoryCard';
import { Compass, BookOpen, SlidersHorizontal, ChevronRight, Eye } from 'lucide-react';
import * as Icons from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const { currentRoute, navigateTo, stories, showToast, categories } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'reading-time'>('latest');
  const [filteredStories, setFilteredStories] = useState<any[]>([]);

  // Dynamically extract category from route if in form `/explore/Category%20Name`
  const getRouteCategory = () => {
    if (currentRoute.startsWith('/explore/')) {
      const parts = currentRoute.split('/');
      if (parts.length > 2) {
        return decodeURIComponent(parts[2]);
      }
    }
    return null;
  };

  const activeCategoryName = getRouteCategory();

  useEffect(() => {
    let list = [...stories];

    // Filter by category
    const catToFilter = activeCategoryName || selectedCategory;
    if (catToFilter) {
      list = list.filter(story => story.category.toLowerCase() === catToFilter.toLowerCase());
    }

    // Sort
    if (sortBy === 'latest') {
      list.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
    } else if (sortBy === 'popular') {
      list.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'reading-time') {
      list.sort((a, b) => b.readingTime - a.readingTime);
    }

    setFilteredStories(list);
  }, [stories, selectedCategory, activeCategoryName, sortBy]);

  // Handle dynamic Lucide icon matching
  const renderCategoryIcon = (iconName: string, className: string = "w-6 h-6") => {
    const LucideIcon = (Icons as any)[iconName];
    if (LucideIcon) return <LucideIcon className={className} />;
    return <BookOpen className={className} />;
  };

  const handleCategoryCardClick = (catName: string) => {
    // Navigate to deep link so router handles it cleanly
    navigateTo(`/explore/${catName}`);
    showToast(`Exploring publications under ${catName}`, 'success');
  };

  // Render sub-view: Specific Category Page `/explore/:category`
  if (activeCategoryName) {
    const categoryDetail = categories.find(c => c.name.toLowerCase() === activeCategoryName.toLowerCase()) || {
      name: activeCategoryName,
      description: "In-depth explorations and peer-reviewed journals published within this specific study field.",
      count: filteredStories.length,
      colorClass: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
      iconName: "Compass"
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
        {/* Back Link */}
        <div className="mb-6">
          <button 
            onClick={() => navigateTo('/explore')}
            className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 uppercase"
          >
            ← Back to All Categories
          </button>
        </div>

        {/* Category Hero Banner */}
        <div className={`p-8 sm:p-12 rounded-2xl ${categoryDetail.colorClass} mb-10 shadow-sm relative overflow-hidden transition-theme`}>
          <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none transform translate-x-4 translate-y-4 scale-150">
            {renderCategoryIcon(categoryDetail.iconName, "w-48 h-48")}
          </div>

          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-black tracking-widest uppercase opacity-75">ACADEMIC DISCIPLINE</span>
            <h1 className="font-display font-black text-3xl sm:text-5xl tracking-tight mt-2">{categoryDetail.name}</h1>
            <p className="mt-3 text-sm sm:text-base leading-relaxed opacity-90">{categoryDetail.description}</p>
            <div className="mt-6 flex items-center gap-4 text-xs font-semibold">
              <span className="bg-black/10 px-3 py-1.5 rounded-lg">{categoryDetail.count} Active Publications</span>
              <span className="bg-black/10 px-3 py-1.5 rounded-lg">Verified Peer Review</span>
            </div>
          </div>
        </div>

        {/* Layout: Main publications & category side guides */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Grid */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-center border-b border-brand-border-light pb-4 mb-4">
              <h3 className="font-display font-bold text-lg text-brand-text-primary">Discipline Publications</h3>
              {/* Sorting */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-text-tertiary" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-brand-surface border border-brand-border text-xs font-semibold py-1 px-2.5 rounded-lg text-brand-text-secondary outline-none focus:border-brand-primary"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Popularity</option>
                  <option value="reading-time">Reading Time</option>
                </select>
              </div>
            </div>

            {filteredStories.length === 0 ? (
              <div className="bg-brand-surface border border-brand-border rounded-xl p-12 text-center flex flex-col items-center gap-4">
                <BookOpen className="w-12 h-12 text-brand-text-tertiary" />
                <h4 className="font-bold text-brand-text-primary text-base">No active publications</h4>
                <p className="text-xs text-brand-text-secondary max-w-xs">Be the first scholar to publish under the {categoryDetail.name} discipline.</p>
                <button onClick={() => navigateTo('/write')} className="px-5 py-2.5 bg-brand-primary text-white rounded-lg text-xs font-semibold">Draft first story</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStories.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar: category authors */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-brand-surface border border-brand-border p-6 rounded-xl text-left transition-theme">
              <h4 className="font-display font-bold text-sm text-brand-text-primary mb-4 border-b border-brand-border-light pb-2.5 uppercase tracking-wider">Discipline Scholars</h4>
              <div className="space-y-4">
                {(() => {
                  const authorsMap = new Map<string, any>();
                  stories.forEach(story => {
                    if (story.author && story.author.id) {
                      authorsMap.set(story.author.id, story.author);
                    }
                  });
                  return Array.from(authorsMap.values()).slice(0, 4);
                })().map(user => (
                  <div key={user.id} className="flex items-center justify-between gap-2 cursor-pointer group" onClick={() => navigateTo(`/profile/${user.username}`)}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-brand-text-primary group-hover:text-brand-primary truncate">{user.name}</p>
                        <p className="text-[10px] text-brand-text-tertiary truncate">{user.followersCount || 0} followers</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-text-tertiary group-hover:text-brand-primary transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // Render main view: Global Explore Categories Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      
      {/* Page header */}
      <div className="flex items-center gap-2 mb-3">
        <Compass className="w-6 h-6 text-brand-primary" />
        <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-text-primary tracking-tight">Explore Categories</h1>
      </div>
      <p className="text-brand-text-secondary text-sm max-w-xl mb-10">
        Browse publications classified across 17 color-coded disciplines. Read peer-reviewed medical reports, technology reviews, or verified anonymous whistleblowers.
      </p>

      {/* Grid of 17 Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-14">
        {categories.map((cat) => (
          <div
            key={cat.id}
            id={cat.id}
            onClick={() => handleCategoryCardClick(cat.name)}
            className="group bg-brand-surface border border-brand-border hover:border-brand-primary/40 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${cat.colorClass}`}>
                  {renderCategoryIcon(cat.iconName)}
                </div>
                <span className="text-xs font-bold text-brand-text-tertiary bg-brand-bg px-2 py-0.5 rounded-md">
                  {cat.count} Pubs
                </span>
              </div>
              <h3 className="font-display font-bold text-sm text-brand-text-primary group-hover:text-brand-primary transition-colors mb-1.5">
                {cat.name}
              </h3>
              <p className="text-xs text-brand-text-secondary line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Study <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
