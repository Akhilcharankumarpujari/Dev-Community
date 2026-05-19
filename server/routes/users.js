const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  followUser,
  getAllUsers,
  deleteUser,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getAllUsers);
router.put('/profile', protect, updateUserProfile);
router.post('/follow/:id', protect, followUser);
router.get('/:username', getUserProfile);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
