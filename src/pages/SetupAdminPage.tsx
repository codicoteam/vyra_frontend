import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ShieldAlert, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

export const SetupAdminPage: React.FC = () => {
  const { setCurrentUser, navigateTo, showToast, checkAdminStatus } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [canSetup, setCanSetup] = useState(false);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verifyStatus = async () => {
      setIsLoading(true);
      const exists = await checkAdminStatus();
      if (exists) {
        setCanSetup(false);
        navigateTo('/login');
      } else {
        setCanSetup(true);
      }
      setIsLoading(false);
    };
    verifyStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!canSetup) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !username || !password || !fullName) {
      setErrorMsg('All fields are required to setup the Administrator account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api.auth.setupFirstAdmin({
        email,
        username,
        password,
        fullName
      });

      const adminUser = {
        id: data.user.id || data.user._id,
        username: data.user.username,
        name: data.user.fullName,
        email: data.user.email,
        avatar: data.user.avatarUrl || 'https://picsum.photos/seed/admin/200/200',
        bannerImage: 'https://picsum.photos/seed/admin-banner/1200/400',
        bio: 'Platform System Administrator',
        role: 'ADMIN' as const,
        followersCount: 0,
        followingCount: 0,
        storiesCount: 0
      };

      setCurrentUser(adminUser);
      await checkAdminStatus();
      showToast('First Administrator Account created successfully!', 'success');
      navigateTo('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Setup failed. Administrator account may already exist.');
      showToast(err.message || 'Setup failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-8">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-display text-brand-text-primary">First Administrator Setup</h1>
          <p className="text-xs text-brand-text-secondary mt-2">
            No Administrator account was detected in the database. Create the initial system owner account.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-brand-text-tertiary absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Dr. System Administrator"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-brand-text-tertiary absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-text-tertiary absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@vyra.org"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-text-tertiary absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Administrator...' : 'Create Administrator Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-brand-text-tertiary text-center mt-6">
          Notice: Once created, administrator account registration is permanently locked.
        </p>

      </div>
    </div>
  );
};
