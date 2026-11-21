import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Eye, 
  Globe, 
  ArrowUpRight, 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  CheckCircle2,
  Database,
  RefreshCw
} from 'lucide-react';
import { getAnalyticsOverview } from '../services/api';

export default function AnalyticsView({ onSelectPost }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('views'); // 'views' | 'visitors'

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsOverview();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Aggregating platform metrics & search telemetry...</p>
      </div>
    );
  }

  const { summary, trends = [], trafficSources = [], devices = [], topPosts = [] } = data || {};

  // Find max value in trends for SVG scaling
  const maxVal = Math.max(...trends.map(t => t[activeMetric] || 1), 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2 border border-indigo-500/20">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Search & Reader Intelligence</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">SEO & Platform Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time organic search rankings, reader retention, and creator performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Database: <strong>{summary?.isMongoConnected ? 'MongoDB' : 'Local JSON DB'}</strong></span>
          </div>

          <button
            onClick={loadAnalytics}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Article Reads</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {(summary?.totalViews || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% this month</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Unique Visitors</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {(summary?.uniqueVisitors || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12.6% organic search</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Reading Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {summary?.avgReadTime || '5m 42s'}
          </div>
          <div className="text-[11px] text-slate-400">
            Target: &gt; 4m for high engagement
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Subscribers</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {summary?.activeSubscribers || 428}
          </div>
          <div className="text-[11px] text-amber-400 font-semibold">
            ${(summary?.monthlyRevenue || 3852).toLocaleString()} /mo recurring
          </div>
        </div>

      </div>

      {/* Main Interactive Chart: 30-Day Views & Visitors Trend */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">30-Day Traffic & Reader Growth</h3>
            <p className="text-xs text-slate-400">Aggregated daily requests across Web & RSS feeds</p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveMetric('views')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeMetric === 'views' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Page Views
            </button>
            <button
              onClick={() => setActiveMetric('visitors')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeMetric === 'visitors' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unique Visitors
            </button>
          </div>
        </div>

        {/* Custom SVG Bar Chart */}
        <div className="h-64 w-full pt-6 flex items-end gap-1.5 sm:gap-2">
          {trends.map((item, idx) => {
            const val = item[activeMetric] || 0;
            const heightPercent = Math.max(6, Math.round((val / maxVal) * 100));
            return (
              <div 
                key={idx}
                className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end"
                title={`${item.date}: ${val.toLocaleString()} ${activeMetric}`}
              >
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    activeMetric === 'views'
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-pink-400'
                      : 'bg-gradient-to-t from-purple-600 to-purple-400 group-hover:from-purple-500 group-hover:to-pink-400'
                  }`}
                />
                {idx % 5 === 0 && (
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap hidden sm:block">
                    {item.date}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Traffic Sources & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Traffic Sources (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Organic Search & Traffic Channels</span>
          </h3>

          <div className="space-y-3">
            {trafficSources.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{item.source}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{item.visitors} visits</span>
                    <span className="text-emerald-400 font-bold">{item.growth}</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-purple-400" />
            <span>Device & Platform Share</span>
          </h3>

          <div className="space-y-4 pt-2">
            {devices.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-300 flex items-center justify-center">
                    {d.name === 'Desktop' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{d.name}</div>
                    <div className="text-[10px] text-slate-500">Optimized Responsive UI</div>
                  </div>
                </div>
                <div className="text-sm font-black text-indigo-400 font-mono">
                  {d.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Performing Articles Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Top Performing Content</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3">Article Title</th>
                <th className="pb-3 text-right">Views</th>
                <th className="pb-3 text-right">Likes</th>
                <th className="pb-3 text-right">Avg Read</th>
                <th className="pb-3 text-right">SEO Score</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topPosts.map((post) => (
                <tr 
                  key={post.id}
                  onClick={() => onSelectPost(post.slug)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 font-semibold text-white max-w-sm truncate">
                    {post.title}
                  </td>
                  <td className="py-3 text-right font-mono text-slate-300">
                    {post.views.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono text-slate-300">
                    {post.likes}
                  </td>
                  <td className="py-3 text-right text-slate-400">
                    {post.avgReadTime}
                  </td>
                  <td className="py-3 text-right font-mono text-emerald-400 font-bold">
                    {post.seoScore}/100
                  </td>
                  <td className="py-3 text-right">
                    {post.isPremium ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold text-[10px]">
                        🔒 Pro Only
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                        Free
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
