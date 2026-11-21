import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  Code, 
  List, 
  ListOrdered, 
  Link, 
  Image as ImageIcon, 
  Table, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Lock, 
  Eye, 
  Columns, 
  FileEdit, 
  Send, 
  Wand2, 
  RefreshCw, 
  ChevronRight,
  ExternalLink,
  Sliders,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MarkdownViewer from '../components/MarkdownViewer';
import { getAiSuggestion, auditSeoData, createPost } from '../services/api';

export default function EditorView({ onPublished, onOpenApiKeyModal }) {
  // Post state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Artificial Intelligence');
  const [tags, setTags] = useState('React, AI, WebDev');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [slug, setSlug] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [tierRequired, setTierRequired] = useState('pro'); // 'free' | 'pro' | 'vip'
  const [previewWordLimit, setPreviewWordLimit] = useState(120);

  // Editor layout & tab state
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'edit' | 'preview'
  const [activeSidebarTab, setActiveSidebarTab] = useState('ai'); // 'ai' | 'seo' | 'monetization'
  const [publishing, setPublishing] = useState(false);

  // AI Assistant state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiAction, setAiAction] = useState('generate-titles');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [aiProvider, setAiProvider] = useState('');

  // SEO Audit state
  const [seoScore, setSeoScore] = useState(75);
  const [seoChecks, setSeoChecks] = useState([]);
  const [seoStats, setSeoStats] = useState({ wordCount: 0, keywordDensity: 0 });
  const [seoAuditLoading, setSeoAuditLoading] = useState(false);

  const textareaRef = useRef(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [title]);

  // Real-time SEO auditing debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await auditSeoData({
          title,
          content,
          metaTitle,
          metaDescription,
          focusKeyword,
          slug
        });
        if (res.success) {
          setSeoScore(res.data.score);
          setSeoChecks(res.data.checks || []);
          setSeoStats(res.data.stats || {});
        }
      } catch (err) {
        console.error('SEO audit error:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, content, metaTitle, metaDescription, focusKeyword, slug]);

  // Formatting helpers for Markdown textarea
  const insertFormatting = (prefix, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  // AI Assistant trigger
  const handleAiAction = async (actionType) => {
    setAiLoading(true);
    setAiAction(actionType);
    try {
      const res = await getAiSuggestion({
        action: actionType,
        title: title || 'Modern AI Web Development',
        topic: title || 'Full-Stack Modern Web Architecture',
        content,
        tone: aiTone,
        focusKeyword: focusKeyword || 'web performance',
        customPrompt
      });

      if (res.success) {
        setAiSuggestions(res.data);
        setAiProvider(res.provider || 'Built-in Engine');

        // Auto apply if summary
        if (actionType === 'generate-summary' && res.data?.metaDescription) {
          setMetaDescription(res.data.metaDescription);
        }
      }
    } catch (err) {
      alert('AI Assistant error: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Publish Handler
  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please provide both a title and content before publishing.');
      return;
    }

    setPublishing(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: metaDescription || content.slice(0, 160).replace(/[#*`_]/g, ''),
        content: content.trim(),
        coverImage,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        seo: {
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || content.slice(0, 160),
          focusKeyword,
          seoScore
        },
        monetization: {
          isPremium,
          tierRequired: isPremium ? tierRequired : 'free',
          previewWordLimit: Number(previewWordLimit)
        },
        published: true
      };

      const res = await createPost(payload);
      if (res.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
        alert('🎉 Article published successfully with live SEO and SSR indexing!');
        if (onPublished) onPublished(res.data.slug);
      }
    } catch (err) {
      alert('Failed to publish post: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  // Quick stats
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Markdown Content Studio</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              AI Powered
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Write with live split preview, OpenAI suggestions, real-time SEO grading & subscriber paywalls.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* View mode buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded-lg flex items-center gap-1 ${viewMode === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              title="Editor Only"
            >
              <FileEdit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg flex items-center gap-1 ${viewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-lg flex items-center gap-1 ${viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              title="Preview Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{publishing ? 'Publishing...' : 'Publish Article'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Editor & Right Studio Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Title & Markdown Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Article Title Input */}
          <input
            type="text"
            placeholder="Article Title (e.g. Building High-Performance Express SSR Applications)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-lg sm:text-xl font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
          />

          {/* Formatting Toolbar */}
          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center gap-1 text-slate-300">
            <button
              onClick={() => insertFormatting('# ', '', 'Heading 1')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('## ', '', 'Heading 2')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('### ', '', 'Heading 3')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <span className="w-px h-4 bg-slate-800 mx-1" />
            <button
              onClick={() => insertFormatting('**', '**', 'bold text')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('*', '*', 'italic text')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('> ', '', 'Quote note')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('`', '`', 'code')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('```javascript\n', '\n```', '// code block')}
              className="px-2 py-1 text-xs font-mono rounded hover:bg-slate-800 hover:text-white"
              title="Code Block"
            >
              &lt;/&gt;
            </button>
            <span className="w-px h-4 bg-slate-800 mx-1" />
            <button
              onClick={() => insertFormatting('- ', '', 'List item')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('1. ', '', 'Numbered item')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('[', '](https://example.com)', 'Link text')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
              title="Insert Link"
            >
              <Link className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('![Alt description](', ')', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
              title="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('| Header 1 | Header 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
              title="Insert Markdown Table"
            >
              <Table className="w-4 h-4" />
            </button>

            {/* AI Outline shortcut */}
            <button
              onClick={() => handleAiAction('generate-outline')}
              className="ml-auto px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-xs font-semibold flex items-center gap-1 border border-indigo-500/30"
              title="Generate article outline with AI"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Outline</span>
            </button>
          </div>

          {/* Editor / Live Preview Container */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl min-h-[520px] flex flex-col">
            
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 flex-1">
              {/* Markdown Input Area */}
              {(viewMode === 'split' || viewMode === 'edit') && (
                <div className={`${viewMode === 'edit' ? 'col-span-2' : ''} p-4 flex flex-col`}>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Markdown Source</span>
                    <span>Supports GFM</span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your article in Markdown here... Use ## for subheadings, ``` for code blocks, and > for quotes. Or use the AI assistant on the right to draft your content!"
                    className="w-full flex-1 min-h-[460px] bg-transparent text-slate-200 placeholder-slate-600 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                  />
                </div>
              )}

              {/* Live Preview Area */}
              {(viewMode === 'split' || viewMode === 'preview') && (
                <div className={`${viewMode === 'preview' ? 'col-span-2' : ''} p-4 bg-slate-950/60 overflow-y-auto max-h-[580px]`}>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Live Rendered Preview</span>
                    <span className="text-emerald-400 font-mono">Real-time</span>
                  </div>
                  {content.trim() ? (
                    <MarkdownViewer content={content} />
                  ) : (
                    <div className="text-slate-600 text-sm italic py-20 text-center">
                      Markdown preview will appear here in real time...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Bar: Word Counter & SEO Indicators */}
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span><strong>{words}</strong> words</span>
                <span><strong>{chars}</strong> characters</span>
                <span>~<strong>{readTime}</strong> min read</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${seoScore >= 80 ? 'bg-emerald-400' : seoScore >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  <span>SEO Score: <strong>{seoScore}/100</strong></span>
                </span>
                {isPremium && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                    Paywalled ({tierRequired.toUpperCase()})
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Metadata Collapsible Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Post Settings & Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Design Systems">Design Systems</option>
                  <option value="Monetization">Monetization</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="React, AI, Express, NodeJS"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Custom Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="post-slug-url"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Assistant, SEO Auditor & Monetization (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Sidebar Tab Switcher */}
          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveSidebarTab('ai')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeSidebarTab === 'ai' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Tools</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('seo')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeSidebarTab === 'seo' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>SEO Audit</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('monetization')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeSidebarTab === 'monetization' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Paywall</span>
            </button>
          </div>

          {/* TAB 1: AI WRITING ASSISTANT */}
          {activeSidebarTab === 'ai' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">AI Content Co-Pilot</h3>
                </div>
                <button
                  onClick={onOpenApiKeyModal}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  Key Settings
                </button>
              </div>

              {/* Quick AI Action Buttons */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  One-Click Suggestions:
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAiAction('generate-titles')}
                    disabled={aiLoading}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left text-xs text-slate-200 transition-colors"
                  >
                    💡 <strong className="text-white">Title Ideas</strong>
                    <div className="text-[10px] text-slate-500">5 high-CTR titles</div>
                  </button>

                  <button
                    onClick={() => handleAiAction('generate-outline')}
                    disabled={aiLoading}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left text-xs text-slate-200 transition-colors"
                  >
                    📝 <strong className="text-white">Full Outline</strong>
                    <div className="text-[10px] text-slate-500">Structured sections</div>
                  </button>

                  <button
                    onClick={() => handleAiAction('expand-paragraph')}
                    disabled={aiLoading}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left text-xs text-slate-200 transition-colors"
                  >
                    ✍️ <strong className="text-white">Expand & Draft</strong>
                    <div className="text-[10px] text-slate-500">Continue writing</div>
                  </button>

                  <button
                    onClick={() => handleAiAction('polish')}
                    disabled={aiLoading}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left text-xs text-slate-200 transition-colors"
                  >
                    ✨ <strong className="text-white">Polish & Fix</strong>
                    <div className="text-[10px] text-slate-500">Grammar & clarity</div>
                  </button>

                  <button
                    onClick={() => handleAiAction('generate-summary')}
                    disabled={aiLoading}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left text-xs text-slate-200 transition-colors"
                  >
                    📑 <strong className="text-white">SEO Excerpt</strong>
                    <div className="text-[10px] text-slate-500">150-char meta desc</div>
                  </button>

                  <button
                    onClick={() => handleAiAction('generate-tags')}
                    disabled={aiLoading}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left text-xs text-slate-200 transition-colors"
                  >
                    🏷️ <strong className="text-white">Suggest Tags</strong>
                    <div className="text-[10px] text-slate-500">High search tags</div>
                  </button>
                </div>
              </div>

              {/* Tone Adjuster */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tone Style:
                </label>
                <div className="flex flex-wrap gap-1">
                  {['professional', 'conversational', 'technical', 'persuasive'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setAiTone(t)}
                      className={`px-2 py-1 rounded-lg text-[11px] capitalize border transition-all ${
                        aiTone === t
                          ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Freeform Prompt */}
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ask AI anything (e.g. Add a benchmark table)..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiAction('custom-prompt')}
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleAiAction('custom-prompt')}
                    disabled={aiLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* AI Output / Result Area */}
              {aiLoading ? (
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Consulting AI Co-Pilot...</p>
                </div>
              ) : aiSuggestions ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 max-h-72 overflow-y-auto">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Generated Response:</span>
                    <span className="text-indigo-400 font-mono">{aiProvider}</span>
                  </div>

                  {Array.isArray(aiSuggestions) ? (
                    <div className="space-y-1.5">
                      {aiSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            if (aiAction === 'generate-titles') setTitle(item);
                            if (aiAction === 'generate-tags') setTags(aiSuggestions.join(', '));
                          }}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 text-xs text-slate-200 cursor-pointer transition-colors flex items-center justify-between group"
                        >
                          <span>{item}</span>
                          <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100">
                            Apply &rarr;
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : typeof aiSuggestions === 'object' && aiSuggestions !== null ? (
                    <div className="text-xs text-slate-300 space-y-1">
                      {aiSuggestions.metaDescription && (
                        <div>
                          <strong>Meta Description:</strong>
                          <p className="text-slate-400 mt-0.5">{aiSuggestions.metaDescription}</p>
                        </div>
                      )}
                      {aiSuggestions.excerpt && (
                        <div className="mt-2">
                          <strong>Excerpt:</strong>
                          <p className="text-slate-400 mt-0.5">{aiSuggestions.excerpt}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans bg-transparent p-0">
                        {aiSuggestions}
                      </pre>
                      <button
                        onClick={() => insertFormatting('\n\n' + aiSuggestions + '\n\n')}
                        className="mt-2 w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                      >
                        Insert into Editor
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 2: SEO AUDIT PANEL */}
          {activeSidebarTab === 'seo' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">SEO Score & Checklist</h3>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {seoScore}/100
                </div>
              </div>

              {/* Focus Keyword Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Focus Keyword:
                </label>
                <input
                  type="text"
                  placeholder="e.g. react 19 ssr"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {focusKeyword && (
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>Density: <strong>{seoStats.keywordDensity || 0}%</strong></span>
                    <span>Target: <strong>1.0% - 2.5%</strong></span>
                  </div>
                )}
              </div>

              {/* Meta Description Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Meta Description ({metaDescription.length}/160):
                </label>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Concise summary for search engine snippets (aim for 120-160 chars)..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Live SEO Checklist */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Audit Checklist:
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {seoChecks.map((check, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs flex items-start gap-2"
                    >
                      {check.status === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className={`font-semibold ${check.status === 'success' ? 'text-slate-200' : 'text-amber-300'}`}>
                          {check.label}
                        </div>
                        <div className="text-[11px] text-slate-400">{check.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Search Result Preview */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Google Search Snippet Preview:
                </div>
                <div className="text-xs text-emerald-400 truncate">
                  https://aiblogplatform.io &rsaquo; post &rsaquo; {slug || 'your-slug'}
                </div>
                <div className="text-sm font-semibold text-indigo-400 line-clamp-1">
                  {metaTitle || title || 'Your Article Title'}
                </div>
                <div className="text-xs text-slate-400 line-clamp-2">
                  {metaDescription || content.slice(0, 140) || 'Article description will appear in Google search results here.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER SUBSCRIPTION & MONETIZATION */}
          {activeSidebarTab === 'monetization' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Monetization & Paywall</h3>
                </div>
                <span className="text-[10px] text-slate-400">Subscription Gates</span>
              </div>

              {/* Premium Toggle */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Enable Article Paywall</div>
                  <div className="text-[11px] text-slate-400">Lock full content for subscribers</div>
                </div>
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {isPremium && (
                <>
                  {/* Tier Required Selection */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Required Membership Tier:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTierRequired('pro')}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          tierRequired === 'pro'
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-bold text-indigo-300">Pro Member</div>
                        <div className="text-[10px] text-slate-400">$9/mo readers</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTierRequired('vip')}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          tierRequired === 'vip'
                            ? 'bg-amber-600/20 border-amber-500 text-white shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-bold text-amber-300">VIP Patron</div>
                        <div className="text-[10px] text-slate-400">$29/mo supporters</div>
                      </button>
                    </div>
                  </div>

                  {/* Free Preview Word Limit Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Free Teaser Words:</span>
                      <strong className="text-indigo-400">{previewWordLimit} words</strong>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={400}
                      step={10}
                      value={previewWordLimit}
                      onChange={(e) => setPreviewWordLimit(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">
                      Readers see the first {previewWordLimit} words, followed by the blurred paywall.
                    </div>
                  </div>
                </>
              )}

              {/* Creator Tip Perks */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>"Buy Me a Coffee" Enabled</span>
                </div>
                <p className="text-[11px]">
                  All published articles include an in-line micro-tipping button so readers can send direct $3, $5, or $15 tips to your connected creator wallet.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
