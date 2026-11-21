import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET all posts
router.get('/', async (req, res) => {
  try {
    const { search, tag, category, status } = req.query;
    const posts = await db.getAllPosts({ search, tag, category, status });
    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET post by slug (handles paywall preview logic)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const userTier = req.query.tier || req.headers['x-user-tier'] || 'free'; // 'free' | 'pro' | 'vip'
    const post = await db.getPostBySlug(slug);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Check paywall
    const isPremium = post.monetization?.isPremium;
    const tierRequired = post.monetization?.tierRequired || 'pro';
    
    const tierRank = { free: 0, pro: 1, vip: 2 };
    const userRank = tierRank[userTier] || 0;
    const requiredRank = tierRank[tierRequired] || 1;

    let postData = { ...post };

    if (isPremium && userRank < requiredRank) {
      // User does not meet tier requirement: generate teaser & paywall lock
      const words = post.content.split(/\s+/);
      const limit = post.monetization?.previewWordLimit || 120;
      const previewWords = words.slice(0, limit).join(' ');

      postData.content = `${previewWords}\n\n...\n\n*(Content truncated for non-subscribers)*`;
      postData.isLocked = true;
      postData.lockedReason = `This article is reserved for ${tierRequired.toUpperCase()} members. Upgrade your subscription to continue reading.`;
      postData.totalWords = words.length;
      postData.remainingWords = Math.max(0, words.length - limit);
    } else {
      postData.isLocked = false;
    }

    res.json({ success: true, data: postData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create post
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const created = await db.createPost(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update post
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updatePost(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE post
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deletePost(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST like post
router.post('/:id/like', async (req, res) => {
  try {
    const updated = await db.toggleLike(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, likes: updated.stats.likes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
