import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { UserProfileData } from '../types';
import { StoryCard } from '../components/StoryCard';
import { 
  User, Link as LinkIcon, MapPin, Twitter, Edit, Check, Globe,
  Shield, AlertTriangle, X, Trash2, Grid, List as ListIcon, SlidersHorizontal, BookOpen
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { currentRoute, navigateTo, currentUser, setCurrentUser, stories, likedStoryIds, bookmarkedStoryIds, showToast } = useApp();
  
  // Profile settings states
  const [activeTab, setActiveTab] = useState<'published' | 'saved' | 'liked'>('published');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'most-liked'>('newest');

  // Synchronize active tab with URL route changes
  useEffect(() => {
    if (currentRoute.endsWith('/saved')) {
      setActiveTab('saved');
    } else if (currentRoute.endsWith('/liked')) {
      setActiveTab('liked');
    } else {
      setActiveTab('published');
    }
  }, [currentRoute]);
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editTwitter, setEditTwitter] = useState('');

  // Extract username from route, e.g. `/profile/sarahchen`
  const getUsername = () => {
    const parts = currentRoute.split('/');
    // Check if second-to-last part is profile
    const index = parts.indexOf('profile');
    if (index !== -1 && index + 1 < parts.length) {
      return parts[index + 1];
    }
    return currentUser?.username || 'sarahchen';
  };

  const username = getUsername();
  const [profileUser, setProfileUser] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await api.users.getProfile(username);
        if (active && data) {
          setProfileUser({
            id: data._id || data.id,
            username: data.username,
            name: data.fullName || data.name,
            avatar: data.avatarUrl || data.avatar || 'https://picsum.photos/seed/avatar/200/200',
            bannerImage: data.bannerUrl || data.bannerImage || 'https://picsum.photos/seed/banner/1200/400',
            bio: data.bio || '',
            followersCount: data.followersCount || 0,
            followingCount: data.followingCount || 0,
            storiesCount: data.storiesCount || 0,
            website: data.website || '',
            location: data.location || '',
            twitter: data.twitterHandle || data.twitter || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch user profile', err);
        if (active) {
          if (currentUser && currentUser.username.toLowerCase() === username.toLowerCase()) {
            setProfileUser(currentUser);
          } else {
            setProfileUser(null);
          }
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    fetchProfile();
    return () => {
      active = false;
    };
  }, [username, currentUser]);

  const isOwnProfile = currentUser && profileUser && currentUser.id === profileUser.id;

  // Initialize edit fields
  useEffect(() => {
    if (profileUser) {
      setEditName(profileUser.name);
      setEditBio(profileUser.bio);
      setEditWebsite(profileUser.website || '');
      setEditLocation(profileUser.location || '');
      setEditTwitter(profileUser.twitter || '');
    }
  }, [profileUser, editModalOpen]);

  const [followedState, setFollowedState] = useState(false);

  const handleFollowToggle = () => {
    if (!profileUser) return;
    setFollowedState(!followedState);
    showToast(followedState ? `Stopped following @${profileUser.username}` : `You are now following @${profileUser.username}`, 'success');
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUser) return;
    if (!editName.trim()) {
      showToast('Name field cannot be left blank', 'warning');
      return;
    }

    const updates = {
      fullName: editName,
      bio: editBio,
      website: editWebsite,
      location: editLocation,
      twitterHandle: editTwitter
    };

    try {
      const data = await api.users.updateProfile(profileUser.username, updates);
      if (data) {
        const updatedUser: UserProfileData = {
          id: data._id || data.id,
          username: data.username,
          name: data.fullName || data.name,
          avatar: data.avatarUrl || data.avatar || 'https://picsum.photos/seed/avatar/200/200',
          bannerImage: data.bannerUrl || data.bannerImage || 'https://picsum.photos/seed/banner/1200/400',
          bio: data.bio || '',
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0,
          storiesCount: data.storiesCount || 0,
          website: data.website || '',
          location: data.location || '',
          twitter: data.twitterHandle || data.twitter || ''
        };

        if (isOwnProfile) {
          setCurrentUser(updatedUser);
        }
        setProfileUser(updatedUser);
        setEditModalOpen(false);
        showToast('Your profile records have been updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  const handleDeleteAccount = () => {
    showToast('Processing cryptographic account scrub...', 'info');
    setTimeout(() => {
      setCurrentUser(null);
      setDeleteModalOpen(false);
      navigateTo('/');
      showToast('Account metadata scrubbed successfully under privacy shield guidelines', 'success');
    }, 1500);
  };

  // Filter stories based on tab selection
  let tabStories = [...stories];
  if (isLoading) {
    tabStories = [];
  } else if (profileUser) {
    if (activeTab === 'published') {
      tabStories = stories.filter(story => story.author.id === profileUser.id);
    } else if (activeTab === 'saved') {
      tabStories = stories.filter(story => bookmarkedStoryIds.includes(story.id));
    } else if (activeTab === 'liked') {
      tabStories = stories.filter(story => likedStoryIds.includes(story.id));
    }
  }

  // Sort Tab stories
  if (sortBy === 'newest') {
    tabStories.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  } else if (sortBy === 'most-liked') {
    tabStories.sort((a, b) => b.likes - a.likes);
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-brand-text-secondary text-sm">Retrieving scholar record profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="font-display font-bold text-xl text-brand-text-primary mb-2">Scholar Profile Not Found</h2>
        <p className="text-brand-text-secondary text-sm mb-6">The requested user profile does not exist or has been deconstructed.</p>
        <button onClick={() => navigateTo('/')} className="px-6 py-2 bg-brand-primary text-white font-bold rounded-xl text-sm">Return Home</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in text-left">
      
      {/* 1. Profile Banner backdrop */}
      <div className="h-48 sm:h-64 md:h-72 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
        <img 
          src={profileUser.bannerImage} 
          alt="User banner" 
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg to-transparent pointer-events-none" />
      </div>

      {/* 2. Overlapping Profile Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10 mb-10">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row gap-6 justify-between items-start md:items-end transition-theme">
          
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
            <img 
              src={profileUser.avatar} 
              alt={profileUser.name} 
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-brand-surface object-cover shadow-md shrink-0"
            />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-text-primary tracking-tight">
                  {profileUser.name}
                </h1>
                <span className="bg-brand-primary-light text-brand-primary dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  {profileUser.id === 'user-12' ? 'Verified Source' : 'Scholar'}
                </span>
              </div>
              <p className="text-sm text-brand-text-tertiary">@{profileUser.username}</p>
              
              <p className="text-sm text-brand-text-secondary leading-relaxed mt-3 max-w-2xl">
                {profileUser.bio}
              </p>

              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-brand-text-secondary">
                {profileUser.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-primary" /> {profileUser.location}</span>
                )}
                {profileUser.website && (
                  <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-primary"><LinkIcon className="w-3.5 h-3.5 text-brand-primary" /> {profileUser.website.replace('https://', '')}</a>
                )}
                {profileUser.twitter && (
                  <span className="flex items-center gap-1"><Twitter className="w-3.5 h-3.5 text-sky-500" /> {profileUser.twitter}</span>
                )}
              </div>
            </div>
          </div>

          {/* Followers Stats & Button Action */}
          <div className="flex flex-row md:flex-col items-start gap-4 md:gap-5 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-brand-border-light">
            <div className="flex gap-6 text-sm text-brand-text-secondary">
              <div>
                <span className="block font-bold text-brand-text-primary text-base sm:text-lg">{profileUser.followersCount}</span>
                <span>followers</span>
              </div>
              <div>
                <span className="block font-bold text-brand-text-primary text-base sm:text-lg">{profileUser.followingCount}</span>
                <span>following</span>
              </div>
              <div>
                <span className="block font-bold text-brand-text-primary text-base sm:text-lg">{profileUser.storiesCount}</span>
                <span>publications</span>
              </div>
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-surface border border-brand-border hover:bg-brand-border-light text-brand-text-secondary font-bold text-sm rounded-xl tracking-wide transition-all w-full sm:w-auto text-center justify-center shadow-sm"
              >
                <Edit className="w-4 h-4 text-brand-primary" /> Edit Records
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-6 py-2.5 font-bold text-sm rounded-xl tracking-wide transition-all w-full sm:w-auto text-center justify-center ${
                  followedState 
                    ? 'bg-brand-border-light text-brand-text-secondary' 
                    : 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-sm'
                }`}
              >
                {followedState ? 'Following' : 'Follow Writer'}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. Interactive Profile Tab Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Tab triggers */}
        <div className="flex justify-between items-center border-b border-brand-border mb-8">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('published')}
              className={`pb-4 text-sm font-semibold relative transition-colors ${
                activeTab === 'published' ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'
              }`}
            >
              Publications ({profileUser.storiesCount})
              {activeTab === 'published' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-primary rounded-full animate-fade-in" />}
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-4 text-sm font-semibold relative transition-colors ${
                activeTab === 'saved' ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'
              }`}
            >
              Bookmarks ({isOwnProfile ? bookmarkedStoryIds.length : 2})
              {activeTab === 'saved' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-primary rounded-full animate-fade-in" />}
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`pb-4 text-sm font-semibold relative transition-colors ${
                activeTab === 'liked' ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'
              }`}
            >
              Liked Publications ({isOwnProfile ? likedStoryIds.length : 3})
              {activeTab === 'liked' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-primary rounded-full animate-fade-in" />}
            </button>
          </div>

          {/* Grid/List togglers and sorting */}
          <div className="hidden sm:flex items-center gap-4">
            
            {/* Sorting */}
            <div className="flex items-center gap-1.5 text-xs text-brand-text-secondary">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-text-tertiary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border border-brand-border text-xs py-1 px-2 rounded-lg outline-none"
              >
                <option value="newest">Newest</option>
                <option value="most-liked">Most Liked</option>
              </select>
            </div>

            {/* Layout Toggles */}
            <div className="flex border border-brand-border p-0.5 rounded-lg bg-brand-surface">
              <button 
                onClick={() => setLayoutMode('grid')}
                className={`p-1 rounded ${layoutMode === 'grid' ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-text-tertiary'}`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setLayoutMode('list')}
                className={`p-1 rounded ${layoutMode === 'list' ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-text-tertiary'}`}
                title="List view"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stories Listing Grid */}
        {tabStories.length === 0 ? (
          <div className="bg-brand-surface border border-brand-border p-12 text-center rounded-2xl flex flex-col items-center gap-4">
            <BookOpen className="w-12 h-12 text-brand-text-tertiary" />
            <h3 className="font-display font-bold text-lg text-brand-text-primary">No Publications Yet</h3>
            <p className="text-xs text-brand-text-secondary max-w-xs leading-relaxed">
              No publications correspond with this filter setting currently. Check back soon for fresh records.
            </p>
          </div>
        ) : (
          <div className={layoutMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6 max-w-4xl"}>
            {tabStories.map((story) => (
              <div key={story.id}>
                <StoryCard story={story} variant={layoutMode === 'list' ? 'compact' : 'default'} />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 4. Edit Profile Records Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border w-full max-w-xl rounded-2xl p-6 sm:p-8 text-left shadow-2xl relative animate-scale-up transition-theme">
            
            <button 
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-brand-bg hover:bg-brand-border-light rounded-full text-brand-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display font-black text-xl sm:text-2xl text-brand-text-primary mb-6">
              Update Scholar Portfolio
            </h2>

            <form onSubmit={handleSaveChanges} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-text-secondary">Full Scholar Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-sm p-2.5 rounded-xl outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-text-secondary">Scholar Bio Biography</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-sm p-2.5 rounded-xl outline-none h-24 resize-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-text-secondary">Website URL</label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-xs p-2 rounded-xl outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-text-secondary">District Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-xs p-2 rounded-xl outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-text-secondary">Twitter Handle</label>
                  <input
                    type="text"
                    value={editTwitter}
                    onChange={(e) => setEditTwitter(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-xs p-2 rounded-xl outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-brand-border-light mt-6">
                {/* Danger button to clear account */}
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="py-2.5 px-4 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl text-center flex items-center justify-center gap-1 shrink-0"
                >
                  <Trash2 className="w-4 h-4" /> Deconstruct Metadata Portfolio
                </button>

                <div className="flex-grow flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="py-2.5 px-5 border border-brand-border hover:bg-brand-border-light text-brand-text-secondary text-sm font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-xl shadow-md"
                  >
                    Commit Updates
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 5. Delete Account Danger Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-[60] flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-rose-500 max-w-md w-full rounded-2xl p-6 text-left shadow-2xl relative animate-scale-up">
            
            <button 
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-brand-bg hover:bg-brand-border-light rounded-full text-brand-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <h3 className="font-display font-black text-lg">Destroy Cryptographic Profile?</h3>
            </div>

            <p className="text-xs text-brand-text-secondary leading-relaxed mb-6">
              This will initiate an immediate **complete administrative purge** of your author records, draft states, and verification tokens from the local context. **This action is irreversible.**
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="py-2 px-4 border border-brand-border text-brand-text-secondary hover:bg-brand-border-light text-xs font-semibold rounded-lg"
              >
                Retain Portfolio
              </button>
              <button
                onClick={handleDeleteAccount}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Yes, Purge Metadata Now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
