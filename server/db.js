import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialPosts } from './data/seedPosts.js';
import PostModel from './models/Post.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'posts.json');

class DatabaseService {
  constructor() {
    this.isMongoConnected = false;
    this.posts = [];
    this.init();
  }

  async init() {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Load file-backed cache or seed
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.posts = JSON.parse(raw);
      } catch (e) {
        console.warn('[DB] Could not parse existing posts.json, resetting to seeds.');
        this.posts = [...initialPosts];
        this.saveToFile();
      }
    } else {
      this.posts = [...initialPosts];
      this.saveToFile();
    }

    // Attempt MongoDB connection
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_blogging';
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500
      });
      this.isMongoConnected = true;
      console.log(`[DB] Connected successfully to MongoDB at ${mongoUri}`);

      // Seed MongoDB if empty
      const count = await PostModel.countDocuments();
      if (count === 0) {
        console.log('[DB] Seeding MongoDB with initial posts...');
        for (const post of this.posts) {
          const { id, _id, ...cleanPost } = post;
          await PostModel.create(cleanPost);
        }
      }
    } catch (err) {
      this.isMongoConnected = false;
      console.log('[DB] Local MongoDB daemon not reachable. Using built-in persistent JSON store.');
      console.log('[DB] Full CRUD, SEO analytics, and AI functions are active and persisted.');
    }
  }

  saveToFile() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.posts, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB] Error writing to data file:', e);
    }
  }

  async getAllPosts({ search, tag, category, status } = {}) {
    if (this.isMongoConnected) {
      try {
        const query = {};
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { excerpt: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
          ];
        }
        if (tag) query.tags = tag;
        if (category && category !== 'All') query.category = category;
        if (status === 'published') query.published = true;

        const docs = await PostModel.find(query).sort({ createdAt: -1 }).lean();
        return docs.map(d => ({ ...d, id: d._id.toString() }));
      } catch (err) {
        console.warn('[DB] Mongo query failed, falling back to local store:', err.message);
      }
    }

    let list = [...this.posts];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        p.content.toLowerCase().includes(q)
      );
    }
    if (tag) {
      list = list.filter(p => p.tags && p.tags.includes(tag));
    }
    if (category && category !== 'All') {
      list = list.filter(p => p.category === category);
    }
    if (status === 'published') {
      list = list.filter(p => p.published !== false);
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getPostBySlug(slug) {
    if (this.isMongoConnected) {
      try {
        const doc = await PostModel.findOneAndUpdate(
          { slug },
          { $inc: { 'stats.views': 1 } },
          { new: true }
        ).lean();
        if (doc) return { ...doc, id: doc._id.toString() };
      } catch (err) {
        console.warn('[DB] Mongo slug fetch failed:', err.message);
      }
    }

    const post = this.posts.find(p => p.slug === slug);
    if (post) {
      post.stats = post.stats || { views: 0, likes: 0, bookmarks: 0 };
      post.stats.views = (post.stats.views || 0) + 1;
      this.saveToFile();
    }
    return post || null;
  }

  async getPostById(id) {
    if (this.isMongoConnected) {
      try {
        const doc = await PostModel.findById(id).lean();
        if (doc) return { ...doc, id: doc._id.toString() };
      } catch (err) {}
    }
    return this.posts.find(p => p.id === id || p._id === id) || null;
  }

  async createPost(data) {
    const slugBase = (data.title || 'untitled-post')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check slug collision
    let slug = slugBase;
    let counter = 1;
    while (this.posts.some(p => p.slug === slug)) {
      slug = `${slugBase}-${counter++}`;
    }

    const newPost = {
      id: `post-${Date.now()}`,
      _id: `post-${Date.now()}`,
      title: data.title || 'Untitled Post',
      slug,
      excerpt: data.excerpt || (data.content ? data.content.slice(0, 160).replace(/[#*`_]/g, '') : ''),
      content: data.content || '',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      category: data.category || 'Artificial Intelligence',
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()) : ['AI', 'Tech']),
      author: data.author || {
        name: 'Alex Mercer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        role: 'Author & AI Content Creator'
      },
      seo: {
        metaTitle: data.seo?.metaTitle || data.title,
        metaDescription: data.seo?.metaDescription || data.excerpt || '',
        focusKeyword: data.seo?.focusKeyword || '',
        canonicalUrl: data.seo?.canonicalUrl || `https://aiblogplatform.io/post/${slug}`,
        seoScore: data.seo?.seoScore || 85
      },
      monetization: {
        isPremium: Boolean(data.monetization?.isPremium),
        tierRequired: data.monetization?.tierRequired || (data.monetization?.isPremium ? 'pro' : 'free'),
        previewWordLimit: data.monetization?.previewWordLimit || 120
      },
      stats: {
        views: 1,
        likes: 0,
        bookmarks: 0,
        avgReadTimeMinutes: Math.max(1, Math.ceil((data.content || '').split(/\s+/).length / 200))
      },
      published: data.published !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.isMongoConnected) {
      try {
        const { id, _id, ...mongoData } = newPost;
        const created = await PostModel.create(mongoData);
        newPost.id = created._id.toString();
        newPost._id = created._id.toString();
      } catch (e) {
        console.warn('[DB] Mongo create error, keeping in local store:', e.message);
      }
    }

    this.posts.unshift(newPost);
    this.saveToFile();
    return newPost;
  }

  async updatePost(id, data) {
    if (this.isMongoConnected) {
      try {
        const updatedDoc = await PostModel.findByIdAndUpdate(id, data, { new: true }).lean();
        if (updatedDoc) return { ...updatedDoc, id: updatedDoc._id.toString() };
      } catch (e) {}
    }

    const index = this.posts.findIndex(p => p.id === id || p._id === id);
    if (index === -1) return null;

    this.posts[index] = {
      ...this.posts[index],
      ...data,
      seo: { ...this.posts[index].seo, ...(data.seo || {}) },
      monetization: { ...this.posts[index].monetization, ...(data.monetization || {}) },
      stats: { ...this.posts[index].stats, ...(data.stats || {}) },
      updatedAt: new Date().toISOString()
    };
    this.saveToFile();
    return this.posts[index];
  }

  async deletePost(id) {
    if (this.isMongoConnected) {
      try {
        await PostModel.findByIdAndDelete(id);
      } catch (e) {}
    }

    const prevLength = this.posts.length;
    this.posts = this.posts.filter(p => p.id !== id && p._id !== id);
    if (this.posts.length !== prevLength) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  async toggleLike(id) {
    const post = await this.getPostById(id);
    if (!post) return null;

    const newLikes = (post.stats?.likes || 0) + 1;
    return this.updatePost(id, { 'stats.likes': newLikes });
  }

  getPlatformStats() {
    const totalPosts = this.posts.length;
    const totalViews = this.posts.reduce((acc, p) => acc + (p.stats?.views || 0), 0);
    const totalLikes = this.posts.reduce((acc, p) => acc + (p.stats?.likes || 0), 0);
    const premiumPosts = this.posts.filter(p => p.monetization?.isPremium).length;

    return {
      totalPosts,
      totalViews,
      totalLikes,
      premiumPosts,
      activeSubscribers: 428,
      monthlyRevenue: 3852,
      avgSeoScore: Math.round(
        this.posts.reduce((acc, p) => acc + (p.seo?.seoScore || 80), 0) / (totalPosts || 1)
      ),
      isMongoConnected: this.isMongoConnected
    };
  }
}

export const db = new DatabaseService();
