const express = require('express');
const router = express.Router();
const {
  getPosts,
  getTrendingPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  likePost,
  bookmarkPost,
  getAISummary,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

router.get('/', getPosts);
router.get('/trending', getTrendingPosts);
router.get('/:slug', getPostBySlug);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/like/:id', protect, likePost);
router.post('/bookmark/:id', protect, bookmarkPost);
router.post('/:id/ai-summary', getAISummary);

module.exports = router;
