const express = require('express');
const router = express.Router();
const { getLocations, addLocation, updateLocation, deleteLocation, getLocationStats } = require('../controllers/locationController');
const auth = require('../middleware/auth');

router.use(auth);

router.route('/')
  .get(getLocations)
  .post(addLocation);

router.route('/:id')
  .put(updateLocation)
  .delete(deleteLocation);

router.get('/:id/stats', getLocationStats);

module.exports = router;
