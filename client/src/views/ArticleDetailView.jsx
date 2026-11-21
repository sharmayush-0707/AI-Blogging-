import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Bookmark, 
  Clock, 
  Globe, 
  ShieldCheck, 
  Coffee, 
  Check, 
  Eye, 
  Tag, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import MarkdownViewer from '../components/MarkdownViewer';
import PaywallTeaser from '../components/PaywallTeaser';
import TipAuthorModal from '../components/TipAuthorModal';
import { getPostBySlug, toggleLike } from '../services/api';

export default function ArticleDetailView({ slug, onBack, onOpenSubscribeModal }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);

  const loadPost = async () => {
    setLoading(true);
    try {
      const userTier = localStorage.getItem('user_tier') || 'free';
      const res = await getPostBySlug(slug, userTier);
      if (res.success) {
        setPost(res.data);
        setLikes(res.data.stats?.likes || 0);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();

    // Listen to tier changes from Navbar
    const onTierChanged = () => {
      loadPost();
    };
    window.addEventListener('tierChanged', onTierChanged);
    return () => window.removeEventListener('tierChanged', onTierChanged);
  }, [slug]);

  const handleLike = async () => {
    if (hasLiked || !post) return;
    setHasLiked(true);
    setLikes(likes + 1);
    try {
      await toggleLike(post.id || post._id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Rendering article content...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Article Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">The article you requested could not be located.</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
        >
          Return to All Articles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center gap-2">
          {/* View SSR Version link */}
          <a
            href={`/ssr/post/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="View Server-Side Rendered (SSR) HTML for Search Crawlers"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 text-xs font-medium transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SSR HTML (SEO)</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            {post.category}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            SEO Score: {post.seo?.seoScore || 85}/100
          </span>
          {post.monetization?.isPremium && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              🔒 {post.monetization?.tierRequired?.toUpperCase()} Only
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-6 font-normal">
          {post.excerpt}
        </p>

        {/* Author Bio Row */}
        <div className="flex items-center justify-between py-4 border-y border-slate-800/80">
          <div className="flex items-center gap-3">
            <img
              src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={post.author?.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/40"
            />
            <div>
              <div className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                <span>{post.author?.name}</span>
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xs text-slate-400">
                {post.author?.role || 'Author'} · {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTipModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tip Author</span>
            </button>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="rounded-2xl overflow-hidden mb-10 border border-slate-800 shadow-2xl">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full max-h-[460px] object-cover"
          />
        </div>
      )}

      {/* Article Body */}
      <main className="mb-12">
        <MarkdownViewer content={post.content} />

        {/* Paywall Overlay if locked */}
        {post.isLocked && (
          <PaywallTeaser
            tierRequired={post.monetization?.tierRequired || 'pro'}
            remainingWords={post.remainingWords || 350}
            onUpgrade={onOpenSubscribeModal}
          />
        )}
      </main>

      {/* Tags Section */}
      <div className="pt-6 border-t border-slate-800/80 mb-10">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Indexed SEO Keywords & Tags:
        </div>
        <div className="flex flex-wrap gap-2">
          {(post.tags || []).map((t, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Engagement & Reaction Footer */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition-all ${
              hasLiked
                ? 'bg-pink-600/20 text-pink-400 border-pink-500/40 shadow-sm shadow-pink-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-pink-400' : ''}`} />
            <span>{likes} Applauds</span>
          </button>

          <button
            onClick={() => setShowTipModal(true)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
          >
            <Coffee className="w-4 h-4" />
            <span>Support Author</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span>{(post.stats?.views || 1).toLocaleString()} Total Reads</span>
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <TipAuthorModal
          authorName={post.author?.name || 'Alex Mercer'}
          onClose={() => setShowTipModal(false)}
          onTipSuccess={() => {}}
        />
      )}

    </div>
  );
}
