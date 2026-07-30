import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

import { 
  Menu, X, Search, Bell, Sparkles, LogIn, LogOut, User, BookOpen, 
  Settings, ChevronDown, Sun, Moon, Home, Compass, Edit3, ShieldAlert,
  HelpCircle, Laptop, Heart, Bookmark
} from 'lucide-react';
import * as Icons from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { 
    currentRoute, navigateTo, theme, toggleTheme, currentUser, setCurrentUser,
    notifications, showToast, searchQuery, setSearchQuery, categories
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Unread notifications calculation
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(target)) {
        setCategoriesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentRoute]);

  // Handle newsletter mock submission
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem('email') as HTMLInputElement;
    if (input && input.value) {
      showToast(`Successfully subscribed ${input.value} to VYRA Digest!`, 'success');
      input.value = '';
    }
  };

  // Helper to dynamically render Lucide icons by name string
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

  // Check if landing page or not (for transparent header behavior)
  const isLandingPage = currentRoute === '/';

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text-primary transition-theme">
      
      {/* Top Navbar */}
      <header 
        id="vyra-header"
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-brand-surface/85 backdrop-blur-md border-b border-brand-border shadow-md py-3' 
            : isLandingPage 
              ? 'bg-transparent py-5 border-b border-transparent' 
              : 'bg-brand-surface py-4 border-b border-brand-border'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left Logo */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => navigateTo('/')} 
              className="font-display font-bold text-2xl sm:text-3xl bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity tracking-tight"
            >
              VYRA
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => navigateTo('/home')} 
                className={`text-sm font-medium transition-colors ${currentRoute === '/home' ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'}`}
              >
                Home Feed
              </button>
              <button 
                onClick={() => navigateTo('/explore')} 
                className={`text-sm font-medium transition-colors ${currentRoute.startsWith('/explore') ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'}`}
              >
                Explore
              </button>
              <button 
                onClick={() => navigateTo('/saved')} 
                className={`text-sm font-medium transition-colors ${currentRoute === '/saved' ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'}`}
              >
                Saved
              </button>

              {/* Categories Mega Menu Toggle */}
              <div ref={categoriesRef} className="relative">
                <button 
                  onClick={() => setCategoriesMenuOpen(!categoriesMenuOpen)}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 text-brand-text-secondary hover:text-brand-primary`}
                >
                  Categories <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${categoriesMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Categories Dropdown Grid */}
                {categoriesMenuOpen && (
                  <div className="absolute top-full left-0 mt-3 w-[480px] bg-brand-surface border border-brand-border rounded-xl shadow-xl p-4 grid grid-cols-2 gap-2 z-50 animate-fade-in-up">
                    <div className="col-span-2 pb-2 mb-2 border-b border-brand-border-light flex items-center justify-between text-xs font-semibold text-brand-text-tertiary">
                      <span>EXPLORE POPULAR DISCIPLINES</span>
                      <button onClick={() => { setCategoriesMenuOpen(false); navigateTo('/explore'); }} className="text-brand-primary hover:underline">View All</button>
                    </div>
                    {categories.slice(0, 10).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setCategoriesMenuOpen(false);
                          navigateTo(`/explore/${cat.name}`);
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-brand-primary-light/40 dark:hover:bg-brand-primary-light/10 text-left transition-colors group"
                      >
                        <div className={`p-1.5 rounded-md ${cat.colorClass}`}>
                          {renderCategoryIcon(cat.iconName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-brand-text-primary group-hover:text-brand-primary truncate">{cat.name}</p>
                          <p className="text-[10px] text-brand-text-tertiary truncate">{cat.count} publications</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigateTo('/theme-demo')} 
                className={`text-sm font-medium transition-colors ${currentRoute === '/theme-demo' ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'}`}
              >
                Style Guide
              </button>
            </nav>
          </div>

          {/* Right Action Stack */}
          <div className="flex items-center gap-3">
            
            {/* Global Search Button */}
            <button 
              onClick={() => navigateTo('/search')}
              className="p-2 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light rounded-lg transition-all"
              title="Search stories, writers, tags"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications Bell */}
            <button 
              onClick={() => navigateTo('/notifications')}
              className="relative p-2 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light rounded-lg transition-all"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light rounded-lg transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Write Highlight Button (Desktop Only) */}
            <button 
              onClick={() => navigateTo('/write')}
              className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-xl hover:bg-brand-primary-hover shadow-sm transition-all"
            >
              <Edit3 className="w-4 h-4" /> Write Story
            </button>

            {/* User Profile Dropdown */}
            {currentUser ? (
              <div ref={profileRef} className="relative z-50">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-brand-border hover:border-brand-primary transition-all overflow-hidden"
                >
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-brand-text-secondary pr-0.5" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-brand-surface border border-brand-border rounded-xl shadow-xl p-2 z-50 animate-fade-in-up">
                    <div className="px-3 py-2 border-b border-brand-border-light">
                      <p className="text-xs text-brand-text-tertiary">Logged in as</p>
                      <p className="text-sm font-bold text-brand-text-primary truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-brand-text-tertiary truncate">@{currentUser.username}</p>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => { setProfileDropdownOpen(false); navigateTo(`/profile/${currentUser.username}`); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brand-text-secondary hover:text-brand-primary hover:bg-brand-primary-light/30 dark:hover:bg-brand-primary-light/10 text-left rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" /> My Profile
                      </button>
                      <button
                        onClick={() => { setProfileDropdownOpen(false); navigateTo('/dashboard'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brand-text-secondary hover:text-brand-primary hover:bg-brand-primary-light/30 dark:hover:bg-brand-primary-light/10 text-left rounded-lg transition-colors"
                      >
                        <BookOpen className="w-4 h-4" /> My Dashboard
                      </button>
                      <button
                        onClick={() => { setProfileDropdownOpen(false); navigateTo('/saved'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brand-text-secondary hover:text-brand-primary hover:bg-brand-primary-light/30 dark:hover:bg-brand-primary-light/10 text-left rounded-lg transition-colors"
                      >
                        <Bookmark className="w-4 h-4" /> Bookmarked
                      </button>
                      <button
                        onClick={() => { setProfileDropdownOpen(false); navigateTo(`/profile/${currentUser.username}/liked`); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brand-text-secondary hover:text-brand-primary hover:bg-brand-primary-light/30 dark:hover:bg-brand-primary-light/10 text-left rounded-lg transition-colors"
                      >
                        <Heart className="w-4 h-4" /> Liked Publications
                      </button>
                    </div>

                    <div className="pt-1 border-t border-brand-border-light">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left rounded-lg transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigateTo('/login')}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-xl hover:bg-brand-primary-hover shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-brand-text-secondary hover:text-brand-primary rounded-lg"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Slide-in Drawer overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex justify-end">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          
          <div className="relative w-80 bg-brand-surface h-full shadow-2xl p-6 flex flex-col justify-between z-50 animate-slide-in-right transition-theme">
            <div>
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-brand-border-light">
                <span className="font-display font-bold text-xl bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">VYRA Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-brand-border-light">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {currentUser && (
                <div className="flex items-center gap-3 p-3 bg-brand-border-light rounded-xl mb-6">
                  <img src={currentUser.avatar} alt={currentUser.name} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{currentUser.name}</p>
                    <p className="text-xs text-brand-text-tertiary truncate">@{currentUser.username}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-4">
                <button 
                  onClick={() => navigateTo('/')} 
                  className={`flex items-center gap-3 py-2 text-base font-semibold text-left ${currentRoute === '/' ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
                >
                  <Compass className="w-5 h-5" /> Landing Welcome
                </button>
                <button 
                  onClick={() => navigateTo('/home')} 
                  className={`flex items-center gap-3 py-2 text-base font-semibold text-left ${currentRoute === '/home' ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
                >
                  <Home className="w-5 h-5" /> Home Feed
                </button>
                <button 
                  onClick={() => navigateTo('/explore')} 
                  className={`flex items-center gap-3 py-2 text-base font-semibold text-left ${currentRoute.startsWith('/explore') ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
                >
                  <Compass className="w-5 h-5" /> Explore Categories
                </button>
                <button 
                  onClick={() => navigateTo('/saved')} 
                  className={`flex items-center gap-3 py-2 text-base font-semibold text-left ${currentRoute === '/saved' ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
                >
                  <Bookmark className="w-5 h-5" /> Saved Collection
                </button>
                <button 
                  onClick={() => navigateTo('/write')} 
                  className={`flex items-center gap-3 py-2 text-base font-semibold text-left ${currentRoute === '/write' ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
                >
                  <Edit3 className="w-5 h-5" /> Author New Story
                </button>
                <button 
                  onClick={() => navigateTo('/theme-demo')} 
                  className={`flex items-center gap-3 py-2 text-base font-semibold text-left ${currentRoute === '/theme-demo' ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
                >
                  <Laptop className="w-5 h-5" /> Style Demo Guide
                </button>
                <button 
                  onClick={() => navigateTo('/admin')} 
                  className={`flex items-center gap-3 py-2 text-base font-semibold text-left ${currentRoute === '/admin' ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
                >
                  <ShieldAlert className="w-5 h-5 text-brand-accent" /> Admin Panel
                </button>
              </nav>
            </div>

            <div className="border-t border-brand-border-light pt-6">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              ) : (
                <button
                  onClick={() => navigateTo('/login')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary-hover transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow pt-16 md:pt-20">
        {children}
      </main>

      {/* Corporate Editorial Footer */}
      <footer className="bg-brand-surface border-t border-brand-border pt-16 pb-24 md:pb-16 transition-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            
            {/* Column 1: Intro */}
            <div>
              <span className="font-display font-black text-2xl bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">VYRA</span>
              <p className="mt-4 text-sm text-brand-text-secondary leading-relaxed">
                Voices Yielding Research & Awareness. A premium publishing ecosystem dedicated to scientific rigor, investigative reportage, social change, and creative freedom.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <button className="text-brand-text-tertiary hover:text-brand-primary"><Icons.Twitter className="w-5 h-5" /></button>
                <button className="text-brand-text-tertiary hover:text-brand-primary"><Icons.Github className="w-5 h-5" /></button>
                <button className="text-brand-text-tertiary hover:text-brand-primary"><Icons.Linkedin className="w-5 h-5" /></button>
                <button className="text-brand-text-tertiary hover:text-brand-primary"><Icons.Globe className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-display font-semibold text-brand-text-primary uppercase tracking-wider text-xs mb-4">CATEGORIES</h4>
              <ul className="space-y-2.5 text-sm">
                <li><button onClick={() => navigateTo('/explore/Technology')} className="text-brand-text-secondary hover:text-brand-primary">Technology & Ethics</button></li>
                <li><button onClick={() => navigateTo('/explore/Environmental Science')} className="text-brand-text-secondary hover:text-brand-primary">Environmental Science</button></li>
                <li><button onClick={() => navigateTo('/explore/Healthcare & Medicine')} className="text-brand-text-secondary hover:text-brand-primary">Healthcare & Medicine</button></li>
                <li><button onClick={() => navigateTo('/explore/Social Awareness')} className="text-brand-text-secondary hover:text-brand-primary">Social Awareness</button></li>
                <li><button onClick={() => navigateTo('/explore/Digital Privacy')} className="text-brand-text-secondary hover:text-brand-primary">Digital Privacy</button></li>
              </ul>
            </div>

            {/* Column 3: Platform Resources */}
            <div>
              <h4 className="font-display font-semibold text-brand-text-primary uppercase tracking-wider text-xs mb-4">RESOURCES</h4>
              <ul className="space-y-2.5 text-sm">
                <li><button onClick={() => navigateTo('/theme-demo')} className="text-brand-text-secondary hover:text-brand-primary">Design System Token Guide</button></li>
                <li><button onClick={() => navigateTo('/explore')} className="text-brand-text-secondary hover:text-brand-primary">Explore All Disciplines</button></li>
                <li><button onClick={() => navigateTo('/write')} className="text-brand-text-secondary hover:text-brand-primary">Write An Anonymous Story</button></li>
                <li><button onClick={() => navigateTo('/')} className="text-brand-text-secondary hover:text-brand-primary">About Our Whistleblower Protection</button></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h4 className="font-display font-semibold text-brand-text-primary uppercase tracking-wider text-xs mb-4">VYRA DIGEST</h4>
              <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed mb-4">
                Receive peer-reviewed science digests and award-winning investigation warnings directly in your inbox. No spam.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email address"
                  className="px-4 py-2 text-sm bg-brand-bg border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl outline-none"
                />
                <button
                  type="submit"
                  className="py-2 px-4 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm"
                >
                  Join Mailing List
                </button>
              </form>
            </div>

          </div>

          <div className="border-t border-brand-border-light pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-text-tertiary">
            <p>© 2026 VYRA Publishing Group. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 items-center">
              <button onClick={() => navigateTo('/')} className="hover:text-brand-primary">About</button>
              <button onClick={() => navigateTo('/privacy')} className="hover:text-brand-primary">Privacy</button>
              <button onClick={() => navigateTo('/terms')} className="hover:text-brand-primary">Terms</button>
              <button onClick={() => navigateTo('/contact')} className="hover:text-brand-primary">Contact</button>
              <button onClick={() => navigateTo('/login')} className="hover:text-brand-primary font-medium text-brand-primary">Admin Access</button>
            </div>
          </div>

        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Sticky touch targets, 44px) */}
      <nav 
        id="mobile-bottom-nav"
        className="fixed bottom-0 inset-x-0 bg-brand-surface/95 backdrop-blur-md border-t border-brand-border py-2 md:hidden flex justify-around items-center z-40 shadow-lg"
      >
        <button 
          onClick={() => navigateTo('/home')} 
          className={`flex flex-col items-center p-1.5 transition-colors ${currentRoute === '/home' ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Home</span>
        </button>
        <button 
          onClick={() => navigateTo('/explore')} 
          className={`flex flex-col items-center p-1.5 transition-colors ${currentRoute.startsWith('/explore') ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Explore</span>
        </button>
        <button 
          onClick={() => navigateTo('/write')} 
          className={`flex flex-col items-center p-2.5 bg-brand-primary text-white rounded-full relative -top-3 shadow-md transition-transform active:scale-95`}
        >
          <Edit3 className="w-5 h-5" />
        </button>
        <button 
          onClick={() => navigateTo('/notifications')} 
          className={`flex flex-col items-center p-1.5 transition-colors relative ${currentRoute === '/notifications' ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full" />
          )}
          <span className="text-[10px] mt-0.5 font-medium">Alerts</span>
        </button>
        {currentUser ? (
          <button 
            onClick={() => navigateTo(`/profile/${currentUser.username}`)} 
            className={`flex flex-col items-center p-1.5 transition-colors ${currentRoute.startsWith('/profile') ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
          >
            <img src={currentUser.avatar} alt={currentUser.name} referrerPolicy="no-referrer" className="w-5 h-5 rounded-full object-cover border border-brand-border" />
            <span className="text-[10px] mt-0.5 font-medium">Profile</span>
          </button>
        ) : (
          <button 
            onClick={() => navigateTo('/login')} 
            className={`flex flex-col items-center p-1.5 transition-colors ${currentRoute === '/login' ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
          >
            <LogIn className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Sign In</span>
          </button>
        )}
      </nav>

    </div>
  );
};
