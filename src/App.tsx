import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Toast } from './components/Toast';

// Pages
import { LandingPage } from './pages/LandingPage';
import { HomeFeedPage } from './pages/HomeFeedPage';
import { ExplorePage } from './pages/ExplorePage';
import { StoryReadingPage } from './pages/StoryReadingPage';
import { StoryEditorPage } from './pages/StoryEditorPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SearchPage } from './pages/SearchPage';
import { AuthPages } from './pages/AuthPages';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { SetupAdminPage } from './pages/SetupAdminPage';
import { ThemeDemoPage } from './pages/ThemeDemoPage';
import { SavedPage } from './pages/SavedPage';

const AppContent: React.FC = () => {
  const { currentRoute } = useApp();

  const renderActivePage = () => {
    if (currentRoute === '/') return <LandingPage />;
    if (currentRoute === '/home') return <HomeFeedPage />;
    if (currentRoute === '/write') return <StoryEditorPage />;
    if (currentRoute === '/notifications') return <NotificationsPage />;
    if (currentRoute === '/search') return <SearchPage />;
    if (currentRoute === '/saved') return <SavedPage />;
    if (currentRoute === '/login' || currentRoute === '/register') return <AuthPages />;
    if (currentRoute === '/setup-admin') return <SetupAdminPage />;
    if (currentRoute === '/admin' || currentRoute === '/admin/dashboard' || currentRoute === '/editor/dashboard') return <AdminDashboard />;
    if (currentRoute === '/dashboard' || currentRoute === '/dashboard/author') return <UserDashboardPage initialTab="profile" />;
    if (currentRoute === '/dashboard/posts') return <UserDashboardPage initialTab="posts" />;
    if (currentRoute === '/theme-demo') return <ThemeDemoPage />;

    if (currentRoute.startsWith('/explore')) {
      return <ExplorePage />;
    }
    if (currentRoute.startsWith('/story/')) {
      return <StoryReadingPage />;
    }
    if (currentRoute.startsWith('/profile/')) {
      return <UserProfilePage />;
    }

    return <LandingPage />;
  };

  return (
    <Layout>
      {renderActivePage()}
      <Toast />
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
