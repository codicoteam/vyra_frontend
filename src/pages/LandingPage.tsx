import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

import { StoryCard, Avatar, getCategoryColor, plainExcerpt } from '../components/StoryCard';
import {
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  ShieldCheck,
  FileText,
  Megaphone,
  PenLine,
  Hash,
  ArrowUpRight,
} from 'lucide-react';

/* ---------- Small building blocks ---------- */

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  dark?: boolean;
}> = ({ eyebrow, title, description, icon: Icon, action, dark }) => (
  <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
    <div className="max-w-2xl">
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] uppercase ${dark ? 'text-cyan-300' : 'text-brand-primary'}`}>
        {Icon && <Icon className="w-3.5 h-3.5" />} {eyebrow}
      </span>
      <h2 className={`font-display font-bold text-3xl sm:text-4xl mt-2 ${dark ? 'text-white' : 'text-brand-text-primary'}`}>{title}</h2>
      {description && <p className={`mt-3 text-base leading-relaxed ${dark ? 'text-slate-400' : 'text-brand-text-secondary'}`}>{description}</p>}
    </div>
    {action}
  </Reveal>
);

const LinkAction: React.FC<{ onClick: () => void; children: React.ReactNode; dark?: boolean }> = ({ onClick, children, dark }) => (
  <button
    onClick={onClick}
    className={`group shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold ${dark ? 'text-cyan-300' : 'text-brand-primary'}`}
  >
    {children}
    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
  </button>
);

/* ---------- Page ---------- */

export const LandingPage: React.FC = () => {
  const { navigateTo, stories, showToast, categories } = useApp();
  const [visibleStoriesCount, setVisibleStoriesCount] = useState(6);
  const [followedWriters, setFollowedWriters] = useState<string[]>([]);

  const featuredStories = stories.slice(0, 6);
  const latestStories = stories.slice(0, visibleStoriesCount);

  const researchStories = stories.filter((s) => s.isResearch);
  const featuredResearch = researchStories[0];
  const secondaryResearch = researchStories.slice(1, 4);

  const techStories = stories
    .filter((s) => ['Technology', 'Algorithmic Ethics', 'Quantum Physics'].includes(s.category))
    .slice(0, 4);
  const campaignStories = stories.filter((s) => s.isCampaign).slice(0, 3);
  const communityStories = stories
    .filter((s) => ['Community Stories', 'Humanities & Arts', 'Psychology & Mental Health'].includes(s.category))
    .slice(0, 6);

  const writers = useMemo(() => {
    const map = new Map<string, any>();
    stories.forEach((s) => {
      if (s.author?.id && !s.isAnonymous) map.set(s.author.id, s.author);
    });
    return Array.from(map.values());
  }, [stories]);

  const trendingTags = useMemo(() => {
    const counts = new Map<string, number>();
    stories.forEach((s) =>
      s.tags?.forEach((t) => {
        const tag = t.trim();
        if (tag) counts.set(tag, (counts.get(tag) || 0) + 1);
      }),
    );
    const fromTags = Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
    return fromTags;
  }, [stories]);

  const heroStories = stories.filter((s) => s.coverImage).slice(0, 3);

  const loadMoreStories = () => {
    if (visibleStoriesCount >= stories.length) {
      showToast('All currently available publications are loaded!', 'info');
      return;
    }
    setVisibleStoriesCount((prev) => Math.min(prev + 6, stories.length));
  };

  const handleFollowWriter = (userId: string, name: string) => {
    setFollowedWriters((prev) => {
      const isFollowing = prev.includes(userId);
      showToast(isFollowing ? `Stopped following ${name}` : `You are now following ${name}`, 'success');
      return isFollowing ? prev.filter((id) => id !== userId) : [...prev, userId];
    });
  };

  const stats = [
    { label: 'Publications', value: stories.length },
    { label: 'Writers', value: writers.length },
    { label: 'Disciplines', value: categories.length },
  ];

  return (
    <div className="relative overflow-hidden w-full">
      {/* =============== 1. Hero =============== */}
      <section id="hero-section" className="relative min-h-[100svh] flex items-center bg-[#07060f] text-white pt-28 pb-20 overflow-hidden">
        {/* Aurora background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute -top-48 -left-32 w-[640px] h-[640px] rounded-full bg-violet-600/40 blur-[140px]"
            animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full bg-cyan-500/25 blur-[140px]"
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-40 left-1/3 w-[480px] h-[480px] rounded-full bg-fuchsia-600/25 blur-[140px]"
            animate={{ x: [0, 40, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff14_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#07060f]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center w-full">
          <div className="lg:col-span-7 flex flex-col items-start gap-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-md pl-1.5 pr-3.5 py-1.5 rounded-full ring-1 ring-white/10 text-xs font-medium text-slate-200"
            >
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> New
              </span>
              Publish openly or anonymously, with protection
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-extrabold text-5xl sm:text-6xl lg:text-[84px] tracking-[-0.03em] leading-[0.98]"
            >
              Every voice
              <br />
              <span className="text-gradient animate-gradient-pan">deserves to be heard.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="text-slate-300/90 text-lg sm:text-xl leading-relaxed max-w-xl"
            >
              Share research, awareness campaigns, investigations and personal stories that move the world forward.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            >
              <button
                onClick={() => navigateTo('/write')}
                className="group relative inline-flex items-center justify-center gap-2 h-14 px-7 rounded-2xl font-semibold text-white bg-brand-gradient shadow-[0_10px_40px_-8px_rgba(124,58,237,0.7)] hover:shadow-[0_14px_50px_-8px_rgba(124,58,237,0.9)] hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.25)_50%,transparent_65%)] bg-[length:250%_100%] animate-shimmer opacity-0 group-hover:opacity-100" />
                <PenLine className="w-5 h-5 relative" />
                <span className="relative">Start writing</span>
              </button>
              <button
                onClick={() => document.getElementById('latest-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="group inline-flex items-center justify-center gap-2 h-14 px-7 rounded-2xl font-semibold text-white bg-white/[0.06] ring-1 ring-white/15 hover:bg-white/10 backdrop-blur transition-all"
              >
                Explore publications
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4"
            >
              {writers.length > 0 && (
                <div className="flex -space-x-2.5">
                  {writers.slice(0, 5).map((w) => (
                    <Avatar key={w.id} src={w.avatar} name={w.name} className="w-9 h-9 ring-2 ring-[#07060f]" />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="font-display font-bold text-2xl tabular-nums">{s.value.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Floating story preview stack */}
          <div className="lg:col-span-5 relative hidden lg:block h-[520px]">
            <div className="absolute inset-0 m-auto w-80 h-80 bg-gradient-to-br from-violet-600/40 to-cyan-500/30 rounded-full blur-[90px]" />
            {(heroStories.length ? heroStories : [null, null, null]).map((s, i) => {
              const positions = ['top-4 left-4 rotate-[-4deg]', 'top-[170px] right-0 rotate-[3deg]', 'bottom-6 left-10 rotate-[-1deg]'];
              return (
                <motion.div
                  key={s?.id ?? i}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute w-[340px] ${positions[i]}`}
                >
                  <motion.div
                    animate={{ y: [0, i % 2 ? 10 : -10, 0] }}
                    transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
                    onClick={() => s && navigateTo(`/story/${s.id}`)}
                    className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-xl shadow-2xl cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    {s ? (
                      <img src={s.coverImage} alt="" referrerPolicy="no-referrer" className="w-[72px] h-[72px] rounded-xl object-cover" />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-xl bg-gradient-to-br from-violet-500/40 to-cyan-500/40" />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-300">
                        {s?.category ?? ['Research', 'Awareness', 'Community'][i]}
                      </span>
                      <p className="font-semibold text-sm text-white line-clamp-2 leading-snug mt-0.5">
                        {s?.title ?? ['Your research, peer-visible', 'Campaigns that move people', 'Stories worth keeping'][i]}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">{s ? `${s.readingTime} min read` : 'Publish today'}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0 transition-colors" />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =============== 2. Value props =============== */}
      <section className="relative -mt-px bg-brand-bg py-16 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: FileText, title: 'Research, properly cited', text: 'Publish findings with DOIs, attachments and structured citations.', color: 'from-violet-500 to-indigo-500' },
            { icon: ShieldCheck, title: 'Anonymous by design', text: 'Metadata is stripped and identities protected for sensitive reporting.', color: 'from-emerald-500 to-teal-500' },
            { icon: Megaphone, title: 'Campaigns that convert', text: 'Rally readers around a cause with progress tracking built in.', color: 'from-rose-500 to-orange-500' },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div className="group h-full p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300">
                <div className={`grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg mb-4 transition-transform group-hover:scale-110 group-hover:rotate-[-4deg]`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-brand-text-primary">{f.title}</h3>
                <p className="text-sm text-brand-text-secondary mt-1.5 leading-relaxed">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* =============== 3. Featured carousel =============== */}
      {featuredStories.length > 0 && (
        <section className="py-20 bg-brand-surface border-b border-brand-border transition-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Curated for you"
              title="Featured editorial"
              action={<span className="hidden sm:block text-xs text-brand-text-tertiary">Scroll to explore →</span>}
            />
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none">
              {featuredStories.map((story) => (
                <div key={story.id} className="w-[86%] sm:w-[520px] md:w-[680px] shrink-0 snap-start">
                  <StoryCard story={story} variant="featured" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =============== 4. Trending topics =============== */}
      {(trendingTags.length > 0 || categories.length > 0) && (
        <section className="py-14 bg-brand-bg border-b border-brand-border transition-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="flex items-center gap-2 mb-6">
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-primary-light text-brand-primary">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="font-display font-semibold text-lg text-brand-text-primary">Trending topics</h3>
            </Reveal>
            <Reveal className="flex flex-wrap gap-2.5">
              {trendingTags.length > 0
                ? trendingTags.map((t) => (
                    <button
                      key={t.tag}
                      onClick={() => navigateTo(`/explore?tag=${t.tag}`)}
                      className="inline-flex items-center gap-1.5 px-4 h-10 bg-brand-surface ring-1 ring-brand-border rounded-full text-sm font-medium text-brand-text-secondary hover:text-brand-primary hover:ring-brand-primary/40 hover:-translate-y-0.5 transition-all shadow-soft"
                    >
                      <Hash className="w-3.5 h-3.5 text-brand-text-tertiary" />
                      {t.tag}
                      <span className="text-[11px] tabular-nums text-brand-text-tertiary bg-brand-border-light px-1.5 rounded-full">{t.count}</span>
                    </button>
                  ))
                : categories.slice(0, 12).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigateTo(`/explore/${c.name}`)}
                      className={`px-4 h-10 rounded-full text-sm font-medium hover:-translate-y-0.5 transition-all ${getCategoryColor(c.name)}`}
                    >
                      {c.name}
                    </button>
                  ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* =============== 5. Latest =============== */}
      <section id="latest-section" className="py-20 bg-brand-surface transition-theme scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Fresh off the press"
            title="Latest publications"
            action={<LinkAction onClick={() => navigateTo('/explore')}>Browse all</LinkAction>}
          />

          {latestStories.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl ring-1 ring-brand-border overflow-hidden">
                  <div className="aspect-[16/10] skeleton" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-1/3 rounded skeleton" />
                    <div className="h-5 w-4/5 rounded skeleton" />
                    <div className="h-3 w-full rounded skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {latestStories.map((story, i) => (
                <Reveal key={story.id} delay={(i % 3) * 0.07} className="h-full">
                  <StoryCard story={story} />
                </Reveal>
              ))}
            </div>
          )}

          {visibleStoriesCount < stories.length && (
            <div className="mt-14 text-center">
              <button
                onClick={loadMoreStories}
                className="group inline-flex items-center gap-2 h-12 px-7 ring-1 ring-brand-border hover:ring-brand-primary/50 hover:bg-brand-border-light text-brand-text-primary font-semibold text-sm rounded-full transition-all"
              >
                Load more
                <ArrowRight className="w-4 h-4 rotate-90 transition-transform group-hover:translate-y-0.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =============== 6. Research spotlight =============== */}
      {featuredResearch && (
        <section className="py-20 bg-brand-bg border-y border-brand-border transition-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              icon={Award}
              eyebrow="Verified academic inquiry"
              title="Research spotlight"
              description="Peer-reviewed publications and data releases with official DOI registrations."
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <Reveal className="lg:col-span-7">
                <StoryCard story={featuredResearch} variant="featured" />
              </Reveal>
              {secondaryResearch.length > 0 && (
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <span className="text-xs font-semibold tracking-wider text-brand-text-tertiary uppercase">More studies</span>
                  {secondaryResearch.map((story, i) => (
                    <Reveal key={story.id} delay={i * 0.08}>
                      <StoryCard story={story} variant="compact" />
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =============== 7. Technology (dark band) =============== */}
      {techStories.length > 0 && (
        <section className="relative py-24 bg-[#0a0a14] text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:22px_22px] pointer-events-none" />
          <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <SectionHeader
              dark
              eyebrow="Digital systems & infrastructure"
              title="Technology & algorithmic ethics"
              description="Technical deep-dives into software systems, digital privacy and computational ethics."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {techStories.map((story, i) => (
                <Reveal key={story.id} delay={(i % 2) * 0.08}>
                  <div
                    onClick={() => navigateTo(`/story/${story.id}`)}
                    className="group relative h-full p-6 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-cyan-400/40 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-400/0 group-hover:bg-cyan-400/15 rounded-full blur-3xl transition-colors duration-500" />
                    <div className="relative flex justify-between items-start gap-4 mb-4">
                      <span className="px-2.5 py-1 bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                        {story.category}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(story.publishedDate).toLocaleDateString()}</span>
                    </div>
                    <h4 className="relative font-display font-semibold text-xl text-white mb-2 group-hover:text-cyan-200 transition-colors">
                      {story.title}
                    </h4>
                    <p className="relative text-sm text-slate-400 leading-relaxed mb-5 line-clamp-3 break-words">{plainExcerpt(story.excerpt)}</p>
                    <div className="relative flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        <Avatar src={story.author?.avatar} name={story.author?.name} anonymous={story.isAnonymous} className="w-7 h-7" />
                        <span className="text-xs text-slate-300">{story.isAnonymous ? 'Anonymous' : story.author?.name}</span>
                      </div>
                      <span className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                        Read report <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =============== 8. Campaigns =============== */}
      {campaignStories.length > 0 && (
        <section className="py-20 bg-brand-surface border-b border-brand-border transition-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              icon={Megaphone}
              eyebrow="Activism & action"
              title="Awareness campaigns"
              description="Direct assistance and resource campaigns supporting civil infrastructure and communities."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaignStories.map((story, i) => (
                <Reveal key={story.id} delay={i * 0.08} className="h-full">
                  <div
                    onClick={() => navigateTo(`/story/${story.id}`)}
                    className="group relative flex flex-col h-full p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400" />
                    <div className="flex justify-between items-center mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300 text-[10px] font-semibold uppercase tracking-wider rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> Active
                      </span>
                      {story.urgency && (
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${story.urgency === 'high' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {story.urgency} urgency
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-lg text-brand-text-primary group-hover:text-brand-primary transition-colors mb-2 line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="text-sm text-brand-text-secondary leading-relaxed line-clamp-3 mb-6 break-words">{plainExcerpt(story.excerpt)}</p>
                    <div className="mt-auto">
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-brand-text-secondary">Community funding</span>
                        <span className="text-rose-600 dark:text-rose-400 tabular-nums">{story.goalProgress ?? 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-brand-border-light rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(story.goalProgress ?? 0, 100)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =============== 9. Community =============== */}
      {communityStories.length > 0 && (
        <section className="py-20 bg-brand-bg transition-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Human portraits"
              title="Community stories"
              description="Biographies, local triumphs and oral histories of community cooperatives."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {communityStories.map((story, i) => (
                <Reveal key={story.id} delay={(i % 3) * 0.07} className="h-full">
                  <StoryCard story={story} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =============== 10. Writers =============== */}
      {writers.length > 0 && (
        <section className="py-20 bg-brand-surface border-t border-brand-border transition-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Scholars & journalists" title="Featured writers" />
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none snap-x">
              {writers.map((writer) => {
                const following = followedWriters.includes(writer.id);
                return (
                  <div
                    key={writer.id}
                    className="snap-start w-72 shrink-0 bg-brand-surface ring-1 ring-brand-border rounded-3xl overflow-hidden shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="h-20 bg-gradient-to-br from-violet-500/80 via-fuchsia-500/60 to-cyan-400/70" />
                    <div className="px-6 pb-6 -mt-10 flex flex-col items-center text-center">
                      <button onClick={() => navigateTo(`/profile/${writer.username}`)} className="rounded-full ring-4 ring-brand-surface">
                        <Avatar src={writer.avatar} name={writer.name} className="w-20 h-20" />
                      </button>
                      <button onClick={() => navigateTo(`/profile/${writer.username}`)} className="mt-3 font-display font-semibold text-brand-text-primary hover:text-brand-primary transition-colors">
                        {writer.name}
                      </button>
                      <p className="text-xs text-brand-text-tertiary mb-3">@{writer.username}</p>
                      <p className="text-sm text-brand-text-secondary line-clamp-2 leading-relaxed min-h-[40px] mb-5">
                        {writer.bio || 'Writer on VYRA'}
                      </p>
                      <button
                        onClick={() => handleFollowWriter(writer.id, writer.name)}
                        className={`w-full h-10 rounded-full text-sm font-semibold transition-all ${
                          following
                            ? 'ring-1 ring-brand-border text-brand-text-secondary hover:bg-brand-border-light'
                            : 'bg-brand-text-primary text-brand-surface hover:opacity-90'
                        }`}
                      >
                        {following ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =============== 11. CTA =============== */}
      <section className="relative py-24 px-4 bg-brand-bg">
        <Reveal className="relative max-w-6xl mx-auto rounded-[32px] overflow-hidden bg-[#0d0a1f] text-white text-center px-6 py-20 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-violet-600/50 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-[120px]" />
          <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl mx-auto">
            <h2 className="font-display font-extrabold text-4xl sm:text-6xl leading-[1.05] tracking-tight">
              Your story starts <span className="text-gradient animate-gradient-pan">today.</span>
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Publish verified research, rally support for a cause, or share what you've seen — openly or anonymously.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto">
              <button
                onClick={() => navigateTo('/register')}
                className="h-14 px-8 bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Create free account
              </button>
              <button
                onClick={() => navigateTo('/explore')}
                className="h-14 px-8 ring-1 ring-white/25 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all"
              >
                Explore stories
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
