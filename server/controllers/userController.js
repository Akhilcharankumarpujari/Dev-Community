const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'name username avatar bio')
      .populate('following', 'name username avatar bio');

    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }

    const posts = await Post.find({ author: user._id, published: true })
      .sort({ createdAt: -1 })
      .populate('author', 'name username avatar');

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatarUrl,
        bio: user.bio,
        location: user.location,
        website: user.website,
        work: user.work,
        skills: user.skills,
        socialLinks: user.socialLinks,
        followers: user.followers,
        following: user.following,
        joinedAt: user.joinedAt,
      },
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }

    const fieldsToUpdate = [
      'name',
      'bio',
      'location',
      'website',
      'work',
      'avatar',
      'skills',
      'socialLinks',
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'socialLinks') {
          user.socialLinks = { ...user.socialLinks, ...req.body.socialLinks };
        } else if (field === 'skills') {
          user.skills = Array.isArray(req.body.skills)
            ? req.body.skills
            : req.body.skills.split(',').map(s => s.trim());
        } else {
          user[field] = req.body[field];
        }
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatarUrl,
        bio: user.bio,
        location: user.location,
        website: user.website,
        work: user.work,
        skills: user.skills,
        socialLinks: user.socialLinks,
        followers: user.followers,
        following: user.following,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow / Unfollow user
// @route   POST /api/users/follow/:id
// @access  Private
exports.followUser = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      res.statusCode = 404;
      throw new Error('User to follow not found');
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      res.statusCode = 400;
      throw new Error('You cannot follow yourself');
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userToFollow._id.toString()
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      );
      await currentUser.save();
      await userToFollow.save();

      res.status(200).json({
        success: true,
        message: `Unfollowed ${userToFollow.username}`,
        isFollowing: false,
      });
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
      await currentUser.save();
      await userToFollow.save();

      // Create notification
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: userToFollow._id,
        sender: currentUser._id,
        type: 'follow',
      });

      res.status(200).json({
        success: true,
        message: `Followed ${userToFollow.username}`,
        isFollowing: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin Dashboard)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete User (Admin Dashboard)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }

    // Delete user posts and comments
    await Post.deleteMany({ author: user._id });
    const Comment = require('../models/Comment');
    await Comment.deleteMany({ author: user._id });

    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
