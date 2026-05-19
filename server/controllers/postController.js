const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const slugify = require('slugify');

// Simple mock AI summarizer if no OpenAI API is configured
const generateAISummary = (content) => {
  const cleanText = content.replace(/[#*`>\[\]()-]/g, ' ').replace(/\s+/g, ' ').trim();
  const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  return sentences.slice(0, 3).join('. ') + '.';
};

// @desc    Get all posts (with search, pagination, tag filtering)
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const { tag, author, search, page = 1, limit = 10, type } = req.query;
    const query = { published: true };

    if (tag) {
      query.tags = tag.toLowerCase();
    }

    if (author) {
      query.author = author;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const skip = (options.page - 1) * options.limit;

    let sortOption = { publishedAt: -1 };
    if (type === 'latest') {
      sortOption = { publishedAt: -1 };
    } else if (type === 'top') {
      sortOption = { views: -1, likesCount: -1 };
    }

    const posts = await Post.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(options.limit)
      .populate('author', 'name username avatar bio');

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending posts
// @route   GET /api/posts/trending
// @access  Public
exports.getTrendingPosts = async (req, res, next) => {
  try {
    // Trending = posts with high view count or likes created recently (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const posts = await Post.find({
      published: true,
      publishedAt: { $gte: thirtyDaysAgo },
    })
      .sort({ views: -1, 'likes.length': -1 })
      .limit(5)
      .populate('author', 'name username avatar');

    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
// @access  Public
exports.getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'name username avatar bio followers location website work skills socialLinks')
      .populate({
        path: 'likes',
        select: 'name username avatar',
      });

    if (!post) {
      res.statusCode = 404;
      throw new Error('Post not found');
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.status(200).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, coverImage, tags, category, published } = req.body;

    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Check unique slug
    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const parsedTags = Array.isArray(tags)
      ? tags.map(t => t.trim().toLowerCase())
      : tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [];

    const post = await Post.create({
      title,
      content,
      coverImage,
      tags: parsedTags,
      category: category || 'general',
      published: published !== undefined ? published : false,
      author: req.user.id,
      slug,
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      res.statusCode = 404;
      throw new Error('Post not found');
    }

    // Check post author / admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      res.statusCode = 403;
      throw new Error('Not authorized to update this post');
    }

    const { title, content, coverImage, tags, category, published } = req.body;

    if (title && title !== post.title) {
      let baseSlug = slugify(title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      while (await Post.findOne({ slug, _id: { $ne: post._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      post.slug = slug;
      post.title = title;
    }

    if (content) post.content = content;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (category) post.category = category;
    if (published !== undefined) post.published = published;

    if (tags) {
      post.tags = Array.isArray(tags)
        ? tags.map(t => t.trim().toLowerCase())
        : tags.split(',').map(t => t.trim().toLowerCase());
    }

    await post.save();

    res.status(200).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.statusCode = 404;
      throw new Error('Post not found');
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      res.statusCode = 403;
      throw new Error('Not authorized to delete this post');
    }

    await post.deleteOne();

    // Clean up notifications & comments for this post
    const Comment = require('../models/Comment');
    await Comment.deleteMany({ post: post._id });
    await Notification.deleteMany({ post: post._id });

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / Heart reaction on a post
// @route   POST /api/posts/like/:id
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.statusCode = 404;
      throw new Error('Post not found');
    }

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id.toString());
      await post.save();

      res.status(200).json({ success: true, message: 'Post unliked', likes: post.likes });
    } else {
      post.likes.push(req.user.id);
      await post.save();

      // Notify post author if not liking own post
      if (post.author.toString() !== req.user.id.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: req.user.id,
          type: 'like',
          post: post._id,
        });
      }

      res.status(200).json({ success: true, message: 'Post liked', likes: post.likes });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark / Save post
// @route   POST /api/posts/bookmark/:id
// @access  Private
exports.bookmarkPost = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.id;

    const isBookmarked = user.savedPosts.includes(postId);

    if (isBookmarked) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
      await user.save();
      res.status(200).json({ success: true, message: 'Bookmark removed', savedPosts: user.savedPosts });
    } else {
      user.savedPosts.push(postId);
      await user.save();
      res.status(200).json({ success: true, message: 'Bookmark added', savedPosts: user.savedPosts });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    AI generate summary of post
// @route   POST /api/posts/:id/ai-summary
// @access  Public
exports.getAISummary = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.statusCode = 404;
      throw new Error('Post not found');
    }

    const summary = generateAISummary(post.content);
    res.status(200).json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};
