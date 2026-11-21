import express from 'express';

const router = express.Router();

// Real-time SEO analysis endpoint
router.post('/audit', (req, res) => {
  const { title = '', content = '', metaTitle = '', metaDescription = '', focusKeyword = '', slug = '' } = req.body;

  const checks = [];
  let score = 100;

  // 1. Title Length Audit (Recommended 40 - 65 chars)
  const effectiveTitle = metaTitle || title;
  const titleLen = effectiveTitle.length;
  if (titleLen === 0) {
    score -= 20;
    checks.push({ id: 'title', status: 'error', label: 'Missing Title', message: 'Add a post title.' });
  } else if (titleLen < 30) {
    score -= 10;
    checks.push({ id: 'title', status: 'warning', label: 'Title is too short', message: `${titleLen} chars. Aim for 40-65 characters.` });
  } else if (titleLen > 65) {
    score -= 5;
    checks.push({ id: 'title', status: 'warning', label: 'Title may truncate on Google', message: `${titleLen} chars. Google displays roughly 60 characters.` });
  } else {
    checks.push({ id: 'title', status: 'success', label: 'Optimal Title Length', message: `Perfect (${titleLen} chars).` });
  }

  // 2. Meta Description (Recommended 120 - 160 chars)
  const metaLen = metaDescription.length;
  if (metaLen === 0) {
    score -= 15;
    checks.push({ id: 'meta', status: 'warning', label: 'Missing Meta Description', message: 'Add a concise summary for search engine snippets.' });
  } else if (metaLen < 80) {
    score -= 8;
    checks.push({ id: 'meta', status: 'warning', label: 'Short Meta Description', message: `${metaLen} chars. Aim for 120-160 characters.` });
  } else if (metaLen > 165) {
    score -= 5;
    checks.push({ id: 'meta', status: 'warning', label: 'Meta Description may truncate', message: `${metaLen} chars. Search engines truncate around 160 chars.` });
  } else {
    checks.push({ id: 'meta', status: 'success', label: 'Optimal Meta Description', message: `Great length (${metaLen} chars).` });
  }

  // 3. Content Word Count & Depth
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount < 100) {
    score -= 25;
    checks.push({ id: 'length', status: 'error', label: 'Thin Content', message: `Only ${wordCount} words. Aim for at least 300-800 words.` });
  } else if (wordCount < 400) {
    score -= 10;
    checks.push({ id: 'length', status: 'warning', label: 'Moderate Length', message: `${wordCount} words. In-depth posts (>800 words) rank higher.` });
  } else {
    checks.push({ id: 'length', status: 'success', label: 'Strong Content Depth', message: `${wordCount} words. Excellent for search ranking.` });
  }

  // 4. Focus Keyword Density
  let keywordDensity = 0;
  let keywordMatches = 0;
  if (focusKeyword && focusKeyword.trim()) {
    const kw = focusKeyword.trim().toLowerCase();
    const cleanContent = content.toLowerCase();
    const regex = new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g');
    const matches = cleanContent.match(regex);
    keywordMatches = matches ? matches.length : 0;
    keywordDensity = wordCount > 0 ? ((keywordMatches / wordCount) * 100).toFixed(2) : 0;

    if (keywordMatches === 0) {
      score -= 15;
      checks.push({ id: 'keyword', status: 'error', label: 'Focus Keyword Missing in Body', message: `"${focusKeyword}" does not appear in your article.` });
    } else if (keywordDensity < 0.5) {
      score -= 5;
      checks.push({ id: 'keyword', status: 'warning', label: 'Low Keyword Density', message: `Density is ${keywordDensity}%. Target 1.0% - 2.5%.` });
    } else if (keywordDensity > 3.0) {
      score -= 8;
      checks.push({ id: 'keyword', status: 'warning', label: 'Keyword Stuffing Risk', message: `Density is ${keywordDensity}%. Reduce to avoid search penalties.` });
    } else {
      checks.push({ id: 'keyword', status: 'success', label: 'Optimal Keyword Density', message: `Density is ${keywordDensity}% (${keywordMatches} occurrences).` });
    }

    // Keyword in Title check
    if (!effectiveTitle.toLowerCase().includes(kw)) {
      score -= 5;
      checks.push({ id: 'kw-title', status: 'warning', label: 'Keyword in Title', message: `Add "${focusKeyword}" to your title for a CTR boost.` });
    } else {
      checks.push({ id: 'kw-title', status: 'success', label: 'Keyword in Title', message: 'Primary keyword is present in the title.' });
    }
  } else {
    checks.push({ id: 'keyword', status: 'info', label: 'No Focus Keyword Set', message: 'Set a focus keyword to analyze ranking density.' });
  }

  // 5. Heading Structure (H1, H2, H3 in markdown)
  const h1Matches = content.match(/^#\s+[^\n]+/gm) || [];
  const h2Matches = content.match(/^##\s+[^\n]+/gm) || [];
  if (h2Matches.length === 0) {
    score -= 10;
    checks.push({ id: 'headings', status: 'warning', label: 'No Subheadings (H2)', message: 'Add ## subheadings to structure your article for readers and crawlers.' });
  } else {
    checks.push({ id: 'headings', status: 'success', label: 'Structured Headings', message: `Found ${h2Matches.length} section headers.` });
  }

  // 6. Slug Readability
  const effectiveSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (/[A-Z_\s]/.test(effectiveSlug)) {
    score -= 5;
    checks.push({ id: 'slug', status: 'warning', label: 'Unfriendly URL Slug', message: 'Use lowercase alphanumeric characters and hyphens only.' });
  } else {
    checks.push({ id: 'slug', status: 'success', label: 'Clean URL Slug', message: `/post/${effectiveSlug}` });
  }

  const finalScore = Math.max(10, Math.min(100, score));

  res.json({
    success: true,
    data: {
      score: finalScore,
      grade: finalScore >= 90 ? 'A+' : finalScore >= 80 ? 'A' : finalScore >= 70 ? 'B' : finalScore >= 50 ? 'C' : 'D',
      stats: {
        wordCount,
        characterCount: content.length,
        estimatedReadMinutes: Math.max(1, Math.ceil(wordCount / 200)),
        keywordMatches,
        keywordDensity: Number(keywordDensity)
      },
      checks,
      previews: {
        google: {
          title: effectiveTitle || 'Untitled Post - AI Blogging Platform',
          url: `https://aiblogplatform.io/post/${effectiveSlug}`,
          description: metaDescription || (content.slice(0, 150).replace(/[#*`_]/g, '') + '...')
        },
        social: {
          title: effectiveTitle,
          description: metaDescription || 'Read the full story on AI Blogging Platform.',
          site: '@aiblogplatform'
        }
      }
    }
  });
});

export default router;
