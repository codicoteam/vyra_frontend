import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

import { StoryCard } from '../components/StoryCard';
import { 
  Search, X, History, BookOpen, User, Tag, ArrowRight,
  HelpCircle, SlidersHorizontal, ChevronRight, CornerDownLeft
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { stories, navigateTo, searchQuery, setSearchQuery, showToast, categories } = useApp();
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('vyra-recent-searches');
    return saved ? JSON.parse(saved) : ["Quantum Computing", "Ocean Reforestation", "Algorithmic Ethics"];
  });

  const [filteredStories, setFilteredStories] = useState<any[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [filteredTags, setFilteredTags] = useState<any[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Sync recent searches to localStorage
  useEffect(() => {
    localStorage.setItem('vyra-recent-searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Real-time search query processor
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStories([]);
      setFilteredAuthors([]);
      setFilteredCategories([]);
      setFilteredTags([]);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();

      // 1. Filter Stories
      const matchedStories = stories.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.excerpt.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        s.tags.some(t => t.toLowerCase().includes(query))
      );

      // 2. Filter Authors (derived from live stories)
      const authorsMap = new Map<string, any>();
      stories.forEach(story => {
        if (story.author && story.author.id) {
          authorsMap.set(story.author.id, story.author);
        }
      });
      const uniqueAuthors = Array.from(authorsMap.values());
      const matchedAuthors = uniqueAuthors.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.bio.toLowerCase().includes(query)
      );

      // 3. Filter Categories
      const matchedCategories = categories.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );

      // 4. Filter Tags (derived from live stories)
      const tagCountMap = new Map<string, number>();
      stories.forEach(story => {
        if (story.tags) {
          story.tags.forEach(tag => {
            const cleanTag = tag.trim();
            if (cleanTag) {
              tagCountMap.set(cleanTag, (tagCountMap.get(cleanTag) || 0) + 1);
            }
          });
        }
      });
      const derivedTags = Array.from(tagCountMap.entries()).map(([tag, count]) => ({
        tag,
        count
      }));
      const matchedTags = derivedTags.filter(t => 
        t.tag.toLowerCase().includes(query)
      );

      setFilteredStories(matchedStories);
      setFilteredAuthors(matchedAuthors);
      setFilteredCategories(matchedCategories);
      setFilteredTags(matchedTags);

      setIsSearching(false);
    }, 300); // 300ms debounce simulation

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, stories]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commitSearch(searchQuery);
  };

  const commitSearch = (term: string) => {
    if (!term.trim()) return;
    setSearchQuery(term);
    
    // Add to recent searches (up to 5 maximum)
    setRecentSearches(prev => {
      const clean = term.trim();
      const filtered = prev.filter(t => t.toLowerCase() !== clean.toLowerCase());
      return [clean, ...filtered].slice(0, 5);
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation(); // Avoid triggering search click
    setRecentSearches(prev => prev.filter(t => t !== term));
    showToast(`Removed "${term}" from search history`, 'info');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      
      {/* Search Input Area */}
      <form onSubmit={handleSearchSubmit} className="relative mb-8 w-full">
        <div className="relative flex items-center bg-brand-surface border-2 border-brand-border focus-within:border-brand-primary rounded-2xl p-4 shadow-sm transition-all">
          <Search className="w-6 h-6 text-brand-primary shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories, writers, academic categories, tags..."
            className="w-full text-base sm:text-lg bg-transparent border-none outline-none text-brand-text-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-1 hover:bg-brand-border-light text-brand-text-secondary rounded-full mr-2"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            className="p-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-semibold tracking-wide"
          >
            Search
          </button>
        </div>
        <span className="text-[10px] text-brand-text-tertiary block mt-2 ml-1">
          Pro-tip: Press <kbd className="bg-brand-border-light border px-1 rounded text-[9px] font-mono">ESC</kbd> to return to previous page
        </span>
      </form>

      {/* Conditional Rendering of Search States */}
      {!searchQuery.trim() ? (
        // Empty state: show recent searches & trending subjects
        <div className="space-y-8 animate-fade-in">
          
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-brand-text-tertiary tracking-widest uppercase mb-3 flex items-center gap-1.5 pl-1">
                <History className="w-4 h-4 text-brand-primary" /> SEARCH HISTORY
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, idx) => (
                  <div
                    key={idx}
                    onClick={() => commitSearch(term)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-surface border border-brand-border rounded-xl text-xs font-semibold text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary/30 transition-all cursor-pointer group"
                  >
                    <span>{term}</span>
                    <button
                      onClick={(e) => handleRemoveRecentSearch(e, term)}
                      className="text-brand-text-tertiary hover:text-red-500 rounded p-0.5 group-hover:scale-110"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Discover suggestions */}
          <div>
            <h3 className="text-xs font-black text-brand-text-tertiary tracking-widest uppercase mb-3 flex items-center gap-1.5 pl-1">
              <BookOpen className="w-4 h-4 text-brand-accent" /> SUGGESTED SUBJECTS
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {['AI', 'Quantum', 'Climate', 'Neuroscience', 'Policy', 'Ethics', 'Tech', 'BioTech'].map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => commitSearch(tag)}
                  className="px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs font-semibold text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary/40 transition-all shadow-sm"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : isSearching ? (
        // Debounce loading skeleton
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-brand-text-secondary">Synthesizing platform metadata indexes...</p>
        </div>
      ) : filteredStories.length === 0 && filteredAuthors.length === 0 && filteredCategories.length === 0 ? (
        // No results found screen
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-16 text-center flex flex-col items-center gap-4">
          <HelpCircle className="w-14 h-14 text-brand-text-tertiary" />
          <h3 className="font-display font-bold text-lg text-brand-text-primary">No results for "{searchQuery}"</h3>
          <p className="text-xs text-brand-text-secondary max-w-xs leading-relaxed">
            Check the typing format or explore our predefined disciplines such as "Technology", "Climate Action", or "Digital Privacy".
          </p>
          <div className="flex gap-2.5 mt-2">
            <button onClick={() => commitSearch('Quantum')} className="px-3.5 py-1.5 border border-brand-border text-brand-text-secondary text-xs rounded-xl font-semibold">Try "Quantum"</button>
            <button onClick={() => commitSearch('Water')} className="px-3.5 py-1.5 border border-brand-border text-brand-text-secondary text-xs rounded-xl font-semibold">Try "Water"</button>
          </div>
        </div>
      ) : (
        // Results Rendered
        <div className="space-y-10 animate-fade-in">
          
          {/* Matched Categories */}
          {filteredCategories.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-brand-text-tertiary tracking-widest uppercase mb-4 flex items-center gap-1.5 pl-1 border-b border-brand-border pb-1.5">
                <BookOpen className="w-4 h-4 text-brand-primary" /> MATCHED ACADEMIC DISCIPLINE ({filteredCategories.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredCategories.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => navigateTo(`/explore/${cat.name}`)}
                    className="p-4 bg-brand-surface border border-brand-border hover:border-brand-primary/40 rounded-xl flex items-center justify-between cursor-pointer shadow-sm group"
                  >
                    <div className="min-w-0">
                      <h4 className="font-display font-semibold text-xs text-brand-text-primary group-hover:text-brand-primary truncate">{cat.name}</h4>
                      <p className="text-[10px] text-brand-text-tertiary truncate">{cat.count} active publications</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-text-tertiary group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Authors */}
          {filteredAuthors.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-brand-text-tertiary tracking-widest uppercase mb-4 flex items-center gap-1.5 pl-1 border-b border-brand-border pb-1.5">
                <User className="w-4 h-4 text-brand-primary" /> MATCHED SCHOLARS ({filteredAuthors.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredAuthors.map(author => (
                  <div
                    key={author.id}
                    onClick={() => navigateTo(`/profile/${author.username}`)}
                    className="p-4 bg-brand-surface border border-brand-border hover:border-brand-primary/40 rounded-xl flex items-center gap-3.5 cursor-pointer shadow-sm group"
                  >
                    <img src={author.avatar} className="w-10 h-10 rounded-full object-cover shrink-0 border border-brand-border" />
                    <div className="min-w-0 text-left">
                      <h4 className="font-semibold text-xs text-brand-text-primary group-hover:text-brand-primary truncate">{author.name}</h4>
                      <p className="text-[10px] text-brand-text-tertiary truncate">@{author.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Stories */}
          {filteredStories.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-brand-text-tertiary tracking-widest uppercase mb-6 flex items-center gap-1.5 pl-1 border-b border-brand-border pb-1.5">
                <BookOpen className="w-4 h-4 text-brand-primary" /> MATCHED PUBLICATIONS ({filteredStories.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStories.map(story => (
                  <div key={story.id}>
                    <StoryCard story={story} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
