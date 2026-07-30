import React, { createContext, useContext, useState, useEffect } from 'react';
import { Story, UserProfileData, NotificationItem, Category } from '../types';
import { api } from '../services/api';

interface AppContextProps {
  currentRoute: string;
  navigateTo: (route: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: UserProfileData | null;
  setCurrentUser: (user: UserProfileData | null) => void;
  stories: Story[];
  likedStoryIds: string[];
  bookmarkedStoryIds: string[];
  notifications: NotificationItem[];
  toggleLike: (storyId: string) => void;
  toggleBookmark: (storyId: string) => void;
  addStory: (story: Omit<Story, 'id' | 'likes' | 'bookmarks' | 'publishedDate'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  activeToast: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null;
  clearToast: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: Category[];
  adminExists: boolean;
  checkAdminStatus: () => Promise<boolean>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
      return hash.substring(1);
    }
    return '/';
  });

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#')) {
        setCurrentRoute(hash.substring(1));
      } else {
        setCurrentRoute('/');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('vyra-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('vyra-theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    showToast(`Switched to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  // Active User
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(() => {
    const savedUser = localStorage.getItem('vyra-user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleSetCurrentUser = (user: UserProfileData | null) => {
    if (user === null) {
      api.auth.logout().catch(err => console.error(err));
    }
    setCurrentUser(user);
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vyra-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vyra-user');
    }
  }, [currentUser]);

  // Admin Exists state
  const [adminExists, setAdminExists] = useState<boolean>(true);

  const checkAdminStatus = async (): Promise<boolean> => {
    try {
      const res = await api.auth.getAdminStatus();
      const exists = Boolean(res.adminExists);
      setAdminExists(exists);
      return exists;
    } catch (e) {
      console.error('Failed to check admin status', e);
      return true;
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);

  // Stories State
  const [stories, setStories] = useState<Story[]>([]);

  // Fetch stories and categories from live API
  const refreshStoriesAndCategories = async () => {
    try {
      const liveStories = await api.stories.getAll();
      setStories(liveStories || []);
    } catch (e) {
      console.error('Failed to fetch stories from API', e);
    }

    try {
      const liveCategories = await api.categories.getAll();
      setCategories(liveCategories || []);
    } catch (e) {
      console.error('Failed to fetch categories from API', e);
    }
  };

  useEffect(() => {
    refreshStoriesAndCategories();
  }, [currentRoute, currentUser]);

  // Liked & Bookmarked stories
  const [likedStoryIds, setLikedStoryIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('vyra-liked-ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookmarkedStoryIds, setBookmarkedStoryIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('vyra-bookmarked-ids');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vyra-liked-ids', JSON.stringify(likedStoryIds));
  }, [likedStoryIds]);

  useEffect(() => {
    localStorage.setItem('vyra-bookmarked-ids', JSON.stringify(bookmarkedStoryIds));
  }, [bookmarkedStoryIds]);

  const toggleLike = async (storyId: string) => {
    if (!currentUser) {
      navigateTo('/login');
      showToast('Please sign in to like articles', 'warning');
      return;
    }

    try {
      const isLiked = likedStoryIds.includes(storyId);
      if (isLiked) {
        await api.likes.unlike(storyId);
      } else {
        await api.likes.like(storyId);
      }

      setLikedStoryIds(prev => {
        const updated = isLiked ? prev.filter(id => id !== storyId) : [...prev, storyId];
        setStories(allStories =>
          allStories.map(story => {
            if (story.id === storyId) {
              return {
                ...story,
                likes: story.likes + (isLiked ? -1 : 1)
              };
            }
            return story;
          })
        );
        showToast(isLiked ? 'Removed from liked articles' : 'Added to liked articles', isLiked ? 'info' : 'success');
        return updated;
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle like', 'error');
    }
  };

  const toggleBookmark = async (storyId: string) => {
    if (!currentUser) {
      navigateTo('/login');
      showToast('Please sign in to bookmark articles', 'warning');
      return;
    }

    try {
      const isBookmarked = bookmarkedStoryIds.includes(storyId);
      if (isBookmarked) {
        await api.bookmarks.remove(storyId);
      } else {
        await api.bookmarks.add(storyId);
      }

      setBookmarkedStoryIds(prev => {
        const updated = isBookmarked ? prev.filter(id => id !== storyId) : [...prev, storyId];
        setStories(allStories =>
          allStories.map(story => {
            if (story.id === storyId) {
              return {
                ...story,
                bookmarks: story.bookmarks + (isBookmarked ? -1 : 1)
              };
            }
            return story;
          })
        );
        showToast(isBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks', isBookmarked ? 'info' : 'success');
        return updated;
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle bookmark', 'error');
    }
  };

  // Add a newly published story
  const addStory = async (newStoryData: Omit<Story, 'id' | 'likes' | 'bookmarks' | 'publishedDate'>) => {
    try {
      const coverImage = newStoryData.coverImage || 'https://picsum.photos/seed/story/800/450';
      const categoryObj = categories.find(c => c.name.toLowerCase() === newStoryData.category.toLowerCase());
      const categoryId = categoryObj ? categoryObj.id : undefined;

      await api.stories.create({
        title: newStoryData.title,
        excerpt: newStoryData.excerpt,
        content: newStoryData.content,
        coverImage: coverImage,
        category: categoryId,
        tags: newStoryData.tags,
        isAnonymous: newStoryData.isAnonymous,
        isResearch: newStoryData.isResearch,
        isCampaign: newStoryData.isCampaign
      });

      await refreshStoriesAndCategories();
      showToast('Your article has been successfully published!', 'success');
      navigateTo('/home');
    } catch (err: any) {
      showToast(err.message || 'Failed to publish story', 'error');
    }
  };

  // Notifications State with persistence
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('vyra-notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vyra-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    showToast('All notifications marked as read', 'success');
  };

  // Toast System
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setActiveToast({ message, type });
  };

  const clearToast = () => {
    setActiveToast(null);
  };

  // Global search input state
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigateTo,
        theme,
        toggleTheme,
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        stories,
        likedStoryIds,
        bookmarkedStoryIds,
        notifications,
        toggleLike,
        toggleBookmark,
        addStory,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        showToast,
        activeToast,
        clearToast,
        searchQuery,
        setSearchQuery,
        categories,
        adminExists,
        checkAdminStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
