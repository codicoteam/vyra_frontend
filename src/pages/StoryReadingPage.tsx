import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCard } from '../components/StoryCard';
import { ShareModal } from '../components/ShareModal';
import { CommentsSection } from '../components/CommentsSection';
import { 
  Heart, Bookmark, Share2, Award, Clock, ArrowLeft, Download, FileText,
  AlertTriangle, Play, HelpCircle, X, ShieldAlert, Check, ChevronRight,
  Volume2, Pause, SkipForward, SkipBack, Type
} from 'lucide-react';

export const StoryReadingPage: React.FC = () => {
  const { currentRoute, navigateTo, stories, likedStoryIds, bookmarkedStoryIds, toggleLike, toggleBookmark, showToast } = useApp();
  const [scrollPercent, setScrollPercent] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Sharing states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Audio Narration Playback States
  const [isNarratorOpen, setIsNarratorOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [narrationSpeed, setNarrationSpeed] = useState<number>(1);
  const [narrationVoice, setNarrationVoice] = useState<string>('Aura');
  const [currentSectionIdx, setCurrentSectionIdx] = useState<number>(0);
  const [readingFontSize, setReadingFontSize] = useState<'normal' | 'large' | 'extra'>('normal');

  // Extract Story ID from route e.g. `/story/story-1`
  const getStoryId = () => {
    const parts = currentRoute.split('/');
    return parts[parts.length - 1];
  };

  const storyId = getStoryId();
  const story = stories.find(s => s.id === storyId);

  // Calculate Reading Progress Bar percentage
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const totalScrollable = docHeight - winHeight;
      if (totalScrollable > 0) {
        const percent = Math.min((scrollY / totalScrollable) * 100, 100);
        setScrollPercent(Math.round(percent));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard support to close lightbox with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Split article into sections for reading
  const paragraphs = story ? story.content.split('\n\n').filter(p => p.trim().length > 0) : [];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && isNarratorOpen) {
      const baseDuration = 5500; // 5.5s per section
      const duration = baseDuration / narrationSpeed;
      
      timer = setInterval(() => {
        setCurrentSectionIdx(prev => {
          if (prev >= paragraphs.length - 1) {
            setIsPlaying(false);
            showToast("You've finished listening to the publication report", "success");
            return prev;
          }
          return prev + 1;
        });
      }, duration);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isNarratorOpen, narrationSpeed, paragraphs.length]);

  if (!story) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl text-brand-text-primary">Publication Not Found</h2>
        <p className="text-brand-text-secondary mt-2">The article requested does not exist or has been archived under whistleblower protections.</p>
        <button onClick={() => navigateTo('/home')} className="mt-6 px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold">
          Return to Home Feed
        </button>
      </div>
    );
  }

  const isLiked = likedStoryIds.includes(story.id);
  const isBookmarked = bookmarkedStoryIds.includes(story.id);

  // Format date
  const formattedDate = new Date(story.publishedDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleDownloadAttachment = (fileName: string) => {
    showToast(`Securing download token for: ${fileName}`, 'info');
    setTimeout(() => {
      showToast(`Successfully downloaded verification asset: ${fileName}`, 'success');
    }, 1000);
  };

  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing);
    showToast(isFollowing ? `Unfollowed @${story.author.username}` : `Following @${story.author.username} successfully`, 'success');
  };

  // Curate related publications
  const relatedStories = stories
    .filter(s => s.category === story.category && s.id !== story.id)
    .slice(0, 3);

  const getFontSizeClass = () => {
    if (readingFontSize === 'large') return 'text-lg sm:text-xl';
    if (readingFontSize === 'extra') return 'text-xl sm:text-2xl';
    return 'text-base sm:text-lg';
  };

  return (
    <div className="relative animate-fade-in text-left pb-24">
      
      {/* 1. Thin Reading Progress Bar */}
      <div 
        className="fixed top-16 md:top-20 left-0 h-[4px] bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-400 z-50 transition-all duration-100"
        style={{ width: `${scrollPercent}%` }}
      />

      {/* 2. Top Large Cover Image */}
      <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] bg-slate-900 overflow-hidden">
        <img 
          src={story.coverImage} 
          alt={story.title} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-10000 cursor-pointer"
          onClick={() => setLightboxImage(story.coverImage)}
          title="Click to view full screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-black/35 pointer-events-none" />
        
        {/* Back navigation pill */}
        <button
          onClick={() => navigateTo('/home')}
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 bg-brand-surface/85 border border-brand-border backdrop-blur text-brand-text-primary text-xs font-semibold rounded-full shadow-md hover:bg-brand-surface transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Feed
        </button>
      </div>

      {/* 3. Main Reading Grid (Sidebar Action Sidebar + Center Content Container) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
          
          {/* Left Sticky Toolbar (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-2 relative">
            <div className="sticky top-28 flex flex-col items-center gap-5 p-4 border border-brand-border bg-brand-surface rounded-2xl shadow-sm text-center">
              <p className="text-[10px] font-bold text-brand-text-tertiary uppercase tracking-wider">READING INDEX</p>
              <div className="text-2xl font-black text-brand-primary">{scrollPercent}%</div>
              
              <div className="w-full border-t border-brand-border-light my-1" />

              {/* Like trigger */}
              <button
                onClick={() => toggleLike(story.id)}
                className={`p-3 rounded-full border transition-all ${
                  isLiked 
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-400 scale-110' 
                    : 'bg-transparent border-brand-border text-brand-text-secondary hover:text-rose-600 hover:bg-rose-50/50'
                }`}
                title="Like article"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <span className="text-xs font-bold text-brand-text-secondary -mt-3">{story.likes} likes</span>

              {/* Bookmark trigger */}
              <button
                onClick={() => toggleBookmark(story.id)}
                className={`p-3 rounded-full border transition-all ${
                  isBookmarked 
                    ? 'bg-purple-50 border-purple-200 text-brand-primary dark:bg-purple-950/40 dark:border-purple-900/40 dark:text-purple-300' 
                    : 'bg-transparent border-brand-border text-brand-text-secondary hover:text-brand-primary hover:bg-brand-primary-light/50'
                }`}
                title="Bookmark article"
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <span className="text-[10px] text-brand-text-tertiary -mt-3">Save</span>

              {/* Share trigger */}
              <button
                onClick={handleShare}
                className="p-3 rounded-full border border-brand-border text-brand-text-secondary hover:text-brand-accent hover:bg-brand-accent-light/30 transition-all"
                title="Share link"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <span className="text-[10px] text-brand-text-tertiary -mt-3">Share</span>
            </div>
          </div>

          {/* Center Column: Actual Content Body */}
          <div className="lg:col-span-8 max-w-[680px] mx-auto w-full">
            
            {/* Header Data */}
            <div className="mb-6">
              <span className="bg-brand-primary-light text-brand-primary dark:bg-purple-950/60 dark:text-purple-300 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                {story.category}
              </span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-brand-text-primary leading-tight tracking-tight mb-6">
              {story.title}
            </h1>

            {/* Whistleblower Safeguard details */}
            {story.isAnonymous && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl text-xs mb-8 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold">Whistleblower Safety Shield Verified</p>
                  <p className="opacity-90">The metadata for this publication has been cryptographically scrubbed by VYRA core systems to protect the independent source's identity.</p>
                </div>
              </div>
            )}

            {/* Reading Preferences & Audio Narration Dashboard */}
            <div className="bg-brand-surface dark:bg-slate-900 border border-brand-border rounded-2xl p-4.5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-3.5 text-left">
                <div className="p-2.5 bg-brand-primary-light dark:bg-purple-950 rounded-xl text-brand-primary dark:text-purple-300">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-text-primary">Listen to Investigative Report</p>
                  <p className="text-[10px] text-brand-text-secondary">Synthesized narration audio feed for hands-free reading</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Font Size Selector */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-brand-text-tertiary uppercase hidden sm:inline mr-1">Scale:</span>
                  <div className="flex items-center border border-brand-border rounded-xl p-0.5 bg-brand-bg dark:bg-slate-950">
                    <button 
                      onClick={() => { setReadingFontSize('normal'); showToast('Text scale: Standard', 'info'); }}
                      className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${readingFontSize === 'normal' ? 'bg-brand-surface dark:bg-slate-800 text-brand-primary dark:text-purple-300 shadow-sm' : 'text-brand-text-tertiary hover:text-brand-text-secondary'}`}
                      title="Standard Text"
                    >
                      A
                    </button>
                    <button 
                      onClick={() => { setReadingFontSize('large'); showToast('Text scale: Large', 'info'); }}
                      className={`px-2.5 py-1 text-sm font-bold rounded-lg transition-all ${readingFontSize === 'large' ? 'bg-brand-surface dark:bg-slate-800 text-brand-primary dark:text-purple-300 shadow-sm' : 'text-brand-text-tertiary hover:text-brand-text-secondary'}`}
                      title="Large Text"
                    >
                      A+
                    </button>
                    <button 
                      onClick={() => { setReadingFontSize('extra'); showToast('Text scale: Extra Large', 'info'); }}
                      className={`px-3 py-1 text-base font-bold rounded-lg transition-all ${readingFontSize === 'extra' ? 'bg-brand-surface dark:bg-slate-800 text-brand-primary dark:text-purple-300 shadow-sm' : 'text-brand-text-tertiary hover:text-brand-text-secondary'}`}
                      title="Extra Large Text"
                    >
                      A++
                    </button>
                  </div>
                </div>

                {/* Narrator Play Trigger */}
                <button
                  onClick={() => {
                    setIsNarratorOpen(true);
                    setIsPlaying(true);
                    showToast(`Broadcasting with ${narrationVoice} Voice accent...`, 'success');
                  }}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Listen
                </button>
              </div>
            </div>

            {/* Author Row details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-brand-border-light py-5 mb-10 gap-4">
              <div className="flex items-center gap-3.5">
                <img 
                  src={story.author.avatar} 
                  alt={story.author.name} 
                  className="w-12 h-12 rounded-full object-cover border border-brand-border"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-brand-text-primary">
                      {story.isAnonymous ? 'Anonymous Contributor' : story.author.name}
                    </h4>
                    {!story.isAnonymous && (
                      <button 
                        onClick={handleToggleFollow}
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border transition-colors ${
                          isFollowing 
                            ? 'bg-brand-border-light text-brand-text-secondary border-brand-border' 
                            : 'bg-transparent text-brand-primary border-brand-primary hover:bg-brand-primary hover:text-white'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-brand-text-tertiary mt-0.5">
                    {formattedDate} • <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {story.readingTime} min read</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons & DOI Column */}
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:text-right">
                {/* Mobile/Tablet Toolbar Actions (Hidden on large desktop where sticky panel is active) */}
                <div className="flex lg:hidden items-center gap-2">
                  <button 
                    onClick={() => toggleLike(story.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                      isLiked 
                        ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400' 
                        : 'bg-brand-surface border-brand-border text-brand-text-secondary hover:text-rose-600'
                    }`}
                    title="Like publication"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{story.likes}</span>
                  </button>
                  <button 
                    onClick={() => toggleBookmark(story.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                      isBookmarked 
                        ? 'bg-purple-50 border-purple-200 text-brand-primary dark:bg-purple-950/30 dark:border-purple-900/40 dark:text-purple-300' 
                        : 'bg-brand-surface border-brand-border text-brand-text-secondary hover:text-brand-primary'
                    }`}
                    title="Bookmark publication"
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-2.5 rounded-xl border border-brand-border bg-brand-surface text-brand-text-secondary hover:text-brand-accent hover:border-brand-accent/40 flex items-center gap-1.5 text-xs font-bold"
                    title="Share publication"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden xs:inline">Share</span>
                  </button>
                </div>

                {story.doi && (
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[9px] font-bold text-brand-text-tertiary">PEER REVIEWED DOI</span>
                    <span className="text-xs font-mono text-brand-primary font-semibold">{story.doi}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Styled Publication Markdown Content */}
            <article className="prose dark:prose-invert max-w-none text-brand-text-primary">
              <p className="text-lg sm:text-xl leading-relaxed font-normal text-brand-text-secondary mb-8 italic border-l-4 border-brand-primary pl-4 py-1">
                {story.excerpt}
              </p>

              {/* Rendering formatted HTML text blocks split up for professional look */}
              <div className={`text-brand-text-primary leading-relaxed ${getFontSizeClass()} font-sans space-y-6`}>
                
                {/* Simulated Article Body parsing */}
                {story.content.startsWith('##') ? (
                  // Display real prewritten markdown structures neatly
                  <div className="space-y-6 text-left">
                    {story.content.split('\n\n').map((block, idx) => {
                      if (block.startsWith('##')) {
                        return <h2 key={idx} className="font-display font-bold text-2xl sm:text-3xl text-brand-text-primary mt-10 mb-4">{block.replace('##', '').trim()}</h2>;
                      }
                      if (block.startsWith('###')) {
                        return <h3 key={idx} className="font-display font-semibold text-xl text-brand-text-primary mt-8 mb-3">{block.replace('###', '').trim()}</h3>;
                      }
                      if (block.startsWith('>')) {
                        return (
                          <blockquote key={idx} className="border-l-4 border-brand-primary bg-brand-primary-light/30 dark:bg-brand-primary-light/5 p-5 rounded-r-xl my-6 text-brand-text-secondary italic">
                            {block.replace(/>/g, '').replace(/\*/g, '').trim()}
                          </blockquote>
                        );
                      }
                      if (block.startsWith('-') || block.startsWith('*')) {
                        return (
                          <ul key={idx} className="list-disc pl-6 space-y-2 text-brand-text-secondary my-4">
                            {block.split('\n').map((li, lIdx) => (
                              <li key={lIdx}>{li.replace(/[-*]/, '').trim()}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (block.startsWith('1.')) {
                        return (
                          <ol key={idx} className="list-decimal pl-6 space-y-2 text-brand-text-secondary my-4">
                            {block.split('\n').map((li, lIdx) => (
                              <li key={lIdx}>{li.replace(/^\d+\./, '').trim()}</li>
                            ))}
                          </ol>
                        );
                      }
                      if (block.startsWith('```')) {
                        return (
                          <pre key={idx} className="bg-slate-900 text-slate-100 p-5 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                            <code>{block.replace(/```/g, '').trim()}</code>
                          </pre>
                        );
                      }
                      // Regular paragraph with bolding parser
                      return (
                        <p key={idx} className="leading-relaxed">
                          {block.split('**').map((part, pIdx) => 
                            pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-brand-text-primary">{part}</strong> : part
                          )}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <p>{story.content}</p>
                )}
              </div>
            </article>

            {/* 5. Mock Embedded Video Player (YouTube Education) */}
            {story.id === 'story-1' && (
              <div className="my-10">
                <p className="text-xs font-bold text-brand-text-tertiary mb-3 uppercase tracking-wider">Related Video Seminar</p>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-brand-border shadow-md">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/g-GbT_D6m38" 
                    title="Quantum Computing Seminar" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* 6. Attachments (if any) */}
            {story.hasAttachments && story.attachments && (
              <div className="mt-12 p-6 bg-brand-surface border border-brand-border rounded-2xl">
                <h4 className="font-display font-bold text-sm text-brand-text-primary mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-primary" /> Verified Attachments & Data Sets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {story.attachments.map((file, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleDownloadAttachment(file.name)}
                      className="p-4 bg-brand-bg hover:bg-brand-primary-light/35 dark:hover:bg-brand-primary-light/10 border border-brand-border rounded-xl flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                          <Download className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-brand-text-primary truncate group-hover:text-brand-primary">{file.name}</p>
                          <p className="text-[10px] text-brand-text-tertiary font-mono">{file.size} • {file.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-brand-text-tertiary group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Author Biography Card */}
            <div className="mt-14 p-6 sm:p-8 bg-brand-surface border border-brand-border rounded-2xl flex flex-col sm:flex-row gap-5 items-start">
              <img 
                src={story.author.avatar} 
                alt={story.author.name} 
                className="w-16 h-16 rounded-full object-cover border border-brand-border shrink-0"
              />
              <div className="flex-1 text-left min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-base font-bold text-brand-text-primary">
                      Published By {story.isAnonymous ? 'Anonymous' : story.author.name}
                    </h4>
                    <p className="text-xs text-brand-text-tertiary">
                      {story.isAnonymous ? 'Safeguarded Columnist' : `@${story.author.username}`}
                    </p>
                  </div>
                  {!story.isAnonymous && (
                    <button 
                      onClick={handleToggleFollow}
                      className={`text-xs font-semibold py-1.5 px-4 rounded-xl border transition-all ${
                        isFollowing 
                          ? 'bg-brand-border-light text-brand-text-secondary border-brand-border' 
                          : 'bg-brand-primary text-white border-brand-primary hover:bg-brand-primary-hover'
                      }`}
                    >
                      {isFollowing ? 'Following Scholar' : 'Follow Scholar'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-brand-text-secondary leading-relaxed">
                  {story.isAnonymous 
                    ? 'This author operates under the VYRA privacy shield to broadcast secure public-health records, industrial safety disclosures, or independent civic reviews safely.' 
                    : story.author.bio
                  }
                </p>
              </div>
            </div>

            {/* Comments Section */}
            <CommentsSection postId={story.id} postOwnerId={story.author.id} allowComments={story.allowComments !== false} />

            {/* 8. Related Stories Row */}
            {relatedStories.length > 0 && (
              <div className="mt-16 pt-12 border-t border-brand-border">
                <h4 className="font-display font-bold text-lg text-brand-text-primary mb-6">Related Disciplines</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {relatedStories.map(related => (
                    <StoryCard key={related.id} story={related} variant="compact" />
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 9. Full Screen Lightbox Modal Overlay */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Lightbox full size" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-up"
          />
        </div>
      )}

      {/* 10. Sticky Bottom Sovereign Audio Player */}
      {isNarratorOpen && (
        <div className="fixed bottom-0 inset-x-0 bg-brand-surface/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-brand-border py-4 px-4 sm:px-6 md:px-8 z-50 shadow-2xl animate-slide-in-up transition-theme">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left info: Voice & Wave animation */}
            <div className="flex items-center gap-4 w-full md:w-1/3 text-left">
              <div className="relative w-12 h-12 bg-purple-100 dark:bg-purple-950/50 rounded-xl flex items-center justify-center text-brand-primary dark:text-purple-300 shrink-0">
                {isPlaying ? (
                  // Animated audio bars
                  <div className="flex items-end gap-0.5 h-6">
                    <div className="w-1 bg-brand-primary dark:bg-purple-400 rounded animate-audio-bar-1" style={{ animation: 'audio-pulse 0.6s infinite alternate' }} />
                    <div className="w-1 bg-brand-primary dark:bg-purple-400 rounded animate-audio-bar-2" style={{ animation: 'audio-pulse 0.9s infinite alternate 0.15s' }} />
                    <div className="w-1 bg-brand-primary dark:bg-purple-400 rounded animate-audio-bar-3" style={{ animation: 'audio-pulse 0.7s infinite alternate 0.3s' }} />
                    <div className="w-1 bg-brand-primary dark:bg-purple-400 rounded animate-audio-bar-4" style={{ animation: 'audio-pulse 0.5s infinite alternate 0.1s' }} />
                  </div>
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-brand-text-primary truncate">{story.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-brand-primary dark:text-purple-300 font-bold bg-brand-primary-light dark:bg-purple-950/40 px-1.5 py-0.5 rounded">
                    Voice: {narrationVoice}
                  </span>
                  <span className="text-[10px] text-brand-text-tertiary">
                    Section {currentSectionIdx + 1} of {paragraphs.length || 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: Caption display and Play controls */}
            <div className="flex flex-col items-center gap-2 w-full md:w-2/5">
              {/* Media button row */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setCurrentSectionIdx(prev => Math.max(0, prev - 1));
                    showToast('Skipped back', 'info');
                  }}
                  disabled={currentSectionIdx === 0}
                  className="p-1.5 hover:bg-brand-border-light dark:hover:bg-slate-800 disabled:opacity-30 rounded-lg text-brand-text-secondary"
                  title="Previous Paragraph"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full shadow-md transition-transform active:scale-95 flex items-center justify-center"
                  title={isPlaying ? "Pause Narration" : "Resume Narration"}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button 
                  onClick={() => {
                    if (currentSectionIdx < paragraphs.length - 1) {
                      setCurrentSectionIdx(prev => prev + 1);
                      showToast('Skipped forward', 'info');
                    } else {
                      showToast("Already at the end of the report", "info");
                    }
                  }}
                  disabled={currentSectionIdx === paragraphs.length - 1}
                  className="p-1.5 hover:bg-brand-border-light dark:hover:bg-slate-800 disabled:opacity-30 rounded-lg text-brand-text-secondary"
                  title="Next Paragraph"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Scrolling Live Caption drawer */}
              <div className="w-full bg-brand-bg dark:bg-slate-950 border border-brand-border/60 rounded-xl px-3 py-1.5 text-center text-[11px] text-brand-text-secondary font-medium italic truncate max-w-sm sm:max-w-md">
                "{paragraphs[currentSectionIdx]?.replace(/[#*`>-]/g, '').trim() || 'Initializing synthesized narration...'}"
              </div>
            </div>

            {/* Right: Narration preferences (Voice & Speed) + Close */}
            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-1/4">
              
              {/* Speed Controller */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-brand-text-tertiary font-bold uppercase hidden xl:inline">Speed:</span>
                <select 
                  value={narrationSpeed}
                  onChange={(e) => {
                    const speed = parseFloat(e.target.value);
                    setNarrationSpeed(speed);
                    showToast(`Speed multiplier: ${speed}x`, 'info');
                  }}
                  className="bg-brand-bg dark:bg-slate-950 border border-brand-border text-xs rounded-lg p-1 outline-none text-brand-text-secondary"
                >
                  <option value="0.75">0.75x</option>
                  <option value="1">1.0x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2.0x</option>
                </select>
              </div>

              {/* Voice Selector */}
              <div className="flex items-center gap-1 border-r border-brand-border pr-2 mr-1">
                <span className="text-[10px] text-brand-text-tertiary font-bold uppercase hidden xl:inline">Voice:</span>
                <select 
                  value={narrationVoice}
                  onChange={(e) => {
                    setNarrationVoice(e.target.value);
                    showToast(`Accent loaded: ${e.target.value}`, 'success');
                  }}
                  className="bg-brand-bg dark:bg-slate-950 border border-brand-border text-xs rounded-lg p-1 outline-none text-brand-text-secondary"
                >
                  <option value="Aura">Aura (Synthetic)</option>
                  <option value="Veritas">Veritas (Inquiry)</option>
                  <option value="Calm">Calm (Academic)</option>
                </select>
              </div>

              {/* Close audio session */}
              <button 
                onClick={() => {
                  setIsPlaying(false);
                  setIsNarratorOpen(false);
                  showToast('Closed audio narration session', 'info');
                }}
                className="p-1.5 hover:bg-brand-border-light dark:hover:bg-slate-800 rounded-lg text-brand-text-tertiary hover:text-brand-text-secondary"
                title="Exit player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 11. Social Sharing & Snippet Copy Modal */}
      <ShareModal 
        story={story} 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        showToast={showToast} 
      />

    </div>
  );
};
