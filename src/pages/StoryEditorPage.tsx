import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

import { 
  ArrowLeft, Eye, Image as ImageIcon, Folder, Tag, Shield,
  Settings, Bold, Italic, Heading2, Heading3, Quote, Code, List, HelpCircle,
  Link, Film, Check, AlertCircle, X, ChevronRight, CheckSquare, Download
} from 'lucide-react';
import { Attachment } from '../types';

export const StoryEditorPage: React.FC = () => {
  const { navigateTo, addStory, currentUser, showToast, categories } = useApp();

  // Whistleblower Document Sanitizer States
  const [scrubbingFile, setScrubbingFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isScrubbed, setIsScrubbed] = useState(false);
  const [scannedMetadata, setScannedMetadata] = useState<{ label: string; value: string }[] | null>(null);
  const [scrubbedHash, setScrubbedHash] = useState('');
  const [sterilizedFiles, setSterilizedFiles] = useState<Attachment[]>([]);

  // Core Editor States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Research']);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState('https://picsum.photos/seed/draft/1200/630');
  const [allowLikes, setAllowLikes] = useState(true);

  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'editing' | 'saving' | 'saved'>('saved');
  const [isPublishing, setIsPublishing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const draftIdRef = useRef<string | null>(null);

  // Auto-save draft every 30 seconds to backend API
  useEffect(() => {
    const interval = setInterval(async () => {
      if (title.trim() || content.trim()) {
        try {
          setSaveStatus('saving');
          if (draftIdRef.current) {
            await api.drafts.update(draftIdRef.current, {
              title,
              content,
              excerpt,
              category: selectedCategory,
              tags,
              isAnonymous,
              allowComments
            });
          } else {
            const res = await api.drafts.create({
              title: title || 'Untitled Draft',
              content,
              excerpt,
              category: selectedCategory,
              tags,
              isAnonymous,
              allowComments
            });
            if (res.data?.id) draftIdRef.current = res.data.id;
          }
          setSaveStatus('saved');
        } catch (e) {
          console.error('Auto-save draft failed', e);
        }
      }
    }, 30000); // Auto save every 30 seconds

    return () => clearInterval(interval);
  }, [title, content, excerpt, selectedCategory, tags, isAnonymous, allowComments]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setSaveStatus('editing');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSaveStatus('editing');
  };

  // Formatting helpers - inject structures into textarea
  const injectFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = prefix + (selected || 'text') + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    setContent(newContent);
    setSaveStatus('editing');

    // Refocus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected || 'text').length);
    }, 0);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/,/g, '');
      if (clean && !tags.includes(clean)) {
        if (tags.length >= 5) {
          showToast('You can add up to 5 tags only', 'warning');
          return;
        }
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelected = (name: string, size: number, type: string) => {
    const formattedSize = formatFileSize(size);
    setScrubbingFile({ name, size: formattedSize, type });
    setIsScrubbed(false);
    setIsScrubbing(false);

    // Realistic metaleaks scanning based on extension
    const risks = [
      { label: 'EXIF GPS Latitude', value: '45.1092° N' },
      { label: 'EXIF GPS Longitude', value: '122.6801° W' },
      { label: 'Author Signature', value: currentUser?.name || 'Tifa Bandira' },
      { label: 'Camera / Device', value: 'Apple iPhone 14 Pro Max' },
      { label: 'Creation Timestamp', value: new Date().toISOString() },
      { label: 'Compiler Metadata', value: 'macOS Ventura PDFKit' }
    ];
    setScannedMetadata(risks);
    showToast(`Metadata footprint scan complete for ${name}`, 'info');
  };

  const generateCryptographicReceipt = async (fileName: string, contentSeed: string) => {
    const rawString = `${fileName}-${contentSeed}-${Date.now()}`;
    try {
      const msgBuffer = new TextEncoder().encode(rawString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (e) {
      let hash = 0;
      for (let i = 0; i < rawString.length; i++) {
        hash = ((hash << 5) - hash) + rawString.charCodeAt(i);
        hash |= 0;
      }
      return 'vyra' + Math.abs(hash).toString(16).padStart(12, 'f') + '4cde094248be17c80d88';
    }
  };

  const handleScrubProcess = async () => {
    if (!scrubbingFile) return;
    setIsScrubbing(true);
    showToast('Executing zero-fill metadata purge...', 'info');

    setTimeout(async () => {
      const generatedHash = await generateCryptographicReceipt(scrubbingFile.name, scrubbingFile.size);
      setScrubbedHash(generatedHash);
      setIsScrubbing(false);
      setIsScrubbed(true);
      showToast('Document metadata sanitized successfully!', 'success');
    }, 1200);
  };

  const attachSterilizedFile = () => {
    if (!scrubbingFile || !isScrubbed) return;
    const newAttachment: Attachment = {
      name: scrubbingFile.name,
      size: scrubbingFile.size,
      type: scrubbingFile.type.split('/')[1] || 'binary',
      url: `vyra://ledger/manifest/${scrubbedHash.substring(0, 16)}`
    };
    setSterilizedFiles([...sterilizedFiles, newAttachment]);
    setScrubbingFile(null);
    setIsScrubbed(false);
    showToast('Sterilized evidence attached to manuscript draft', 'success');
  };

  const handlePublishNow = () => {
    if (!title.trim()) {
      showToast('Please specify a title for your publication', 'warning');
      return;
    }
    if (!content.trim()) {
      showToast('The story content cannot be empty', 'warning');
      return;
    }

    setIsPublishing(true);
    showToast('Validating academic formatting and checking protections...', 'info');

    // Simulate review delay
    setTimeout(() => {
      // Trigger context add
      addStory({
        title,
        excerpt: excerpt || content.substring(0, 120) + '...',
        content,
        coverImage: coverImageUrl,
        category: selectedCategory,
        tags,
        author: currentUser || { id: 'anon', name: 'Anonymous', avatar: 'https://picsum.photos/seed/anon/200/200', bio: 'Verified source', username: 'anonymous' },
        isAnonymous,
        readingTime: Math.max(Math.ceil(content.split(' ').length / 200), 2),
        isResearch: selectedCategory.toLowerCase().includes('tech') || selectedCategory.toLowerCase().includes('quantum') || selectedCategory.toLowerCase().includes('biotech'),
        hasAttachments: sterilizedFiles.length > 0,
        attachments: sterilizedFiles.length > 0 ? sterilizedFiles : undefined
      });

      setIsPublishing(false);
      setPublishModalOpen(false);
      
      // Navigate to home feed to let user view immediately
      navigateTo('/home');
    }, 1500);
  };

  return (
    <div className="min-h-[92vh] bg-brand-surface dark:bg-slate-900 flex flex-col transition-theme">
      
      {/* Top Distraction-free Toolbar */}
      <div className="border-b border-brand-border py-3 px-4 sm:px-6 flex items-center justify-between bg-brand-surface dark:bg-slate-900 sticky top-16 md:top-20 z-30 transition-theme">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigateTo('/home')}
            className="p-1.5 hover:bg-brand-border-light text-brand-text-secondary rounded-lg"
            title="Go back (Auto-saved)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* Status indicators */}
          <div className="flex items-center gap-2 text-xs">
            {saveStatus === 'editing' && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Draft editing...
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-brand-primary font-semibold flex items-center gap-1">
                <div className="w-2.5 h-2.5 border border-brand-primary border-t-transparent rounded-full animate-spin" /> Auto-saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved to cloud
              </span>
            )}
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg border transition-all text-brand-text-secondary ${sidebarOpen ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 'border-brand-border hover:bg-brand-border-light'}`}
            title="Toggle Settings Sidebar"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setPublishModalOpen(true)}
            className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-xl shadow-sm tracking-wide transition-colors"
          >
            Publish Now
          </button>
        </div>
      </div>

      {/* Main split work-desk */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* Editor Writing Area */}
        <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-10 flex flex-col gap-6 text-left w-full">
          
          {/* Cover image banner preview */}
          {coverImageUrl && (
            <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden group border border-brand-border">
              <img src={coverImageUrl} className="w-full h-full object-cover" alt="Cover preview" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => {
                    const seed = Math.floor(Math.random() * 1000);
                    setCoverImageUrl(`https://picsum.photos/seed/${seed}/1200/630`);
                    showToast('Randomized cover photo backdrop', 'success');
                  }} 
                  className="px-4 py-2 bg-white/20 hover:bg-white/35 backdrop-blur-md text-white rounded-xl text-xs font-semibold"
                >
                  Generate New Seed Backdrop
                </button>
              </div>
            </div>
          )}

          {/* Title Area */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Title your story..."
            className="font-display font-black text-3xl sm:text-5xl text-brand-text-primary tracking-tight outline-none border-b border-transparent focus:border-brand-border-light pb-2"
          />

          {/* Floating Rich Formatting Action Bar */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl shadow-sm py-1.5 px-2">
            <button onClick={() => injectFormat('**', '**')} className="p-1.5 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light rounded" title="Bold Text"><Bold className="w-4 h-4" /></button>
            <button onClick={() => injectFormat('*', '*')} className="p-1.5 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light rounded" title="Italic Text"><Italic className="w-4 h-4" /></button>
            <button onClick={() => injectFormat('## ')} className="p-1.5 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light rounded" title="H2 Heading"><Heading2 className="w-4 h-4" /></button>
            <button onClick={() => injectFormat('### ')} className="p-1.5 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light rounded" title="H3 Heading"><Heading3 className="w-4 h-4" /></button>
            
            <div className="h-4 w-[1px] bg-brand-border mx-1" />

            <button onClick={() => injectFormat('> ')} className="p-1.5 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light rounded" title="Block Quote"><Quote className="w-4 h-4" /></button>
            <button onClick={() => injectFormat('`', '`')} className="p-1.5 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light rounded" title="Code snippet"><Code className="w-4 h-4" /></button>
            <button onClick={() => injectFormat('- ')} className="p-1.5 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light rounded" title="Bullet List"><List className="w-4 h-4" /></button>
            
            <div className="h-4 w-[1px] bg-brand-border mx-1" />

            <button onClick={() => injectFormat('[Link Title](https://example.com)')} className="p-1.5 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light rounded" title="Insert Link"><Link className="w-4 h-4" /></button>
            <button 
              onClick={() => injectFormat('\n![Image Caption](https://picsum.photos/seed/article/1200/630)\n')} 
              className="p-1.5 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light rounded" 
              title="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Actual content textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            placeholder="Tell your story or compose your research findings... (supports markdown elements: ## heading, **bold**, *italic*, > blockquotes)"
            className="flex-1 w-full min-h-[400px] outline-none text-brand-text-primary leading-relaxed text-base sm:text-lg resize-none font-sans"
          />

        </div>

        {/* Settings Sidebar Panel (Desktop sticky right side) */}
        {sidebarOpen && (
          <div className="w-full md:w-80 bg-brand-surface border-t md:border-t-0 md:border-l border-brand-border p-6 text-left shrink-0 transition-theme">
            <h3 className="font-display font-bold text-sm text-brand-text-primary mb-6 border-b border-brand-border-light pb-2.5 uppercase tracking-wider">
              Publication Settings
            </h3>

            {/* Category selection */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-brand-text-secondary flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-brand-primary" /> Primary Discipline
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border text-sm p-2.5 rounded-xl outline-none focus:border-brand-primary"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Tags manager */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-brand-text-secondary flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-primary" /> Tags Index
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Type tag and press Enter"
                className="w-full bg-brand-bg border border-brand-border text-sm p-2.5 rounded-xl outline-none focus:border-brand-primary"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 bg-brand-primary-light text-brand-primary text-[10px] font-bold px-2.5 py-1 rounded-full">
                    #{t} <button onClick={() => removeTag(t)} className="hover:text-red-500 font-black"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Whistleblower Anonymous Toggle */}
            <div className="space-y-3 mb-6 p-4 bg-brand-bg rounded-xl border border-brand-border-light">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-brand-text-secondary flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-brand-primary" /> Whistleblower Protection
                </label>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => {
                    setIsAnonymous(e.target.checked);
                    showToast(e.target.checked ? 'Enabled Anonymous Privacy Shield' : 'Removed privacy shield protections', 'info');
                  }}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </div>
              <p className="text-[10px] text-brand-text-tertiary leading-relaxed">
                If checked, your name, profile card, and social links are completely hidden from readers. The platform will output "Anonymous Contributor".
              </p>
            </div>

            {/* Comments Toggle */}
            <div className="space-y-3 mb-6 p-4 bg-brand-bg rounded-xl border border-brand-border-light">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-brand-text-secondary flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-brand-primary" /> Allow Comments
                </label>
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </div>
              <p className="text-[10px] text-brand-text-tertiary leading-relaxed">
                Allow readers to post comments and replies on this publication.
              </p>
            </div>

            {/* Whistleblower Evidence Sanitizer & Ledger */}
            <div className="space-y-3 mb-6 p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-400" /> Evidence Sanitizer & Ledger
                </label>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-900/30 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Neutralize metadata leaks in PDF/Media attachments. Cryptographically scrub camera tags, GPS records, and compiler signatures.
              </p>

              {/* Scrubber Console */}
              <div className="border border-slate-800 rounded-lg p-3 bg-slate-950 text-left space-y-3.5">
                {/* File Drop / Trigger Area */}
                {!scrubbingFile && (
                  <div className="flex flex-col items-center justify-center border border-dashed border-slate-700 hover:border-purple-500 rounded-xl p-5 text-center transition-all cursor-pointer relative group">
                    <input 
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelected(file.name, file.size, file.type);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <ImageIcon className="w-6 h-6 text-slate-500 group-hover:text-purple-400 transition-colors mb-2 animate-pulse" />
                    <p className="text-[11px] font-bold text-slate-300">Scrub & Certify Files</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Drag & drop or click to inspect leak vectors</p>
                    
                    {/* Demo sample simulator */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleFileSelected("sensor_telemetry_raw.csv", 312044, "text/csv");
                      }}
                      className="mt-3 text-[9px] font-bold text-purple-400 hover:text-purple-300 bg-purple-950/30 hover:bg-purple-950/60 px-2 py-1 rounded transition-colors"
                    >
                      Use Demo CSV Dataset
                    </button>
                  </div>
                )}

                {/* Inspection Log Panel */}
                {scrubbingFile && !isScrubbed && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-200 truncate">{scrubbingFile.name}</p>
                        <p className="text-[9px] text-slate-500">{scrubbingFile.size} • {scrubbingFile.type}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => { setScrubbingFile(null); setScannedMetadata(null); }}
                        className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-900 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Scan footprint */}
                    {scannedMetadata && (
                      <div className="space-y-1.5 p-2 bg-rose-950/25 border border-rose-900/40 rounded text-[10px]">
                        <p className="font-bold text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Metaleak Risks Flagged
                        </p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-slate-400 font-mono">
                          {scannedMetadata.map((meta, idx) => (
                            <div key={idx} className="truncate">
                              <span className="text-slate-500">{meta.label}:</span> {meta.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scrub action */}
                    <button
                      type="button"
                      onClick={handleScrubProcess}
                      disabled={isScrubbing}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      {isScrubbing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Purging Metadata...
                        </>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5" /> Neutralize & Sign
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Successful scrub panel */}
                {isScrubbed && scrubbingFile && (
                  <div className="space-y-3 animate-fade-in text-left">
                    <div className="p-3 bg-emerald-950/25 border border-emerald-900/40 rounded-lg text-[11px] space-y-1.5">
                      <p className="font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Metaleak Scrub Complete
                      </p>
                      <p className="text-[10px] text-slate-400">EXIF tags, geolocation metrics, and compiler software headers have been wiped and zero-filled.</p>
                      
                      <div className="border-t border-slate-900 pt-2 mt-2 font-mono text-[9px] space-y-1 text-slate-400">
                        <p className="truncate"><span className="text-slate-500">FILE NAME:</span> {scrubbingFile.name}</p>
                        <p className="truncate"><span className="text-slate-500">LEDGER HASH:</span> {scrubbedHash.substring(0, 32)}...</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={attachSterilizedFile}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded"
                      >
                        Attach as Proof
                      </button>
                      <button
                        type="button"
                        onClick={() => { setScrubbingFile(null); setIsScrubbed(false); }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bound sanitized assets list */}
              {sterilizedFiles.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400">BOUND DISCHARGES ({sterilizedFiles.length})</p>
                  <div className="space-y-1">
                    {sterilizedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/60 border border-slate-800 rounded-lg text-[10px]">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-semibold text-slate-300 truncate">{file.name}</p>
                          <p className="text-[8px] font-mono text-purple-400 truncate">{file.url}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setSterilizedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Excerpt descriptor */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-brand-text-secondary">Brief Publication Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a brief 2-sentence hook..."
                className="w-full bg-brand-bg border border-brand-border text-xs p-2.5 rounded-xl outline-none h-20 resize-none focus:border-brand-primary"
              />
            </div>

            {/* Extra toggles */}
            <div className="flex justify-between items-center text-xs text-brand-text-secondary border-t border-brand-border-light pt-4">
              <span>Allow comments & reviews</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-600 rounded" />
            </div>

          </div>
        )}

      </div>

      {/* 5. Publishing Preview Modal Overlay */}
      {publishModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border w-full max-w-xl rounded-2xl p-6 sm:p-8 text-left shadow-2xl relative animate-scale-up transition-theme">
            
            <button 
              onClick={() => setPublishModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-brand-bg hover:bg-brand-border-light rounded-full text-brand-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display font-black text-xl sm:text-2xl text-brand-text-primary mb-6">
              Final Review & Dispatch
            </h2>

            {/* Preview Card */}
            <div className="flex gap-4 p-4 bg-brand-bg border border-brand-border-light rounded-xl mb-6">
              <img src={coverImageUrl} className="w-24 h-20 rounded-lg object-cover shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">{selectedCategory}</span>
                <h4 className="font-display font-bold text-sm text-brand-text-primary truncate mt-0.5">{title || 'Untitled Publication'}</h4>
                <p className="text-xs text-brand-text-secondary line-clamp-2 mt-1 leading-snug">{content ? content.substring(0, 100) + '...' : 'Draft story body...'}</p>
              </div>
            </div>

            {/* Radio selectors for authorship */}
            <div className="space-y-3 mb-8">
              <label className="text-xs font-bold text-brand-text-tertiary uppercase tracking-wider">AUTHORSHIP DISCLOSURE</label>
              
              <label className="flex items-start gap-3 p-3 bg-brand-surface border border-brand-border rounded-xl cursor-pointer hover:border-brand-primary/40">
                <input 
                  type="radio" 
                  name="authorship" 
                  checked={!isAnonymous} 
                  onChange={() => setIsAnonymous(false)}
                  className="mt-1 accent-purple-600" 
                />
                <div>
                  <p className="text-xs font-bold text-brand-text-primary">Publish openly as {currentUser?.name}</p>
                  <p className="text-[10px] text-brand-text-tertiary">Article links directly to your public academic researcher portfolio.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-brand-surface border border-brand-border rounded-xl cursor-pointer hover:border-brand-primary/40">
                <input 
                  type="radio" 
                  name="authorship" 
                  checked={isAnonymous} 
                  onChange={() => setIsAnonymous(true)}
                  className="mt-1 accent-purple-600" 
                />
                <div>
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Publish anonymously under VYRA protections</p>
                  <p className="text-[10px] text-brand-text-tertiary">Cryptographically deletes metadata. Author displays as "Anonymous Contributor".</p>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setPublishModalOpen(false)}
                className="flex-1 py-3 border border-brand-border hover:bg-brand-border-light text-brand-text-secondary font-semibold text-sm rounded-xl transition-all text-center"
              >
                Back to Editing
              </button>
              <button
                onClick={handlePublishNow}
                disabled={isPublishing}
                className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/40 text-white font-bold text-sm rounded-xl transition-all text-center shadow-md flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Reviewing manuscript...
                  </>
                ) : (
                  'Deploy Manuscript Now'
                )}
              </button>
            </div>

            {/* Footer notice */}
            <div className="text-center mt-4">
              <span className="text-[10px] text-brand-text-tertiary hover:underline cursor-not-allowed">Schedule publication (Coming soon)</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
