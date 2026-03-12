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

// @route   GET api/users/employees
// @desc    Get all employees linked to the current active farm
// @access  Private (Owner Only)
router.get('/employees', auth, userController.getEmployees);

// @route   POST api/users/employees
// @desc    Owner creates an employee account and links to current farm
// @access  Private (Owner Only)
router.post('/employees', auth, userController.createEmployee);

module.exports = router;
