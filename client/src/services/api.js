const API_BASE = '/api';

/**
 * Helper for API requests
 */
async function request(endpoint, options = {}) {
  const customApiKey = localStorage.getItem('openai_api_key') || '';
  const userTier = localStorage.getItem('user_tier') || 'free';

  const headers = {
    'Content-Type': 'application/json',
    'x-user-tier': userTier,
    ...(customApiKey ? { 'x-openai-key': customApiKey } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

// Posts API
export async function getPosts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/posts${query ? '?' + query : ''}`);
}

export async function getPostBySlug(slug, tier) {
  const query = tier ? `?tier=${tier}` : '';
  return request(`/posts/${slug}${query}`);
}

export async function createPost(postData) {
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify(postData)
  });
}

export async function updatePost(id, postData) {
  return request(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData)
  });
}

export async function deletePost(id) {
  return request(`/posts/${id}`, {
    method: 'DELETE'
  });
}

export async function toggleLike(id) {
  return request(`/posts/${id}/like`, {
    method: 'POST'
  });
}

// AI Content Assistant API
export async function getAiSuggestion({ action, topic, title, content, tone, focusKeyword, customPrompt }) {
  const customApiKey = localStorage.getItem('openai_api_key') || '';
  return request('/ai/suggest', {
    method: 'POST',
    body: JSON.stringify({
      action,
      topic,
      title,
      content,
      tone,
      focusKeyword,
      customPrompt,
      apiKey: customApiKey
    })
  });
}

// SEO Audit API
export async function auditSeoData(payload) {
  return request('/seo/audit', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// Analytics API
export async function getAnalyticsOverview() {
  return request('/analytics/overview');
}

// Subscriptions & Monetization API
export async function getSubscriptionPlans() {
  return request('/subscriptions/plans');
}

export async function subscribePlan(planId, email) {
  return request('/subscriptions/subscribe', {
    method: 'POST',
    body: JSON.stringify({ planId, email })
  });
}

export async function tipAuthor(amount, message, authorName) {
  return request('/subscriptions/tip', {
    method: 'POST',
    body: JSON.stringify({ amount, message, authorName })
  });
}

export async function getCreatorEarnings() {
  return request('/subscriptions/creator-earnings');
}

// SSR Inspection API
export async function getSsrInspect(slug) {
  const res = await fetch(`/ssr/inspect/${slug}`);
  return res.json();
}
