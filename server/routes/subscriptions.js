import express from 'express';

const router = express.Router();

// Mock subscriber database / state
let subscriptionsState = {
  activeSubscribers: 428,
  monthlyRecurringRevenue: 3852,
  totalTipsCollected: 1420,
  recentTips: [
    { id: 'tip-1', supporter: 'DevSarah', amount: 15, message: 'Loved the React 19 deep dive!', timestamp: '2 hours ago' },
    { id: 'tip-2', supporter: 'Kieran_Code', amount: 5, message: 'Thanks for the SEO checklist', timestamp: '5 hours ago' },
    { id: 'tip-3', supporter: 'Anonymous', amount: 10, message: 'Super helpful article on SSR.', timestamp: '1 day ago' }
  ]
};

// GET plans
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'free',
        name: 'Free Reader',
        price: 0,
        billing: 'forever',
        popular: false,
        features: [
          'Access to all public blog articles',
          'Standard Markdown reading experience',
          'Join public discussions & comments',
          'Weekly curated newsletter'
        ]
      },
      {
        id: 'pro',
        name: 'Pro Creator & Reader',
        price: 9,
        billing: 'per month ($89/yr)',
        popular: true,
        features: [
          'Unlock ALL paywalled Pro articles',
          'Unlimited AI Content Assistant suggestions',
          'Real-time SEO scoring & keyword audit',
          'Full-screen distraction-free Markdown Studio',
          'Verified Pro Supporter profile badge',
          'Offline reading & PDF / Markdown exports'
        ]
      },
      {
        id: 'vip',
        name: 'VIP Patron & Supporter',
        price: 29,
        billing: 'per month',
        popular: false,
        features: [
          'Everything included in Pro',
          'Exclusive VIP-only strategic blueprints',
          'Direct 1-on-1 author office hours & Q&A',
          'Priority feature requests for AI tools',
          'Promote your own projects in community showcase'
        ]
      }
    ]
  });
});

// POST subscribe (simulate checkout)
router.post('/subscribe', (req, res) => {
  const { planId, paymentMethod = 'credit_card', email = 'user@example.com' } = req.body;

  if (!['free', 'pro', 'vip'].includes(planId)) {
    return res.status(400).json({ success: false, error: 'Invalid plan selected' });
  }

  if (planId !== 'free') {
    subscriptionsState.activeSubscribers += 1;
    subscriptionsState.monthlyRecurringRevenue += planId === 'pro' ? 9 : 29;
  }

  res.json({
    success: true,
    message: `Successfully subscribed to ${planId.toUpperCase()} membership!`,
    subscription: {
      tier: planId,
      status: 'active',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
      subscriberEmail: email
    }
  });
});

// POST tip author
router.post('/tip', (req, res) => {
  const { amount = 5, message = 'Great article!', authorName = 'Alex Mercer' } = req.body;
  const tipAmount = Math.max(1, Number(amount));

  subscriptionsState.totalTipsCollected += tipAmount;
  const newTip = {
    id: `tip-${Date.now()}`,
    supporter: 'Generous Supporter',
    amount: tipAmount,
    message,
    timestamp: 'Just now'
  };
  subscriptionsState.recentTips.unshift(newTip);

  res.json({
    success: true,
    message: `Thank you for tipping $${tipAmount} to ${authorName}!`,
    tip: newTip,
    totalTipsCollected: subscriptionsState.totalTipsCollected
  });
});

// GET creator earnings dashboard
router.get('/creator-earnings', (req, res) => {
  res.json({
    success: true,
    data: {
      mrr: subscriptionsState.monthlyRecurringRevenue,
      annualRunRate: subscriptionsState.monthlyRecurringRevenue * 12,
      activeMembers: subscriptionsState.activeSubscribers,
      totalTips: subscriptionsState.totalTipsCollected,
      churnRate: '2.1%',
      payoutMethod: 'Stripe Connect (Express Account ****4242)',
      nextPayoutDate: 'Dec 1, 2026',
      recentTips: subscriptionsState.recentTips.slice(0, 5)
    }
  });
});

export default router;
