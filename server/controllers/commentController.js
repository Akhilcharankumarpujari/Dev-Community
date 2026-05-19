const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// AI Toxic Comment Moderation Mock
const checkToxicity = (text) => {
  const toxicKeywords = ['abuse', 'spam', 'hate', 'trash', 'kill yourself', 'idiot', 'stupid', 'fucking', 'bastard', 'asshole'];
  const lowercaseText = text.toLowerCase();
  
  for (const keyword of toxicKeywords) {
    if (lowercaseText.includes(keyword)) {
      return {
        isToxic: true,
        reason: `Comment contains potentially abusive or toxic word: "${keyword}"`,
      };
    }
  }
  return { isToxic: false };
};

// @desc    Add comment to post
// @route   POST /api/comments/:postId
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { content, parentCommentId } = req.body;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      res.statusCode = 404;
      throw new Error('Post not found');
    }

    // AI Toxic Moderation check
    const toxicityCheck = checkToxicity(content);
    if (toxicityCheck.isToxic) {
      res.statusCode = 400;
      throw new Error(`Moderation Warning: ${toxicityCheck.reason}. Please maintain a friendly developer ecosystem.`);
    }

    const comment = await Comment.create({
      content,
      author: req.user.id,
      post: postId,
      parentComment: parentCommentId || null,
    });

    // Increment commentsCount on Post
    post.commentsCount += 1;
    await post.save();

    // Populate author
    const populatedComment = await Comment.findById(comment._id).populate('author', 'name username avatar bio');

    // Create Notification
    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (parent && parent.author.toString() !== req.user.id.toString()) {
        await Notification.create({
          recipient: parent.author,
          sender: req.user.id,
          type: 'reply',
          post: postId,
          comment: comment._id,
        });
      }
    } else {
      if (post.author.toString() !== req.user.id.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: req.user.id,
          type: 'comment',
          post: postId,
          comment: comment._id,
        });
      }
    }

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
// @access  Public
exports.getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Retrieve comments populated with author
    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate('author', 'name username avatar bio');

    res.status(200).json({ success: true, comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.statusCode = 404;
      throw new Error('Comment not found');
    }

    // Check ownership / admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      res.statusCode = 403;
      throw new Error('Not authorized to delete this comment');
    }

    const post = await Post.findById(comment.post);

    // Soft delete if it has replies, otherwise hard delete
    const hasReplies = await Comment.exists({ parentComment: comment._id });

    if (hasReplies) {
      comment.content = '[This comment has been deleted]';
      comment.isDeleted = true;
      await comment.save();
    } else {
      await comment.deleteOne();
    }

    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }

    // Clean up notifications for this comment
    await Notification.deleteMany({ comment: req.params.id });

    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like a comment
// @route   POST /api/comments/:id/like
// @access  Private
exports.likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.statusCode = 404;
      throw new Error('Comment not found');
    }

    const isLiked = comment.likes.includes(req.user.id);
    if (isLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== req.user.id.toString());
    } else {
      comment.likes.push(req.user.id);
    }

    await comment.save();
    res.status(200).json({ success: true, likes: comment.likes });
  } catch (error) {
    next(error);
  }
};
