import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  PenTool, 
  BarChart3, 
  Coins, 
  Globe, 
  Key, 
  ShieldCheck, 
  Crown, 
  ChevronDown,
  BookOpen
} from 'lucide-react';

export default function Navbar({ activeView, setActiveView, onOpenApiKeyModal }) {
  const [userTier, setUserTier] = useState('free');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user_tier') || 'free';
    setUserTier(saved);
  }, []);

  const handleTierChange = (tier) => {
    setUserTier(tier);
    localStorage.setItem('user_tier', tier);
    setDropdownOpen(false);
    window.dispatchEvent(new Event('tierChanged'));
  };

  const navItems = [
    { id: 'home', label: 'Explore', icon: BookOpen },
    { id: 'editor', label: 'Markdown Studio', icon: PenTool, badge: 'AI Inside' },
    { id: 'analytics', label: 'SEO & Analytics', icon: BarChart3 },
    { id: 'monetization', label: 'Monetization', icon: Coins },
    { id: 'ssr', label: 'SSR & Feeds', icon: Globe }
  ];

  const tierColors = {
    free: 'bg-slate-800 text-slate-300 border-slate-700',
    pro: 'bg-indigo-950/80 text-indigo-300 border-indigo-700 shadow-sm shadow-indigo-500/20',
    vip: 'bg-amber-950/80 text-amber-300 border-amber-600 shadow-sm shadow-amber-500/20'
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveView('home')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                NovaBlog
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                AI + MERN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Blogging Platform & SEO Studio</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* OpenAI API Key trigger */}
          <button
            onClick={onOpenApiKeyModal}
            title="Configure OpenAI API Key"
            className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-slate-900 rounded-lg border border-slate-800 transition-colors"
          >
            <Key className="w-4 h-4" />
          </button>

          {/* User Tier / Subscription Simulator Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${tierColors[userTier]}`}
            >
              {userTier === 'vip' ? (
                <Crown className="w-3.5 h-3.5 text-amber-400" />
              ) : userTier === 'pro' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              )}
              <span className="capitalize">{userTier} Tier</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Simulate Reader Tier:
                </div>
                <button
                  onClick={() => handleTierChange('free')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 ${
                    userTier === 'free' ? 'text-indigo-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  <span>Free Reader</span>
                  <span className="text-[10px] text-slate-500">Public Only</span>
                </button>
                <button
                  onClick={() => handleTierChange('pro')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 ${
                    userTier === 'pro' ? 'text-indigo-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Pro Member ($9/mo)
                  </span>
                  <span className="text-[10px] text-indigo-400">Unlocked</span>
                </button>
                <button
                  onClick={() => handleTierChange('vip')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 ${
                    userTier === 'vip' ? 'text-amber-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" /> VIP Patron ($29/mo)
                  </span>
                  <span className="text-[10px] text-amber-400">All Access</span>
                </button>
              </div>
            )}
          </div>

          {/* Write / New Post Button */}
          <button
            onClick={() => setActiveView('editor')}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Write Post</span>
          </button>
        </div>

      </div>

      {/* Mobile Nav row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap ${
                isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
