import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

import { StoryCard } from '../components/StoryCard';
import { ArrowRight, TrendingUp, Compass, Award, BookOpen, HeartPulse, Shield, FileText } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateTo, stories, showToast } = useApp();
  const [visibleStoriesCount, setVisibleStoriesCount] = useState(6);
  const [followedWriters, setFollowedWriters] = useState<string[]>([]);

  // Split stories into various curated sections as per specification
  const featuredStories = stories.slice(0, 6); // Curate first 6
  const latestStories = stories.slice(0, visibleStoriesCount);
  
  // Research specific spotlight stories
  const researchStories = stories.filter(s => s.isResearch);
  const featuredResearch = researchStories[0];
  const secondaryResearch = researchStories.slice(1, 4);

  // Technology specific stories
  const techStories = stories.filter(s => s.category === "Technology" || s.category === "Algorithmic Ethics" || s.category === "Quantum Physics").slice(0, 4);

  // Awareness Campaign stories
  const campaignStories = stories.filter(s => s.isCampaign).slice(0, 3);

  // Community Stories
  const communityStories = stories.filter(s => s.category === "Community Stories" || s.category === "Humanities & Arts" || s.category === "Psychology & Mental Health").slice(0, 6);

  const loadMoreStories = () => {
    if (visibleStoriesCount >= stories.length) {
      showToast('All currently available publications are loaded!', 'info');
      return;
    }
    setVisibleStoriesCount(prev => Math.min(prev + 6, stories.length));
    showToast('Loaded 6 more publications successfully', 'success');
  };

  const handleFollowWriter = (userId: string, name: string) => {
    setFollowedWriters(prev => {
      const isFollowing = prev.includes(userId);
      showToast(isFollowing ? `Stopped following ${name}` : `You are now following ${name}`, 'success');
      return isFollowing ? prev.filter(id => id !== userId) : [...prev, userId];
    });
  };

  return (
    <div className="relative overflow-hidden w-full">
      
      {/* 1. Majestic Hero Section */}
      <section 
        id="hero-section"
        className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white pt-12 pb-20 overflow-hidden"
      >
        {/* Animated Background Gradients & Mesh Overlays */}
        <div className="absolute inset-0 z-0 bg-cover opacity-20 pointer-events-none mix-blend-overlay bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Glowing Orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/35 rounded-full filter blur-[120px] animate-pulse duration-10000" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500/25 rounded-full filter blur-[120px] animate-pulse duration-7000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Text Context */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold tracking-wide text-cyan-300 animate-fade-in">
              <Award className="w-3.5 h-3.5 text-yellow-400" /> FORWARD-THINKING PUBLISHING ECOSYSTEM
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
              Every Voice <br/>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300 bg-clip-text text-transparent">Matters.</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-xl font-normal leading-relaxed max-w-2xl">
              Share research paper findings, civil awareness campaigns, technological inquiries, digital privacy guides, and personal human stories that inspire global change. 
            </p>

            {/* Writer Count Trust Row */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex -space-x-2">
                {(() => {
                  const authorsMap = new Map<string, any>();
                  stories.forEach(story => {
                    if (story.author && story.author.id) {
                      authorsMap.set(story.author.id, story.author);
                    }
                  });
                  return Array.from(authorsMap.values()).slice(0, 4);
                })().map((writer) => (
                  <img 
                    key={writer.id} 
                    src={writer.avatar} 
                    alt={writer.name} 
                    className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover"
                  />
                ))}
              </div>
              <p className="text-xs text-slate-300 font-semibold">
                Join <span className="text-cyan-400 font-bold">15,400+</span> verified researchers and independent journalists
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={() => navigateTo('/write')}
                className="px-8 py-4 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-2xl font-bold tracking-wide transition-all shadow-lg hover:shadow-purple-500/20 text-center"
              >
                Start Writing Story
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('latest-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white/10 border border-white/20 hover:bg-white/15 text-white rounded-2xl font-bold tracking-wide transition-all text-center"
              >
                Explore Publications
              </button>
            </div>
          </div>

          {/* Hero Floating Cards Graphic */}
          <div className="lg:col-span-5 relative hidden lg:flex flex-col items-center justify-center h-[500px]">
            {/* Giant Glowing Logo Backplate */}
            <div className="absolute inset-0 m-auto w-72 h-72 bg-gradient-to-br from-purple-600/30 to-cyan-500/30 rounded-full blur-[80px]" />

            {/* Decorative skewed grids */}
            <div className="relative w-full max-w-sm space-y-4 transform rotate-6 scale-95 hover:rotate-2 transition-transform duration-500">
              {/* Fake Card 1 */}
              <div className="bg-slate-900/90 border border-white/10 backdrop-blur-md p-4 rounded-xl shadow-2xl flex items-start gap-3">
                <img src="https://picsum.photos/seed/h-1/120/120" className="w-16 h-16 rounded-lg object-cover" />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-purple-400 tracking-wider">TECHNOLOGY</span>
                  <p className="font-bold text-sm text-white line-clamp-1">Quantum Encryption Protocols</p>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">Protecting community structures securely from surveillance.</p>
                </div>
              </div>

              {/* Fake Card 2 */}
              <div className="bg-slate-900/90 border border-white/10 backdrop-blur-md p-4 rounded-xl shadow-2xl flex items-start gap-3 translate-x-6">
                <img src="https://picsum.photos/seed/h-2/120/120" className="w-16 h-16 rounded-lg object-cover" />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-rose-400 tracking-wider">HEALTHCARE</span>
                  <p className="font-bold text-sm text-white line-clamp-1">Cellular Remodeling & Stress</p>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">Clinical trials reverse neural stress paths in 8 weeks.</p>
                </div>
              </div>

              {/* Fake Card 3 */}
              <div className="bg-slate-900/90 border border-white/10 backdrop-blur-md p-4 rounded-xl shadow-2xl flex items-start gap-3 -translate-x-4">
                <img src="https://picsum.photos/seed/h-3/120/120" className="w-16 h-16 rounded-lg object-cover" />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-emerald-400 tracking-wider">ENVIRONMENT</span>
                  <p className="font-bold text-sm text-white line-clamp-1">Ocean Reforestation Initiatives</p>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">Giant kelp forest restoration and biological CO2 traps.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Featured Stories Carousel */}
      <section className="py-16 bg-brand-surface border-b border-brand-border transition-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="text-left">
              <span className="text-xs font-bold text-brand-primary tracking-widest uppercase">CURATED FOR YOU</span>
              <h2 className="font-display font-bold text-2xl sm:text-4xl text-brand-text-primary mt-1">Featured Editorial</h2>
            </div>
            <div className="flex gap-2">
              <span className="text-xs text-brand-text-tertiary">Swipe to explore →</span>
            </div>
          </div>

          {/* Snap Scroll Wrapper */}
          <div className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory scrollbar-none">
            {featuredStories.map((story) => (
              <div key={story.id} className="w-[300px] sm:w-[460px] md:w-[600px] shrink-0 snap-center">
                <StoryCard story={story} variant="featured" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Trending Topics Cloud */}
      <section className="py-12 bg-brand-bg border-b border-brand-border transition-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            <h3 className="font-display font-semibold text-lg text-brand-text-primary">Trending Research & Awareness Topics</h3>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {(() => {
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
              return Array.from(tagCountMap.entries())
                .map(([tag, count]) => ({ tag, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 12);
            })().map((t, idx) => (
              <button
                key={idx}
                onClick={() => navigateTo(`/explore?tag=${t.tag}`)}
                className="px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs sm:text-sm font-medium text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary/40 hover:scale-105 transition-all shadow-sm"
              >
                #{t.tag} <span className="text-brand-text-tertiary ml-1">({t.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Latest Publications */}
      <section id="latest-section" className="py-16 bg-brand-surface transition-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-10">
            <span className="text-xs font-bold text-brand-primary tracking-widest uppercase">CONTINUOUS LOGS</span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-brand-text-primary mt-1">Latest Publications</h2>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestStories.map((story) => (
              <div key={story.id} className="h-full">
                <StoryCard story={story} />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleStoriesCount < stories.length && (
            <div className="mt-12 text-center">
              <button 
                onClick={loadMoreStories}
                className="px-8 py-3.5 border-2 border-brand-border hover:border-brand-primary hover:text-brand-primary text-brand-text-secondary font-bold text-sm tracking-wide rounded-2xl transition-all"
              >
                Load More Publications
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. Research Spotlight Section */}
      <section className="py-16 bg-brand-bg border-y border-brand-border transition-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-brand-primary" />
            <span className="text-xs font-bold text-brand-primary tracking-widest uppercase">Verified Academic Inquiry</span>
          </div>
          <div className="text-left mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-brand-text-primary">Research Spotlight</h2>
            <p className="text-brand-text-secondary mt-2">Peer-reviewed publications and data releases with official DOI registrations.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Highlighted massive research */}
            {featuredResearch && (
              <div className="lg:col-span-7">
                <StoryCard story={featuredResearch} variant="featured" />
              </div>
            )}

            {/* Right: Stacked smaller cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <span className="text-xs font-bold text-brand-text-tertiary text-left uppercase mb-1">Additional Studies</span>
              {secondaryResearch.map((story) => (
                <StoryCard key={story.id} story={story} variant="compact" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Technology & Systems Section (Dark Accents Theme) */}
      <section className="py-20 bg-slate-900 text-white transition-theme relative">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-left mb-12">
            <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">DIGITAL SYSTEMS & INFRASTRUCTURE</span>
            <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight mt-1 bg-gradient-to-r from-white via-slate-100 to-cyan-100 bg-clip-text text-transparent">
              Technology & Algorithmic Ethics
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl">Deep-dive technical inquiries examining the convergence of software systems, digital privacy bounds, and computational ethics.</p>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {techStories.map((story) => (
              <div key={story.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-6 hover:border-cyan-500/30 transition-all duration-300">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <span className="px-2.5 py-1 bg-cyan-950/80 text-cyan-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {story.category}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(story.publishedDate).toLocaleDateString()}</span>
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-2 hover:text-cyan-400 transition-colors cursor-pointer" onClick={() => navigateTo(`/story/${story.id}`)}>
                  {story.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                  {story.excerpt}
                </p>
                <div className="flex items-center justify-between border-t border-slate-900 pt-4">
                  <div className="flex items-center gap-2">
                    <img src={story.author.avatar} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs text-slate-300">{story.isAnonymous ? 'Anonymous' : story.author.name}</span>
                  </div>
                  <button onClick={() => navigateTo(`/story/${story.id}`)} className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1">
                    Read Report <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Awareness Campaigns */}
      <section className="py-16 bg-brand-surface border-b border-brand-border transition-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-10">
            <span className="text-xs font-bold text-brand-primary tracking-widest uppercase">ACTIVISM & INTERVENE</span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-brand-text-primary mt-1">Awareness Campaigns</h2>
            <p className="text-brand-text-secondary mt-2">Direct assistance and resource campaigns designed to support civil infrastructure and micro-communities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {campaignStories.map((story) => (
              <div 
                key={story.id} 
                onClick={() => navigateTo(`/story/${story.id}`)}
                className="group flex flex-col bg-brand-surface rounded-2xl border-l-4 border-l-rose-500 border-y border-r border-brand-border p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer justify-between h-full"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-[10px] font-bold uppercase rounded-md">
                      ACTIVE ADVOCACY
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${story.urgency === 'high' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {story.urgency} Urgency
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-brand-text-primary group-hover:text-brand-primary transition-colors mb-2 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-xs text-brand-text-secondary leading-relaxed line-clamp-3 mb-4">
                    {story.excerpt}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-brand-border-light">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-brand-text-secondary">Community Funding Progress</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">{story.goalProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${story.goalProgress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Community Stories */}
      <section className="py-16 bg-brand-bg transition-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-10">
            <span className="text-xs font-bold text-brand-primary tracking-widest uppercase">HUMAN PORTRAITS</span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-brand-text-primary mt-1">Community Stories</h2>
            <p className="text-brand-text-secondary mt-2">Biographies, localized triumphs, and oral histories of community cooperatives.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {communityStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>

      {/* 9. Popular Writers */}
      <section className="py-16 bg-brand-surface border-t border-brand-border transition-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-10">
            <span className="text-xs font-bold text-brand-primary tracking-widest uppercase">SCHOLARS & JOURNALISTS</span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-brand-text-primary mt-1">Featured Writers</h2>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none">
            {(() => {
              const authorsMap = new Map<string, any>();
              stories.forEach(story => {
                if (story.author && story.author.id) {
                  authorsMap.set(story.author.id, story.author);
                }
              });
              return Array.from(authorsMap.values());
            })().map((writer) => (
              <div 
                key={writer.id}
                className="w-72 shrink-0 bg-brand-surface border border-brand-border p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-300"
              >
                <img 
                  src={writer.avatar} 
                  alt={writer.name} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-brand-primary/20 mb-4 cursor-pointer"
                  onClick={() => navigateTo(`/profile/${writer.username}`)}
                />
                <h4 className="font-display font-bold text-sm text-brand-text-primary hover:text-brand-primary cursor-pointer" onClick={() => navigateTo(`/profile/${writer.username}`)}>
                  {writer.name}
                </h4>
                <p className="text-xs text-brand-text-tertiary mb-3">@{writer.username}</p>
                <p className="text-xs text-brand-text-secondary line-clamp-2 leading-relaxed min-h-[32px] mb-4">
                  {writer.bio}
                </p>

                <div className="flex items-center gap-6 text-xs text-brand-text-tertiary mb-5">
                  <div>
                    <span className="block font-bold text-brand-text-primary text-sm">{writer.followersCount || 0}</span>
                    <span>followers</span>
                  </div>
                  <div>
                    <span className="block font-bold text-brand-text-primary text-sm">{writer.storiesCount || 0}</span>
                    <span>publications</span>
                  </div>
                </div>

                <button
                  onClick={() => handleFollowWriter(writer.id, writer.name)}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors ${
                    followedWriters.includes(writer.id)
                      ? 'bg-brand-border-light text-brand-text-secondary hover:bg-brand-border'
                      : 'bg-brand-primary text-white hover:bg-brand-primary-hover'
                  }`}
                >
                  {followedWriters.includes(writer.id) ? 'Following' : 'Follow Writer'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Powerful Call-To-Action (CTA) Section */}
      <section className="relative py-24 bg-gradient-to-r from-purple-700 to-indigo-800 text-white text-center overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute inset-0 bg-cover opacity-10 pointer-events-none bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-cyan-400/20 rounded-full filter blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-fuchsia-400/20 rounded-full filter blur-[100px] animate-pulse duration-5000" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center gap-6">
          <h2 className="font-display font-black text-3xl sm:text-5xl leading-tight">
            Start Your Writing Journey Today.
          </h2>
          <p className="text-indigo-100 text-sm sm:text-lg max-w-2xl leading-relaxed">
            Whether you want to publish verified academic breakthroughs, support unincorporated communities with awareness campaigns, or publish anonymous reviews under secure protections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <button 
              onClick={() => navigateTo('/register')}
              className="px-8 py-4 bg-white text-purple-900 hover:bg-indigo-50 font-bold tracking-wide rounded-2xl shadow-xl transition-all"
            >
              Create Free Account
            </button>
            <button 
              onClick={() => navigateTo('/explore')}
              className="px-8 py-4 bg-transparent border-2 border-white/40 hover:bg-white/10 text-white font-bold tracking-wide rounded-2xl transition-all"
            >
              Explore All Stories
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
