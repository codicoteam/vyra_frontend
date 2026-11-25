import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Story } from '../types';
import { StoryCard, Avatar, getCategoryColor, getCategoryIconName } from '../components/StoryCard';
import { Compass, BookOpen, ArrowLeft, ArrowUpRight, Search, Hash, Heart, Users, X, PenLine } from 'lucide-react';
import * as Icons from 'lucide-react';

type Sort = 'latest' | 'popular' | 'longest';

const renderIcon = (iconName: string, className = 'w-5 h-5', categoryName = '') => {
  const LucideIcon = (Icons as any)[getCategoryIconName(categoryName, iconName)];
  return LucideIcon ? <LucideIcon className={className} /> : <BookOpen className={className} />;
};

const sortStories = (list: Story[], sort: Sort) => {
  const out = [...list];
  if (sort === 'latest') out.sort((a, b) => +new Date(b.publishedDate) - +new Date(a.publishedDate));
  if (sort === 'popular') out.sort((a, b) => b.likes - a.likes);
  if (sort === 'longest') out.sort((a, b) => b.readingTime - a.readingTime);
  return out;
};

const SortControl: React.FC<{ value: Sort; onChange: (s: Sort) => void; id: string }> = ({ value, onChange, id }) => (
  <div className="flex items-center p-1 rounded-full bg-brand-surface ring-1 ring-brand-border w-fit" role="tablist" aria-label="Sort stories">
    {(
      [
        ['latest', 'Latest'],
        ['popular', 'Popular'],
        ['longest', 'Long reads'],
      ] as [Sort, string][]
    ).map(([k, label]) => (
      <button
        key={k}
        role="tab"
        aria-selected={value === k}
        onClick={() => onChange(k)}
        className={`relative h-8 px-3.5 rounded-full text-sm font-medium transition-colors ${value === k ? 'text-brand-surface' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}
      >
        {value === k && <motion.span layoutId={`sort-${id}`} className="absolute inset-0 rounded-full bg-brand-text-primary" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
        <span className="relative">{label}</span>
      </button>
    ))}
  </div>
);

const StoryGrid: React.FC<{ stories: Story[]; cols?: string }> = ({ stories, cols = 'md:grid-cols-2 lg:grid-cols-3' }) => (
  <motion.div layout className={`grid grid-cols-1 ${cols} gap-6`}>
    <AnimatePresence mode="popLayout">
      {stories.map((s, i) => (
        <motion.div
          key={s.id}
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.04 }}
          className="h-full"
        >
          <StoryCard story={s} />
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
);

const Empty: React.FC<{ title: string; text: string; onWrite?: () => void }> = ({ title, text, onWrite }) => (
  <div className="p-12 rounded-3xl bg-brand-surface ring-1 ring-brand-border text-center flex flex-col items-center">
    <div className="grid place-items-center w-14 h-14 rounded-2xl bg-brand-primary-light text-brand-primary mb-4">
      <BookOpen className="w-6 h-6" />
    </div>
    <h4 className="font-display font-semibold text-lg text-brand-text-primary">{title}</h4>
    <p className="text-sm text-brand-text-secondary max-w-sm mt-1.5">{text}</p>
    {onWrite && (
      <button onClick={onWrite} className="mt-6 inline-flex items-center gap-2 h-10 px-5 bg-brand-gradient text-white rounded-full text-sm font-semibold shadow-glow">
        <PenLine className="w-4 h-4" /> Write the first story
      </button>
    )}
  </div>
);

export const ExplorePage: React.FC = () => {
  const { currentRoute, navigateTo, stories, categories } = useApp();
  const [sortBy, setSortBy] = useState<Sort>('latest');
  const [query, setQuery] = useState('');

  // Parse /explore, /explore/:category, /explore?tag=x
  const [path, search] = currentRoute.split('?');
  const tag = new URLSearchParams(search || '').get('tag');
  const activeCategoryName = path.startsWith('/explore/') ? decodeURIComponent(path.slice('/explore/'.length)) : null;

  const countFor = (name: string) => stories.filter((s) => s.category.toLowerCase() === name.toLowerCase()).length;

  /* ===================== Category detail ===================== */
  if (activeCategoryName) {
    const cat = categories.find((c) => c.name.toLowerCase() === activeCategoryName.toLowerCase());
    const catStories = sortStories(stories.filter((s) => s.category.toLowerCase() === activeCategoryName.toLowerCase()), sortBy);
    const writers = Array.from(
      new Map(catStories.filter((s) => !s.isAnonymous && s.author?.id).map((s) => [s.author.id, s.author])).values(),
    );
    const totalLikes = catStories.reduce((n, s) => n + s.likes, 0);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28">
        <button
          onClick={() => navigateTo('/explore')}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-text-tertiary hover:text-brand-text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> All topics
        </button>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] bg-[#0d0a1f] text-white p-8 sm:p-12 mb-10"
        >
          <div className="absolute -top-24 -left-20 w-80 h-80 bg-violet-600/50 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 right-0 w-80 h-80 bg-cyan-500/25 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_right,transparent,black)]" />
          <motion.div
            className="absolute right-6 sm:right-14 top-1/2 -translate-y-1/2 text-white/10"
            animate={{ rotate: [0, 6, 0], y: ['-50%', '-54%', '-50%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            {renderIcon(cat?.iconName || 'Compass', 'w-40 h-40 sm:w-56 sm:h-56', activeCategoryName)}
          </motion.div>

          <div className="relative max-w-2xl">
            <span className={`inline-grid place-items-center w-12 h-12 rounded-2xl mb-5 ${getCategoryColor(activeCategoryName)}`}>
              {renderIcon(cat?.iconName || 'Compass', 'w-6 h-6', activeCategoryName)}
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight">{cat?.name || activeCategoryName}</h1>
            <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed">
              {cat?.description || `Stories, research and reporting about ${activeCategoryName}.`}
            </p>
            <div className="mt-8 flex flex-wrap gap-8">
              {[
                { icon: BookOpen, value: catStories.length, label: 'Stories' },
                { icon: Users, value: writers.length, label: 'Writers' },
                { icon: Heart, value: totalLikes, label: 'Likes' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display font-bold text-2xl tabular-nums">{s.value.toLocaleString()}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1"><s.icon className="w-3 h-3" /> {s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="font-display font-semibold text-xl text-brand-text-primary">Stories</h2>
              <SortControl value={sortBy} onChange={setSortBy} id="cat" />
            </div>
            {catStories.length === 0 ? (
              <Empty title="No stories yet" text={`Nobody has published in ${cat?.name || activeCategoryName} yet.`} onWrite={() => navigateTo('/write')} />
            ) : (
              <StoryGrid stories={catStories} cols="md:grid-cols-2" />
            )}
          </div>

          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {writers.length > 0 && (
              <section className="p-5 rounded-3xl bg-brand-surface ring-1 ring-brand-border shadow-soft">
                <h3 className="font-display font-semibold text-brand-text-primary mb-3">Writers in this topic</h3>
                <div className="space-y-1">
                  {writers.slice(0, 6).map((w) => (
                    <button
                      key={w.id}
                      onClick={() => navigateTo(`/profile/${w.username}`)}
                      className="group w-full flex items-center justify-between gap-3 p-2 -mx-2 rounded-xl hover:bg-brand-border-light transition-colors text-left"
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Avatar src={w.avatar} name={w.name} className="w-9 h-9" />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-brand-text-primary truncate group-hover:text-brand-primary">{w.name}</span>
                          <span className="block text-xs text-brand-text-tertiary truncate">@{w.username}</span>
                        </span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-brand-text-tertiary group-hover:text-brand-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </section>
            )}
            <section className="p-5 rounded-3xl bg-brand-surface ring-1 ring-brand-border">
              <h3 className="font-display font-semibold text-brand-text-primary mb-3">Other topics</h3>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter((c) => c.name.toLowerCase() !== activeCategoryName.toLowerCase())
                  .slice(0, 10)
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigateTo(`/explore/${c.name}`)}
                      className="inline-flex items-center gap-1.5 h-8 pl-1.5 pr-3 rounded-full ring-1 ring-brand-border text-xs font-medium text-brand-text-secondary hover:text-brand-primary hover:ring-brand-primary/40 transition-colors"
                    >
                      <span className={`grid place-items-center w-5 h-5 rounded-full ${getCategoryColor(c.name)}`}>{renderIcon(c.iconName, 'w-3 h-3', c.name)}</span>
                      {c.name}
                    </button>
                  ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    );
  }

  /* ===================== Tag view ===================== */
  if (tag) {
    const tagged = sortStories(stories.filter((s) => s.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())), sortBy);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28">
        <button onClick={() => navigateTo('/explore')} className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-text-tertiary hover:text-brand-text-primary mb-6">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> All topics
        </button>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-brand-primary-light text-brand-primary mb-4"><Hash className="w-6 h-6" /></span>
            <h1 className="font-display font-bold text-4xl text-brand-text-primary tracking-tight">#{tag}</h1>
            <p className="text-brand-text-secondary mt-1">{tagged.length} {tagged.length === 1 ? 'story' : 'stories'}</p>
          </div>
          <SortControl value={sortBy} onChange={setSortBy} id="tag" />
        </div>
        {tagged.length === 0 ? <Empty title="No stories with this tag" text="Try another tag or browse topics." /> : <StoryGrid stories={tagged} />}
      </div>
    );
  }

  /* ===================== Explore home ===================== */
  const q = query.trim().toLowerCase();
  const visibleCats = categories.filter((c) => !q || c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
  const allStories = sortStories(
    stories.filter(
      (s) => !q || s.title.toLowerCase().includes(q) || s.excerpt.toLowerCase().includes(q) || s.category.toLowerCase().includes(q),
    ),
    sortBy,
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-violet-500/[0.08] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-28">
        {/* Hero + search */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] uppercase text-brand-primary">
            <Compass className="w-3.5 h-3.5" /> Explore
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-brand-text-primary tracking-tight mt-2">
            Find your next <span className="text-gradient">great read</span>
          </h1>
          <p className="text-brand-text-secondary text-lg mt-3">
            {categories.length} topics and {stories.length} stories, from peer-reviewed research to first-hand accounts.
          </p>

          <div className="mt-7 flex items-center gap-2 h-14 pl-5 pr-2 rounded-2xl bg-brand-surface ring-1 ring-brand-border shadow-soft focus-within:ring-2 focus-within:ring-brand-primary transition-all">
            <Search className="w-5 h-5 text-brand-text-tertiary shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter topics and stories…"
              aria-label="Filter topics and stories"
              className="flex-1 min-w-0 bg-transparent outline-none text-base placeholder:text-brand-text-tertiary"
            />
            {query && (
              <button onClick={() => setQuery('')} className="grid place-items-center w-9 h-9 rounded-xl hover:bg-brand-border-light text-brand-text-tertiary" aria-label="Clear">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Topics */}
        <section className="mb-16">
          <h2 className="font-display font-semibold text-xl text-brand-text-primary mb-5">Topics</h2>
          {categories.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-36 rounded-3xl skeleton" />)}
            </div>
          ) : visibleCats.length === 0 ? (
            <p className="text-sm text-brand-text-tertiary">No topics match “{query}”.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {visibleCats.map((cat, i) => {
                const n = countFor(cat.name);
                return (
                  <motion.button
                    key={cat.id}
                    id={cat.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 12) * 0.03 }}
                    onClick={() => navigateTo(`/explore/${cat.name}`)}
                    className="group relative overflow-hidden text-left p-4 sm:p-5 rounded-3xl bg-brand-surface ring-1 ring-brand-border hover:ring-brand-primary/30 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="absolute -right-6 -bottom-6 text-brand-text-primary opacity-[0.04] group-hover:opacity-[0.08] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                      {renderIcon(cat.iconName, 'w-28 h-28', cat.name)}
                    </div>
                    <div className="relative flex items-start justify-between mb-6 sm:mb-8">
                      <span className={`grid place-items-center w-11 h-11 rounded-2xl ${getCategoryColor(cat.name)} transition-transform group-hover:scale-110`}>
                        {renderIcon(cat.iconName, 'w-5 h-5', cat.name)}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-brand-text-tertiary opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-brand-primary transition-all" />
                    </div>
                    <h3 className="relative font-display font-semibold text-sm sm:text-base text-brand-text-primary leading-snug">{cat.name}</h3>
                    <p className="relative text-xs text-brand-text-tertiary mt-1">
                      {n} {n === 1 ? 'story' : 'stories'}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>

        {/* All stories */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="font-display font-semibold text-xl text-brand-text-primary">
              {q ? `Stories matching “${query}”` : 'All stories'}
            </h2>
            <SortControl value={sortBy} onChange={setSortBy} id="all" />
          </div>
          {allStories.length === 0 ? (
            <Empty title="No stories found" text={q ? 'Try a different search.' : 'Nothing has been published yet.'} />
          ) : (
            <StoryGrid stories={allStories} />
          )}
        </section>
      </div>
    </div>
  );
};
