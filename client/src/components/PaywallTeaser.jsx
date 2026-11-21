import React from 'react';
import { Lock, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PaywallTeaser({ 
  tierRequired = 'pro', 
  remainingWords = 450, 
  onUpgrade 
}) {
  const isVip = tierRequired === 'vip';

  return (
    <div className="relative mt-8 pt-12 pb-16 px-6 sm:px-10 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/60 via-slate-900 to-slate-950 overflow-hidden text-center shadow-2xl">
      {/* Glow Backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-44 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Lock Badge */}
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 mb-4 shadow-inner">
        <Lock className="w-7 h-7" />
      </div>

      <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
        Member-Only Premium Article
      </h3>
      
      <p className="text-slate-300 max-w-lg mx-auto text-sm sm:text-base mb-6 leading-relaxed">
        You've reached the free preview. This in-depth guide contains{' '}
        <span className="text-indigo-400 font-semibold">{remainingWords}+ more words</span>{' '}
        of technical benchmarks, code walkthroughs, and architecture diagrams.
      </p>

      {/* Feature Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8 text-xs text-slate-300">
        <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Full Code Repository Access
        </span>
        <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Content Assistant Studio
        </span>
        <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-400" /> Instant Unlock
        </span>
      </div>

      {/* Conversion Button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onUpgrade}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95"
        >
          <span>Unlock with {isVip ? 'VIP Patron ($29/mo)' : 'Pro Membership ($9/mo)'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-slate-500 mt-4">
        Cancel anytime. Instant access across all devices.
      </p>
    </div>
  );
}
