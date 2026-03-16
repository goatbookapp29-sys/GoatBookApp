const express = require('express');
const router = express.Router();
const { getFarmDetails, updateFarmDetails } = require('../controllers/farmController');
const { protect } = require('../middleware/auth');

router.get('/current', protect, getFarmDetails);
router.put('/current', protect, updateFarmDetails);

module.exports = router;
