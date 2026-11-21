# 🚀 NovaBlog — AI-Powered Blogging Platform

> **Full-Stack MERN Platform with Server-Side Rendering (SSR), OpenAI Co-Pilot, Real-Time SEO Scoring & Monetization Paywalls**

Built precisely according to the project specification:
- **Markdown-based content editor**: Live split-screen preview, rich formatting toolbar (headings, code blocks, tables, blockquotes, lists), word & reading time counter, autosave.
- **AI content suggestions (using OpenAI API)**: 1-click title generator (5 high-CTR variations), full markdown article outline generator, paragraph expander/writer, tone shifter (Technical, Conversational, Professional, Persuasive), grammar polish, 150-char SEO meta description & excerpt generator, tag recommender, and custom prompt co-pilot. Supports custom OpenAI API keys as well as an intelligent offline generative fallback engine.
- **SEO optimization and analytics**: Real-time 100-point SEO auditor, keyword density calculator, title and meta description length checks, heading hierarchy validator, Google search snippet preview, social OpenGraph card preview, plus a platform analytics dashboard with 30-day reader trends, traffic referrers, and device telemetry.
- **User subscription and monetization options**: Free, Pro ($9/mo), and VIP ($29/mo) membership tiers, blurred in-article paywalls for premium content, simulated checkout/subscription upgrade, "Buy Me a Coffee" author micro-tipping with confetti, and author creator revenue dashboard (MRR, ARR, active subscribers, payout methods).
- **Tech Stack**: MongoDB, Express.js, React.js (React 19), Node.js.
- **Advanced Add-ons: Server-Side Rendering (SSR) for Better SEO**: Express server pre-renders raw semantic HTML for crawlers (Googlebot, Bingbot, social media bots) with dynamic `<title>`, meta descriptions, canonical URLs, OpenGraph/Twitter cards, and Schema.org `BlogPosting` JSON-LD structured data. Also serves dynamic `/sitemap.xml`, `/rss.xml`, and `/robots.txt`.

---

## 🏗️ Architecture Overview

```text
AI-blogging/
├── client/                     # Frontend (React 19 + Vite + Tailwind CSS + Lucide)
│   ├── src/
│   │   ├── components/         # Navbar, PostCard, MarkdownViewer, PaywallTeaser,
│   │   │                       # TipAuthorModal, ApiKeyModal, Footer
│   │   ├── views/              # HomeView, ArticleDetailView, EditorView,
│   │   │                       # AnalyticsView, MonetizationView, SsrInspectView
│   │   ├── services/api.js     # Unified API Client for Express backend
│   │   ├── App.jsx             # Root App Component & Navigation Router
│   │   └── index.css           # Tailwind CSS & Markdown Typography Styles
│   ├── package.json
│   └── vite.config.js          # Vite config with Tailwind & API proxy
│
├── server/                     # Backend (Express.js + Node.js + MongoDB/Mongoose)
│   ├── models/Post.js          # Mongoose Post Model with SEO & Monetization Schema
│   ├── routes/
│   │   ├── posts.js            # Posts CRUD, search, filter & paywall preview
│   │   ├── ai.js               # OpenAI API proxy & intelligent offline generator
│   │   ├── seo.js              # Real-time 100-point SEO analyzer & snippet generator
│   │   ├── analytics.js        # Platform reader trends, devices & traffic referrers
│   │   ├── subscriptions.js    # Plans, simulated checkout, tipping & creator MRR
│   │   └── ssr.js              # Server-Side Rendering (SSR), sitemap.xml & rss.xml
│   ├── db.js                   # Dual-Mode Database (Mongoose + local JSON fallback)
│   ├── data/seedPosts.js       # Preloaded articles on AI, MERN architecture & SEO
│   └── index.js                # Main Express Server
│
├── package.json                # Root package with concurrently dev scripts
└── .env.example                # Sample environment variables
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MongoDB** *(Optional)*: If running locally or on MongoDB Atlas, set `MONGODB_URI` in `.env`. If MongoDB is not running, the application automatically uses its built-in persistent local database (`server/data/posts.json`) without failing!

### 2. Run the Application
In the project root directory, run:

```bash
# Starts both Express backend (Port 5000) and Vite React frontend (Port 5173) concurrently
npm run dev
```

Or run the full production build directly through Express:
```bash
npm start
```

Open your browser at:
- **Web App**: [http://localhost:5173](http://localhost:5173) (Vite Dev) or [http://localhost:5000](http://localhost:5000) (Express)
- **Server-Side Rendered (SSR) Article Preview**: [http://localhost:5000/ssr/post/building-modern-full-stack-web-apps-react-19-mongodb](http://localhost:5000/ssr/post/building-modern-full-stack-web-apps-react-19-mongodb)
- **XML Sitemap**: [http://localhost:5000/sitemap.xml](http://localhost:5000/sitemap.xml)
- **RSS 2.0 Feed**: [http://localhost:5000/rss.xml](http://localhost:5000/rss.xml)

---

## 🌟 Key Features Walkthrough

### 1. Markdown-Based Content Editor
- **Split-Screen Live Preview**: Real-time rendering as you type with Markdown syntax highlighting.
- **Rich Toolbar**: Bold, italic, H1/H2/H3 headings, blockquotes, code blocks with syntax styling, ordered/unordered lists, markdown tables, and image embedding.
- **Real-Time Telemetry**: Word counter, character counter, and estimated read-time badge.

### 2. AI Content Suggestions (OpenAI API)
- Accessible in the **AI Content Co-Pilot** sidebar inside the editor.
- **Title Generator**: 5 high-converting headlines tailored to your draft. Click any title to apply.
- **Outline Generator**: Comprehensive markdown outline with sections and bullet points.
- **Expand & Draft**: Continues writing from your current draft with technical prose.
- **Tone Shifter**: Switch between Technical, Conversational, Professional, or Persuasive voice.
- **Polish & Grammar**: Refines sentence clarity and vocabulary.
- **SEO Excerpt**: Generates 150-char Google meta description and teaser excerpt.
- **Tag Suggester**: Identifies high search-volume keywords.
- **OpenAI Key Input**: Configure your OpenAI API key in the navbar settings modal anytime.

### 3. Real-Time SEO Optimization & Analytics
- **Live 100-Point SEO Meter**: Instant score updates as you type.
- **Audit Checklist**: Evaluates title length (40-65 chars), meta description (120-160 chars), focus keyword density (1.0% - 2.5%), heading hierarchy, and content depth.
- **Google Search Preview**: Live preview of the snippet as it will appear in search results.
- **Analytics Dashboard**: 30-day interactive time-series chart of page views and unique visitors, organic traffic channels, device breakdown, and top-performing articles.

### 4. User Subscriptions & Monetization
- **Reader Tier Simulator**: Switch between **Free Reader**, **Pro Member ($9/mo)**, and **VIP Patron ($29/mo)** from the top navbar to test paywalled articles instantly.
- **Teaser Paywall**: Premium articles show the first 120 words followed by an aesthetic blurred gradient and an instant upgrade action.
- **Buy Me a Coffee (Micro-Tips)**: Direct author tipping ($3, $5, $15, or custom) with celebratory confetti.
- **Creator Revenue Studio**: View Monthly Recurring Revenue (MRR), active member count, and tip transaction history.

### 5. Server-Side Rendering (SSR) for SEO
- Route `GET /ssr/post/:slug` delivers server-rendered HTML for search engine crawlers.
- Injects OpenGraph `og:title`, `og:image`, `og:description`, Twitter Cards, and canonical URLs.
- Injects Schema.org `BlogPosting` JSON-LD structured data for Google Rich Results.
- Dynamic `/sitemap.xml` and `/rss.xml` generated automatically from the database.

---

## 🛠️ Environment Variables (.env)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_blogging
OPENAI_API_KEY=sk-... # Optional (fallback engine active if omitted)
```
