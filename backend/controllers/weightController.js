const prisma = require('../config/prisma');
const { v4: uuidv4 } = require('uuid');

// @desc    Get weights for a specific animal or all weights for the farm
exports.getWeights = async (req, res) => {
  try {
    const { animalId, tagNumber } = req.query;
    const where = { farm_id: req.farmId };
    if (animalId) where.animal_id = animalId;
    if (tagNumber) where.tag_number = tagNumber;

    const weights = await prisma.weights.findMany({
      where,
      orderBy: [{ date: 'desc' }, { created_at: 'desc' }]
    });

    res.json(weights.map(w => ({
      id: w.id, animalId: w.animal_id, farmId: w.farm_id,
      weight: w.weight, height: w.height, date: w.date,
      tagNumber: w.tag_number, remark: w.remark,
      createdAt: w.created_at, updatedAt: w.updated_at
    })));
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

    const animal = await prisma.animals.findFirst({
      where: { tag_number: tagNumber, farm_id: req.farmId }
    });
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found with this Tag ID' });
    }

    const now = new Date();
    const weightRecord = await prisma.weights.create({
      data: {
        id: uuidv4(), animal_id: animal.id, farm_id: req.farmId,
        tag_number: tagNumber, weight, height: height || null,
        date: date ? new Date(date) : now, remark,
        created_by_user_id: req.user.id, created_at: now, updated_at: now
      }
    });

    res.status(201).json({
      id: weightRecord.id, animalId: weightRecord.animal_id,
      weight: weightRecord.weight, height: weightRecord.height,
      date: weightRecord.date, tagNumber: weightRecord.tag_number,
      remark: weightRecord.remark, createdAt: weightRecord.created_at
    });
  } catch (err) {
    console.error('ADD WEIGHT ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Update a weight record
exports.updateWeight = async (req, res) => {
  const { weight, height, date, remark } = req.body;
  try {
    const record = await prisma.weights.findFirst({
      where: { id: req.params.id, farm_id: req.farmId }
    });
    if (!record) {
      return res.status(404).json({ message: 'Weight record not found' });
    }

    const updated = await prisma.weights.update({
      where: { id: req.params.id },
      data: { weight, height, date: date ? new Date(date) : record.date, remark, updated_by_user_id: req.user.id, updated_at: new Date() }
    });

    res.json({ id: updated.id, weight: updated.weight, height: updated.height, date: updated.date, remark: updated.remark });
  } catch (err) {
    console.error('UPDATE WEIGHT ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a weight record
exports.deleteWeight = async (req, res) => {
  try {
    const record = await prisma.weights.findFirst({
      where: { id: req.params.id, farm_id: req.farmId }
    });
    if (!record) {
      return res.status(404).json({ message: 'Weight record not found' });
    }
    await prisma.weights.delete({ where: { id: req.params.id } });
    res.json({ message: 'Weight record removed' });
  } catch (err) {
    console.error('DELETE WEIGHT ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
