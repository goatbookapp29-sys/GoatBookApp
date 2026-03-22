const express = require('express');
const router = express.Router();
const vaccineController = require('../controllers/vaccineController');
const auth = require('../middleware/auth');

// --- Vaccine Definitions ---
router.get('/', auth, vaccineController.getVaccines);
router.post('/', auth, vaccineController.createVaccine);

// --- Vaccination Records ---
router.get('/records', auth, vaccineController.getVaccinationRecords);
router.post('/records', auth, vaccineController.createVaccinationRecord);

module.exports = router;
