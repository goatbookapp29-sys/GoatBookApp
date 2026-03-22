const { Vaccine, VaccinationRecord, Animal, User } = require('../models');
const { Op } = require('sequelize');

// --- Vaccine Definitions ---

// @desc    Get all vaccines for the farm
// @route   GET /api/vaccines
exports.getVaccines = async (req, res) => {
  try {
    if (!req.farmId) return res.status(400).json({ message: 'No farm selected' });

    const vaccines = await Vaccine.findAll({
      where: { farmId: req.farmId },
      include: [
        { model: User, as: 'creator', attributes: ['name'] }
      ],
      order: [['name', 'ASC']]
    });

    res.json(vaccines);
  } catch (err) {
    console.error('GET VACCINES ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new vaccine definition
// @route   POST /api/vaccines
exports.createVaccine = async (req, res) => {
  const { name, daysBetween, remark } = req.body;
  try {
    if (!req.farmId) return res.status(400).json({ message: 'No farm selected' });
    if (!name) return res.status(400).json({ message: 'Vaccine name is required' });

    const vaccine = await Vaccine.create({
      name,
      daysBetween: daysBetween || 0,
      remark,
      farmId: req.farmId,
      createdByUserId: req.user.id
    });

    res.status(201).json(vaccine);
  } catch (err) {
    console.error('CREATE VACCINE ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Vaccination Records ---

// @desc    Get vaccination records (all for farm or specific animal)
// @route   GET /api/vaccines/records
exports.getVaccinationRecords = async (req, res) => {
  const { animalId } = req.query;
  try {
    if (!req.farmId) return res.status(400).json({ message: 'No farm selected' });

    const where = { farmId: req.farmId };
    if (animalId) where.animalId = animalId;

    const records = await VaccinationRecord.findAll({
      where,
      include: [
        { model: Vaccine, as: 'vaccine', attributes: ['name', 'daysBetween'] },
        { model: Animal, as: 'animal', attributes: ['tagNumber'] },
        { model: User, as: 'creator', attributes: ['name'] }
      ],
      order: [['date', 'DESC']]
    });

    res.json(records);
  } catch (err) {
    console.error('GET RECORDS ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create vaccination records (Single or Mass)
// @route   POST /api/vaccines/records
exports.createVaccinationRecord = async (req, res) => {
  const { vaccineId, animalIds, date, validTill, remark, creationMode } = req.body;
  
  try {
    if (!req.farmId) return res.status(400).json({ message: 'No farm selected' });
    if (!vaccineId || !animalIds || !Array.isArray(animalIds) || animalIds.length === 0 || !date) {
      return res.status(400).json({ message: 'Missing required fields (vaccineId, animalIds, date)' });
    }

    const vaccine = await Vaccine.findByPk(vaccineId);
    if (!vaccine) return res.status(404).json({ message: 'Vaccine not found' });

    // Calculate next due date if daysBetween > 0
    let nextDueDate = null;
    if (vaccine.daysBetween > 0) {
      const baseDate = new Date(date);
      baseDate.setDate(baseDate.getDate() + vaccine.daysBetween);
      nextDueDate = baseDate.toISOString().split('T')[0];
    }

    const recordsData = animalIds.map(animalId => ({
      vaccineId,
      animalId,
      date,
      validTill,
      nextDueDate,
      remark,
      creationMode: creationMode || (animalIds.length > 1 ? 'MASS' : 'SINGLE'),
      farmId: req.farmId,
      createdByUserId: req.user.id
    }));

    const records = await VaccinationRecord.bulkCreate(recordsData);

    res.status(201).json({ 
      message: `Successfully recorded ${records.length} vaccination(s)`,
      records 
    });

  } catch (err) {
    console.error('CREATE RECORD ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
