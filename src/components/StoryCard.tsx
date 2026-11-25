import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Story } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, Bookmark, Clock, AlertCircle, FileText, Globe, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  variant?: 'default' | 'featured' | 'compact' | 'research';
}

// Category colour helper (works in both themes)
export const getCategoryColor = (category: string) => {
  const lower = String(category || '').toLowerCase();
  if (lower.includes('tech') || lower.includes('quantum')) return 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300';
  if (lower.includes('health') || lower.includes('biotech')) return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300';
  if (lower.includes('environment') || lower.includes('climate')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
  if (lower.includes('social') || lower.includes('humanrights')) return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300';
  if (lower.includes('psychology')) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300';
  if (lower.includes('space') || lower.includes('astro')) return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
  if (lower.includes('philosophy') || lower.includes('ethics')) return 'bg-stone-200 text-stone-700 dark:bg-stone-500/15 dark:text-stone-300';
  if (lower.includes('community')) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
  return 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300';
};

/**
 * Icon name for a category. The backend falls back to 'Cpu' when a category has no icon,
 * which makes every topic look the same – so infer one from the name in that case.
 */
export const getCategoryIconName = (name: string, iconName?: string) => {
  if (iconName && iconName !== 'Cpu') return iconName;
  const n = String(name || '').toLowerCase();
  if (n.includes('environment') || n.includes('climate')) return 'Leaf';
  if (n.includes('health') || n.includes('medic') || n.includes('biotech')) return 'HeartPulse';
  if (n.includes('privacy') || n.includes('security')) return 'Lock';
  if (n.includes('social') || n.includes('community') || n.includes('human')) return 'Users';
  if (n.includes('psych') || n.includes('mental')) return 'Brain';
  if (n.includes('space') || n.includes('astro')) return 'Rocket';
  if (n.includes('philosophy') || n.includes('ethic')) return n.includes('tech') ? 'Cpu' : 'Scale';
  if (n.includes('art') || n.includes('culture')) return 'Palette';
  if (n.includes('science') || n.includes('research')) return 'FlaskConical';
  if (n.includes('politic') || n.includes('law')) return 'Landmark';
  return iconName || 'BookOpen';
};

/** Turn a markdown excerpt into readable plain text (drops images, link URLs, formatting) */
export const plainExcerpt = (text?: string) =>
  String(text || '')
    .replace(/!\[[^\]]*\]\([^)]*\)?/g, '') // images (also truncated ones)
    .replace(/\[([^\]]*)\]\([^)]*\)?/g, '$1') // links -> label
    .replace(/https?:\/\/\S+/g, '') // bare URLs
    .replace(/[#>*_`~|]+/g, '') // markdown symbols
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.{3}$/, '');

/** Category badge that sits on top of a photo – solid so it stays readable in both themes */
const imageBadge = 'bg-white/90 text-slate-800 dark:bg-slate-950/75 dark:text-white shadow-sm backdrop-blur';

/** Avatar with graceful fallback (anonymous posts and missing images) */
export const Avatar: React.FC<{ src?: string; name: string; anonymous?: boolean; className?: string }> = ({
  src,
  name,
  anonymous,
  className = 'w-8 h-8',
}) => {
  const [failed, setFailed] = useState(false);
  if (anonymous || !src || failed) {
    return (
      <span className={`${className} shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white ring-1 ring-brand-border`}>
        {anonymous ? (
          <ShieldCheck className="w-1/2 h-1/2" />
        ) : (
          <span className="text-[0.7em] font-semibold">{(name || '?').trim().charAt(0).toUpperCase()}</span>
        )}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} shrink-0 rounded-full object-cover ring-1 ring-brand-border`}
    />
  );
};

const CoverImage: React.FC<{ src: string; alt: string; className?: string; zoom?: string }> = ({ src, alt, className = '', zoom = 'group-hover:scale-[1.06]' }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <>
      {!loaded && !failed && <div className="absolute inset-0 skeleton" />}
      {failed || !src ? (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-cyan-400/30 bg-dot-grid" />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover ${zoom} transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        />
      )}
    </>
  );
};

export const StoryCard: React.FC<StoryCardProps> = ({ story, variant = 'default' }) => {
  const { navigateTo, likedStoryIds, bookmarkedStoryIds, toggleLike, toggleBookmark } = useApp();

  const isLiked = likedStoryIds.includes(story.id);
  const isBookmarked = bookmarkedStoryIds.includes(story.id);
  const authorName = story.isAnonymous ? 'Anonymous contributor' : story.author?.name;
  const authorSub = story.isAnonymous ? 'Protected identity' : `@${story.author?.username}`;

  const open = () => navigateTo(`/story/${story.id}`);
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-btn')) return;
    open();
  };
  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
      e.preventDefault();
      open();
    }
  };

  const formattedDate = new Date(story.publishedDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const LikeButton = ({ size = 'md' }: { size?: 'sm' | 'md' }) => (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => toggleLike(story.id)}
      aria-pressed={isLiked}
      aria-label={isLiked ? 'Unlike' : 'Like'}
      className={`inline-flex items-center gap-1.5 rounded-full transition-colors ${size === 'sm' ? 'h-8 px-2.5' : 'h-9 px-3'} ${
        isLiked
          ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
          : 'text-brand-text-tertiary hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10'
      }`}
    >
      <motion.span key={String(isLiked)} initial={{ scale: isLiked ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
        <Heart className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${isLiked ? 'fill-current' : ''}`} />
      </motion.span>
      <span className="text-xs font-semibold tabular-nums">{story.likes}</span>
    </motion.button>
  );

  const BookmarkButton = ({ size = 'md' }: { size?: 'sm' | 'md' }) => (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => toggleBookmark(story.id)}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
      className={`grid place-items-center rounded-full transition-colors ${size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'} ${
        isBookmarked
          ? 'bg-violet-50 text-brand-primary dark:bg-violet-500/15 dark:text-violet-300'
          : 'text-brand-text-tertiary hover:text-brand-primary hover:bg-brand-border-light'
      }`}
    >
      <Bookmark className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${isBookmarked ? 'fill-current' : ''}`} />
    </motion.button>
  );

  const Badges = () => (
    <>
      {story.isCampaign ? (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-rose-600/90 backdrop-blur text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-white" />
          </span>
          Campaign
        </span>
      ) : (story.isResearch || variant === 'research') ? (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-slate-900/70 backdrop-blur text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full">
          {story.doi ? <FileText className="w-3 h-3" /> : <Globe className="w-3 h-3" />} {story.doi ? 'DOI' : 'Research'}
        </span>
      ) : null}
    </>
  );

  const CampaignProgress = ({ big = false }: { big?: boolean }) =>
    story.isCampaign && story.goalProgress !== undefined ? (
      <div className="mb-4">
        <div className={`flex justify-between font-semibold mb-1.5 ${big ? 'text-xs' : 'text-[11px]'}`}>
          <span className="text-rose-600 dark:text-rose-400">Campaign progress</span>
          <span className="tabular-nums text-brand-text-secondary">{story.goalProgress}%</span>
        </div>
        <div className={`w-full ${big ? 'h-2' : 'h-1.5'} bg-brand-border-light rounded-full overflow-hidden`}>
          <motion.div
            className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.min(story.goalProgress, 100)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    ) : null;

  const cardBase =
    'group relative bg-brand-surface ring-1 ring-brand-border hover:ring-brand-primary/30 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lift shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary';

  /* ---------------- Featured ---------------- */
  if (variant === 'featured') {
    return (
      <article
        id={`story-card-${story.id}`}
        onClick={handleCardClick}
        onKeyDown={handleKey}
        tabIndex={0}
        className={`${cardBase} flex flex-col md:flex-row rounded-3xl h-full`}
      >
        <div className="relative md:w-1/2 h-60 md:h-auto md:min-h-[340px] overflow-hidden bg-brand-border-light shrink-0">
          <CoverImage src={story.coverImage} alt={story.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          <span className={`absolute top-4 left-4 text-[11px] font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full ${imageBadge}`}>
            {story.category}
          </span>
          <Badges />
        </div>

        <div className="flex flex-col flex-1 p-6 sm:p-8 justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-brand-text-tertiary mb-3">
              <Clock className="w-3.5 h-3.5" /> {story.readingTime} min read
              <span className="w-1 h-1 rounded-full bg-brand-text-tertiary/60" />
              <time>{formattedDate}</time>
            </div>
            <h3 className="font-display font-bold text-2xl sm:text-[28px] text-brand-text-primary leading-tight mb-3 line-clamp-3">
              <span className="bg-gradient-to-r from-brand-primary to-brand-primary bg-[length:0%_2px] bg-no-repeat bg-left-bottom group-hover:bg-[length:100%_2px] transition-[background-size] duration-500">
                {story.title}
              </span>
            </h3>
            <p className="text-brand-text-secondary leading-relaxed mb-6 line-clamp-3 break-words">{plainExcerpt(story.excerpt)}</p>
            <div className="interactive-btn"><CampaignProgress big /></div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-brand-border-light">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={story.author?.avatar} name={authorName} anonymous={story.isAnonymous} className="w-10 h-10" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-text-primary truncate">{authorName}</p>
                <p className="text-xs text-brand-text-tertiary truncate">{authorSub}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 interactive-btn">
              <LikeButton />
              <BookmarkButton />
            </div>
          </div>
        </div>
      </article>
    );
  }

  /* ---------------- Compact ---------------- */
  if (variant === 'compact') {
    return (
      <article
        id={`story-card-${story.id}`}
        onClick={handleCardClick}
        onKeyDown={handleKey}
        tabIndex={0}
        className={`${cardBase} hover:-translate-y-0.5 flex gap-4 p-3.5 rounded-2xl`}
      >
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-xl bg-brand-border-light shrink-0">
          <CoverImage src={story.coverImage} alt={story.title} zoom="group-hover:scale-110" />
        </div>

        <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full ${getCategoryColor(story.category)}`}>
                {story.category}
              </span>
              <span className="text-[11px] text-brand-text-tertiary">{formattedDate}</span>
            </div>
            <h4 className="font-display font-semibold text-sm sm:text-base text-brand-text-primary group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
              {story.title}
            </h4>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 text-brand-text-secondary">
            <span className="truncate">By {story.isAnonymous ? 'Anonymous' : story.author?.name}</span>
            <div className="flex items-center interactive-btn -mr-1">
              <LikeButton size="sm" />
              <BookmarkButton size="sm" />
            </div>
          </div>
        </div>
      </article>
    );
  }

  /* ---------------- Default / research ---------------- */
  return (
    <article
      id={`story-card-${story.id}`}
      onClick={handleCardClick}
      onKeyDown={handleKey}
      tabIndex={0}
      className={`${cardBase} flex flex-col rounded-2xl h-full`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-border-light">
        <CoverImage src={story.coverImage} alt={story.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className={`absolute top-3 left-3 text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full ${imageBadge}`}>
          {story.category}
        </span>
        <Badges />
        <span className="absolute bottom-3 right-3 grid place-items-center w-9 h-9 rounded-full bg-white/90 text-slate-900 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 text-xs text-brand-text-tertiary mb-2.5">
          <Clock className="w-3 h-3" /> {story.readingTime} min read
          <span className="w-1 h-1 rounded-full bg-brand-text-tertiary/60" />
          <time>{formattedDate}</time>
        </div>

        <h3 className="font-display font-semibold text-lg text-brand-text-primary group-hover:text-brand-primary transition-colors leading-snug mb-2 line-clamp-2">
          {story.title}
        </h3>
        <p className="text-sm text-brand-text-secondary leading-relaxed line-clamp-3 mb-4 break-words">{plainExcerpt(story.excerpt)}</p>

        <div className="interactive-btn"><CampaignProgress /></div>

        {story.doi && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-brand-text-tertiary mb-3">
            <span className="bg-brand-border-light px-1.5 py-0.5 rounded text-brand-text-secondary font-semibold">DOI</span>
            <span className="truncate">{story.doi}</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-brand-border-light">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar src={story.author?.avatar} name={authorName} anonymous={story.isAnonymous} className="w-8 h-8" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-brand-text-primary truncate">{authorName}</p>
              <p className="text-[11px] text-brand-text-tertiary truncate">{authorSub}</p>
            </div>
          </div>
          <div className="flex items-center interactive-btn -mr-1.5">
            <LikeButton size="sm" />
            <BookmarkButton size="sm" />
          </div>
        </div>
      </div>
    </article>
  );
};
