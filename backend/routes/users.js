const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, userController.getProfile);

// @route   PUT api/users/profile
// @desc    Update user's profile
// @access  Private
// @route   POST api/users/change-password
// @desc    Change user's password
// @access  Private
router.post('/change-password', auth, userController.changePassword);

module.exports = router;
