import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { useApp } from '../context/AppContext';
import { StoryCard, Avatar, plainExcerpt } from '../components/StoryCard';
import { ShareModal } from '../components/ShareModal';
import ReactMarkdown from 'react-markdown';
import { CommentsSection } from '../components/CommentsSection';
import {
  Heart,
  Bookmark,
  Share2,
  Clock,
  ArrowLeft,
  Download,
  FileText,
  AlertTriangle,
  Play,
  X,
  ShieldCheck,
  ChevronRight,
  Headphones,
  Pause,
  SkipForward,
  SkipBack,
  Calendar,
  Maximize2,
  ArrowUp,
} from 'lucide-react';

type FontSize = 'normal' | 'large' | 'extra';

/** Split article into speakable chunks (Chrome stops long utterances, so keep them short) */
const toSpeechChunks = (markdown: string): string[] => {
  const chunks: string[] = [];
  markdown
    .split(/\n{2,}/)
    .map((p) => plainExcerpt(p))
    .filter((p) => p.length > 1)
    .forEach((para) => {
      const sentences = para.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [para];
      let buf = '';
      sentences.forEach((s) => {
        if ((buf + s).length > 220 && buf) {
          chunks.push(buf.trim());
          buf = '';
        }
        buf += s;
      });
      if (buf.trim()) chunks.push(buf.trim());
    });
  return chunks;
};

export const StoryReadingPage: React.FC = () => {
  const { currentRoute, navigateTo, stories, likedStoryIds, bookmarkedStoryIds, toggleLike, toggleBookmark, showToast } =
    useApp();

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [readingFontSize, setReadingFontSize] = useState<FontSize>(
    () => (localStorage.getItem('vyra-reading-size') as FontSize) || 'normal',
  );
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Reading progress (spring-smoothed)
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });
  const [percent, setPercent] = useState(0);
  useEffect(() => scrollYProgress.on('change', (v) => {
    setPercent(Math.round(v * 100));
    setShowBackToTop(window.scrollY > 900);
  }), [scrollYProgress]);

  useEffect(() => localStorage.setItem('vyra-reading-size', readingFontSize), [readingFontSize]);

  const storyId = currentRoute.split('/').pop()?.split('?')[0];
  const story = stories.find((s) => s.id === storyId);

  /* ---------------- Text-to-speech narration (Web Speech API) ---------------- */
  const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  const chunks = useMemo(() => (story ? toSpeechChunks(story.content) : []), [story?.content]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState<string>(() => localStorage.getItem('vyra-voice') || '');
  const [speed, setSpeed] = useState(1);
  const [isNarratorOpen, setIsNarratorOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chunkIdx, setChunkIdx] = useState(0);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!synth) return;
    const load = () => {
      const all = synth.getVoices();
      const english = all.filter((v) => v.lang?.toLowerCase().startsWith('en'));
      setVoices(english.length ? english : all);
    };
    load();
    synth.addEventListener('voiceschanged', load);
    return () => {
      synth.removeEventListener('voiceschanged', load);
      utterRef.current = null;
      synth.cancel();
    };
  }, [synth]);

  const stopSpeech = useCallback(() => {
    utterRef.current = null;
    synth?.cancel();
    setIsPlaying(false);
  }, [synth]);

  const speakFrom = useCallback(
    (idx: number, opts?: { rate?: number; voice?: string }) => {
      if (!synth) return;
      utterRef.current = null;
      synth.cancel();
      if (idx >= chunks.length) {
        setIsPlaying(false);
        setChunkIdx(0);
        showToast("You've finished listening to this story", 'success');
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[idx]);
      u.rate = opts?.rate ?? speed;
      const v = voices.find((x) => x.name === (opts?.voice ?? voiceName));
      if (v) u.voice = v;
      u.onend = () => {
        if (utterRef.current === u) speakFrom(idx + 1, opts);
      };
      u.onerror = (e) => {
        if (utterRef.current === u && e.error !== 'interrupted' && e.error !== 'canceled') {
          setIsPlaying(false);
          showToast('Narration stopped: your browser could not play audio', 'error');
        }
      };
      utterRef.current = u;
      setChunkIdx(idx);
      setIsPlaying(true);
      synth.speak(u);
    },
    [synth, chunks, speed, voices, voiceName, showToast],
  );

  const restartWith = (opts: { rate?: number; voice?: string }) => {
    if (isPlaying) speakFrom(chunkIdx, opts);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!story) {
    return (
      <div className="max-w-xl mx-auto py-28 px-4 text-center">
        <div className="mx-auto mb-6 grid place-items-center w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl text-brand-text-primary">Story not found</h2>
        <p className="text-brand-text-secondary mt-2">
          This story doesn't exist, is still loading, or has been archived.
        </p>
        <button
          onClick={() => navigateTo('/home')}
          className="mt-8 h-11 px-6 bg-brand-gradient text-white rounded-full font-semibold shadow-glow"
        >
          Back to feed
        </button>
      </div>
    );
  }

  const isLiked = likedStoryIds.includes(story.id);
  const isBookmarked = bookmarkedStoryIds.includes(story.id);
  const authorName = story.isAnonymous ? 'Anonymous contributor' : story.author?.name;
  const excerpt = plainExcerpt(story.excerpt);
  const contentStart = plainExcerpt(story.content).slice(0, 40);
  const showDek = excerpt.length > 3 && !contentStart.startsWith(excerpt.replace(/\.\.\.$/, '').slice(0, 40));

  const formattedDate = new Date(story.publishedDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDownloadAttachment = (fileName: string) => {
    showToast(`Preparing download: ${fileName}`, 'info');
    setTimeout(() => showToast(`Downloaded ${fileName}`, 'success'), 1000);
  };

  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing);
    showToast(isFollowing ? `Unfollowed @${story.author.username}` : `Following @${story.author.username}`, 'success');
  };

  const relatedStories = stories.filter((s) => s.category === story.category && s.id !== story.id).slice(0, 3);

  const bodySize = {
    normal: 'text-[17px] sm:text-[19px]',
    large: 'text-[19px] sm:text-[21px]',
    extra: 'text-[21px] sm:text-[24px]',
  }[readingFontSize];

  const actionBtn = (active: boolean, activeCls: string) =>
    `group relative grid place-items-center w-11 h-11 rounded-full transition-all ${
      active ? activeCls : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-border-light'
    }`;

  return (
    <div className="relative text-left pb-28">
      {/* Reading progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 z-[45] origin-left"
        style={{ scaleX: progress }}
      />

      {/* =============== Header =============== */}
      <header className="relative pt-10 sm:pt-14 pb-10 overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-gradient-to-b from-violet-500/15 via-fuchsia-500/5 to-transparent blur-3xl rounded-full" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-6">
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => (window.history.length > 1 ? window.history.back() : navigateTo('/home'))}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-text-tertiary hover:text-brand-text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <button
                onClick={() => navigateTo(`/explore/${story.category}`)}
                className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-brand-primary-light text-brand-primary dark:text-violet-300 hover:brightness-95 transition"
              >
                {story.category}
              </button>
              {story.isResearch && (
                <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                  Research
                </span>
              )}
              {story.isCampaign && (
                <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                  Campaign
                </span>
              )}
            </div>

            <h1 className="font-display font-bold text-[34px] leading-[1.1] sm:text-5xl md:text-[56px] text-brand-text-primary tracking-[-0.025em] mb-5">
              {story.title}
            </h1>

            {showDek && (
              <p className="text-lg sm:text-xl text-brand-text-secondary leading-relaxed mb-8">{excerpt}</p>
            )}

            {/* Author + meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-brand-border-light">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  disabled={story.isAnonymous}
                  onClick={() => navigateTo(`/profile/${story.author.username}`)}
                  className="rounded-full"
                >
                  <Avatar src={story.author?.avatar} name={authorName} anonymous={story.isAnonymous} className="w-11 h-11" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-text-primary truncate">{authorName}</span>
                    {!story.isAnonymous && (
                      <button
                        onClick={handleToggleFollow}
                        className={`text-xs font-semibold transition-colors ${isFollowing ? 'text-brand-text-tertiary' : 'text-brand-primary hover:underline underline-offset-4'}`}
                      >
                        · {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-brand-text-tertiary mt-0.5">
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formattedDate}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {story.readingTime} min read</span>
                  </div>
                </div>
              </div>

              {story.doi && (
                <div className="text-right">
                  <p className="text-[10px] font-semibold tracking-wider text-brand-text-tertiary uppercase">DOI</p>
                  <p className="text-xs font-mono text-brand-primary font-semibold">{story.doi}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* =============== Cover =============== */}
      {story.coverImage && (
        <motion.figure
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto px-0 sm:px-6 mb-12"
        >
          <button
            onClick={() => setLightboxImage(story.coverImage)}
            className="group relative block w-full aspect-[16/9] sm:rounded-3xl overflow-hidden bg-brand-border-light shadow-lift"
            aria-label="View cover image full screen"
          >
            <img
              src={story.coverImage}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03]"
            />
            <span className="absolute bottom-4 right-4 grid place-items-center w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4" />
            </span>
          </button>
        </motion.figure>
      )}

      {/* =============== Body =============== */}
      <div className="relative max-w-6xl mx-auto px-5 sm:px-6">
        <div className="lg:grid lg:grid-cols-[80px_minmax(0,1fr)_80px] lg:gap-8">
          {/* Sticky action rail (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 flex flex-col items-center gap-1.5 p-2 rounded-full bg-brand-surface ring-1 ring-brand-border shadow-soft">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => toggleLike(story.id)}
                className={actionBtn(isLiked, 'text-rose-600 bg-rose-50 dark:bg-rose-500/15 dark:text-rose-400')}
                aria-label="Like"
                aria-pressed={isLiked}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>
              <span className="text-[11px] font-semibold tabular-nums text-brand-text-tertiary -mt-1 mb-1">{story.likes}</span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => toggleBookmark(story.id)}
                className={actionBtn(isBookmarked, 'text-brand-primary bg-violet-50 dark:bg-violet-500/15 dark:text-violet-300')}
                aria-label="Bookmark"
                aria-pressed={isBookmarked}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </motion.button>
              <button onClick={() => setIsShareModalOpen(true)} className={actionBtn(false, '')} aria-label="Share">
                <Share2 className="w-5 h-5" />
              </button>
              {synth && (
                <button
                  onClick={() => {
                    setIsNarratorOpen(true);
                    if (!isPlaying) speakFrom(chunkIdx);
                  }}
                  className={actionBtn(isNarratorOpen, 'text-brand-primary bg-violet-50 dark:bg-violet-500/15 dark:text-violet-300')}
                  aria-label="Listen to this story"
                >
                  <Headphones className="w-5 h-5" />
                </button>
              )}
              <div className="w-6 h-px bg-brand-border my-1" />
              <span className="text-[11px] font-semibold tabular-nums text-brand-primary py-1">{percent}%</span>
            </div>
          </aside>

          {/* Article column */}
          <div className="max-w-[700px] w-full mx-auto">
            {story.isAnonymous && (
              <div className="flex items-start gap-3 p-4 mb-8 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200/70 text-emerald-900 dark:bg-emerald-500/10 dark:ring-emerald-500/20 dark:text-emerald-200">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div className="text-sm">
                  <p className="font-semibold">Identity protected</p>
                  <p className="opacity-80 mt-0.5">
                    Metadata for this publication was removed to protect the source's identity.
                  </p>
                </div>
              </div>
            )}

            {/* Reading tools */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-10 p-2 pl-4 rounded-2xl bg-brand-surface ring-1 ring-brand-border shadow-soft">
              {synth ? (
                <button
                  onClick={() => {
                    setIsNarratorOpen(true);
                    isPlaying ? stopSpeech() : speakFrom(chunkIdx);
                  }}
                  className="group inline-flex items-center gap-3 text-left"
                >
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-gradient text-white shadow-glow transition-transform group-hover:scale-105">
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-brand-text-primary">
                      {isPlaying ? 'Listening…' : 'Listen to this story'}
                    </span>
                    <span className="block text-xs text-brand-text-tertiary">{story.readingTime} min · read aloud by your device</span>
                  </span>
                </button>
              ) : (
                <span className="text-sm text-brand-text-tertiary">Reading options</span>
              )}

              <div className="flex items-center gap-1 p-1 rounded-xl bg-brand-bg ring-1 ring-brand-border" role="group" aria-label="Text size">
                {(['normal', 'large', 'extra'] as FontSize[]).map((size, i) => (
                  <button
                    key={size}
                    onClick={() => setReadingFontSize(size)}
                    aria-pressed={readingFontSize === size}
                    className={`relative h-8 px-2.5 rounded-lg font-semibold transition-colors ${
                      readingFontSize === size ? 'text-brand-primary' : 'text-brand-text-tertiary hover:text-brand-text-secondary'
                    }`}
                    style={{ fontSize: 12 + i * 2.5 }}
                    title={`${size} text`}
                  >
                    {readingFontSize === size && (
                      <motion.span layoutId="font-pill" className="absolute inset-0 rounded-lg bg-brand-surface shadow-soft ring-1 ring-brand-border" />
                    )}
                    <span className="relative">A</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile actions */}
            <div className="flex lg:hidden items-center gap-2 mb-8">
              <button
                onClick={() => toggleLike(story.id)}
                className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-full ring-1 text-sm font-semibold transition-colors ${
                  isLiked ? 'ring-rose-200 bg-rose-50 text-rose-600 dark:ring-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400' : 'ring-brand-border text-brand-text-secondary'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {story.likes}
              </button>
              <button
                onClick={() => toggleBookmark(story.id)}
                aria-label="Bookmark"
                className={`grid place-items-center w-10 h-10 rounded-full ring-1 transition-colors ${
                  isBookmarked ? 'ring-violet-200 bg-violet-50 text-brand-primary dark:ring-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300' : 'ring-brand-border text-brand-text-secondary'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full ring-1 ring-brand-border text-sm font-semibold text-brand-text-secondary"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            {/* Markdown body */}
            <article className={`${bodySize} leading-[1.75] text-brand-text-primary/90 font-sans [&>*:first-child]:mt-0`}>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h2 className="font-display font-bold text-[1.6em] leading-tight text-brand-text-primary mt-12 mb-4">{children}</h2>,
                  h2: ({ children }) => <h2 className="font-display font-bold text-[1.45em] leading-tight text-brand-text-primary mt-12 mb-4">{children}</h2>,
                  h3: ({ children }) => <h3 className="font-display font-semibold text-[1.2em] text-brand-text-primary mt-10 mb-3">{children}</h3>,
                  p: ({ children }) => <p className="my-6">{children}</p>,
                  img: ({ src, alt }) => (
                    <button type="button" onClick={() => src && setLightboxImage(String(src))} className="block w-full my-10 group">
                      <img src={src as string} alt={alt || ''} loading="lazy" className="block w-full rounded-2xl ring-1 ring-brand-border group-hover:shadow-lift transition-shadow" />
                      {alt && <span className="block mt-3 text-center text-sm text-brand-text-tertiary">{alt}</span>}
                    </button>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="relative my-10 pl-6 border-l-[3px] border-brand-primary text-[1.12em] font-display italic text-brand-text-primary [&>p]:my-2">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => <ul className="list-disc marker:text-brand-primary pl-6 space-y-2.5 my-6">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal marker:text-brand-primary marker:font-semibold pl-6 space-y-2.5 my-6">{children}</ol>,
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noreferrer" className="text-brand-primary font-medium underline decoration-brand-primary/30 underline-offset-4 hover:decoration-brand-primary transition-colors">
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => <strong className="font-semibold text-brand-text-primary">{children}</strong>,
                  hr: () => <div className="my-12 text-center text-brand-text-tertiary tracking-[1em]">···</div>,
                  code: ({ children, className }) =>
                    className ? (
                      <code className={className}>{children}</code>
                    ) : (
                      <code className="px-1.5 py-0.5 rounded-md bg-brand-border-light text-[0.88em] font-mono text-brand-primary">{children}</code>
                    ),
                  pre: ({ children }) => (
                    <pre className="my-8 bg-[#0d1117] text-slate-100 p-5 rounded-2xl font-mono text-sm overflow-x-auto leading-relaxed ring-1 ring-white/10">
                      {children}
                    </pre>
                  ),
                }}
              >
                {story.content}
              </ReactMarkdown>
            </article>

            {story.id === 'story-1' && (
              <div className="my-12">
                <p className="text-xs font-semibold text-brand-text-tertiary mb-3 uppercase tracking-wider">Related video</p>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 ring-1 ring-brand-border shadow-soft">
                  <iframe
                    src="https://www.youtube.com/embed/g-GbT_D6m38"
                    title="Related video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            {story.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-12">
                {story.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => navigateTo(`/explore?tag=${t}`)}
                    className="h-9 px-4 rounded-full bg-brand-border-light text-sm font-medium text-brand-text-secondary hover:text-brand-primary hover:bg-brand-primary-light transition-colors"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}

            {/* Attachments */}
            {story.hasAttachments && story.attachments && (
              <div className="mt-12 p-6 rounded-3xl bg-brand-surface ring-1 ring-brand-border">
                <h4 className="font-display font-semibold text-brand-text-primary mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-primary" /> Attachments & data sets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {story.attachments.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDownloadAttachment(file.name)}
                      className="p-3.5 bg-brand-bg hover:bg-brand-border-light ring-1 ring-brand-border rounded-2xl flex items-center justify-between text-left group transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid place-items-center w-10 h-10 bg-brand-primary-light rounded-xl text-brand-primary shrink-0">
                          <Download className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-brand-text-primary truncate">{file.name}</p>
                          <p className="text-xs text-brand-text-tertiary font-mono">
                            {file.size} · {file.type.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-brand-text-tertiary group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* End-of-article actions */}
            <div className="flex items-center justify-between gap-4 mt-14 py-5 border-y border-brand-border-light">
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleLike(story.id)}
                  className={`inline-flex items-center gap-2 h-11 px-5 rounded-full font-semibold text-sm transition-colors ${
                    isLiked ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400' : 'bg-brand-border-light text-brand-text-secondary hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {isLiked ? 'Liked' : 'Like'} · {story.likes}
                </motion.button>
                <button
                  onClick={() => toggleBookmark(story.id)}
                  aria-label="Bookmark"
                  className={`grid place-items-center w-11 h-11 rounded-full transition-colors ${
                    isBookmarked ? 'bg-violet-50 text-brand-primary dark:bg-violet-500/15 dark:text-violet-300' : 'bg-brand-border-light text-brand-text-secondary hover:text-brand-primary'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-brand-text-primary text-brand-surface font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            {/* Author card */}
            <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-brand-surface ring-1 ring-brand-border flex flex-col sm:flex-row gap-5 items-start">
              <Avatar src={story.author?.avatar} name={authorName} anonymous={story.isAnonymous} className="w-16 h-16" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">Written by</p>
                <div className="flex flex-wrap items-center justify-between gap-3 mt-1 mb-2">
                  <div>
                    <h4 className="font-display text-lg font-semibold text-brand-text-primary">{authorName}</h4>
                    {!story.isAnonymous && <p className="text-sm text-brand-text-tertiary">@{story.author.username}</p>}
                  </div>
                  {!story.isAnonymous && (
                    <button
                      onClick={handleToggleFollow}
                      className={`h-9 px-5 rounded-full text-sm font-semibold transition-all ${
                        isFollowing ? 'ring-1 ring-brand-border text-brand-text-secondary' : 'bg-brand-gradient text-white shadow-glow'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
                <p className="text-sm text-brand-text-secondary leading-relaxed">
                  {story.isAnonymous
                    ? 'This author publishes under VYRA’s identity protection to share sensitive public-interest information safely.'
                    : story.author.bio || 'Writer on VYRA.'}
                </p>
              </div>
            </div>

            <CommentsSection postId={story.id} postOwnerId={story.author.id} allowComments={story.allowComments !== false} />
          </div>

          <div className="hidden lg:block" />
        </div>

        {/* Related */}
        {relatedStories.length > 0 && (
          <section className="mt-20 pt-12 border-t border-brand-border">
            <h4 className="font-display font-bold text-2xl text-brand-text-primary mb-8">More in {story.category}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedStories.map((related) => (
                <StoryCard key={related.id} story={related} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && !isNarratorOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed right-5 bottom-24 md:bottom-8 z-40 grid place-items-center w-11 h-11 rounded-full bg-brand-surface ring-1 ring-brand-border shadow-lift text-brand-text-secondary hover:text-brand-primary"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-5 right-5 grid place-items-center w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              src={lightboxImage}
              alt=""
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narration player */}
      <AnimatePresence>
        {isNarratorOpen && synth && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed z-[45] left-3 right-3 bottom-[88px] md:bottom-5 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[680px]"
          >
            <div className="glass ring-1 ring-brand-border rounded-3xl shadow-lift p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center w-11 h-11 rounded-2xl bg-brand-primary-light text-brand-primary shrink-0">
                  {isPlaying ? (
                    <div className="flex items-end gap-[3px] h-5">
                      {[0.6, 0.9, 0.7, 0.5].map((d, i) => (
                        <span key={i} className="w-[3px] bg-current rounded-full" style={{ animation: `audio-pulse ${d}s ${i * 0.12}s infinite alternate` }} />
                      ))}
                    </div>
                  ) : (
                    <Headphones className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-text-primary truncate">{story.title}</p>
                  <p className="text-xs text-brand-text-tertiary truncate italic">
                    “{chunks[chunkIdx] || 'Ready to read aloud'}”
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => (isPlaying ? speakFrom(Math.max(0, chunkIdx - 1)) : setChunkIdx(Math.max(0, chunkIdx - 1)))}
                    disabled={chunkIdx === 0}
                    className="hidden sm:grid place-items-center w-9 h-9 rounded-full text-brand-text-secondary hover:bg-brand-border-light disabled:opacity-30"
                    aria-label="Previous"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => (isPlaying ? stopSpeech() : speakFrom(chunkIdx))}
                    className="grid place-items-center w-11 h-11 bg-brand-gradient text-white rounded-full shadow-glow active:scale-95 transition-transform"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                  <button
                    onClick={() => (isPlaying ? speakFrom(chunkIdx + 1) : setChunkIdx(Math.min(chunks.length - 1, chunkIdx + 1)))}
                    disabled={chunkIdx >= chunks.length - 1}
                    className="hidden sm:grid place-items-center w-9 h-9 rounded-full text-brand-text-secondary hover:bg-brand-border-light disabled:opacity-30"
                    aria-label="Next"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      stopSpeech();
                      setIsNarratorOpen(false);
                    }}
                    className="grid place-items-center w-9 h-9 rounded-full text-brand-text-tertiary hover:text-brand-text-primary hover:bg-brand-border-light"
                    aria-label="Close player"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1 rounded-full bg-brand-border-light overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-gradient rounded-full"
                    animate={{ width: `${chunks.length ? ((chunkIdx + (isPlaying ? 0.5 : 0)) / chunks.length) * 100 : 0}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <select
                  value={speed}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value);
                    setSpeed(rate);
                    restartWith({ rate });
                  }}
                  className="h-7 bg-brand-bg ring-1 ring-brand-border text-xs rounded-lg px-1.5 outline-none text-brand-text-secondary"
                  aria-label="Speed"
                >
                  {[0.75, 1, 1.25, 1.5, 2].map((r) => (
                    <option key={r} value={r}>{r}×</option>
                  ))}
                </select>
                {voices.length > 0 && (
                  <select
                    value={voiceName}
                    onChange={(e) => {
                      setVoiceName(e.target.value);
                      localStorage.setItem('vyra-voice', e.target.value);
                      restartWith({ voice: e.target.value });
                    }}
                    className="h-7 max-w-[140px] bg-brand-bg ring-1 ring-brand-border text-xs rounded-lg px-1.5 outline-none text-brand-text-secondary"
                    aria-label="Voice"
                  >
                    <option value="">Default voice</option>
                    {voices.map((v) => (
                      <option key={v.name} value={v.name}>{v.name.replace(/^(Microsoft|Google)\s/, '')}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareModal story={story} isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} showToast={showToast} />
    </div>
  );
};
