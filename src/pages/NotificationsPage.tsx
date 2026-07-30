import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, FileText, Heart, User, Mail, Megaphone, Settings, CheckCheck, 
  ChevronRight, X, Clock, HelpCircle, ShieldAlert
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, navigateTo, showToast } = useApp();
  const [prefModalOpen, setPrefModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Email preference checkboxes state
  const [emailFollowers, setEmailFollowers] = useState(true);
  const [emailLikes, setEmailLikes] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  // Trigger quick skeleton loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const handleNotificationClick = (id: string, senderUser?: string) => {
    markNotificationAsRead(id);
    if (senderUser) {
      navigateTo(`/profile/${senderUser}`);
    } else {
      navigateTo('/home');
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefModalOpen(false);
    showToast('Your notification frequency preferences have been updated!', 'success');
  };

  // Group notifications chronologically
  const todayNotifs = notifications.filter(n => {
    const hours = (new Date().getTime() - new Date(n.date).getTime()) / (1000 * 60 * 60);
    return hours <= 24;
  });

  const yesterdayNotifs = notifications.filter(n => {
    const hours = (new Date().getTime() - new Date(n.date).getTime()) / (1000 * 60 * 60);
    return hours > 24 && hours <= 48;
  });

  const earlierNotifs = notifications.filter(n => {
    const hours = (new Date().getTime() - new Date(n.date).getTime()) / (1000 * 60 * 60);
    return hours > 48;
  });

  // Dynamic Icon selector
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'story':
        return (
          <div className="p-2.5 bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 rounded-xl shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        );
      case 'like':
        return (
          <div className="p-2.5 bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded-xl shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </div>
        );
      case 'follow':
        return (
          <div className="p-2.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-xl shrink-0">
            <User className="w-5 h-5" />
          </div>
        );
      case 'digest':
        return (
          <div className="p-2.5 bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 rounded-xl shrink-0">
            <Mail className="w-5 h-5" />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="p-2.5 bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 rounded-xl shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
        );
    }
  };

  const renderNotificationItem = (n: any) => {
    return (
      <div
        key={n.id}
        onClick={() => handleNotificationClick(n.id, n.sender?.username)}
        className={`flex gap-4 items-start p-4 rounded-xl border transition-theme cursor-pointer select-none text-left ${
          n.isRead 
            ? 'bg-brand-surface border-brand-border-light text-brand-text-secondary' 
            : 'bg-brand-primary-light/35 dark:bg-brand-primary-light/5 border-l-4 border-l-brand-primary border-brand-border text-brand-text-primary'
        }`}
      >
        {/* Dynamic Icon */}
        {getNotificationIcon(n.type)}

        {/* Text Context */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center gap-2 mb-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${n.isRead ? 'text-brand-text-tertiary' : 'text-brand-primary'}`}>
              {n.title}
            </span>
            <span className="text-[10px] text-brand-text-tertiary flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" /> {new Date(n.date).toLocaleDateString()}
            </span>
          </div>
          <p className={`text-xs leading-relaxed ${n.isRead ? 'text-brand-text-secondary' : 'text-brand-text-primary font-medium'}`}>
            {n.text}
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-brand-text-tertiary self-center shrink-0" />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-brand-border pb-5 mb-8">
        <div className="flex items-center gap-2.5">
          <Bell className="w-6 h-6 text-brand-primary" />
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-text-primary tracking-tight">Alerts & Interactions</h1>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1 px-3 py-2 border border-brand-border hover:border-brand-primary hover:bg-brand-primary-light/40 text-brand-text-secondary text-xs font-semibold rounded-xl transition-all"
            title="Mark all notifications as read"
          >
            <CheckCheck className="w-4 h-4 text-brand-primary" /> Mark All Read
          </button>
          
          <button
            onClick={() => setPrefModalOpen(true)}
            className="p-2 border border-brand-border hover:border-brand-primary hover:bg-brand-primary-light/40 text-brand-text-secondary rounded-xl transition-all"
            title="Notification Settings"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {loading ? (
        // Timeline loading skeletons
        <div className="space-y-6">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 animate-pulse mb-4" />
          {[1, 2, 3].map(n => (
            <div key={n} className="p-4 bg-brand-surface border border-brand-border-light rounded-xl flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 space-y-2.5">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-16 text-center flex flex-col items-center gap-4">
          <Bell className="w-14 h-14 text-brand-text-tertiary" />
          <h3 className="font-display font-bold text-lg text-brand-text-primary">All silent here!</h3>
          <p className="text-xs text-brand-text-secondary max-w-xs leading-relaxed">
            No notification records correspond with your profile credentials. Subscribe to popular writers to receive updates on fresh publications!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Today Timeline Section */}
          {todayNotifs.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-brand-text-tertiary tracking-widest uppercase mb-4 pl-1">TODAY</h3>
              <div className="space-y-3.5">
                {todayNotifs.map(renderNotificationItem)}
              </div>
            </div>
          )}

          {/* Yesterday Timeline Section */}
          {yesterdayNotifs.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-brand-text-tertiary tracking-widest uppercase mb-4 pl-1">YESTERDAY</h3>
              <div className="space-y-3.5">
                {yesterdayNotifs.map(renderNotificationItem)}
              </div>
            </div>
          )}

          {/* Earlier Timeline Section */}
          {earlierNotifs.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-brand-text-tertiary tracking-widest uppercase mb-4 pl-1">EARLIER PUBLICATIONS</h3>
              <div className="space-y-3.5">
                {earlierNotifs.map(renderNotificationItem)}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. Notification Preferences Modal Overlay */}
      {prefModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border w-full max-w-md rounded-2xl p-6 sm:p-8 text-left shadow-2xl relative animate-scale-up transition-theme">
            
            <button 
              onClick={() => setPrefModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-brand-bg hover:bg-brand-border-light rounded-full text-brand-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display font-bold text-xl text-brand-text-primary mb-6">
              Activity Preferences
            </h2>

            <form onSubmit={handleSavePreferences} className="space-y-6">
              
              {/* Email Notifications Segment */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-bold text-brand-text-tertiary uppercase tracking-wider">EMAIL DIGESTS</span>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-brand-text-primary">New follower notifications</p>
                    <p className="text-[10px] text-brand-text-tertiary">Alert me when a scholar follows my publications.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailFollowers} 
                    onChange={(e) => setEmailFollowers(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded" 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-brand-text-primary">Publication likes & saves</p>
                    <p className="text-[10px] text-brand-text-tertiary">Alert me when my articles receive likes or bookmarks.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailLikes} 
                    onChange={(e) => setEmailLikes(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded" 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-brand-text-primary">Curated weekly digest newsletters</p>
                    <p className="text-[10px] text-brand-text-tertiary">A weekly hand-curated list of verified studies.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailDigest} 
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded" 
                  />
                </div>
              </div>

              {/* Push Notifications Segment (Coming soon) */}
              <div className="space-y-3 p-4 bg-brand-bg rounded-xl border border-brand-border-light">
                <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                  <div>
                    <p className="text-xs font-bold text-brand-text-primary">Mobile Push Notifications</p>
                    <p className="text-[10px] text-brand-text-tertiary">Instant alerts dispatched directly to your device.</p>
                  </div>
                  <input type="checkbox" disabled className="w-4 h-4 rounded" />
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-brand-primary font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" /> COMING SOON UNDER SAFEKEEP LAUNCH
                </div>
              </div>

              {/* Button controllers */}
              <div className="flex gap-2 justify-end pt-4 border-t border-brand-border-light mt-6">
                <button
                  type="button"
                  onClick={() => setPrefModalOpen(false)}
                  className="py-2 px-4 border border-brand-border text-brand-text-secondary hover:bg-brand-border-light text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Save Settings
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
