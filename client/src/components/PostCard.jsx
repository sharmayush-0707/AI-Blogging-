import React from 'react';
import { Eye, Heart, Clock, Lock, Sparkles, ShieldCheck, Crown } from 'lucide-react';

export default function PostCard({ post, onSelect, onEdit }) {
  const isPremium = post.monetization?.isPremium;
  const tier = post.monetization?.tierRequired || 'pro';
  const seoScore = post.seo?.seoScore || 85;

  return (
    <article 
      onClick={() => onSelect(post.slug)}
      className="group flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800/90 overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer"
    >
      {/* Cover Image & Badges */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-slate-950/80 backdrop-blur-md text-slate-200 border border-white/10 shadow-sm">
            {post.category}
          </span>
        </div>

        {/* Monetization / Paywall Badge */}
        <div className="absolute top-3 right-3">
          {isPremium ? (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-lg backdrop-blur-md ${
              tier === 'vip' 
                ? 'bg-amber-500/90 text-slate-950 border border-amber-300' 
                : 'bg-indigo-600/90 text-white border border-indigo-400'
            }`}>
              {tier === 'vip' ? <Crown className="w-3 h-3 fill-slate-950" /> : <Lock className="w-3 h-3" />}
              <span className="uppercase">{tier}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              Free
            </span>
          )}
        </div>

        {/* Bottom SEO Badge inside thumbnail */}
        <div className="absolute bottom-2 right-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/85 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
            SEO: {seoScore}/100
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-2.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {post.stats?.avgReadTimeMinutes || 5} min read
            </span>
            <span>•</span>
            <span>
              {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
            {post.excerpt || post.content?.slice(0, 140)}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(post.tags || []).slice(0, 3).map((tag, i) => (
              <span 
                key={i} 
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer: Author & Stats */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <img
              src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={post.author?.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-700"
            />
            <span className="font-medium text-slate-300 truncate max-w-[120px]">
              {post.author?.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 hover:text-slate-200">
              <Eye className="w-3.5 h-3.5" />
              {(post.stats?.views || 1).toLocaleString()}
            </span>
            <span className="flex items-center gap-1 hover:text-pink-400">
              <Heart className="w-3.5 h-3.5" />
              {post.stats?.likes || 0}
            </span>
          </div>
        </div>

      </div>
    </article>
  );
}
