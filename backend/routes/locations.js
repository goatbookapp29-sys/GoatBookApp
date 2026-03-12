const express = require('express');
const router = express.Router();
const { getLocations, addLocation, updateLocation, deleteLocation, getLocationStats } = require('../controllers/locationController');
const { protect, farmContext } = require('../middleware/authMiddleware');

router.use(protect);
router.use(farmContext);

router.route('/')
  .get(getLocations)
  .post(addLocation);

router.route('/:id')
  .put(updateLocation)
  .delete(deleteLocation);

router.get('/:id/stats', getLocationStats);

module.exports = router;
