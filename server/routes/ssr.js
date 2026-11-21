import express from 'express';
import { db } from '../db.js';

const router = express.Router();

/**
 * Basic markdown to HTML converter for SSR output
 */
function markdownToHtml(md = '') {
  let html = md
    // Escape angle brackets that aren't tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headings
    .replace(/^### (.*$)/gim, '<h3 style="font-size:1.3rem; margin:1.2rem 0 0.5rem; color:#f1f5f9;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size:1.6rem; margin:1.5rem 0 0.75rem; color:#f8fafc; border-bottom:1px solid #334155; padding-bottom:0.4rem;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size:2rem; margin:1.5rem 0 1rem; color:#fff;">$1</h1>')
    // Bold & Italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong style="color:#f8fafc;">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre style="background:#0f172a; border:1px solid #1e293b; padding:1rem; border-radius:8px; overflow-x:auto; margin:1rem 0;"><code style="color:#38bdf8; font-family:monospace;">$2</code></pre>')
    .replace(/`([^`]+)`/gim, '<code style="background:#1e293b; color:#38bdf8; padding:2px 6px; border-radius:4px; font-size:0.9em;">$1</code>')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote style="border-left:4px solid #6366f1; background:rgba(99,102,241,0.1); padding:0.8rem 1.2rem; margin:1rem 0; color:#cbd5e1; font-style:italic;">$1</blockquote>')
    // Lists
    .replace(/^\s*\-\s+(.*$)/gim, '<li style="margin-bottom:0.3rem;">$1</li>')
    // Line breaks
    .replace(/\n\n+/g, '</p><p style="margin-bottom:1rem; line-height:1.75; color:#cbd5e1;">')
    .replace(/\n/g, '<br/>');

  return `<div class="ssr-article-body" style="font-family:system-ui,-apple-system,sans-serif; color:#cbd5e1; font-size:1.05rem;">
    <p style="margin-bottom:1rem; line-height:1.75;">${html}</p>
  </div>`;
}

// SSR HTML page for blog posts
router.get('/post/:slug', async (req, res) => {
  const startTime = Date.now();
  try {
    const post = await db.getPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head><title>404 - Post Not Found</title></head>
          <body style="background:#020617; color:#fff; font-family:sans-serif; text-align:center; padding:5rem;">
            <h1>404 - Blog Post Not Found</h1>
            <p><a href="/" style="color:#6366f1;">Return to AI Blogging Platform</a></p>
          </body>
        </html>
      `);
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;
    const postUrl = `${baseUrl}/post/${post.slug}`;
    const pageTitle = post.seo?.metaTitle || `${post.title} | AI Blogging Platform`;
    const metaDesc = post.seo?.metaDescription || post.excerpt || `Read ${post.title} on AI Blogging Platform.`;
    const focusKeyword = post.seo?.focusKeyword || '';
    const tagsStr = (post.tags || []).join(', ');
    const renderedBody = markdownToHtml(post.content);
    const renderDurationMs = Date.now() - startTime;

    // Structured JSON-LD Schema
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": postUrl
      },
      "headline": post.title,
      "description": metaDesc,
      "image": [post.coverImage],
      "datePublished": post.createdAt,
      "dateModified": post.updatedAt || post.createdAt,
      "author": {
        "@type": "Person",
        "name": post.author?.name || 'Alex Mercer',
        "jobTitle": post.author?.role || 'Author'
      },
      "publisher": {
        "@type": "Organization",
        "name": "AI-Powered Blogging Platform",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      "keywords": tagsStr
    };

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Primary SEO Meta Tags (SSR Pre-Rendered) -->
  <title>${pageTitle}</title>
  <meta name="title" content="${pageTitle}" />
  <meta name="description" content="${metaDesc}" />
  <meta name="keywords" content="${tagsStr}${focusKeyword ? ', ' + focusKeyword : ''}" />
  <meta name="author" content="${post.author?.name || 'Alex Mercer'}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <link rel="canonical" href="${postUrl}" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${postUrl}" />
  <meta property="og:title" content="${pageTitle}" />
  <meta property="og:description" content="${metaDesc}" />
  <meta property="og:image" content="${post.coverImage}" />
  <meta property="og:site_name" content="AI Blogging Platform" />
  <meta property="article:published_time" content="${post.createdAt}" />
  <meta property="article:section" content="${post.category}" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${postUrl}" />
  <meta name="twitter:title" content="${pageTitle}" />
  <meta name="twitter:description" content="${metaDesc}" />
  <meta name="twitter:image" content="${post.coverImage}" />

  <!-- JSON-LD Structured Data for Google Rich Snippets -->
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>

  <!-- Performance Meta Info -->
  <meta name="x-ssr-engine" content="Node-Express-React-SSR" />
  <meta name="x-render-time-ms" content="${renderDurationMs}" />

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #020617;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      padding: 0;
    }
    .ssr-banner {
      background: linear-gradient(90deg, #4f46e5, #9333ea);
      color: #fff;
      font-size: 0.85rem;
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ssr-container {
      max-width: 860px;
      margin: 0 auto;
      padding: 2rem 1.5rem 5rem;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-cat { background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4); }
    .badge-seo { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .meta-row { display: flex; align-items: center; gap: 12px; margin-top: 1.5rem; margin-bottom: 2rem; }
    .author-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #6366f1; }
    .cover-img { width: 100%; max-height: 440px; object-fit: cover; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #1e293b; }
    .tag-pill { display: inline-block; background: #1e293b; color: #94a3b8; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; margin-right: 6px; margin-top: 8px; }
  </style>
</head>
<body>
  <!-- Server-Side Render Header Banner -->
  <div class="ssr-banner">
    <div>
      <strong>⚡ Server-Side Rendered (SSR)</strong> — Optimized for Search Engine Crawlers & Social Previews
    </div>
    <div>
      <span>Render Time: <strong>${renderDurationMs}ms</strong></span> |
      <a href="/post/${post.slug}" style="color:#fff; text-decoration:underline; margin-left:8px;">Open Interactive React App &rarr;</a>
    </div>
  </div>

  <main class="ssr-container">
    <div style="margin-bottom: 1rem;">
      <a href="/" style="color: #818cf8; text-decoration: none; font-size: 0.9rem;">&larr; Back to All Articles</a>
    </div>

    <div style="display:flex; gap:8px; margin-bottom:1rem;">
      <span class="badge badge-cat">${post.category}</span>
      <span class="badge badge-seo">SEO Score: ${post.seo?.seoScore || 85}/100</span>
      ${post.monetization?.isPremium ? '<span class="badge" style="background:#f59e0b20; color:#fbbf24; border:1px solid #f59e0b40;">🔒 Premium</span>' : ''}
    </div>

    <h1 style="font-size:2.4rem; font-weight:800; line-height:1.2; margin-bottom:1rem; color:#fff;">
      ${post.title}
    </h1>

    <div class="meta-row">
      <img src="${post.author?.avatar}" alt="${post.author?.name}" class="author-avatar" />
      <div>
        <div style="font-weight:600; color:#f8fafc;">${post.author?.name}</div>
        <div style="font-size:0.85rem; color:#94a3b8;">
          ${new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${post.stats?.avgReadTimeMinutes || 5} min read · ${post.stats?.views || 1} views
        </div>
      </div>
    </div>

    <img src="${post.coverImage}" alt="${post.title}" class="cover-img" />

    <article>
      ${renderedBody}
    </article>

    <div style="margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #1e293b;">
      <div style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 0.5rem;">Topics & SEO Keywords:</div>
      <div>
        ${(post.tags || []).map(t => `<span class="tag-pill">#${t}</span>`).join('')}
      </div>
    </div>
  </main>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-SSR-Render-Time', `${renderDurationMs}ms`);
    res.send(fullHtml);
  } catch (err) {
    res.status(500).send(`Server error: ${err.message}`);
  }
});

// XML Sitemap for Search Engine Crawlers
router.get('/sitemap.xml', async (req, res) => {
  try {
    const posts = await db.getAllPosts({ status: 'published' });
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/analytics</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/monetization</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

    // Dynamic blog posts
    for (const post of posts) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/post/${post.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(post.updatedAt || post.createdAt).toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>${post.monetization?.isPremium ? '0.9' : '0.8'}</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// RSS 2.0 Feed for Syndication
router.get('/rss.xml', async (req, res) => {
  try {
    const posts = await db.getAllPosts({ status: 'published' });
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    let rss = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
    rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
    rss += `  <title>AI-Powered Blogging Platform</title>\n`;
    rss += `  <link>${baseUrl}</link>\n`;
    rss += `  <description>Cutting-edge tech, AI architecture, SEO insights and creator monetization.</description>\n`;
    rss += `  <language>en-us</language>\n`;
    rss += `  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

    for (const post of posts) {
      rss += `  <item>\n`;
      rss += `    <title><![CDATA[${post.title}]]></title>\n`;
      rss += `    <link>${baseUrl}/post/${post.slug}</link>\n`;
      rss += `    <guid isPermaLink="true">${baseUrl}/post/${post.slug}</guid>\n`;
      rss += `    <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>\n`;
      rss += `    <description><![CDATA[${post.excerpt || post.content.slice(0, 160)}]]></description>\n`;
      rss += `    <author>${post.author?.name || 'Alex Mercer'}</author>\n`;
      rss += `  </item>\n`;
    }

    rss += `</channel>\n</rss>`;

    res.header('Content-Type', 'application/rss+xml');
    res.send(rss);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// robots.txt
router.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'localhost:5000';
  const protocol = req.protocol || 'http';
  const baseUrl = `${protocol}://${host}`;

  const robots = `User-agent: *
Allow: /
Disallow: /api/
Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// SSR Inspector endpoint (for frontend SEO preview panel)
router.get('/inspect/:slug', async (req, res) => {
  try {
    const post = await db.getPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    res.json({
      success: true,
      slug: post.slug,
      ssrUrl: `/ssr/post/${post.slug}`,
      sitemapUrl: '/sitemap.xml',
      rssUrl: '/rss.xml',
      robotsUrl: '/robots.txt',
      meta: {
        title: post.seo?.metaTitle || post.title,
        description: post.seo?.metaDescription || post.excerpt,
        ogTitle: post.title,
        ogImage: post.coverImage,
        jsonLdPresent: true,
        schemaType: 'BlogPosting'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
