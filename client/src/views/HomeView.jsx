import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, TrendingUp, ShieldCheck, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import PostCard from '../components/PostCard';
import { getPosts } from '../services/api';

export default function HomeView({ onSelectPost, onNewPost, setActiveView }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterPremium, setFilterPremium] = useState('all'); // 'all' | 'free' | 'premium'

  const categories = [
    'All',
    'Artificial Intelligence',
    'Web Development',
    'Design Systems',
    'Monetization',
    'Cloud & DevOps'
  ];

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const res = await getPosts({
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      });
      if (res.success) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBlogPosts();
  };

  const filteredPosts = posts.filter((p) => {
    if (filterPremium === 'free') return !p.monetization?.isPremium;
    if (filterPremium === 'premium') return p.monetization?.isPremium;
    return true;
  });

  const featuredPost = posts[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/40 to-slate-950 p-6 sm:p-10 lg:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Publishing & SEO Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight sm:leading-none mb-4">
            Publish Smarter. Rank Faster.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Monetize Directly.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl">
            A full-stack blogging platform built with MongoDB, Express, React, and Node.js. 
            Supercharged with Markdown split editing, OpenAI suggestions, real-time SEO grading, paywalled subscription tiers, and Server-Side Rendering (SSR).
          </p>

          {/* Search bar inside Hero */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles by title, keyword, or markdown code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
            >
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Quick Highlights Strip */}
        <div className="mt-8 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              AI
            </div>
            <div>
              <div className="text-white font-bold text-sm">GPT Co-Pilot</div>
              <div className="text-slate-400 text-xs">Titles, Outlines & Polish</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              SEO
            </div>
            <div>
              <div className="text-white font-bold text-sm">100-Pt Audit</div>
              <div className="text-slate-400 text-xs">Density, Schema & Meta</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              $$
            </div>
            <div>
              <div className="text-white font-bold text-sm">Paywalls & Tips</div>
              <div className="text-slate-400 text-xs">Pro & VIP Memberships</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              SSR
            </div>
            <div>
              <div className="text-white font-bold text-sm">Server-Rendered</div>
              <div className="text-slate-400 text-xs">Googlebot & OpenGraph</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Filter Bar */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Access Filter (All / Free / Pro) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setFilterPremium('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterPremium === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Access
          </button>
          <button
            onClick={() => setFilterPremium('free')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterPremium === 'free' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Free
          </button>
          <button
            onClick={() => setFilterPremium('premium')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterPremium === 'premium' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔒 Pro Only
          </button>
        </div>
      </section>

      {/* Posts Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Latest Publications</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {filteredPosts.length}
            </span>
          </h2>

          <button
            onClick={fetchBlogPosts}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 animate-pulse h-80" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-slate-900/40 border border-slate-800 p-8">
            <p className="text-slate-400 mb-4">No articles found matching your criteria.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setFilterPremium('all');
                fetchBlogPosts();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id || post.slug}
                post={post}
                onSelect={onSelectPost}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
