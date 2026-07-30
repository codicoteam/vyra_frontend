import React, { useState } from 'react';
import { 
  X, Copy, Check, Twitter, Linkedin, Mail, Link2, 
  Quote, FileText, Share2, Send, MessageSquare 
} from 'lucide-react';
import { Story } from '../types';

interface ShareModalProps {
  story: Story;
  isOpen: boolean;
  onClose: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ 
  story, 
  isOpen, 
  onClose, 
  showToast 
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'snippet'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  
  // Curated snippets from the story
  const snippets = [
    {
      id: 'title-excerpt',
      label: 'Title & Excerpt',
      text: `"${story.title}"\n\n${story.excerpt}`
    },
    {
      id: 'quote',
      label: 'Key Summary Quote',
      text: `Read this investigative intelligence on VYRA: "${story.excerpt}" — @${story.author.username}`
    },
    {
      id: 'citation',
      label: 'Academic Citation',
      text: `${story.isAnonymous ? 'Anonymous' : story.author.name}. (${new Date(story.publishedDate).getFullYear()}). "${story.title}". VYRA Open Intelligence Network. ${story.doi ? `DOI: ${story.doi}` : ''}`
    }
  ];

  const [selectedSnippetId, setSelectedSnippetId] = useState(snippets[0].id);
  const currentSnippetText = snippets.find(s => s.id === selectedSnippetId)?.text || '';
  const [customSnippetText, setCustomSnippetText] = useState(currentSnippetText);

  // Sync custom snippet text when selection changes
  React.useEffect(() => {
    const defaultText = snippets.find(s => s.id === selectedSnippetId)?.text || '';
    setCustomSnippetText(defaultText);
  }, [selectedSnippetId]);

  if (!isOpen) return null;

  const shareUrl = window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(story.title);
  const encodedText = encodeURIComponent(customSnippetText);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    showToast('Secure link copied to clipboard', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(customSnippetText);
    setCopiedSnippet(true);
    showToast('Story snippet copied to clipboard', 'success');
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-brand-surface dark:bg-slate-900 border border-brand-border w-full max-w-lg rounded-2xl p-6 text-left shadow-2xl relative animate-scale-up my-8 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-brand-bg dark:bg-slate-950 hover:bg-brand-border-light dark:hover:bg-slate-800 rounded-full text-brand-text-secondary transition-all"
          title="Close share menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="p-2.5 bg-brand-primary-light dark:bg-purple-950/40 text-brand-primary dark:text-purple-300 rounded-xl">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-brand-text-primary">Share Publication</h3>
            <p className="text-[10px] text-brand-text-tertiary uppercase font-mono tracking-wider">SECURE SOVEREIGN DISTRIBUTION</p>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-brand-border mb-5 shrink-0">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'link' 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-brand-text-tertiary hover:text-brand-text-secondary'
            }`}
          >
            Direct Link
          </button>
          <button
            onClick={() => setActiveTab('snippet')}
            className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'snippet' 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-brand-text-tertiary hover:text-brand-text-secondary'
            }`}
          >
            Custom Snippet
          </button>
        </div>

        {/* Modal Content Area (Scrollable if needed) */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-5">
          
          {activeTab === 'link' ? (
            /* Tab 1: Link Sharing */
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-brand-text-tertiary uppercase block mb-1.5">Article Information</label>
                <div className="p-3.5 bg-brand-bg dark:bg-slate-950 rounded-xl border border-brand-border/60">
                  <h4 className="text-xs sm:text-sm font-bold text-brand-text-primary mb-1 line-clamp-1">{story.title}</h4>
                  <p className="text-[10px] text-brand-text-tertiary">Written by {story.isAnonymous ? 'Anonymous Contributor' : story.author.name} • {story.category}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-tertiary uppercase block mb-1.5">Copy Secure Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-brand-bg dark:bg-slate-950 border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-text-secondary font-mono truncate select-all flex items-center">
                    {shareUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all shrink-0 active:scale-95 touch-target"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-tertiary uppercase block mb-1.5">Intel Network Quick Share</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Interesting report on VYRA: "${story.title}"`)}&url=${encodedUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all border border-slate-800"
                  >
                    <Twitter className="w-4 h-4 text-sky-400 fill-current" />
                    <span>Twitter / X</span>
                  </a>

                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all border border-slate-800"
                  >
                    <Linkedin className="w-4 h-4 text-blue-400 fill-current" />
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href={`https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all border border-slate-800"
                  >
                    <span className="text-orange-500 font-bold text-sm">r/</span>
                    <span>Reddit</span>
                  </a>

                  <a
                    href={`mailto:?subject=${encodedTitle}&body=I%20thought%20you%2527d%20find%20this%20investigative%20report%20on%20the%20VYRA%20Intelligence%20Network%20valuable:%20${story.title}%0A%0ARead%20here:%20${shareUrl}`}
                    className="flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all border border-slate-800"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>Email Feed</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Snippet / Quote Sharing */
            <div className="space-y-4">
              
              <div>
                <label className="text-[10px] font-bold text-brand-text-tertiary uppercase block mb-1.5">Select Snippet Template</label>
                <div className="flex flex-wrap gap-2">
                  {snippets.map(snippet => (
                    <button
                      key={snippet.id}
                      onClick={() => setSelectedSnippetId(snippet.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        selectedSnippetId === snippet.id 
                          ? 'bg-brand-primary-light border-brand-primary text-brand-primary dark:bg-purple-950/40' 
                          : 'bg-brand-bg dark:bg-slate-950 border-brand-border text-brand-text-secondary hover:bg-brand-border-light'
                      }`}
                    >
                      {snippet.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-tertiary uppercase block mb-1.5">Customize Snippet Text</label>
                <div className="relative">
                  <textarea
                    value={customSnippetText}
                    onChange={(e) => setCustomSnippetText(e.target.value)}
                    rows={4}
                    maxLength={280}
                    className="w-full bg-brand-bg dark:bg-slate-950 border border-brand-border rounded-xl p-3 text-xs sm:text-sm font-sans outline-none focus:border-brand-primary text-brand-text-primary leading-relaxed resize-none"
                    placeholder="Enter custom share text..."
                  />
                  <div className="absolute bottom-2.5 right-2.5 text-[9px] font-mono text-brand-text-tertiary bg-brand-surface dark:bg-slate-900 border border-brand-border px-1.5 py-0.5 rounded">
                    {customSnippetText.length} / 280 chars
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleCopySnippet}
                  className="flex-1 py-3 bg-brand-surface border border-brand-border hover:bg-brand-border-light text-brand-text-primary text-xs sm:text-sm font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 touch-target"
                >
                  {copiedSnippet ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-brand-primary" />}
                  <span>{copiedSnippet ? 'Copied snippet!' : 'Copy to Clipboard'}</span>
                </button>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 text-center touch-target"
                >
                  <Twitter className="w-4 h-4 fill-current" />
                  <span>Post customized snippet</span>
                </a>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200/40 dark:border-purple-900/40 rounded-xl text-left">
                <p className="text-[10px] text-brand-primary dark:text-purple-300 leading-relaxed flex items-start gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
                  <span>We automatically append the source link <b>{shareUrl.substring(0, 30)}...</b> when posting to microblogs or external forums so reviewers can verify citations.</span>
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer info line */}
        <div className="mt-6 pt-4 border-t border-brand-border shrink-0 text-center flex items-center justify-center gap-1.5 text-[9px] text-brand-text-tertiary">
          <Quote className="w-3 h-3 text-brand-accent" />
          <span>Sovereign dissemination complies with open encryption & verification protocols</span>
        </div>

      </div>
    </div>
  );
};
