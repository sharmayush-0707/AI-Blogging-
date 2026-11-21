import React from 'react';
import { Sparkles, Globe, Heart, Rss, FileCode } from 'lucide-react';

export default function Footer({ setActiveView }) {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">NovaBlog</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The next-generation AI-powered blogging platform built with the MERN stack & Server-Side Rendering.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Features</div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveView('editor')} className="hover:text-indigo-400">
                  Markdown Editor Studio
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('editor')} className="hover:text-indigo-400">
                  OpenAI Co-Pilot Suggestions
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('analytics')} className="hover:text-indigo-400">
                  Real-Time SEO Scoring
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('monetization')} className="hover:text-indigo-400">
                  Paywalls & Creator Tiers
                </button>
              </li>
            </ul>
          </div>

          {/* SEO & Feeds */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">SEO & Feeds</div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <a href="/ssr/post/building-modern-full-stack-web-apps-react-19-mongodb" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 flex items-center gap-1">
                  <span>Server-Side Rendered (SSR)</span>
                </a>
              </li>
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>XML Sitemap</span>
                </a>
              </li>
              <li>
                <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 flex items-center gap-1">
                  <Rss className="w-3 h-3" />
                  <span>RSS 2.0 Feed</span>
                </a>
              </li>
              <li>
                <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">
                  Robots.txt
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">MERN Stack Spec</div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-mono">
                MongoDB
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                Express.js
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-mono">
                React 19
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-green-400 font-mono">
                Node.js
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-purple-400 font-mono">
                OpenAI API
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-pink-400 font-mono">
                SSR Engine
              </span>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 NovaBlog AI Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with MERN & AI Co-Pilot</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
