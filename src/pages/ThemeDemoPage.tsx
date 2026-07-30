import React from 'react';
import { useApp } from '../context/AppContext';
import { Laptop, ShieldCheck, Heart, Trash2, Edit3, HelpCircle } from 'lucide-react';
export const ThemeDemoPage: React.FC = () => {
  const { showToast } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      
      {/* Header */}
      <div className="border-b border-brand-border pb-5 mb-8">
        <div className="flex items-center gap-2.5">
          <Laptop className="w-6 h-6 text-brand-primary" />
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-text-primary tracking-tight">Style Guide & Design Tokens</h1>
        </div>
        <p className="text-sm text-brand-text-secondary mt-1">Unified design tokens, responsive typography sizes, and interactive state rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Swatches and fonts */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Typography Section */}
          <div className="bg-brand-surface border border-brand-border p-6 rounded-2xl">
            <h3 className="text-xs font-black text-brand-text-tertiary tracking-widest uppercase mb-4">TYPOGRAPHY SCALES</h3>
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono text-brand-text-tertiary">Poppins Display Extrabold (Font-Display)</span>
                <h1 className="font-display font-black text-3xl sm:text-5xl text-brand-text-primary tracking-tight mt-1">Poppins Bold Title</h1>
              </div>
              <div>
                <span className="text-[10px] font-mono text-brand-text-tertiary">Inter Sans-Serif Regular (Font-Sans)</span>
                <p className="font-sans text-sm sm:text-base text-brand-text-secondary leading-relaxed mt-1">
                  The primary sans-serif typeface is Inter. Used for readable research papers, social whistleblowing reports, and global interactive interfaces.
                </p>
              </div>
            </div>
          </div>

          {/* Core Colors Swatches */}
          <div className="bg-brand-surface border border-brand-border p-6 rounded-2xl">
            <h3 className="text-xs font-black text-brand-text-tertiary tracking-widest uppercase mb-4">BRAND COLOR TOKENS</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              <div className="space-y-2">
                <div className="h-16 bg-brand-primary rounded-xl shadow-inner" />
                <div className="text-left">
                  <p className="text-xs font-bold text-brand-text-primary">Primary Indigo</p>
                  <p className="text-[10px] font-mono text-brand-text-tertiary">var(--brand-primary)</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-16 bg-brand-accent rounded-xl shadow-inner" />
                <div className="text-left">
                  <p className="text-xs font-bold text-brand-text-primary">Accent Cyan</p>
                  <p className="text-[10px] font-mono text-brand-text-tertiary">var(--brand-accent)</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-16 bg-brand-surface rounded-xl border border-brand-border shadow-inner" />
                <div className="text-left">
                  <p className="text-xs font-bold text-brand-text-primary">Card Surface</p>
                  <p className="text-[10px] font-mono text-brand-text-tertiary">var(--brand-surface)</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-16 bg-brand-bg rounded-xl border border-brand-border shadow-inner" />
                <div className="text-left">
                  <p className="text-xs font-bold text-brand-text-primary">Background Canvas</p>
                  <p className="text-[10px] font-mono text-brand-text-tertiary">var(--brand-bg)</p>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Button States */}
          <div className="bg-brand-surface border border-brand-border p-6 rounded-2xl">
            <h3 className="text-xs font-black text-brand-text-tertiary tracking-widest uppercase mb-4">BUTTON STATES</h3>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => showToast('Primary key trigger action', 'success')} className="px-5 py-2.5 bg-brand-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-brand-primary-hover shadow-sm transition-all">
                Primary Button
              </button>
              <button onClick={() => showToast('Accent secondary action', 'info')} className="px-5 py-2.5 bg-brand-accent text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 shadow-sm transition-all">
                Accent Action
              </button>
              <button onClick={() => showToast('Outlined border action', 'warning')} className="px-5 py-2.5 border border-brand-border text-brand-text-secondary hover:text-brand-primary font-bold text-xs uppercase tracking-wider rounded-xl transition-all">
                Outlined border
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Platform Guideline reminders */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-brand-surface border border-brand-border p-6 rounded-2xl">
            <h4 className="font-display font-bold text-sm text-brand-text-primary mb-4 border-b border-brand-border-light pb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-primary" /> CRYPTOGRAPHIC STANDARDS
            </h4>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              VYRA adheres to military-grade whistleblower standards, deploying SHA-256 metadata purging filters, offline local persistence fallbacks, and multi-node ledger check-sums.
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-950 to-purple-950 p-6 rounded-2xl text-white">
            <h4 className="font-display font-black text-base mb-2">Build Confidently</h4>
            <p className="text-xs text-indigo-200 leading-relaxed">
              The style system gracefully adapts between off-white editorial light themes and high-contrast space midnight dark themes automatically.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
