const express = require('express');
const router = express.Router();
const { addComment, getComments, deleteComment, likeComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.post('/:postId', protect, addComment);
router.get('/:postId', getComments);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);

module.exports = router;
