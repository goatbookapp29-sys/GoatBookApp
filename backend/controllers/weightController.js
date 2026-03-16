const { Weight, Animal } = require('../models');

// @desc    Get weights for a specific animal or all weights for the farm
exports.getWeights = async (req, res) => {
  try {
    const { animalId, tagNumber } = req.query;
    const whereClause = { farmId: req.farmId };

    if (animalId) whereClause.animalId = animalId;
    if (tagNumber) whereClause.tagNumber = tagNumber;

    const weights = await Weight.findAll({
      where: whereClause,
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(weights);
  } catch (err) {
    console.error('FETCH WEIGHTS ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Add a new weight record
exports.addWeight = async (req, res) => {
  const { tagNumber, weight, height, date, remark } = req.body;
  
  try {
    if (!tagNumber || !weight) {
      return res.status(400).json({ message: 'Tag ID and Weight are required' });
    }

    // Find animal by tagNumber and farmId
    const animal = await Animal.findOne({
      where: { tagNumber, farmId: req.farmId }
    });

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found with this Tag ID' });
    }

    const weightRecord = await Weight.create({
      animalId: animal.id,
      farmId: req.farmId,
      tagNumber,
      weight,
      height,
      date: date || new Date(),
      remark,
      createdByUserId: req.user.id
    });

    res.status(201).json(weightRecord);
  } catch (err) {
    console.error('ADD WEIGHT ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Update a weight record
exports.updateWeight = async (req, res) => {
  const { weight, height, date, remark } = req.body;
  try {
    const record = await Weight.findOne({
      where: { id: req.params.id, farmId: req.farmId }
    });

    if (!record) {
      return res.status(404).json({ message: 'Weight record not found' });
    }

    await record.update({
      weight,
      height,
      date,
      remark,
      updatedByUserId: req.user.id
    });

    res.json(record);
  } catch (err) {
    console.error('UPDATE WEIGHT ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a weight record
exports.deleteWeight = async (req, res) => {
  try {
    const record = await Weight.findOne({
      where: { id: req.params.id, farmId: req.farmId }
    });

    if (!record) {
      return res.status(404).json({ message: 'Weight record not found' });
    }

    await record.destroy();
    res.json({ message: 'Weight record removed' });
  } catch (err) {
    console.error('DELETE WEIGHT ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
