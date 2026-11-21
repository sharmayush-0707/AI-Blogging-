import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    excerpt: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      required: true // Markdown string
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    },
    category: {
      type: String,
      default: 'Artificial Intelligence',
      enum: ['Artificial Intelligence', 'Web Development', 'Design Systems', 'Cloud & DevOps', 'Monetization']
    },
    tags: [{
      type: String,
      trim: true
    }],
    author: {
      name: { type: String, default: 'Alex Mercer' },
      avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
      role: { type: String, default: 'Senior AI Engineer & Tech Writer' }
    },
    // SEO Optimization
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      focusKeyword: { type: String, default: '' },
      canonicalUrl: { type: String, default: '' },
      seoScore: { type: Number, default: 85 }
    },
    // User Subscription and Monetization Options
    monetization: {
      isPremium: { type: Boolean, default: false },
      tierRequired: { type: String, default: 'free', enum: ['free', 'pro', 'vip'] },
      previewWordLimit: { type: Number, default: 120 }
    },
    // Performance & Analytics
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 },
      avgReadTimeMinutes: { type: Number, default: 5 }
    },
    published: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Fallback model or active mongoose model
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

export default Post;
