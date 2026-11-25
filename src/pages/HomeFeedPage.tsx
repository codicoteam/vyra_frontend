import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Story } from '../types';
import { StoryCard, Avatar, getCategoryColor } from '../components/StoryCard';
import { Sparkles, Clock, Users, TrendingUp, PenLine, ShieldCheck, LogIn, Compass, Loader2 } from 'lucide-react';

type Tab = 'for-you' | 'latest' | 'following';
const PAGE = 6;

/** Map a raw Prisma post (as returned by /feed/*) to the Story shape the UI uses */
const mapRawPost = (p: any): Story => ({
  id: p.id,
  title: p.title,
  excerpt: p.excerpt || '',
  content: p.content || '',
  coverImage: p.coverImageUrl || '',
  category: p.category?.name || 'Uncategorized',
  tags: [],
  author: {
    id: p.author?.id || '',
    name: p.author?.fullName || 'Unknown',
    avatar: p.author?.avatarUrl || '',
    bio: '',
    username: p.author?.username || '',
  },
  isAnonymous: !!p.isAnonymous,
  readingTime: p.readingTime || 1,
  publishedDate: p.publishedAt || p.createdAt,
  likes: p.likeCount || 0,
  bookmarks: p.bookmarkCount || 0,
  isResearch: p.isResearch,
  isCampaign: p.isCampaign,
  goalProgress: p.campaignProgress || 0,
});

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

const SkeletonCard = () => (
  <div className="rounded-2xl ring-1 ring-brand-border overflow-hidden bg-brand-surface">
    <div className="aspect-[16/10] skeleton" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-1/3 rounded skeleton" />
      <div className="h-5 w-4/5 rounded skeleton" />
      <div className="h-3 w-full rounded skeleton" />
      <div className="h-3 w-2/3 rounded skeleton" />
    </div>
  </div>
);

export const HomeFeedPage: React.FC = () => {
  const { stories, navigateTo, currentUser, categories } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('for-you');
  const [category, setCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE);
  const [following, setFollowing] = useState<Story[] | null>(null);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followingError, setFollowingError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Real "following" feed from the API
  useEffect(() => {
    if (activeTab !== 'following' || !currentUser || following) return;
    setFollowingLoading(true);
    setFollowingError(false);
    api.feed
      .getFollowing()
      .then((res) => setFollowing((res.data || []).map(mapRawPost).filter((s: Story) => !s.isAnonymous)))
      .catch(() => setFollowingError(true))
      .finally(() => setFollowingLoading(false));
  }, [activeTab, currentUser, following]);

  const feedStories = useMemo(() => {
    let list: Story[];
    if (activeTab === 'following') list = following || [];
    else if (activeTab === 'latest')
      list = [...stories].sort((a, b) => +new Date(b.publishedDate) - +new Date(a.publishedDate));
    else {
      // "For you": engagement weighted by freshness
      const score = (s: Story) => {
        const ageDays = (Date.now() - +new Date(s.publishedDate)) / 864e5;
        return (s.likes * 2 + s.bookmarks * 3 + 1) / Math.pow(ageDays + 2, 0.8);
      };
      list = [...stories].sort((a, b) => score(b) - score(a));
    }
    if (category) list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    return list;
  }, [stories, following, activeTab, category]);

  useEffect(() => setVisibleCount(PAGE), [activeTab, category]);

  // Real infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((c) => Math.min(c + PAGE, feedStories.length));
      },
      { rootMargin: '600px' },
    );
    io.observe(el);
    return () => io.disconnect();
    // re-observe after each page so loading continues while the sentinel stays on screen
  }, [feedStories.length, visibleCount, activeTab, category, followingLoading, stories.length]);

  const trending = useMemo(() => [...stories].sort((a, b) => b.likes - a.likes).slice(0, 5), [stories]);
  const writers = useMemo(() => {
    const map = new Map<string, Story['author']>();
    stories.forEach((s) => !s.isAnonymous && s.author?.id && map.set(s.author.id, s.author));
    return Array.from(map.values());
  }, [stories]);
  const avgRead = stories.length ? Math.round(stories.reduce((n, s) => n + (s.readingTime || 0), 0) / stories.length) : 0;
  const catsWithStories = categories.filter((c) => stories.some((s) => s.category.toLowerCase() === c.name.toLowerCase()));

  const isLoading = activeTab === 'following' ? followingLoading : stories.length === 0 && categories.length === 0;
  const [featured, ...rest] = feedStories;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'for-you', label: 'For you' },
    { id: 'latest', label: 'Latest' },
    { id: 'following', label: 'Following' },
  ];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-violet-500/[0.07] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28">
        {/* ---------- Header ---------- */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm text-brand-text-tertiary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-brand-text-primary tracking-tight mt-1">
            {currentUser ? `${greeting()}, ${currentUser.name.split(' ')[0]}` : 'Your feed'}
          </h1>
        </motion.div>

        {/* ---------- Tabs + category chips ---------- */}
        <div className="sticky top-16 z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 mb-6 glass sm:bg-transparent sm:backdrop-blur-none border-b border-brand-border/60 sm:border-0">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center p-1 rounded-full bg-brand-surface ring-1 ring-brand-border shadow-soft w-fit" role="tablist">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={activeTab === t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`relative h-9 px-4 rounded-full text-sm font-semibold transition-colors ${
                    activeTab === t.id ? 'text-white' : 'text-brand-text-secondary hover:text-brand-text-primary'
                  }`}
                >
                  {activeTab === t.id && (
                    <motion.span layoutId="feed-tab" className="absolute inset-0 rounded-full bg-brand-gradient shadow-glow" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>

            {catsWithStories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0 lg:pl-2">
                <button
                  onClick={() => setCategory(null)}
                  className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-all ${
                    !category ? 'bg-brand-text-primary text-brand-surface' : 'ring-1 ring-brand-border text-brand-text-secondary hover:text-brand-text-primary'
                  }`}
                >
                  All
                </button>
                {catsWithStories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(category === c.name ? null : c.name)}
                    className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-all ${
                      category === c.name ? 'bg-brand-text-primary text-brand-surface' : 'ring-1 ring-brand-border text-brand-text-secondary hover:text-brand-text-primary'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ---------- Main feed ---------- */}
          <main className="lg:col-span-8 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + (category || '')}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === 'following' && !currentUser ? (
                  <EmptyState
                    icon={LogIn}
                    title="Sign in to see who you follow"
                    text="Follow writers and their newest stories will appear here."
                    action={{ label: 'Sign in', onClick: () => navigateTo('/login') }}
                  />
                ) : isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                  </div>
                ) : followingError && activeTab === 'following' ? (
                  <EmptyState
                    icon={Users}
                    title="Couldn't load your following feed"
                    text="Check your connection and try again."
                    action={{ label: 'Retry', onClick: () => setFollowing(null) }}
                  />
                ) : feedStories.length === 0 ? (
                  activeTab === 'following' ? (
                    <EmptyState
                      icon={Users}
                      title="Nothing here yet"
                      text="You're not following anyone who has published. Find writers you like on Explore."
                      action={{ label: 'Explore writers', onClick: () => navigateTo('/explore') }}
                    />
                  ) : (
                    <EmptyState
                      icon={Compass}
                      title={category ? `No stories in ${category} yet` : 'No stories yet'}
                      text="Be the first to publish something here."
                      action={{ label: 'Write a story', onClick: () => navigateTo('/write') }}
                    />
                  )
                ) : (
                  <div className="space-y-6">
                    {featured && <StoryCard story={featured} variant="featured" />}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {rest.slice(0, visibleCount - 1).map((story, i) => (
                        <motion.div
                          key={story.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: (i % PAGE) * 0.05 }}
                          className="h-full"
                        >
                          <StoryCard story={story} />
                        </motion.div>
                      ))}
                    </div>
                    <div ref={sentinelRef} className="h-px" />
                    <div className="text-center pt-4 text-sm text-brand-text-tertiary">
                      {visibleCount < feedStories.length ? (
                        <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading more</span>
                      ) : (
                        <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> You're all caught up</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* ---------- Sidebar ---------- */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* Trending */}
            {trending.length > 0 && (
              <section className="p-5 rounded-3xl bg-brand-surface ring-1 ring-brand-border shadow-soft">
                <h3 className="font-display font-semibold text-brand-text-primary flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-brand-primary" /> Trending now
                </h3>
                <ol className="space-y-1">
                  {trending.map((s, i) => (
                    <li key={s.id}>
                      <button
                        onClick={() => navigateTo(`/story/${s.id}`)}
                        className="group w-full flex items-start gap-3 p-2 -mx-2 rounded-xl text-left hover:bg-brand-border-light transition-colors"
                      >
                        <span className="font-display font-bold text-2xl leading-none text-brand-border tabular-nums w-7 shrink-0 group-hover:text-brand-primary transition-colors">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 text-xs text-brand-text-tertiary mb-0.5">
                            <Avatar src={s.author?.avatar} name={s.author?.name} anonymous={s.isAnonymous} className="w-4 h-4" />
                            <span className="truncate">{s.isAnonymous ? 'Anonymous' : s.author?.name}</span>
                          </span>
                          <span className="block text-sm font-semibold text-brand-text-primary leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
                            {s.title}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Real stats */}
            <section className="grid grid-cols-3 gap-2">
              {[
                { label: 'Stories', value: stories.length },
                { label: 'Writers', value: writers.length },
                { label: 'Avg. read', value: `${avgRead}m`, icon: Clock },
              ].map((s) => (
                <div key={s.label} className="p-3.5 rounded-2xl bg-brand-surface ring-1 ring-brand-border text-center">
                  <div className="font-display font-bold text-xl text-brand-text-primary tabular-nums">{s.value}</div>
                  <div className="text-[11px] text-brand-text-tertiary">{s.label}</div>
                </div>
              ))}
            </section>

            {/* Topics */}
            {categories.length > 0 && (
              <section className="p-5 rounded-3xl bg-brand-surface ring-1 ring-brand-border">
                <h3 className="font-display font-semibold text-brand-text-primary mb-3">Topics to explore</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 10).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigateTo(`/explore/${c.name}`)}
                      className={`h-8 px-3 rounded-full text-xs font-semibold hover:-translate-y-0.5 transition-transform ${getCategoryColor(c.name)}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Write CTA */}
            <section className="relative overflow-hidden p-6 rounded-3xl bg-[#0d0a1f] text-white">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-600/50 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -left-10 w-40 h-40 bg-cyan-500/30 rounded-full blur-3xl" />
              <div className="relative">
                <ShieldCheck className="w-6 h-6 text-cyan-300 mb-3" />
                <h3 className="font-display font-bold text-lg">Have something to say?</h3>
                <p className="text-sm text-slate-300 leading-relaxed mt-1 mb-4">
                  Publish under your name, or anonymously with your identity hidden from readers.
                </p>
                <button
                  onClick={() => navigateTo('/write')}
                  className="inline-flex items-center gap-2 h-10 px-4 bg-white text-slate-900 font-semibold text-sm rounded-full hover:bg-slate-100 transition-colors"
                >
                  <PenLine className="w-4 h-4" /> Start writing
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{
  icon: React.ElementType;
  title: string;
  text: string;
  action?: { label: string; onClick: () => void };
}> = ({ icon: Icon, title, text, action }) => (
  <div className="p-12 rounded-3xl bg-brand-surface ring-1 ring-brand-border text-center flex flex-col items-center">
    <div className="grid place-items-center w-14 h-14 rounded-2xl bg-brand-primary-light text-brand-primary mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-display font-semibold text-lg text-brand-text-primary">{title}</h3>
    <p className="text-sm text-brand-text-secondary max-w-sm mt-1.5 leading-relaxed">{text}</p>
    {action && (
      <button onClick={action.onClick} className="mt-6 h-10 px-5 bg-brand-gradient text-white font-semibold rounded-full text-sm shadow-glow">
        {action.label}
      </button>
    )}
  </div>
);
