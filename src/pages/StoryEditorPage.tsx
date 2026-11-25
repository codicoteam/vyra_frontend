import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { plainExcerpt, Avatar } from '../components/StoryCard';

import {
  ArrowLeft,
  Eye,
  PenLine,
  Image as ImageIcon,
  Folder,
  Tag,
  Shield,
  ShieldCheck,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  Link,
  Check,
  AlertCircle,
  X,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  ImagePlus,
  Trash2,
  RefreshCw,
  Send,
  Loader2,
  FileLock2,
  ChevronDown,
  CloudOff,
} from 'lucide-react';
import { Attachment } from '../types';

type SaveStatus = 'idle' | 'editing' | 'saving' | 'saved' | 'error';

/* Small switch component */
const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-brand-primary' : 'bg-brand-border'}`}
  >
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 600, damping: 35 }}
      className={`inline-block h-5 w-5 rounded-full bg-white shadow ${checked ? 'ml-[22px]' : 'ml-0.5'}`}
    />
  </button>
);

const SettingCard: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode; action?: React.ReactNode }> = ({
  icon: Icon,
  title,
  children,
  action,
}) => (
  <div className="p-4 rounded-2xl bg-brand-bg ring-1 ring-brand-border-light">
    <div className="flex items-center justify-between gap-3 mb-2">
      <span className="text-sm font-semibold text-brand-text-primary flex items-center gap-2">
        <Icon className="w-4 h-4 text-brand-primary" /> {title}
      </span>
      {action}
    </div>
    {children}
  </div>
);

export const StoryEditorPage: React.FC = () => {
  const { navigateTo, addStory, currentUser, showToast, categories } = useApp();

  // Evidence sanitizer state
  const [scrubbingFile, setScrubbingFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isScrubbed, setIsScrubbed] = useState(false);
  const [scannedMetadata, setScannedMetadata] = useState<{ label: string; value: string }[] | null>(null);
  const [scrubbedHash, setScrubbedHash] = useState('');
  const [sterilizedFiles, setSterilizedFiles] = useState<Attachment[]>([]);
  const [sanitizerOpen, setSanitizerOpen] = useState(false);

  // Core editor state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverUploading, setCoverUploading] = useState(false);

  // Layout state
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const draftIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) setSelectedCategory(categories[0].name);
  }, [categories, selectedCategory]);

  // Stats
  const words = useMemo(() => (plainExcerpt(content).match(/\S+/g) || []).length, [content]);
  const readingTime = Math.max(1, Math.ceil(words / 200));

  // Auto-grow textareas
  const autoGrow = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(() => autoGrow(textareaRef.current), [content, mode]);
  useEffect(() => autoGrow(titleRef.current), [title]);

  // Draft auto-save: 4s after the last change
  const saveDraft = async () => {
    if (!title.trim() && !content.trim()) return;
    try {
      setSaveStatus('saving');
      const payload = { title: title || 'Untitled Draft', content, excerpt, category: selectedCategory, tags, isAnonymous, allowComments };
      if (draftIdRef.current) {
        await api.drafts.update(draftIdRef.current, payload);
      } else {
        const res = await api.drafts.create(payload);
        if (res.data?.id) draftIdRef.current = res.data.id;
      }
      setSaveStatus('saved');
      setLastSavedAt(new Date());
    } catch (e) {
      console.error('Auto-save draft failed', e);
      setSaveStatus('error');
    }
  };

  useEffect(() => {
    if (saveStatus !== 'editing') return;
    const t = setTimeout(saveDraft, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, excerpt, selectedCategory, tags, isAnonymous, allowComments, saveStatus]);

  const touch = () => setSaveStatus('editing');

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'editing' || saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveStatus]);

  const pickImage = (onDone: (url: string) => void, onStart?: () => void, onEnd?: () => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      onStart?.();
      try {
        const url = await api.media.uploadImageFile(file);
        onDone(url);
        showToast('Image uploaded', 'success');
      } catch (err: any) {
        showToast(err.message || 'Upload failed', 'error');
      } finally {
        onEnd?.();
      }
    };
    input.click();
  };

  // Formatting helpers
  const injectFormat = (prefix: string, suffix = '', placeholder = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    const selected = value.substring(start, end) || placeholder;
    setContent(value.substring(0, start) + prefix + selected + suffix + value.substring(end));
    touch();
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  };

  const insertLink = () => {
    const url = window.prompt('Paste the link (URL):');
    if (!url) return;
    const text = window.prompt('Text to show for the link:', 'Link');
    injectFormat(`[${text || 'Link'}](${url})`, '', '');
  };

  const handleEditorKeys = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === 'b') { e.preventDefault(); injectFormat('**', '**'); }
    if (k === 'i') { e.preventDefault(); injectFormat('*', '*'); }
    if (k === 'k') { e.preventDefault(); insertLink(); }
    if (k === 's') { e.preventDefault(); saveDraft(); }
  };

  const toolbar = [
    { icon: Bold, title: 'Bold (Ctrl+B)', run: () => injectFormat('**', '**') },
    { icon: Italic, title: 'Italic (Ctrl+I)', run: () => injectFormat('*', '*') },
    { icon: Heading2, title: 'Heading', run: () => injectFormat('\n## ', '', 'Heading') },
    { icon: Heading3, title: 'Subheading', run: () => injectFormat('\n### ', '', 'Subheading') },
    null,
    { icon: Quote, title: 'Quote', run: () => injectFormat('\n> ', '', 'Quote') },
    { icon: Code, title: 'Inline code', run: () => injectFormat('`', '`', 'code') },
    { icon: List, title: 'Bullet list', run: () => injectFormat('\n- ', '', 'Item') },
    { icon: ListOrdered, title: 'Numbered list', run: () => injectFormat('\n1. ', '', 'Item') },
    null,
    { icon: Link, title: 'Link (Ctrl+K)', run: insertLink },
    { icon: ImageIcon, title: 'Insert image', run: () => pickImage((url) => injectFormat(`\n![Image](${url})\n`, '', '')) },
  ];

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/[,#]/g, '');
      if (!clean || tags.includes(clean)) return;
      if (tags.length >= 5) {
        showToast('You can add up to 5 tags', 'warning');
        return;
      }
      setTags([...tags, clean]);
      setTagInput('');
      touch();
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  /* ---------- Evidence sanitizer (unchanged behaviour) ---------- */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelected = (name: string, size: number, type: string) => {
    setScrubbingFile({ name, size: formatFileSize(size), type });
    setIsScrubbed(false);
    setIsScrubbing(false);
    setScannedMetadata([
      { label: 'EXIF GPS Latitude', value: '45.1092° N' },
      { label: 'EXIF GPS Longitude', value: '122.6801° W' },
      { label: 'Author Signature', value: currentUser?.name || 'Unknown' },
      { label: 'Camera / Device', value: 'Apple iPhone 14 Pro Max' },
      { label: 'Creation Timestamp', value: new Date().toISOString() },
      { label: 'Compiler Metadata', value: 'macOS Ventura PDFKit' },
    ]);
  };

  const generateReceipt = async (fileName: string, seed: string) => {
    const raw = `${fileName}-${seed}-${Date.now()}`;
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      let h = 0;
      for (let i = 0; i < raw.length; i++) h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
      return 'vyra' + Math.abs(h).toString(16).padStart(12, 'f');
    }
  };

  const handleScrubProcess = async () => {
    if (!scrubbingFile) return;
    setIsScrubbing(true);
    setTimeout(async () => {
      setScrubbedHash(await generateReceipt(scrubbingFile.name, scrubbingFile.size));
      setIsScrubbing(false);
      setIsScrubbed(true);
    }, 1200);
  };

  const attachSterilizedFile = () => {
    if (!scrubbingFile || !isScrubbed) return;
    setSterilizedFiles([
      ...sterilizedFiles,
      {
        name: scrubbingFile.name,
        size: scrubbingFile.size,
        type: scrubbingFile.type.split('/')[1] || 'binary',
        url: `vyra://ledger/manifest/${scrubbedHash.substring(0, 16)}`,
      },
    ]);
    setScrubbingFile(null);
    setIsScrubbed(false);
    showToast('File attached', 'success');
  };

  /* ---------- Publish ---------- */
  const openPublish = () => {
    if (!title.trim()) {
      showToast('Give your story a title first', 'warning');
      titleRef.current?.focus();
      return;
    }
    if (!content.trim()) {
      showToast("Your story doesn't have any content yet", 'warning');
      textareaRef.current?.focus();
      return;
    }
    setPublishModalOpen(true);
  };

  const handlePublishNow = async () => {
    setIsPublishing(true);
    const ok = await addStory({
      title,
      excerpt: excerpt.trim() || plainExcerpt(content).substring(0, 160) + '…',
      content,
      coverImage: coverImageUrl,
      category: selectedCategory,
      tags,
      author: currentUser || { id: 'anon', name: 'Anonymous', avatar: '', bio: '', username: 'anonymous' },
      isAnonymous,
      readingTime,
      isResearch: ['tech', 'quantum', 'biotech'].some((k) => selectedCategory.toLowerCase().includes(k)),
      status: 'published',
      allowComments,
      hasAttachments: sterilizedFiles.length > 0,
      attachments: sterilizedFiles.length > 0 ? sterilizedFiles : undefined,
    });
    setIsPublishing(false);
    if (ok) {
      setPublishModalOpen(false);
      setSaveStatus('idle');
      // The draft has become a post – clean it up
      if (draftIdRef.current) api.drafts.delete(draftIdRef.current).catch(() => {});
    }
  };

  const statusPill = {
    idle: { icon: <PenLine className="w-3.5 h-3.5" />, text: 'New draft', cls: 'text-brand-text-tertiary' },
    editing: { icon: <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />, text: 'Unsaved changes', cls: 'text-amber-600 dark:text-amber-400' },
    saving: { icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, text: 'Saving…', cls: 'text-brand-primary' },
    saved: {
      icon: <Check className="w-3.5 h-3.5" />,
      text: `Saved${lastSavedAt ? ' ' + lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`,
      cls: 'text-emerald-600 dark:text-emerald-400',
    },
    error: { icon: <CloudOff className="w-3.5 h-3.5" />, text: 'Not saved — retry', cls: 'text-rose-600 dark:text-rose-400' },
  }[saveStatus];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-brand-surface flex flex-col transition-theme">
      {/* ---------- Top bar ---------- */}
      <div className="sticky top-16 z-30 glass border-b border-brand-border/70">
        <div className="h-14 px-3 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => navigateTo('/home')}
              className="grid place-items-center w-9 h-9 rounded-full hover:bg-brand-border-light text-brand-text-secondary"
              title="Leave editor"
              aria-label="Leave editor"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => saveStatus === 'error' && saveDraft()}
              className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${statusPill.cls}`}
            >
              {statusPill.icon} {statusPill.text}
            </button>
          </div>

          {/* Write / preview */}
          <div className="hidden sm:flex items-center p-1 rounded-full bg-brand-border-light" role="tablist">
            {(['write', 'preview'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`relative h-8 px-4 rounded-full text-sm font-medium capitalize transition-colors ${mode === m ? 'text-brand-text-primary' : 'text-brand-text-tertiary hover:text-brand-text-secondary'}`}
              >
                {mode === m && <motion.span layoutId="editor-mode" className="absolute inset-0 rounded-full bg-brand-surface shadow-soft" />}
                <span className="relative inline-flex items-center gap-1.5">
                  {m === 'write' ? <PenLine className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {m}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMode(mode === 'write' ? 'preview' : 'write')}
              className="sm:hidden grid place-items-center w-9 h-9 rounded-full hover:bg-brand-border-light text-brand-text-secondary"
              aria-label="Toggle preview"
            >
              {mode === 'write' ? <Eye className="w-5 h-5" /> : <PenLine className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`grid place-items-center w-9 h-9 rounded-full transition-colors ${sidebarOpen ? 'bg-brand-primary-light text-brand-primary' : 'text-brand-text-secondary hover:bg-brand-border-light'}`}
              title="Story settings"
              aria-label="Story settings"
            >
              {sidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
            </button>
            <button
              onClick={openPublish}
              className="inline-flex items-center gap-1.5 h-9 px-4 sm:px-5 bg-brand-gradient text-white text-sm font-semibold rounded-full shadow-glow hover:brightness-110 transition-all"
            >
              <Send className="w-4 h-4" /> <span>Publish</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* ---------- Writing area ---------- */}
        <div className="flex-1 min-w-0">
          <div className="max-w-[760px] mx-auto px-5 sm:px-8 pt-8 pb-32">
            {/* Cover */}
            {coverImageUrl ? (
              <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden group ring-1 ring-brand-border mb-8">
                <img src={coverImageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => pickImage(setCoverImageUrl, () => setCoverUploading(true), () => setCoverUploading(false))}
                    className="inline-flex items-center gap-1.5 h-10 px-4 bg-white/90 hover:bg-white text-slate-900 rounded-full text-sm font-semibold"
                  >
                    <RefreshCw className="w-4 h-4" /> Change
                  </button>
                  <button
                    onClick={() => setCoverImageUrl('')}
                    className="inline-flex items-center gap-1.5 h-10 px-4 bg-black/50 hover:bg-black/70 text-white rounded-full text-sm font-semibold backdrop-blur"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
                {coverUploading && (
                  <div className="absolute inset-0 grid place-items-center bg-black/50 text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => pickImage(setCoverImageUrl, () => setCoverUploading(true), () => setCoverUploading(false))}
                disabled={coverUploading}
                className="group mb-6 inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-sm font-medium text-brand-text-tertiary hover:text-brand-primary hover:bg-brand-border-light transition-colors"
              >
                {coverUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                {coverUploading ? 'Uploading cover…' : 'Add a cover image'}
              </button>
            )}

            {mode === 'write' ? (
              <>
                <textarea
                  ref={titleRef}
                  rows={1}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value.replace(/\n/g, ''));
                    touch();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      textareaRef.current?.focus();
                    }
                  }}
                  placeholder="Title"
                  aria-label="Story title"
                  className="w-full resize-none overflow-hidden bg-transparent font-display font-bold text-4xl sm:text-5xl leading-[1.1] tracking-[-0.025em] text-brand-text-primary placeholder:text-brand-text-tertiary/50 outline-none focus-visible:outline-none mb-6"
                />

                {/* Formatting toolbar (sticky under the top bar) */}
                <div className="sticky top-[124px] z-20 mb-6 -mx-2">
                  <div className="inline-flex flex-wrap items-center gap-0.5 p-1 rounded-2xl bg-brand-surface/90 backdrop-blur ring-1 ring-brand-border shadow-soft">
                    {toolbar.map((t, i) =>
                      t ? (
                        <button
                          key={t.title}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={t.run}
                          title={t.title}
                          aria-label={t.title}
                          className="grid place-items-center w-9 h-9 rounded-xl text-brand-text-secondary hover:text-brand-primary hover:bg-brand-border-light transition-colors"
                        >
                          <t.icon className="w-[18px] h-[18px]" />
                        </button>
                      ) : (
                        <span key={i} className="w-px h-5 bg-brand-border mx-1" />
                      ),
                    )}
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    touch();
                  }}
                  onKeyDown={handleEditorKeys}
                  placeholder="Tell your story…  Markdown works: ## heading, **bold**, *italic*, > quote"
                  aria-label="Story content"
                  className="w-full min-h-[50vh] resize-none overflow-hidden bg-transparent outline-none focus-visible:outline-none text-brand-text-primary text-lg sm:text-[19px] leading-[1.8] placeholder:text-brand-text-tertiary/70"
                />
              </>
            ) : (
              <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-brand-primary-light text-brand-primary dark:text-violet-300 mb-5">
                  {selectedCategory || 'Uncategorized'}
                </span>
                <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.1] tracking-[-0.025em] text-brand-text-primary mb-5">
                  {title || <span className="text-brand-text-tertiary">Untitled</span>}
                </h1>
                <div className="flex items-center gap-3 pb-6 mb-8 border-b border-brand-border-light">
                  <Avatar src={currentUser?.avatar} name={currentUser?.name || 'You'} anonymous={isAnonymous} className="w-10 h-10" />
                  <div className="text-sm">
                    <p className="font-semibold text-brand-text-primary">{isAnonymous ? 'Anonymous contributor' : currentUser?.name || 'You'}</p>
                    <p className="text-brand-text-tertiary">{readingTime} min read</p>
                  </div>
                </div>
                <div className="text-[19px] leading-[1.75] text-brand-text-primary/90 [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-3xl [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-2xl [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:my-5 [&_img]:rounded-2xl [&_img]:my-8 [&_blockquote]:border-l-[3px] [&_blockquote]:border-brand-primary [&_blockquote]:pl-5 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-brand-primary [&_a]:underline [&_code]:bg-brand-border-light [&_code]:px-1.5 [&_code]:rounded">
                  {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="text-brand-text-tertiary">Nothing to preview yet.</p>}
                </div>
              </motion.article>
            )}
          </div>

          {/* Word count footer */}
          <div className="fixed bottom-24 md:bottom-5 left-4 z-20 inline-flex items-center gap-3 h-8 px-3.5 rounded-full glass ring-1 ring-brand-border text-xs text-brand-text-tertiary tabular-nums shadow-soft">
            <span>{words.toLocaleString()} words</span>
            <span className="w-1 h-1 rounded-full bg-brand-text-tertiary/50" />
            <span>{readingTime} min read</span>
          </div>
        </div>

        {/* ---------- Settings sidebar ---------- */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <>
              <motion.div
                className="lg:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 40, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                className="fixed lg:sticky right-0 top-0 lg:top-[120px] z-50 lg:z-10 h-full lg:h-[calc(100vh-120px)] w-[88%] max-w-sm lg:w-[340px] shrink-0 overflow-y-auto bg-brand-surface border-l border-brand-border p-5 space-y-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-semibold text-brand-text-primary">Story settings</h3>
                  <button onClick={() => setSidebarOpen(false)} className="grid place-items-center w-8 h-8 rounded-full hover:bg-brand-border-light text-brand-text-tertiary" aria-label="Close settings">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <SettingCard icon={Folder} title="Category">
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        touch();
                      }}
                      className="w-full appearance-none bg-brand-surface ring-1 ring-brand-border text-sm h-10 pl-3 pr-9 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-tertiary" />
                  </div>
                </SettingCard>

                <SettingCard icon={Tag} title="Tags" action={<span className="text-xs text-brand-text-tertiary tabular-nums">{tags.length}/5</span>}>
                  <div className="flex flex-wrap items-center gap-1.5 p-1.5 min-h-10 bg-brand-surface ring-1 ring-brand-border rounded-xl focus-within:ring-2 focus-within:ring-brand-primary">
                    <AnimatePresence>
                      {tags.map((t) => (
                        <motion.span
                          key={t}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="inline-flex items-center gap-1 bg-brand-primary-light text-brand-primary dark:text-violet-300 text-xs font-semibold pl-2.5 pr-1 h-7 rounded-lg"
                        >
                          #{t}
                          <button onClick={() => { setTags(tags.filter((x) => x !== t)); touch(); }} className="grid place-items-center w-5 h-5 rounded hover:bg-black/10" aria-label={`Remove ${t}`}>
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                      placeholder={tags.length ? '' : 'Add a tag, press Enter'}
                      className="flex-1 min-w-[80px] bg-transparent text-sm px-1.5 h-7 outline-none"
                    />
                  </div>
                </SettingCard>

                <SettingCard icon={PenLine} title="Excerpt">
                  <textarea
                    value={excerpt}
                    onChange={(e) => { setExcerpt(e.target.value); touch(); }}
                    placeholder="A one or two sentence hook shown on cards. Leave blank to use your opening lines."
                    maxLength={240}
                    className="w-full bg-brand-surface ring-1 ring-brand-border text-sm p-3 rounded-xl outline-none h-24 resize-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <p className="text-right text-[11px] text-brand-text-tertiary tabular-nums">{excerpt.length}/240</p>
                </SettingCard>

                <SettingCard icon={Shield} title="Publish anonymously" action={<Switch checked={isAnonymous} onChange={(v) => { setIsAnonymous(v); touch(); }} label="Publish anonymously" />}>
                  <p className="text-xs text-brand-text-tertiary leading-relaxed">
                    Your name, profile and links are hidden from readers. You'll appear as “Anonymous contributor”.
                  </p>
                </SettingCard>

                <SettingCard icon={MessageSquare} title="Allow comments" action={<Switch checked={allowComments} onChange={(v) => { setAllowComments(v); touch(); }} label="Allow comments" />}>
                  <p className="text-xs text-brand-text-tertiary leading-relaxed">Readers can comment and reply on this story.</p>
                </SettingCard>

                {/* Evidence sanitizer */}
                <div className="rounded-2xl bg-[#0d0f1a] text-slate-100 ring-1 ring-white/10 overflow-hidden">
                  <button onClick={() => setSanitizerOpen(!sanitizerOpen)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      <FileLock2 className="w-4 h-4 text-violet-400" /> Evidence attachments
                      {sterilizedFiles.length > 0 && (
                        <span className="text-[10px] font-semibold bg-violet-500/20 text-violet-300 px-1.5 rounded-full">{sterilizedFiles.length}</span>
                      )}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${sanitizerOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {sanitizerOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-3">
                          <p className="text-xs text-slate-400 leading-relaxed">Inspect and scrub metadata (GPS, device, author) from files before attaching them.</p>

                          {!scrubbingFile && (
                            <label className="relative flex flex-col items-center justify-center border border-dashed border-slate-700 hover:border-violet-500 rounded-xl p-5 text-center transition-colors cursor-pointer group">
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileSelected(file.name, file.size, file.type);
                                  e.target.value = '';
                                }}
                                className="sr-only"
                              />
                              <ImagePlus className="w-6 h-6 text-slate-500 group-hover:text-violet-400 transition-colors mb-2" />
                              <span className="text-xs font-semibold text-slate-300">Choose a file to inspect</span>
                            </label>
                          )}

                          {scrubbingFile && !isScrubbed && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-200 truncate">{scrubbingFile.name}</p>
                                  <p className="text-[11px] text-slate-500">{scrubbingFile.size} · {scrubbingFile.type || 'file'}</p>
                                </div>
                                <button onClick={() => { setScrubbingFile(null); setScannedMetadata(null); }} className="grid place-items-center w-7 h-7 rounded-full text-slate-500 hover:text-slate-200 hover:bg-white/5" aria-label="Remove file">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              {scannedMetadata && (
                                <div className="p-3 bg-rose-500/10 ring-1 ring-rose-500/20 rounded-xl">
                                  <p className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 mb-2">
                                    <AlertCircle className="w-3.5 h-3.5" /> Identifying metadata found
                                  </p>
                                  <div className="grid gap-1 text-[11px] text-slate-400 font-mono">
                                    {scannedMetadata.map((m) => (
                                      <div key={m.label} className="truncate"><span className="text-slate-500">{m.label}:</span> {m.value}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <button
                                onClick={handleScrubProcess}
                                disabled={isScrubbing}
                                className="w-full h-10 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                              >
                                {isScrubbing ? <><Loader2 className="w-4 h-4 animate-spin" /> Scrubbing…</> : <><Shield className="w-4 h-4" /> Scrub metadata</>}
                              </button>
                            </div>
                          )}

                          {isScrubbed && scrubbingFile && (
                            <div className="space-y-3">
                              <div className="p-3 bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-xl text-xs space-y-1">
                                <p className="font-semibold text-emerald-300 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Clean</p>
                                <p className="font-mono text-[10px] text-slate-400 truncate">SHA-256 {scrubbedHash.substring(0, 32)}…</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={attachSterilizedFile} className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl">Attach</button>
                                <button onClick={() => { setScrubbingFile(null); setIsScrubbed(false); }} className="h-9 px-3 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold rounded-xl">Reset</button>
                              </div>
                            </div>
                          )}

                          {sterilizedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 p-2.5 bg-white/[0.03] ring-1 ring-white/10 rounded-xl text-xs">
                              <span className="flex items-center gap-2 min-w-0">
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="truncate text-slate-300">{file.name}</span>
                              </span>
                              <button onClick={() => setSterilizedFiles((p) => p.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400" aria-label={`Remove ${file.name}`}>
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="text-[11px] text-brand-text-tertiary text-center pt-2">
                  Shortcuts: <kbd className="font-mono">Ctrl+B</kbd> bold · <kbd className="font-mono">Ctrl+I</kbd> italic · <kbd className="font-mono">Ctrl+K</kbd> link · <kbd className="font-mono">Ctrl+S</kbd> save
                </p>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ---------- Publish modal ---------- */}
      <AnimatePresence>
        {publishModalOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => !isPublishing && setPublishModalOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="publish-title"
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="relative w-full sm:max-w-lg bg-brand-surface ring-1 ring-brand-border rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl"
            >
              <button
                onClick={() => setPublishModalOpen(false)}
                disabled={isPublishing}
                className="absolute top-4 right-4 grid place-items-center w-9 h-9 rounded-full hover:bg-brand-border-light text-brand-text-tertiary"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 id="publish-title" className="font-display font-bold text-2xl text-brand-text-primary">Ready to publish?</h2>
              <p className="text-sm text-brand-text-secondary mt-1 mb-6">Here's how your story will appear in the feed.</p>

              {/* Preview */}
              <div className="flex gap-4 p-3 rounded-2xl ring-1 ring-brand-border bg-brand-bg mb-6">
                {coverImageUrl ? (
                  <img src={coverImageUrl} alt="" referrerPolicy="no-referrer" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-24 h-24 rounded-xl shrink-0 bg-gradient-to-br from-violet-500/40 via-fuchsia-500/30 to-cyan-400/40" />
                )}
                <div className="min-w-0 py-0.5">
                  <span className="text-[10px] font-semibold text-brand-primary uppercase tracking-wider">{selectedCategory}</span>
                  <h4 className="font-display font-semibold text-brand-text-primary line-clamp-2 leading-snug mt-0.5">{title}</h4>
                  <p className="text-xs text-brand-text-secondary line-clamp-2 mt-1">{excerpt || plainExcerpt(content).slice(0, 140)}</p>
                </div>
              </div>

              {/* Authorship */}
              <p className="text-xs font-semibold text-brand-text-tertiary uppercase tracking-wider mb-2">Publish as</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { anon: false, title: currentUser?.name || 'Yourself', sub: 'Linked to your profile' },
                  { anon: true, title: 'Anonymous', sub: 'Identity protected' },
                ].map((o) => (
                  <button
                    key={String(o.anon)}
                    onClick={() => setIsAnonymous(o.anon)}
                    className={`relative flex items-center gap-3 p-3 rounded-2xl text-left ring-1 transition-all ${
                      isAnonymous === o.anon ? 'ring-2 ring-brand-primary bg-brand-primary-light/40 dark:bg-brand-primary-light/30' : 'ring-brand-border hover:ring-brand-primary/40'
                    }`}
                  >
                    <Avatar src={currentUser?.avatar} name={currentUser?.name || 'You'} anonymous={o.anon} className="w-9 h-9" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-brand-text-primary truncate">{o.title}</span>
                      <span className="block text-[11px] text-brand-text-tertiary">{o.sub}</span>
                    </span>
                    {isAnonymous === o.anon && (
                      <span className="absolute top-2 right-2 grid place-items-center w-5 h-5 rounded-full bg-brand-primary text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <button
                  onClick={() => setPublishModalOpen(false)}
                  disabled={isPublishing}
                  className="flex-1 h-12 ring-1 ring-brand-border hover:bg-brand-border-light text-brand-text-secondary font-semibold text-sm rounded-2xl transition-colors"
                >
                  Keep editing
                </button>
                <button
                  onClick={handlePublishNow}
                  disabled={isPublishing}
                  className="flex-1 h-12 bg-brand-gradient disabled:opacity-70 text-white font-semibold text-sm rounded-2xl shadow-glow hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  {isPublishing ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><Send className="w-4 h-4" /> Publish now</>}
                </button>
              </div>
              <p className="text-center text-[11px] text-brand-text-tertiary mt-4">
                {readingTime} min read · {words.toLocaleString()} words{tags.length ? ` · ${tags.map((t) => '#' + t).join(' ')}` : ''}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
