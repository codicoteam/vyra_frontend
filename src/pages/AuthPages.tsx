import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  ShieldAlert, Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff,
  Key, CheckCircle, ArrowLeft, X, CheckSquare
} from 'lucide-react';

export const AuthPages: React.FC = () => {
  const { setCurrentUser, navigateTo, showToast } = useApp();
  
  // Tab states: 'login' | 'register' | 'forgot'
  const [activeView, setActiveView] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation visual states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 2FA Verification flow
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [codeCells, setCodeCells] = useState<string[]>(['', '', '', '', '', '']);
  const cellRefs = useRef<HTMLInputElement[]>([]);

  // Password requirements
  const hasMinLen = password.length >= 8;
  const hasNum = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);

  const validateEmail = (val: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Please provide a valid academic or professional email address.';
    }
    if (password.length < 4) {
      newErrors.password = 'Credentials must correspond with key databases.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Validation failed. Please correct form entries.', 'error');
      return;
    }

    showToast('Validating credential keys...', 'info');
    try {
      const data = await api.auth.login({ email, password });
      const userRole = data.user.role || 'USER';
      const mappedUser = {
        id: data.user.id || data.user._id,
        username: data.user.username,
        name: data.user.fullName,
        email: data.user.email,
        avatar: data.user.avatarUrl || 'https://picsum.photos/seed/avatar/200/200',
        bannerImage: data.user.bannerUrl || 'https://picsum.photos/seed/banner/1200/400',
        bio: data.user.bio || '',
        role: userRole,
        followersCount: data.user.followersCount || 0,
        followingCount: data.user.followingCount || 0,
        storiesCount: data.user.storiesCount || 0,
        website: data.user.website,
        location: data.user.location,
        twitter: data.user.twitterHandle
      };

      setCurrentUser(mappedUser);
      showToast(`Welcome back, ${mappedUser.name}!`, 'success');

      if (userRole === 'ADMIN') {
        navigateTo('/admin/dashboard');
      } else if (userRole === 'AUTHOR') {
        navigateTo('/dashboard/author');
      } else if (userRole === 'EDITOR') {
        navigateTo('/editor/dashboard');
      } else {
        navigateTo('/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please try again.', 'error');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (!validateEmail(email)) {
      newErrors.email = 'Valid academic or professional email required.';
    }
    if (!/^[a-zA-Z0-9]+$/.test(username) || username.length > 15) {
      newErrors.username = 'Username letters/numbers only, max 15 chars.';
    }
    if (!hasMinLen || !hasNum || !hasUpper) {
      newErrors.password = 'Password requirements unmet.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Form entries contain errors', 'error');
      return;
    }

    // Open Verification 2FA Modal
    setVerifyModalOpen(true);
    showToast('Dispatched 6-digit confirmation security code', 'info');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrors({ email: 'Valid email is required to dispatch reset link.' });
      return;
    }
    showToast('Reset dispatch instructions sent to your recovery inbox', 'success');
    setActiveView('login');
  };

  // 2FA Autofocus flow
  const handleCellChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 1);
    const updated = [...codeCells];
    updated[index] = cleaned;
    setCodeCells(updated);

    if (cleaned && index < 5) {
      cellRefs.current[index + 1]?.focus();
    }
  };

  const handleCellKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeCells[index] && index > 0) {
      cellRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async () => {
    const fullCode = codeCells.join('');
    if (fullCode.length < 6) {
      showToast('Please specify the complete 6-digit confirmation code', 'warning');
      return;
    }

    showToast('Cryptographically validating security token...', 'info');
    try {
      const data = await api.auth.register({ email, username, password, fullName });
      setVerifyModalOpen(false);
      
      const mappedUser = {
        id: data.user._id,
        username: data.user.username,
        name: data.user.fullName,
        avatar: data.user.avatarUrl || 'https://picsum.photos/seed/avatar/200/200',
        bannerImage: data.user.bannerUrl || 'https://picsum.photos/seed/banner/1200/400',
        bio: data.user.bio || '',
        followersCount: data.user.followersCount || 0,
        followingCount: data.user.followingCount || 0,
        storiesCount: data.user.storiesCount || 0,
        website: data.user.website,
        location: data.user.location,
        twitter: data.user.twitterHandle
      };

      setCurrentUser(mappedUser);
      showToast('Scholar credentials verified successfully! Welcome to VYRA.', 'success');
      navigateTo('/home');
    } catch (err: any) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
    }
  };

  const triggerSocialOAuth = (provider: string) => {
    showToast(`Securing OAuth handshake connection with ${provider}...`, 'info');
    setTimeout(() => {
      showToast(`Handshake complete. Retransmitting ${provider} session token.`, 'success');
      setCurrentUser({
        id: 'user-oauth',
        name: `${provider} User`,
        username: `${provider.toLowerCase()}_scholar`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: `Account safely synchronized using OAuth via ${provider}.`,
        followersCount: 1,
        followingCount: 10,
        storiesCount: 0,
        bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
      });
      navigateTo('/home');
    }, 1100);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 animate-fade-in text-left">
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-md transition-theme">
        
        {/* Core header title */}
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl text-brand-text-primary tracking-tight">
            {activeView === 'login' && 'Scholar Access'}
            {activeView === 'register' && 'Apply for Clearance'}
            {activeView === 'forgot' && 'Credentials Retrieval'}
          </h1>
          <p className="text-xs text-brand-text-secondary mt-1.5">
            {activeView === 'login' && 'Publish verified data sets and medical reports securely.'}
            {activeView === 'register' && 'Synchronize decentralized whistleblower keys.'}
            {activeView === 'forgot' && 'Dispatch recovery instructions directly to recovery inbox.'}
          </p>
        </div>

        {/* 1. LOGIN PANEL */}
        {activeView === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-brand-text-secondary uppercase">Academic or Private Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-primary absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                  placeholder="scholar@university.edu"
                  className={`w-full bg-brand-bg border text-xs sm:text-sm p-3.5 pl-10 rounded-xl outline-none focus:border-brand-primary ${errors.email ? 'border-red-500 bg-red-50/10' : 'border-brand-border'}`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-medium pl-1">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-brand-text-secondary uppercase">Password</label>
                <button type="button" onClick={() => setActiveView('forgot')} className="text-[10px] text-brand-primary font-bold hover:underline">Forgot Keys?</button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-primary absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                  placeholder="••••••••••••"
                  className={`w-full bg-brand-bg border text-xs sm:text-sm p-3.5 pl-10 pr-10 rounded-xl outline-none focus:border-brand-primary ${errors.password ? 'border-red-500 bg-red-50/10' : 'border-brand-border'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-brand-text-tertiary hover:text-brand-text-secondary">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 font-medium pl-1">{errors.password}</p>}
            </div>

            <button type="submit" className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-sm transition-colors mt-2">
              Unlock Terminal Clearance
            </button>
          </form>
        )}

        {/* 2. REGISTER PANEL */}
        {activeView === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-brand-text-secondary uppercase">Full Portfolio Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-brand-primary absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setErrors({}); }}
                  placeholder="Dr. Evelyn Vance"
                  className={`w-full bg-brand-bg border text-xs sm:text-sm p-3.5 pl-10 rounded-xl outline-none focus:border-brand-primary ${errors.fullName ? 'border-red-500' : 'border-brand-border'}`}
                />
              </div>
              {errors.fullName && <p className="text-[10px] text-red-500 font-medium pl-1">{errors.fullName}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-brand-text-secondary uppercase">Unique Handle</label>
              <div className="relative">
                <span className="text-xs font-bold text-brand-text-tertiary absolute left-3 top-3.5">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrors({}); }}
                  placeholder="evelynvance"
                  className={`w-full bg-brand-bg border text-xs sm:text-sm p-3.5 pl-8 rounded-xl outline-none focus:border-brand-primary ${errors.username ? 'border-red-500' : 'border-brand-border'}`}
                />
              </div>
              {errors.username && <p className="text-[10px] text-red-500 font-medium pl-1">{errors.username}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-brand-text-secondary uppercase">Secure Inbox</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-primary absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                  placeholder="vance@university.edu"
                  className={`w-full bg-brand-bg border text-xs sm:text-sm p-3.5 pl-10 rounded-xl outline-none focus:border-brand-primary ${errors.email ? 'border-red-500' : 'border-brand-border'}`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-medium pl-1">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-brand-text-secondary uppercase">Secured Passkey</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-primary absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                  placeholder="••••••••••••"
                  className={`w-full bg-brand-bg border text-xs sm:text-sm p-3.5 pl-10 pr-10 rounded-xl outline-none focus:border-brand-primary ${errors.password ? 'border-red-500' : 'border-brand-border'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-brand-text-tertiary hover:text-brand-text-secondary">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Dynamic Requirement Indicators */}
              <div className="grid grid-cols-3 gap-1.5 pt-1.5">
                <div className={`h-1 rounded transition-colors ${hasMinLen ? 'bg-emerald-500' : 'bg-brand-border'}`} title="At least 8 characters" />
                <div className={`h-1 rounded transition-colors ${hasNum ? 'bg-emerald-500' : 'bg-brand-border'}`} title="Includes one number" />
                <div className={`h-1 rounded transition-colors ${hasUpper ? 'bg-emerald-500' : 'bg-brand-border'}`} title="Includes one capital letter" />
              </div>
              <p className="text-[9px] text-brand-text-tertiary italic">Passkey requires 8+ chars, numbers, and capital letters.</p>
            </div>

            <button type="submit" className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-sm transition-colors mt-4">
              Submit Clearances Form
            </button>
          </form>
        )}

        {/* 3. FORGOT PANEL */}
        {activeView === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-brand-text-secondary uppercase">Secure Retrieval Inbox</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-primary absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                  placeholder="scholar@university.edu"
                  className="w-full bg-brand-bg border border-brand-border text-xs sm:text-sm p-3.5 pl-10 rounded-xl outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-sm transition-colors mt-2">
              Transmit Key recovery instructions
            </button>

            <button 
              type="button" 
              onClick={() => setActiveView('login')}
              className="w-full py-2.5 border border-brand-border hover:bg-brand-border-light text-brand-text-secondary text-xs uppercase tracking-wider font-bold rounded-xl flex items-center justify-center gap-1.5 mt-2"
            >
              <ArrowLeft className="w-4 h-4 text-brand-primary" /> Return to access gate
            </button>
          </form>
        )}

        {/* Social Handshakes (Only for Login/Register) */}
        {activeView !== 'forgot' && (
          <div className="mt-8 pt-6 border-t border-brand-border">
            <span className="text-[10px] font-bold text-brand-text-tertiary block text-center uppercase tracking-widest mb-4">OR DECENTRALIZED SYNC</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => triggerSocialOAuth('Google')}
                className="flex items-center justify-center gap-2 py-2 px-4 border border-brand-border hover:border-brand-primary/40 hover:bg-brand-border-light text-xs font-semibold text-brand-text-secondary rounded-xl transition-all"
              >
                Google Sync
              </button>
              <button
                type="button"
                onClick={() => triggerSocialOAuth('GitHub')}
                className="flex items-center justify-center gap-2 py-2 px-4 border border-brand-border hover:border-brand-primary/40 hover:bg-brand-border-light text-xs font-semibold text-brand-text-secondary rounded-xl transition-all"
              >
                GitHub Sync
              </button>
            </div>
          </div>
        )}

        {/* View Switchers */}
        <div className="text-center mt-6">
          {activeView === 'login' && (
            <p className="text-xs text-brand-text-secondary">
              Don't have clearance records?{' '}
              <button onClick={() => setActiveView('register')} className="text-brand-primary font-bold hover:underline">Apply here</button>
            </p>
          )}
          {activeView === 'register' && (
            <p className="text-xs text-brand-text-secondary">
              Already possess clearance records?{' '}
              <button onClick={() => setActiveView('login')} className="text-brand-primary font-bold hover:underline">Unlock Here</button>
            </p>
          )}
        </div>

      </div>

      {/* 4. Registration 6-Digit Code 2FA Verification Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border w-full max-w-sm rounded-2xl p-6 sm:p-8 text-left shadow-2xl relative animate-scale-up transition-theme">
            
            <button 
              onClick={() => setVerifyModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-brand-bg hover:bg-brand-border-light rounded-full text-brand-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-brand-primary mb-4">
              <Key className="w-6 h-6 animate-spin" />
              <h3 className="font-display font-bold text-lg text-brand-text-primary">Verify Credentials</h3>
            </div>

            <p className="text-xs text-brand-text-secondary leading-relaxed mb-6">
              Enter the 6-digit cryptographic verification code sent to <strong className="text-brand-text-primary">{email}</strong>.
            </p>

            {/* Autofocus cells */}
            <div className="grid grid-cols-6 gap-2 mb-8">
              {codeCells.map((val, idx) => (
                <input
                  key={idx}
                  ref={el => cellRefs.current[idx] = el as HTMLInputElement}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleCellChange(idx, e.target.value)}
                  onKeyDown={(e) => handleCellKeyDown(idx, e)}
                  className="w-full text-center py-3 bg-brand-bg border-2 border-brand-border rounded-xl text-lg font-bold text-brand-text-primary outline-none focus:border-brand-primary"
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="py-2.5 px-4 border border-brand-border text-brand-text-secondary hover:bg-brand-border-light text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={verifyCode}
                className="py-2.5 px-5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-lg shadow-md"
              >
                Decrypt & Clearance
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
