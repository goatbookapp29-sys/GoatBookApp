const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.get('/overall', auth, reportController.getOverallReport);

module.exports = router;
