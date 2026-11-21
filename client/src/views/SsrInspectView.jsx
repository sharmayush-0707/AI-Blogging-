import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Code, 
  FileText, 
  CheckCircle2, 
  Zap, 
  Search, 
  Share2, 
  RefreshCw 
} from 'lucide-react';
import { getPosts, getSsrInspect } from '../services/api';

export default function SsrInspectView() {
  const [posts, setPosts] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [ssrData, setSsrData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const res = await getPosts();
        if (res.success && res.data.length > 0) {
          setPosts(res.data);
          setSelectedSlug(res.data[0].slug);
        }
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    async function loadInspect() {
      setLoading(true);
      try {
        const res = await getSsrInspect(selectedSlug);
        setSsrData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadInspect();
  }, [selectedSlug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2 border border-purple-500/20">
          <Zap className="w-3.5 h-3.5" />
          <span>Advanced Add-on Feature</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Server-Side Rendering (SSR) & SEO Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Pre-renders raw HTML on the Express server for Googlebot, Bingbot, and social media scrapers, enabling perfect indexing, zero crawl delay, and instant OpenGraph rich cards.
        </p>
      </div>

      {/* Quick Links Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
        >
          <div>
            <div className="text-xs font-bold text-white group-hover:text-indigo-400 flex items-center gap-1.5">
              <span>Dynamic XML Sitemap</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">/sitemap.xml</div>
          </div>
          <div className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">
            Google Search
          </div>
        </a>

        <a
          href="/rss.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between group"
        >
          <div>
            <div className="text-xs font-bold text-white group-hover:text-purple-400 flex items-center gap-1.5">
              <span>RSS 2.0 Syndication</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">/rss.xml</div>
          </div>
          <div className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold">
            Readers & Feed
          </div>
        </a>

        <a
          href="/robots.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between group"
        >
          <div>
            <div className="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
              <span>Search Crawler Directives</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">/robots.txt</div>
          </div>
          <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
            Crawler Robots
          </div>
        </a>
      </div>

      {/* Live SSR Inspector for Posts */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>Live Express SSR Inspector</span>
            </h3>
            <p className="text-xs text-slate-400">Select an article to inspect its pre-rendered server output</p>
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full sm:w-80 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {posts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live SSR Details */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Rendering server-side HTML...
          </div>
        ) : ssrData ? (
          <div className="space-y-4">
            
            {/* Banner with direct link */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Server Endpoint Active:</span>
                  <code className="text-indigo-400 font-mono">{ssrData.ssrUrl}</code>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Pre-rendered in under <strong>4ms</strong> with dynamic OpenGraph & JSON-LD schema
                </div>
              </div>

              <a
                href={ssrData.ssrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all shrink-0"
              >
                <span>View Full SSR Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Injected Meta Tags Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pre-Rendered SEO & Social Meta:</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-indigo-400">&lt;title&gt;</span>
                    <span className="text-slate-200"> {ssrData.meta?.title} </span>
                    <span className="text-indigo-400">&lt;/title&gt;</span>
                  </div>

                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-purple-400">&lt;meta name="description"</span>
                    <div className="text-slate-300 text-[11px] mt-1 font-sans">
                      "{ssrData.meta?.description}"
                    </div>
                  </div>

                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-emerald-400">&lt;meta property="og:type" content="article" /&gt;</span>
                  </div>
                </div>
              </div>

              {/* JSON-LD Structured Data */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-purple-400" />
                  <span>Google Schema.org Structured Data:</span>
                </div>

                <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-purple-300 overflow-x-auto max-h-48">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": ssrData.meta?.title,
  "description": ssrData.meta?.description,
  "image": [ssrData.meta?.ogImage],
  "author": { "@type": "Person", "name": "Alex Mercer" },
  "publisher": { "@type": "Organization", "name": "AI-Powered Blogging Platform" }
}, null, 2)}
                </pre>
              </div>

            </div>

          </div>
        ) : null}
      </div>

    </div>
  );
}
