import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  User, BookOpen, Edit3, Heart, Bookmark, MessageSquare, Eye, Lock,
  Globe, MapPin, Twitter, FileText, Clock, Archive, Settings, Save, CheckCircle
} from 'lucide-react';

export const UserDashboardPage: React.FC<{ initialTab?: 'profile' | 'posts' }> = ({ initialTab = 'profile' }) => {
  const { currentUser, setCurrentUser, showToast, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'posts'>(initialTab);

  // Profile form state
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [bannerImage, setBannerImage] = useState(currentUser?.bannerImage || '');
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [twitter, setTwitter] = useState(currentUser?.twitter || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // User Content state
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postFilter, setPostFilter] = useState<'all' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('all');
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar || '');
      setBannerImage(currentUser.bannerImage || '');
      setWebsite(currentUser.website || '');
      setLocation(currentUser.location || '');
      setTwitter(currentUser.twitter || '');
      fetchUserPosts();
    }
  }, [currentUser]);

  const fetchUserPosts = async () => {
    setLoadingPosts(true);
    try {
      const posts = await api.posts.getAll();
      const myPosts = (posts || []).filter((p: any) => p.author?.id === currentUser?.id || p.userId === currentUser?.id);
      setUserPosts(myPosts);
    } catch (e) {
      console.error('Failed to fetch user posts', e);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.users.updateProfile(currentUser?.username || '', {
        fullName: name,
        bio,
        website,
        location,
        twitterHandle: twitter
      });
      if (avatar !== currentUser?.avatar) {
        await api.users.updateAvatar(avatar);
      }
      setCurrentUser({
        ...currentUser!,
        name,
        bio,
        avatar,
        bannerImage,
        website,
        location,
        twitter
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Both passwords are required', 'warning');
      return;
    }
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error');
    }
  };

  const filteredPosts = userPosts.filter(p => {
    if (postFilter === 'all') return true;
    return p.status === postFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img 
            src={currentUser?.avatar || 'https://picsum.photos/seed/user/200/200'} 
            alt={currentUser?.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-brand-primary"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-brand-text-primary">{currentUser?.name}</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                {currentUser?.role || 'USER'}
              </span>
            </div>
            <p className="text-xs text-brand-text-secondary mt-1">@{currentUser?.username}</p>
            <p className="text-xs text-brand-text-tertiary mt-2 max-w-xl line-clamp-2">{currentUser?.bio || 'No bio provided.'}</p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('/write')}
          className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 shrink-0"
        >
          <Edit3 className="w-4 h-4" /> Create Post
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-brand-border mb-8 gap-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
          }`}
        >
          <User className="w-4 h-4" /> Profile & Settings
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'posts'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
          }`}
        >
          <BookOpen className="w-4 h-4" /> My Content ({userPosts.length})
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold font-display text-brand-text-primary mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-primary" /> Edit Profile
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1">Cover Banner URL</label>
                <input
                  type="text"
                  value={bannerImage}
                  onChange={e => setBannerImage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1 flex items-center gap-1">
                    <Twitter className="w-3.5 h-3.5" /> Twitter / X
                  </label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={e => setTwitter(e.target.value)}
                    placeholder="@username"
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Profile Changes
              </button>
            </form>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm h-fit">
            <h2 className="text-lg font-bold font-display text-brand-text-primary mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-primary" /> Security & Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm outline-none focus:border-brand-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-surface border border-brand-border hover:border-brand-primary text-brand-text-primary font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Update Password
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'posts' && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex gap-2">
              {(['all', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setPostFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    postFilter === filter
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-brand-text-primary'
                  }`}
                >
                  {filter === 'all' ? 'All Posts' : filter}
                </button>
              ))}
            </div>

            <p className="text-xs text-brand-text-tertiary">
              Showing {filteredPosts.length} publication{filteredPosts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loadingPosts ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-3"></div>
              <p className="text-xs text-brand-text-secondary">Loading your publications...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-16 text-center bg-brand-surface border border-brand-border rounded-2xl">
              <FileText className="w-12 h-12 text-brand-text-tertiary mx-auto mb-3" />
              <h3 className="text-lg font-bold text-brand-text-primary">No publications found</h3>
              <p className="text-xs text-brand-text-secondary mt-1">You have not created any posts under this status yet.</p>
              <button
                onClick={() => navigateTo('/write')}
                className="mt-4 px-4 py-2 bg-brand-primary text-white font-semibold text-xs rounded-xl hover:bg-brand-primary-hover transition-all"
              >
                Create First Post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-brand-primary/50 transition-all">
                  <div>
                    {post.coverImageUrl && (
                      <img src={post.coverImageUrl} alt={post.title} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          post.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : post.status === 'DRAFT'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                        }`}>
                          {post.status}
                        </span>
                        <span className="text-[11px] text-brand-text-tertiary">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-brand-text-primary line-clamp-2 hover:text-brand-primary transition-colors cursor-pointer" onClick={() => navigateTo(`/story/${post.slug || post.id}`)}>
                        {post.title}
                      </h3>
                      <p className="text-xs text-brand-text-secondary mt-2 line-clamp-2">
                        {post.excerpt || post.plainTextContent || 'No excerpt available.'}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-brand-border-light flex items-center justify-between text-xs text-brand-text-tertiary">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.viewCount || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likeCount || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {post.commentCount || 0}</span>
                      <span className="flex items-center gap-1"><Bookmark className="w-3.5 h-3.5" /> {post.bookmarkCount || 0}</span>
                    </div>

                    <button
                      onClick={() => navigateTo(`/write?edit=${post.id}`)}
                      className="text-brand-primary hover:underline font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
