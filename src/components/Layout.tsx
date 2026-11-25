import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { getCategoryColor, getCategoryIconName } from './StoryCard';

import {
  Menu,
  X,
  Search,
  Bell,
  LogIn,
  LogOut,
  User,
  BookOpen,
  ChevronDown,
  Sun,
  Moon,
  Home,
  Compass,
  Edit3,
  ShieldAlert,
  Laptop,
  Heart,
  Bookmark,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react';
import * as Icons from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const dropdownMotion = {
  initial: { opacity: 0, y: 8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.98 },
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
};

export const Logo: React.FC<{ className?: string; onClick?: () => void }> = ({ className = '', onClick }) => (
  <button
    onClick={onClick}
    className={`group flex items-center gap-2 ${className}`}
    aria-label="VYRA home"
  >
    <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 shadow-glow transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 6l7 13 7-13" />
      </svg>
    </span>
    <span className="font-display font-extrabold text-2xl tracking-tight text-brand-text-primary">
      VYRA
    </span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    currentRoute,
    navigateTo,
    theme,
    toggleTheme,
    currentUser,
    setCurrentUser,
    notifications,
    showToast,
    categories,
    stories,
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (profileRef.current && !profileRef.current.contains(target)) setProfileDropdownOpen(false);
      if (categoriesRef.current && !categoriesRef.current.contains(target)) setCategoriesMenuOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
        setCategoriesMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', clickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setCategoriesMenuOpen(false);
  }, [currentRoute]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem('email') as HTMLInputElement;
    if (input && input.value) {
      showToast(`Successfully subscribed ${input.value} to VYRA Digest!`, 'success');
      input.value = '';
    }
  };

  const renderCategoryIcon = (iconName: string) => {
    const LucideIcon = (Icons as any)[iconName];
    if (LucideIcon) return <LucideIcon className="w-4 h-4" />;
    return <BookOpen className="w-4 h-4" />;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigateTo('/');
    showToast('Logged out of your VYRA account safely', 'info');
  };

  const isLandingPage = currentRoute === '/';
  const transparentHeader = isLandingPage && !isScrolled;

  const navLinks = [
    { label: 'Home', route: '/home', active: currentRoute === '/home' },
    { label: 'Explore', route: '/explore', active: currentRoute.startsWith('/explore') },
    { label: 'Saved', route: '/saved', active: currentRoute === '/saved' },
  ];

  const navLinkClass = (active: boolean) =>
    `relative px-3.5 py-2 text-sm font-medium rounded-full transition-colors ${
      transparentHeader
        ? active ? 'text-white' : 'text-white/70 hover:text-white'
        : active ? 'text-brand-text-primary' : 'text-brand-text-secondary hover:text-brand-text-primary'
    }`;

  const iconBtnClass = `relative grid place-items-center w-10 h-10 rounded-full transition-all ${
    transparentHeader
      ? 'text-white/80 hover:text-white hover:bg-white/10'
      : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-border-light'
  }`;

  const dropdownItem =
    'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-border-light text-left rounded-lg transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text-primary transition-theme">
      {/* ---------- Top Navbar ---------- */}
      <header
        id="vyra-header"
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          transparentHeader
            ? 'bg-transparent border-b border-transparent'
            : 'glass border-b border-brand-border/70 shadow-[0_1px_0_0_rgb(0_0_0/0.02)]'
        }`}
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-[72px]'}`}>
          <div className="flex items-center gap-6">
            <Logo
              onClick={() => navigateTo('/')}
              className={transparentHeader ? '[&>span:last-child]:text-white' : ''}
            />

            {/* Desktop navigation with animated active pill */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
              {navLinks.map((link) => (
                <button key={link.route} onClick={() => navigateTo(link.route)} className={navLinkClass(link.active)}>
                  {link.active && (
                    <motion.span
                      layoutId="nav-pill"
                      className={`absolute inset-0 rounded-full ${transparentHeader ? 'bg-white/15' : 'bg-brand-border-light'}`}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </button>
              ))}

              {/* Categories mega menu */}
              <div ref={categoriesRef} className="relative">
                <button
                  onClick={() => setCategoriesMenuOpen(!categoriesMenuOpen)}
                  aria-expanded={categoriesMenuOpen}
                  className={`${navLinkClass(false)} flex items-center gap-1`}
                >
                  Categories
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${categoriesMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {categoriesMenuOpen && (
                    <motion.div
                      {...dropdownMotion}
                      className="absolute top-full left-0 mt-3 w-[520px] bg-brand-surface border border-brand-border rounded-2xl shadow-lift p-3 z-50 origin-top-left"
                    >
                      <div className="px-2 pt-1 pb-3 mb-2 border-b border-brand-border-light flex items-center justify-between">
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-brand-text-tertiary">
                          Browse disciplines
                        </span>
                        <button
                          onClick={() => navigateTo('/explore')}
                          className="text-xs font-semibold text-brand-primary hover:gap-1.5 flex items-center gap-1 transition-all"
                        >
                          View all <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {categories.slice(0, 10).map((cat) => {
                          const count = stories.filter(
                            (s) => String(s.category).toLowerCase() === cat.name.toLowerCase(),
                          ).length;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => navigateTo(`/explore/${cat.name}`)}
                              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-brand-border-light text-left transition-colors group"
                            >
                              <div className={`grid place-items-center w-9 h-9 rounded-lg transition-transform group-hover:scale-110 ${getCategoryColor(cat.name)}`}>
                                {renderCategoryIcon(getCategoryIconName(cat.name, cat.iconName))}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-brand-text-primary truncate">{cat.name}</p>
                                <p className="text-[11px] text-brand-text-tertiary truncate">
                                  {count} {count === 1 ? 'publication' : 'publications'}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button onClick={() => navigateTo('/search')} className={iconBtnClass} title="Search" aria-label="Search">
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              onClick={() => navigateTo('/notifications')}
              className={`${iconBtnClass} hidden sm:grid`}
              title="Notifications"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-bold grid place-items-center ring-2 ring-brand-surface">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button onClick={toggleTheme} className={iconBtnClass} title="Toggle theme" aria-label="Toggle theme">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                  className="grid place-items-center"
                >
                  {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                </motion.span>
              </AnimatePresence>
            </button>

            <button
              onClick={() => navigateTo('/write')}
              className="hidden md:flex items-center gap-1.5 ml-1.5 px-4 h-10 bg-brand-gradient text-white text-sm font-semibold rounded-full shadow-glow hover:brightness-110 hover:-translate-y-px active:translate-y-0 transition-all"
            >
              <Edit3 className="w-4 h-4" /> Write
            </button>

            {currentUser ? (
              <div ref={profileRef} className="relative z-50 ml-1">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  aria-label="Account menu"
                  className="flex items-center gap-1 p-0.5 pr-1.5 rounded-full ring-1 ring-brand-border hover:ring-brand-primary/50 transition-all"
                >
                  <img
                    src={currentUser.avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${transparentHeader ? 'text-white/80' : 'text-brand-text-tertiary'} ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      {...dropdownMotion}
                      className="absolute right-0 mt-3 w-64 bg-brand-surface border border-brand-border rounded-2xl shadow-lift p-2 z-50 origin-top-right"
                    >
                      <div className="flex items-center gap-3 px-2.5 py-2.5 mb-1 rounded-xl bg-brand-border-light/60">
                        <img src={currentUser.avatar} alt="" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-brand-text-primary truncate">{currentUser.name}</p>
                          <p className="text-xs text-brand-text-tertiary truncate">@{currentUser.username}</p>
                        </div>
                      </div>

                      <div className="py-1">
                        <button onClick={() => navigateTo(`/profile/${currentUser.username}`)} className={dropdownItem}>
                          <User className="w-4 h-4" /> My profile
                        </button>
                        <button onClick={() => navigateTo('/dashboard')} className={dropdownItem}>
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </button>
                        <button onClick={() => navigateTo('/saved')} className={dropdownItem}>
                          <Bookmark className="w-4 h-4" /> Bookmarks
                        </button>
                        <button onClick={() => navigateTo(`/profile/${currentUser.username}/liked`)} className={dropdownItem}>
                          <Heart className="w-4 h-4" /> Liked
                        </button>
                      </div>

                      <div className="pt-1 border-t border-brand-border-light">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left rounded-lg transition-colors font-medium"
                        >
                          <LogOut className="w-4 h-4" /> Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => navigateTo('/login')}
                className={`hidden sm:flex items-center gap-1.5 ml-1 px-4 h-10 text-sm font-semibold rounded-full transition-all ${
                  transparentHeader
                    ? 'text-white ring-1 ring-white/30 hover:bg-white/10'
                    : 'text-brand-text-primary ring-1 ring-brand-border hover:ring-brand-primary/50 hover:bg-brand-border-light'
                }`}
              >
                <LogIn className="w-4 h-4" /> Sign in
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`${iconBtnClass} md:hidden`}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Mobile drawer ---------- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-brand-surface shadow-2xl p-5 flex flex-col"
            >
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-brand-border-light">
                <Logo onClick={() => navigateTo('/')} />
                <button onClick={() => setMobileMenuOpen(false)} className="grid place-items-center w-10 h-10 rounded-full hover:bg-brand-border-light" aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentUser && (
                <div className="flex items-center gap-3 p-3 bg-brand-border-light/70 rounded-2xl mb-5">
                  <img src={currentUser.avatar} alt="" referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{currentUser.name}</p>
                    <p className="text-xs text-brand-text-tertiary truncate">@{currentUser.username}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
                {[
                  { label: 'Welcome', route: '/', icon: Compass, active: currentRoute === '/' },
                  { label: 'Home feed', route: '/home', icon: Home, active: currentRoute === '/home' },
                  { label: 'Explore', route: '/explore', icon: Compass, active: currentRoute.startsWith('/explore') },
                  { label: 'Saved', route: '/saved', icon: Bookmark, active: currentRoute === '/saved' },
                  { label: 'Write a story', route: '/write', icon: Edit3, active: currentRoute === '/write' },
                  { label: 'Style guide', route: '/theme-demo', icon: Laptop, active: currentRoute === '/theme-demo' },
                  { label: 'Admin panel', route: '/admin', icon: ShieldAlert, active: currentRoute === '/admin' },
                ].map((item, i) => (
                  <motion.button
                    key={item.route}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i + 0.05 }}
                    onClick={() => navigateTo(item.route)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium text-left transition-colors ${
                      item.active
                        ? 'bg-brand-primary-light/60 dark:bg-brand-primary-light/40 text-brand-primary'
                        : 'text-brand-text-secondary hover:bg-brand-border-light'
                    }`}
                  >
                    <item.icon className="w-5 h-5" /> {item.label}
                  </motion.button>
                ))}
              </nav>

              <div className="border-t border-brand-border-light pt-5">
                {currentUser ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 h-12 ring-1 ring-rose-200 dark:ring-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                ) : (
                  <button
                    onClick={() => navigateTo('/login')}
                    className="w-full flex items-center justify-center gap-2 h-12 bg-brand-gradient text-white rounded-xl text-sm font-semibold shadow-glow"
                  >
                    <LogIn className="w-4 h-4" /> Sign in
                  </button>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ---------- Main content with page transition ---------- */}
      <main className={`flex-grow ${isLandingPage ? '' : 'pt-[72px]'}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentRoute.split('?')[0]}
            // opacity only: a transform here would break position:fixed modals inside pages
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="relative bg-brand-surface border-t border-brand-border pt-16 pb-28 md:pb-12 transition-theme overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-violet-500/10 dark:bg-violet-500/10 blur-[100px] rounded-full" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-4">
              <Logo onClick={() => navigateTo('/')} />
              <p className="mt-4 text-sm text-brand-text-secondary leading-relaxed max-w-xs">
                Voices Yielding Research & Awareness. A publishing home for scientific rigor, investigative
                reporting, social change and creative freedom.
              </p>
              <div className="mt-6 flex items-center gap-2">
                {[Icons.Twitter, Icons.Github, Icons.Linkedin, Icons.Globe].map((Ico, i) => (
                  <button
                    key={i}
                    className="grid place-items-center w-9 h-9 rounded-full ring-1 ring-brand-border text-brand-text-tertiary hover:text-brand-primary hover:ring-brand-primary/40 hover:-translate-y-0.5 transition-all"
                  >
                    <Ico className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-semibold text-brand-text-primary text-sm mb-4">Categories</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  ['Technology & Ethics', 'Technology'],
                  ['Environmental Science', 'Environmental Science'],
                  ['Healthcare & Medicine', 'Healthcare & Medicine'],
                  ['Social Awareness', 'Social Awareness'],
                  ['Digital Privacy', 'Digital Privacy'],
                ].map(([label, cat]) => (
                  <li key={cat}>
                    <button onClick={() => navigateTo(`/explore/${cat}`)} className="text-brand-text-secondary hover:text-brand-primary transition-colors">
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-semibold text-brand-text-primary text-sm mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  ['Style guide', '/theme-demo'],
                  ['Explore disciplines', '/explore'],
                  ['Publish anonymously', '/write'],
                  ['Whistleblower protection', '/'],
                ].map(([label, route]) => (
                  <li key={label}>
                    <button onClick={() => navigateTo(route)} className="text-brand-text-secondary hover:text-brand-primary transition-colors">
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h4 className="font-semibold text-brand-text-primary text-sm mb-2">The VYRA Digest</h4>
              <p className="text-sm text-brand-text-secondary leading-relaxed mb-4">
                The best research and investigations, once a week. No spam.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-1.5 p-1.5 bg-brand-bg rounded-full ring-1 ring-brand-border focus-within:ring-2 focus-within:ring-brand-primary/60 transition-all">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="flex-1 min-w-0 px-3 bg-transparent text-sm outline-none placeholder:text-brand-text-tertiary"
                />
                <button type="submit" className="shrink-0 h-9 px-4 bg-brand-gradient text-white rounded-full text-sm font-semibold hover:brightness-110 transition-all">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-brand-border-light pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-text-tertiary">
            <p>© {new Date().getFullYear()} VYRA Publishing Group. All rights reserved.</p>
            <div className="flex flex-wrap gap-5 items-center">
              {[
                ['About', '/'],
                ['Privacy', '/privacy'],
                ['Terms', '/terms'],
                ['Contact', '/contact'],
              ].map(([label, route]) => (
                <button key={label} onClick={() => navigateTo(route)} className="hover:text-brand-primary transition-colors">
                  {label}
                </button>
              ))}
              <button onClick={() => navigateTo('/login')} className="font-medium text-brand-primary hover:underline underline-offset-4">
                Admin access
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ---------- Mobile bottom tab bar ---------- */}
      <nav
        id="mobile-bottom-nav"
        className="fixed bottom-3 inset-x-3 glass ring-1 ring-brand-border rounded-2xl h-16 md:hidden flex justify-around items-center z-40 shadow-lift"
        aria-label="Mobile"
      >
        {[
          { label: 'Home', route: '/home', icon: Home, active: currentRoute === '/home' },
          { label: 'Explore', route: '/explore', icon: Compass, active: currentRoute.startsWith('/explore') },
        ].map((t) => (
          <button
            key={t.route}
            onClick={() => navigateTo(t.route)}
            className={`flex flex-col items-center gap-0.5 w-14 transition-colors ${t.active ? 'text-brand-primary' : 'text-brand-text-tertiary'}`}
          >
            <t.icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{t.label}</span>
          </button>
        ))}

        <button
          onClick={() => navigateTo('/write')}
          aria-label="Write a story"
          className="grid place-items-center w-12 h-12 -mt-7 bg-brand-gradient text-white rounded-2xl shadow-glow ring-4 ring-brand-bg active:scale-95 transition-transform"
        >
          <Edit3 className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigateTo('/notifications')}
          className={`relative flex flex-col items-center gap-0.5 w-14 transition-colors ${currentRoute === '/notifications' ? 'text-brand-primary' : 'text-brand-text-tertiary'}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && <span className="absolute top-0 right-3.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-brand-surface" />}
          <span className="text-[10px] font-semibold">Alerts</span>
        </button>

        {currentUser ? (
          <button
            onClick={() => navigateTo(`/profile/${currentUser.username}`)}
            className={`flex flex-col items-center gap-0.5 w-14 transition-colors ${currentRoute.startsWith('/profile') ? 'text-brand-primary' : 'text-brand-text-tertiary'}`}
          >
            <img
              src={currentUser.avatar}
              alt=""
              referrerPolicy="no-referrer"
              className={`w-5 h-5 rounded-full object-cover ring-2 ${currentRoute.startsWith('/profile') ? 'ring-brand-primary' : 'ring-transparent'}`}
            />
            <span className="text-[10px] font-semibold">Profile</span>
          </button>
        ) : (
          <button
            onClick={() => navigateTo('/login')}
            className={`flex flex-col items-center gap-0.5 w-14 transition-colors ${currentRoute === '/login' ? 'text-brand-primary' : 'text-brand-text-tertiary'}`}
          >
            <LogIn className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Sign in</span>
          </button>
        )}
      </nav>
    </div>
  );
};
