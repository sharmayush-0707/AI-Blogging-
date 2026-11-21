import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Crown, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  DollarSign, 
  Heart, 
  TrendingUp, 
  CreditCard,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getSubscriptionPlans, subscribePlan, getCreatorEarnings } from '../services/api';

export default function MonetizationView() {
  const [plans, setPlans] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [currentTier, setCurrentTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [subscribingTier, setSubscribingTier] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const savedTier = localStorage.getItem('user_tier') || 'free';
      setCurrentTier(savedTier);

      const [plansRes, earningsRes] = await Promise.all([
        getSubscriptionPlans(),
        getCreatorEarnings()
      ]);

      if (plansRes.success) setPlans(plansRes.data);
      if (earningsRes.success) setEarnings(earningsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectPlan = async (planId) => {
    setSubscribingTier(planId);
    try {
      const res = await subscribePlan(planId, 'creator@example.com');
      if (res.success) {
        localStorage.setItem('user_tier', planId);
        setCurrentTier(planId);
        window.dispatchEvent(new Event('tierChanged'));

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        alert(`🎉 ${res.message}`);
      }
    } catch (err) {
      alert('Subscription simulation error: ' + err.message);
    } finally {
      setSubscribingTier(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading monetization and subscription metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
          <Coins className="w-3.5 h-3.5" />
          <span>Creator Economy & Subscriptions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Monetization & Subscriber Tiers
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Empowering writers to earn recurring revenue with paywalled deep dives, subscriber tiers, and direct micro-tipping.
        </p>
      </div>

      {/* Subscription Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentTier === plan.id;
          const isPopular = plan.popular;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                isPopular
                  ? 'bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/15'
                  : 'bg-slate-900/90 border border-slate-800'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-[11px] tracking-wide uppercase shadow-md">
                  Most Popular for Creators
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {plan.id === 'vip' ? (
                    <Crown className="w-5 h-5 text-amber-400" />
                  ) : plan.id === 'pro' ? (
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  ) : null}
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">${plan.price}</span>
                  <span className="text-xs text-slate-400 font-medium">/{plan.billing}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-indigo-400' : 'text-emerald-400'}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={subscribingTier === plan.id}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    isCurrent
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : isPopular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Current Active Tier</span>
                    </>
                  ) : subscribingTier === plan.id ? (
                    <span>Activating...</span>
                  ) : (
                    <>
                      <span>{plan.price === 0 ? 'Use Free Reader' : `Subscribe to ${plan.name}`}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Creator Revenue Dashboard */}
      {earnings && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Live Creator Balance</span>
              </div>
              <h2 className="text-xl font-bold text-white">Author Monetization & Payouts</h2>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span>{earnings.payoutMethod}</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Monthly Recurring (MRR)</div>
              <div className="text-2xl font-black text-white font-mono">
                ${earnings.mrr.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">+14.2% from subscriptions</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Annual Run Rate (ARR)</div>
              <div className="text-2xl font-black text-white font-mono">
                ${earnings.annualRunRate.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Projected 12 months</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Paying Subscribers</div>
              <div className="text-2xl font-black text-white font-mono">
                {earnings.activeMembers}
              </div>
              <div className="text-[10px] text-indigo-400 mt-1">Churn rate: {earnings.churnRate}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Total Tips Collected</div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                ${earnings.totalTips.toLocaleString()}
              </div>
              <div className="text-[10px] text-amber-400/80 mt-1">Micro-tipping enabled</div>
            </div>
          </div>

          {/* Recent Tips Feed */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Recent Supporter Tips:
            </h4>
            <div className="space-y-2">
              {(earnings.recentTips || []).map((tip) => (
                <div
                  key={tip.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <Heart className="w-4 h-4 fill-amber-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {tip.supporter}{' '}
                        <span className="text-amber-400 font-bold ml-1">+${tip.amount}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] italic">"{tip.message}"</div>
                    </div>
                  </div>
                  <div className="text-slate-500 text-[10px]">{tip.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
